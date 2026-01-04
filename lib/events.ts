// EventRegistry contract integration
import { createPublicClient, http, keccak256, toBytes } from 'viem'
import { base } from 'viem/chains'

const EVENT_REGISTRY = process.env.NEXT_PUBLIC_EVENT_CONTRACT || '0xe1ebc0804a5f298d07f4544bf3fe1bb00ac31776'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
})

export const EVENT_REGISTRY_ABI = [
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'eventId', type: 'bytes32' }],
    outputs: []
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
    name: 'getEvent',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'eventId', type: 'bytes32' }],
    outputs: [
      { name: 'title', type: 'string' },
      { name: 'status', type: 'uint8' },
      { name: 'xpReward', type: 'uint256' },
      { name: 'sbtReward', type: 'bool' },
      { name: 'participants', type: 'uint256' },
      { name: 'maxParticipants', type: 'uint256' }
    ]
  },
  {
    name: 'getActiveEvents',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32[]' }]
  }
] as const

// Event IDs (keccak256 of string id)
export const EVENT_IDS = {
  genesis: keccak256(toBytes('genesis')),
  swapChallenge: keccak256(toBytes('swap-challenge')),
  copyTrade: keccak256(toBytes('copy-trade')),
  dailyLogin: keccak256(toBytes('daily-login')),
  shareBaseline: keccak256(toBytes('share-baseline')),
  transactionXP: keccak256(toBytes('transaction-xp')),
} as const

export interface EventInfo {
  id: string
  eventId: string
  title: string
  status: number
  xpReward: number
  sbtReward: boolean
  participants: number
  maxParticipants: number
  claimed: boolean
}

export async function hasUserClaimedEvent(eventId: string, userAddress: string): Promise<boolean> {
  try {
    return await publicClient.readContract({
      address: EVENT_REGISTRY as `0x${string}`,
      abi: EVENT_REGISTRY_ABI,
      functionName: 'hasUserClaimed',
      args: [eventId as `0x${string}`, userAddress as `0x${string}`]
    }) as boolean
  } catch {
    return false
  }
}

export function getEventRegistryAddress() {
  return EVENT_REGISTRY
}
