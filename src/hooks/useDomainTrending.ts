import { useQuery } from '@tanstack/react-query'
import { fetchTrendingByDomain } from '../services/domainTrendingService'
import type { TrendingItemLive } from '@/types'

export function useDomainTrending(domainId: string | undefined) {
  const { data, isLoading, error } = useQuery<TrendingItemLive[]>({
    queryKey: ['domainTrending', domainId],
    queryFn: () => fetchTrendingByDomain(domainId!),
    enabled: !!domainId,
    staleTime: 120_000,
  })

  return {
    items: data ?? [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  }
}
