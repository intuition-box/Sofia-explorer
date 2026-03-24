import { useMemo } from 'react'
import { DOMAIN_BY_ID } from '@/config/taxonomy'
import { computeReputationProfile } from '@/services/reputationScoreService'
import type { ConnectionStatus, UserReputationProfile, EthccSofiaSignals } from '@/types/reputation'

export function useReputationScores(
  getStatus: (platformId: string) => ConnectionStatus,
  selectedDomains: string[],
  selectedNiches: string[],
  ethccSignals?: EthccSofiaSignals | null,
): UserReputationProfile | null {
  return useMemo(
    () => computeReputationProfile(getStatus, selectedDomains, selectedNiches, ethccSignals),
    [getStatus, selectedDomains, selectedNiches, ethccSignals],
  )
}

export function useDomainLabel(domainId: string): string {
  return DOMAIN_BY_ID.get(domainId)?.label ?? domainId
}
