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
      const activeCategories = domain.categories
        .filter((c) => selectedNiches.includes(c.id))
      return { domain, activeCategories, categories: domain.categories }
    })
    .filter(Boolean) as Array<{
    domain: { id: string; label: string; color: string }
    activeCategories: Array<{ id: string; label: string }>
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
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold">Enrich your profile</h2>
          <p className="text-base text-muted-foreground mt-2">
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
              <h3 className="font-medium text-base">Domains ({selectedDomains.length})</h3>
              <Button variant="ghost" size="sm" onClick={() => onNavigate('domains')}>
                Edit
              </Button>
            </div>
            <div className="space-y-2">
              {nichesByDomain.map(({ domain, activeCategories, categories }) => {
                const isExpanded = expandedDomain === domain.id
                return (
                  <Card key={domain.id} className="overflow-hidden" style={{ borderLeftColor: domain.color, borderLeftWidth: 3 }}>
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedDomain(isExpanded ? null : domain.id)}
                    >
                      <span className="font-medium text-base">{domain.label}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{activeCategories.length} categories</Badge>
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    {!isExpanded && activeCategories.length > 0 && (
                      <div className="px-3 pb-3 flex flex-wrap gap-1">
                        {activeCategories.map((c) => (
                          <Badge key={c.id} variant="default" className="text-xs">{c.label}</Badge>
                        ))}
                      </div>
                    )}

                    {isExpanded && (
                      <div className="px-3 pb-3 flex flex-wrap gap-1">
                        {categories.map((cat) => (
                          <Badge
                            key={cat.id}
                            variant={selectedNiches.includes(cat.id) ? 'default' : 'outline'}
                            className="text-xs cursor-pointer"
                            onClick={() => onToggleNiche(cat.id)}
                          >
                            {cat.label}
                          </Badge>
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
              <h3 className="font-medium text-base">Platforms ({connectedPlatforms.length})</h3>
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
