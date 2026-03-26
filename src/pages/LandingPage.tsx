import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivy, useLogin } from '@privy-io/react-auth'
import { useTheme } from '@/hooks/useTheme'
import { Shield, Vote, Flame, Link2 } from 'lucide-react'
import '@/components/styles/landing.css'

export default function LandingPage() {
  const { ready, authenticated } = usePrivy()
  const { login } = useLogin({
    onComplete: () => navigate('/profile'),
  })
  const navigate = useNavigate()
  const { theme } = useTheme()

  // If already authenticated, redirect to profile
  useEffect(() => {
    if (ready && authenticated) {
      navigate('/profile', { replace: true })
    }
  }, [ready, authenticated, navigate])

  if (!ready) return null

  const features = [
    {
      icon: <Shield className="h-5 w-5" />,
      color: 'oklch(0.65 0.15 250)',
      title: 'Reputation',
      desc: 'Build verifiable scores from your real activity',
    },
    {
      icon: <Vote className="h-5 w-5" />,
      color: 'oklch(0.65 0.15 150)',
      title: 'Vote',
      desc: 'Support or oppose claims on-chain',
    },
    {
      icon: <Flame className="h-5 w-5" />,
      color: 'oklch(0.65 0.18 30)',
      title: 'Streaks',
      desc: 'Earn rewards for daily certifications',
    },
    {
      icon: <Link2 className="h-5 w-5" />,
      color: 'oklch(0.65 0.15 300)',
      title: 'EthCC Import',
      desc: 'Link your EthCC wallet to boost your score',
    },
  ]

  return (
    <div className="lp-container">
      <div className="lp-content">
        {/* Logo */}
        <div className="lp-logo">
          <img
            src={theme === 'dark' ? '/logo.png' : '/logo_invert.png'}
            alt="Sofia"
          />
          <h1>Sofia</h1>
        </div>

        {/* Tagline */}
        <h2 className="lp-tagline">
          Build your behavioral reputation on-chain
        </h2>
        <p className="lp-subtitle">
          Track your browsing intents, connect platforms, certify your interests, and build a verifiable reputation profile powered by the Intuition protocol.
        </p>

        {/* CTA */}
        <div className="lp-cta">
          <button className="lp-btn-connect" onClick={() => login()}>
            Connect
          </button>
          <button className="lp-btn-explore" onClick={() => navigate('/feed')}>
            Explore
          </button>
        </div>

        {/* Features */}
        <div className="lp-features">
          {features.map((f) => (
            <div key={f.title} className="lp-feature">
              <div
                className="lp-feature-icon"
                style={{
                  background: `color-mix(in oklab, ${f.color} 15%, transparent)`,
                  color: f.color,
                }}
              >
                {f.icon}
              </div>
              <span className="lp-feature-title">{f.title}</span>
              <span className="lp-feature-desc">{f.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
