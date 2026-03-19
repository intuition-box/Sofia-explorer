import { useState, useCallback } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ExternalLink, Share2, Users } from 'lucide-react'
import { useClaimPositions } from '@/hooks/useClaimPositions'
import PositionBoardDialog from './profile/PositionBoardDialog'
import type { TrendingPlatform } from '@/types'
import { usePrivy } from '@privy-io/react-auth'

interface TrendingCardProps {
  platform: TrendingPlatform
  domainLabel: string
}

export default function TrendingCard({ platform, domainLabel }: TrendingCardProps) {
  const [boardOpen, setBoardOpen] = useState(false)
  const { user } = usePrivy()
  const walletAddress = user?.wallet?.address ?? ''
  const { positions } = useClaimPositions(platform.termId, 3)

  // Use first intention for the dialog badge
  const firstIntention = platform.intentions[0]
  const intentionLabel = firstIntention?.category ?? 'Trusted'
  const intentionColor = firstIntention?.color ?? '#888'

  const handleShare = useCallback(() => {
    const text = `${platform.platformName} is trending in ${domainLabel}!`
    const url = `https://${platform.platformDomain}`
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer')
  }, [platform, domainLabel])

  return (
    <>
      <Card className="ip-trending-card" onClick={() => platform.termId && setBoardOpen(true)}>
        <div className="ip-trending-header">
          <img
            src={platform.favicon}
            alt=""
            className="ip-trending-favicon"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <span className="ip-trending-label">{platform.platformName}</span>
          {platform.userPnlPct != null && (
            <span
              className="ip-trending-pnl"
              style={{ color: platform.userPnlPct >= 0 ? '#10B981' : '#EF4444' }}
            >
              {platform.userPnlPct >= 0 ? '+' : ''}{platform.userPnlPct}%
            </span>
          )}
        </div>
        <div className="ip-trending-meta">
          {platform.intentions.map(({ category, count, color }) => (
            <Badge
              key={category}
              variant="secondary"
              className="ip-trending-badge"
              style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
            >
              {category} {count}
            </Badge>
          ))}
          <span className="ip-trending-stat"><Users className="h-3 w-3" /> {platform.totalCertifiers}</span>
        </div>

        {/* Mini position board */}
        {positions.length > 0 && (
          <div className="ac-positions">
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

        <div className="ip-trending-actions" onClick={(e) => e.stopPropagation()}>
          <a href={`https://${platform.platformDomain}`} target="_blank" rel="noopener noreferrer" className="ip-trending-link">
            <ExternalLink className="h-3 w-3" />
          </a>
          <Button
            variant="ghost"
            size="sm"
            className="ip-trending-action-btn"
            style={{ marginLeft: 'auto', width: 26, padding: 0 }}
            onClick={handleShare}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>

      {/* Dialog outside card to avoid click conflicts */}
      {platform.termId && (
        <PositionBoardDialog
          open={boardOpen}
          onOpenChange={setBoardOpen}
          termId={platform.termId}
          counterTermId={platform.counterTermId}
          title={platform.platformName}
          favicon={platform.favicon}
          intention={intentionLabel}
          intentionColor={intentionColor}
          walletAddress={walletAddress}
        />
      )}
    </>
  )
}
