import { useState } from 'react'
import { Link2, Unlink } from 'lucide-react'
import type { EthccSofiaSignals } from '../../types/reputation'
import '../styles/ethcc.css'

interface Props {
  ethccWallet: string | null
  signals: EthccSofiaSignals | null
  loading: boolean
  onConnect: (address: string) => void
  onDisconnect: () => void
}

export default function EthccConnectCard({
  ethccWallet,
  signals,
  loading,
  onConnect,
  onDisconnect,
}: Props) {
  const [input, setInput] = useState('')

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(input.trim())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isValidAddress) {
      onConnect(input.trim())
      setInput('')
    }
  }

  const topicCount = signals?.topicVotes.length ?? 0
  const trackCount = signals?.trackInterests.length ?? 0
  const domainCount = Object.keys(signals?.domainSignals ?? {}).length

  return (
    <div className="ec-card">
      <div className="ec-header">
        <div className="ec-icon">
          <Link2 size={18} />
        </div>
        <div>
          <div className="ec-title">EthCC Wallet</div>
          <div className="ec-subtitle">
            {ethccWallet
              ? 'On-chain interests linked'
              : 'Link your EthCC embedded wallet to improve your experience '}
          </div>
        </div>
      </div>

      {!ethccWallet ? (
        <form className="ec-form" onSubmit={handleSubmit}>
          <input
            className="ec-input"
            placeholder="0x..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
          <button
            className="ec-btn"
            type="submit"
            disabled={!isValidAddress}
          >
            Link Wallet
          </button>
        </form>
      ) : loading ? (
        <div className="ec-loading">
          <div className="ec-spinner" />
          Fetching on-chain interests...
        </div>
      ) : (
        <div className="ec-connected">
          <span className="ec-address">
            {ethccWallet.slice(0, 6)}...{ethccWallet.slice(-4)}
          </span>
          <div className="ec-stats">
            <span><span className="ec-stat-value">{topicCount}</span> topics</span>
            <span><span className="ec-stat-value">{trackCount}</span> tracks</span>
            <span><span className="ec-stat-value">{domainCount}</span> domains</span>
          </div>
          <button className="ec-disconnect" onClick={onDisconnect}>
            <Unlink size={12} style={{ marginRight: 4, display: 'inline' }} />
            Unlink
          </button>
        </div>
      )}
    </div>
  )
}
