import { useState, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { RightSidebar } from './components/RightSidebar'
import CartDrawer from './components/CartDrawer'
import WeightModal from './components/WeightModal'
import { useCart } from './hooks/useCart'
import DashboardPage from './pages/DashboardPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import StreaksPage from './pages/StreaksPage'
import VotePage from './pages/VotePage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'

export default function App() {
  const location = useLocation()
  const isCallback = location.pathname === '/auth/callback'
  const cart = useCart()
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
      <RightSidebar />

      <CartDrawer
        items={cart.items}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onRemove={cart.removeItem}
        onClear={cart.clear}
        onSubmit={handleCartSubmit}
      />

      <WeightModal
        isOpen={weightModalOpen}
        items={cart.items}
        onClose={() => setWeightModalOpen(false)}
        onSuccess={handleDepositSuccess}
      />

      <main style={{ marginLeft: 262, marginRight: 262, paddingTop: 56, paddingBottom: 48, paddingLeft: 12, paddingRight: 12, zoom: 1.50 }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/streaks" element={<StreaksPage />} />
          <Route path="/vote" element={<VotePage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        </Routes>
      </main>
    </div>
  )
}
