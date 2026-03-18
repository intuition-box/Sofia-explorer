import { fetchDebateClaims } from './debateService'
import type { DebateClaim } from './debateService'

/**
 * Fetch debate claims — currently returns all claims.
 * Will filter by domain once claim → domain mapping is added to config.
 */
export async function fetchDomainClaims(_domainId: string): Promise<DebateClaim[]> {
  return fetchDebateClaims()
}
