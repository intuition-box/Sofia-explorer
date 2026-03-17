import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useCircleFeed } from '../hooks/useCircleFeed'
import { useAllActivity } from '../hooks/useAllActivity'
import type { CircleItem } from '../services/circleService'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ScrollArea } from '../components/ui/scroll-area'
import { Button } from '../components/ui/button'
import { ChevronUp, ChevronDown, Users, Globe } from 'lucide-react'
import SofiaLoader from '../components/ui/SofiaLoader'

function timeAgo(timestamp: string): string {
  if (!timestamp) return ''
  const diff = Date.now() - new Date(timestamp).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const INTENTION_COLORS: Record<string, string> = {
  Trusted: 'bg-green-500 text-white',
  Distrusted: 'bg-red-500 text-white',
  Work: 'bg-blue-500 text-white',
  Learning: 'bg-emerald-500 text-white',
  Fun: 'bg-amber-500 text-white',
  Inspiration: 'bg-purple-500 text-white',
  Buying: 'bg-pink-500 text-white',
  Music: 'bg-indigo-500 text-white',
}

const INTENT_FILTERS = ['All', 'Trusted', 'Distrusted', 'Work', 'Learning', 'Fun', 'Inspiration']

function CircleCard({ item }: { item: CircleItem }) {
  return (
    <Card className="p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <img
          src={item.favicon}
          alt=""
          className="h-10 w-10 rounded-lg bg-muted"
          onError={(e) => { (e.target as HTMLImageElement).src = '' }}
        />
        <div className="flex flex-wrap gap-1 justify-end">
          {item.intentions.map((intent) => (
            <Badge
              key={intent}
              className={`text-[10px] px-1.5 py-0 ${INTENTION_COLORS[intent] ?? 'bg-muted text-foreground'}`}
            >
              {intent}
            </Badge>
          ))}
        </div>
      </div>

      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium leading-tight line-clamp-2 hover:underline"
      >
        {item.title}
      </a>

      <div className="flex items-center justify-between mt-auto">
        <span className="text-xs text-muted-foreground">{item.certifier}</span>
        <div className="flex items-center gap-2">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronUp className="h-4 w-4" />
          </button>
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">{timeAgo(item.timestamp)}</span>
        </div>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<'all' | 'circle'>('all')
  const [intentFilter, setIntentFilter] = useState('All')
  const { authenticated, user } = usePrivy()
  const walletAddress = user?.wallet?.address

  const { items: allItems, loading: allLoading } = useAllActivity()
  const { items: circleItems, loading: circleLoading } = useCircleFeed(
    filter === 'circle' ? walletAddress : undefined,
  )

  const sourceItems = filter === 'all' ? allItems : circleItems
  const loading = filter === 'all' ? allLoading : circleLoading

  const filteredItems = intentFilter === 'All'
    ? sourceItems
    : sourceItems.filter((item) => item.intentions.includes(intentFilter))

  return (
    <div className="space-y-5">
      {/* Feed mode toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setFilter('all'); setIntentFilter('All') }}
        >
          <Globe className="h-3 w-3 mr-1" />
          All Activity
        </Button>
        <Button
          variant={filter === 'circle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setFilter('circle'); setIntentFilter('All') }}
          disabled={!authenticated}
        >
          <Users className="h-3 w-3 mr-1" />
          My Circle
        </Button>
      </div>

      {/* Intention filters */}
      <ScrollArea className="w-full">
        <div className="flex gap-1 pb-1">
          {INTENT_FILTERS.map((intent) => (
            <Button
              key={intent}
              variant={intentFilter === intent ? 'default' : 'outline'}
              size="sm"
              className="flex-shrink-0 text-xs h-7"
              onClick={() => setIntentFilter(intent)}
            >
              {intent}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <SofiaLoader size={48} />
        </div>
      )}

      {/* Feed */}
      {!loading && (
        <>
          {filteredItems.length === 0 ? (
            <Card className="p-8 text-center">
              {filter === 'circle' ? (
                <>
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <h3 className="mt-3 font-medium">Your Circle</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {circleItems.length === 0
                      ? 'Certify pages and trust users to build your circle.'
                      : `No ${intentFilter.toLowerCase()} items in your circle.`}
                  </p>
                </>
              ) : (
                <>
                  <Globe className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <h3 className="mt-3 font-medium">No activity yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Recent certifications will appear here.
                  </p>
                </>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <CircleCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
