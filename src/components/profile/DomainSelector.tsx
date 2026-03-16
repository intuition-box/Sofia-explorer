import { SOFIA_DOMAINS } from '../../config/taxonomy'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Check, ArrowLeft } from 'lucide-react'

const DOMAIN_ICONS: Record<string, string> = {
  'tech-dev': '💻',
  'design-creative': '🎨',
  'music-audio': '🎵',
  gaming: '🎮',
  'web3-crypto': '⛓️',
  science: '🔬',
  'sport-health': '🏋️',
  'video-cinema': '📹',
  entrepreneurship: '🚀',
  'performing-arts': '🎭',
  'nature-environment': '🌿',
  'food-lifestyle': '🍽️',
  literature: '📚',
  'personal-dev': '🧠',
}

interface DomainSelectorProps {
  selectedDomains: string[]
  onToggle: (domainId: string) => void
  onContinue: () => void
  onBack?: () => void
}

export default function DomainSelector({
  selectedDomains,
  onToggle,
  onContinue,
  onBack,
}: DomainSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Select your domains</h2>
        <Badge variant="secondary">{selectedDomains.length} selected</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SOFIA_DOMAINS.map((domain) => {
          const isSelected = selectedDomains.includes(domain.id)
          const nicheCount = domain.categories.reduce((s, c) => s + c.niches.length, 0)

          return (
            <Card
              key={domain.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              onClick={() => onToggle(domain.id)}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{DOMAIN_ICONS[domain.id] || '📌'}</span>
                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <p className="font-medium text-sm">{domain.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {domain.categories.length} categories · {nicheCount} niches
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex gap-2 pt-2">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        <Button className="flex-1" onClick={onContinue} disabled={selectedDomains.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  )
}
