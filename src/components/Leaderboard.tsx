import { useState, useMemo } from 'react'
import type { Address } from 'viem'
import { useEnsNames } from '../hooks/useEnsNames'
import { EXPLORER_URL } from '../config'
import type { LeaderboardProps, AlphaTester, PoolPosition } from '../types'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { formatTrust } from '../utils/formatting'

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

const cellBase: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 14,
  verticalAlign: 'middle',
}

const cellNum: React.CSSProperties = {
  ...cellBase,
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
}

const cellHead: React.CSSProperties = {
  ...cellBase,
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--muted-foreground)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const cellHeadNum: React.CSSProperties = {
  ...cellHead,
  textAlign: 'right',
  cursor: 'pointer',
  userSelect: 'none' as const,
}

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
    <Card style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Leaderboard</span>
        <div style={{ display: 'flex', gap: 4 }}>
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
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ ...cellHead, width: 50, textAlign: 'center' }}>#</th>
              <th style={{ ...cellHead, textAlign: 'left' }}>User</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={cellHeadNum}
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
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td colSpan={2 + columns.length} style={cellBase}>
                    <div className="bg-muted animate-pulse" style={{ height: 20, borderRadius: 4 }} />
                  </td>
                </tr>
              ))}

            {error && (
              <tr>
                <td colSpan={2 + columns.length} style={{ ...cellBase, textAlign: 'center', color: 'var(--destructive-foreground)' }}>
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
                    style={{
                      borderBottom: '1px solid var(--border)',
                      borderLeft: isSelf ? '3px solid var(--primary)' : undefined,
                      background: isSelf ? 'rgba(255,198,176,0.08)' : undefined,
                    }}
                  >
                    <td style={{ ...cellBase, width: 50, textAlign: 'center', color: 'var(--muted-foreground)', fontWeight: 500 }}>{i + 1}</td>
                    <td style={cellBase}>
                      <a
                        href={`${EXPLORER_URL}/address/${user.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'inherit', textDecoration: 'none', fontWeight: 500 }}
                      >
                        <img
                          src={getAvatar(user.address)}
                          alt=""
                          style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{getDisplay(user.address)}</span>
                      </a>
                    </td>
                    <td style={cellNum}>{user.intentions.toLocaleString()}</td>
                    <td style={cellNum}>{user.pioneer}</td>
                    <td style={cellNum}>{formatTrust(user.trustVolume)}</td>
                    <td style={cellNum}>{user.tx.toLocaleString()}</td>
                  </tr>
                )
              })}

            {!loading && !error && !isAlpha &&
              sortedPool.map((pos, i) => {
                const isSelf = connectedAddress && pos.address.toLowerCase() === connectedAddress.toLowerCase()
                return (
                  <tr
                    key={pos.address}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      borderLeft: isSelf ? '3px solid var(--primary)' : undefined,
                      background: isSelf ? 'rgba(255,198,176,0.08)' : undefined,
                    }}
                  >
                    <td style={{ ...cellBase, width: 50, textAlign: 'center', color: 'var(--muted-foreground)', fontWeight: 500 }}>{i + 1}</td>
                    <td style={cellBase}>
                      <a
                        href={`${EXPLORER_URL}/address/${pos.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'inherit', textDecoration: 'none', fontWeight: 500 }}
                      >
                        <img
                          src={getAvatar(pos.address)}
                          alt=""
                          style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>{getDisplay(pos.address)}</span>
                      </a>
                    </td>
                    <td style={cellNum}>{formatTrust(pos.currentValue)}</td>
                    <td style={{ ...cellNum, color: pos.pnl >= 0n ? '#22c55e' : '#ef4444' }}>
                      {pos.pnl >= 0n ? '+' : ''}{formatTrust(pos.pnl)}
                    </td>
                    <td style={{ ...cellNum, color: pos.pnlPercent >= 0 ? '#22c55e' : '#ef4444' }}>
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
