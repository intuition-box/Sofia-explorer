import { useMemo, useState } from 'react'
import { formatEther } from 'viem'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ThumbsUp, ThumbsDown, ChevronRight, ChevronLeft } from 'lucide-react'
import SofiaLoader from '../components/ui/SofiaLoader'
import { useDebateClaims } from '../hooks/useDebateClaims'
import { CLAIM_CATEGORIES, type ClaimCategory } from '../config/debateConfig'
import PageHeader from '../components/PageHeader'
import { PAGE_COLORS } from '../config/pageColors'
import '@/components/styles/pages.css'

function formatMarketCap(value: bigint): string {
  const num = parseFloat(formatEther(value))
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k T'
  if (num >= 1) return num.toFixed(2) + ' T'
  if (num >= 0.001) return num.toFixed(4) + ' T'
  return '0 T'
}

export default function VotePage() {
  const { claims, loading, error } = useDebateClaims()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [votes, setVotes] = useState<Record<string, 'support' | 'oppose'>>({})
  const [activeTab, setActiveTab] = useState<ClaimCategory | 'all'>('all')
  const pc = PAGE_COLORS['/vote']

  const filtered = useMemo(() => {
    if (activeTab === 'all') return claims
    return claims.filter((c) => c.category === activeTab)
  }, [claims, activeTab])

  // Reset carousel index when tab changes
  const handleTabChange = (tab: ClaimCategory | 'all') => {
    setActiveTab(tab)
    setCurrentIndex(0)
  }

  if (loading) {
    return (
      <div>
        <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />
        <div className="flex items-center justify-center page-loader-sm">
          <SofiaLoader size={96} />
        </div>
      </div>
    )
  }

  if (error || claims.length === 0) {
    return (
      <div>
        <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />
        <div className="page-content page-enter">
          <p className="text-sm text-muted-foreground">
            {error || 'No claims available.'}
          </p>
        </div>
      </div>
    )
  }

  const claim = filtered[currentIndex]
  const totalPositions = claim ? claim.supportCount + claim.opposeCount : 0
  const totalMarketCap = claim ? claim.supportMarketCap + claim.opposeMarketCap : 0n
  const supportPercent =
    claim && totalMarketCap > 0n
      ? Math.round(Number((claim.supportMarketCap * 100n) / totalMarketCap))
      : 50
  const userVote = claim ? votes[claim.id] : undefined
  const title = claim ? `${claim.subject} ${claim.predicate} ${claim.object}` : ''
  const categoryInfo = claim?.category ? CLAIM_CATEGORIES.find((c) => c.id === claim.category) : undefined

  const handleVote = (type: 'support' | 'oppose') => {
    if (!claim) return
    setVotes((prev) => ({ ...prev, [claim.id]: type }))
  }

  const next = () => setCurrentIndex((i) => Math.min(i + 1, filtered.length - 1))
  const prev = () => setCurrentIndex((i) => Math.max(i - 1, 0))

  return (
    <div>
      <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />
      <div className="space-y-6 page-content page-enter">

      {/* Category tabs */}
      <div className="vp-tabs">
        <button
          className={`vp-tab ${activeTab === 'all' ? 'vp-tab--active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          All
          <span className="vp-tab-count">{claims.length}</span>
        </button>
        {CLAIM_CATEGORIES.map((cat) => {
          const count = claims.filter((c) => c.category === cat.id).length
          if (count === 0) return null
          return (
            <button
              key={cat.id}
              className={`vp-tab ${activeTab === cat.id ? 'vp-tab--active' : ''}`}
              style={activeTab === cat.id ? { borderColor: cat.color, color: cat.color } : undefined}
              onClick={() => handleTabChange(cat.id)}
            >
              {cat.label}
              <span className="vp-tab-count">{count}</span>
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center">No claims in this category.</p>
      ) : (
        <>
          {/* Card navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prev} disabled={currentIndex === 0}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {filtered.length}
            </span>
            <Button variant="ghost" size="icon" onClick={next} disabled={currentIndex === filtered.length - 1}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Claim card */}
          {claim && (
            <Card className="vp-claim-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{totalPositions} positions</Badge>
                  {categoryInfo && (
                    <span
                      className="vp-category-badge"
                      style={{ color: categoryInfo.color, borderColor: `${categoryInfo.color}40`, backgroundColor: `${categoryInfo.color}12` }}
                    >
                      {categoryInfo.label}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{formatMarketCap(totalMarketCap)}</span>
              </div>

              <h2 className="text-lg font-bold">{title}</h2>

              {/* Vote bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-green-500">Support {supportPercent}%</span>
                  <span className="text-red-500">Oppose {100 - supportPercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                  <div className="transition-all" style={{ width: `${supportPercent}%`, backgroundColor: '#22C55E' }} />
                  <div style={{ backgroundColor: '#EF4444', flex: 1 }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatMarketCap(claim.supportMarketCap)} · {claim.supportCount}</span>
                  <span>{claim.opposeCount} · {formatMarketCap(claim.opposeMarketCap)}</span>
                </div>
              </div>

              {/* Vote buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1"
                  variant="outline"
                  style={userVote === 'support' ? { borderColor: '#22C55E', color: '#22C55E', background: 'rgba(34,197,94,0.1)' } : undefined}
                  onClick={() => handleVote('support')}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Support
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  style={userVote === 'oppose' ? { borderColor: '#EF4444', color: '#EF4444', background: 'rgba(239,68,68,0.1)' } : undefined}
                  onClick={() => handleVote('oppose')}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Oppose
                </Button>
              </div>

              {userVote && (
                <p className="text-xs text-center text-muted-foreground">
                  You voted to {userVote} this claim.
                </p>
              )}
            </Card>
          )}
        </>
      )}

      {/* All claims list */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">All Claims ({filtered.length})</h3>
        {filtered.map((c, i) => {
          const cTotal = c.supportMarketCap + c.opposeMarketCap
          const pct = cTotal > 0n
            ? Math.round(Number((c.supportMarketCap * 100n) / cTotal))
            : 50
          const voted = votes[c.id]
          const catInfo = c.category ? CLAIM_CATEGORIES.find((cat) => cat.id === c.category) : undefined
          return (
            <Card
              key={c.id}
              className={`cursor-pointer hover:shadow-sm transition-shadow vp-claim-list-card ${i === currentIndex ? 'ring-1 ring-primary' : ''}`}
              onClick={() => setCurrentIndex(i)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {c.subject} {c.predicate} {c.object}
                    </p>
                    {catInfo && (
                      <span
                        className="vp-category-badge"
                        style={{ color: catInfo.color, borderColor: `${catInfo.color}40`, backgroundColor: `${catInfo.color}12` }}
                      >
                        {catInfo.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {c.supportCount + c.opposeCount} positions · {formatMarketCap(cTotal)}
                    </span>
                    {voted && (
                      <Badge variant="outline" className="text-[10px]">
                        {voted === 'support' ? '👍' : '👎'} Voted
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right ml-3">
                  <span className="text-sm font-bold text-green-500">{pct}%</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
      </div>
    </div>
  )
}
