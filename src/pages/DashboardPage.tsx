import { useState, useEffect } from 'react'
import { formatEther } from 'viem'
import { usePrivy } from '@privy-io/react-auth'
import { EventFetcher } from '../services/eventFetcher'
import type { TransactionForwardedEvent } from '../types'
import { SpacesNav } from '../components/SpacesNav'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { ScrollArea } from '../components/ui/scroll-area'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { ArrowUpRight, ArrowDownRight, Users, Globe } from 'lucide-react'

function truncateAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function randomColor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  return `hsl(${Math.abs(hash) % 360}, 60%, 60%)`
}

const OP_LABELS: Record<string, { label: string; color: string; icon: 'up' | 'down' }> = {
  depositTriple: { label: 'Deposit', color: 'text-green-500', icon: 'up' },
  redeemTriple: { label: 'Redeem', color: 'text-red-500', icon: 'down' },
  depositAtom: { label: 'Signal', color: 'text-blue-500', icon: 'up' },
  redeemAtom: { label: 'Unsignal', color: 'text-orange-500', icon: 'down' },
}

export default function DashboardPage() {
  const [activeSpace, setActiveSpace] = useState('all')
  const [filter, setFilter] = useState<'all' | 'circle'>('all')
  const [events, setEvents] = useState<TransactionForwardedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const { authenticated } = usePrivy()

  useEffect(() => {
    async function fetchEvents() {
      try {
        const fetcher = new EventFetcher()
        const data = await fetcher.fetch()
        setEvents(data.slice(-100).reverse())
      } catch {
        // Silent fail
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  // Circle filter — in production, would filter by trust circle addresses
  // For now shows all events (trust circle is empty until users certify each other)
  const filteredEvents = events

  return (
    <div className="space-y-4">
      <SpacesNav activeSpace={activeSpace} onSpaceChange={setActiveSpace} />

      {/* Feed filter */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          <Globe className="h-3 w-3 mr-1" />
          All
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

      {/* Feed */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!loading && filteredEvents.length === 0 && (
        <Card className="p-8 text-center">
          {filter === 'circle' ? (
            <>
              <Users className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <h3 className="mt-3 font-medium">Your Circle</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Activity from your trust circle will appear here.
              </p>
            </>
          ) : (
            <>
              <Globe className="h-10 w-10 mx-auto text-muted-foreground/40" />
              <h3 className="mt-3 font-medium">No activity yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Recent on-chain activity will appear here.
              </p>
            </>
          )}
        </Card>
      )}

      {!loading && filteredEvents.length > 0 && (
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-2 pr-4">
            {filteredEvents.map((evt, i) => {
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
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
