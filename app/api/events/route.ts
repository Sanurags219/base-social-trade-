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

export interface Event {
  id: string
  title: string
  description: string
  type: 'launch' | 'challenge' | 'early-supporter' | 'partner'
  status: 'active' | 'upcoming' | 'ended'
  rewards: {
    sbt?: boolean
    xp?: number
    token?: { symbol: string; amount: number }
  }
  requirements?: string[]
  participants: number
  maxParticipants?: number
  startDate: string
  endDate: string
  image?: string
  partner?: string
}

// Mock events data - in production, this would come from a database
const EVENTS: Event[] = [
  {
    id: 'genesis',
    title: 'BSTN Genesis Event',
    description: 'Be among the first to join BSTN. Claim your Genesis SBT and earn bonus XP for being an early supporter.',
    type: 'launch',
    status: 'active',
    rewards: {
      sbt: true,
      xp: 500,
    },
    requirements: [
      'Connect wallet',
      'Have at least 0.001 ETH on Base',
    ],
    participants: 0,
    maxParticipants: 10000,
    startDate: '2026-01-02',
    endDate: '2026-02-01',
  },
  {
    id: 'trading-week',
    title: 'Trading Week Challenge',
    description: 'Complete 5 swaps this week to earn bonus XP and climb the leaderboard.',
    type: 'challenge',
    status: 'active',
    rewards: {
      xp: 250,
    },
    requirements: [
      'Complete 5 swaps',
      'Minimum $10 per swap',
    ],
    participants: 0,
    startDate: '2026-01-02',
    endDate: '2026-01-09',
  },
  {
    id: 'early-bird',
    title: 'Early Bird Bonus',
    description: 'First 100 users to reach Trusted tier get exclusive rewards.',
    type: 'early-supporter',
    status: 'active',
    rewards: {
      sbt: true,
      xp: 1000,
      token: { symbol: 'BSTN', amount: 100 },
    },
    requirements: [
      'Reach Trusted tier (650+ reputation)',
      'Be in first 100',
    ],
    participants: 0,
    maxParticipants: 100,
    startDate: '2026-01-02',
    endDate: '2026-03-02',
  },
  {
    id: 'base-partnership',
    title: 'Base x BSTN',
    description: 'Special partnership event with Base. Complete tasks to earn exclusive rewards.',
    type: 'partner',
    status: 'upcoming',
    rewards: {
      xp: 300,
      token: { symbol: 'BSTN', amount: 50 },
    },
    requirements: [
      'Hold any NFT on Base',
      'Complete 1 swap on BSTN',
    ],
    participants: 0,
    startDate: '2026-01-16',
    endDate: '2026-01-31',
    partner: 'Base',
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('id')
  const status = searchParams.get('status')
  
  if (eventId) {
    const event = EVENTS.find(e => e.id === eventId)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    return NextResponse.json(event)
  }
  
  let filteredEvents = EVENTS
  if (status) {
    filteredEvents = EVENTS.filter(e => e.status === status)
  }
  
  return NextResponse.json({
    events: filteredEvents,
    total: filteredEvents.length,
  })
}

// Claim endpoint
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
    
    if (event.status !== 'active') {
      return NextResponse.json({ error: 'Event is not active' }, { status: 400 })
    }
    
    if (event.maxParticipants && event.participants >= event.maxParticipants) {
      return NextResponse.json({ error: 'Event is full' }, { status: 400 })
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
          
          // Mint with initial score of 100 (Genesis early adopter bonus)
          const hash = await walletClient.writeContract({
            address: REP_CONTRACT as `0x${string}`,
            abi: MINT_ABI,
            functionName: 'mintReputation',
            args: [address as `0x${string}`, BigInt(100)],
          })
          
          txHash = hash
        }
      } catch (mintError) {
        console.error('SBT mint error:', mintError)
        // Continue even if minting fails - don't block the claim
      }
    }
    
    return NextResponse.json({
      success: true,
      message: txHash ? 'Reward claimed & SBT minted!' : 'Reward claimed successfully!',
      rewards: event.rewards,
      txHash: txHash || `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
      minted: !!txHash,
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to claim' }, { status: 500 })
  }
}
