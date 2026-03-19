import { useState, useCallback, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
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
import PlatformConnectionPage from './pages/PlatformConnectionPage'
import DomainNicheSelectionPage from './pages/DomainNicheSelectionPage'
import AllPlatformsPage from './pages/AllPlatformsPage'
import ScoresPage from './pages/ScoresPage'
import StreaksPage from './pages/StreaksPage'
import VotePage from './pages/VotePage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import './components/styles/layout.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { ready, authenticated } = usePrivy()
  if (!ready) return null
  if (!authenticated) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const location = useLocation()
  const isCallback = location.pathname === '/auth/callback'
  const cart = useCart()
  const isProfilePage = location.pathname.startsWith('/profile')
  const [cartOpen, setCartOpen] = useState(false)
  const [weightModalOpen, setWeightModalOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

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
          {/* Public routes */}
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />

          {/* Protected routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/profile/interest/:domainId" element={<ProtectedRoute><InterestPage /></ProtectedRoute>} />
          <Route path="/profile/interest/:domainId/platforms" element={<ProtectedRoute><PlatformConnectionPage /></ProtectedRoute>} />
          <Route path="/profile/interest/:domainId/niches" element={<ProtectedRoute><DomainNicheSelectionPage /></ProtectedRoute>} />
          <Route path="/profile/domains" element={<ProtectedRoute><DomainSelectionPage /></ProtectedRoute>} />
          <Route path="/profile/niches" element={<ProtectedRoute><NicheSelectionPage /></ProtectedRoute>} />
          <Route path="/platforms" element={<ProtectedRoute><AllPlatformsPage /></ProtectedRoute>} />
          <Route path="/scores" element={<ProtectedRoute><ScoresPage /></ProtectedRoute>} />
          <Route path="/streaks" element={<ProtectedRoute><StreaksPage /></ProtectedRoute>} />
          <Route path="/vote" element={<ProtectedRoute><VotePage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
