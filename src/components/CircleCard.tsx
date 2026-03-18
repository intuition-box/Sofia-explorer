import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react'
import IntentionTooltip from '@/components/IntentionTooltip'
import type { CircleItem } from '@/services/circleService'
import { INTENTION_COLORS } from '@/config/intentions'
import { timeAgo } from '@/utils/formatting'

/** Verb phrase displayed before the colored intention word */
const INTENTION_VERB: Record<string, string> = {
  Trusted: '',
  Distrusted: '',
  Work: 'visits for',
  Learning: 'visits for',
  Fun: 'visits for',
  Inspiration: 'visits for',
  Buying: 'visits for',
  Music: 'listens to',
  Attending: 'is',
  Valued: 'has',
}

interface CircleCardProps {
  item: CircleItem
  displayName: string
  avatar: string
  isPrivate?: boolean
  onDeposit?: (side: 'support' | 'oppose', item: CircleItem) => void
}

export default function CircleCard({ item, displayName, avatar, isPrivate, onDeposit }: CircleCardProps) {
  const shownName = isPrivate ? 'Someone' : displayName

  return (
    <Card className="p-4 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header: avatar + name + time + favicon */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {!isPrivate && <img src={avatar} alt="" className="h-6 w-6 rounded-full shrink-0" referrerPolicy="no-referrer" />}
          <span className="text-sm font-bold truncate">{shownName}</span>
          <span className="text-xs text-muted-foreground shrink-0">{timeAgo(item.timestamp)}</span>
        </div>
        <img
          src={item.favicon}
          alt=""
          className="h-8 w-8 rounded-lg bg-muted shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>

      {/* Phrase: user + verb + colored intentions + title */}
      <p className="text-sm leading-relaxed">
        <span className="font-semibold">{shownName}</span>
        {' '}
        {item.intentions.map((intent, i) => {
          const verb = INTENTION_VERB[intent] ?? ''
          const intentColor = INTENTION_COLORS[intent] ?? 'var(--foreground)'
          return (
            <span key={intent}>
              {i > 0 && <span className="text-muted-foreground">{i === item.intentions.length - 1 ? ' & ' : ', '}</span>}
              {verb && <span className="text-muted-foreground">{verb} </span>}
              <IntentionTooltip termId={item.intentionVaults[intent]?.termId} color={intentColor}>
                <span style={{ color: intentColor, fontWeight: 600 }}>{intent.toLowerCase()}</span>
              </IntentionTooltip>
            </span>
          )
        })}
        {' '}
        <span className="font-semibold">{item.title}</span>
      </p>
      {item.url && item.domain && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline truncate">{item.domain}</a>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline" size="sm" className="text-xs h-7 gap-1"
          disabled={Object.keys(item.intentionVaults).length === 0}
          onClick={() => onDeposit?.('support', item)}
        >
          <ChevronUp className="h-3.5 w-3.5" />
          Support
        </Button>
        <Button
          variant="outline" size="sm" className="text-xs h-7 gap-1"
          disabled={!Object.values(item.intentionVaults).some(v => v.counterTermId)}
          onClick={() => onDeposit?.('oppose', item)}
        >
          <ChevronDown className="h-3.5 w-3.5" />
          Oppose
        </Button>
        {item.url && (
          <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto" asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  )
}
