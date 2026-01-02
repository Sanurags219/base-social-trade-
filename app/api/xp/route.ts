export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

/**
 * XP Tracking API
 * Returns mock leaderboard data and user XP based on activity
 */

// Mock leaderboard with realistic Base traders
const MOCK_LEADERBOARD = [
  { address: '0x22E228AdE324185123A54Ad25F3459a99CF51E7a', xp: 15420, trades: 156, streak: 12 },
  { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', xp: 12850, trades: 98, streak: 8 },
  { address: '0x742d35Cc6634C0532925a3b844Bc9e7595f5fF21', xp: 9340, trades: 67, streak: 5 },
  { address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', xp: 7220, trades: 45, streak: 3 },
  { address: '0x1234567890123456789012345678901234567890', xp: 5100, trades: 34, streak: 2 },
  { address: '0xabcdef0123456789abcdef0123456789abcdef01', xp: 3450, trades: 23, streak: 1 },
  { address: '0x9876543210987654321098765432109876543210', xp: 2100, trades: 15, streak: 0 },
  { address: '0xfedcba9876543210fedcba9876543210fedcba98', xp: 1250, trades: 8, streak: 0 },
]

// XP calculation based on address (deterministic)
function calculateUserXP(address: string) {
  const hash = address.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const baseXP = (hash % 5000) + 100
  const trades = (hash % 50) + 1
  const streak = hash % 7
  
  return {
    address,
    xp: baseXP,
    trades,
    streak,
    level: Math.floor(baseXP / 1000) + 1,
    nextLevelXP: (Math.floor(baseXP / 1000) + 1) * 1000,
    rank: MOCK_LEADERBOARD.findIndex(u => u.xp < baseXP) + 1 || MOCK_LEADERBOARD.length + 1
  }
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

    const userData = calculateUserXP(address)

    return NextResponse.json({
      success: true,
      xpEarned,
      totalXP: userData.xp + xpEarned,
      level: userData.level,
      action
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (address) {
    // Single user XP query
    const userData = calculateUserXP(address)
    return NextResponse.json(userData)
  }

  // Leaderboard query - return mock data
  return NextResponse.json(MOCK_LEADERBOARD)
}
