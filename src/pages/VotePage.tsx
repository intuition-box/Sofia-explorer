import { useState } from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { ThumbsUp, ThumbsDown, ChevronRight, ChevronLeft, Vote } from 'lucide-react'

interface Claim {
  id: string
  title: string
  description: string
  category: string
  supportCount: number
  opposeCount: number
}

// Placeholder claims — in production these come from Intuition protocol
const CLAIMS: Claim[] = [
  {
    id: '1',
    title: 'Fiverr is better than Upwork',
    description: 'Both are freelancer marketplaces, but Fiverr offers more accessible pricing for buyers.',
    category: 'work',
    supportCount: 142,
    opposeCount: 89,
  },
  {
    id: '2',
    title: 'Cursor is the best AI code editor',
    description: 'Cursor has redefined AI-assisted development with its inline copilot features.',
    category: 'tech',
    supportCount: 231,
    opposeCount: 67,
  },
  {
    id: '3',
    title: 'Bitcoin will reach $200k in 2026',
    description: 'With institutional adoption growing, Bitcoin could hit $200k this cycle.',
    category: 'crypto',
    supportCount: 312,
    opposeCount: 198,
  },
  {
    id: '4',
    title: 'Remote work is more productive',
    description: 'Studies show remote workers are on average more productive than office workers.',
    category: 'work',
    supportCount: 567,
    opposeCount: 234,
  },
  {
    id: '5',
    title: 'React is better than Vue for large apps',
    description: 'React ecosystem maturity makes it more suitable for enterprise applications.',
    category: 'tech',
    supportCount: 189,
    opposeCount: 156,
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  work: 'bg-blue-500/10 text-blue-500',
  tech: 'bg-purple-500/10 text-purple-500',
  crypto: 'bg-amber-500/10 text-amber-500',
}

export default function VotePage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [votes, setVotes] = useState<Record<string, 'support' | 'oppose'>>({})

  const claim = CLAIMS[currentIndex]
  const totalVotes = claim.supportCount + claim.opposeCount
  const supportPercent = Math.round((claim.supportCount / totalVotes) * 100)
  const userVote = votes[claim.id]

  const handleVote = (type: 'support' | 'oppose') => {
    setVotes((prev) => ({ ...prev, [claim.id]: type }))
  }

  const next = () => setCurrentIndex((i) => Math.min(i + 1, CLAIMS.length - 1))
  const prev = () => setCurrentIndex((i) => Math.max(i - 1, 0))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Vote className="h-5 w-5" />
          Vote
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Support or oppose claims. Your vote is weighted by your reputation.
        </p>
      </div>

      {/* Card navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prev} disabled={currentIndex === 0}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} / {CLAIMS.length}
        </span>
        <Button variant="ghost" size="icon" onClick={next} disabled={currentIndex === CLAIMS.length - 1}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Claim card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={CATEGORY_COLORS[claim.category] ?? 'bg-muted'}>
            {claim.category}
          </Badge>
          <span className="text-xs text-muted-foreground">{totalVotes} votes</span>
        </div>

        <h2 className="text-lg font-bold">{claim.title}</h2>
        <p className="text-sm text-muted-foreground">{claim.description}</p>

        {/* Vote bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-green-500">Support {supportPercent}%</span>
            <span className="text-red-500">Oppose {100 - supportPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden flex">
            <div className="bg-green-500 transition-all" style={{ width: `${supportPercent}%` }} />
            <div className="bg-red-500 flex-1" />
          </div>
        </div>

        {/* Vote buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            className="flex-1"
            variant={userVote === 'support' ? 'default' : 'outline'}
            onClick={() => handleVote('support')}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Support
          </Button>
          <Button
            className="flex-1"
            variant={userVote === 'oppose' ? 'destructive' : 'outline'}
            onClick={() => handleVote('oppose')}
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            Oppose
          </Button>
        </div>

        {userVote && (
          <p className="text-xs text-center text-muted-foreground">
            You voted to {userVote} this claim.
          </p>
        )}
      </Card>

      {/* Recent claims list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">All Claims</h3>
        {CLAIMS.map((c, i) => {
          const total = c.supportCount + c.opposeCount
          const pct = Math.round((c.supportCount / total) * 100)
          const voted = votes[c.id]
          return (
            <Card
              key={c.id}
              className={`p-3 cursor-pointer hover:shadow-sm transition-shadow ${i === currentIndex ? 'ring-1 ring-primary' : ''}`}
              onClick={() => setCurrentIndex(i)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>
                    <span className="text-xs text-muted-foreground">{total} votes</span>
                    {voted && (
                      <Badge variant="outline" className="text-[10px]">
                        {voted === 'support' ? '👍' : '👎'} Voted
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right ml-3">
                  <span className="text-sm font-bold text-green-500">{pct}%</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
