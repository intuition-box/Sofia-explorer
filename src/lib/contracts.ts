import { defineChain } from 'viem'
import { SOFIA_PROXY_ADDRESS } from '../config'

/** Intuition mainnet (chain ID 1155) */
export const intuitionChain = defineChain({
  id: 1155,
  name: 'Intuition',
  nativeCurrency: { name: 'TRUST', symbol: 'TRUST', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.intuition.systems'] } },
  blockExplorers: { default: { name: 'Explorer', url: 'https://explorer.intuition.systems' } },
})

export const PROXY_ADDRESS = SOFIA_PROXY_ADDRESS

export const SofiaFeeProxyAbi = [
  // deposit(receiver, termId, curveId, minShares) payable → shares
  {
    inputs: [
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'bytes32', name: 'termId', type: 'bytes32' },
      { internalType: 'uint256', name: 'curveId', type: 'uint256' },
      { internalType: 'uint256', name: 'minShares', type: 'uint256' },
    ],
    name: 'deposit',
    outputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  // depositBatch(receiver, termIds[], curveIds[], assets[], minShares[]) payable → shares[]
  {
    inputs: [
      { internalType: 'address', name: 'receiver', type: 'address' },
      { internalType: 'bytes32[]', name: 'termIds', type: 'bytes32[]' },
      { internalType: 'uint256[]', name: 'curveIds', type: 'uint256[]' },
      { internalType: 'uint256[]', name: 'assets', type: 'uint256[]' },
      { internalType: 'uint256[]', name: 'minShares', type: 'uint256[]' },
    ],
    name: 'depositBatch',
    outputs: [{ internalType: 'uint256[]', name: 'shares', type: 'uint256[]' }],
    stateMutability: 'payable',
    type: 'function',
  },
  // calculateDepositFee(depositCount, totalDeposit) view → fee
  {
    inputs: [
      { internalType: 'uint256', name: 'depositCount', type: 'uint256' },
      { internalType: 'uint256', name: 'totalDeposit', type: 'uint256' },
    ],
    name: 'calculateDepositFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // getTotalDepositCost(depositAmount) view → totalCost
  {
    inputs: [{ internalType: 'uint256', name: 'depositAmount', type: 'uint256' }],
    name: 'getTotalDepositCost',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  // Fee param readers
  {
    inputs: [],
    name: 'depositFixedFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'depositPercentageFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'FEE_DENOMINATOR',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'creationFixedFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
