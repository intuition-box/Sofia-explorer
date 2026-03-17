import { useState, useEffect, useCallback } from 'react'
import { fetchAllActivity } from '../services/activityService'
import type { CircleItem } from '../services/circleService'

export function useAllActivity() {
  const [items, setItems] = useState<CircleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchAllActivity(50, 0)
      setItems(data)
    } catch (err) {
      console.error('[useAllActivity]', err)
      setError(err instanceof Error ? err.message : 'Failed to load activity feed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { items, loading, error, refresh: load }
}
