import { NextRequest, NextResponse } from 'next/server'

// In-memory store (replace with database in production)
const claims = new Map<string, { events: string[]; totalXP: number }>()

export async function POST(request: NextRequest) {
  try {
    const { address, event, xp } = await request.json()
    
    if (!address || !event || !xp) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const key = address.toLowerCase()
    const existing = claims.get(key) || { events: [], totalXP: 0 }
    
    // Check if already claimed
    if (existing.events.includes(event)) {
      return NextResponse.json({ error: 'Already claimed', claimed: true }, { status: 400 })
    }
    
    // Record claim
    existing.events.push(event)
    existing.totalXP += xp
    claims.set(key, existing)
    
    return NextResponse.json({
      success: true,
      event,
      xp,
      totalXP: existing.totalXP
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process claim' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  
  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }
  
  const key = address.toLowerCase()
  const data = claims.get(key) || { events: [], totalXP: 0 }
  
  return NextResponse.json(data)
}
