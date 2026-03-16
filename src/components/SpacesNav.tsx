import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { SOFIA_DOMAINS } from '../config/taxonomy'
import { useDomainSelection } from '../hooks/useDomainSelection'

const DOMAIN_ICONS: Record<string, string> = {
  'tech-dev': '💻', 'design-creative': '🎨', 'music-audio': '🎵', gaming: '🎮',
  'web3-crypto': '⛓️', science: '🔬', 'sport-health': '🏋️', 'video-cinema': '📹',
  entrepreneurship: '🚀', 'performing-arts': '🎭', 'nature-environment': '🌿',
  'food-lifestyle': '🍽️', literature: '📚', 'personal-dev': '🧠',
}

interface SpacesNavProps {
  activeSpace: string;
  onSpaceChange: (space: string) => void;
}

export function SpacesNav({ activeSpace, onSpaceChange }: SpacesNavProps) {
  const { selectedDomains } = useDomainSelection()

  // Show user's selected domains, or all domains if none selected
  const domains = selectedDomains.length > 0
    ? SOFIA_DOMAINS.filter((d) => selectedDomains.includes(d.id))
    : SOFIA_DOMAINS

  return (
    <div className="border-b bg-background">
      <ScrollArea className="w-full">
        <div className="flex space-x-1 p-2">
          <Button
            variant={activeSpace === 'all' ? "default" : "ghost"}
            size="sm"
            className="flex-shrink-0 gap-2"
            onClick={() => onSpaceChange('all')}
          >
            <span>🌟</span>
            <span className="hidden sm:inline">All</span>
          </Button>
          {domains.map((domain) => (
            <Button
              key={domain.id}
              variant={activeSpace === domain.id ? "default" : "ghost"}
              size="sm"
              className="flex-shrink-0 gap-2"
              onClick={() => onSpaceChange(domain.id)}
            >
              <span>{DOMAIN_ICONS[domain.id] || '📌'}</span>
              <span className="hidden sm:inline">{domain.label}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
