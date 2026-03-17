import { useTrending } from '../hooks/useTrending'
import type { IntentCategory } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { TrendingUp } from 'lucide-react'

const CATEGORY_LABELS: Record<IntentCategory, string> = {
  trusted: 'Trusted',
  distrusted: 'Distrusted',
  work: 'Work',
  learning: 'Learning',
  fun: 'Fun',
  inspiration: 'Inspiration',
}

export default function TrendingPages() {
  const { items, loading, error } = useTrending()

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp className="h-4 w-4" />
          Trending Pages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {error && <p className="text-sm text-destructive">{error}</p>}

          {loading &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px' }}>
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}

          {!loading &&
            items.map((item) => (
              <a
                key={item.category}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:bg-muted/50 rounded transition-colors"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', textDecoration: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                  <img src={item.favicon} alt="" style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <p className="text-sm font-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.domain}</p>
                    <p className="text-xs text-muted-foreground">{item.certifiers} certifiers</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs" style={{ flexShrink: 0, marginLeft: 8 }}>
                  {CATEGORY_LABELS[item.category]}
                </Badge>
              </a>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
