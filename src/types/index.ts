import type { Address, Hash } from 'viem'

// ── Blockchain Events ──

export interface TransactionForwardedEvent {
  operation: string
  user: Address
  sofiaFee: bigint
  multiVaultValue: bigint
  totalReceived: bigint
  blockNumber: bigint
  txHash: Hash
}

// ── Alpha Testers ──

export interface AlphaTester {
  address: Address
  tx: number
  intentions: number
  pioneer: number
  trustVolume: bigint
  trustVolumeFormatted: string
}

export interface AlphaTotals {
  wallets: number
  tx: number
  intentions: number
  pioneers: number
  trustVolume: bigint
}

export interface AlphaTestersData {
  leaderboard: AlphaTester[]
  totals: AlphaTotals
}

// ── Season Pool ──

export interface PoolPosition {
  address: Address
  shares: bigint
  sharesFormatted: string
  currentValue: bigint
  currentValueFormatted: string
  netDeposited: bigint
  pnl: bigint
  pnlFormatted: string
  pnlPercent: number
}

export interface VaultStats {
  totalStakers: number
  tvl: bigint
  sharePrice: bigint
}

// ── Trending ──

export type IntentCategory = 'trusted' | 'distrusted' | 'work' | 'learning' | 'fun' | 'inspiration'

export interface TrendingItemLive {
  category: IntentCategory
  label: string
  url: string
  domain: string
  favicon: string
  certifiers: number
}

export interface Reward {
  icon: string
  title: string
  desc: string
  theme: string
}

// ── Component Props ──

export interface Stat {
  label: string
  value: string
}

export interface StatsRibbonProps {
  stats?: Stat[]
}

export interface LeaderboardProps {
  alphaData?: AlphaTester[]
  alphaLoading?: boolean
  alphaError?: string | null
  poolData?: PoolPosition[] | null
  poolLoading?: boolean
  poolError?: string | null
  connectedAddress?: Address | null
}

export interface GrainientProps {
  timeSpeed?: number
  colorBalance?: number
  warpStrength?: number
  warpFrequency?: number
  warpSpeed?: number
  warpAmplitude?: number
  blendAngle?: number
  blendSoftness?: number
  rotationAmount?: number
  noiseScale?: number
  grainAmount?: number
  grainScale?: number
  grainAnimated?: boolean
  contrast?: number
  gamma?: number
  saturation?: number
  centerX?: number
  centerY?: number
  zoom?: number
  color1?: string
  color2?: string
  color3?: string
  className?: string
}

// ── User Stats ──

export interface UserStats {
  isAlphaTester: boolean
  alphaData: AlphaTester | null
  alphaRank: number | null
  poolData: PoolPosition | null
  poolRank: number | null
}

// ── Service Types ──

export interface RpcQueueConfig {
  minDelayMs?: number
  baseBackoffMs?: number
  maxBackoffMs?: number
  backoffMultiplier?: number
  maxRetries?: number
}

export interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}
