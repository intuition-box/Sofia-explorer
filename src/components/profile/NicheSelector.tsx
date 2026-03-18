import { SOFIA_DOMAINS } from '../../config/taxonomy'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { ScrollArea } from '../ui/scroll-area'
import { ArrowLeft } from 'lucide-react'
import '../styles/niche-selector.css'

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
              <Card key={domain.id} className="ns-card">
                <div className="ns-header">
                  <h3 className="font-semibold ns-title">{domain.label}</h3>
                  {domainNicheCount > 0 && (
                    <Badge variant="default" className="text-xs">{domainNicheCount}</Badge>
                  )}
                </div>

                {domain.categories.map((category, catIdx) => (
                  <div key={category.id}>
                    {catIdx > 0 && <div className="ns-divider" />}
                    <p className="text-xs font-medium text-muted-foreground ns-cat-label">
                      {category.label}
                    </p>
                    <div className="flex flex-wrap ns-niche-grid">
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
              </Card>
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
