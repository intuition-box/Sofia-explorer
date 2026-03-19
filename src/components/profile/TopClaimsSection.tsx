import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Share2, Users, TrendingUp, TrendingDown } from 'lucide-react'
import type { TopClaim } from '@/hooks/useTopClaims'
import { INTENTION_COLORS, intentionBadgeStyle } from '@/config/intentions'
import { formatEth } from '@/services/vaultTooltipService'
import IntentionTooltip from '../IntentionTooltip'
import PositionBoardDialog from './PositionBoardDialog'
import { TopClaimSkeleton } from './ProfileSkeletons'
import { useCallback, useState } from 'react'

interface TopClaimsSectionProps {
  claims: TopClaim[]
  loading: boolean
  walletAddress?: string
}

function TopClaimCard({ claim, walletAddress }: { claim: TopClaim; walletAddress?: string }) {
  const color = INTENTION_COLORS[claim.intention] ?? '#888'
  const totalMcap = formatEth(String(claim.totalMarketCap))
  const posCount = claim.stats.supportCount + claim.stats.opposeCount
  const [boardOpen, setBoardOpen] = useState(false)
  const counterTermId = claim.item.intentionVaults[claim.intention]?.counterTermId

  const handleShare = useCallback(() => {
    const text = `${claim.item.title} — ${claim.intention}`
    const url = claim.item.url || ''
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(tweetUrl, '_blank', 'noopener,noreferrer')
  }, [claim])

  return (
    <>
      <Card className="tc-card" style={{ cursor: 'pointer' }} onClick={() => setBoardOpen(true)}>
        <div className="tc-header">
          <img
            src={claim.item.favicon}
            alt=""
            className="tc-favicon"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <span className="tc-title">{claim.item.title}</span>
        </div>

        <div className="tc-stats-row">
          <div className="tc-stat-block">
            <span className="tc-stat-value">{totalMcap} T</span>
          </div>
          <div className="tc-stat-block">
            <Users className="h-3 w-3" />
            <span className="tc-stat-value">{posCount}</span>
          </div>
          {claim.stats.userPnlPct !== null && (
            <div className={`tc-pnl ${claim.stats.userPnlPct >= 0 ? 'tc-pnl--up' : 'tc-pnl--down'}`}>
              {claim.stats.userPnlPct >= 0
                ? <TrendingUp className="h-3 w-3" />
                : <TrendingDown className="h-3 w-3" />}
              <span className="tc-pnl-value">
                {claim.stats.userPnlPct >= 0 ? '+' : ''}{claim.stats.userPnlPct}%
              </span>
            </div>
          )}
        </div>

        <div className="tc-actions">
          <IntentionTooltip termId={claim.termId} color={color}>
            <span className="tc-badge" style={intentionBadgeStyle(color)}>
              {claim.intention}
            </span>
          </IntentionTooltip>
          <Button
            variant="ghost"
            size="sm"
            className="ac-btn-icon"
            onClick={(e) => { e.stopPropagation(); handleShare() }}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>

      {/* Dialog — data prefetched on mount */}
      <PositionBoardDialog
        open={boardOpen}
        onOpenChange={setBoardOpen}
        termId={claim.termId}
        counterTermId={counterTermId}
        title={claim.item.title}
        favicon={claim.item.favicon}
        intention={claim.intention}
        intentionColor={color}
        walletAddress={walletAddress}
      />
    </>
  )
}

export default function TopClaimsSection({ claims, loading, walletAddress }: TopClaimsSectionProps) {
  if (loading) {
    return (
      <div className="tc-grid">
        {Array.from({ length: 4 }).map((_, i) => <TopClaimSkeleton key={i} />)}
      </div>
    )
  }

  if (claims.length === 0) return null

  return (
    <div className="tc-grid">
      {claims.map((claim) => (
        <TopClaimCard key={claim.termId} claim={claim} walletAddress={walletAddress} />
      ))}
    </div>
  )
}
