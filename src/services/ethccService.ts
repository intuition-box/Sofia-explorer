/**
 * EthCC Wallet Service
 *
 * Fetches on-chain EthCC positions (topic votes + track interests)
 * and maps them to Sofia topic/category signals.
 */

import { useGetEthccPositionsQuery } from '@0xsofia/dashboard-graphql'
import {
  ETHCC_TOPIC_ATOM_IDS,
  ETHCC_TRACK_ATOM_IDS,
  getTopicSofiaMapping,
  ETHCC_TRACK_TO_SOFIA,
} from '../config/ethccMapping'
import type {
  EthccTopicVote,
  EthccTrackInterest,
  EthccSofiaSignals,
  TopicEthccSignal,
} from '../types/reputation'

const STORAGE_KEY = 'sofia_ethcc_wallet'

// ── LocalStorage ──

export function getEthccWalletAddress(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setEthccWalletAddress(address: string): void {
  localStorage.setItem(STORAGE_KEY, address.toLowerCase())
}

export function clearEthccWalletAddress(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// ── Fetch positions from Intuition GraphQL ──

async function fetchPositionsByTermIds(
  address: string,
  termIds: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>()

  // Batch in chunks of 50 to avoid query limits
  const BATCH = 50
  for (let i = 0; i < termIds.length; i += BATCH) {
    const batch = termIds.slice(i, i + BATCH)
    const data = await useGetEthccPositionsQuery.fetcher({
      address,
      termIds: batch,
    })()

    for (const pos of data.positions ?? []) {
      const termId = pos.vault?.term_id
      if (termId && pos.shares) {
        result.set(termId, pos.shares)
      }
    }
  }

  return result
}

// ── Map raw positions to Sofia signals ──

export async function fetchEthccSignals(
  address: string,
): Promise<EthccSofiaSignals> {
  // Build reverse lookup: termId → topicSlug / trackName
  const topicByTermId = new Map<string, string>()
  for (const [slug, termId] of Object.entries(ETHCC_TOPIC_ATOM_IDS)) {
    topicByTermId.set(termId, slug)
  }
  const trackByTermId = new Map<string, string>()
  for (const [name, termId] of Object.entries(ETHCC_TRACK_ATOM_IDS)) {
    trackByTermId.set(termId, name)
  }

  // Fetch both in parallel
  const [topicPositions, trackPositions] = await Promise.all([
    fetchPositionsByTermIds(address, Object.values(ETHCC_TOPIC_ATOM_IDS)),
    fetchPositionsByTermIds(address, Object.values(ETHCC_TRACK_ATOM_IDS)),
  ])

  // Map topic votes
  const topicVotes: EthccTopicVote[] = []
  for (const [termId, shares] of topicPositions) {
    const slug = topicByTermId.get(termId)
    if (!slug) continue
    const mappings = getTopicSofiaMapping(slug)
    for (const m of mappings) {
      topicVotes.push({
        topicSlug: slug,
        shares,
        topicId: m.topicId,
        categoryId: m.categoryId,
      })
    }
  }

  // Map track interests
  const trackInterests: EthccTrackInterest[] = []
  for (const [termId, shares] of trackPositions) {
    const trackName = trackByTermId.get(termId)
    if (!trackName) continue
    const mapping = ETHCC_TRACK_TO_SOFIA[trackName]
    if (!mapping) continue
    trackInterests.push({
      trackName,
      shares,
      topicId: mapping.topicId,
      categoryId: mapping.categoryId,
    })
  }

  // Aggregate per topic
  const topicSignals: Record<string, TopicEthccSignal> = {}

  for (const tv of topicVotes) {
    const ds = topicSignals[tv.topicId] ??= {
      topicCount: 0,
      trackCount: 0,
      totalShares: '0',
      categoryIds: [],
    }
    ds.topicCount++
    ds.totalShares = (BigInt(ds.totalShares) + BigInt(tv.shares)).toString()
    if (!ds.categoryIds.includes(tv.categoryId)) {
      ds.categoryIds.push(tv.categoryId)
    }
  }

  for (const ti of trackInterests) {
    const ds = topicSignals[ti.topicId] ??= {
      topicCount: 0,
      trackCount: 0,
      totalShares: '0',
      categoryIds: [],
    }
    ds.trackCount++
    ds.totalShares = (BigInt(ds.totalShares) + BigInt(ti.shares)).toString()
    if (!ds.categoryIds.includes(ti.categoryId)) {
      ds.categoryIds.push(ti.categoryId)
    }
  }

  return { topicVotes, trackInterests, topicSignals }
}
