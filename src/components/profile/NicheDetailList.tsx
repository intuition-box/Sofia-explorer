import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import { getNichesForDomain } from '@/config/taxonomy'
import type { NicheScore } from '@/types/reputation'
import { Card } from '../ui/card'

interface NicheDetailListProps {
  domainId: string
  domainColor: string
  selectedNiches: string[]
  nicheScores: NicheScore[]
  onToggleNiche: (nicheId: string) => void
}

export default function NicheDetailList({ domainId, domainColor, selectedNiches, nicheScores, onToggleNiche }: NicheDetailListProps) {
  const navigate = useNavigate()
  const scoreMap = useMemo(() => new Map(nicheScores.map((s) => [s.nicheId, s])), [nicheScores])

  const allNiches = useMemo(() => {
    return getNichesForDomain(domainId)
  }, [domainId])

  const selected = allNiches.filter((n) => selectedNiches.includes(n.id))

  if (selected.length === 0) {
    return (
      <div className="ip-niches-grid">
        <Card className="ip-niche-add" onClick={() => navigate(`/profile/interest/${domainId}/niches`)}>
          <Plus className="ip-niche-add-icon" />
          <span className="ip-niche-add-label">Add Niche</span>
        </Card>
      </div>
    )
  }

  return (
    <div className="ip-niches-grid">
      {selected.map((niche) => {
        const nicheScore = scoreMap.get(niche.id)
        const score = nicheScore?.score ?? 0

        return (
          <Card
            key={niche.id}
            className="ip-niche-card"
            style={{ borderTop: `3px solid ${domainColor}` }}
          >
            <div className="ip-niche-header">
              <div className="ip-niche-icon" style={{ background: `${domainColor}20`, color: domainColor }}>
                {niche.label.slice(0, 2).toUpperCase()}
              </div>
              <div className="ip-niche-meta">
                <span className="ip-niche-label">{niche.label}</span>
              </div>
              <button
                className="ip-niche-remove"
                onClick={() => onToggleNiche(niche.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            <div className="ip-niche-score-row">
              <span className="ip-niche-score-value" style={{ color: domainColor }}>{score}</span>
              <span className="ip-niche-score-label">Score</span>
            </div>

            {nicheScore && (
              <div className="ip-niche-breakdown">
                {(['creation', 'regularity', 'community', 'monetization', 'anciennete'] as const).map((key) => {
                  const val = nicheScore.breakdown[key]
                  return (
                    <div key={key} className="ip-niche-bd-item">
                      <div className="ip-niche-bd-bar">
                        <div className="ip-niche-bd-bar-fill" style={{ width: `${val}%`, background: `${domainColor}80` }} />
                      </div>
                      <span className="ip-niche-bd-label">{key.slice(0, 4)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        )
      })}

      <Card className="ip-niche-add" onClick={() => navigate(`/profile/interest/${domainId}/niches`)}>
        <Plus className="ip-niche-add-icon" />
        <span className="ip-niche-add-label">Add Niche</span>
      </Card>
    </div>
  )
}
