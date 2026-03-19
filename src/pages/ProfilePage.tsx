import { useNavigate } from 'react-router-dom'
import { usePrivy, useLogin, useLinkAccount } from '@privy-io/react-auth'
import { useDomainSelection } from '../hooks/useDomainSelection'
import { usePlatformConnections } from '../hooks/usePlatformConnections'
import { useReputationScores } from '../hooks/useReputationScores'
import { useUserActivity } from '../hooks/useUserActivity'
import { useTopClaims } from '../hooks/useTopClaims'
import { useEthccData } from '../hooks/useEthccData'
import LastActivitySection from '../components/profile/LastActivitySection'
import InterestsGrid from '../components/profile/InterestsGrid'
import TopClaimsSection from '../components/profile/TopClaimsSection'
import EthccConnectCard from '../components/profile/EthccConnectCard'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Wallet } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { PAGE_COLORS } from '../config/pageColors'
import '@/components/styles/pages.css'
import '@/components/styles/profile-sections.css'

export default function ProfilePage() {
  const { authenticated, user } = usePrivy()
  const { login } = useLogin()
  const { linkWallet } = useLinkAccount({ onSuccess: () => window.location.reload() })
  const address = user?.wallet?.address ?? ''
  const { selectedDomains, selectedNiches, toggleDomain } = useDomainSelection()
  const navigate = useNavigate()
  const { getStatus } = usePlatformConnections()
  const scores = useReputationScores(getStatus, selectedDomains, selectedNiches)
  const domainScores = scores?.domains ?? []
  const { items: activityItems, loading: activityLoading } = useUserActivity(address || undefined)
  const { claims: topClaims, loading: claimsLoading } = useTopClaims(activityItems, address || undefined)
  const { ethccWallet, signals: ethccSignals, loading: ethccLoading, setWallet, clearWallet } = useEthccData()

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

  const pc = PAGE_COLORS['/profile']

  return (
    <div>
      <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />

      {/* Link wallet banner */}
      {!address && (
        <Card className="pp-wallet-banner">
          <Wallet className="h-5 w-5 text-muted-foreground" />
          <div className="pp-wallet-banner-text">
            <p className="text-sm font-semibold">Read-only mode</p>
            <p className="text-xs text-muted-foreground">Link a wallet to interact, support claims, and build your reputation.</p>
          </div>
          <Button size="sm" onClick={() => linkWallet()}>
            <Wallet className="h-3.5 w-3.5 mr-1" />
            Link Wallet
          </Button>
        </Card>
      )}

      <div className="pp-sections page-content page-enter">

        {/* Top Claims */}
        {(activityLoading || claimsLoading || topClaims.length > 0) && (
          <section className="pp-section">
            <h3 className="pp-section-title">Top Claims</h3>
            <TopClaimsSection
              claims={topClaims}
              loading={activityLoading || claimsLoading}
              walletAddress={address}
            />
          </section>
        )}

        {/* EthCC Wallet */}
        <section className="pp-section">
          <EthccConnectCard
            ethccWallet={ethccWallet}
            signals={ethccSignals}
            loading={ethccLoading}
            onConnect={setWallet}
            onDisconnect={clearWallet}
          />
        </section>

        {/* Interests */}
        <section className="pp-section">
          <h3 className="pp-section-title">My Interests</h3>
          <InterestsGrid
            selectedDomains={selectedDomains}
            selectedNiches={selectedNiches}
            domainScores={domainScores}
            onAddDomain={() => navigate('/profile/domains')}
            onRemoveDomain={toggleDomain}
          />
        </section>

        {/* Last Activity */}
        <section className="pp-section">
          <h3 className="pp-section-title">Last Activity</h3>
          <LastActivitySection
            items={activityItems}
            loading={activityLoading}
            walletAddress={address}
          />
        </section>

      </div>
    </div>
  )
}
