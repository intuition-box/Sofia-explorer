import { useState } from 'react'
import { formatEther } from 'viem'
import type { Address } from 'viem'
import { useStreakLeaderboard } from '../hooks/useStreakLeaderboard'
import { useEnsNames } from '../hooks/useEnsNames'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Flame } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { PAGE_COLORS } from '../config/pageColors'

function randomColor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  return `hsl(${Math.abs(hash) % 360}, 60%, 60%)`
}

function formatShares(shares: string): string {
  const num = parseFloat(formatEther(BigInt(shares)))
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  if (num >= 100) return num.toFixed(1)
  if (num >= 1) return num.toFixed(2)
  return num.toFixed(4)
}

type Tab = 'signals' | 'vote'

export default function StreaksPage() {
  const [tab, setTab] = useState<Tab>('signals')
  const { entries, loading, error } = useStreakLeaderboard()
  const addresses = entries.map((e) => e.address as Address)
  const { getDisplay, getAvatar } = useEnsNames(addresses)

  const streakData = entries.map((entry) => ({
    ...entry,
    displayName: getDisplay(entry.address as Address),
    avatar: getAvatar(entry.address as Address),
  }))

  const activeStreakers = streakData.filter((e) => e.streakDays > 0)
  const top3 = activeStreakers.slice(0, 3)
  const rest = activeStreakers.slice(3)

  const pc = PAGE_COLORS['/streaks']

  return (
    <div>
      <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />
      <div className="space-y-8" style={{ padding: '16px 8px' }}>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        <Button
          variant={tab === 'signals' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => setTab('signals')}
        >
          Signals
        </Button>
        <Button
          variant={tab === 'vote' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1"
          onClick={() => setTab('vote')}
        >
          Vote
        </Button>
      </div>

      {/* Streak count */}
      {!loading && (
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="font-semibold">Signals</span>
          <span className="text-sm text-muted-foreground">{activeStreakers.length} streakers</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="flex items-end justify-center gap-4 py-8">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      )}

      {error && (
        <Card className="p-4 text-center text-sm text-destructive">{error}</Card>
      )}

      {/* Podium — Top 3 */}
      {!loading && top3.length >= 3 && (
        <div className="flex items-end justify-center gap-6 pt-4 pb-2">
          {/* #2 — left */}
          <div className="flex flex-col items-center">
            <Avatar className="h-16 w-16 ring-2 ring-gray-400/50">
              <img src={top3[1].avatar} alt="" className="h-full w-full rounded-full object-cover" />
              <AvatarFallback className="text-sm text-white" style={{ background: randomColor(top3[1].address) }}>
                {top3[1].displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs font-medium mt-2 truncate max-w-[90px] text-center">{top3[1].displayName}</p>
            <div className="flex items-center gap-0.5 mt-0.5">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-bold text-orange-500">{top3[1].streakDays}d</span>
            </div>
          </div>

          {/* #1 — center, elevated */}
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-20 w-20 ring-2 ring-yellow-500/70">
              <img src={top3[0].avatar} alt="" className="h-full w-full rounded-full object-cover" />
              <AvatarFallback className="text-base text-white" style={{ background: randomColor(top3[0].address) }}>
                {top3[0].displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium mt-2 truncate max-w-[100px] text-center">{top3[0].displayName}</p>
            <div className="flex items-center gap-0.5 mt-0.5">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-sm font-bold text-orange-500">{top3[0].streakDays}d</span>
            </div>
          </div>

          {/* #3 — right */}
          <div className="flex flex-col items-center">
            <Avatar className="h-16 w-16 ring-2 ring-amber-700/50">
              <img src={top3[2].avatar} alt="" className="h-full w-full rounded-full object-cover" />
              <AvatarFallback className="text-sm text-white" style={{ background: randomColor(top3[2].address) }}>
                {top3[2].displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs font-medium mt-2 truncate max-w-[90px] text-center">{top3[2].displayName}</p>
            <div className="flex items-center gap-0.5 mt-0.5">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-xs font-bold text-orange-500">{top3[2].streakDays}d</span>
            </div>
          </div>
        </div>
      )}

      {/* Ranking list #4+ */}
      {!loading && !error && (
        <div className="space-y-1">
          {rest.map((entry, i) => (
            <div key={entry.address} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
              <span className="text-sm text-muted-foreground w-6 text-right font-medium">#{i + 4}</span>
              <Avatar className="h-8 w-8">
                <img src={entry.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                <AvatarFallback className="text-[10px] text-white" style={{ background: randomColor(entry.address) }}>
                  {entry.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-xs font-bold">{entry.streakDays}</span>
              </div>
              <div className="text-right min-w-[60px]">
                <span className="text-sm font-semibold">{formatShares(entry.shares)}</span>
                <span className="text-[10px] text-muted-foreground ml-1">TRUST</span>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
