/**
 * PlatformMarketCard — displays market data for a platform atom vault.
 * Shows market cap, share price, position count, and user PnL.
 * Clicking adds the platform to the cart for deposit.
 */

import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import { TrendingUp, Users, DollarSign } from "lucide-react"
import { formatEther } from "viem"
import { useCart } from "@/hooks/useCart"
import type { PlatformVaultData } from "@/services/platformMarketService"
import "@/components/styles/platform-market.css"

interface PlatformMarketCardProps {
  market: PlatformVaultData
  platformSlug: string
}

function formatMarketCap(raw: string): string {
  const num = parseFloat(formatEther(BigInt(raw)))
  if (num >= 1000) return (num / 1000).toFixed(1) + "k"
  if (num >= 1) return num.toFixed(2)
  if (num >= 0.001) return num.toFixed(4)
  return "0"
}

function formatSharePrice(raw: string): string {
  const num = parseFloat(formatEther(BigInt(raw)))
  if (num >= 1) return num.toFixed(4)
  if (num >= 0.0001) return num.toFixed(6)
  return num.toExponential(2)
}

export default function PlatformMarketCard({ market, platformSlug }: PlatformMarketCardProps) {
  const cart = useCart()

  const handleClick = () => {
    cart.addItem({
      id: `invest-${market.termId}`,
      side: "support",
      termId: market.termId,
      title: market.label,
      intention: "Invest",
      intentionColor: "#10B981",
      favicon: `/favicons/${platformSlug}.png`,
    })
  }

  return (
    <Card className="pm-card" onClick={handleClick}>
      <div className="pm-header">
        {market.image && (
          <img
            src={market.image}
            alt=""
            className="pm-icon"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        )}
        <span className="pm-name">{market.label}</span>
        {market.userPnlPct != null && (
          <span
            className="pm-pnl"
            style={{ color: market.userPnlPct >= 0 ? "#10B981" : "#EF4444" }}
          >
            {market.userPnlPct >= 0 ? "+" : ""}
            {market.userPnlPct}%
          </span>
        )}
      </div>

      <div className="pm-stats">
        <div className="pm-stat">
          <DollarSign className="pm-stat-icon" />
          <span className="pm-stat-value">{formatMarketCap(market.marketCap)}</span>
          <span className="pm-stat-label">MCap</span>
        </div>
        <div className="pm-stat">
          <TrendingUp className="pm-stat-icon" />
          <span className="pm-stat-value">{formatSharePrice(market.sharePrice)}</span>
          <span className="pm-stat-label">Price</span>
        </div>
        <div className="pm-stat">
          <Users className="pm-stat-icon" />
          <span className="pm-stat-value">{market.positionCount}</span>
          <span className="pm-stat-label">Holders</span>
        </div>
      </div>
    </Card>
  )
}
