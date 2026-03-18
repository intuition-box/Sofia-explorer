import {
  useGetTrustCircleAccountsQuery,
  useGetSofiaTrustedActivityQuery,
  useGetFollowingCountQuery,
} from '@0xsofia/dashboard-graphql'
import { getAddress } from 'viem'
import { SOFIA_PROXY_ADDRESS, PREDICATE_IDS, SUBJECT_IDS } from '../config'
import { PREDICATE_TO_INTENTION, LABEL_TO_INTENTION, QUEST_BADGES } from '../config/intentions'
import { extractDomain, cleanLabel } from '../utils/formatting'

export interface CircleItem {
  id: string
  title: string
  url: string
  domain: string
  favicon: string
  certifier: string
  certifierAddress: string
  intentions: string[]
  timestamp: string
  intentionVaults: Record<string, { termId: string; counterTermId: string }>
}

// Cache trusted wallets so we don't re-fetch on every loadMore
let cachedTrustedWallets: string[] | null = null
let cachedForAddress: string | null = null

/** Step 1: Get wallets the user has trusted */
async function fetchTrustedWallets(walletAddress: string): Promise<string[]> {
  if (cachedForAddress === walletAddress.toLowerCase() && cachedTrustedWallets) {
    return cachedTrustedWallets
  }

  const data = await useGetTrustCircleAccountsQuery.fetcher({
    subjectId: SUBJECT_IDS.I,
    predicateId: PREDICATE_IDS.TRUSTS,
    walletAddress: walletAddress.toLowerCase(),
  })()

  const wallets: string[] = []
  for (const triple of data.triples ?? []) {
    const accounts = triple.object?.accounts ?? []
    for (const acc of accounts) {
      if (acc.id) wallets.push(acc.id)
    }
  }

  cachedTrustedWallets = wallets
  cachedForAddress = walletAddress.toLowerCase()
  return wallets
}

/** Step 2: Get activity from trusted wallets */
export async function fetchCircleFeed(
  walletAddress: string,
  limit: number = 200,
  offset: number = 0,
): Promise<CircleItem[]> {
  const trustedWallets = await fetchTrustedWallets(walletAddress)
  if (trustedWallets.length === 0) return []

  // GraphQL stores addresses in checksum case
  const checksumWallets = trustedWallets.map((w) => getAddress(w))

  const data = await useGetSofiaTrustedActivityQuery.fetcher({
    trustedWallets: checksumWallets,
    proxy: getAddress(SOFIA_PROXY_ADDRESS),
    limit,
    offset,
  })()

  const events = data.events ?? []
  const groupedMap = new Map<string, CircleItem>()

  for (const evt of events) {
    const triple = evt.triple
    if (!triple) continue

    const objectLabel = triple.object?.label || ''
    const thingUrl = triple.object?.value?.thing?.url
    const hasRealUrl = thingUrl || objectLabel.startsWith('http') || objectLabel.includes('.')
    const url = thingUrl || (objectLabel.startsWith('http') ? objectLabel : hasRealUrl ? `https://${objectLabel}` : '')
    const domain = url ? extractDomain(url) : ''

    const predicateId = triple.predicate?.term_id || ''
    const predicateLabel = triple.predicate?.label || ''
    const isTag = predicateLabel.toLowerCase() === 'has tag'

    const certifierAddress = evt.deposit?.receiver?.id || evt.redemption?.sender?.id || ''
    const certifier = evt.deposit?.receiver?.label || evt.redemption?.sender?.label || certifierAddress

    const termId = triple.term_id || ''
    const counterTermId = triple.counter_term_id || ''

    // Handle "has tag" events as quest badges
    if (isTag) {
      const tagName = cleanLabel(objectLabel).toLowerCase()
      const quest = QUEST_BADGES[tagName]
      const displayName = quest?.name ?? cleanLabel(objectLabel)
      const category = quest?.category ?? 'milestone'
      const questIntention = `quest:${category}`

      const key = `${certifierAddress}-${objectLabel}`
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          id: evt.id,
          title: displayName,
          url: '',
          domain: displayName,
          favicon: '',
          certifier,
          certifierAddress,
          intentions: [questIntention],
          timestamp: evt.created_at || '',
          intentionVaults: { [questIntention]: { termId, counterTermId } },
        })
      }
      continue
    }

    const intention =
      PREDICATE_TO_INTENTION[predicateId] ||
      LABEL_TO_INTENTION[predicateLabel.toLowerCase()] ||
      predicateLabel ||
      ''

    const rawTitle = triple.object?.value?.thing?.name || objectLabel || domain
    const title = cleanLabel(rawTitle)

    const key = `${certifierAddress}-${objectLabel}`
    const existing = groupedMap.get(key)

    if (existing) {
      if (intention && !existing.intentions.includes(intention)) {
        existing.intentions.push(intention)
      }
      if (intention) {
        existing.intentionVaults[intention] = { termId, counterTermId }
      }
    } else {
      const intentionVaults: Record<string, { termId: string; counterTermId: string }> = {}
      if (intention) intentionVaults[intention] = { termId, counterTermId }
      groupedMap.set(key, {
        id: evt.id,
        title,
        url,
        domain,
        favicon: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '',
        certifier,
        certifierAddress,
        intentions: intention ? [intention] : [],
        timestamp: evt.created_at || '',
        intentionVaults,
      })
    }
  }

  return Array.from(groupedMap.values())
}

export async function fetchFollowingCount(walletAddress: string): Promise<number> {
  try {
    const data = await useGetFollowingCountQuery.fetcher({
      address: walletAddress.toLowerCase(),
    })()
    return data.following_aggregate?.aggregate?.count ?? 0
  } catch {
    return 0
  }
}
