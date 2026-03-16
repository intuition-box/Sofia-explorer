import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Share2 } from 'lucide-react'

interface ProfileHeaderProps {
  walletAddress: string
  ensName?: string
  avatar?: string
  stats: { label: string; value: string }[]
  onShare?: () => void
  sharing?: boolean
}

export default function ProfileHeader({
  walletAddress,
  ensName,
  avatar,
  stats,
  onShare,
  sharing,
}: ProfileHeaderProps) {
  const displayName = ensName || walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
  const initials = (ensName || walletAddress).slice(0, 2).toUpperCase()

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {avatar && <AvatarImage src={avatar} alt={displayName} />}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{displayName}</h1>
          {ensName && (
            <p className="text-sm text-muted-foreground">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </p>
          )}
        </div>
        {onShare && (
          <Button size="sm" variant="outline" onClick={onShare} disabled={sharing}>
            <Share2 className="h-4 w-4 mr-1" />
            {sharing ? 'Sharing...' : 'Share'}
          </Button>
        )}
      </div>
      <div className="mt-4 flex gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-lg font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
