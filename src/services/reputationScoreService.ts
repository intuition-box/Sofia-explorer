import { SOFIA_DOMAINS } from '@/config/taxonomy'
import { PLATFORM_CATALOG } from '@/config/platformCatalog'
import type {
  ConnectionStatus,
  DomainScore,
  UserReputationProfile,
  EthccSofiaSignals,
} from '@/types/reputation'

// ── Points per signal type ──

const POINTS_PER_PLATFORM = 10   // Connected platform in this domain
const POINTS_PER_ETHCC_TOPIC = 3 // EthCC topic vote matching this domain (bonus)
const POINTS_PER_ETHCC_TRACK = 3 // EthCC track interest matching this domain (bonus)

// ── Score computation ──

export function computeReputationProfile(
  getStatus: (platformId: string) => ConnectionStatus,
  selectedDomains: string[],
  selectedNiches: string[],
  ethccSignals?: EthccSofiaSignals | null,
): UserReputationProfile | null {
  const connectedPlatforms = PLATFORM_CATALOG.filter(
    (p) => getStatus(p.id) === 'connected',
  )

  if (connectedPlatforms.length === 0 && selectedDomains.length === 0) {
    return null
  }

  const domainScores: DomainScore[] = SOFIA_DOMAINS.filter(
    (d) => selectedDomains.includes(d.id),
  ).map((domain) => {
    // Platforms connected in this domain
    const domainPlatforms = connectedPlatforms.filter((p) =>
      p.targetDomains.includes(domain.id),
    )
    const platformCount = domainPlatforms.length
    const platformPoints = platformCount * POINTS_PER_PLATFORM

    // EthCC bonus for this domain
    let ethccBonus = 0
    if (ethccSignals) {
      const domainSignal = ethccSignals.domainSignals[domain.id]
      if (domainSignal) {
        ethccBonus =
          domainSignal.topicCount * POINTS_PER_ETHCC_TOPIC +
          domainSignal.trackCount * POINTS_PER_ETHCC_TRACK
      }
    }

    const score = platformPoints + ethccBonus

    return {
      domainId: domain.id,
      score,
      confidence: platformCount > 0 ? Math.min(1, platformCount * 0.2) : 0,
      topNiches: [],
      platformCount,
      lastCalculated: Date.now(),
    }
  })

  return {
    walletAddress: '',
    domains: domainScores,
    globalConfidence: connectedPlatforms.length > 0
      ? Math.min(1, connectedPlatforms.length * 0.1)
      : 0,
    totalPlatforms: connectedPlatforms.length,
    ensName: undefined,
    lastUpdated: Date.now(),
  }
}
