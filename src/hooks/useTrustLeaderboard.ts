import { useQuery } from '@tanstack/react-query'
import { fetchEigentrustRanking } from '@/services/mcpTrustService'
import type { EigentrustEntry } from '@/services/mcpTrustService'

export function useTrustLeaderboard() {
  const { data, isLoading, error } = useQuery<EigentrustEntry[]>({
    queryKey: ['trustLeaderboard'],
    queryFn: () => fetchEigentrustRanking(50),
    staleTime: 600_000,
    retry: 1,
  })

  return {
    rankings: data ?? [],
    loading: isLoading,
    error: error ? String(error) : null,
  }
}
