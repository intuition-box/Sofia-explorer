import {
  useGetAllActivityQuery,
} from '@0xsofia/dashboard-graphql'
import { SOFIA_PROXY_ADDRESS } from '../config'
import { PREDICATE_TO_INTENTION, LABEL_TO_INTENTION, QUEST_BADGES } from '../config/intentions'
import { extractDomain, cleanLabel } from '../utils/formatting'
import type { CircleItem } from './circleService'

export async function fetchAllActivity(
  limit: number = 200,
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
    const hasRealUrl = thingUrl || objectLabel.startsWith('http') || objectLabel.includes('.')
    const url = thingUrl || (objectLabel.startsWith('http') ? objectLabel : hasRealUrl ? `https://${objectLabel}` : '')
    const domain = url ? extractDomain(url) : ''

    const predicateId = triple.predicate?.term_id || ''
    const predicateLabel = triple.predicate?.label || ''
    const isTag = predicateLabel.toLowerCase() === 'has tag'
    const termId = triple.term_id || ''
    const counterTermId = triple.counter_term_id || ''

    const receiver = evt.deposit?.receiver
    const certifierAddress = receiver?.id || ''
    const certifier = receiver?.label || certifierAddress

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
