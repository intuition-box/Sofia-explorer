import { Card } from '@/components/ui/card'
import type { CircleItem } from '@/services/circleService'
import { timeAgo } from '@/utils/formatting'

const QUEST_CATEGORY_STYLES: Record<string, { color: string; icon: string }> = {
  daily:     { color: '#FFD700', icon: '☀️' },
  streak:    { color: '#FF6B35', icon: '🔥' },
  milestone: { color: '#8B5CF6', icon: '⭐' },
  discovery: { color: '#06B6D4', icon: '🧭' },
  gold:      { color: '#D4A017', icon: '🪙' },
  vote:      { color: '#3B82F6', icon: '🗳️' },
  social:    { color: '#EC4899', icon: '🤝' },
}

interface QuestCardProps {
  item: CircleItem
  displayName: string
  avatar: string
  isPrivate?: boolean
}

export default function QuestCard({ item, displayName, avatar, isPrivate }: QuestCardProps) {
  const category = item.intentions[0]?.replace('quest:', '') ?? 'milestone'
  const style = QUEST_CATEGORY_STYLES[category] ?? QUEST_CATEGORY_STYLES.milestone
  const shownName = isPrivate ? 'A user' : displayName

  return (
    <Card
      className="p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
      style={{ borderLeft: `3px solid ${style.color}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isPrivate && <img src={avatar} alt="" className="h-6 w-6 rounded-full shrink-0" referrerPolicy="no-referrer" />}
          <span style={{ fontSize: 18 }}>{style.icon}</span>
          <span className="text-sm font-bold">{shownName}</span>
        </div>
        <span className="text-xs text-muted-foreground">{timeAgo(item.timestamp)}</span>
      </div>
      <p className="text-sm">
        <span className="text-muted-foreground">earned</span>
        {' '}
        <span style={{ color: style.color, fontWeight: 700 }}>{item.title}</span>
      </p>
    </Card>
  )
}
