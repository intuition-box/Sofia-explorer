/**
 * useTopicPositions — reads the canonical per-topic share map maintained by
 * the realtime SubscriptionManager, and re-projects it for the caller's
 * selectedTopics. The queryFn still seeds the cache with a one-shot RPC
 * batch read so the UI has data before the first WS delta arrives; once
 * the WS starts pushing, its derivations overwrite this same key.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { TOPIC_ATOM_IDS } from '@/config/atomIds'
import { getSharesBatch } from '@/services/redeemService'
import { realtimeKeys } from '@/lib/realtime/derivations'

export interface TopicPositionMap {
  /** topicSlug → shares (0n means no position) */
  [topicId: string]: bigint
}

const ALL_TOPIC_TERM_IDS = Object.values(TOPIC_ATOM_IDS)

async function seedTopicPositions(address: string): Promise<TopicPositionMap> {
  const shares = await getSharesBatch(address, ALL_TOPIC_TERM_IDS)
  const result: TopicPositionMap = {}
  for (const [slug, termId] of Object.entries(TOPIC_ATOM_IDS)) {
    const v = shares.get(termId) ?? 0n
    if (v > 0n) result[slug] = v
  }
  return result
}

export function useTopicPositions(selectedTopics: string[]) {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]
  const address = wallet?.address?.toLowerCase()
  const qc = useQueryClient()

  const { data, isLoading, isSuccess, refetch } = useQuery<TopicPositionMap>({
    queryKey: address ? realtimeKeys.topicPositionsMap(address) : ['topic-positions-map', undefined],
    queryFn: () => seedTopicPositions(wallet!.address),
    enabled: authenticated && !!address,
    // WS takes over once connected — trust the cache and don't refetch.
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const positions = data ?? {}

  return {
    positions,
    hasPosition: (topicId: string) => (positions[topicId] ?? 0n) > 0n,
    isPending: (topicId: string) =>
      isSuccess && selectedTopics.includes(topicId) && (positions[topicId] ?? 0n) === 0n,
    isLoading,
    refetch: () => {
      // Also re-seed so next fetch starts from RPC truth if WS lags.
      if (address) qc.invalidateQueries({ queryKey: realtimeKeys.topicPositionsMap(address) })
      return refetch()
    },
  }
}
