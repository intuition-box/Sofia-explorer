/**
 * Behavioral Reputation System types
 * Types for Sofia's behavioral scoring across 103 platforms,
 * 14 domains, 88 categories, and 300+ niches
 */

// === TAXONOMIE ===

export interface Niche {
  id: string
  label: string
  disambiguationSignal?: string
  disambiguationResult?: string
}

export interface Category {
  id: string
  label: string
  termId?: string
  niches: Niche[]
}

export interface Topic {
  id: string
  label: string
  icon: string
  color: string
  categories: Category[]
  primaryPlatforms: string[]
}

// === PLATEFORMES ===

export type AuthType =
  | "oauth2"
  | "oauth1"
  | "api_key"
  | "public"
  | "siwe"
  | "siwf"
  | "none"

export type SignalConfidence =
  | "very_high"
  | "high"
  | "medium"
  | "low"

export type IntegrationPhase = 0 | 1 | 2 | 3 | 4 | 5

export interface PlatformConfig {
  id: string
  name: string
  icon: string
  color: string
  authType: AuthType
  authUrl?: string
  tokenUrl?: string
  scopes?: string[]
  apiBaseUrl?: string
  website?: string
  dataPoints: string[]
  targetTopics: string[]
  targetCategories: string[]
  signalConfidence: SignalConfidence
  integrationPhase: IntegrationPhase
  rateLimitInfo?: string
  notes?: string
  isPublicApi: boolean
  isFreeAccess: boolean
}

// === SIGNAUX ===

export type SignalType =
  | "creation"
  | "regularity"
  | "community"
  | "monetization"
  | "consumption"

export interface BehavioralSignal {
  platformId: string
  signalType: SignalType
  rawValue: number
  normalizedValue: number
  metadata: Record<string, unknown>
  fetchedAt: number
  ttl: number
}

export interface SignalFormula {
  platformId: string
  formula: string
  weights: {
    creation: number
    regularity: number
    community: number
    monetization: number
    anciennete: number
  }
  burstPenalty: number
}

// === SCORES ===

export interface ScoreBreakdown {
  creation: number
  regularity: number
  community: number
  monetization: number
  anciennete: number
}

export interface NicheScore {
  nicheId: string
  topicId: string
  score: number
  confidence: number
  breakdown: ScoreBreakdown
  sources: string[]
  lastCalculated: number
}

export interface TopicScore {
  topicId: string
  score: number
  confidence: number
  topNiches: NicheScore[]
  platformCount: number
  lastCalculated: number
}

export interface UserReputationProfile {
  walletAddress: string
  topics: TopicScore[]
  globalConfidence: number
  totalPlatforms: number
  ensName?: string
  lastUpdated: number
}

// === ETHCC ON-CHAIN SIGNALS ===

export interface EthccTopicVote {
  topicSlug: string
  shares: string
  topicId: string
  categoryId: string
}

export interface EthccTrackInterest {
  trackName: string
  shares: string
  topicId: string
  categoryId: string
}

export interface TopicEthccSignal {
  topicCount: number
  trackCount: number
  totalShares: string
  categoryIds: string[]
}

export interface EthccSofiaSignals {
  topicVotes: EthccTopicVote[]
  trackInterests: EthccTrackInterest[]
  topicSignals: Record<string, TopicEthccSignal>
}

// === TOPIC SCORING MODEL ===

export interface TopicScoringModel {
  maxScore: number
  regularityMultiplier: number
  qualityMultiplier: number
  monetizationMultiplier: number
}

// === ONBOARDING ===

export interface UserInterestSelection {
  selectedTopics: string[]
  selectedCategories: string[]
  suggestedPlatforms: string[]
  connectedPlatforms: string[]
  completedAt?: number
}

// === PLATFORM CONNECTION ===

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "pending_verification"
  | "connected"
  | "error"
  | "expired"

export interface PlatformConnection {
  platformId: string
  status: ConnectionStatus
  connectedAt?: number
  lastSyncAt?: number
  userId?: string
  username?: string
  challengeCode?: string
  error?: string
}
