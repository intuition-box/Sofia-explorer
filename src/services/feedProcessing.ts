import { PREDICATE_TO_INTENTION, LABEL_TO_INTENTION, QUEST_BADGES } from '../config/intentions'
import { extractDomain, cleanLabel } from '../utils/formatting'
import type { CircleItem } from './circleService'

interface FeedEvent {
  id: string
  created_at?: string | null
  triple?: {
    term_id?: string | null
    counter_term_id?: string | null
    object?: {
      label?: string | null
      value?: { thing?: { url?: string | null; name?: string | null } | null } | null
    } | null
    predicate?: {
      term_id?: string | null
      label?: string | null
    } | null
  } | null
  deposit?: { receiver?: { id?: string | null; label?: string | null } | null } | null
  redemption?: { sender?: { id?: string | null; label?: string | null } | null } | null
}

interface CertifierInfo {
  address: string
  label: string
}

/**
 * Process raw GraphQL events into grouped CircleItem[].
 * Shared between activityService and circleService.
 */
export function processEvents(
  events: FeedEvent[],
  getCertifier: (evt: FeedEvent) => CertifierInfo,
): CircleItem[] {
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

    const { address: certifierAddress, label: certifier } = getCertifier(evt)

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
