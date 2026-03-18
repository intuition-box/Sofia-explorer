import { useState, useMemo } from 'react'
import { PLATFORM_CATALOG } from '../../config/platformCatalog'
import { getSuggestedPlatforms, DOMAIN_BY_ID } from '../../config/taxonomy'
import type { ConnectionStatus, PlatformConnection } from '../../types/reputation'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { ArrowLeft, Search, ExternalLink, Check, Loader2 } from 'lucide-react'
import { getCertifyUrl } from '../../utils/sofiaDetect'

interface PlatformGridProps {
  selectedNiches: string[]
  getStatus: (platformId: string) => ConnectionStatus
  getConnection: (platformId: string) => PlatformConnection | undefined
  onConnect: (platformId: string) => Promise<void>
  onDisconnect: (platformId: string) => void
  onStartChallenge: (platformId: string, username: string) => Promise<void>
  onVerifyChallenge: (platformId: string) => Promise<void>
  onBack: () => void
}

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  disconnected: 'Connect',
  connecting: 'Connecting...',
  pending_verification: 'Verify',
  connected: 'Connected',
  error: 'Retry',
  expired: 'Reconnect',
}

export default function PlatformGrid({
  selectedNiches,
  getStatus,
  getConnection,
  onConnect,
  onDisconnect,
  onStartChallenge,
  onVerifyChallenge,
  onBack,
}: PlatformGridProps) {
  const [search, setSearch] = useState('')
  const suggested = getSuggestedPlatforms(selectedNiches)

  const filtered = PLATFORM_CATALOG.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()),
  )

  const sorted = [...filtered].sort((a, b) => {
    const aConnected = getStatus(a.id) === 'connected' ? 0 : 1
    const bConnected = getStatus(b.id) === 'connected' ? 0 : 1
    if (aConnected !== bConnected) return aConnected - bConnected
    const aSuggested = suggested.includes(a.id) ? 0 : 1
    const bSuggested = suggested.includes(b.id) ? 0 : 1
    return aSuggested - bSuggested
  })

  // Group by domain
  const grouped = useMemo(() => {
    const groups = new Map<string, typeof sorted>()
    for (const p of sorted) {
      const domainId = p.targetDomains?.[0] || 'other'
      const existing = groups.get(domainId) || []
      existing.push(p)
      groups.set(domainId, existing)
    }
    return groups
  }, [sorted])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-bold flex-1">Platforms ({PLATFORM_CATALOG.length})</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search platforms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {[...grouped.entries()].map(([domainId, platforms]) => {
        const domain = DOMAIN_BY_ID.get(domainId)
        const label = domain?.label || domainId

        return (
          <div key={domainId}>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 14 }}>
              <h3 className="font-semibold" style={{ fontSize: 18 }}>
                {label} <span className="text-muted-foreground" style={{ fontSize: 14, fontWeight: 400 }}>({platforms.length})</span>
              </h3>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {platforms.map((platform) => {
                const status = getStatus(platform.id)
                const isConnected = status === 'connected'
                const isConnecting = status === 'connecting'
                const isSuggested = suggested.includes(platform.id)

                return (
                  <Card
                    key={platform.id}
                    className={isConnected ? 'border-green-500/30 bg-green-50/50' : ''}
                    style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}
                  >
                    {/* Platform identity */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={`/favicons/${platform.id}.png`}
                        alt=""
                        style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0 }}
                        onError={(e) => {
                          const el = e.target as HTMLImageElement
                          el.style.display = 'none'
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="font-medium truncate" style={{ fontSize: 16, display: 'block' }}>{platform.name}</span>
                        {isSuggested && !isConnected && (
                          <Badge variant="secondary" className="text-[10px]" style={{ marginTop: 4 }}>Suggested</Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button
                        size="sm"
                        variant={isConnected ? 'outline' : 'default'}
                        style={{ flex: 1, fontSize: 11, height: 28 }}
                        disabled={isConnecting}
                        onClick={() => {
                          if (isConnected) {
                            onDisconnect(platform.id)
                          } else {
                            onConnect(platform.id)
                          }
                        }}
                      >
                        {isConnecting && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {isConnected && <Check className="h-3 w-3 mr-1" />}
                        {STATUS_LABELS[status]}
                      </Button>
                      <a
                        href={getCertifyUrl(`https://${platform.apiBaseUrl ? new URL(platform.apiBaseUrl).hostname : platform.id + '.com'}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ flex: 1 }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          style={{ width: '100%', fontSize: 11, height: 28 }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Certify
                        </Button>
                      </a>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
