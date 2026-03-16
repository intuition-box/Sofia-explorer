import { useState } from 'react'
import { DOMAIN_BY_ID } from '../../config/taxonomy'
import { PLATFORM_CATALOG } from '../../config/platformCatalog'
import type { ConnectionStatus, DomainScore } from '../../types/reputation'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { ChevronRight } from 'lucide-react'

interface OverviewTabProps {
  selectedDomains: string[]
  selectedNiches: string[]
  getStatus: (platformId: string) => ConnectionStatus
  domainScores: DomainScore[]
  onNavigate: (tab: string) => void
  onToggleNiche: (nicheId: string) => void
}

export default function OverviewTab({
  selectedDomains,
  selectedNiches,
  getStatus,
  domainScores,
  onNavigate,
  onToggleNiche,
}: OverviewTabProps) {
  const connectedPlatforms = PLATFORM_CATALOG.filter(
    (p) => getStatus(p.id) === 'connected',
  )

  const [expandedDomain, setExpandedDomain] = useState<string | null>(null)

  const nichesByDomain = selectedDomains
    .map((domainId) => {
      const domain = DOMAIN_BY_ID.get(domainId)
      if (!domain) return null
      const activeNiches = domain.categories
        .flatMap((c) => c.niches)
        .filter((n) => selectedNiches.includes(n.id))
      return { domain, activeNiches, categories: domain.categories }
    })
    .filter(Boolean) as Array<{
    domain: { id: string; label: string; color: string }
    activeNiches: Array<{ id: string; label: string }>
    categories: Array<{
      id: string
      label: string
      niches: Array<{ id: string; label: string }>
    }>
  }>

  const hasSetup = selectedDomains.length > 0

  return (
    <div className="space-y-6">
      {/* CTA if nothing configured */}
      {!hasSetup && (
        <Card className="p-6 text-center">
          <h2 className="text-lg font-bold">Enrich your profile</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Select your domains of interest, connect your favorite platforms,
            and build your behavioral reputation across 103 platforms.
          </p>
          <Button className="mt-4" onClick={() => onNavigate('domains')}>
            Get Started
          </Button>
        </Card>
      )}

      {hasSetup && (
        <>
          {/* Domains */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Domains ({selectedDomains.length})</h3>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('domains')}>
                Edit
              </Button>
            </div>
            <div className="space-y-2">
              {nichesByDomain.map(({ domain, activeNiches, categories }) => {
                const isExpanded = expandedDomain === domain.id
                return (
                  <Card key={domain.id} className="overflow-hidden" style={{ borderLeftColor: domain.color, borderLeftWidth: 3 }}>
                    <button
                      className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}
                    >
                      <span className="font-medium text-sm">{domain.label}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{activeNiches.length} niches</Badge>
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    {!isExpanded && activeNiches.length > 0 && (
                      <div className="px-3 pb-3 flex flex-wrap gap-1">
                        {activeNiches.map((n) => (
                          <Badge key={n.id} variant="default" className="text-xs">{n.label}</Badge>
                        ))}
                      </div>
                    )}

                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-3">
                        {categories.map((cat) => (
                          <div key={cat.id}>
                            <h4 className="text-xs font-medium text-muted-foreground mb-1">{cat.label}</h4>
                            <div className="flex flex-wrap gap-1">
                              {cat.niches.map((n) => (
                                <Badge
                                  key={n.id}
                                  variant={selectedNiches.includes(n.id) ? 'default' : 'outline'}
                                  className="text-xs cursor-pointer"
                                  onClick={() => onToggleNiche(n.id)}
                                >
                                  {n.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Connected Platforms */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Platforms ({connectedPlatforms.length})</h3>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('platforms')}>
                Manage
              </Button>
            </div>
            {connectedPlatforms.length === 0 ? (
              <Card className="p-4 text-center text-sm text-muted-foreground">
                No platforms connected.{' '}
                <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => onNavigate('platforms')}>
                  Connect one
                </Button>
              </Card>
            ) : (
              <div className="flex flex-wrap gap-2">
                {connectedPlatforms.slice(0, 12).map((p) => (
                  <Badge key={p.id} variant="secondary" className="gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    {p.name}
                  </Badge>
                ))}
                {connectedPlatforms.length > 12 && (
                  <Button variant="outline" size="sm" onClick={() => onNavigate('platforms')}>
                    +{connectedPlatforms.length - 12} more
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* Scores link */}
          <Button variant="outline" className="w-full" onClick={() => onNavigate('scores')}>
            View Score Details
          </Button>
        </>
      )}
    </div>
  )
}
