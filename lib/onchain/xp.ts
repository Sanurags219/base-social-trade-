// On-chain XP Tracker integration
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

// Contract will be deployed - placeholder for now
const XP_TRACKER = process.env.NEXT_PUBLIC_XP_CONTRACT || '0x0000000000000000000000000000000000000000'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
})

export const XP_TRACKER_ABI = [
  {
    name: 'getUserXP',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'xp', type: 'uint256' },
      { name: 'trades', type: 'uint256' },
      { name: 'streak', type: 'uint256' },
      { name: 'level', type: 'uint256' },
      { name: 'nextLevelXP', type: 'uint256' }
    ]
  },
  {
    name: 'getLeaderboard',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'limit', type: 'uint256' }],
    outputs: [
      { name: 'addresses', type: 'address[]' },
      { name: 'xps', type: 'uint256[]' },
      { name: 'levels', type: 'uint256[]' }
    ]
  },
  {
    name: 'users',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [
      { name: 'xp', type: 'uint256' },
      { name: 'trades', type: 'uint256' },
      { name: 'streak', type: 'uint256' },
      { name: 'lastAction', type: 'uint256' },
      { name: 'level', type: 'uint256' }
    ]
  },
  {
    name: 'getTotalUsers',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

export interface OnChainXP {
  xp: number
  trades: number
  streak: number
  level: number
  nextLevelXP: number
}

export interface LeaderboardEntry {
  address: string
  xp: number
  level: number
}

export async function getOnChainXP(address: string): Promise<OnChainXP | null> {
  if (XP_TRACKER === '0x0000000000000000000000000000000000000000') {
    return null // Contract not deployed yet
  }
  
  try {
    const result = await publicClient.readContract({
      address: XP_TRACKER as `0x${string}`,
      abi: XP_TRACKER_ABI,
      functionName: 'getUserXP',
      args: [address as `0x${string}`],
    })
    
    return {
      xp: Number(result[0]),
      trades: Number(result[1]),
      streak: Number(result[2]),
      level: Number(result[3]) || 1,
      nextLevelXP: Number(result[4]) || 1000,
    }
  } catch (error) {
    console.error('Failed to get on-chain XP:', error)
    return null
  }
}

export async function getOnChainLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
  if (XP_TRACKER === '0x0000000000000000000000000000000000000000') {
    return [] // Contract not deployed yet
  }
  
  try {
    const result = await publicClient.readContract({
      address: XP_TRACKER as `0x${string}`,
      abi: XP_TRACKER_ABI,
      functionName: 'getLeaderboard',
      args: [BigInt(limit)],
    })
    
    const [addresses, xps, levels] = result
    
    return addresses.map((addr, i) => ({
      address: addr,
      xp: Number(xps[i]),
      level: Number(levels[i]) || 1,
    }))
  } catch (error) {
    console.error('Failed to get on-chain leaderboard:', error)
    return []
  }
}

export function getXPContractAddress(): string {
  return XP_TRACKER
}
