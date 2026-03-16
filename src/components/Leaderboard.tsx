import { useState, useMemo } from 'react'
import { formatEther } from 'viem'
import type { Address } from 'viem'
import { useEnsNames } from '../hooks/useEnsNames'
import { EXPLORER_URL } from '../config'
import type { LeaderboardProps, AlphaTester, PoolPosition } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Skeleton } from './ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

type AlphaSortOption = 'TX' | 'Intentions' | 'Pioneer' | 'Trust Volume'
type PoolSortOption = 'Shares' | 'Current Value' | 'P&L' | 'P&L %'

function formatTrust(wei: bigint) {
  const num = parseFloat(formatEther(wei))
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k T'
  if (num >= 1) return num.toFixed(2) + ' T'
  return num.toFixed(4) + ' T'
}

function sortAlpha(data: AlphaTester[], sortBy: AlphaSortOption) {
  return [...data].sort((a, b) => {
    switch (sortBy) {
      case 'TX': return b.tx - a.tx
      case 'Intentions': return b.intentions - a.intentions
      case 'Pioneer': return b.pioneer - a.pioneer
      case 'Trust Volume': return a.trustVolume > b.trustVolume ? -1 : 1
      default: return 0
    }
  })
}

function sortPool(data: PoolPosition[], sortBy: PoolSortOption) {
  return [...data].sort((a, b) => {
    switch (sortBy) {
      case 'Shares': return a.shares > b.shares ? -1 : 1
      case 'Current Value': return a.currentValue > b.currentValue ? -1 : 1
      case 'P&L': return a.pnl > b.pnl ? -1 : 1
      case 'P&L %': return b.pnlPercent - a.pnlPercent
      default: return 0
    }
  })
}

const ALPHA_COLUMNS: { label: string; key: AlphaSortOption }[] = [
  { label: 'Intentions', key: 'Intentions' },
  { label: 'Pioneer', key: 'Pioneer' },
  { label: 'Trust Vol.', key: 'Trust Volume' },
  { label: 'TX', key: 'TX' },
]

const POOL_COLUMNS: { label: string; key: PoolSortOption }[] = [
  { label: 'Value', key: 'Current Value' },
  { label: 'P&L', key: 'P&L' },
  { label: 'P&L %', key: 'P&L %' },
]

export default function Leaderboard({
  alphaData = [],
  alphaLoading,
  alphaError,
  poolData,
  poolLoading,
  poolError,
  connectedAddress,
}: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<'alpha' | 'pool'>('alpha')
  const [alphaSortBy, setAlphaSortBy] = useState<AlphaSortOption>('TX')
  const [poolSortBy, setPoolSortBy] = useState<PoolSortOption>('P&L %')

  const sortedAlpha = useMemo(() => sortAlpha(alphaData, alphaSortBy), [alphaData, alphaSortBy])
  const sortedPool = useMemo(() => (poolData ? sortPool(poolData, poolSortBy) : []), [poolData, poolSortBy])

  const allAddresses = useMemo(() => {
    const a = alphaData.map((u) => u.address)
    const p = (poolData || []).map((pos: PoolPosition) => pos.address)
    return [...a, ...p] as Address[]
  }, [alphaData, poolData])

  const { getDisplay, getAvatar } = useEnsNames(allAddresses)

  const isAlpha = activeTab === 'alpha'
  const loading = isAlpha ? alphaLoading : poolLoading
  const error = isAlpha ? alphaError : poolError

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">Leaderboard</CardTitle>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={activeTab === 'alpha' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('alpha')}
          >
            Alpha Testers
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'pool' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('pool')}
          >
            Season Pool
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>User</TableHead>
              {(isAlpha ? ALPHA_COLUMNS : POOL_COLUMNS).map((col) => (
                <TableHead
                  key={col.key}
                  className="cursor-pointer text-right select-none"
                  onClick={() =>
                    isAlpha
                      ? setAlphaSortBy(col.key as AlphaSortOption)
                      : setPoolSortBy(col.key as PoolSortOption)
                  }
                >
                  {col.label}
                  {(isAlpha ? alphaSortBy : poolSortBy) === col.key && ' ▼'}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={isAlpha ? 6 : 5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {error && (
              <TableRow>
                <TableCell colSpan={isAlpha ? 6 : 5} className="text-center text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            )}

            {!loading && !error && isAlpha &&
              sortedAlpha.map((user, i) => {
                const isSelf = connectedAddress && user.address.toLowerCase() === connectedAddress.toLowerCase()
                return (
                  <TableRow key={user.address} className={`${i < 3 ? 'bg-accent/30' : ''} ${isSelf ? 'ring-2 ring-primary' : ''}`}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell>
                      <a
                        href={`${EXPLORER_URL}/address/${user.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={getAvatar(user.address)} />
                          <AvatarFallback className="text-[10px]">
                            {getDisplay(user.address).slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate max-w-[120px]">{getDisplay(user.address)}</span>
                      </a>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{user.intentions.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{user.pioneer}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatTrust(user.trustVolume)}</TableCell>
                    <TableCell className="text-right tabular-nums">{user.tx.toLocaleString()}</TableCell>
                  </TableRow>
                )
              })}

            {!loading && !error && !isAlpha &&
              sortedPool.map((pos, i) => {
                const isSelf = connectedAddress && pos.address.toLowerCase() === connectedAddress.toLowerCase()
                return (
                  <TableRow key={pos.address} className={`${i < 3 ? 'bg-accent/30' : ''} ${isSelf ? 'ring-2 ring-primary' : ''}`}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell>
                      <a
                        href={`${EXPLORER_URL}/address/${pos.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:underline"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={getAvatar(pos.address)} />
                          <AvatarFallback className="text-[10px]">
                            {getDisplay(pos.address).slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate max-w-[120px]">{getDisplay(pos.address)}</span>
                      </a>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatTrust(pos.currentValue)}</TableCell>
                    <TableCell className={`text-right tabular-nums ${pos.pnl >= 0n ? 'text-green-600' : 'text-red-500'}`}>
                      {pos.pnl >= 0n ? '+' : ''}{formatTrust(pos.pnl)}
                    </TableCell>
                    <TableCell className={`text-right tabular-nums ${pos.pnlPercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
