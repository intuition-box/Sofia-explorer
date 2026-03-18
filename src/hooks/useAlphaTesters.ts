import { useState, useEffect, useRef, useCallback } from 'react'
import { EventFetcher } from '@/services/eventFetcher'
import { REFRESH_INTERVAL } from '@/config'
import { aggregateEvents } from '@/services/alphaTestersService'
import type { AlphaTestersData } from '@/types'

const INITIAL_DATA: AlphaTestersData = {
  leaderboard: [],
  totals: { wallets: 0, tx: 0, intentions: 0, pioneers: 0, trustVolume: 0n },
}

export function useAlphaTesters() {
  const fetcherRef = useRef<EventFetcher | null>(null)
  const [data, setData] = useState<AlphaTestersData>(INITIAL_DATA)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      if (!fetcherRef.current) {
        fetcherRef.current = new EventFetcher()
      }
      const events = await fetcherRef.current.fetch()
      setData(aggregateEvents(events))
      setError(null)
    } catch (err) {
      console.error('[useAlphaTesters]', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, REFRESH_INTERVAL)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ...data, loading, error }
}
