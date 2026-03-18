import { useMemo } from 'react'
import { DOMAIN_BY_ID } from '@/config/taxonomy'
import { computeReputationProfile } from '@/services/reputationScoreService'
import type { ConnectionStatus, UserReputationProfile } from '@/types/reputation'

export function useReputationScores(
  getStatus: (platformId: string) => ConnectionStatus,
  selectedDomains: string[],
  selectedNiches: string[],
): UserReputationProfile | null {
  return useMemo(
    () => computeReputationProfile(getStatus, selectedDomains, selectedNiches),
    [getStatus, selectedDomains, selectedNiches],
  )
}

export function useDomainLabel(domainId: string): string {
  return DOMAIN_BY_ID.get(domainId)?.label ?? domainId
}
