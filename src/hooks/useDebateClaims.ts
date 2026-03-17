import { useState, useEffect, useCallback } from 'react'
import { fetchDebateClaims, type DebateClaim } from '../services/debateService'

export function useDebateClaims() {
  const [claims, setClaims] = useState<DebateClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchDebateClaims()
      setClaims(data)
    } catch (err) {
      console.error('[useDebateClaims]', err)
      setError(err instanceof Error ? err.message : 'Failed to load claims')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { claims, loading, error, refresh: load }
}
