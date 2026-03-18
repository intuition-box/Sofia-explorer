import { useCallback } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Plus, Share2, ExternalLink } from 'lucide-react'
import IntentionTooltip from '../IntentionTooltip'
import type { CircleItem } from '@/services/circleService'
import { INTENTION_COLORS, intentionBadgeStyle } from '@/config/intentions'
import { timeAgo } from '@/utils/formatting'
import { useClaimPositions } from '@/hooks/useClaimPositions'

const INTENTION_VERB: Record<string, string> = {}

interface ActivityCardProps {
  item: CircleItem
  walletAddress?: string
  onAddValue?: (item: CircleItem) => void
}

export default function ActivityCard({ item, walletAddress, onAddValue }: ActivityCardProps) {
  const hasVaults = Object.keys(item.intentionVaults).length > 0

  // Get termId from first intention for position board
  const firstIntent = item.intentions.find((i) => item.intentionVaults[i]?.termId)
  const termId = firstIntent ? item.intentionVaults[firstIntent]?.termId : undefined
  const { positions } = useClaimPositions(termId, 3)

  const handleShare = useCallback(() => {
    const text = `${item.title} — ${item.intentions.join(', ')}`
    const url = item.url || ''
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(tweetUrl, '_blank', 'noopener,noreferrer')
  }, [item])

  return (
    <Card className="ac-card">
      {/* Header: favicon + title + time */}
      <div className="ac-header">
        <div className="ac-header-left">
          <img
            src={item.favicon}
            alt=""
            className="ac-favicon"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <span className="ac-title">{item.title}</span>
        </div>
        <span className="ac-time">{timeAgo(item.timestamp)}</span>
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

      {/* Actions: badges + Add Value + Share + Link */}
      <div className="ac-actions">
        {item.intentions.map((intent) => {
          const verb = INTENTION_VERB[intent] ?? ''
          const color = INTENTION_COLORS[intent] ?? 'var(--foreground)'
          return (
            <IntentionTooltip key={intent} termId={item.intentionVaults[intent]?.termId} color={color}>
              <span className="ac-badge" style={intentionBadgeStyle(color)}>
                {verb ? `${verb} ` : ''}{intent}
              </span>
            </IntentionTooltip>
          )
        })}
        <Button
          variant="outline"
          size="sm"
          className="ac-btn"
          disabled={!hasVaults}
          onClick={() => onAddValue?.(item)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Value
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ac-btn-share"
          onClick={handleShare}
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
        {item.url && (
          <Button
            variant="ghost"
            size="sm"
            className="ac-btn-share"
            asChild
          >
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  )
}
