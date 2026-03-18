import { useState, useEffect, useCallback } from 'react'
import { formatEther } from 'viem'
import type { Address } from 'viem'
import {
  useGetSeasonPoolPositionsQuery,
  type GetSeasonPoolPositionsQuery,
} from '@0xsofia/dashboard-graphql'
import { SEASON_POOL_TERM_ID, SEASON_POOL_CURVE_ID } from '../config'
import type { PoolPosition, VaultStats } from '../types'

type VaultRaw = GetSeasonPoolPositionsQuery['vaults'][number]

function processPositions(vault: VaultRaw): { positions: PoolPosition[]; vaultStats: VaultStats } {
  const sharePrice = BigInt(vault.current_share_price || '0')

  const positions: PoolPosition[] = (vault.positions || [])
    .filter((p) => BigInt(p.shares || '0') > 0n)
    .map((p) => {
      const shares = BigInt(p.shares || '0')
      const totalDeposited = BigInt(p.total_deposit_assets_after_total_fees || '0')
      const totalRedeemed = BigInt(p.total_redeem_assets_for_receiver || '0')
      const currentValue = (shares * sharePrice) / 10n ** 18n
      const netDeposited = totalDeposited - totalRedeemed
      const pnl = currentValue - netDeposited
      const pnlPercent =
        netDeposited > 0n ? Number((pnl * 10000n) / netDeposited) / 100 : 0

      return {
        address: p.account_id as Address,
        shares,
        sharesFormatted: formatEther(shares),
        currentValue,
        currentValueFormatted: formatEther(currentValue),
        netDeposited,
        pnl,
        pnlFormatted: formatEther(pnl),
        pnlPercent,
      }
    })

  positions.sort((a, b) => b.currentValue > a.currentValue ? -1 : b.currentValue < a.currentValue ? 1 : 0)

  return {
    positions,
    vaultStats: {
      totalStakers: vault.position_count || 0,
      tvl: BigInt(vault.total_assets || '0'),
      sharePrice,
    },
  }
}

export function useSeasonPool(enabled: boolean) {
  const [data, setData] = useState<PoolPosition[] | null>(null)
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetched, setFetched] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await useGetSeasonPoolPositionsQuery.fetcher({
        termId: SEASON_POOL_TERM_ID,
        curveId: SEASON_POOL_CURVE_ID,
      })()

      const vault = result?.vaults?.[0]
      if (!vault) {
        setData([])
        setVaultStats(null)
        return
      }

      const processed = processPositions(vault)
      setData(processed.positions)
      setVaultStats(processed.vaultStats)
      setError(null)
      setFetched(true)
    } catch (err) {
      console.error('[useSeasonPool]', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (enabled && !fetched) {
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, fetched])

  return { data, vaultStats, loading, error }
}
