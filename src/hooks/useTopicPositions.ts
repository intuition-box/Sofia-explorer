/**
 * useTopicPositions — tracks on-chain positions for selected topic atoms.
 * Returns a map of topicId → shares (bigint) so the UI can distinguish
 * "pending" (selected locally, no on-chain position) vs "confirmed" topics.
 */

import { useQuery } from '@tanstack/react-query'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { TOPIC_ATOM_IDS } from '@/config/atomIds'
import { getSharesBatch } from '@/services/redeemService'

export interface TopicPositionMap {
  /** topicSlug → shares (0n means no position) */
  [topicId: string]: bigint
}

export function useTopicPositions(selectedTopics: string[]) {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]

  const { data: positions, isLoading, isSuccess, refetch } = useQuery<TopicPositionMap>({
    queryKey: ['topic-positions', wallet?.address, selectedTopics],
    queryFn: async () => {
      if (!wallet?.address || selectedTopics.length === 0) return {}

      // Map topic slugs to their on-chain termIds
      const termIdEntries = selectedTopics
        .filter((id) => TOPIC_ATOM_IDS[id])
        .map((id) => ({ slug: id, termId: TOPIC_ATOM_IDS[id] }))

      if (termIdEntries.length === 0) return {}

      const sharesMap = await getSharesBatch(
        wallet.address,
        termIdEntries.map((e) => e.termId),
      )

      const result: TopicPositionMap = {}
      for (const entry of termIdEntries) {
        result[entry.slug] = sharesMap.get(entry.termId) ?? 0n
      }
      return result
    },
    enabled: authenticated && !!wallet?.address && selectedTopics.length > 0,
    staleTime: 120_000,
    refetchOnWindowFocus: false,
  })

  return {
    /** topicId → shares. Missing key or 0n = no on-chain position */
    positions: positions ?? {},
    /** true if a topic has an on-chain position (shares > 0) */
    hasPosition: (topicId: string) => (positions?.[topicId] ?? 0n) > 0n,
    /** true if a topic is selected locally but has no on-chain position (only after successful fetch) */
    isPending: (topicId: string) =>
      isSuccess && selectedTopics.includes(topicId) && (positions?.[topicId] ?? 0n) === 0n,
    isLoading,
    refetch,
  }
}
