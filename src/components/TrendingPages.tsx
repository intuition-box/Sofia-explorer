import { useTrending } from '../hooks/useTrending'
import type { IntentCategory } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'

const CATEGORY_LABELS: Record<IntentCategory, string> = {
  trusted: 'Trusted',
  distrusted: 'Distrusted',
  work: 'Work',
  learning: 'Learning',
  fun: 'Fun',
  inspiration: 'Inspiration',
}

const INTENT_COLORS: Record<IntentCategory, string> = {
  trusted: 'bg-green-100 text-green-800',
  distrusted: 'bg-red-100 text-red-800',
  work: 'bg-blue-100 text-blue-800',
  learning: 'bg-emerald-100 text-emerald-800',
  fun: 'bg-amber-100 text-amber-800',
  inspiration: 'bg-purple-100 text-purple-800',
}

export default function TrendingPages() {
  const { items, loading, error } = useTrending()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Trending Pages</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-3">
                <Skeleton className="h-6 w-6 rounded-full mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}

          {!loading &&
            items.map((item) => (
              <a
                key={item.category}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between">
                  <img src={item.favicon} alt="" className="h-5 w-5 rounded" />
                  <Badge variant="secondary" className={`text-[10px] ${INTENT_COLORS[item.category]}`}>
                    {CATEGORY_LABELS[item.category]}
                  </Badge>
                </div>
                <span className="text-sm font-medium truncate">{item.domain}</span>
                <span className="text-xs text-muted-foreground">{item.certifiers} certifiers</span>
              </a>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
