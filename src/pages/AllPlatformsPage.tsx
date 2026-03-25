import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTopicSelection } from '@/hooks/useDomainSelection'
import { usePlatformConnections } from '@/hooks/usePlatformConnections'
import { usePlatformMarket } from '@/hooks/usePlatformMarket'
import PlatformGrid from '@/components/profile/PlatformGrid'
import PlatformMarketCard from '@/components/PlatformMarketCard'
import PageHeader from '@/components/PageHeader'
import SofiaLoader from '@/components/ui/SofiaLoader'
import { PAGE_COLORS } from '@/config/pageColors'
import { ATOM_ID_TO_PLATFORM } from '@/config/atomIds'
import '@/components/styles/pages.css'

export default function AllPlatformsPage() {
  const { selectedCategories } = useTopicSelection()
  const { getStatus, getConnection, connect, disconnect, startChallenge, verifyChallengeCode } = usePlatformConnections()
  const { ranked, isLoading: marketsLoading } = usePlatformMarket()
  const navigate = useNavigate()
  const pc = PAGE_COLORS['/profile/platforms']
  const [tab, setTab] = useState<'markets' | 'connect'>('markets')

  return (
    <div>
      <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />
      <div className="page-content page-enter">

        {/* Tab switcher */}
        <div className="ip-tabs" style={{ marginBottom: 16 }}>
          <button
            className={`ip-tab ${tab === 'markets' ? 'ip-tab--active' : ''}`}
            onClick={() => setTab('markets')}
          >
            Markets
          </button>
          <button
            className={`ip-tab ${tab === 'connect' ? 'ip-tab--active' : ''}`}
            onClick={() => setTab('connect')}
          >
            Connect
          </button>
        </div>

        {tab === 'markets' ? (
          marketsLoading ? (
            <div className="ip-loader"><SofiaLoader size={48} /></div>
          ) : (
            <div className="pm-grid">
              {ranked.map((market) => {
                const slug = ATOM_ID_TO_PLATFORM.get(market.termId) || ''
                return (
                  <PlatformMarketCard
                    key={market.termId}
                    market={market}
                    platformSlug={slug}
                  />
                )
              })}
            </div>
          )
        ) : (
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
        )}
      </div>
    </div>
  )
}
