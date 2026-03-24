import { useQuery } from '@tanstack/react-query'
import { fetchDomainClaims } from '../services/domainDebateService'
import type { DebateClaim } from '../services/debateService'

export function useDomainClaims(topicId: string | undefined) {
  const { data, isLoading, error } = useQuery<DebateClaim[]>({
    queryKey: ['domainClaims', topicId],
    queryFn: () => fetchDomainClaims(topicId!),
    enabled: !!topicId,
    staleTime: 120_000,
  })

  return {
    claims: data ?? [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  }
}
