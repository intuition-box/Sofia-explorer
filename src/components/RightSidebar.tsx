import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, Star, Activity } from "lucide-react";
import { SOFIA_DOMAINS } from '../config/taxonomy'
import { useDomainSelection } from '../hooks/useDomainSelection'

const DOMAIN_ICONS: Record<string, string> = {
  'tech-dev': '💻', 'design-creative': '🎨', 'music-audio': '🎵', gaming: '🎮',
  'web3-crypto': '⛓️', science: '🔬', 'sport-health': '🏋️', 'video-cinema': '📹',
  entrepreneurship: '🚀', 'performing-arts': '🎭', 'nature-environment': '🌿',
  'food-lifestyle': '🍽️', literature: '📚', 'personal-dev': '🧠',
}

export function RightSidebar() {
  const { selectedDomains } = useDomainSelection()

  // Show trending domains — prioritize user's selected ones
  const trendingDomains = selectedDomains.length > 0
    ? SOFIA_DOMAINS.filter((d) => selectedDomains.includes(d.id)).slice(0, 5)
    : SOFIA_DOMAINS.slice(0, 5)

  // Placeholder suggested accounts with good scores in user's domains
  const suggestedAccounts = [
    { address: '0x1a2b...3c4d', score: 87, domain: 'tech-dev' },
    { address: '0x5e6f...7g8h', score: 74, domain: 'design-creative' },
    { address: '0x9i0j...1k2l', score: 91, domain: 'web3-crypto' },
  ]

  return (
    <aside className="fixed right-0 top-[57px] h-[calc(100vh-57px)] w-72 bg-background border-l border-border overflow-y-auto z-40 p-4 space-y-6">
      {/* Trending Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trendingDomains.map((domain) => {
            const nicheCount = domain.categories.reduce((s, c) => s + c.niches.length, 0)
            return (
              <div key={domain.id} className="flex items-center justify-between hover:bg-muted/50 rounded p-2 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <span>{DOMAIN_ICONS[domain.id] || '📌'}</span>
                  <div>
                    <p className="font-medium text-sm">{domain.label}</p>
                    <p className="text-xs text-muted-foreground">{nicheCount} niches</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Trending
                </Badge>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Suggested Accounts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Star className="h-4 w-4" />
            Top Reputations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestedAccounts.map((account) => (
            <div key={account.address} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="text-xs">{account.address.slice(2, 4).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{account.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {DOMAIN_ICONS[account.domain]} Score: {account.score}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-center text-muted-foreground pt-1">
            Connect to discover more profiles
          </p>
        </CardContent>
      </Card>

      {/* Live Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground text-center py-4">
            Activity from your trust circle will appear here.
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}
