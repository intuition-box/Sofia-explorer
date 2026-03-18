import { useState, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { RightSidebar } from './components/RightSidebar'
import CartDrawer from './components/CartDrawer'
import ProfileDrawer from './components/ProfileDrawer'
import WeightModal from './components/WeightModal'
import { useCart } from './hooks/useCart'
import DashboardPage from './pages/DashboardPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import InterestPage from './pages/InterestPage'
import DomainSelectionPage from './pages/DomainSelectionPage'
import NicheSelectionPage from './pages/NicheSelectionPage'
import StreaksPage from './pages/StreaksPage'
import VotePage from './pages/VotePage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import './components/styles/layout.css'

export default function App() {
  const location = useLocation()
  const isCallback = location.pathname === '/auth/callback'
  const cart = useCart()
  const isProfilePage = location.pathname.startsWith('/profile')
  const [cartOpen, setCartOpen] = useState(false)
  const [weightModalOpen, setWeightModalOpen] = useState(false)

  const handleCartSubmit = useCallback(() => {
    setCartOpen(false)
    setWeightModalOpen(true)
  }, [])

  const handleDepositSuccess = useCallback(() => {
    cart.clear()
  }, [cart])

  if (isCallback) {
    return <OAuthCallbackPage />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(o => !o)} />
      <Sidebar />
      <RightSidebar hidden={isProfilePage || cartOpen} />

      <CartDrawer
        items={cart.items}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onRemove={cart.removeItem}
        onClear={cart.clear}
        onSubmit={handleCartSubmit}
      />

      <ProfileDrawer
        isOpen={isProfilePage && !cartOpen}
        onClose={() => {}}
      />

      <WeightModal
        isOpen={weightModalOpen}
        items={cart.items}
        onClose={() => setWeightModalOpen(false)}
        onSuccess={handleDepositSuccess}
      />

      <main className={isProfilePage ? 'main-content main-content--profile' : 'main-content'} style={{ zoom: 1.25 }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/interest/:domainId" element={<InterestPage />} />
          <Route path="/profile/domains" element={<DomainSelectionPage />} />
          <Route path="/profile/niches" element={<NicheSelectionPage />} />
          <Route path="/streaks" element={<StreaksPage />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        </Routes>
      </main>
    </div>
  )
}
