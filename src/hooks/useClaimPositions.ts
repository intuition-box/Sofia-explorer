import { useQuery } from '@tanstack/react-query'
import { useGetStreakVaultPositionsQuery } from '@0xsofia/dashboard-graphql'

export interface ClaimPosition {
  accountId: string
  label: string
  shares: string
}

async function fetchPositions(termId: string, limit: number): Promise<ClaimPosition[]> {
  const data = await useGetStreakVaultPositionsQuery.fetcher({
    termId,
    curveId: 1,
    limit,
  })()

  return (data.positions ?? []).map((p) => ({
    accountId: p.account?.id ?? '',
    label: p.account?.label ?? p.account?.id?.slice(0, 10) ?? '',
    shares: p.shares ?? '0',
  }))
}

export function useClaimPositions(termId: string | undefined, limit = 3) {
  const { data, isLoading } = useQuery<ClaimPosition[]>({
    queryKey: ['claimPositions', termId, limit],
    queryFn: () => fetchPositions(termId!, limit),
    enabled: !!termId,
    staleTime: 120_000,
  })

  return { positions: data ?? [], loading: isLoading }
}
