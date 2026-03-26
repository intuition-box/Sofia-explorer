import { useState, useCallback } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import {
  type DepositResult,
  type BatchDepositItem,
  executeSingleDeposit,
  executeBatchDeposit,
  fetchBalance,
  calculateFee,
} from '@/services/depositService'

export type { DepositResult, BatchDepositItem }

export function useDeposit() {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const [processing, setProcessing] = useState(false)
  const [txResult, setTxResult] = useState<DepositResult | null>(null)

  /** Resolve the first connected wallet or throw */
  const requireWallet = useCallback(() => {
    if (!authenticated || wallets.length === 0) throw new Error('No wallet connected')
    return wallets[0]
  }, [authenticated, wallets])

  /** Single deposit */
  const deposit = useCallback(async (termId: string, amountTrust: number): Promise<DepositResult> => {
    setProcessing(true)
    setTxResult(null)
    try {
      const wallet = requireWallet()
      const result = await executeSingleDeposit(wallet, termId, amountTrust)
      setTxResult(result)
      return result
    } catch (err: any) {
      const result: DepositResult = { success: false, error: err?.shortMessage || err?.message || 'Transaction failed' }
      setTxResult(result)
      return result
    } finally {
      setProcessing(false)
    }
  }, [requireWallet])

  /** Batch deposit — multiple items in one TX */
  const depositBatch = useCallback(async (items: BatchDepositItem[]): Promise<DepositResult> => {
    if (items.length === 0) return { success: false, error: 'No items' }
    if (items.length === 1) return deposit(items[0].termId, items[0].amountTrust)

    setProcessing(true)
    setTxResult(null)
    try {
      const wallet = requireWallet()
      const result = await executeBatchDeposit(wallet, items)
      setTxResult(result)
      return result
    } catch (err: any) {
      const result: DepositResult = { success: false, error: err?.shortMessage || err?.message || 'Transaction failed' }
      setTxResult(result)
      return result
    } finally {
      setProcessing(false)
    }
  }, [requireWallet, deposit])

  /** Get user balance on Intuition chain */
  const getBalance = useCallback(async (): Promise<string> => {
    if (wallets.length === 0) return '0'
    return fetchBalance(wallets[0].address)
  }, [wallets])

  const reset = useCallback(() => setTxResult(null), [])

  return { deposit, depositBatch, processing, txResult, reset, getBalance, calculateFee }
}
