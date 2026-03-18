import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchUserActivity } from '../services/domainActivityService'
import type { CircleItem } from '../services/circleService'

const BATCH_SIZE = 200

export function useUserActivity(walletAddress: string | undefined) {
  const [items, setItems] = useState<CircleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const offsetRef = useRef(0)

  const load = useCallback(async () => {
    if (!walletAddress) {
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    offsetRef.current = 0

    try {
      const data = await fetchUserActivity(walletAddress, BATCH_SIZE, 0)
      setItems(data)
      offsetRef.current = BATCH_SIZE
      setHasMore(data.length > 0)
    } catch (err) {
      console.error('[useUserActivity]', err)
      setError(err instanceof Error ? err.message : 'Failed to load activity')
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    load()
  }, [load])

  return { items, loading, error, hasMore, refresh: load }
}
