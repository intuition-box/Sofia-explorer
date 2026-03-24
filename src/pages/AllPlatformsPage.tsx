import { useNavigate } from 'react-router-dom'
import { useTopicSelection } from '@/hooks/useDomainSelection'
import { usePlatformConnections } from '@/hooks/usePlatformConnections'
import PlatformGrid from '@/components/profile/PlatformGrid'
import PageHeader from '@/components/PageHeader'
import { PAGE_COLORS } from '@/config/pageColors'
import '@/components/styles/pages.css'

export default function AllPlatformsPage() {
  const { selectedCategories } = useTopicSelection()
  const { getStatus, getConnection, connect, disconnect, startChallenge, verifyChallengeCode } = usePlatformConnections()
  const navigate = useNavigate()
  const pc = PAGE_COLORS['/profile/platforms']

  return (
    <div>
      <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />
      <div className="page-content page-enter">
        <PlatformGrid
          selectedCategories={selectedCategories}
          getStatus={getStatus}
          getConnection={getConnection}
          onConnect={connect}
          onDisconnect={disconnect}
          onStartChallenge={startChallenge}
          onVerifyChallenge={verifyChallengeCode}
          onBack={() => navigate(-1)}
        />
      </div>
    </div>
  )
}
