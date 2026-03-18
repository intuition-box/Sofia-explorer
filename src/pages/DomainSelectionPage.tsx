import { useNavigate } from 'react-router-dom'
import { useDomainSelection } from '@/hooks/useDomainSelection'
import DomainSelector from '@/components/profile/DomainSelector'
import PageHeader from '@/components/PageHeader'
import '@/components/styles/pages.css'

export default function DomainSelectionPage() {
  const navigate = useNavigate()
  const { selectedDomains, toggleDomain } = useDomainSelection()

  return (
    <div>
      <PageHeader color="#ffffff" glow="rgba(255,255,255,0.2)" title="Select Domains" subtitle="Choose your areas of interest" />
      <div className="page-content page-enter">
        <DomainSelector
          selectedDomains={selectedDomains}
          onToggle={toggleDomain}
          onContinue={() => navigate('/profile')}
          onBack={() => navigate('/profile')}
        />
      </div>
    </div>
  )
}
