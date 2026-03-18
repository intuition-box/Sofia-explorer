import { useState, useEffect, useCallback } from 'react'
import { useGetSeasonPoolPositionsQuery } from '@0xsofia/dashboard-graphql'
import { SEASON_POOL_TERM_ID, SEASON_POOL_CURVE_ID } from '@/config'
import { processPositions } from '@/services/seasonPoolService'
import type { PoolPosition, VaultStats } from '@/types'

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
