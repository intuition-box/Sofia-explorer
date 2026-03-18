import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivy, useLogin } from '@privy-io/react-auth'
import { useDomainSelection } from '../hooks/useDomainSelection'
import { usePlatformConnections } from '../hooks/usePlatformConnections'
import { useReputationScores } from '../hooks/useReputationScores'
import { useUserActivity } from '../hooks/useUserActivity'
import { useTopClaims } from '../hooks/useTopClaims'
import { useCart } from '../hooks/useCart'
import type { CartItem } from '../hooks/useCart'
import LastActivitySection from '../components/profile/LastActivitySection'
import InterestsGrid from '../components/profile/InterestsGrid'
import TopClaimsSection from '../components/profile/TopClaimsSection'
import PredicatePicker from '../components/PredicatePicker'
import type { CircleItem } from '../services/circleService'
import { INTENTION_COLORS } from '../config/intentions'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Wallet } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { PAGE_COLORS } from '../config/pageColors'
import '@/components/styles/pages.css'
import '@/components/styles/profile-sections.css'

export default function ProfilePage() {
  const { authenticated, user } = usePrivy()
  const { login } = useLogin()
  const address = user?.wallet?.address ?? ''
  const { selectedDomains, selectedNiches, toggleDomain } = useDomainSelection()
  const navigate = useNavigate()
  const { getStatus } = usePlatformConnections()
  const scores = useReputationScores(getStatus, selectedDomains, selectedNiches)
  const domainScores = scores?.domains ?? []
  const { items: activityItems, loading: activityLoading } = useUserActivity(address || undefined)
  const { claims: topClaims, loading: claimsLoading } = useTopClaims(activityItems, address || undefined)
  const cart = useCart()
  const [predicatePicker, setPredicatePicker] = useState<{ side: 'support' | 'oppose'; item: CircleItem } | null>(null)

  /** Called when user clicks Add Value on a card — same logic as DashboardPage Support */
  const handleAddValue = useCallback((item: CircleItem) => {
    if (!authenticated) return
    const side: 'support' | 'oppose' = 'support'

    const available = item.intentions.filter((intent) => {
      const vault = item.intentionVaults[intent]
      if (!vault) return false
      return !!vault.termId
    })

    if (available.length === 0) return

    if (available.length === 1) {
      const intent = available[0]
      const vault = item.intentionVaults[intent]
      const color = INTENTION_COLORS[intent] ?? '#888'
      cart.addItem({
        id: `${vault.termId}-${side}`,
        side,
        termId: vault.termId,
        intention: intent,
        title: item.title,
        favicon: item.favicon,
        intentionColor: color,
      })
    } else {
      setPredicatePicker({ side, item })
    }
  }, [authenticated, cart])

  /** Called from PredicatePicker when user confirms selection */
  const handlePredicateConfirm = useCallback((selectedIntentions: string[]) => {
    if (!predicatePicker) return
    const { side, item } = predicatePicker
    const newItems: CartItem[] = selectedIntentions.map((intent) => {
      const vault = item.intentionVaults[intent]
      const color = INTENTION_COLORS[intent] ?? '#888'
      return {
        id: `${vault.termId}-${side}`,
        side,
        termId: side === 'support' ? vault.termId : vault.counterTermId,
        intention: intent,
        title: item.title,
        favicon: item.favicon,
        intentionColor: color,
      }
    })
    cart.addItems(newItems)
    setPredicatePicker(null)
  }, [predicatePicker, cart])

  if (!authenticated) {
    return (
      <Card className="p-8 text-center">
        <Wallet className="h-10 w-10 mx-auto text-muted-foreground/40" />
        <h2 className="mt-4 text-lg font-bold">Connect your wallet</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Connect your wallet to access your profile, select domains, connect platforms, and view your reputation scores.
        </p>
        <Button className="mt-4" onClick={() => login()}>
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
      </Card>
    )
  }

  const pc = PAGE_COLORS['/profile']

  return (
    <div>
      <PageHeader color={pc.color} glow={pc.glow} title={pc.title} subtitle={pc.subtitle} />
      <div className="pp-sections page-content page-enter">

        {/* Top Claims */}
        {(activityLoading || claimsLoading || topClaims.length > 0) && (
          <section className="pp-section">
            <h3 className="pp-section-title">Top Claims</h3>
            <TopClaimsSection
              claims={topClaims}
              loading={activityLoading || claimsLoading}
              onAddValue={handleAddValue}
            />
          </section>
        )}

        {/* Last Activity */}
        <section className="pp-section">
          <h3 className="pp-section-title">Last Activity</h3>
          <LastActivitySection
            items={activityItems}
            loading={activityLoading}
            walletAddress={address}
            onAddValue={handleAddValue}
          />
        </section>

        {/* Interests */}
        <section className="pp-section">
          <h3 className="pp-section-title">My Interests</h3>
          <InterestsGrid
            selectedDomains={selectedDomains}
            selectedNiches={selectedNiches}
            domainScores={domainScores}
            onAddDomain={() => navigate('/profile/domains')}
            onRemoveDomain={toggleDomain}
          />
        </section>

      </div>

      {/* Predicate Picker modal */}
      {predicatePicker && (
        <PredicatePicker
          isOpen
          side={predicatePicker.side}
          item={predicatePicker.item}
          onConfirm={handlePredicateConfirm}
          onClose={() => setPredicatePicker(null)}
        />
      )}

    </div>
  )
}
