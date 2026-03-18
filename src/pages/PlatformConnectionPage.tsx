import { useParams, useNavigate } from 'react-router-dom'
import { DOMAIN_BY_ID } from '@/config/taxonomy'
import { getPlatformsByDomain } from '@/config/platformCatalog'
import { useDomainSelection } from '@/hooks/useDomainSelection'
import { usePlatformConnections } from '@/hooks/usePlatformConnections'
import PlatformGrid from '@/components/profile/PlatformGrid'
import PageHeader from '@/components/PageHeader'
import '@/components/styles/pages.css'

export default function PlatformConnectionPage() {
  const { domainId } = useParams<{ domainId: string }>()
  const navigate = useNavigate()
  const domain = domainId ? DOMAIN_BY_ID.get(domainId) : undefined
  const { selectedNiches } = useDomainSelection()
  const { getStatus, getConnection, connect, disconnect, startChallenge, verifyChallengeCode } = usePlatformConnections()

  const platforms = domainId ? getPlatformsByDomain(domainId) : []

  if (!domain) {
    return (
      <div className="page-content page-enter">
        <p className="text-sm text-muted-foreground">Domain not found.</p>
      </div>
    )
  }

  const color = domain.color
  const glow = `${color}66`

  return (
    <div>
      <PageHeader color={color} glow={glow} title={`${domain.label} Platforms`} subtitle={`${platforms.length} platforms available`} />
      <div className="page-content page-enter">
        <PlatformGrid
          selectedNiches={selectedNiches}
          getStatus={getStatus}
          getConnection={getConnection}
          onConnect={connect}
          onDisconnect={disconnect}
          onStartChallenge={startChallenge}
          onVerifyChallenge={verifyChallengeCode}
          onBack={() => navigate(`/profile/interest/${domainId}`)}
          platforms={platforms}
          currentDomain={domainId}
        />
      </div>
    </div>
  )
}
