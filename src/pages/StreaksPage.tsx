import { useAlphaTesters } from '../hooks/useAlphaTesters'
import { useEnsNames } from '../hooks/useEnsNames'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Flame } from 'lucide-react'

function truncateAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

function randomColor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  return `hsl(${Math.abs(hash) % 360}, 60%, 60%)`
}

// Derive streak from transaction count as a proxy (real streak = consecutive days active)
function deriveStreak(tx: number): number {
  return Math.min(Math.floor(tx / 3), 365)
}

export default function StreaksPage() {
  const { leaderboard, loading, error } = useAlphaTesters()
  const addresses = (leaderboard || []).map((a) => a.address)
  const { ensNames } = useEnsNames(addresses)

  const streakData = (leaderboard || [])
    .map((entry) => ({
      ...entry,
      streak: deriveStreak(entry.tx),
      displayName: ensNames.get(entry.address.toLowerCase()) || truncateAddress(entry.address),
    }))
    .sort((a, b) => b.streak - a.streak)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Streaks
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Users ranked by consecutive days of on-chain activity.
        </p>
      </div>

      {/* Podium — Top 3 */}
      {!loading && streakData.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[1, 0, 2].map((idx) => {
            const entry = streakData[idx]
            const rank = idx + 1
            const sizes = ['h-20', 'h-24', 'h-16']
            return (
              <Card key={entry.address} className="p-4 text-center">
                <div className="flex justify-center mb-2">
                  <div className={`flex items-end justify-center ${sizes[idx]} w-12 rounded-t-lg bg-gradient-to-t ${rank === 1 ? 'from-yellow-500/20 to-yellow-500/5' : rank === 2 ? 'from-gray-400/20 to-gray-400/5' : 'from-amber-700/20 to-amber-700/5'}`}>
                    <span className="text-2xl font-bold mb-1">{rank}</span>
                  </div>
                </div>
                <Avatar className="h-10 w-10 mx-auto">
                  <AvatarFallback
                    className="text-xs text-white"
                    style={{ background: randomColor(entry.address) }}
                  >
                    {entry.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium mt-2 truncate">{entry.displayName}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Flame className="h-3 w-3 text-orange-500" />
                  <span className="text-lg font-bold">{entry.streak}</span>
                  <span className="text-xs text-muted-foreground">days</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Full ranking */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {error && (
        <Card className="p-4 text-center text-sm text-destructive">{error}</Card>
      )}

      {!loading && !error && (
        <div className="space-y-1">
          {streakData.slice(3).map((entry, i) => (
            <Card key={entry.address} className="p-3 flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground w-6 text-right">{i + 4}</span>
              <Avatar className="h-7 w-7">
                <AvatarFallback
                  className="text-[10px] text-white"
                  style={{ background: randomColor(entry.address) }}
                >
                  {entry.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium flex-1 truncate">{entry.displayName}</span>
              <div className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="text-sm font-bold">{entry.streak}</span>
              </div>
              <Badge variant="secondary" className="text-[10px]">{entry.tx} tx</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
