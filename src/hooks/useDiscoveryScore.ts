/**
 * useDiscoveryScore Hook
 *
 * Thin React wrapper around discoveryScoreService.
 * Delegates all business logic to the service layer.
 */

import { useState, useEffect } from 'react'
import { fetchDiscoveryStats } from '@/services/discoveryScoreService'
import type { DiscoveryStats } from '@/services/discoveryScoreService'

export type { DiscoveryStats }

export function useDiscoveryScore(walletAddress: string | undefined) {
  const [stats, setStats] = useState<DiscoveryStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!walletAddress) return
    setLoading(true)
    fetchDiscoveryStats(walletAddress)
      .then(setStats)
      .catch((err) => console.error('[useDiscoveryScore]', err))
      .finally(() => setLoading(false))
  }, [walletAddress])

  return { stats, loading }
}
