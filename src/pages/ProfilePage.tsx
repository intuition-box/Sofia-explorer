import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { usePrivy, useLogin } from '@privy-io/react-auth'
import { useEnsNames } from '../hooks/useEnsNames'
import { useUserProfile } from '../hooks/useUserProfile'
import { useDiscoveryScore } from '../hooks/useDiscoveryScore'
import { useDomainSelection } from '../hooks/useDomainSelection'
import { usePlatformConnections } from '../hooks/usePlatformConnections'
import { useReputationScores } from '../hooks/useReputationScores'
import { useShareProfile } from '../hooks/useShareProfile'
import OverviewTab from '../components/profile/OverviewTab'
import DomainSelector from '../components/profile/DomainSelector'
import NicheSelector from '../components/profile/NicheSelector'
import PlatformGrid from '../components/profile/PlatformGrid'
import ScoreView from '../components/profile/ScoreView'
import ShareProfileModal from '../components/profile/ShareProfileModal'
import ProfileHeader from '../components/profile/ProfileHeader'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Wallet } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { PAGE_COLORS } from '../config/pageColors'

type View = 'overview' | 'interests' | 'niches' | 'platforms' | 'scores'

export default function ProfilePage() {
  const { authenticated, user } = usePrivy()
  const { login } = useLogin()
  const [searchParams] = useSearchParams()
  const [view, setView] = useState<View>('overview')

  // Read ?view= from URL (e.g. /profile?view=scores)
  useEffect(() => {
    const urlView = searchParams.get('view')
    if (urlView && ['overview', 'interests', 'niches', 'platforms', 'scores'].includes(urlView)) {
      setView(urlView as View)
    }
  }, [searchParams])

  const address = user?.wallet?.address ?? ''
  const { getDisplay, getAvatar } = useEnsNames(address ? [address as `0x${string}`] : [])
  const { profile } = useUserProfile(address || undefined)
  const { stats: discoveryStats } = useDiscoveryScore(address || undefined)

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

  // Not authenticated — show connect prompt
  if (!authenticated) {
    return (
      <Card className="p-8 text-center">
        <Wallet className="h-10 w-10 mx-auto text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-bold">Connect your wallet</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Connect your wallet to access your profile, select domains, connect platforms, and view your reputation scores.
        </p>
        <Button className="mt-4" onClick={() => login()}>
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </Card>
    )
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

  const pcKey = view === 'scores' ? '/profile/scores' : view === 'platforms' ? '/profile/platforms' : '/profile'
  const pc = PAGE_COLORS[pcKey]

  return (
    <div>
      <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />
      <div className="space-y-6" style={{ padding: '16px 8px' }}>

      <ProfileHeader
        walletAddress={address}
        ensName={address ? (() => { const d = getDisplay(address as `0x${string}`); return d.includes('...') ? undefined : d })() : undefined}
        avatar={address ? getAvatar(address as `0x${string}`) : undefined}
        socialLinked={connectedCount > 0}
        signals={discoveryStats?.totalCertifications ?? 0}
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
          badges={discoveryStats ? {
            pioneer: discoveryStats.pioneerCount,
            explorer: discoveryStats.explorerCount,
            contributor: discoveryStats.contributorCount,
            trusted: discoveryStats.trustedCount,
          } : undefined}
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
    </div>
  )
}
