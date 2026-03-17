import { useState, useEffect } from 'react'
import { formatEther } from 'viem'
import type { Address } from 'viem'
import { usePrivy } from '@privy-io/react-auth'
import { EventFetcher } from '../services/eventFetcher'
import { useCircleFeed } from '../hooks/useCircleFeed'
import type { TransactionForwardedEvent } from '../types'
import type { CircleItem } from '../services/circleService'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { ScrollArea } from '../components/ui/scroll-area'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { ArrowUpRight, ArrowDownRight, ChevronUp, ChevronDown, Users, Globe, ExternalLink } from 'lucide-react'

function truncateAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function randomColor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  return `hsl(${Math.abs(hash) % 360}, 60%, 60%)`
}

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
}

const INTENT_FILTERS = ['All', 'Trusted', 'Distrusted', 'Work', 'Learning', 'Fun', 'Inspiration']

const OP_LABELS: Record<string, { label: string; color: string; icon: 'up' | 'down' }> = {
  depositTriple: { label: 'Deposit', color: 'text-green-500', icon: 'up' },
  redeemTriple: { label: 'Redeem', color: 'text-red-500', icon: 'down' },
  depositAtom: { label: 'Signal', color: 'text-blue-500', icon: 'up' },
  redeemAtom: { label: 'Unsignal', color: 'text-orange-500', icon: 'down' },
}

// ── Circle Feed Card ──
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

// ── Activity Feed Card ──
function ActivityCard({ evt, i }: { evt: TransactionForwardedEvent; i: number }) {
  const op = OP_LABELS[evt.operation] ?? { label: evt.operation, color: 'text-foreground', icon: 'up' as const }
  const value = formatEther(evt.totalReceived)
  const Icon = op.icon === 'up' ? ArrowUpRight : ArrowDownRight

  return (
    <Card key={`${evt.txHash}-${i}`} className="p-3 flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback
          className="text-[10px] text-white"
          style={{ background: randomColor(evt.user) }}
        >
          {evt.user.slice(2, 4).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{truncateAddress(evt.user)}</span>
          <Badge variant="outline" className="text-[10px]">
            <Icon className={`h-3 w-3 mr-0.5 ${op.color}`} />
            {op.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Block {evt.blockNumber.toString()}
        </p>
      </div>
      <span className="text-sm font-medium tabular-nums">
        {parseFloat(value).toFixed(4)} ETH
      </span>
    </Card>
  )
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<'all' | 'circle'>('all')
  const [intentFilter, setIntentFilter] = useState('All')
  const [events, setEvents] = useState<TransactionForwardedEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const { authenticated, user } = usePrivy()
  const walletAddress = user?.wallet?.address

  const { items: circleItems, loading: circleLoading } = useCircleFeed(
    filter === 'circle' ? walletAddress : undefined,
  )

  useEffect(() => {
    async function fetchEvents() {
      try {
        const fetcher = new EventFetcher()
        const data = await fetcher.fetch()
        setEvents(data.slice(-100).reverse())
      } catch {
        // Silent fail
      } finally {
        setEventsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Filter circle items by intention
  const filteredCircle = intentFilter === 'All'
    ? circleItems
    : circleItems.filter((item) => item.intentions.includes(intentFilter))

  const loading = filter === 'circle' ? circleLoading : eventsLoading

  return (
    <div className="space-y-4">
      {/* Feed mode toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          <Globe className="h-3 w-3 mr-1" />
          All Activity
        </Button>
        <Button
          variant={filter === 'circle' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('circle')}
          disabled={!authenticated}
        >
          <Users className="h-3 w-3 mr-1" />
          My Circle
        </Button>
      </div>

      {/* Intention filter (circle mode only) */}
      {filter === 'circle' && (
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
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      )}

      {/* Circle Feed — 2 column grid like extension */}
      {!loading && filter === 'circle' && (
        <>
          {filteredCircle.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <h3 className="mt-3 font-medium">Your Circle</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {circleItems.length === 0
                  ? 'Certify pages and trust users to build your circle.'
                  : `No ${intentFilter.toLowerCase()} items in your circle.`}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredCircle.map((item) => (
                <CircleCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </>
      )}

      {/* All Activity Feed — list */}
      {!loading && filter === 'all' && (
        <>
          {events.length === 0 ? (
            <Card className="p-8 text-center">
              <Globe className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <h3 className="mt-3 font-medium">No activity yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Recent on-chain activity will appear here.
              </p>
            </Card>
          ) : (
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-2 pr-4">
                {events.map((evt, i) => (
                  <ActivityCard key={`${evt.txHash}-${i}`} evt={evt} i={i} />
                ))}
              </div>
            </ScrollArea>
          )}
        </>
      )}
    </div>
  )
}
