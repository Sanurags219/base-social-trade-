import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

// Uniswap V3 NonfungiblePositionManager on Base
const UNISWAP_V3_POSITION_MANAGER = '0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1'

// Simplified ABI for position reading
const POSITION_MANAGER_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export interface LPData {
  count: number
  positions: {
    tokenId: string
    pool?: string
  }[]
  totalValueUSD: number
}

// Get LP position count
export async function getLPPositions(address: string): Promise<LPData> {
  try {
    // Get number of LP NFTs owned
    const balance = await client.readContract({
      address: UNISWAP_V3_POSITION_MANAGER as `0x${string}`,
      abi: POSITION_MANAGER_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    })
    
    const count = Number(balance)
    
    if (count === 0) {
      return { count: 0, positions: [], totalValueUSD: 0 }
    }
    
    // Get token IDs (limited to first 5 for performance)
    const positions: { tokenId: string; pool?: string }[] = []
    const maxToFetch = Math.min(count, 5)
    
    for (let i = 0; i < maxToFetch; i++) {
      try {
        const tokenId = await client.readContract({
          address: UNISWAP_V3_POSITION_MANAGER as `0x${string}`,
          abi: POSITION_MANAGER_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [address as `0x${string}`, BigInt(i)],
        })
        
        positions.push({ tokenId: tokenId.toString() })
      } catch {
        // Skip failed reads
      }
    }
    
    // Note: Calculating actual LP value requires:
    // 1. Fetching position details (liquidity, tickLower, tickUpper)
    // 2. Getting pool state (sqrtPriceX96)
    // 3. Computing token amounts
    // For v1, we just return count
    
    return {
      count,
      positions,
      totalValueUSD: 0, // TODO: Implement value calculation
    }
    
  } catch (error) {
    console.error('Failed to fetch LP positions:', error)
    return { count: 0, positions: [], totalValueUSD: 0 }
  }
}

// Lightweight count-only version
export async function getLPCount(address: string): Promise<number> {
  try {
    const balance = await client.readContract({
      address: UNISWAP_V3_POSITION_MANAGER as `0x${string}`,
      abi: POSITION_MANAGER_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    })
    return Number(balance)
  } catch {
    return 0
  }
}
