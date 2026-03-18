import { useParams, useNavigate } from 'react-router-dom'
import { DOMAIN_BY_ID } from '@/config/taxonomy'
import { useDomainSelection } from '@/hooks/useDomainSelection'
import NicheSelector from '@/components/profile/NicheSelector'
import PageHeader from '@/components/PageHeader'
import '@/components/styles/pages.css'

export default function DomainNicheSelectionPage() {
  const { domainId } = useParams<{ domainId: string }>()
  const navigate = useNavigate()
  const domain = domainId ? DOMAIN_BY_ID.get(domainId) : undefined
  const { selectedNiches, toggleNiche } = useDomainSelection()

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
      <PageHeader color={color} glow={glow} title={`${domain.label} Niches`} subtitle="Select your areas of expertise" />
      <div className="page-content page-enter">
        <NicheSelector
          selectedDomains={[domainId!]}
          selectedNiches={selectedNiches}
          onToggleNiche={toggleNiche}
          onBack={() => navigate(`/profile/interest/${domainId}`)}
          onContinue={() => navigate(`/profile/interest/${domainId}`)}
        />
      </div>
    </div>
  )
}
