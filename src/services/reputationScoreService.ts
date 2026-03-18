import { SOFIA_DOMAINS } from '@/config/taxonomy'
import { PLATFORM_CATALOG } from '@/config/platformCatalog'
import type {
  ConnectionStatus,
  DomainScore,
  NicheScore,
  ScoreBreakdown,
  UserReputationProfile,
} from '@/types/reputation'

export function pseudoRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  return Math.abs(hash % 100) / 100
}

export function generateBreakdown(seed: string, base: number): ScoreBreakdown {
  const r = pseudoRandom
  return {
    creation: Math.round(base * r(seed + 'c') * 30),
    regularity: Math.round(base * r(seed + 'r') * 25),
    community: Math.round(base * r(seed + 'm') * 20),
    monetization: Math.round(base * r(seed + '$') * 15),
    anciennete: Math.round(base * r(seed + 'a') * 10),
  }
}

export function generateNicheScore(
  domainId: string,
  nicheId: string,
  platformCount: number,
): NicheScore {
  const seed = domainId + nicheId
  const base = Math.min(platformCount * 0.3, 1)
  const breakdown = generateBreakdown(seed, base)
  const score = Math.min(
    100,
    breakdown.creation +
      breakdown.regularity +
      breakdown.community +
      breakdown.monetization +
      breakdown.anciennete,
  )
  return {
    nicheId,
    domainId,
    score,
    confidence: Math.min(1, platformCount * 0.25),
    breakdown,
    sources: [],
    lastCalculated: Date.now(),
  }
}

export function computeReputationProfile(
  getStatus: (platformId: string) => ConnectionStatus,
  selectedDomains: string[],
  selectedNiches: string[],
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
    const domainPlatforms = connectedPlatforms.filter((p) =>
      p.targetDomains.includes(domain.id),
    )
    const platformCount = domainPlatforms.length

    const relevantNiches = domain.categories
      .flatMap((c) => c.niches)
      .filter((n) => selectedNiches.includes(n.id))

    const topNiches = relevantNiches
      .map((n) => generateNicheScore(domain.id, n.id, platformCount))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    const score =
      topNiches.length > 0
        ? Math.round(
            topNiches.reduce((s, n) => s + n.score, 0) / topNiches.length,
          )
        : 0

    return {
      domainId: domain.id,
      score,
      confidence: Math.min(1, platformCount * 0.2),
      topNiches,
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
