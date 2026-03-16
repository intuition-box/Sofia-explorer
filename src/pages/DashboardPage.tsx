import { useState } from 'react'
import { SpacesNav } from '../components/SpacesNav'
import { Card } from '../components/ui/card'
import { Compass } from 'lucide-react'

export default function DashboardPage() {
  const [activeSpace, setActiveSpace] = useState('all')

  return (
    <div className="space-y-4">
      <SpacesNav activeSpace={activeSpace} onSpaceChange={setActiveSpace} />

      {/* Empty feed placeholder */}
      <Card className="p-12 text-center">
        <Compass className="h-12 w-12 mx-auto text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-medium">Your Feed</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Connect platforms and join your trust circle to see activity here.
        </p>
      </Card>
    </div>
  )
}
