import { Link, useLocation } from 'react-router-dom'
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Home, User, Trophy, Flame, Vote, BarChart3, Globe } from "lucide-react";
import { useDomainSelection } from '../hooks/useDomainSelection'

const DOMAIN_ICONS: Record<string, string> = {
  'tech-dev': '💻', 'design-creative': '🎨', 'music-audio': '🎵', gaming: '🎮',
  'web3-crypto': '⛓️', science: '🔬', 'sport-health': '🏋️', 'video-cinema': '📹',
  entrepreneurship: '🚀', 'performing-arts': '🎭', 'nature-environment': '🌿',
  'food-lifestyle': '🍽️', literature: '📚', 'personal-dev': '🧠',
}

export function Sidebar() {
  const location = useLocation()
  const { selectedDomains, selectedNiches } = useDomainSelection()

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/profile', icon: User, label: 'My Profile' },
  ]

  const quickLinks = [
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/streaks', icon: Flame, label: 'Streaks' },
    { to: '/vote', icon: Vote, label: 'Vote' },
    { to: '/profile?view=scores', icon: BarChart3, label: 'My Scores' },
    { to: '/profile?view=platforms', icon: Globe, label: 'Platforms' },
  ]

  return (
    <aside className="fixed left-0 top-[85px] h-[calc(100vh-85px)] w-64 overflow-y-auto z-40" style={{ zoom: 1.50, background: 'var(--sidebar)', borderRight: '1px solid var(--border)' }}>
      <div className="p-4 space-y-6">
        {/* Navigation */}
        <div>
          <h3 className="mb-3 px-2 text-sm font-medium text-foreground">
            Navigation
          </h3>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={location.pathname === item.to ? 'secondary' : 'ghost'}
                  className="w-full justify-start h-9 px-2 text-foreground hover:bg-muted hover:text-foreground"
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <div>
          <h3 className="mb-3 px-2 text-sm font-medium text-foreground">
            Quick Access
          </h3>
          <div className="space-y-1">
            {quickLinks.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={location.pathname === item.to ? 'secondary' : 'ghost'}
                  className="w-full justify-start h-9 px-2 text-foreground hover:bg-muted hover:text-foreground"
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Spaces */}
        {selectedDomains.length > 0 && (
          <div>
            <h3 className="mb-3 px-2 text-sm font-medium text-foreground">
              Quick Spaces
            </h3>
            <div className="space-y-1">
              {selectedDomains.slice(0, 6).map((domainId) => (
                <Link key={domainId} to={`/?space=${domainId}`}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-9 px-2 text-foreground hover:bg-muted hover:text-foreground"
                  >
                    <span className="mr-3 text-sm">{DOMAIN_ICONS[domainId] || '📌'}</span>
                    <span className="truncate text-sm">{domainId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Season Info */}
        <div className="rounded-lg border p-3">
          <p className="text-sm font-medium">Beta Season</p>
          <p className="text-xs text-muted-foreground mt-1">
            Connect platforms, build your reputation, earn rewards.
          </p>
          {selectedDomains.length > 0 && (
            <div className="mt-2 flex gap-2">
              <Badge variant="secondary" className="text-[10px]">{selectedDomains.length} domains</Badge>
              <Badge variant="secondary" className="text-[10px]">{selectedNiches.length} niches</Badge>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
