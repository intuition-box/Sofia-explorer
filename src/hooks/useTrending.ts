import { useState, useEffect, useRef } from 'react'
import { fetchTrendingItems } from '@/services/trendingService'
import type { TrendingItemLive } from '@/types'

export function useTrending() {
  const [items, setItems] = useState<TrendingItemLive[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true

    async function fetchAll() {
      try {
        const resolved = await fetchTrendingItems()
        setItems(resolved)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trending')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  return { items, loading, error }
}
