import { useState, useEffect, useRef, useCallback } from 'react'
import { formatEther } from 'viem'
import type { Address } from 'viem'
import { EventFetcher } from '../services/eventFetcher'
import { REFRESH_INTERVAL } from '../config'
import type { TransactionForwardedEvent, AlphaTester, AlphaTestersData } from '../types'

interface WalletEntry {
  address: Address
  tx: number
  intentions: number
  pioneer: number
  trustVolume: bigint
}

function aggregateEvents(events: TransactionForwardedEvent[]): AlphaTestersData {
  const wallets = new Map<string, WalletEntry>()

  let totalTx = 0
  let totalIntentions = 0
  let totalPioneers = 0
  let totalTrustVolume = 0n

  for (const evt of events) {
    const addr = evt.user.toLowerCase()
    let entry = wallets.get(addr)
    if (!entry) {
      entry = { address: evt.user, tx: 0, intentions: 0, pioneer: 0, trustVolume: 0n }
      wallets.set(addr, entry)
    }

    entry.tx++
    totalTx++

    if (evt.operation === 'deposit' || evt.operation === 'depositBatch') {
      entry.intentions++
      totalIntentions++
    }

    if (evt.operation === 'createAtoms') {
      entry.pioneer++
      totalPioneers++
    }

    entry.trustVolume += evt.totalReceived
    totalTrustVolume += evt.totalReceived
  }

  const leaderboard: AlphaTester[] = Array.from(wallets.values()).map((w) => ({
    ...w,
    trustVolumeFormatted: formatEther(w.trustVolume),
  }))

  leaderboard.sort((a, b) => b.tx - a.tx)

  return {
    leaderboard,
    totals: {
      wallets: wallets.size,
      tx: totalTx,
      intentions: totalIntentions,
      pioneers: totalPioneers,
      trustVolume: totalTrustVolume,
    },
  }
}

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
