// Library for reading Reputation SBT on-chain
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const REP_CONTRACT = process.env.NEXT_PUBLIC_REP_CONTRACT || '0x0000000000000000000000000000000000000000'
const BASE_RPC = process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(BASE_RPC),
})

// Minimal ABI for reading reputation
export const REP_ABI = [
  {
    name: 'getReputation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'score', type: 'uint256' },
      { name: 'lastUpdated', type: 'uint256' }
    ]
  },
  {
    name: 'hasSBTFor',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'reputation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'score', type: 'uint256' },
      { name: 'lastUpdated', type: 'uint256' }
    ]
  }
] as const

export interface OnChainReputation {
  score: number
  lastUpdated: number
  hasToken: boolean
}

/**
 * Read reputation directly from SBT contract
 */
export async function readReputationSBT(address: string): Promise<OnChainReputation | null> {
  try {
    if (REP_CONTRACT === '0x0000000000000000000000000000000000000000') {
      return null // Contract not deployed
    }

    const [score, lastUpdated] = (await publicClient.readContract({
      address: REP_CONTRACT as `0x${string}`,
      abi: REP_ABI,
      functionName: 'getReputation',
      args: [address as `0x${string}`]
    })) as [bigint, bigint]

    const hasToken = (await publicClient.readContract({
      address: REP_CONTRACT as `0x${string}`,
      abi: REP_ABI,
      functionName: 'hasSBTFor',
      args: [address as `0x${string}`]
    })) as boolean

    return {
      score: Number(score),
      lastUpdated: Number(lastUpdated),
      hasToken
    }
  } catch (error) {
    console.error('Failed to read SBT reputation:', error)
    return null
  }
}

/**
 * Get reputation badge from score
 */
export function getReputationBadge(score: number) {
  if (score >= 800) {
    return { emoji: '🟢', label: 'Elite', color: 'text-green-400', bgColor: 'bg-green-900' }
  }
  if (score >= 600) {
    return { emoji: '🔵', label: 'Trusted', color: 'text-blue-400', bgColor: 'bg-blue-900' }
  }
  if (score >= 400) {
    return { emoji: '🟡', label: 'Regular', color: 'text-yellow-400', bgColor: 'bg-yellow-900' }
  }
  return { emoji: '🔴', label: 'New', color: 'text-red-400', bgColor: 'bg-red-900' }
}

/**
 * Format timestamp to readable date
 */
export function formatLastUpdated(timestamp: number): string {
  if (!timestamp || timestamp === 0) return 'Never'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Verify contract is deployed
 */
export function isContractDeployed(): boolean {
  return REP_CONTRACT !== '0x0000000000000000000000000000000000000000'
}
