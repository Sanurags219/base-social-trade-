import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const TRADER_REGISTRY = process.env.NEXT_PUBLIC_TRADER_CONTRACT || '0x0000000000000000000000000000000000000000'
const REP_CONTRACT = process.env.NEXT_PUBLIC_REP_CONTRACT || '0x6f0e6da952ac7e30688024cfac71a760b89495d5'

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
})

const TRADER_REGISTRY_ABI = [
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
  }
] as const

const REP_ABI = [
  {
    name: 'getReputation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'score', type: 'uint256' },
      { name: 'lastUpdated', type: 'uint256' }
    ]
  }
] as const

// Genesis traders (fallback)
const GENESIS_TRADERS = [
  { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', reputation: 920, pnl: 12450, winRate: 6800, trades: 1247, copiers: 89 },
  { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f5fF21', reputation: 875, pnl: 11872, winRate: 6400, trades: 892, copiers: 56 },
  { address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', reputation: 780, pnl: 10458, winRate: 6100, trades: 567, copiers: 34 },
  { address: '0x22E228AdE324185123A54Ad25F3459a99CF51E7a', reputation: 720, pnl: 10321, winRate: 5800, trades: 423, copiers: 21 },
  { address: '0x1234567890AbCdEf1234567890AbCdEf12345678', reputation: 650, pnl: 10184, winRate: 5500, trades: 289, copiers: 12 },
  { address: '0xFeDcBa0987654321FeDcBa0987654321FeDcBa09', reputation: 580, pnl: 10082, winRate: 5200, trades: 156, copiers: 5 },
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')
  const onchain = searchParams.get('onchain') === 'true'
  const limit = parseInt(searchParams.get('limit') || '10')

  // Single trader query
  if (address) {
    // Try on-chain first
    if (TRADER_REGISTRY !== '0x0000000000000000000000000000000000000000') {
      try {
        const result = await publicClient.readContract({
          address: TRADER_REGISTRY as `0x${string}`,
          abi: TRADER_REGISTRY_ABI,
          functionName: 'getTrader',
          args: [address as `0x${string}`],
        })
        
        if (result[0]) { // registered
          return NextResponse.json({
            address,
            registered: true,
            reputation: Number(result[1]),
            pnl: Number(result[2]),
            winRate: Number(result[3]),
            trades: Number(result[4]),
            copiers: Number(result[5]),
            tvl: Number(result[6]),
            source: 'onchain'
          })
        }
      } catch (e) {
        console.error('TraderRegistry read error:', e)
      }
    }
    
    // Try reputation SBT for basic data
    try {
      const repResult = await publicClient.readContract({
        address: REP_CONTRACT as `0x${string}`,
        abi: REP_ABI,
        functionName: 'getReputation',
        args: [address as `0x${string}`],
      })
      
      return NextResponse.json({
        address,
        registered: false,
        reputation: Number(repResult[0]),
        pnl: 10000, // Break even
        winRate: 5000, // 50%
        trades: 0,
        copiers: 0,
        tvl: 0,
        source: 'sbt'
      })
    } catch {
      // Fall through to genesis lookup
    }
    
    // Fallback to genesis traders
    const genesis = GENESIS_TRADERS.find(t => t.address.toLowerCase() === address.toLowerCase())
    if (genesis) {
      return NextResponse.json({
        ...genesis,
        registered: true,
        tvl: 0,
        source: 'genesis'
      })
    }
    
    return NextResponse.json({
      address,
      registered: false,
      reputation: 0,
      pnl: 10000,
      winRate: 5000,
      trades: 0,
      copiers: 0,
      tvl: 0,
      source: 'none'
    })
  }

  // Leaderboard query
  if (onchain && TRADER_REGISTRY !== '0x0000000000000000000000000000000000000000') {
    try {
      const result = await publicClient.readContract({
        address: TRADER_REGISTRY as `0x${string}`,
        abi: TRADER_REGISTRY_ABI,
        functionName: 'getTopTraders',
        args: [BigInt(limit)],
      })
      
      const [addresses, pnls, reputations, copierCounts] = result
      
      const traders = addresses.map((addr, i) => ({
        address: addr,
        reputation: Number(reputations[i]),
        pnl: Number(pnls[i]),
        winRate: 5500, // Default
        trades: 0,
        copiers: Number(copierCounts[i]),
      }))
      
      return NextResponse.json({
        traders,
        source: 'onchain',
        total: traders.length
      })
    } catch (e) {
      console.error('TraderRegistry leaderboard error:', e)
    }
  }
  
  // Fallback to genesis traders
  return NextResponse.json({
    traders: GENESIS_TRADERS.slice(0, limit),
    source: 'genesis',
    total: GENESIS_TRADERS.length
  })
}
