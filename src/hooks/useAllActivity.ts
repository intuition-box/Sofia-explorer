import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchAllActivity } from '../services/activityService'
import type { CircleItem } from '../services/circleService'

const BATCH_SIZE = 200

export function useAllActivity() {
  const [items, setItems] = useState<CircleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const offsetRef = useRef(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    offsetRef.current = 0

    try {
      const data = await fetchAllActivity(BATCH_SIZE, 0)
      setItems(data)
      offsetRef.current = BATCH_SIZE
      setHasMore(data.length > 0)
    } catch (err) {
      console.error('[useAllActivity]', err)
      setError(err instanceof Error ? err.message : 'Failed to load activity feed')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    try {
      const newItems = await fetchAllActivity(BATCH_SIZE, offsetRef.current)
      if (newItems.length === 0) {
        setHasMore(false)
      } else {
        // Merge and deduplicate by id
        setItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id))
          const unique = newItems.filter((i) => !existingIds.has(i.id))
          return [...prev, ...unique]
        })
        offsetRef.current += BATCH_SIZE
      }
    } catch (err) {
      console.error('[useAllActivity] loadMore', err)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, hasMore])

  useEffect(() => {
    load()
  }, [load])

  return { items, loading, loadingMore, error, hasMore, loadMore, refresh: load }
}
