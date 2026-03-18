import { useQuery } from '@tanstack/react-query'
import type { CircleItem } from '@/services/circleService'
import { fetchVaultStats, type VaultStats } from '@/services/vaultTooltipService'

export interface TopClaim {
  item: CircleItem
  intention: string
  termId: string
  stats: VaultStats
  totalMarketCap: bigint
}

async function resolveTopClaims(items: CircleItem[], walletAddress: string): Promise<TopClaim[]> {
  // Dedupe by termId — one entry per unique claim
  const seen = new Set<string>()
  const candidates: { item: CircleItem; intention: string; termId: string }[] = []

  for (const item of items) {
    // Skip quest items (Daily Certification, Daily Voter, etc.)
    if (item.intentions.some((i) => i.startsWith('quest:'))) continue
    for (const intent of item.intentions) {
      const vault = item.intentionVaults[intent]
      if (!vault?.termId || seen.has(vault.termId)) continue
      seen.add(vault.termId)
      candidates.push({ item, intention: intent, termId: vault.termId })
    }
  }

  // Fetch vault stats in parallel (max 10)
  const top = candidates.slice(0, 10)
  const results = await Promise.allSettled(
    top.map(async (c) => {
      const stats = await fetchVaultStats(c.termId, walletAddress)
      if (!stats) return null
      const totalMarketCap = BigInt(stats.supportMarketCap) + BigInt(stats.opposeMarketCap)
      return { ...c, stats, totalMarketCap }
    }),
  )

  return results
    .filter((r): r is PromiseFulfilledResult<TopClaim | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((v): v is TopClaim => v !== null && v.totalMarketCap > 0n)
    .sort((a, b) => (b.totalMarketCap > a.totalMarketCap ? 1 : -1))
    .slice(0, 4)
}

export function useTopClaims(items: CircleItem[], walletAddress: string | undefined) {
  const { data, isLoading } = useQuery<TopClaim[]>({
    queryKey: ['topClaims', walletAddress, items.length],
    queryFn: () => resolveTopClaims(items, walletAddress!),
    enabled: !!walletAddress && items.length > 0,
    staleTime: 120_000,
  })

  return { claims: data ?? [], loading: isLoading }
}
