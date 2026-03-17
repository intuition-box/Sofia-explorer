import { useState, useEffect, useCallback } from 'react'
import { fetchCircleFeed, type CircleItem } from '../services/circleService'

export function useCircleFeed(walletAddress: string | undefined) {
  const [items, setItems] = useState<CircleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!walletAddress) return

    setLoading(true)
    setError(null)

    try {
      const data = await fetchCircleFeed(walletAddress)
      setItems(data)
    } catch (err) {
      console.error('[useCircleFeed]', err)
      setError(err instanceof Error ? err.message : 'Failed to load circle feed')
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    load()
  }, [load])

  return { items, loading, error, refresh: load }
}
