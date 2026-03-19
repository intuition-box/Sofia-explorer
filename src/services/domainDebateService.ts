import { fetchDebateClaims } from './debateService'
import { DOMAIN_TO_CLAIM_CATEGORY } from '../config/debateConfig'
import type { DebateClaim } from './debateService'

/**
 * Fetch debate claims filtered by the domain's claim category.
 * e.g. domainId "tech-dev" → category "tech" → only tech claims
 */
export async function fetchDomainClaims(domainId: string): Promise<DebateClaim[]> {
  const category = DOMAIN_TO_CLAIM_CATEGORY[domainId]
  const all = await fetchDebateClaims()
  if (!category) return all
  return all.filter((c) => c.category === category)
}
