import { useState, useMemo } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useSearchParams } from 'react-router-dom'
import { useCircleFeed } from '../hooks/useCircleFeed'
import { useAllActivity } from '../hooks/useAllActivity'
import type { CircleItem } from '../services/circleService'
import { PLATFORM_CATALOG } from '../config/platformCatalog'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { ScrollArea } from '../components/ui/scroll-area'
import { Button } from '../components/ui/button'
import { ChevronUp, ChevronDown, Users, Globe, X } from 'lucide-react'
import SofiaLoader from '../components/ui/SofiaLoader'
import PageHeader from '../components/PageHeader'
import { PAGE_COLORS } from '../config/pageColors'

/** Build a Set of platform IDs that belong to a given Sofia domain */
function getPlatformIdsForDomain(domainId: string): Set<string> {
  const ids = new Set<string>()
  for (const p of PLATFORM_CATALOG) {
    if (p.targetDomains.includes(domainId)) {
      ids.add(p.id)
    }
  }
  return ids
}

/** Check if a feed item's hostname matches any platform in a set */
function itemMatchesDomain(item: CircleItem, platformIds: Set<string>): boolean {
  const host = item.domain.toLowerCase()
  for (const pid of platformIds) {
    if (host.includes(pid)) return true
  }
  return false
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [filter, setFilter] = useState<'all' | 'circle'>('all')
  const [intentFilter, setIntentFilter] = useState('All')
  const { authenticated, user } = usePrivy()
  const walletAddress = user?.wallet?.address

  const spaceParam = searchParams.get('space') || ''

  const spacePlatformIds = useMemo(
    () => (spaceParam ? getPlatformIdsForDomain(spaceParam) : null),
    [spaceParam],
  )

  const clearSpace = () => {
    searchParams.delete('space')
    setSearchParams(searchParams)
  }

  const { items: allItems, loading: allLoading } = useAllActivity()
  const { items: circleItems, loading: circleLoading } = useCircleFeed(
    filter === 'circle' ? walletAddress : undefined,
  )

  const sourceItems = filter === 'all' ? allItems : circleItems
  const loading = filter === 'all' ? allLoading : circleLoading

  // Apply space filter then intention filter
  const spaceFiltered = spacePlatformIds
    ? sourceItems.filter((item) => itemMatchesDomain(item, spacePlatformIds))
    : sourceItems

  const filteredItems = intentFilter === 'All'
    ? spaceFiltered
    : spaceFiltered.filter((item) => item.intentions.includes(intentFilter))

  const spaceLabel = spaceParam
    ? spaceParam.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : ''

  const pc = PAGE_COLORS['/']

  return (
    <div>
      <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />
      <div className="space-y-4" style={{ padding: '16px 8px' }}>
      {/* Feed mode toggle */}
      <div className="flex items-center gap-3 mb-2">
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

      {/* Space filter badge */}
      {spaceParam && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge variant="secondary" style={{ fontSize: 13, padding: '4px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {spaceLabel}
            <button onClick={clearSpace} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <X style={{ width: 14, height: 14, color: 'var(--muted-foreground)' }} />
            </button>
          </Badge>
        </div>
      )}

      {/* Intention filters */}
      <ScrollArea className="w-full mb-2">
        <div className="flex gap-2 pb-2">
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
        <div className="flex items-start justify-center" style={{ minHeight: 'calc(100vh - 200px)', paddingTop: '20vh' }}>
          <SofiaLoader size={96} />
        </div>
      )}

      {/* Feed */}
      {!loading && (
        <>
          {filteredItems.length === 0 ? (
            <Card className="p-10 text-center">
              {filter === 'circle' ? (
                <>
                  <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <h3 className="mt-4 font-medium">Your Circle</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {circleItems.length === 0
                      ? 'Certify pages and trust users to build your circle.'
                      : `No ${intentFilter.toLowerCase()} items in your circle.`}
                  </p>
                </>
              ) : (
                <>
                  <Globe className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <h3 className="mt-4 font-medium">No activity yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
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
    </div>
  )
}
