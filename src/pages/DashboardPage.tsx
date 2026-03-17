import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
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
import { useEnsNames } from '../hooks/useEnsNames'
import type { Address } from 'viem'
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
  Trusted: '#22C55E',
  Distrusted: '#EF4444',
  Work: '#3B82F6',
  Learning: '#06B6D4',
  Fun: '#F59E0B',
  Inspiration: '#8B5CF6',
  Buying: '#EC4899',
  Music: '#FF5722',
}

const QUEST_CATEGORY_STYLES: Record<string, { color: string; icon: string }> = {
  daily:     { color: '#FFD700', icon: '☀️' },
  streak:    { color: '#FF6B35', icon: '🔥' },
  milestone: { color: '#8B5CF6', icon: '⭐' },
  discovery: { color: '#06B6D4', icon: '🧭' },
  gold:      { color: '#D4A017', icon: '🪙' },
  vote:      { color: '#3B82F6', icon: '🗳️' },
  social:    { color: '#EC4899', icon: '🤝' },
}

const INTENT_FILTERS = ['All', 'Trusted', 'Distrusted', 'Work', 'Learning', 'Fun', 'Inspiration']

function QuestCard({ item, displayName, avatar }: { item: CircleItem; displayName: string; avatar: string }) {
  const category = item.intentions[0]?.replace('quest:', '') ?? 'milestone'
  const style = QUEST_CATEGORY_STYLES[category] ?? QUEST_CATEGORY_STYLES.milestone

  return (
    <Card
      className="p-4 flex flex-col gap-2 hover:shadow-md transition-shadow"
      style={{ borderLeft: `3px solid ${style.color}` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={avatar} alt="" className="h-6 w-6 rounded-full shrink-0" referrerPolicy="no-referrer" />
          <span style={{ fontSize: 18 }}>{style.icon}</span>
          <span className="text-sm font-bold">{displayName}</span>
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

function CircleCard({ item, displayName, avatar }: { item: CircleItem; displayName: string; avatar: string }) {
  return (
    <Card className="p-4 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header: avatar + name + time + favicon */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img src={avatar} alt="" className="h-6 w-6 rounded-full shrink-0" referrerPolicy="no-referrer" />
          <span className="text-sm font-bold truncate">{displayName}</span>
          <span className="text-xs text-muted-foreground shrink-0">{timeAgo(item.timestamp)}</span>
        </div>
        <img
          src={item.favicon}
          alt=""
          className="h-8 w-8 rounded-lg bg-muted shrink-0"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>

      {/* Phrase: user + colored intentions + title */}
      <p className="text-sm leading-relaxed">
        <span className="font-semibold">{displayName}</span>
        {' '}
        {item.intentions.map((intent, i) => (
          <span key={intent}>
            {i > 0 && <span className="text-muted-foreground">{i === item.intentions.length - 1 ? ' & ' : ', '}</span>}
            <span style={{ color: INTENTION_COLORS[intent] ?? 'var(--foreground)', fontWeight: 600 }}>{intent.toLowerCase()}</span>
          </span>
        ))}
        {' '}
        <span className="font-semibold">{item.title}</span>
      </p>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline truncate">{item.domain}</a>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
          <ChevronUp className="h-3.5 w-3.5" />
          Support
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
          <ChevronDown className="h-3.5 w-3.5" />
          Oppose
        </Button>
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
  const sentinelRef = useRef<HTMLDivElement>(null)

  const spaceParam = searchParams.get('space') || ''

  const spacePlatformIds = useMemo(
    () => (spaceParam ? getPlatformIdsForDomain(spaceParam) : null),
    [spaceParam],
  )

  const clearSpace = () => {
    searchParams.delete('space')
    setSearchParams(searchParams)
  }

  const { items: allItems, loading: allLoading, loadingMore, error: allError, hasMore, loadMore } = useAllActivity()
  const { items: circleItems, loading: circleLoading, error: circleError } = useCircleFeed(
    filter === 'circle' ? walletAddress : undefined,
  )

  const sourceItems = filter === 'all' ? allItems : circleItems

  const allCertifiers = useMemo(() => {
    const addrs = new Set<Address>()
    for (const item of sourceItems) {
      if (item.certifierAddress) addrs.add(item.certifierAddress as Address)
    }
    return [...addrs]
  }, [sourceItems])

  const { getDisplay, getAvatar } = useEnsNames(allCertifiers)
  const loading = filter === 'all' ? allLoading : circleLoading
  const feedError = filter === 'all' ? allError : circleError

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || filter !== 'all') return

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore() },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [filter, loadMore])

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

      {/* Error */}
      {!loading && feedError && (
        <Card className="p-6 text-center">
          <p className="text-sm text-destructive-foreground">{feedError}</p>
        </Card>
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
            <>
              <div className="grid grid-cols-2 gap-4">
                {filteredItems.map((item) => {
                  const addr = item.certifierAddress as Address
                  const name = addr ? getDisplay(addr) : item.certifier
                  const av = addr ? getAvatar(addr) : ''
                  const isQuest = item.intentions[0]?.startsWith('quest:')
                  return isQuest
                    ? <QuestCard key={item.id} item={item} displayName={name} avatar={av} />
                    : <CircleCard key={item.id} item={item} displayName={name} avatar={av} />
                })}
              </div>

              {/* Infinite scroll sentinel */}
              {filter === 'all' && hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-6">
                  {loadingMore && <SofiaLoader size={40} />}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
    </div>
  )
}
