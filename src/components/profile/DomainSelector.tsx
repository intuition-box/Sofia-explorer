import { SOFIA_DOMAINS } from '../../config/taxonomy'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Check, ArrowLeft } from 'lucide-react'
import '../styles/domain-selector.css'

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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Select your domains</h2>
        <Badge variant="secondary" className="text-sm px-3 py-1">{selectedDomains.length} selected</Badge>
      </div>

      <div className="grid gap-4 mt-4 ds-grid">
        {SOFIA_DOMAINS.map((domain) => {
          const isSelected = selectedDomains.includes(domain.id)
          const nicheCount = domain.categories.reduce((s, c) => s + c.niches.length, 0)

          return (
            <Card
              key={domain.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`}
              onClick={() => onToggle(domain.id)}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{DOMAIN_ICONS[domain.id] || '📌'}</span>
                {isSelected && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="font-medium text-base">{domain.label}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {domain.categories.length} categories · {nicheCount} niches
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex gap-2 pb-6 ds-actions">
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
