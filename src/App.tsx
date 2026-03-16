import { Routes, Route } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ResonancePage from './pages/ResonancePage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/resonance" element={<ResonancePage />} />
        <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      </Routes>
    </div>
  )
}
