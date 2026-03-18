import { X, Compass, Layers, Monitor, BarChart3, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePrivy, useLogout } from '@privy-io/react-auth'
import { useEnsNames } from '../hooks/useEnsNames'
import { useDiscoveryScore } from '../hooks/useDiscoveryScore'
import { useDomainSelection } from '../hooks/useDomainSelection'
import { usePlatformConnections } from '../hooks/usePlatformConnections'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import type { Address } from 'viem'
import './styles/profile-drawer.css'

interface ProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { authenticated, user } = usePrivy()
  const { logout } = useLogout()
  const address = user?.wallet?.address ?? ''
  const { getDisplay, getAvatar } = useEnsNames(address ? [address as Address] : [])
  const { stats } = useDiscoveryScore(address || undefined)
  const { selectedDomains, selectedNiches } = useDomainSelection()
  const { connectedCount } = usePlatformConnections()

  if (!isOpen || !authenticated) return null

  const displayName = address ? getDisplay(address as Address) : ''
  const avatar = address ? getAvatar(address as Address) : ''
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  const initials = (displayName || address).slice(0, 2).toUpperCase()

  const statItems = [
    { label: 'Domains', value: selectedDomains.length },
    { label: 'Niches', value: selectedNiches.length },
    { label: 'Platforms', value: connectedCount },
    { label: 'Signals', value: stats?.totalCertifications ?? 0 },
  ]

  const navLinks = [
    { label: 'Overview', icon: Compass, to: '/profile' },
    { label: 'Interests', icon: Layers, to: '/profile?view=interests' },
    { label: 'Platforms', icon: Monitor, to: '/profile?view=platforms' },
    { label: 'Scores', icon: BarChart3, to: '/profile?view=scores' },
  ]

  return (
    <aside className="fixed right-0 overflow-hidden pd-aside">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-end px-4 py-4 border-b border-border">
          <button
            onPointerDown={(e) => { e.stopPropagation(); onClose() }}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile info */}
        <div className="flex flex-col items-center gap-3 px-6 py-6">
          <Avatar className="pd-avatar border-2 border-border">
            {avatar && <AvatarImage src={avatar} alt={displayName} />}
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-base font-bold">{displayName}</p>
            <p className="text-xs text-muted-foreground tabular-nums">{shortAddr}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="px-6 pb-4">
          <div className="pd-stat-grid">
            {statItems.map((s) => (
              <div key={s.label} className="pd-stat-card">
                <span className="pd-stat-value">{s.value}</span>
                <span className="pd-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Discovery badges */}
        {stats && (
          <div className="px-6 pb-4">
            <div className="pd-stat-grid">
              <div className="pd-stat-card">
                <span className="pd-stat-value">{stats.pioneerCount}</span>
                <span className="pd-stat-label">Pioneer</span>
              </div>
              <div className="pd-stat-card">
                <span className="pd-stat-value">{stats.explorerCount}</span>
                <span className="pd-stat-label">Explorer</span>
              </div>
              <div className="pd-stat-card">
                <span className="pd-stat-value">{stats.contributorCount}</span>
                <span className="pd-stat-label">Contributor</span>
              </div>
              <div className="pd-stat-card">
                <span className="pd-stat-value">{stats.trustedCount}</span>
                <span className="pd-stat-label">Trusted</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick nav */}
        <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={onClose}
              className="pd-nav-link"
            >
              <link.icon className="h-4 w-4 text-muted-foreground" />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="border-t border-border p-4">
          <button
            onClick={() => { logout(); onClose() }}
            className="pd-nav-link w-full text-destructive hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </button>
        </div>
      </div>
    </aside>
  )
}
