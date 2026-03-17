import { useReputationScores } from '../../hooks/useReputationScores'
import type { ConnectionStatus } from '../../types/reputation'
import { DOMAIN_BY_ID } from '../../config/taxonomy'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { ArrowLeft } from 'lucide-react'

interface ScoreViewProps {
  selectedDomains: string[]
  selectedNiches: string[]
  getStatus: (platformId: string) => ConnectionStatus
  onBack: () => void
}

export default function ScoreView({
  selectedDomains,
  selectedNiches,
  getStatus,
  onBack,
}: ScoreViewProps) {
  const scores = useReputationScores(getStatus, selectedDomains, selectedNiches)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-bold">Reputation Scores</h2>
      </div>

      {(!scores || scores.domains.length === 0) && (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Connect platforms to see your reputation scores.
        </Card>
      )}

      {scores && scores.domains.length > 0 && (
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {scores.domains.map((ds) => {
            const domain = DOMAIN_BY_ID.get(ds.domainId)
            return (
              <Card key={ds.domainId} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm">{domain?.label ?? ds.domainId}</span>
                  <span className="text-lg font-bold">{ds.score}</span>
                </div>
                <Progress value={ds.score} className="h-2" />
                {ds.topNiches.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {ds.topNiches.slice(0, 3).map((ns) => (
                      <div key={ns.nicheId} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{ns.nicheId}</span>
                        <span>{ns.score}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
