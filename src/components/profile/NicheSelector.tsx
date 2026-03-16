import { SOFIA_DOMAINS } from '../../config/taxonomy'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { ArrowLeft } from 'lucide-react'

const DOMAIN_ICONS: Record<string, string> = {
  'tech-dev': '💻', 'design-creative': '🎨', 'music-audio': '🎵', gaming: '🎮',
  'web3-crypto': '⛓️', science: '🔬', 'sport-health': '🏋️', 'video-cinema': '📹',
  entrepreneurship: '🚀', 'performing-arts': '🎭', 'nature-environment': '🌿',
  'food-lifestyle': '🍽️', literature: '📚', 'personal-dev': '🧠',
}

interface NicheSelectorProps {
  selectedDomains: string[]
  selectedNiches: string[]
  onToggleNiche: (nicheId: string) => void
  onBack: () => void
  onContinue: () => void
}

export default function NicheSelector({
  selectedDomains,
  selectedNiches,
  onToggleNiche,
  onBack,
  onContinue,
}: NicheSelectorProps) {
  const domains = SOFIA_DOMAINS.filter((d) => selectedDomains.includes(d.id))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Select your niches</h2>
        <Badge variant="secondary">{selectedNiches.length} selected</Badge>
      </div>

      <ScrollArea className="h-[60vh]">
        <div className="space-y-6 pr-4">
          {domains.map((domain) => {
            const domainNicheCount = domain.categories
              .flatMap((c) => c.niches)
              .filter((n) => selectedNiches.includes(n.id)).length

            return (
              <div key={domain.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span>{DOMAIN_ICONS[domain.id] || '📌'}</span>
                  <span className="font-medium">{domain.label}</span>
                  {domainNicheCount > 0 && (
                    <Badge variant="default" className="text-xs">{domainNicheCount}</Badge>
                  )}
                </div>

                {domain.categories.map((category) => (
                  <div key={category.id} className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                      {category.label}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {category.niches.map((niche) => (
                        <Badge
                          key={niche.id}
                          variant={selectedNiches.includes(niche.id) ? 'default' : 'outline'}
                          className="cursor-pointer text-xs"
                          onClick={() => onToggleNiche(niche.id)}
                        >
                          {niche.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </ScrollArea>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button className="flex-1" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}
