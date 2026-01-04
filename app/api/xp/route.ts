import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
})

// In-memory XP store (persists during deployment lifetime)
const xpStore = new Map<string, { xp: number; trades: number; streak: number; claims: string[] }>()

// Genesis leaderboard data
const GENESIS_DATA: Record<string, { xp: number; trades: number; streak: number }> = {
  '0x22e228ade324185123a54ad25f3459a99cf51e7a': { xp: 15420, trades: 156, streak: 12 },
  '0xd8da6bf26964af9d7eed9e03e53415d37aa96045': { xp: 12850, trades: 98, streak: 8 },
  '0x742d35cc6634c0532925a3b844bc9e7595f5ff21': { xp: 9340, trades: 67, streak: 5 },
}

function getUserData(address: string) {
  const key = address.toLowerCase()
  const stored = xpStore.get(key)
  const genesis = GENESIS_DATA[key]
  
  if (stored) {
    return { ...stored, address: key }
  }
  if (genesis) {
    return { ...genesis, address: key, claims: [] }
  }
  
  // Generate consistent XP from address
  const hash = parseInt(address.slice(2, 10), 16)
  return {
    address: key,
    xp: (hash % 500) + 100,
    trades: (hash % 20),
    streak: (hash % 7),
    claims: []
  }
}

function updateUserXP(address: string, xpToAdd: number, claimId?: string) {
  const key = address.toLowerCase()
  const current = getUserData(address)
  
  const newData = {
    xp: current.xp + xpToAdd,
    trades: current.trades,
    streak: current.streak,
    claims: claimId ? [...(current.claims || []), claimId] : (current.claims || [])
  }
  
  xpStore.set(key, newData)
  return newData
}

function getLeaderboard(limit: number = 20) {
  // Combine genesis data with stored data
  const allUsers = new Map<string, { address: string; xp: number; trades: number; streak: number }>()
  
  // Add genesis users
  for (const [addr, data] of Object.entries(GENESIS_DATA)) {
    allUsers.set(addr, { address: addr, ...data })
  }
  
  // Add/update with stored users
  for (const [addr, data] of xpStore.entries()) {
    const existing = allUsers.get(addr)
    if (existing) {
      allUsers.set(addr, { ...existing, xp: Math.max(existing.xp, data.xp) })
    } else {
      allUsers.set(addr, { address: addr, xp: data.xp, trades: data.trades, streak: data.streak })
    }
  }
  
  // Sort by XP descending
  const sorted = Array.from(allUsers.values())
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit)
  
  return sorted
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { address, action, amount, event, xp: xpAmount } = body

    if (!address) {
      return NextResponse.json({ error: 'No address provided' }, { status: 400 })
    }

    // Handle event claim
    if (event && xpAmount) {
      const current = getUserData(address)
      if (current.claims?.includes(event)) {
        return NextResponse.json({ error: 'Already claimed', claimed: true }, { status: 400 })
      }
      
      const updated = updateUserXP(address, xpAmount, event)
      return NextResponse.json({
        success: true,
        xpEarned: xpAmount,
        totalXP: updated.xp,
        event,
        source: 'claim'
      })
    }

    // Handle trade actions
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

    const updated = updateUserXP(address, xpEarned)
    
    return NextResponse.json({
      success: true,
      xpEarned,
      totalXP: updated.xp,
      level: Math.floor(updated.xp / 1000) + 1,
      action,
      source: 'action'
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')
  const limit = parseInt(searchParams.get('limit') || '20')

  // Single user XP query
  if (address) {
    const userData = getUserData(address)
    const leaderboard = getLeaderboard(100)
    const rank = leaderboard.findIndex(u => u.address === address.toLowerCase()) + 1
    const level = Math.floor(userData.xp / 1000) + 1
    
    return NextResponse.json({
      address: address.toLowerCase(),
      xp: userData.xp,
      trades: userData.trades,
      streak: userData.streak,
      level,
      nextLevelXP: level * 1000,
      rank: rank || leaderboard.length + 1,
      source: 'baseline'
    })
  }

  // Leaderboard query - return flat array
  const leaderboard = getLeaderboard(limit)
  return NextResponse.json(leaderboard)
}
