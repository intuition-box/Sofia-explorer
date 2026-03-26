import { SOFIA_TOPICS } from '@/config/taxonomy'
import { PLATFORM_CATALOG } from '@/config/platformCatalog'
import type {
  ConnectionStatus,
  TopicScore,
  UserReputationProfile,
  EthccSofiaSignals,
} from '@/types/reputation'

// ── Points per signal type ──

const POINTS_PER_PLATFORM = 10   // Connected platform in this topic
const POINTS_PER_ETHCC_TOPIC = 3 // EthCC topic vote matching this topic (bonus)
const POINTS_PER_ETHCC_TRACK = 3 // EthCC track interest matching this topic (bonus)
const TRUST_BOOST_MULTIPLIER = 20 // compositeScore (0–100) × 0.2 = max +20 pts per topic

// ── Score computation ──

export function computeReputationProfile(
  getStatus: (platformId: string) => ConnectionStatus,
  selectedTopics: string[],
  selectedCategories: string[],
  ethccSignals?: EthccSofiaSignals | null,
  compositeScore?: number | null,
): UserReputationProfile | null {
  const connectedPlatforms = PLATFORM_CATALOG.filter(
    (p) => getStatus(p.id) === 'connected',
  )

  if (connectedPlatforms.length === 0 && selectedTopics.length === 0) {
    return null
  }

  const topicScores: TopicScore[] = SOFIA_TOPICS.filter(
    (d) => selectedTopics.includes(d.id),
  ).map((topic) => {
    // Platforms connected in this topic
    const topicPlatforms = connectedPlatforms.filter((p) =>
      p.targetTopics.includes(topic.id),
    )
    const platformCount = topicPlatforms.length
    const platformPoints = platformCount * POINTS_PER_PLATFORM

    // EthCC bonus for this topic
    let ethccBonus = 0
    if (ethccSignals) {
      const topicSignal = ethccSignals.topicSignals[topic.id]
      if (topicSignal) {
        ethccBonus =
          topicSignal.topicCount * POINTS_PER_ETHCC_TOPIC +
          topicSignal.trackCount * POINTS_PER_ETHCC_TRACK
      }
    }

    // Trust boost: global composite score (0–100) applied proportionally
    const trustBoost = compositeScore ? Math.round(compositeScore * TRUST_BOOST_MULTIPLIER / 100) : 0

    const score = platformPoints + ethccBonus + trustBoost

    return {
      topicId: topic.id,
      score,
      confidence: platformCount > 0 ? Math.min(1, platformCount * 0.2) : 0,
      topNiches: [],
      platformCount,
      lastCalculated: Date.now(),
    }
  })

  return {
    walletAddress: '',
    topics: topicScores,
    globalConfidence: connectedPlatforms.length > 0
      ? Math.min(1, connectedPlatforms.length * 0.1)
      : 0,
    totalPlatforms: connectedPlatforms.length,
    ensName: undefined,
    lastUpdated: Date.now(),
  }
}
