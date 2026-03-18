import { useState, useCallback } from 'react'
import { createPublicClient, createWalletClient, custom, http, formatUnits } from 'viem'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { intuitionChain, PROXY_ADDRESS, SofiaFeeProxyAbi } from '../lib/contracts'

const publicClient = createPublicClient({
  chain: intuitionChain,
  transport: http(),
})

export interface DepositResult {
  success: boolean
  txHash?: string
  error?: string
}

export interface BatchDepositItem {
  termId: string
  amountTrust: number
}

export function useDeposit() {
  const { authenticated } = usePrivy()
  const { wallets } = useWallets()
  const [processing, setProcessing] = useState(false)
  const [txResult, setTxResult] = useState<DepositResult | null>(null)

  /** Get a wallet client from Privy */
  const getWalletClient = useCallback(async () => {
    if (!authenticated || wallets.length === 0) throw new Error('No wallet connected')
    const wallet = wallets[0]
    await wallet.switchChain(intuitionChain.id)
    const provider = await wallet.getEthereumProvider()
    const address = wallet.address as `0x${string}`
    return {
      address,
      client: createWalletClient({
        account: address,
        chain: intuitionChain,
        transport: custom(provider),
      }),
    }
  }, [authenticated, wallets])

  /** Calculate fee for a batch of deposits */
  const calculateFee = useCallback(async (depositCount: number, totalDeposit: bigint): Promise<bigint> => {
    return await publicClient.readContract({
      address: PROXY_ADDRESS,
      abi: SofiaFeeProxyAbi,
      functionName: 'calculateDepositFee',
      args: [BigInt(depositCount), totalDeposit],
    })
  }, [])

  /** Single deposit */
  const deposit = useCallback(async (termId: string, amountTrust: number): Promise<DepositResult> => {
    setProcessing(true)
    setTxResult(null)
    try {
      const { address, client } = await getWalletClient()
      const depositWei = BigInt(Math.floor(amountTrust * 1e18))
      const totalCost = await publicClient.readContract({
        address: PROXY_ADDRESS,
        abi: SofiaFeeProxyAbi,
        functionName: 'getTotalDepositCost',
        args: [depositWei],
      })

      await publicClient.simulateContract({
        address: PROXY_ADDRESS, abi: SofiaFeeProxyAbi, functionName: 'deposit',
        args: [address, termId as `0x${string}`, 1n, 0n],
        value: totalCost, account: address,
      })

      const hash = await client.writeContract({
        address: PROXY_ADDRESS, abi: SofiaFeeProxyAbi, functionName: 'deposit',
        args: [address, termId as `0x${string}`, 1n, 0n],
        value: totalCost, chain: intuitionChain,
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const result = receipt.status === 'success'
        ? { success: true, txHash: hash }
        : { success: false, error: 'Transaction reverted' }
      setTxResult(result)
      return result
    } catch (err: any) {
      const result = { success: false, error: err?.shortMessage || err?.message || 'Transaction failed' }
      setTxResult(result)
      return result
    } finally {
      setProcessing(false)
    }
  }, [getWalletClient])

  /** Batch deposit — multiple items in one TX */
  const depositBatch = useCallback(async (items: BatchDepositItem[]): Promise<DepositResult> => {
    if (items.length === 0) return { success: false, error: 'No items' }
    if (items.length === 1) return deposit(items[0].termId, items[0].amountTrust)

    setProcessing(true)
    setTxResult(null)
    try {
      const { address, client } = await getWalletClient()

      const termIds = items.map(i => i.termId as `0x${string}`)
      const curveIds = items.map(() => 1n)
      const assets = items.map(i => BigInt(Math.floor(i.amountTrust * 1e18)))
      const minShares = items.map(() => 0n)

      const totalDeposit = assets.reduce((a, b) => a + b, 0n)
      const fee = await calculateFee(items.length, totalDeposit)
      const totalValue = totalDeposit + fee

      await publicClient.simulateContract({
        address: PROXY_ADDRESS, abi: SofiaFeeProxyAbi, functionName: 'depositBatch',
        args: [address, termIds, curveIds, assets, minShares],
        value: totalValue, account: address,
      })

      const hash = await client.writeContract({
        address: PROXY_ADDRESS, abi: SofiaFeeProxyAbi, functionName: 'depositBatch',
        args: [address, termIds, curveIds, assets, minShares],
        value: totalValue, chain: intuitionChain,
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      const result = receipt.status === 'success'
        ? { success: true, txHash: hash }
        : { success: false, error: 'Transaction reverted' }
      setTxResult(result)
      return result
    } catch (err: any) {
      const result = { success: false, error: err?.shortMessage || err?.message || 'Transaction failed' }
      setTxResult(result)
      return result
    } finally {
      setProcessing(false)
    }
  }, [getWalletClient, calculateFee, deposit])

  /** Get user balance on Intuition chain */
  const getBalance = useCallback(async (): Promise<string> => {
    if (wallets.length === 0) return '0'
    const address = wallets[0].address as `0x${string}`
    const bal = await publicClient.getBalance({ address })
    return formatUnits(bal, 18)
  }, [wallets])

  const reset = useCallback(() => setTxResult(null), [])

  return { deposit, depositBatch, processing, txResult, reset, getBalance, calculateFee }
}
