import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getEthccWalletAddress,
  setEthccWalletAddress,
  clearEthccWalletAddress,
  fetchEthccSignals,
} from '../services/ethccService'
import type { EthccSofiaSignals } from '../types/reputation'

export function useEthccData() {
  const [wallet, setWalletState] = useState<string | null>(getEthccWalletAddress)
  const qc = useQueryClient()

  const { data: signals, isLoading: loading } = useQuery<EthccSofiaSignals>({
    queryKey: ['ethccSignals', wallet],
    queryFn: () => fetchEthccSignals(wallet!),
    enabled: !!wallet,
    staleTime: 120_000,
  })

  const setWallet = useCallback((address: string) => {
    const normalized = address.toLowerCase()
    setEthccWalletAddress(normalized)
    setWalletState(normalized)
  }, [])

  const clearWallet = useCallback(() => {
    clearEthccWalletAddress()
    setWalletState(null)
    qc.removeQueries({ queryKey: ['ethccSignals'] })
  }, [qc])

  return {
    ethccWallet: wallet,
    signals: signals ?? null,
    loading,
    isConnected: !!wallet,
    setWallet,
    clearWallet,
  }
}
