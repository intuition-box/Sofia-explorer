import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Plus, Share2, Users } from 'lucide-react'
import type { TopClaim } from '@/hooks/useTopClaims'
import type { CircleItem } from '@/services/circleService'
import { INTENTION_COLORS, intentionBadgeStyle } from '@/config/intentions'
import { formatEth } from '@/services/vaultTooltipService'
import IntentionTooltip from '../IntentionTooltip'
import { TopClaimSkeleton } from './ProfileSkeletons'
import { useCallback } from 'react'

interface TopClaimsSectionProps {
  claims: TopClaim[]
  loading: boolean
  onAddValue?: (item: CircleItem) => void
}

export default function TopClaimsSection({ claims, loading, onAddValue }: TopClaimsSectionProps) {
  const handleShare = useCallback((claim: TopClaim) => {
    const text = `${claim.item.title} — ${claim.intention}`
    const url = claim.item.url || ''
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(tweetUrl, '_blank', 'noopener,noreferrer')
  }, [])

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
      {claims.map((claim) => {
        const color = INTENTION_COLORS[claim.intention] ?? '#888'
        const totalMcap = formatEth(String(claim.totalMarketCap))
        const posCount = claim.stats.supportCount + claim.stats.opposeCount

        return (
          <Card key={claim.termId} className="tc-card">
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

            <div className="tc-actions">
              <IntentionTooltip termId={claim.termId} color={color}>
                <span className="tc-badge" style={intentionBadgeStyle(color)}>
                  {claim.intention}
                </span>
              </IntentionTooltip>
              <Button
                variant="outline"
                size="sm"
                className="ac-btn"
                onClick={() => onAddValue?.(claim.item)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Value
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="ac-btn-share"
                onClick={() => handleShare(claim)}
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
