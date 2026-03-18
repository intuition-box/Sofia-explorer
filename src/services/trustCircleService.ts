import { useGetTrustCircleAccountsQuery } from '@0xsofia/dashboard-graphql'
import { SUBJECT_IDS, PREDICATE_IDS } from '../config'

export interface TrustCircleAccount {
  termId: string
  label: string
  image: string | null
  shares: bigint
  trustAmount: number
}

/**
 * Fetch accounts the user has trusted (I → TRUSTS → Account with positions)
 */
export async function fetchTrustCircle(walletAddress: string): Promise<TrustCircleAccount[]> {
  const data = await useGetTrustCircleAccountsQuery.fetcher({
    subjectId: SUBJECT_IDS.I,
    predicateId: PREDICATE_IDS.TRUSTS,
    walletAddress: walletAddress.toLowerCase(),
  })()

  const accounts: TrustCircleAccount[] = []

  for (const triple of data.triples ?? []) {
    // Only keep triples where user has shares > 0
    const totalShares = (triple.term?.vaults ?? []).reduce((sum, vault) => {
      return vault.positions.reduce((s, p) => s + BigInt(p.shares || '0'), sum)
    }, 0n)

    if (totalShares <= 0n) continue

    const obj = triple.object
    if (!obj) continue

    const account = obj.accounts?.[0]

    accounts.push({
      termId: obj.term_id,
      label: account?.label ?? obj.label ?? obj.term_id.slice(0, 10),
      image: account?.image ?? null,
      shares: totalShares,
      trustAmount: Number(totalShares) / 1e18,
    })
  }

  // Sort by trust amount descending
  accounts.sort((a, b) => b.trustAmount - a.trustAmount)
  return accounts
}
