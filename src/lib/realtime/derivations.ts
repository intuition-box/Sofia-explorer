/**
 * Derivations — pure functions that convert raw subscription payloads into
 * the shapes consumed by existing hooks (useTopicPositions, useUserProfile, etc.).
 *
 * Phase 1: stubs only. Called by SubscriptionManager once positions arrive,
 * but for now the canonical ['positions', wallet] cache key is enough.
 *
 * Phase 3 will wire these into existing query keys so migrated hooks read
 * derived state without triggering their own fetch.
 */

import type { WatchUserPositionsSubscription } from '@0xsofia/dashboard-graphql'

type Position = NonNullable<WatchUserPositionsSubscription['positions']>[number]

/**
 * Group positions by topic slug.
 * Used by useTopicPositions — returns Map<topicSlug, totalShares>.
 * TODO(phase-3): import ATOM_ID_TO_TOPIC and resolve object_id → slug.
 */
export function derivePositionsByTopic(positions: Position[]): Record<string, string> {
  const byTopic: Record<string, string> = {}
  // TODO: implement when wiring Phase 3
  void positions
  return byTopic
}

/**
 * Group positions by platform atom. For useSignals / platform-based views.
 * TODO(phase-3): match against PLATFORM_CATALOG term_ids.
 */
export function derivePositionsByPlatform(positions: Position[]): Record<string, string> {
  const byPlatform: Record<string, string> = {}
  void positions
  return byPlatform
}

/**
 * Aggregate stats: total positions, total certifications, verified platforms.
 * Feeds useUserProfile + useDiscoveryScore.
 */
export function deriveUserStats(positions: Position[]): {
  totalPositions: number
  totalCertifications: number
} {
  return {
    totalPositions: positions.length,
    totalCertifications: 0, // TODO(phase-3): count triples with certification predicates
  }
}

/**
 * Extract verified platform IDs from positions whose triple predicate is
 * "has verified {platform} id".
 */
export function deriveVerifiedPlatforms(positions: Position[]): string[] {
  const verified: string[] = []
  void positions
  return verified
}
