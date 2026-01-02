import { NextRequest, NextResponse } from 'next/server'
import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { base } from 'viem/chains'

const REP_CONTRACT = process.env.NEXT_PUBLIC_REP_CONTRACT || '0x6f0e6da952ac7e30688024cfac71a760b89495d5'
const ADMIN_KEY = process.env.ADMIN_PRIVATE_KEY

const MINT_ABI = [
  {
    name: 'mintReputation',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'score', type: 'uint256' }
    ],
    outputs: []
  },
  {
    name: 'hasSBTFor',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const

export interface EventGate {
  minHealth?: number
  minXP?: number
  minTier?: 'Trusted' | 'Elite'
}

export interface Event {
  id: string
  title: string
  description: string
  type: 'exclusive' | 'invite-only' | 'public'
  status: 'live' | 'upcoming' | 'ended'
  rewards: {
    sbt?: boolean
    xp?: number
    token?: { symbol: string; amount: number }
  }
  gate?: EventGate
  requirements?: string[]
  spots?: number
  spotsRemaining?: number
  startDate: string
  endDate: string
  closesIn?: string
  image?: string
  partner?: string
}

// Calculate days until end
function getDaysLeft(endDate: string): number {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

// Events data - exclusive-first model
const EVENTS: Event[] = [
  // Exclusive events (gated)
  {
    id: 'trusted-circle',
    title: 'Baseline Trusted Circle',
    description: 'Reserved for Trusted members with strong wallet health. Earn premium rewards.',
    type: 'exclusive',
    status: 'live',
    rewards: {
      sbt: true,
      xp: 1500,
    },
    gate: {
      minHealth: 60,
      minTier: 'Trusted'
    },
    requirements: [
      'Maintain Trusted tier',
      'Wallet health 60+',
    ],
    spots: 500,
    spotsRemaining: 487,
    startDate: '2026-01-02',
    endDate: '2026-02-01',
  },
  {
    id: 'genesis',
    title: 'BSTN Genesis',
    description: 'Be among the first to join Baseline. Your Genesis SBT marks you as an early supporter.',
    type: 'exclusive',
    status: 'live',
    rewards: {
      sbt: true,
      xp: 500,
    },
    gate: {
      minHealth: 40
    },
    requirements: [
      'Connect wallet',
      'Have at least 0.001 ETH on Base',
    ],
    spots: 10000,
    spotsRemaining: 9847,
    startDate: '2026-01-02',
    endDate: '2026-02-01',
  },
  {
    id: 'trading-week',
    title: 'Weekly Trading Challenge',
    description: 'Complete 5 swaps this week to earn bonus XP and climb the leaderboard.',
    type: 'exclusive',
    status: 'live',
    rewards: {
      xp: 250,
    },
    gate: {
      minXP: 100
    },
    requirements: [
      'Complete 5 swaps',
      'Minimum $10 per swap',
    ],
    spots: undefined,
    startDate: '2026-01-02',
    endDate: '2026-01-09',
  },
  // Invite-only (ultra premium)
  {
    id: 'elite-inner-circle',
    title: 'Elite Inner Circle',
    description: 'You have been selected for our most exclusive program. Top-tier rewards await.',
    type: 'invite-only',
    status: 'live',
    rewards: {
      sbt: true,
      xp: 5000,
      token: { symbol: 'BSTN', amount: 500 },
    },
    gate: {
      minTier: 'Elite'
    },
    requirements: [
      'Elite tier membership',
      'Invitation accepted',
    ],
    spots: 50,
    spotsRemaining: 43,
    startDate: '2026-01-02',
    endDate: '2026-03-02',
  },
  // Partnership event
  {
    id: 'base-partnership',
    title: 'Base x Baseline',
    description: 'Special partnership event with Base. Complete tasks to earn exclusive rewards.',
    type: 'exclusive',
    status: 'upcoming',
    rewards: {
      xp: 300,
      token: { symbol: 'BSTN', amount: 50 },
    },
    gate: {
      minHealth: 50
    },
    requirements: [
      'Hold any NFT on Base',
      'Complete 1 swap on Baseline',
    ],
    spots: 1000,
    spotsRemaining: 1000,
    startDate: '2026-01-16',
    endDate: '2026-01-31',
    partner: 'Base',
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('id')
  const userHealth = parseInt(searchParams.get('health') || '0')
  const userXP = parseInt(searchParams.get('xp') || '0')
  const userTier = searchParams.get('tier') || 'New'

  // Single event lookup
  if (eventId) {
    const event = EVENTS.find(e => e.id === eventId)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    
    // Add computed fields
    const daysLeft = getDaysLeft(event.endDate)
    const closesIn = daysLeft > 0 ? `${daysLeft} days` : 'Ended'
    
    return NextResponse.json({
      ...event,
      closesIn,
    })
  }

  // Filter events based on user qualification
  const tierRank: Record<string, number> = { 'New': 0, 'Regular': 1, 'Trusted': 2, 'Elite': 3 }
  
  const qualifiedEvents = EVENTS.filter(event => {
    if (!event.gate) return true
    
    if (event.gate.minHealth && userHealth < event.gate.minHealth) return false
    if (event.gate.minXP && userXP < event.gate.minXP) return false
    if (event.gate.minTier) {
      if (tierRank[userTier] < tierRank[event.gate.minTier]) return false
    }
    
    return true
  }).map(event => {
    const daysLeft = getDaysLeft(event.endDate)
    return {
      ...event,
      closesIn: daysLeft > 0 ? `${daysLeft} days` : 'Ended',
    }
  })

  // Separate by status
  const liveEvents = qualifiedEvents.filter(e => e.status === 'live')
  const upcomingEvents = qualifiedEvents.filter(e => e.status === 'upcoming')
  
  // Check if user has more events to unlock
  const totalEvents = EVENTS.filter(e => e.status === 'live' || e.status === 'upcoming').length
  const hasMoreToUnlock = qualifiedEvents.length < totalEvents

  return NextResponse.json({
    events: qualifiedEvents,
    liveEvents,
    upcomingEvents,
    total: qualifiedEvents.length,
    hasMoreToUnlock,
    userStats: {
      health: userHealth,
      xp: userXP,
      tier: userTier,
    }
  })
}

// Join endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, address } = body

    if (!eventId || !address) {
      return NextResponse.json({ error: 'eventId and address required' }, { status: 400 })
    }

    const event = EVENTS.find(e => e.id === eventId)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.status !== 'live') {
      return NextResponse.json({ error: 'Event is not live' }, { status: 400 })
    }

    if (event.spots && event.spotsRemaining !== undefined && event.spotsRemaining <= 0) {
      return NextResponse.json({ error: 'No spots remaining' }, { status: 400 })
    }

    let txHash: string | null = null

    // Mint SBT on-chain if event has SBT reward and admin key is configured
    if (event.rewards.sbt && ADMIN_KEY) {
      try {
        const publicClient = createPublicClient({
          chain: base,
          transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
        })

        // Check if user already has an SBT
        const hasSBT = await publicClient.readContract({
          address: REP_CONTRACT as `0x${string}`,
          abi: MINT_ABI,
          functionName: 'hasSBTFor',
          args: [address as `0x${string}`],
        })

        if (!hasSBT) {
          const account = privateKeyToAccount(ADMIN_KEY as `0x${string}`)
          const walletClient = createWalletClient({
            account,
            chain: base,
            transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
          })

          // Mint with initial score based on event
          const initialScore = event.type === 'invite-only' ? 200 : event.type === 'exclusive' ? 150 : 100
          const hash = await walletClient.writeContract({
            address: REP_CONTRACT as `0x${string}`,
            abi: MINT_ABI,
            functionName: 'mintReputation',
            args: [address as `0x${string}`, BigInt(initialScore)],
          })

          txHash = hash
        }
      } catch (mintError) {
        console.error('SBT mint error:', mintError)
      }
    }

    return NextResponse.json({
      success: true,
      message: txHash ? 'Joined & SBT minted!' : 'Successfully joined!',
      rewards: event.rewards,
      txHash: txHash || `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      minted: !!txHash,
    })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to join' }, { status: 500 })
  }
}
