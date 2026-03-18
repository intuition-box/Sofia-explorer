import { usePrivy } from '@privy-io/react-auth'
import { useEnsNames } from '../hooks/useEnsNames'
import { useDiscoveryScore } from '../hooks/useDiscoveryScore'
import { useDomainSelection } from '../hooks/useDomainSelection'
import { usePlatformConnections } from '../hooks/usePlatformConnections'
import { useReputationScores } from '../hooks/useReputationScores'
import { useShareProfile } from '../hooks/useShareProfile'
import { useTrustCircle } from '../hooks/useTrustCircle'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import ShareProfileModal from './profile/ShareProfileModal'
import type { Address } from 'viem'
import './styles/profile-drawer.css'

interface ProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileDrawer({ isOpen, onClose }: ProfileDrawerProps) {
  const { authenticated, user } = usePrivy()
  const address = user?.wallet?.address ?? ''
  const { getDisplay, getAvatar } = useEnsNames(address ? [address as Address] : [])
  const { stats } = useDiscoveryScore(address || undefined)
  const { selectedDomains, selectedNiches } = useDomainSelection()
  const { getStatus, connectedCount } = usePlatformConnections()
  const scores = useReputationScores(getStatus, selectedDomains, selectedNiches)
  const domainScores = scores?.domains ?? []
  const { accounts: trustCircle, loading: trustLoading } = useTrustCircle(address || undefined)

  const {
    isModalOpen,
    openShareModal,
    closeShareModal,
    shareUrl,
    ogImageUrl,
    isLoading: shareLoading,
    error: shareError,
    handleCopyLink,
    handleShareOnX,
    copied,
  } = useShareProfile({
    walletAddress: address,
    domainScores,
    connectedCount,
    totalCertifications: stats?.totalCertifications ?? 0,
  })

  if (!authenticated) return null

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

  return (
    <>
      <aside className={`fixed right-0 overflow-hidden pd-aside ${isOpen ? 'pd-open' : ''}`}>
        <div className="flex flex-col h-full overflow-y-auto">

          {/* Banner — avatar + name + share */}
          <div className="pd-banner">
            <Avatar className="pd-avatar border-2 border-border shadow-lg">
              {avatar && <AvatarImage src={avatar} alt={displayName} />}
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="pd-name">{displayName}</p>
              <p className="pd-address">{shortAddr}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={openShareModal}
              disabled={shareLoading}
              className="pd-share-btn"
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              {shareLoading ? 'Sharing...' : 'Share on X'}
            </Button>
          </div>

          {/* Stats */}
          <div className="px-6 pt-6 pb-4">
            <p className="pd-section-title" style={{ padding: 0, marginBottom: 10 }}>Stats</p>
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
              <p className="pd-section-title" style={{ padding: 0, marginBottom: 10 }}>Discovery</p>
              <div className="pd-badge-row">
                {[
                  { label: 'Pioneer', value: stats.pioneerCount, icon: '/badges/pioneer.png' },
                  { label: 'Explorer', value: stats.explorerCount, icon: '/badges/explorer.png' },
                  { label: 'Contributor', value: stats.contributorCount, icon: '/badges/contributor.png' },
                  { label: 'Trusted', value: stats.trustedCount, icon: '/badges/trust.png' },
                ].map((b) => (
                  <div key={b.label} className="pd-badge-card">
                    <img src={b.icon} alt={b.label} className="pd-badge-icon" />
                    <span className="pd-badge-label">{b.label}</span>
                    <span className="pd-badge-value">{b.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trust Circle */}
          <div className="px-6 pt-2 pb-4 flex-1">
            <p className="pd-section-title" style={{ padding: 0, marginBottom: 10 }}>
              My Trust Circle
              {!trustLoading && <span className="pd-circle-count">{trustCircle.length}</span>}
            </p>

            {trustLoading ? (
              <div className="pd-circle-loading">
                <span className="pd-circle-loading-text">Loading...</span>
              </div>
            ) : trustCircle.length === 0 ? (
              <p className="pd-circle-empty">No accounts in trust circle yet</p>
            ) : (
              <div className="pd-circle-list">
                {trustCircle.map((account, i) => (
                  <div key={account.termId} className="pd-circle-item">
                    <span className="pd-circle-rank">{i + 1}</span>
                    <Avatar className="pd-circle-avatar">
                      {account.image && <AvatarImage src={account.image} alt={account.label} />}
                      <AvatarFallback className="text-xs">
                        {account.label.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="pd-circle-info">
                      <span className="pd-circle-label">{account.label}</span>
                      <span className="pd-circle-trust">{account.trustAmount.toFixed(6)} ETH</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      <ShareProfileModal
        isOpen={isModalOpen}
        onClose={closeShareModal}
        shareUrl={shareUrl}
        ogImageUrl={ogImageUrl}
        isLoading={shareLoading}
        error={shareError}
        onCopyLink={handleCopyLink}
        onShareOnX={handleShareOnX}
        copied={copied}
      />
    </>
  )
}
