import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchCircleFeed, type CircleItem } from '../services/circleService'
import { fetchWithRetry } from '../utils/fetchRetry'

const BATCH_SIZE = 200

export function useCircleFeed(walletAddress: string | undefined) {
  const [items, setItems] = useState<CircleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const offsetRef = useRef(0)

  const load = useCallback(async () => {
    if (!walletAddress) return

    setLoading(true)
    setError(null)
    offsetRef.current = 0

    try {
      const data = await fetchWithRetry(() => fetchCircleFeed(walletAddress!, BATCH_SIZE, 0))
      setItems(data)
      offsetRef.current = BATCH_SIZE
      setHasMore(data.length > 0)
    } catch (err) {
      console.error('[useCircleFeed]', err)
      setError(err instanceof Error ? err.message : 'Failed to load circle feed')
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  const loadMore = useCallback(async () => {
    if (!walletAddress || loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const newItems = await fetchCircleFeed(walletAddress, BATCH_SIZE, offsetRef.current)
      if (newItems.length === 0) {
        setHasMore(false)
      } else {
        setItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id))
          const unique = newItems.filter((i) => !existingIds.has(i.id))
          return [...prev, ...unique]
        })
        offsetRef.current += BATCH_SIZE
      }
    } catch (err) {
      console.error('[useCircleFeed] loadMore', err)
    } finally {
      setLoadingMore(false)
    }
  }, [walletAddress, loadingMore, hasMore])

  useEffect(() => {
    load()
  }, [load])

  return { items, loading, loadingMore, error, hasMore, loadMore, refresh: load }
}
