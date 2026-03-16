import { Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { RightSidebar } from './components/RightSidebar'
import DashboardPage from './pages/DashboardPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import ResonancePage from './pages/ResonancePage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'

export default function App() {
  const location = useLocation()
  const isCallback = location.pathname === '/auth/callback'

  if (isCallback) {
    return <OAuthCallbackPage />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <RightSidebar />

      {/* Main content centered between sidebars */}
      <main className="ml-64 mr-72 py-6 px-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/resonance" element={<ResonancePage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        </Routes>
      </main>
    </div>
  )
}
