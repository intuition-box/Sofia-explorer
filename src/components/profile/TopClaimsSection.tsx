import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Share2, Users } from 'lucide-react'
import type { TopClaim } from '@/hooks/useTopClaims'
import { INTENTION_COLORS, intentionBadgeStyle } from '@/config/intentions'
import { formatEth } from '@/services/vaultTooltipService'
import IntentionTooltip from '../IntentionTooltip'
import PositionBoardDialog from './PositionBoardDialog'
import { TopClaimSkeleton } from './ProfileSkeletons'
import { useCallback, useState } from 'react'
import { useClaimPositions } from '@/hooks/useClaimPositions'

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
  const { positions } = useClaimPositions(claim.termId, 3)
  const counterTermId = claim.item.intentionVaults[claim.intention]?.counterTermId

  const handleShare = useCallback(() => {
    const text = `${claim.item.title} — ${claim.intention}`
    const url = claim.item.url || ''
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(tweetUrl, '_blank', 'noopener,noreferrer')
  }, [claim])

  return (
    <Card className="tc-card">
      <div className="tc-header">
        <img
          src={claim.item.favicon}
          alt=""
          className="tc-favicon"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <span className="tc-title">{claim.item.title}</span>
      </div>

      <div className="tc-meta">
        <span className="tc-stat">{totalMcap} T</span>
        <span className="tc-stat"><Users className="h-3 w-3" /> {posCount}</span>
      </div>

      {/* Mini position board — click to open full leaderboard */}
      {positions.length > 0 && (
        <div
          className="ac-positions ac-positions--clickable"
          onClick={() => setBoardOpen(true)}
          title="View full leaderboard"
        >
          {positions.map((pos, i) => {
            const isYou = walletAddress && pos.accountId.toLowerCase() === walletAddress.toLowerCase()
            return (
              <div key={pos.accountId} className={`ac-pos-row ${isYou ? 'ac-pos-row--you' : ''}`}>
                <span className="ac-pos-rank">#{i + 1}</span>
                <span className="ac-pos-label">{pos.label}</span>
                {isYou && <span className="ac-pos-you">You</span>}
              </div>
            )
          })}
        </div>
      )}

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
          onClick={handleShare}
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Full position board dialog */}
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
    </Card>
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
