import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { DOMAIN_BY_ID } from '@/config/taxonomy'
import type { DomainScore } from '@/types/reputation'
import { Card } from '../ui/card'

interface InterestsGridProps {
  selectedDomains: string[]
  selectedNiches: string[]
  domainScores: DomainScore[]
  onAddDomain?: () => void
  onRemoveDomain?: (domainId: string) => void
}

export default function InterestsGrid({ selectedDomains, selectedNiches, domainScores, onAddDomain, onRemoveDomain }: InterestsGridProps) {
  const navigate = useNavigate()

  if (selectedDomains.length === 0) {
    return (
      <div className="ig-grid">
        <Card className="ig-add-card" onClick={onAddDomain}>
          <Plus className="ig-add-icon" />
          <span className="ig-add-label">Add Interest</span>
        </Card>
      </div>
    )
  }

  const scoreMap = new Map(domainScores.map((d) => [d.domainId, d]))

  return (
    <div className="ig-grid">
      {selectedDomains.map((domainId) => {
        const domain = DOMAIN_BY_ID.get(domainId)
        if (!domain) return null

        const nicheCount = domain.categories
          .flatMap((c) => c.niches)
          .filter((n) => selectedNiches.includes(n.id)).length

        const score = scoreMap.get(domainId)

        return (
          <Card
            key={domainId}
            className="ig-card"
            style={{ borderTop: `3px solid ${domain.color}` }}
            onClick={() => navigate(`/profile/interest/${domainId}`)}
          >
            <div className="ig-card-header">
              <div className="ig-card-icon" style={{ background: `${domain.color}20`, color: domain.color }}>
                {domain.label.slice(0, 2).toUpperCase()}
              </div>
              <div className="ig-card-meta">
                <span className="ig-card-label">{domain.label}</span>
                <span className="ig-card-niches">{nicheCount} niche{nicheCount !== 1 ? 's' : ''}</span>
              </div>
              <button
                className="ig-card-remove"
                onClick={(e) => { e.stopPropagation(); onRemoveDomain?.(domainId) }}
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {score && (
              <div className="ig-card-score">
                <span className="ig-card-score-value">{score.score}</span>
                <span className="ig-card-score-label">Score</span>
              </div>
            )}
          </Card>
        )
      })}

      {/* Add domain card */}
      <Card className="ig-add-card" onClick={onAddDomain}>
        <Plus className="ig-add-icon" />
        <span className="ig-add-label">Add Interest</span>
      </Card>
    </div>
  )
}
