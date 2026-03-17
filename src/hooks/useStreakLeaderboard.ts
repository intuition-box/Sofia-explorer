import { useState, useEffect, useCallback } from 'react'
import { fetchStreakLeaderboard, type StreakEntry } from '../services/streakService'

export function useStreakLeaderboard() {
  const [entries, setEntries] = useState<StreakEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchStreakLeaderboard()
      setEntries(data)
      setError(null)
    } catch (err) {
      console.error('[useStreakLeaderboard]', err)
      setError(err instanceof Error ? err.message : 'Failed to load streaks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { entries, loading, error, refresh: load }
}
