/**
 * Derivations — pure functions that convert raw subscription payloads into
 * the shapes consumed by existing hooks (useTopicPositions, useUserProfile, etc.).
 *
 * The SubscriptionManager pipes WatchUserPositions payloads through each
 * derivation and writes the result under a canonical query key. Hooks read
 * from those keys with staleTime:Infinity instead of fetching themselves.
 */

import type { WatchUserPositionsSubscription } from '@0xsofia/dashboard-graphql'
import {
  TOPIC_ATOM_IDS,
  CATEGORY_ATOM_IDS,
  ATOM_ID_TO_PLATFORM,
} from '@/config/atomIds'

export type Position = NonNullable<WatchUserPositionsSubscription['positions']>[number]

// ── Query key builders (single source of truth) ─────────────────────────────

export const realtimeKeys = {
  positions: (wallet: string) => ['positions', wallet] as const,
  topicPositionsMap: (wallet: string) => ['topic-positions-map', wallet] as const,
  categoryPositionsMap: (wallet: string) => ['category-positions-map', wallet] as const,
  verifiedPlatforms: (wallet: string) => ['verified-platforms', wallet] as const,
  userProfileDerived: (wallet: string) => ['user-profile-derived', wallet] as const,
  userStats: (wallet: string) => ['user-stats', wallet] as const,
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function toBigInt(v: unknown): bigint {
  if (typeof v === 'bigint') return v
  if (typeof v === 'number') return BigInt(Math.trunc(v))
  if (typeof v === 'string' && v.length > 0) {
    try { return BigInt(v) } catch { return 0n }
  }
  return 0n
}

// ── Topic / category positions (atom-direct) ────────────────────────────────

/**
 * Group shares by topic slug. Positions that target a topic atom directly
 * (not a triple) contribute to their slug's total.
 */
export function derivePositionsByTopic(positions: Position[]): Record<string, bigint> {
  const termIdToSlug = new Map<string, string>()
  for (const [slug, termId] of Object.entries(TOPIC_ATOM_IDS)) {
    termIdToSlug.set(termId, slug)
  }
  const byTopic: Record<string, bigint> = {}
  for (const p of positions) {
    if (!p.vault?.term?.atom) continue
    const slug = termIdToSlug.get(p.term_id)
    if (!slug) continue
    byTopic[slug] = (byTopic[slug] ?? 0n) + toBigInt(p.shares)
  }
  return byTopic
}

/**
 * Group shares by category slug. Same logic as topics, different atom set.
 */
export function derivePositionsByCategory(positions: Position[]): Record<string, bigint> {
  const termIdToSlug = new Map<string, string>()
  for (const [slug, termId] of Object.entries(CATEGORY_ATOM_IDS)) {
    termIdToSlug.set(termId, slug)
  }
  const byCategory: Record<string, bigint> = {}
  for (const p of positions) {
    if (!p.vault?.term?.atom) continue
    const slug = termIdToSlug.get(p.term_id)
    if (!slug) continue
    byCategory[slug] = (byCategory[slug] ?? 0n) + toBigInt(p.shares)
  }
  return byCategory
}

// ── Platform verifications (triple-based) ───────────────────────────────────

const VERIFIED_PREDICATE_RE = /has verified (\w+) id/i

/**
 * Platforms the user has verified, derived from triples whose predicate
 * matches "has verified {platform} id".
 */
export function deriveVerifiedPlatforms(positions: Position[]): string[] {
  const set = new Set<string>()
  for (const p of positions) {
    const predLabel = p.vault?.term?.triple?.predicate?.label
    if (!predLabel) continue
    const m = predLabel.match(VERIFIED_PREDICATE_RE)
    if (m?.[1]) set.add(m[1].toLowerCase())
  }
  return [...set]
}

/**
 * Platform-atom direct positions (e.g. a deposit on the "github" atom).
 * Keyed by platform slug from ATOM_ID_TO_PLATFORM.
 */
export function derivePositionsByPlatform(positions: Position[]): Record<string, bigint> {
  const byPlatform: Record<string, bigint> = {}
  for (const p of positions) {
    if (!p.vault?.term?.atom) continue
    const slug = ATOM_ID_TO_PLATFORM.get(p.term_id)
    if (!slug) continue
    byPlatform[slug] = (byPlatform[slug] ?? 0n) + toBigInt(p.shares)
  }
  return byPlatform
}

// ── User profile / stats ────────────────────────────────────────────────────

export interface UserPositionView {
  termId: string
  shares: string
  currentSharePrice: string
  isTriple: boolean
  predicateLabel?: string
  objectLabel?: string
  objectUrl?: string
  tripleSubjectId?: string
  tripleObjectId?: string
  atomLabel?: string
  atomUrl?: string
}

export interface UserStats {
  totalPositions: number
  totalAtomPositions: number
  totalTriplePositions: number
  totalStaked: number
  verifiedPlatforms: string[]
}

/**
 * Shape consumed by useUserProfile — the same as profileService.UserProfileData
 * minus totalCertifications, which comes from a separate signals aggregate query
 * that still follows a pull pattern.
 */
export interface UserProfileDerived {
  positions: UserPositionView[]
  totalPositions: number
  totalAtomPositions: number
  totalStaked: number
  verifiedPlatforms: string[]
}

export function deriveUserProfile(positions: Position[]): UserProfileDerived {
  const views: UserPositionView[] = positions.map((p) => {
    const atom = p.vault?.term?.atom
    const triple = p.vault?.term?.triple
    return {
      termId: atom?.term_id ?? triple?.term_id ?? p.term_id,
      shares: String(p.shares ?? '0'),
      currentSharePrice: String(p.vault?.current_share_price ?? '0'),
      isTriple: !!triple,
      predicateLabel: triple?.predicate?.label ?? undefined,
      objectLabel: triple?.object?.label ?? atom?.label ?? undefined,
      objectUrl:
        triple?.object?.value?.thing?.url ??
        atom?.value?.thing?.url ??
        undefined,
      tripleSubjectId: triple?.subject?.term_id,
      tripleObjectId: triple?.object?.term_id,
      atomLabel: atom?.label ?? undefined,
      atomUrl: atom?.value?.thing?.url ?? undefined,
    }
  })

  const totalStaked =
    Math.round(
      positions.reduce((sum, p) => {
        const shares = parseFloat(String(p.shares ?? '0')) || 0
        const price = parseFloat(String(p.vault?.current_share_price ?? '0')) || 0
        return sum + (shares * price) / 1e18
      }, 0) * 100,
    ) / 100

  const atomCount = positions.filter(
    (p) => p.vault?.term?.atom && !p.vault?.term?.triple,
  ).length

  return {
    positions: views,
    totalPositions: positions.length,
    totalAtomPositions: atomCount,
    totalStaked,
    verifiedPlatforms: deriveVerifiedPlatforms(positions),
  }
}

export function deriveUserStats(positions: Position[]): UserStats {
  const tripleCount = positions.filter((p) => p.vault?.term?.triple).length
  const atomCount = positions.length - tripleCount
  const totalStaked =
    Math.round(
      positions.reduce((sum, p) => {
        const shares = parseFloat(String(p.shares ?? '0')) || 0
        const price = parseFloat(String(p.vault?.current_share_price ?? '0')) || 0
        return sum + (shares * price) / 1e18
      }, 0) * 100,
    ) / 100

  return {
    totalPositions: positions.length,
    totalAtomPositions: atomCount,
    totalTriplePositions: tripleCount,
    totalStaked,
    verifiedPlatforms: deriveVerifiedPlatforms(positions),
  }
}
