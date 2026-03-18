import { useNavigate } from 'react-router-dom'
import { useDomainSelection } from '@/hooks/useDomainSelection'
import NicheSelector from '@/components/profile/NicheSelector'
import PageHeader from '@/components/PageHeader'
import '@/components/styles/pages.css'

export default function NicheSelectionPage() {
  const navigate = useNavigate()
  const { selectedDomains, selectedNiches, toggleNiche } = useDomainSelection()

  return (
    <div>
      <PageHeader color="#ffffff" glow="rgba(255,255,255,0.2)" title="Select Niches" subtitle="Refine your areas of expertise" />
      <div className="page-content page-enter">
        <NicheSelector
          selectedDomains={selectedDomains}
          selectedNiches={selectedNiches}
          onToggleNiche={toggleNiche}
          onBack={() => navigate('/profile')}
          onContinue={() => navigate('/profile')}
        />
      </div>
    </div>
  )
}
