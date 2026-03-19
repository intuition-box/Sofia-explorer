import { useState, useMemo } from 'react'
import type { Address } from 'viem'
import { useEnsNames } from '../hooks/useEnsNames'
import { EXPLORER_URL } from '../config'
import type { LeaderboardProps, AlphaTester, PoolPosition } from '../types'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { formatTrust } from '../utils/formatting'
import './styles/leaderboard.css'

type AlphaSortOption = 'TX' | 'Intentions' | 'Pioneer' | 'Trust Volume'
type PoolSortOption = 'Shares' | 'Current Value' | 'P&L' | 'P&L %'

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
  const columns = isAlpha ? ALPHA_COLUMNS : POOL_COLUMNS

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="lb-header">
        <span className="lb-title">Leaderboard</span>
        <div className="lb-tab-group">
          <Button
            size="sm"
            variant={activeTab === 'alpha' ? 'default' : 'ghost'}
            data-active={activeTab === 'alpha'}
            onClick={() => setActiveTab('alpha')}
          >
            Alpha Testers
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'pool' ? 'default' : 'ghost'}
            data-active={activeTab === 'pool'}
            onClick={() => setActiveTab('pool')}
          >
            Season Pool
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="lb-table">
          <thead>
            <tr className="lb-border-row">
              <th className="lb-rank-head">#</th>
              <th className="lb-cell-head">User</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="lb-cell-head-num"
                  onClick={() =>
                    isAlpha
                      ? setAlphaSortBy(col.key as AlphaSortOption)
                      : setPoolSortBy(col.key as PoolSortOption)
                  }
                >
                  {col.label}
                  {(isAlpha ? alphaSortBy : poolSortBy) === col.key && ' ▼'}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="lb-border-row">
                  <td colSpan={2 + columns.length} className="lb-cell">
                    <div className="lb-skeleton bg-muted animate-pulse" />
                  </td>
                </tr>
              ))}

            {error && (
              <tr>
                <td colSpan={2 + columns.length} className="lb-error">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && isAlpha &&
              sortedAlpha.map((user, i) => {
                const isSelf = connectedAddress && user.address.toLowerCase() === connectedAddress.toLowerCase()
                return (
                  <tr
                    key={user.address}
                    className={"lb-border-row" + (isSelf ? " lb-self-row" : "")}
                  >
                    <td className="lb-rank">{i + 1}</td>
                    <td className="lb-cell">
                      <a
                        href={`${EXPLORER_URL}/address/${user.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lb-user-link"
                      >
                        <img
                          src={getAvatar(user.address)}
                          alt=""
                          className="lb-avatar"
                        />
                        <span className="lb-username">{getDisplay(user.address)}</span>
                      </a>
                    </td>
                    <td className="lb-cell-num">{user.intentions.toLocaleString()}</td>
                    <td className="lb-cell-num">{user.pioneer}</td>
                    <td className="lb-cell-num">{formatTrust(user.trustVolume)}</td>
                    <td className="lb-cell-num">{user.tx.toLocaleString()}</td>
                  </tr>
                )
              })}

            {!loading && !error && !isAlpha &&
              sortedPool.map((pos, i) => {
                const isSelf = connectedAddress && pos.address.toLowerCase() === connectedAddress.toLowerCase()
                return (
                  <tr
                    key={pos.address}
                    className={"lb-border-row" + (isSelf ? " lb-self-row" : "")}
                  >
                    <td className="lb-rank">{i + 1}</td>
                    <td className="lb-cell">
                      <a
                        href={`${EXPLORER_URL}/address/${pos.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="lb-user-link"
                      >
                        <img
                          src={getAvatar(pos.address)}
                          alt=""
                          className="lb-avatar"
                        />
                        <span className="lb-username">{getDisplay(pos.address)}</span>
                      </a>
                    </td>
                    <td className="lb-cell-num">{formatTrust(pos.currentValue)}</td>
                    <td className={"lb-cell-num " + (pos.pnl >= 0n ? "lb-positive" : "lb-negative")}>
                      {pos.pnl >= 0n ? '+' : ''}{formatTrust(pos.pnl)}
                    </td>
                    <td className={"lb-cell-num " + (pos.pnlPercent >= 0 ? "lb-positive" : "lb-negative")}>
                      {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(1)}%
                    </td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
