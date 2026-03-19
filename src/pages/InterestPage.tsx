import { useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { formatEther } from 'viem'
import { DOMAIN_BY_ID } from '@/config/taxonomy'
import { getPlatformsByDomain } from '@/config/platformCatalog'
import { useDomainSelection } from '@/hooks/useDomainSelection'
import { usePlatformConnections } from '@/hooks/usePlatformConnections'
import { useReputationScores } from '@/hooks/useReputationScores'
import { useDomainTrending } from '@/hooks/useDomainTrending'
import { useDomainClaims } from '@/hooks/useDomainClaims'
import { useCart } from '@/hooks/useCart'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ThumbsUp, ThumbsDown, Plus } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import NicheDetailList from '@/components/profile/NicheDetailList'
import TrendingCard from '@/components/TrendingCard'
import SofiaLoader from '@/components/ui/SofiaLoader'
import '@/components/styles/interest-page.css'

function formatMarketCap(value: bigint): string {
  const num = parseFloat(formatEther(value))
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k T'
  if (num >= 1) return num.toFixed(2) + ' T'
  if (num >= 0.001) return num.toFixed(4) + ' T'
  return '0 ETH'
}

export default function InterestPage() {
  const { domainId } = useParams<{ domainId: string }>()
  const navigate = useNavigate()
  const { authenticated, user } = usePrivy()
  const walletAddress = user?.wallet?.address
  const domain = domainId ? DOMAIN_BY_ID.get(domainId) : undefined

  const { selectedDomains, selectedNiches, toggleNiche } = useDomainSelection()
  const { getStatus } = usePlatformConnections()
  const scores = useReputationScores(getStatus, selectedDomains, selectedNiches)
  const domainScore = scores?.domains.find((d) => d.domainId === domainId)

  const { items: trending, loading: trendingLoading } = useDomainTrending(domainId)
  const { claims, loading: claimsLoading } = useDomainClaims(domainId)
  const cart = useCart()

  const platforms = domainId ? getPlatformsByDomain(domainId) : []
  const connectedPlatforms = platforms.filter((p) => getStatus(p.id) === 'connected')

  const nicheCount = domain
    ? domain.categories.flatMap((c) => c.niches).filter((n) => selectedNiches.includes(n.id)).length
    : 0

  /** Add Value on a claim — add to cart as support */
  const handleAddValue = useCallback((termId: string, title: string) => {
    if (!authenticated || !walletAddress) return
    cart.addItem({
      id: `${termId}-support`,
      side: 'support',
      termId,
      intention: 'Valued',
      title,
      favicon: '',
      intentionColor: '#F97316',
    })
  }, [authenticated, cart])


  if (!domain) {
    return (
      <div className="page-content page-enter">
        <p className="text-sm text-muted-foreground">Domain not found.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/profile')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
        </Button>
      </div>
    )
  }

  const color = domain.color
  const glow = `${color}66`

  return (
    <div>
      <PageHeader color={color} glow={glow} title={domain.label} subtitle="Interest overview" />
      <div className="ip-sections page-content page-enter">

        {/* Back */}
        <Button variant="ghost" size="sm" className="ip-back" onClick={() => navigate('/profile')}>
          <ArrowLeft className="h-4 w-4" /> Back to Profile
        </Button>

        {/* Stats */}
        <section className="ip-section">
          <h3 className="ip-section-title">Stats</h3>
          <div className="ip-stats-grid">
            <Card className="ip-stat-card">
              <span className="ip-stat-value" style={{ color }}>{domainScore?.score ?? 0}</span>
              <span className="ip-stat-label">Score</span>
            </Card>
            <Card className="ip-stat-card">
              <span className="ip-stat-value">{nicheCount}</span>
              <span className="ip-stat-label">Niches</span>
            </Card>
            <Card className="ip-stat-card">
              <span className="ip-stat-value">{connectedPlatforms.length}</span>
              <span className="ip-stat-label">Platforms</span>
            </Card>
            <Card className="ip-stat-card">
              <span className="ip-stat-value">{platforms.length}</span>
              <span className="ip-stat-label">Available</span>
            </Card>
          </div>
        </section>

        {/* Niches */}
        <section className="ip-section">
          <h3 className="ip-section-title">Niches ({nicheCount})</h3>
          <NicheDetailList
            domainId={domainId!}
            domainColor={color}
            selectedNiches={selectedNiches}
            nicheScores={domainScore?.topNiches ?? []}
            onToggleNiche={toggleNiche}
          />
        </section>

        {/* Trending Platforms */}
        <section className="ip-section">
          <h3 className="ip-section-title">Trending in {domain.label}</h3>
          {trendingLoading ? (
            <div className="ip-loader"><SofiaLoader size={48} /></div>
          ) : trending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trending platforms for this domain yet.</p>
          ) : (
            <div className="ip-trending-grid">
              {trending.map((platform) => (
                <TrendingCard
                  key={platform.platformDomain}
                  platform={platform}
                  domainLabel={domain.label}
                />
              ))}
            </div>
          )}
        </section>

        {/* Platforms */}
        <section className="ip-section">
          <h3 className="ip-section-title">Platforms ({connectedPlatforms.length}/{platforms.length})</h3>
          <div className="ip-platforms-grid">
            {/* Add platform card */}
            <Card className="ip-platform-add" onClick={() => navigate(`/profile/interest/${domainId}/platforms`)}>
              <Plus className="ip-platform-add-icon" />
              <span className="ip-platform-add-label">Connect</span>
            </Card>
            {[...platforms].sort((a, b) => {
              const ac = getStatus(a.id) === 'connected' ? 0 : 1
              const bc = getStatus(b.id) === 'connected' ? 0 : 1
              return ac - bc
            }).slice(0, 11).map((p) => {
              const connected = getStatus(p.id) === 'connected'
              return (
                <Card key={p.id} className={`ip-platform-card ${connected ? 'ip-platform-connected' : ''}`}>
                  <div className="ip-platform-header">
                    <img
                      src={`/favicons/${p.id}.png`}
                      alt=""
                      className="ip-platform-icon"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <span className="ip-platform-name">{p.name}</span>
                  </div>
                  <span className={`ip-platform-status ${connected ? 'ip-platform-on' : ''}`}>
                    {connected ? 'Connected' : 'Not connected'}
                  </span>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Claims / Vote */}
        <section className="ip-section">
          <h3 className="ip-section-title">Claims</h3>
          {claimsLoading ? (
            <div className="ip-loader"><SofiaLoader size={48} /></div>
          ) : claims.length === 0 ? (
            <p className="text-sm text-muted-foreground">No claims for this domain yet.</p>
          ) : (
            <div className="ip-claims-list">
              {claims.map((c) => {
                const totalMcap = c.supportMarketCap + c.opposeMarketCap
                const pct = totalMcap > 0n
                  ? Math.round(Number((c.supportMarketCap * 100n) / totalMcap))
                  : 50
                const title = `${c.subject} ${c.predicate} ${c.object}`
                return (
                  <Card key={c.id} className="ip-claim-card">
                    <p className="ip-claim-title">{title}</p>
                    <div className="ip-claim-bar">
                      <div className="ip-claim-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="ip-claim-meta">
                      <span className="ip-claim-stat">
                        <ThumbsUp className="h-3 w-3" /> {pct}% · {formatMarketCap(c.supportMarketCap)}
                      </span>
                      <span className="ip-claim-stat">
                        <ThumbsDown className="h-3 w-3" /> {100 - pct}% · {formatMarketCap(c.opposeMarketCap)}
                      </span>
                    </div>
                    <div className="ip-claim-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        className="ac-btn"
                        onClick={() => handleAddValue(c.termId, title)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Value
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
