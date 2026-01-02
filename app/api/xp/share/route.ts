import { NextRequest, NextResponse } from 'next/server'

// In-memory store for share tracking (use Redis/DB in production)
const shareTracker = new Map<string, { lastShare: number; count: number }>()

const XP_REWARD = 25
const COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, type = 'health' } = body
    
    if (!address) {
      return NextResponse.json({ error: 'Address required' }, { status: 400 })
    }
    
    const key = `${address.toLowerCase()}-${type}`
    const now = Date.now()
    const existing = shareTracker.get(key)
    
    // Check cooldown
    if (existing && now - existing.lastShare < COOLDOWN_MS) {
      const hoursRemaining = Math.ceil((COOLDOWN_MS - (now - existing.lastShare)) / (60 * 60 * 1000))
      return NextResponse.json({
        success: false,
        error: `Already claimed. Try again in ${hoursRemaining} hours.`,
        xp: 0,
      })
    }
    
    // Grant XP
    shareTracker.set(key, {
      lastShare: now,
      count: (existing?.count || 0) + 1,
    })
    
    // In production: Write to database, update user XP
    // await db.xp.increment(address, XP_REWARD)
    
    return NextResponse.json({
      success: true,
      xp: XP_REWARD,
      reason: `${type === 'health' ? 'Health score' : 'Content'} shared`,
      totalShares: shareTracker.get(key)?.count || 1,
      message: `+${XP_REWARD} XP earned!`,
    })
    
  } catch (error) {
    console.error('Share XP error:', error)
    return NextResponse.json({ error: 'Failed to process share reward' }, { status: 500 })
  }
}

// GET endpoint to check share status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const type = searchParams.get('type') || 'health'
  
  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }
  
  const key = `${address.toLowerCase()}-${type}`
  const existing = shareTracker.get(key)
  
  if (!existing) {
    return NextResponse.json({
      canShare: true,
      totalShares: 0,
      xpAvailable: XP_REWARD,
    })
  }
  
  const now = Date.now()
  const canShare = now - existing.lastShare >= COOLDOWN_MS
  const hoursRemaining = canShare ? 0 : Math.ceil((COOLDOWN_MS - (now - existing.lastShare)) / (60 * 60 * 1000))
  
  return NextResponse.json({
    canShare,
    totalShares: existing.count,
    xpAvailable: canShare ? XP_REWARD : 0,
    cooldownHours: hoursRemaining,
  })
}
