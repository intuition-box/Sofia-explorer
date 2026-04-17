/**
 * Reputation Score Service — computes real scores using platform metrics + signalMatrix formulas.
 *
 * When real metrics are available (from signalFetcherWorkflow), the score is computed
 * using per-platform formulas and topic multipliers. When metrics are unavailable
 * (no_token, token_expired, no_fetcher), the platform is excluded — no fallback points.
 */

import { SOFIA_TOPICS } from '@/config/taxonomy'
import { PLATFORM_CATALOG } from '@/config/platformCatalog'
import {
  SIGNAL_FORMULAS,
  TOPIC_SCORING_MODELS,
  SCORING_PRINCIPLES,
} from '@/config/signalMatrix'
import type {
  ConnectionStatus,
  TopicScore,
  UserReputationProfile,
  SignalFormula,
  TopicScoringModel,
} from '@/types/reputation'
import type { SignalResult } from '@/types/signals'

// ── Lookup table for formulas by platformId ──

const FORMULA_BY_PLATFORM = new Map<string, SignalFormula>(
  SIGNAL_FORMULAS.map((f) => [f.platformId, f]),
)

// ── Metric-to-component mapping per platform ──
// Maps each metric key to the scoring component it contributes to.
// Platforms not listed here use a weighted average fallback.

const METRIC_COMPONENTS: Record<string, Record<string, keyof SignalFormula['weights']>> = {
  github: {
    streak_jours: 'regularity',
    commits_moy_quotidien: 'creation',
    repos_actifs: 'creation',
    stars_recus: 'community',
    langages_distincts: 'creation',
    repos_total: 'creation',
    anciennete_mois: 'anciennete',
    followers: 'community',
    following: 'community',
    pull_requests_opened_30d: 'creation',
    issues_opened_30d: 'creation',
  },
  youtube: {
    videos_postees: 'creation',
    vues_totales: 'community',
    subscribers: 'community',
    videos_recentes_90j: 'regularity',
    anciennete_mois: 'anciennete',
    avg_views_per_video: 'community',
    avg_likes_per_video: 'community',
    avg_comments_per_video: 'community',
    playlists_count: 'creation',
    // subscribers_hidden: intentionally unmapped (flag, not a score input)
  },
  spotify: {
    diversite_genres: 'regularity',
    playlists_creees: 'creation',
    top_artists_count: 'community',
    followers: 'community',
    top_tracks_count: 'community',
    avg_track_popularity: 'community',
  },
  discord: {
    serveurs_specialises: 'community',
    roles_obtenus: 'community',
    moderator_guilds: 'community',
    owned_guilds: 'community',
    anciennete_mois: 'anciennete',
  },
  twitch: {
    heures_stream_mois: 'regularity',
    followers: 'community',
    anciennete_mois: 'anciennete',
    is_affiliate: 'monetization',
    is_partner: 'monetization',
    follows_count: 'community',
    subs_count: 'monetization',
  },
}

// Flag metrics that are NOT score inputs (documented as unmapped)
const METRIC_IGNORE: Record<string, Set<string>> = {
  youtube: new Set(['subscribers_hidden']),
}

// ── Public API ──

export function computeReputationProfile(
  getStatus: (platformId: string) => ConnectionStatus,
  selectedTopics: string[],
  selectedCategories: string[],
  compositeScore?: number | null,
  signals?: Map<string, SignalResult>,
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
    const model = TOPIC_SCORING_MODELS[topic.id]
    const topicPlatforms = connectedPlatforms.filter((p) =>
      p.targetTopics.includes(topic.id),
    )

    let totalScore = 0
    let platformsWithSignals = 0

    // 1. Accumulate platform scores
    for (const platform of topicPlatforms) {
      const formula = FORMULA_BY_PLATFORM.get(platform.id)
      const signal = signals?.get(platform.id)

      if (signal?.success && signal.metrics && formula) {
        const platformScore = computePlatformScore(formula, signal.metrics, model)
        totalScore += platformScore
        platformsWithSignals++
      }
      // Platforms without real signals are excluded — no fallback points
    }

    // 2. Add trust boost from composite score
    if (compositeScore) {
      totalScore += Math.round(compositeScore * 0.2)
    }

    // 3. Apply anti-fraud AFTER bonuses
    //    (so a high trust score can't fully rescue a user with no real platform signals)
    if (platformsWithSignals === 0) {
      // Trust-only → capped low to reward actual platform data
      totalScore = Math.min(totalScore, 15)
    } else if (platformsWithSignals === 1) {
      totalScore *= SCORING_PRINCIPLES.SINGLE_SOURCE_PENALTY
    } else if (platformsWithSignals === 2) {
      totalScore *= SCORING_PRINCIPLES.TWO_SOURCE_BONUS
    } else {
      totalScore *= SCORING_PRINCIPLES.MULTI_SOURCE_BONUS
    }

    // 4. Cap at maxScore
    const finalScore = model
      ? Math.min(model.maxScore, Math.round(totalScore))
      : Math.round(totalScore)

    const confidence = platformsWithSignals > 0
      ? Math.min(1, platformsWithSignals * SCORING_PRINCIPLES.CROSS_PLATFORM_MIN_CONFIDENCE)
      : 0

    return {
      topicId: topic.id,
      score: finalScore,
      confidence,
      topNiches: [],
      platformCount: platformsWithSignals,
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

// ── Internal: per-platform score computation ──

function computePlatformScore(
  formula: SignalFormula,
  metrics: Record<string, number>,
  model?: TopicScoringModel,
): number {
  const w = formula.weights
  const componentMap = METRIC_COMPONENTS[formula.platformId]
  const ignore = METRIC_IGNORE[formula.platformId]

  const components = { creation: 0, regularity: 0, community: 0, monetization: 0, anciennete: 0 }

  if (componentMap) {
    for (const [key, value] of Object.entries(metrics)) {
      if (!Number.isFinite(value)) continue
      if (ignore?.has(key)) continue
      const component = componentMap[key]
      if (component) {
        components[component] += component === 'anciennete'
          ? Math.log(1 + value) * w.anciennete
          : value
      } else if (import.meta.env.DEV) {
        console.warn(
          `[reputationScore] unmapped metric "${key}" for ${formula.platformId} (value=${value}). Add to METRIC_COMPONENTS.`,
        )
      }
    }
  } else {
    // Fallback for platforms without a mapping: distribute all metrics evenly
    const values = Object.values(metrics).filter(Number.isFinite)
    const avg = values.length > 0 ? values.reduce((s, v) => s + v, 0) / values.length : 0
    components.creation = avg
    components.regularity = avg
    components.community = avg
  }

  let score: number
  if (model) {
    score =
      components.creation * w.creation * model.qualityMultiplier +
      components.regularity * w.regularity * model.regularityMultiplier +
      components.community * w.community +
      components.monetization * w.monetization * model.monetizationMultiplier +
      components.anciennete
  } else {
    score =
      components.creation * w.creation +
      components.regularity * w.regularity +
      components.community * w.community +
      components.monetization * w.monetization +
      components.anciennete
  }

  // Apply burst penalty (attenuated for MVP)
  score *= 1 + formula.burstPenalty * 0.5

  return Math.max(0, score)
}
