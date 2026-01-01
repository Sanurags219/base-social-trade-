import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for leaderboard and XP tracking
// TODO: Migrate to database (Supabase)
const xpDatabase: Map<string, number> = new Map()
const copyTradeRewards: Map<string, { copiedCount: number; lastCopyDate: string }> = new Map()

/**
 * Reputation tier to XP multiplier
 * - Elite (800+): +40 XP per copy (can also earn +30 as trainer)
 * - Trusted (600-799): +25 XP per copy (can earn +15 as trainer)
 * - Regular (400-599): +25 XP per copy (can earn +15 as trainer)
 * - New (<400): Copy disabled
 */
function getXpReward(repScore: number, role: 'copier' | 'trainer'): number {
  if (repScore < 400) return 0

  if (role === 'copier') {
    if (repScore >= 800) return 40
    return 25
  } else {
    if (repScore >= 800) return 30
    return 15
  }
}

/**
 * Check if it's the first copy-trade of the day (bonus +50 XP)
 */
function isFirstCopyOfDay(address: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  const record = copyTradeRewards.get(address)

  if (!record || record.lastCopyDate !== today) {
    return true
  }
  return false
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { address, xp, copiedFrom, copiedFromRep } = body

  if (!address) {
    return NextResponse.json({ error: 'No address' }, { status: 400 })
  }

  if (typeof xp !== 'number' || xp < 0 || xp > 100) {
    return NextResponse.json({ error: 'Invalid XP amount' }, { status: 400 })
  }

  const currentXP = xpDatabase.get(address) || 0
  xpDatabase.set(address, currentXP + xp)

  if (copiedFrom && copiedFromRep !== undefined) {
    const reputerXP = xpDatabase.get(copiedFrom) || 0
    const trainerReward = getXpReward(copiedFromRep, 'trainer')

    if (trainerReward > 0) {
      xpDatabase.set(copiedFrom, reputerXP + trainerReward)
    }

    const today = new Date().toISOString().split('T')[0]
    const record = copyTradeRewards.get(address) || { copiedCount: 0, lastCopyDate: today }
    copyTradeRewards.set(address, {
      copiedCount: record.copiedCount + 1,
      lastCopyDate: today
    })

    if (isFirstCopyOfDay(address)) {
      const bonusXP = 50
      xpDatabase.set(address, (xpDatabase.get(address) || 0) + bonusXP)
      return NextResponse.json({
        address,
        xp: currentXP + xp + bonusXP,
        copiedFrom,
        trainerXP: trainerReward,
        bonus: bonusXP,
        message: '🎉 First copy of the day! +50 bonus XP'
      })
    }
  }

  return NextResponse.json({
    address,
    xp: currentXP + xp,
    message: 'XP added'
  })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (address) {
    const xp = xpDatabase.get(address) || 0
    const copyRecord = copyTradeRewards.get(address)

    return NextResponse.json({
      address,
      xp,
      copiedTrades: copyRecord?.copiedCount || 0,
      lastCopyDate: copyRecord?.lastCopyDate
    })
  }

  const leaderboard = Array.from(xpDatabase.entries())
    .map(([addr, xp]) => ({ address: addr, xp }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 50)

  return NextResponse.json(leaderboard)
}
