import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from "./ui/button";
import { Home, User, Trophy, Flame, Vote, BarChart3, Globe } from "lucide-react";
import { useDomainSelection } from '../hooks/useDomainSelection'
import { SEASON_END } from '../config'
import './styles/sidebar.css'

function getTimeLeft() {
  const diff = SEASON_END.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  }
}
const pad = (n: number) => String(n).padStart(2, '0')

const DOMAIN_ICONS: Record<string, string> = {
  'tech-dev': '💻', 'design-creative': '🎨', 'music-audio': '🎵', gaming: '🎮',
  'web3-crypto': '⛓️', science: '🔬', 'sport-health': '🏋️', 'video-cinema': '📹',
  entrepreneurship: '🚀', 'performing-arts': '🎭', 'nature-environment': '🌿',
  'food-lifestyle': '🍽️', literature: '📚', 'personal-dev': '🧠',
}

export function Sidebar() {
  const location = useLocation()
  const { selectedDomains } = useDomainSelection()
  const [timeLeft, setTimeLeft] = useState(getTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/profile', icon: User, label: 'My Profile' },
  ]

  const quickLinks = [
    { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/streaks', icon: Flame, label: 'Streaks' },
    { to: '/vote', icon: Vote, label: 'Vote' },
    { to: '/scores', icon: BarChart3, label: 'My Stats' },
    { to: '/platforms', icon: Globe, label: 'Platforms' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-screen overflow-y-auto z-40 sb-aside">
      <div className="p-4 space-y-6 sb-inner" style={{ zoom: 1.25 }}>
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

        {/* Season Countdown */}
        <div className="rounded-lg border sb-countdown">
          <p className="sb-countdown-label">Beta Season ends in</p>
          <p className="sb-countdown-time">
            {timeLeft.days}d : {pad(timeLeft.hours)}h : {pad(timeLeft.minutes)}m
          </p>
          <p className="sb-countdown-hint">
            The top spots are being claimed right now.
          </p>
          <Button size="sm" className="sb-countdown-btn">
            Install Sofia
          </Button>
        </div>
      </div>
    </aside>
  );
}
