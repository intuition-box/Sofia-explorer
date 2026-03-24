import { useNavigate } from 'react-router-dom'
import { useTopicSelection } from '@/hooks/useDomainSelection'
import DomainSelector from '@/components/profile/DomainSelector'
import PageHeader from '@/components/PageHeader'
import '@/components/styles/pages.css'

export default function DomainSelectionPage() {
  const navigate = useNavigate()
  const { selectedTopics, toggleTopic } = useTopicSelection()

  return (
    <div>
      <PageHeader color="#ffffff" glow="rgba(255,255,255,0.2)" title="Select Topics" subtitle="Choose your areas of interest" />
      <div className="page-content page-enter">
        <DomainSelector
          selectedTopics={selectedTopics}
          onToggle={toggleTopic}
          onContinue={() => navigate('/profile')}
          onBack={() => navigate('/profile')}
        />
      </div>
    </div>
  )
}
