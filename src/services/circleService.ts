import {
  useGetTrustCircleAccountsQuery,
  useGetSofiaTrustedActivityQuery,
  useGetFollowingCountQuery,
} from '@0xsofia/dashboard-graphql'
import { getAddress } from 'viem'
import { SOFIA_PROXY_ADDRESS, PREDICATE_IDS, SUBJECT_IDS } from '../config'

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
  termId?: string
}

const PREDICATE_TO_INTENTION: Record<string, string> = {
  [PREDICATE_IDS.TRUSTS]: 'Trusted',
  [PREDICATE_IDS.DISTRUST]: 'Distrusted',
  [PREDICATE_IDS.VISITS_FOR_WORK]: 'Work',
  [PREDICATE_IDS.VISITS_FOR_LEARNING]: 'Learning',
  [PREDICATE_IDS.VISITS_FOR_FUN]: 'Fun',
  [PREDICATE_IDS.VISITS_FOR_INSPIRATION]: 'Inspiration',
}

const LABEL_TO_INTENTION: Record<string, string> = {
  trusts: 'Trusted',
  distrust: 'Distrusted',
  'visits for work': 'Work',
  'visits for learning': 'Learning',
  'visits for fun': 'Fun',
  'visits for inspiration': 'Inspiration',
  'visits for buying': 'Buying',
  'visits for music': 'Music',
  attending: 'Attending',
  'has value': 'Valued',
}

/** Quest badge config — shared with activityService */
const QUEST_BADGES: Record<string, { name: string; category: string }> = {
  'daily certification': { name: 'Daily Certification', category: 'daily' },
  'daily voter': { name: 'Daily Voter', category: 'daily' },
  'first signal': { name: 'First Signal', category: 'milestone' },
  'first step': { name: 'First Step', category: 'discovery' },
  'first coins': { name: 'First Coins', category: 'gold' },
  'first vote': { name: 'First Vote', category: 'vote' },
  'first follow': { name: 'First Follow', category: 'social' },
  'first trust': { name: 'First Trust', category: 'social' },
  'trailblazer': { name: 'Trailblazer', category: 'discovery' },
  'saver': { name: 'Saver', category: 'gold' },
  'committed': { name: 'Committed', category: 'streak' },
  'dedicated': { name: 'Dedicated', category: 'streak' },
  'relentless': { name: 'Relentless', category: 'streak' },
  'critic': { name: 'Critic', category: 'vote' },
  'judge': { name: 'Judge', category: 'vote' },
  'engaged voter': { name: 'Engaged Voter', category: 'vote' },
  'civic duty': { name: 'Civic Duty', category: 'vote' },
  'signal rookie': { name: 'Signal Rookie', category: 'milestone' },
  'signal maker': { name: 'Signal Maker', category: 'milestone' },
  'centurion': { name: 'Centurion', category: 'milestone' },
  'signal pro': { name: 'Signal Pro', category: 'milestone' },
  'social butterfly': { name: 'Social Butterfly', category: 'social' },
  'networker': { name: 'Networker', category: 'social' },
  'explorer': { name: 'Explorer', category: 'discovery' },
  'pathfinder': { name: 'Pathfinder', category: 'discovery' },
  'collector': { name: 'Collector', category: 'milestone' },
  'gold digger': { name: 'Gold Digger', category: 'gold' },
  'treasurer': { name: 'Treasurer', category: 'gold' },
  'midas touch': { name: 'Midas Touch', category: 'gold' },
  'discord linked': { name: 'Discord Linked', category: 'social' },
  'youtube linked': { name: 'YouTube Linked', category: 'social' },
  'spotify linked': { name: 'Spotify Linked', category: 'social' },
  'twitch linked': { name: 'Twitch Linked', category: 'social' },
  'twitter linked': { name: 'Twitter Linked', category: 'social' },
  'social linked': { name: 'Social Linked', category: 'social' },
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  }
}

function cleanLabel(raw: string): string {
  try { return decodeURIComponent(raw) } catch { return raw.replace(/%20/g, ' ') }
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

    // Handle "has tag" events as quest badges
    if (isTag) {
      const tagName = cleanLabel(objectLabel).toLowerCase()
      const quest = QUEST_BADGES[tagName]
      const displayName = quest?.name ?? cleanLabel(objectLabel)
      const category = quest?.category ?? 'milestone'

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
          intentions: [`quest:${category}`],
          timestamp: evt.created_at || '',
          termId,
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
    } else {
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
        termId,
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
