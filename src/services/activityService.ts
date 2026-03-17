import {
  useGetAllActivityQuery,
} from '@0xsofia/dashboard-graphql'
import { SOFIA_PROXY_ADDRESS, PREDICATE_IDS } from '../config'
import type { CircleItem } from './circleService'

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
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  }
}

export async function fetchAllActivity(
  limit: number = 50,
  offset: number = 0,
): Promise<CircleItem[]> {
  const data = await useGetAllActivityQuery.fetcher({
    proxy: SOFIA_PROXY_ADDRESS.toLowerCase(),
    limit,
    offset,
  })()

  const events = data.events ?? []

  // Group by (certifier + page) to merge multiple intentions per page
  const groupedMap = new Map<string, CircleItem>()

  for (const evt of events) {
    const triple = evt.triple
    if (!triple) continue

    const objectLabel = triple.object?.label || ''
    const thingUrl = triple.object?.value?.thing?.url
    const url = thingUrl || (objectLabel.startsWith('http') ? objectLabel : `https://${objectLabel}`)
    const domain = extractDomain(url)

    const predicateId = triple.predicate?.term_id || ''
    const predicateLabel = triple.predicate?.label || ''
    const intention =
      PREDICATE_TO_INTENTION[predicateId] ||
      LABEL_TO_INTENTION[predicateLabel.toLowerCase()] ||
      predicateLabel ||
      ''

    const receiver = evt.deposit?.receiver
    const certifier = receiver?.label || receiver?.id || ''
    const title = triple.object?.value?.thing?.name || objectLabel || domain

    const key = `${certifier}-${objectLabel}`
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
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        certifier,
        intentions: intention ? [intention] : [],
        timestamp: evt.created_at || '',
      })
    }
  }

  return Array.from(groupedMap.values())
}
