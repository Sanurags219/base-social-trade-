import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const XP_TRACKER = process.env.NEXT_PUBLIC_XP_CONTRACT || '0x0000000000000000000000000000000000000000'
const REP_CONTRACT = process.env.NEXT_PUBLIC_REP_CONTRACT || '0x6f0e6da952ac7e30688024cfac71a760b89495d5'

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
})

const XP_TRACKER_ABI = [
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

// Genesis leaderboard (fallback)
const GENESIS_LEADERBOARD = [
  { address: '0x22E228AdE324185123A54Ad25F3459a99CF51E7a', xp: 15420, trades: 156, streak: 12 },
  { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', xp: 12850, trades: 98, streak: 8 },
  { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f5fF21', xp: 9340, trades: 67, streak: 5 },
  { address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', xp: 7220, trades: 45, streak: 3 },
  { address: '0x1234567890123456789012345678901234567890', xp: 5100, trades: 34, streak: 2 },
  { address: '0xabcdef0123456789abcdef0123456789abcdef01', xp: 3450, trades: 23, streak: 1 },
  { address: '0x9876543210987654321098765432109876543210', xp: 2100, trades: 15, streak: 0 },
  { address: '0xfedcba9876543210fedcba9876543210fedcba98', xp: 1250, trades: 8, streak: 0 },
]

// Calculate XP from reputation (fallback)
function calculateXPFromReputation(reputation: number, address: string): {
  xp: number
  trades: number
  streak: number
  level: number
  nextLevelXP: number
  rank: number
} {
  // Use reputation as base for XP calculation
  const xp = reputation * 10 + (parseInt(address.slice(2, 10), 16) % 1000)
  const trades = Math.floor(reputation / 10)
  const streak = Math.floor(reputation / 100) % 15
  const level = Math.floor(xp / 1000) + 1
  const nextLevelXP = level * 1000
  const rank = GENESIS_LEADERBOARD.findIndex(u => u.xp < xp) + 1 || GENESIS_LEADERBOARD.length + 1

  return { xp, trades, streak, level, nextLevelXP, rank }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { address, action, amount } = body

    if (!address) {
      return NextResponse.json({ error: 'No address provided' }, { status: 400 })
    }

    // Calculate XP reward based on action
    let xpEarned = 0
    switch (action) {
      case 'swap':
        xpEarned = Math.floor(Number(amount || 0) * 100) + 10
        break
      case 'copy':
        xpEarned = 50
        break
      case 'share':
        xpEarned = 25
        break
      case 'daily':
        xpEarned = 100
        break
      default:
        xpEarned = 10
    }

    // In production with XP_TRACKER deployed, this would call recordSwap/recordShare etc.
    // For now, return optimistic response
    
    // Get current XP
    let currentXP = 0
    let level = 1
    
    if (XP_TRACKER !== '0x0000000000000000000000000000000000000000') {
      try {
        const result = await publicClient.readContract({
          address: XP_TRACKER as `0x${string}`,
          abi: XP_TRACKER_ABI,
          functionName: 'getUserXP',
          args: [address as `0x${string}`],
        })
        currentXP = Number(result[0])
        level = Number(result[3]) || 1
      } catch {
        // Use fallback
      }
    }
    
    if (currentXP === 0) {
      // Try reputation
      try {
        const repResult = await publicClient.readContract({
          address: REP_CONTRACT as `0x${string}`,
          abi: REP_ABI,
          functionName: 'getReputation',
          args: [address as `0x${string}`],
        })
        const userData = calculateXPFromReputation(Number(repResult[0]), address)
        currentXP = userData.xp
        level = userData.level
      } catch {
        currentXP = 100
        level = 1
      }
    }

    return NextResponse.json({
      success: true,
      xpEarned,
      totalXP: currentXP + xpEarned,
      level,
      action,
      source: XP_TRACKER !== '0x0000000000000000000000000000000000000000' ? 'onchain' : 'computed'
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')
  const limit = parseInt(searchParams.get('limit') || '10')

  // Single user XP query
  if (address) {
    // Try XP_TRACKER first
    if (XP_TRACKER !== '0x0000000000000000000000000000000000000000') {
      try {
        const result = await publicClient.readContract({
          address: XP_TRACKER as `0x${string}`,
          abi: XP_TRACKER_ABI,
          functionName: 'getUserXP',
          args: [address as `0x${string}`],
        })
        
        return NextResponse.json({
          address,
          xp: Number(result[0]),
          trades: Number(result[1]),
          streak: Number(result[2]),
          level: Number(result[3]) || 1,
          nextLevelXP: Number(result[4]) || 1000,
          rank: 0, // Would need separate query
          source: 'onchain'
        })
      } catch {
        // Fall through
      }
    }
    
    // Try reputation SBT
    try {
      const repResult = await publicClient.readContract({
        address: REP_CONTRACT as `0x${string}`,
        abi: REP_ABI,
        functionName: 'getReputation',
        args: [address as `0x${string}`],
      })
      
      const userData = calculateXPFromReputation(Number(repResult[0]), address)
      return NextResponse.json({
        address,
        ...userData,
        source: 'reputation'
      })
    } catch {
      // Fall through
    }
    
    // Fallback
    const userData = calculateXPFromReputation(100, address)
    return NextResponse.json({
      address,
      ...userData,
      source: 'computed'
    })
  }

  // Leaderboard query
  if (XP_TRACKER !== '0x0000000000000000000000000000000000000000') {
    try {
      const result = await publicClient.readContract({
        address: XP_TRACKER as `0x${string}`,
        abi: XP_TRACKER_ABI,
        functionName: 'getLeaderboard',
        args: [BigInt(limit)],
      })
      
      const [addresses, xps, levels] = result
      
      const leaderboard = addresses.map((addr, i) => ({
        address: addr,
        xp: Number(xps[i]),
        level: Number(levels[i]) || 1,
        trades: 0,
        streak: 0,
      }))
      
      return NextResponse.json({
        leaderboard,
        source: 'onchain',
        total: leaderboard.length
      })
    } catch {
      // Fall through
    }
  }
  
  // Fallback to genesis
  return NextResponse.json({
    leaderboard: GENESIS_LEADERBOARD.slice(0, limit),
    source: 'genesis',
    total: GENESIS_LEADERBOARD.length
  })
}
