import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ResonancePage from './pages/ResonancePage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'

export default function App() {
  const location = useLocation()
  const isCallback = location.pathname === '/auth/callback'

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!isCallback && <Navbar />}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/resonance" element={<ResonancePage />} />
          <Route path="/auth/callback" element={<OAuthCallbackPage />} />
        </Routes>
      </main>
    </div>
  )
}
