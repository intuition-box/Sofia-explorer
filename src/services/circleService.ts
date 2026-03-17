import {
  useGetCircleFeedQuery,
  useGetFollowingCountQuery,
} from '@0xsofia/dashboard-graphql'
import { PREDICATE_IDS } from '../config'

export interface CircleItem {
  id: string
  title: string
  url: string
  domain: string
  favicon: string
  certifier: string
  intentions: string[]
  timestamp: string
}

const PREDICATE_TO_INTENTION: Record<string, string> = {
  [PREDICATE_IDS.TRUSTS]: 'Trusted',
  [PREDICATE_IDS.DISTRUST]: 'Distrusted',
  [PREDICATE_IDS.VISITS_FOR_WORK]: 'Work',
  [PREDICATE_IDS.VISITS_FOR_LEARNING]: 'Learning',
  [PREDICATE_IDS.VISITS_FOR_FUN]: 'Fun',
  [PREDICATE_IDS.VISITS_FOR_INSPIRATION]: 'Inspiration',
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  }
}

export async function fetchCircleFeed(walletAddress: string): Promise<CircleItem[]> {
  const data = await useGetCircleFeedQuery.fetcher({
    address: walletAddress.toLowerCase(),
  })()

  const positions = data.positions_from_following ?? []

  // Group by object (same page can have multiple intentions)
  const groupedMap = new Map<string, CircleItem>()

  for (const pos of positions) {
    const triple = pos.vault?.term?.triple
    if (!triple) continue

    const objectLabel = triple.object?.label || ''
    const thingUrl = triple.object?.value?.thing?.url
    const url = thingUrl || (objectLabel.startsWith('http') ? objectLabel : `https://${objectLabel}`)
    const domain = extractDomain(url)
    const predicateId = triple.predicate?.term_id || ''
    const intention = PREDICATE_TO_INTENTION[predicateId] || triple.predicate?.label || ''
    const certifier = pos.account?.label || pos.account?.id || ''
    const title = triple.object?.value?.thing?.name || objectLabel || domain

    const key = `${certifier}-${objectLabel}`
    const existing = groupedMap.get(key)

    if (existing) {
      if (intention && !existing.intentions.includes(intention)) {
        existing.intentions.push(intention)
      }
    } else {
      groupedMap.set(key, {
        id: pos.id,
        title,
        url,
        domain,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        certifier,
        intentions: intention ? [intention] : [],
        timestamp: pos.created_at || '',
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
