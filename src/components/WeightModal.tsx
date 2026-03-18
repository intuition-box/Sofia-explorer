import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { useDeposit } from '../hooks/useDeposit'
import type { CartItem } from '../hooks/useCart'
import { EXPLORER_URL } from '../config'
import SofiaLoader from './ui/SofiaLoader'

const WEIGHT_OPTIONS = [0.01, 0.5, 1, 5, 10]

interface WeightModalProps {
  isOpen: boolean
  items: CartItem[]
  onClose: () => void
  onSuccess: () => void
}

export default function WeightModal({ isOpen, items, onClose, onSuccess }: WeightModalProps) {
  const [weights, setWeights] = useState<number[]>([])
  const [customValues, setCustomValues] = useState<string[]>([])
  const [balance, setBalance] = useState<string | null>(null)
  const { depositBatch, processing, txResult, reset, getBalance } = useDeposit()

  // Initialize weights when items change
  useEffect(() => {
    if (isOpen && items.length > 0) {
      setWeights(new Array(items.length).fill(0.5))
      setCustomValues(new Array(items.length).fill(''))
      reset()
      getBalance().then(setBalance)
    }
  }, [isOpen, items.length, getBalance, reset])

  const getAmount = (index: number) => {
    const cv = customValues[index]
    return cv?.trim() ? (parseFloat(cv) || 0) : (weights[index] ?? 0.5)
  }

  const totalDeposit = useMemo(() => {
    return items.reduce((sum, _, i) => sum + getAmount(i), 0)
  }, [items, weights, customValues])

  const balNum = balance ? parseFloat(balance) : 0

  const handleWeightSelect = (index: number, value: number) => {
    setWeights(prev => { const n = [...prev]; n[index] = value; return n })
    setCustomValues(prev => { const n = [...prev]; n[index] = ''; return n })
  }

  const handleCustomChange = (index: number, value: string) => {
    setCustomValues(prev => { const n = [...prev]; n[index] = value; return n })
  }

  const handleSubmit = async () => {
    const batchItems = items.map((item, i) => ({
      termId: item.termId,
      amountTrust: getAmount(i),
    }))
    const result = await depositBatch(batchItems)
    if (result.success) onSuccess()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen || items.length === 0) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget && !processing) handleClose() }}
    >
      <Card className="w-full max-w-md mx-4 p-0 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold">
              Confirm Deposit ({items.length} item{items.length > 1 ? 's' : ''})
            </h3>
            {!processing && (
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">&times;</button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Set deposit amounts and confirm</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Success state */}
          {txResult?.success && (
            <div className="text-center space-y-3 py-4">
              <div className="text-3xl">✅</div>
              <p className="text-sm font-semibold">Transaction confirmed!</p>
              <p className="text-xs text-muted-foreground">
                {items.length} deposit{items.length > 1 ? 's' : ''} submitted successfully
              </p>
              {txResult.txHash && (
                <a
                  href={`${EXPLORER_URL}/tx/${txResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View on Explorer →
                </a>
              )}
              <Button className="w-full mt-2" onClick={handleClose}>Close</Button>
            </div>
          )}

          {/* Error state */}
          {txResult && !txResult.success && !processing && (
            <div className="space-y-3">
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-xs text-destructive">{txResult.error}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
                <Button className="flex-1" onClick={() => { reset(); handleSubmit() }}>Retry</Button>
              </div>
            </div>
          )}

          {/* Processing state */}
          {processing && (
            <div className="flex flex-col items-center gap-3 py-6">
              <SofiaLoader size={56} />
              <p className="text-sm text-muted-foreground">Confirming transaction...</p>
              <p className="text-xs text-muted-foreground">
                {items.length > 1 ? 'Batch deposit in progress' : 'Deposit in progress'}
              </p>
            </div>
          )}

          {/* Form state */}
          {!txResult && !processing && (
            <>
              {/* Item list with weight selectors */}
              <div className="space-y-3">
                {items.map((item, index) => {
                  const color = item.intentionColor || '#888'
                  const currentAmount = getAmount(index)
                  const isCustom = !!customValues[index]?.trim()
                  return (
                    <div key={item.id} className="rounded-lg border border-border p-3 space-y-2" style={{ borderLeftWidth: 3, borderLeftColor: color }}>
                      {/* Item info */}
                      <div className="flex items-center gap-2">
                        {item.favicon && (
                          <img src={item.favicon} alt="" className="h-5 w-5 rounded shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        )}
                        <span className="text-xs font-medium truncate flex-1">{item.title}</span>
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                          style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                        >
                          {item.intention}
                        </span>
                        <span className={`text-[10px] font-bold shrink-0 ${item.side === 'support' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {item.side === 'support' ? '▲' : '▼'}
                        </span>
                      </div>

                      {/* Weight selection */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {WEIGHT_OPTIONS.map((w) => (
                          <button
                            key={w}
                            onClick={() => handleWeightSelect(index, w)}
                            className="px-2 py-1 rounded-full text-[11px] font-medium border transition-colors"
                            style={{
                              borderColor: !isCustom && weights[index] === w ? color : 'var(--border)',
                              backgroundColor: !isCustom && weights[index] === w ? `${color}15` : 'transparent',
                              color: !isCustom && weights[index] === w ? color : 'var(--muted-foreground)',
                            }}
                          >
                            {w}
                          </button>
                        ))}
                        <input
                          type="number"
                          min="0.001"
                          step="0.001"
                          placeholder="Custom"
                          value={customValues[index] || ''}
                          onChange={(e) => handleCustomChange(index, e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-16 h-7 px-2 rounded-md border border-border bg-background text-[11px] text-right"
                        />
                        <span className="text-[11px] text-muted-foreground ml-auto">{currentAmount} TRUST</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer — cost summary + submit */}
        {!txResult && !processing && (
          <div className="border-t border-border px-5 py-4 space-y-3 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Total deposit</span>
                <span className="font-medium">{totalDeposit.toFixed(4)} TRUST</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fees (estimated)</span>
                <span className="text-muted-foreground">~{(totalDeposit * 0.05).toFixed(4)} TRUST</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-border pt-1">
                <span className="font-medium">Estimated total</span>
                <span className="font-bold">{(totalDeposit * 1.05).toFixed(4)} TRUST</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Balance</span>
                <span className={balNum < totalDeposit * 1.05 ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                  {balance ? `${parseFloat(balance).toFixed(4)} TRUST` : '...'}
                </span>
              </div>
            </div>
            <Button
              className="w-full"
              disabled={totalDeposit <= 0 || balNum < totalDeposit * 1.05}
              onClick={handleSubmit}
            >
              Submit {items.length} Deposit{items.length > 1 ? 's' : ''} · {totalDeposit.toFixed(2)} TRUST
            </Button>
          </div>
        )}
      </Card>
    </div>,
    document.body,
  )
}
