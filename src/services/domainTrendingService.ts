import {
  useGetTrendingByPredicateQuery,
  type GetTrendingByPredicateQuery,
} from '@0xsofia/dashboard-graphql'
import { PREDICATE_IDS } from '@/config'
import { getPlatformsByDomain } from '@/config/platformCatalog'
import { extractDomain } from '@/utils/formatting'
import { isValidTriple, tripleToItem } from './trendingService'
import type { IntentCategory, TrendingItemLive } from '@/types'

type TrendingTripleRaw = GetTrendingByPredicateQuery['triples'][number]

const CATEGORIES: { type: IntentCategory; predicateId: string }[] = [
  { type: 'trusted', predicateId: PREDICATE_IDS.TRUSTS },
  { type: 'distrusted', predicateId: PREDICATE_IDS.DISTRUST },
  { type: 'work', predicateId: PREDICATE_IDS.VISITS_FOR_WORK },
  { type: 'learning', predicateId: PREDICATE_IDS.VISITS_FOR_LEARNING },
  { type: 'fun', predicateId: PREDICATE_IDS.VISITS_FOR_FUN },
  { type: 'inspiration', predicateId: PREDICATE_IDS.VISITS_FOR_INSPIRATION },
]

/**
 * Check if a trending triple belongs to a domain's platforms
 */
function matchesDomain(triple: TrendingTripleRaw, domainDomains: Set<string>): boolean {
  const label = triple.object?.label || ''
  const thingUrl = triple.object?.value?.thing?.url
  const url = thingUrl || (label.startsWith('http') ? label : `https://${label}`)
  const domain = extractDomain(url)
  return domainDomains.has(domain)
}

/**
 * Fetch trending items filtered by domain's platforms
 */
export async function fetchTrendingByDomain(domainId: string): Promise<TrendingItemLive[]> {
  // Get all platform domains for this domain
  const platforms = getPlatformsByDomain(domainId)
  const platformDomains = new Set(
    platforms
      .map((p) => p.apiBaseUrl ? extractDomain(p.apiBaseUrl) : '')
      .filter(Boolean)
  )

  // Also add platform names as domains (e.g. "github.com", "stackoverflow.com")
  for (const p of platforms) {
    platformDomains.add(`${p.id}.com`)
    if (p.apiBaseUrl) {
      try {
        const url = new URL(p.apiBaseUrl)
        platformDomains.add(url.hostname)
      } catch { /* ignore */ }
    }
  }

  const promises = CATEGORIES.map(async ({ type, predicateId }) => {
    const data = await useGetTrendingByPredicateQuery.fetcher({
      predicateId,
      limit: 20, // fetch more to have room after filtering
    })()

    const validTriples = (data.triples || []).filter(isValidTriple)

    // Try to find one that matches this domain's platforms
    const domainMatch = validTriples.find((t) => matchesDomain(t, platformDomains))
    const best = domainMatch || validTriples[0]

    return best ? tripleToItem(best, type) : null
  })

  const results = await Promise.allSettled(promises)
  return results
    .filter((r): r is PromiseFulfilledResult<TrendingItemLive | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((item): item is TrendingItemLive => item !== null)
}
