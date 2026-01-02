// On-chain Credit Vault integration
import { createPublicClient, http, parseUnits, formatUnits } from 'viem'
import { base } from 'viem/chains'

const CREDIT_CONTRACT = process.env.NEXT_PUBLIC_CREDIT_CONTRACT || '0xE0ae4de04B9Fa02e4a187601B7CF502CF55A0a2a'
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
})

export const CREDIT_ABI = [
  {
    name: 'creditLimit',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'creditTier',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'string' }]
  },
  {
    name: 'getLoan',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'borrowedAt', type: 'uint256' },
      { name: 'dueAt', type: 'uint256' },
      { name: 'repaid', type: 'bool' },
      { name: 'defaulted', type: 'bool' },
      { name: 'isOverdue', type: 'bool' }
    ]
  },
  {
    name: 'borrow',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'repay',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'totalLoaned',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'totalRepaid',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

export const USDC_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

export interface CreditInfo {
  creditLimit: number
  creditTier: string
  hasActiveLoan: boolean
  loan: {
    amount: number
    borrowedAt: number
    dueAt: number
    repaid: boolean
    defaulted: boolean
    isOverdue: boolean
  } | null
}

export async function getCreditInfo(address: string): Promise<CreditInfo | null> {
  try {
    const [creditLimit, creditTier, loanData] = await Promise.all([
      publicClient.readContract({
        address: CREDIT_CONTRACT as `0x${string}`,
        abi: CREDIT_ABI,
        functionName: 'creditLimit',
        args: [address as `0x${string}`]
      }),
      publicClient.readContract({
        address: CREDIT_CONTRACT as `0x${string}`,
        abi: CREDIT_ABI,
        functionName: 'creditTier',
        args: [address as `0x${string}`]
      }),
      publicClient.readContract({
        address: CREDIT_CONTRACT as `0x${string}`,
        abi: CREDIT_ABI,
        functionName: 'getLoan',
        args: [address as `0x${string}`]
      })
    ])

    const [amount, borrowedAt, dueAt, repaid, defaulted, isOverdue] = loanData

    const hasActiveLoan = Number(amount) > 0 && !repaid && !defaulted

    return {
      creditLimit: Number(formatUnits(creditLimit, 6)),
      creditTier: creditTier as string,
      hasActiveLoan,
      loan: Number(amount) > 0 ? {
        amount: Number(formatUnits(amount, 6)),
        borrowedAt: Number(borrowedAt),
        dueAt: Number(dueAt),
        repaid,
        defaulted,
        isOverdue
      } : null
    }
  } catch (error) {
    console.error('Failed to get credit info:', error)
    return null
  }
}

export function getCreditContractAddress() {
  return CREDIT_CONTRACT
}

export function getUSDCAddress() {
  return USDC_ADDRESS
}

export function parseUSDC(amount: number) {
  return parseUnits(amount.toString(), 6)
}

export function formatUSDC(amount: bigint) {
  return Number(formatUnits(amount, 6))
}
