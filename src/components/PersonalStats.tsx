import { useState } from 'react'
import { formatEther } from 'viem'
import type { Address } from 'viem'
import type { UserStats } from '../types'
import { OG_BASE_URL } from '../config'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

function formatTrust(wei: bigint) {
  const num = parseFloat(formatEther(wei))
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k T'
  if (num >= 1) return num.toFixed(2) + ' T'
  return num.toFixed(4) + ' T'
}

interface PersonalStatsProps {
  userStats: UserStats
  totalAlphaTesters: number
  totalPoolStakers: number | null
  walletAddress: Address
  displayName: string
}

export default function PersonalStats({
  userStats,
  totalAlphaTesters,
  totalPoolStakers,
  walletAddress,
  displayName,
}: PersonalStatsProps) {
  const { isAlphaTester, alphaData, alphaRank, poolData, poolRank } = userStats
  const [sharing, setSharing] = useState(false)

  async function handleShare() {
    if (!alphaData || !alphaRank) return
    setSharing(true)
    try {
      const body: Record<string, string | number> = {
        wallet: walletAddress,
        name: displayName,
        alphaRank,
        totalAlpha: totalAlphaTesters,
        tx: alphaData.tx,
        intentions: alphaData.intentions,
        pioneer: alphaData.pioneer,
        trustVolume: formatTrust(alphaData.trustVolume),
      }
      if (poolData && poolRank) {
        body.poolRank = poolRank
        if (totalPoolStakers) body.totalPool = totalPoolStakers
        body.pnl = `${poolData.pnl >= 0n ? '+' : ''}${formatTrust(poolData.pnl)}`
        body.pnlPercent = `${poolData.pnlPercent >= 0 ? '+' : ''}${poolData.pnlPercent.toFixed(1)}%`
      }
      const res = await fetch(`${OG_BASE_URL}/api/share/board`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const { url } = await res.json()
      const tweetText = encodeURIComponent(
        `Check out my Sofia Season stats! Alpha Rank #${alphaRank} of ${totalAlphaTesters}`,
      )
      window.open(
        `https://twitter.com/intent/tweet?text=${tweetText}&url=${encodeURIComponent(url)}`,
        '_blank',
      )
    } catch (err) {
      console.error('Share failed:', err)
    } finally {
      setSharing(false)
    }
  }

  if (!isAlphaTester) {
    return (
      <Card className="p-6 text-center">
        <p className="font-medium">You are not part of the Alpha Tester Program</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start using Sofia to appear on the leaderboard
        </p>
      </Card>
    )
  }

  type StatCard = { label: string; value: string; sub?: string; variant?: 'positive' | 'negative' }

  const alphaCards: StatCard[] = [
    { label: 'Alpha Rank', value: `#${alphaRank}` },
    { label: 'Transactions', value: alphaData!.tx.toLocaleString() },
    { label: 'Intentions', value: alphaData!.intentions.toLocaleString() },
    { label: 'Pioneer', value: String(alphaData!.pioneer) },
    { label: 'Trust Volume', value: formatTrust(alphaData!.trustVolume) },
  ]

  const poolCards: StatCard[] = []
  if (poolData && poolRank) {
    poolCards.push(
      { label: 'Pool Rank', value: `#${poolRank}` },
      { label: 'Pool P&L', value: `${poolData.pnl >= 0n ? '+' : ''}${formatTrust(poolData.pnl)}`, variant: poolData.pnl >= 0n ? 'positive' : 'negative' },
      { label: 'Pool P&L %', value: `${poolData.pnlPercent >= 0 ? '+' : ''}${poolData.pnlPercent.toFixed(1)}%`, variant: poolData.pnlPercent >= 0 ? 'positive' : 'negative' },
    )
  }

  function renderCard(card: StatCard) {
    return (
      <div key={card.label} className="flex flex-col items-center justify-center rounded-lg border p-4 text-center">
        <span className={`text-lg font-bold ${card.variant === 'positive' ? 'text-green-600' : card.variant === 'negative' ? 'text-red-500' : ''}`}>
          {card.value}
        </span>
        <span className="text-xs text-muted-foreground mt-1">{card.label}</span>
        {card.sub && (
          <Badge variant="secondary" className="mt-1 text-[10px]">
            {card.sub}
          </Badge>
        )}
      </div>
    )
  }

  const cols = alphaCards.length

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-medium text-base">Your Stats</h3>
        <Button size="sm" variant="outline" onClick={handleShare} disabled={sharing}>
          {sharing ? 'Sharing...' : 'Share'}
        </Button>
      </div>
      <div className="space-y-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Alpha Tester</p>
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {alphaCards.map(renderCard)}
          </div>
        </div>
        {poolCards.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Season Pool</p>
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {poolCards.map(renderCard)}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
