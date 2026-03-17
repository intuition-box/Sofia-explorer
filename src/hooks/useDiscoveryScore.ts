/**
 * useDiscoveryScore Hook
 *
 * Calculates Pioneer / Explorer / Contributor / Trusted counts
 * using the same logic as the Sofia extension:
 *
 * 1. Fetch user's certification triples (positions with "visits for *" + trust/distrust predicates)
 * 2. Fetch all positions for the pages the user certified
 * 3. For each page, count total unique certifiers:
 *    - Pioneer: user is the only certifier (totalCertifiers <= 1)
 *    - Explorer: 2-10 certifiers
 *    - Contributor: 11+ certifiers
 * 4. Trusted: count of trust positions on the user
 */

import { useState, useEffect } from 'react'
import { GRAPHQL_URL } from '../config'

async function gqlRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message)
  return json.data as T
}

const CERTIFICATION_PREDICATE_LABELS = [
  'visits for work',
  'visits for learning',
  'visits for learning ', // legacy trailing space
  'visits for fun',
  'visits for inspiration',
  'visits for buying',
  'visits for music',
  'trusts',
  'distrust',
]

// Step 1: Get user's certification triples
const USER_TRIPLES_QUERY = `
  query UserIntentionTriples(
    $predicateLabels: [String!]!
    $userAddress: String!
    $limit: Int!
    $offset: Int!
  ) {
    triples(
      where: {
        predicate: { label: { _in: $predicateLabels } }
        positions: {
          account_id: { _ilike: $userAddress }
          shares: { _gt: "0" }
        }
      }
      limit: $limit
      offset: $offset
    ) {
      term_id
      predicate { label }
      object { term_id }
    }
  }
`

// Step 2: Get all positions for pages the user certified (to determine rank)
const POSITIONS_BY_OBJECTS_QUERY = `
  query TriplePositionsByObjects(
    $predicateLabels: [String!]!
    $objectTermIds: [String!]!
    $limit: Int!
    $offset: Int!
  ) {
    triples(
      where: {
        predicate: { label: { _in: $predicateLabels } }
        object: { term_id: { _in: $objectTermIds } }
        positions: { shares: { _gt: "0" } }
      }
      limit: $limit
      offset: $offset
    ) {
      object { term_id }
      positions(
        limit: 1000
        where: { shares: { _gt: "0" } }
        order_by: { created_at: asc }
      ) {
        account_id
        created_at
      }
    }
  }
`

// Step 3: Count people who trust this user
const TRUSTED_BY_QUERY = `
  query TrustedBy($userAddress: String!) {
    positions_aggregate(
      where: {
        vault: {
          term: {
            triple: {
              predicate: { label: { _eq: "trusts" } }
              object: { label: { _ilike: $userAddress } }
            }
          }
        }
        shares: { _gt: "0" }
      }
    ) {
      aggregate { count }
    }
  }
`

export interface DiscoveryStats {
  pioneerCount: number
  explorerCount: number
  contributorCount: number
  trustedCount: number
  totalCertifications: number
}

interface Triple {
  term_id: string
  predicate?: { label?: string }
  object?: { term_id?: string }
}

interface PositionTriple {
  object?: { term_id?: string }
  positions?: { account_id?: string; created_at?: string }[]
}

async function fetchAllPages<T>(
  query: string,
  variables: Record<string, unknown>,
  field: string,
  pageSize = 100,
  maxPages = 100,
): Promise<T[]> {
  const all: T[] = []
  for (let page = 0; page < maxPages; page++) {
    const res = await gqlRequest<Record<string, T[]>>(query, {
      ...variables,
      limit: pageSize,
      offset: page * pageSize,
    })
    const items = res[field] || []
    all.push(...items)
    if (items.length < pageSize) break
  }
  return all
}

function buildPagePositionMap(triples: PositionTriple[]) {
  const raw = new Map<string, Map<string, string>>()

  for (const triple of triples) {
    const objectId = triple.object?.term_id
    if (!objectId) continue
    if (!raw.has(objectId)) raw.set(objectId, new Map())
    const accounts = raw.get(objectId)!

    for (const pos of triple.positions || []) {
      const accountId = pos.account_id?.toLowerCase()
      const createdAt = pos.created_at
      if (!accountId || !createdAt) continue
      const existing = accounts.get(accountId)
      if (!existing || createdAt < existing) {
        accounts.set(accountId, createdAt)
      }
    }
  }

  const result = new Map<string, number>()
  for (const [objectId, accounts] of raw) {
    result.set(objectId, accounts.size)
  }
  return result
}

async function fetchDiscoveryStats(walletAddress: string): Promise<DiscoveryStats> {
  const userAddress = walletAddress.toLowerCase()

  // Step 1: Fetch user's certification triples
  const userTriples = await fetchAllPages<Triple>(
    USER_TRIPLES_QUERY,
    { predicateLabels: CERTIFICATION_PREDICATE_LABELS, userAddress },
    'triples',
  )

  if (userTriples.length === 0) {
    return { pioneerCount: 0, explorerCount: 0, contributorCount: 0, trustedCount: 0, totalCertifications: 0 }
  }

  // Step 2: Get unique object term_ids
  const objectTermIds = [...new Set(
    userTriples.map((t) => t.object?.term_id).filter((id): id is string => !!id),
  )]

  // Step 3: Fetch positions for those pages
  const positionTriples = await fetchAllPages<PositionTriple>(
    POSITIONS_BY_OBJECTS_QUERY,
    { predicateLabels: CERTIFICATION_PREDICATE_LABELS, objectTermIds },
    'triples',
  )

  // Step 4: Build position map and calculate ranking
  const pageCertifierCounts = buildPagePositionMap(positionTriples)

  let pioneerCount = 0
  let explorerCount = 0
  let contributorCount = 0
  const processedPages = new Set<string>()

  for (const triple of userTriples) {
    const objectId = triple.object?.term_id
    if (!objectId || processedPages.has(objectId)) continue
    processedPages.add(objectId)

    const totalCertifiers = pageCertifierCounts.get(objectId) || 0
    if (totalCertifiers <= 1) {
      pioneerCount++
    } else if (totalCertifiers <= 10) {
      explorerCount++
    } else {
      contributorCount++
    }
  }

  // Step 5: Fetch trusted count
  let trustedCount = 0
  try {
    const res = await gqlRequest<{
      positions_aggregate: { aggregate: { count: number } }
    }>(TRUSTED_BY_QUERY, { userAddress })
    trustedCount = res.positions_aggregate.aggregate.count
  } catch {
    // non-critical
  }

  return {
    pioneerCount,
    explorerCount,
    contributorCount,
    trustedCount,
    totalCertifications: processedPages.size,
  }
}

export function useDiscoveryScore(walletAddress: string | undefined) {
  const [stats, setStats] = useState<DiscoveryStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!walletAddress) return
    setLoading(true)
    fetchDiscoveryStats(walletAddress)
      .then(setStats)
      .catch((err) => console.error('[useDiscoveryScore]', err))
      .finally(() => setLoading(false))
  }, [walletAddress])

  return { stats, loading }
}
