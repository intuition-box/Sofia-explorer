import { rewards } from '../data'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'

export default function HowRewards() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">How Rewards Work</CardTitle>
        <Button size="sm" variant="outline">Install Sofia</Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {rewards.map((reward, i) => (
            <div key={i} className="flex flex-col items-center rounded-lg border p-4 text-center">
              {reward.icon.endsWith('.png') ? (
                <img src={reward.icon} alt={reward.title} className="h-10 w-10 mb-2" />
              ) : (
                <span className="text-2xl mb-2">{reward.icon}</span>
              )}
              <h4 className="font-medium text-sm">{reward.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{reward.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
