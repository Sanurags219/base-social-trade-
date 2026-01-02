// On-chain Event Registry integration
import { createPublicClient, http, keccak256, toHex } from 'viem'
import { base } from 'viem/chains'

const EVENT_REGISTRY = process.env.NEXT_PUBLIC_EVENT_CONTRACT || '0x0000000000000000000000000000000000000000'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
})

export const EVENT_REGISTRY_ABI = [
  {
    name: 'getEvent',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'eventId', type: 'bytes32' }],
    outputs: [
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'eventType', type: 'uint8' },
      { name: 'status', type: 'uint8' },
      { name: 'participants', type: 'uint256' },
      { name: 'maxParticipants', type: 'uint256' },
      { name: 'sbtReward', type: 'bool' },
      { name: 'xpReward', type: 'uint256' }
    ]
  },
  {
    name: 'hasUserClaimed',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'eventId', type: 'bytes32' },
      { name: 'user', type: 'address' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'getActiveEvents',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32[]' }]
  },
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'eventId', type: 'bytes32' }],
    outputs: []
  },
  {
    name: 'getTotalEvents',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

export type EventStatus = 'active' | 'upcoming' | 'ended'
export type EventType = 'launch' | 'challenge' | 'early-supporter' | 'partner'

export interface OnChainEvent {
  id: string
  eventId: `0x${string}`
  title: string
  description: string
  type: EventType
  status: EventStatus
  participants: number
  maxParticipants: number
  rewards: {
    sbt: boolean
    xp: number
  }
}

const EVENT_TYPES: EventType[] = ['launch', 'challenge', 'early-supporter', 'partner']
const EVENT_STATUSES: EventStatus[] = ['active', 'upcoming', 'ended']

export function getEventId(id: string): `0x${string}` {
  return keccak256(toHex(id))
}

export async function getOnChainEvent(id: string): Promise<OnChainEvent | null> {
  if (EVENT_REGISTRY === '0x0000000000000000000000000000000000000000') {
    return null
  }
  
  try {
    const eventId = getEventId(id)
    const result = await publicClient.readContract({
      address: EVENT_REGISTRY as `0x${string}`,
      abi: EVENT_REGISTRY_ABI,
      functionName: 'getEvent',
      args: [eventId],
    })
    
    return {
      id,
      eventId,
      title: result[0],
      description: result[1],
      type: EVENT_TYPES[Number(result[2])] || 'launch',
      status: EVENT_STATUSES[Number(result[3])] || 'active',
      participants: Number(result[4]),
      maxParticipants: Number(result[5]),
      rewards: {
        sbt: result[6],
        xp: Number(result[7]),
      }
    }
  } catch (error) {
    console.error('Failed to get on-chain event:', error)
    return null
  }
}

export async function hasUserClaimedEvent(eventId: string, userAddress: string): Promise<boolean> {
  if (EVENT_REGISTRY === '0x0000000000000000000000000000000000000000') {
    return false
  }
  
  try {
    return await publicClient.readContract({
      address: EVENT_REGISTRY as `0x${string}`,
      abi: EVENT_REGISTRY_ABI,
      functionName: 'hasUserClaimed',
      args: [getEventId(eventId), userAddress as `0x${string}`],
    })
  } catch {
    return false
  }
}

export async function getActiveEventIds(): Promise<`0x${string}`[]> {
  if (EVENT_REGISTRY === '0x0000000000000000000000000000000000000000') {
    return []
  }
  
  try {
    return await publicClient.readContract({
      address: EVENT_REGISTRY as `0x${string}`,
      abi: EVENT_REGISTRY_ABI,
      functionName: 'getActiveEvents',
      args: [],
    }) as `0x${string}`[]
  } catch {
    return []
  }
}

export function getEventRegistryAddress(): string {
  return EVENT_REGISTRY
}

// Get claim transaction data for user wallet
export function getClaimCalldata(eventId: string): { to: `0x${string}`, data: `0x${string}` } {
  const eventIdBytes = getEventId(eventId)
  // claim(bytes32) selector: 0x379607f5
  const data = `0x379607f5${eventIdBytes.slice(2)}` as `0x${string}`
  
  return {
    to: EVENT_REGISTRY as `0x${string}`,
    data,
  }
}
