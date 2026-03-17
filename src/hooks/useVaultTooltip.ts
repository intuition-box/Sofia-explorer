import { useState, useCallback, useRef } from 'react'
import { useGetTripleVaultStatsQuery } from '@0xsofia/dashboard-graphql'
import { usePrivy } from '@privy-io/react-auth'

export interface VaultStats {
  supportMarketCap: string
  opposeMarketCap: string
  supportCount: number
  opposeCount: number
  userPnlPct: number | null
}

function extractSide(vaults: any[] | undefined, decimals = 18n) {
  let totalMarketCap = 0n
  let totalCount = 0
  let userShares = 0n
  let userCostBasis = 0n
  let weightedSharePrice = 0n

  for (const v of vaults ?? []) {
    totalMarketCap += BigInt(v.market_cap || '0')
    totalCount += v.position_count || 0
    const sharePrice = BigInt(v.current_share_price || '0')
    for (const p of v.positions ?? []) {
      if (p.shares && BigInt(p.shares) > 0n) {
        const s = BigInt(p.shares)
        userShares += s
        userCostBasis += BigInt(p.total_deposit_assets_after_total_fees || '0')
        weightedSharePrice += s * sharePrice
      }
    }
  }

  let userPnlPct: number | null = null
  if (userShares > 0n && userCostBasis > 0n) {
    const currentValue = weightedSharePrice / (10n ** decimals)
    const pnl = Number(currentValue - userCostBasis) / Number(userCostBasis)
    userPnlPct = Math.round(pnl * 1000) / 10
  }

  return { marketCap: String(totalMarketCap), count: totalCount, userPnlPct }
}

// Global cache to avoid re-fetching
const statsCache = new Map<string, VaultStats>()

export function useVaultTooltip() {
  const [stats, setStats] = useState<VaultStats | null>(null)
  const [loading, setLoading] = useState(false)
  const activeTermId = useRef<string | null>(null)
  const { user } = usePrivy()
  const walletAddress = user?.wallet?.address || ''

  const fetchStats = useCallback(async (termId: string) => {
    if (!termId) return

    // Check cache
    const cached = statsCache.get(termId)
    if (cached) {
      setStats(cached)
      return
    }

    activeTermId.current = termId
    setLoading(true)

    try {
      const data = await useGetTripleVaultStatsQuery.fetcher({
        termId,
        address: walletAddress || '0x0000000000000000000000000000000000000000',
      })()

      const triple = data.triples?.[0]
      if (!triple) {
        setStats(null)
        setLoading(false)
        return
      }

      const support = extractSide(triple.term?.vaults)
      const oppose = extractSide(triple.counter_term?.vaults)

      // Combine PNL from both sides
      const userPnlPct = support.userPnlPct ?? oppose.userPnlPct

      const result: VaultStats = {
        supportMarketCap: support.marketCap,
        opposeMarketCap: oppose.marketCap,
        supportCount: support.count,
        opposeCount: oppose.count,
        userPnlPct,
      }

      statsCache.set(termId, result)

      // Only update if still the active request
      if (activeTermId.current === termId) {
        setStats(result)
      }
    } catch (err) {
      console.warn('[useVaultTooltip] Failed to fetch stats:', err)
    } finally {
      if (activeTermId.current === termId) {
        setLoading(false)
      }
    }
  }, [walletAddress])

  const clear = useCallback(() => {
    activeTermId.current = null
    setStats(null)
    setLoading(false)
  }, [])

  return { stats, loading, fetchStats, clear }
}

/** Format wei value as ETH with appropriate decimals */
export function formatEth(wei: string): string {
  const val = Number(BigInt(wei)) / 1e18
  if (val === 0) return '0'
  if (val < 0.001) return '<0.001'
  if (val < 1) return val.toFixed(3)
  if (val < 100) return val.toFixed(2)
  return val.toFixed(1)
}
