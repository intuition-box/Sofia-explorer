/**
 * useTopicSync — orchestrates on-chain sync for topic selections.
 *
 * - When a topic is selected locally but has no on-chain position → adds it to cart
 * - When a topic is deselected and has an on-chain position → triggers redeem
 * - Works without wallet: selections stay local, pending deposits accumulate
 *   and can be confirmed once a wallet is connected.
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useTopicSelection } from './useDomainSelection'
import { useTopicPositions } from './useTopicPositions'
import { useCart } from './useCart'
import { redeemAtom } from '@/services/redeemService'
import { TOPIC_ATOM_IDS } from '@/config/atomIds'
import { TOPIC_META } from '@/config/topicMeta'
import { SOFIA_TOPICS } from '@/config/taxonomy'

// ── Helpers ──

const TOPIC_EMOJIS: Record<string, string> = {
  'tech-dev': '💻',
  'design-creative': '🎨',
  'music-audio': '🎵',
  gaming: '🎮',
  'web3-crypto': '⛓️',
  science: '🔬',
  'sport-health': '🏋️',
  'video-cinema': '📹',
  entrepreneurship: '🚀',
  'performing-arts': '🎭',
  'nature-environment': '🌿',
  'food-lifestyle': '🍽️',
  literature: '📚',
  'personal-dev': '🧠',
}

function getTopicLabel(topicId: string): string {
  return SOFIA_TOPICS.find((t) => t.id === topicId)?.label ?? topicId
}

function makeCartItemId(topicId: string) {
  return `topic-${topicId}-support`
}

// ── Hook ──

export interface RedeemState {
  topicId: string
  loading: boolean
  error?: string
}

export function useTopicSync() {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]

  const { selectedTopics, toggleTopic } = useTopicSelection()
  const { positions, hasPosition, isPending, isLoading: positionsLoading, refetch } = useTopicPositions(selectedTopics)
  const cart = useCart()

  const [redeemState, setRedeemState] = useState<RedeemState | null>(null)

  // Track previous selections to detect removals
  const prevSelectedRef = useRef<string[]>(selectedTopics)

  // ── Auto-add pending topics to cart ──
  useEffect(() => {
    if (positionsLoading) return

    for (const topicId of selectedTopics) {
      const termId = TOPIC_ATOM_IDS[topicId]
      if (!termId) continue

      // Only add if pending (no on-chain position) and not already in cart
      if (!isPending(topicId)) continue

      const cartId = makeCartItemId(topicId)
      if (cart.items.some((item) => item.id === cartId)) continue

      const meta = TOPIC_META[topicId]
      cart.addItem({
        id: cartId,
        side: 'support',
        termId,
        intention: 'Interest',
        title: getTopicLabel(topicId),
        favicon: TOPIC_EMOJIS[topicId] ?? '📌',
        intentionColor: meta?.color ?? '#888',
      })
    }
  }, [selectedTopics, positions, positionsLoading])

  // ── Detect topic removal → trigger redeem ──
  useEffect(() => {
    const prev = prevSelectedRef.current
    prevSelectedRef.current = selectedTopics

    // Find topics that were in prev but not in current
    const removed = prev.filter((id) => !selectedTopics.includes(id))

    for (const topicId of removed) {
      // Remove from cart if it was pending
      const cartId = makeCartItemId(topicId)
      cart.removeItem(cartId)
    }
  }, [selectedTopics])

  // ── Redeem a topic position ──
  const redeemTopic = useCallback(async (topicId: string) => {
    if (!wallet || !authenticated) return

    const termId = TOPIC_ATOM_IDS[topicId]
    if (!termId) return

    setRedeemState({ topicId, loading: true })

    try {
      const result = await redeemAtom(wallet, termId)
      if (!result.success) {
        setRedeemState({ topicId, loading: false, error: result.error })
        return
      }
      // Redeem succeeded → remove from local selection
      toggleTopic(topicId)
      setRedeemState(null)
      refetch()
    } catch (err: any) {
      setRedeemState({
        topicId,
        loading: false,
        error: err?.message || 'Redeem failed',
      })
    }
  }, [wallet, authenticated, toggleTopic, refetch])

  // ── Remove a topic (deselect + redeem if needed) ──
  const removeTopic = useCallback((topicId: string) => {
    if (hasPosition(topicId)) {
      // Has on-chain position → need to redeem first
      redeemTopic(topicId)
    } else {
      // No on-chain position → just remove locally + from cart
      toggleTopic(topicId)
    }
  }, [hasPosition, redeemTopic, toggleTopic])

  return {
    selectedTopics,
    toggleTopic,
    removeTopic,
    hasPosition,
    isPending,
    positions,
    positionsLoading,
    redeemState,
    clearRedeemError: () => setRedeemState(null),
    refetchPositions: refetch,
  }
}
