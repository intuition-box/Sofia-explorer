import { useQuery } from '@tanstack/react-query'
import { fetchTrustCircle } from '../services/trustCircleService'
import type { TrustCircleAccount } from '../services/trustCircleService'

export function useTrustCircle(walletAddress: string | undefined) {
  const { data, isLoading, error } = useQuery<TrustCircleAccount[]>({
    queryKey: ['trustCircle', walletAddress],
    queryFn: () => fetchTrustCircle(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 60_000,
  })

  return {
    accounts: data ?? [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
  }
}
