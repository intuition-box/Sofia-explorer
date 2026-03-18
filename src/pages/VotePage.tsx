import { useState } from 'react'
import { formatEther } from 'viem'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ThumbsUp, ThumbsDown, ChevronRight, ChevronLeft } from 'lucide-react'
import SofiaLoader from '../components/ui/SofiaLoader'
import { useDebateClaims } from '../hooks/useDebateClaims'
import PageHeader from '../components/PageHeader'
import { PAGE_COLORS } from '../config/pageColors'

function formatMarketCap(value: bigint): string {
  const num = parseFloat(formatEther(value))
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k ETH'
  if (num >= 1) return num.toFixed(2) + ' ETH'
  if (num >= 0.001) return num.toFixed(4) + ' ETH'
  return '0 ETH'
}

export default function VotePage() {
  const { claims, loading, error } = useDebateClaims()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [votes, setVotes] = useState<Record<string, 'support' | 'oppose'>>({})
  const pc = PAGE_COLORS['/vote']

  if (loading) {
    return (
      <div>
        <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />
        <div className="flex items-center justify-center" style={{ minHeight: 300 }}>
          <SofiaLoader size={96} />
        </div>
      </div>
    )
  }

  if (error || claims.length === 0) {
    return (
      <div>
        <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />
        <div style={{ padding: '16px 8px' }}>
          <p className="text-sm text-muted-foreground">
            {error || 'No claims available.'}
          </p>
        </div>
      </div>
    )
  }

  const claim = claims[currentIndex]
  const totalPositions = claim.supportCount + claim.opposeCount
  const totalMarketCap = claim.supportMarketCap + claim.opposeMarketCap
  const supportPercent =
    totalMarketCap > 0n
      ? Math.round(Number((claim.supportMarketCap * 100n) / totalMarketCap))
      : 50
  const userVote = votes[claim.id]
  const title = `${claim.subject} ${claim.predicate} ${claim.object}`

  const handleVote = (type: 'support' | 'oppose') => {
    setVotes((prev) => ({ ...prev, [claim.id]: type }))
  }

  const next = () => setCurrentIndex((i) => Math.min(i + 1, claims.length - 1))
  const prev = () => setCurrentIndex((i) => Math.max(i - 1, 0))

  return (
    <div>
      <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />
      <div className="space-y-6" style={{ padding: '16px 8px' }}>

      {/* Card navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prev} disabled={currentIndex === 0}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {claims.length}
        </span>
        <Button variant="ghost" size="icon" onClick={next} disabled={currentIndex === claims.length - 1}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Claim card */}
      <Card className="p-6" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{totalPositions} positions</Badge>
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
            <div className="bg-green-500 transition-all" style={{ width: `${supportPercent}%` }} />
            <div className="bg-red-500 flex-1" />
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
            variant={userVote === 'support' ? 'default' : 'outline'}
            onClick={() => handleVote('support')}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Support
          </Button>
          <Button
            className="flex-1"
            variant={userVote === 'oppose' ? 'destructive' : 'outline'}
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

      {/* All claims list */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">All Claims ({claims.length})</h3>
        {claims.map((c, i) => {
          const cTotal = c.supportMarketCap + c.opposeMarketCap
          const pct = cTotal > 0n
            ? Math.round(Number((c.supportMarketCap * 100n) / cTotal))
            : 50
          const voted = votes[c.id]
          return (
            <Card
              key={c.id}
              className={`p-4 cursor-pointer hover:shadow-sm transition-shadow ${i === currentIndex ? 'ring-1 ring-primary' : ''}`}
              style={{ padding: 16 }}
              onClick={() => setCurrentIndex(i)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {c.subject} {c.predicate} {c.object}
                  </p>
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
