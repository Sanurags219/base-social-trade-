'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount, useWriteContract, useReadContract, useChainId } from 'wagmi'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WalletConnect } from '@/components/WalletConnect'
import Link from 'next/link'

// SBT Contract on Base Mainnet
const SBT_CONTRACT = '0xa8efb84f532278fd3a68fe4e0d4fe15c04e5b786' as const
const BASE_CHAIN_ID = 8453

const SBT_ABI = [
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'hasClaimed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

interface EventGate {
  minHealth?: number
  minXP?: number
  minTier?: 'Trusted' | 'Elite'
}

interface Event {
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
  closesIn?: string
  startDate: string
  endDate: string
  partner?: string
}

function formatGateRequirements(gate?: EventGate): string {
  if (!gate) return ''
  const parts: string[] = []
  if (gate.minHealth) parts.push(`Health ≥ ${gate.minHealth}`)
  if (gate.minXP) parts.push(`XP ≥ ${gate.minXP}`)
  if (gate.minTier) parts.push(`${gate.minTier}+ tier`)
  return parts.join(' · ')
}

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, isPending: joining } = useWriteContract()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [joined, setJoined] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState('')

  const wrongNetwork = chainId !== BASE_CHAIN_ID

  // Check if user already claimed SBT
  const { data: hasClaimed, refetch: refetchClaimed } = useReadContract({
    address: SBT_CONTRACT as `0x${string}`,
    abi: SBT_ABI,
    functionName: 'hasClaimed',
    args: address ? [address] : undefined,
  })

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events?id=${eventId}`)
        if (res.ok) {
          const data = await res.json()
          setEvent(data)
        }
      } catch (e) {
        console.error('Failed to fetch event:', e)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const handleJoin = async () => {
    if (!address || !event || wrongNetwork) return

    setError('')

    try {
      // Call on-chain claim function directly from user's wallet
      writeContract(
        {
          address: SBT_CONTRACT as `0x${string}`,
          abi: SBT_ABI,
          functionName: 'claim'
        },
        {
          onSuccess: (hash) => {
            setJoined(true)
            setTxHash(hash)
            refetchClaimed()
          },
          onError: (error) => {
            if (error.message.includes('Already claimed')) {
              setError('You have already joined this event')
              setJoined(true)
            } else if (error.message.includes('User rejected')) {
              setError('Transaction cancelled')
            } else {
              setError(error.message || 'Failed to join')
            }
          }
        }
      )
    } catch (e: any) {
      setError(e?.message || 'Failed to join event')
    }
  }

  const handleShare = () => {
    if (!event) return

    const text = `I just joined "${event.title}" on Baseline! 🎉\n\n`
      + (event.rewards.sbt ? '🎖 Genesis SBT\n' : '')
      + (event.rewards.xp ? `⭐ ${event.rewards.xp} XP\n` : '')
      + (event.rewards.token ? `🪙 ${event.rewards.token.amount} ${event.rewards.token.symbol}\n` : '')
      + '\nJoin me 👇'

    const url = `https://base-social-trade.vercel.app/events/${event.id}`
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`
    window.open(farcasterUrl, '_blank')
  }

  if (loading) {
    return (
      <AppShell>
        <Card>
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">Loading event...</p>
          </div>
        </Card>
      </AppShell>
    )
  }

  if (!event) {
    return (
      <AppShell>
        <Card>
          <div className="text-center py-12">
            <span className="text-4xl mb-3 block">🔒</span>
            <p className="text-zinc-400 mb-4">Event not found</p>
            <Link href="/events" className="text-blue-400 text-sm hover:underline">
              ← Back to Events
            </Link>
          </div>
        </Card>
      </AppShell>
    )
  }

  const gateText = formatGateRequirements(event.gate)
  const noSpotsLeft = event.spots && event.spotsRemaining !== undefined && event.spotsRemaining <= 0

  return (
    <AppShell>
      <WalletConnect />

      {/* Back Link */}
      <Link href="/events" className="text-sm text-zinc-400 hover:text-white mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Events
      </Link>

      {/* Event Header - Premium styling */}
      <div className={`rounded-2xl p-5 mb-4 ${
        event.type === 'invite-only' 
          ? 'border border-purple-500/30 bg-gradient-to-b from-purple-500/5 to-transparent'
          : event.type === 'exclusive'
          ? 'border border-blue-500/30 bg-gradient-to-b from-blue-500/5 to-transparent'
          : 'border border-white/5 bg-white/[0.03]'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            event.type === 'invite-only' ? 'bg-purple-500/15' : 'bg-blue-500/15'
          }`}>
            {event.type === 'invite-only' ? '🔒' : event.type === 'exclusive' ? '⭐' : '🎯'}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-semibold">{event.title}</h1>
            </div>
            
            {/* Type badge */}
            <div className="flex items-center gap-2 mb-2">
              {event.type === 'exclusive' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                  Exclusive
                </span>
              )}
              {event.type === 'invite-only' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                  Invited
                </span>
              )}
              {event.status === 'live' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                  Live
                </span>
              )}
              {event.status === 'upcoming' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-500/20 text-zinc-400">
                  Coming Soon
                </span>
              )}
            </div>
            
            <p className="text-sm text-zinc-400">{event.description}</p>
            
            {/* Access requirements */}
            {gateText && (
              <p className="text-[10px] text-zinc-500 mt-2">
                Requires: {gateText}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rewards */}
      <Card className="mb-4">
        <h3 className="text-sm font-medium mb-3">Rewards</h3>
        <div className="space-y-2">
          {event.rewards.sbt && (
            <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-xl">
              <span className="text-xl">🎖</span>
              <div>
                <p className="text-sm font-medium">Genesis SBT</p>
                <p className="text-[10px] text-zinc-500">Soulbound Token</p>
              </div>
            </div>
          )}
          {event.rewards.xp && (
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-xl">
              <span className="text-xl">⭐</span>
              <div>
                <p className="text-sm font-medium">{event.rewards.xp} XP</p>
                <p className="text-[10px] text-zinc-500">Experience points</p>
              </div>
            </div>
          )}
          {event.rewards.token && (
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl">
              <span className="text-xl">🪙</span>
              <div>
                <p className="text-sm font-medium">{event.rewards.token.amount} {event.rewards.token.symbol}</p>
                <p className="text-[10px] text-zinc-500">Token reward</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Requirements */}
      {event.requirements && event.requirements.length > 0 && (
        <Card className="mb-4">
          <h3 className="text-sm font-medium mb-3">Requirements</h3>
          <div className="space-y-2">
            {event.requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">
                  {i + 1}
                </div>
                {req}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Spots & Time */}
      {(event.spotsRemaining !== undefined || event.closesIn) && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {event.spotsRemaining !== undefined && (
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <p className="text-lg font-semibold">{event.spotsRemaining}</p>
              <p className="text-[10px] text-zinc-500">Spots left</p>
            </div>
          )}
          {event.closesIn && (
            <div className="bg-white/[0.03] rounded-xl p-3 text-center">
              <p className="text-lg font-semibold">{event.closesIn}</p>
              <p className="text-[10px] text-zinc-500">Closes in</p>
            </div>
          )}
        </div>
      )}

      {/* Join Section */}
      <div className="mt-6">
        {wrongNetwork && (
          <div className="mb-4 rounded-xl bg-red-900/30 border border-red-500/20 px-4 py-3 text-sm text-red-300 text-center">
            Wrong network. Please switch to Base.
          </div>
        )}

        {joined || hasClaimed ? (
          <Card>
            <div className="text-center py-4">
              <span className="text-4xl">🎉</span>
              <h3 className="text-lg font-semibold mt-2">You're In!</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Welcome to {event.title}
              </p>

              {txHash && (
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:underline mt-2 inline-block"
                >
                  View Transaction →
                </a>
              )}

              <div className="mt-4">
                <button
                  onClick={handleShare}
                  className="bg-[#0052FF] hover:bg-[#0047E1] text-white text-sm font-medium px-6 py-2.5 rounded-[14px] transition-all active:scale-[0.98]"
                >
                  Share on Farcaster
                </button>
                <p className="text-[10px] text-zinc-500 mt-2">
                  +50 XP bonus for sharing
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Button
              onClick={handleJoin}
              disabled={!isConnected || event.status !== 'live' || joining || !!noSpotsLeft || wrongNetwork}
            >
              {!isConnected
                ? 'Connect'
                : wrongNetwork
                ? 'Switch to Base'
                : event.status === 'upcoming'
                ? 'Coming Soon'
                : event.status === 'ended'
                ? 'Event Ended'
                : noSpotsLeft
                ? 'No Spots Left'
                : joining
                ? 'Joining...'
                : 'Join Event'}
            </Button>

            <p className="text-[10px] text-zinc-500 mt-2 text-center">
              One join per wallet. Gas only (~$0.01).
            </p>

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-900/30 border border-red-500/20 text-xs text-red-300 text-center">
                {error}
              </div>
            )}
          </>
        )}
      </div>

      {/* Partner */}
      {event.partner && (
        <p className="text-[10px] text-zinc-500 text-center mt-4">
          Powered by {event.partner}
        </p>
      )}
    </AppShell>
  )
}
