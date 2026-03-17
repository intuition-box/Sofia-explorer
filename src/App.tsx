import { Routes, Route, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { RightSidebar } from './components/RightSidebar'
import DashboardPage from './pages/DashboardPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import StreaksPage from './pages/StreaksPage'
import VotePage from './pages/VotePage'
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

      <main style={{ marginLeft: 256, marginRight: 288, paddingTop: 56, paddingBottom: 48, paddingLeft: 0, paddingRight: 0, zoom: 1.50 }}>
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
