import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { useDomainSelection } from '../hooks/useDomainSelection'
import { usePlatformConnections } from '../hooks/usePlatformConnections'
import { useReputationScores } from '../hooks/useReputationScores'
import { useShareProfile } from '../hooks/useShareProfile'
import ProfileHeader from '../components/profile/ProfileHeader'
import OverviewTab from '../components/profile/OverviewTab'
import DomainSelector from '../components/profile/DomainSelector'
import NicheSelector from '../components/profile/NicheSelector'
import PlatformGrid from '../components/profile/PlatformGrid'
import ScoreView from '../components/profile/ScoreView'
import ShareProfileModal from '../components/profile/ShareProfileModal'

type View = 'overview' | 'interests' | 'niches' | 'platforms' | 'scores'

export default function ProfilePage() {
  const { authenticated, user } = usePrivy()
  const navigate = useNavigate()
  const [view, setView] = useState<View>('overview')

  const address = user?.wallet?.address ?? ''

  const {
    selectedDomains,
    selectedNiches,
    toggleDomain,
    toggleNiche,
  } = useDomainSelection()

  const {
    getStatus,
    getConnection,
    connect,
    disconnect,
    startChallenge,
    verifyChallengeCode,
    connectedCount,
  } = usePlatformConnections()

  const scores = useReputationScores(getStatus, selectedDomains, selectedNiches)
  const domainScores = scores?.domains ?? []

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
    totalCertifications: 0,
  })

  if (!authenticated) {
    navigate('/')
    return null
  }

  const stats = [
    { label: 'Domains', value: String(selectedDomains.length) },
    { label: 'Niches', value: String(selectedNiches.length) },
    { label: 'Platforms', value: String(connectedCount) },
  ]

  const handleNavigate = (tab: string) => {
    if (tab === 'domains') setView('interests')
    else if (tab === 'niches') setView('niches')
    else if (tab === 'platforms') setView('platforms')
    else if (tab === 'scores') setView('scores')
    else setView('overview')
  }

  return (
    <div className="space-y-6">
      <ProfileHeader
        walletAddress={address}
        stats={stats}
        onShare={openShareModal}
        sharing={shareLoading}
      />

      {view === 'overview' && (
        <OverviewTab
          selectedDomains={selectedDomains}
          selectedNiches={selectedNiches}
          getStatus={getStatus}
          domainScores={domainScores}
          onNavigate={handleNavigate}
          onToggleNiche={toggleNiche}
        />
      )}

      {view === 'interests' && (
        <DomainSelector
          selectedDomains={selectedDomains}
          onToggle={toggleDomain}
          onContinue={() => setView('niches')}
          onBack={() => setView('overview')}
        />
      )}

      {view === 'niches' && (
        <NicheSelector
          selectedDomains={selectedDomains}
          selectedNiches={selectedNiches}
          onToggleNiche={toggleNiche}
          onBack={() => setView('interests')}
          onContinue={() => setView('overview')}
        />
      )}

      {view === 'platforms' && (
        <PlatformGrid
          selectedNiches={selectedNiches}
          getStatus={getStatus}
          getConnection={getConnection}
          onConnect={connect}
          onDisconnect={disconnect}
          onStartChallenge={startChallenge}
          onVerifyChallenge={verifyChallengeCode}
          onBack={() => setView('overview')}
        />
      )}

      {view === 'scores' && (
        <ScoreView
          selectedDomains={selectedDomains}
          selectedNiches={selectedNiches}
          getStatus={getStatus}
          onBack={() => setView('overview')}
        />
      )}

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
    </div>
  )
}
