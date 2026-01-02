// On-chain Trader Registry integration
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const TRADER_REGISTRY = process.env.NEXT_PUBLIC_TRADER_CONTRACT || '0x0000000000000000000000000000000000000000'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
})

export const TRADER_REGISTRY_ABI = [
  {
    name: 'getTrader',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'trader', type: 'address' }],
    outputs: [
      { name: 'registered', type: 'bool' },
      { name: 'reputation', type: 'uint256' },
      { name: 'pnl', type: 'uint256' },
      { name: 'winRate', type: 'uint256' },
      { name: 'trades', type: 'uint256' },
      { name: 'copiers', type: 'uint256' },
      { name: 'tvl', type: 'uint256' }
    ]
  },
  {
    name: 'getTopTraders',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'limit', type: 'uint256' }],
    outputs: [
      { name: 'addresses', type: 'address[]' },
      { name: 'pnls', type: 'uint256[]' },
      { name: 'reputations', type: 'uint256[]' },
      { name: 'copierCounts', type: 'uint256[]' }
    ]
  },
  {
    name: 'isEligibleForCopy',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'trader', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'getTotalTraders',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

export interface OnChainTrader {
  address: string
  registered: boolean
  reputation: number
  pnl: number // basis points, 10000 = 0%, 12000 = +20%
  winRate: number // basis points, 5000 = 50%
  trades: number
  copiers: number
  tvl: number
}

export async function getOnChainTrader(address: string): Promise<OnChainTrader | null> {
  if (TRADER_REGISTRY === '0x0000000000000000000000000000000000000000') {
    return null
  }
  
  try {
    const result = await publicClient.readContract({
      address: TRADER_REGISTRY as `0x${string}`,
      abi: TRADER_REGISTRY_ABI,
      functionName: 'getTrader',
      args: [address as `0x${string}`],
    })
    
    return {
      address,
      registered: result[0],
      reputation: Number(result[1]),
      pnl: Number(result[2]),
      winRate: Number(result[3]),
      trades: Number(result[4]),
      copiers: Number(result[5]),
      tvl: Number(result[6]),
    }
  } catch (error) {
    console.error('Failed to get on-chain trader:', error)
    return null
  }
}

export async function getTopTraders(limit: number = 10): Promise<OnChainTrader[]> {
  if (TRADER_REGISTRY === '0x0000000000000000000000000000000000000000') {
    return []
  }
  
  try {
    const result = await publicClient.readContract({
      address: TRADER_REGISTRY as `0x${string}`,
      abi: TRADER_REGISTRY_ABI,
      functionName: 'getTopTraders',
      args: [BigInt(limit)],
    })
    
    const [addresses, pnls, reputations, copierCounts] = result
    
    return addresses.map((addr, i) => ({
      address: addr,
      registered: true,
      reputation: Number(reputations[i]),
      pnl: Number(pnls[i]),
      winRate: 0,
      trades: 0,
      copiers: Number(copierCounts[i]),
      tvl: 0,
    }))
  } catch (error) {
    console.error('Failed to get top traders:', error)
    return []
  }
}

export async function isEligibleForCopy(address: string): Promise<boolean> {
  if (TRADER_REGISTRY === '0x0000000000000000000000000000000000000000') {
    return false
  }
  
  try {
    return await publicClient.readContract({
      address: TRADER_REGISTRY as `0x${string}`,
      abi: TRADER_REGISTRY_ABI,
      functionName: 'isEligibleForCopy',
      args: [address as `0x${string}`],
    })
  } catch {
    return false
  }
}

export function getTraderRegistryAddress(): string {
  return TRADER_REGISTRY
}
