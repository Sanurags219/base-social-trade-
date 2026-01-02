'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount, useWriteContract, useReadContract, useChainId } from 'wagmi'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WalletConnect } from '@/components/WalletConnect'
import Link from 'next/link'

const SBT_CONTRACT = process.env.NEXT_PUBLIC_REP_CONTRACT || '0xa8efb84f532278fd3a68fe4e0d4fe15c04e5b786'
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

interface Event {
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
  partner?: string
}

function EventTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'launch':
      return <span className="text-4xl">🚀</span>
    case 'challenge':
      return <span className="text-4xl">🏆</span>
    case 'early-supporter':
      return <span className="text-4xl">⭐</span>
    case 'partner':
      return <span className="text-4xl">🤝</span>
    default:
      return <span className="text-4xl">📅</span>
  }
}

export default function EventDetailPage() {
  const params = useParams()
  const eventId = params.id as string
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, isPending: claiming } = useWriteContract()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [claimed, setClaimed] = useState(false)
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

  // Get total supply for display
  const { data: totalSupply } = useReadContract({
    address: SBT_CONTRACT as `0x${string}`,
    abi: SBT_ABI,
    functionName: 'totalSupply',
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
  
  const handleClaim = async () => {
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
            setClaimed(true)
            setTxHash(hash)
            refetchClaimed()
          },
          onError: (error) => {
            if (error.message.includes('Already claimed')) {
              setError('You have already claimed your SBT')
              setClaimed(true)
            } else if (error.message.includes('User rejected')) {
              setError('Transaction cancelled')
            } else {
              setError(error.message || 'Failed to claim')
            }
          }
        }
      )
    } catch (e: any) {
      setError(e?.message || 'Failed to claim reward')
    }
  }
  
  const handleShare = () => {
    if (!event) return
    
    const text = `I just claimed rewards from "${event.title}" on BSTN! 🎉\n\n`
      + (event.rewards.sbt ? '🎖 Genesis SBT\n' : '')
      + (event.rewards.xp ? `⭐ ${event.rewards.xp} XP\n` : '')
      + (event.rewards.token ? `🪙 ${event.rewards.token.amount} ${event.rewards.token.symbol}\n` : '')
      + '\nJoin the event 👇'
    
    const url = `https://base-social-trade.vercel.app/events/${event.id}`
    
    // Farcaster share URL
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
            <svg className="w-12 h-12 mx-auto text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-zinc-400 mb-4">Event not found</p>
            <Link href="/events" className="text-blue-400 text-sm hover:underline">
              ← Back to Events
            </Link>
          </div>
        </Card>
      </AppShell>
    )
  }
  
  const daysLeft = Math.ceil((new Date(event.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const progress = event.maxParticipants 
    ? (event.participants / event.maxParticipants) * 100 
    : null
  const isFull = event.maxParticipants && event.participants >= event.maxParticipants
  
  return (
    <AppShell>
      <WalletConnect />
      
      {/* Back Link */}
      <Link href="/events" className="text-sm text-zinc-400 hover:text-white mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        All Events
      </Link>
      
      {/* Event Header */}
      <Card>
        <div className="text-center py-4">
          <EventTypeIcon type={event.type} />
          <h1 className="text-xl font-bold mt-3">{event.title}</h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto">{event.description}</p>
          
          {/* Status */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className={`text-xs px-3 py-1 rounded-full ${
              event.status === 'active' 
                ? 'bg-green-500/20 text-green-400' 
                : event.status === 'upcoming'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-zinc-500/20 text-zinc-400'
            }`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
            {event.status === 'active' && daysLeft > 0 && (
              <span className="text-xs text-zinc-500">
                ⏰ {daysLeft} days left
              </span>
            )}
          </div>
          
          {/* Partner */}
          {event.partner && (
            <p className="text-xs text-blue-400 mt-2">
              Powered by {event.partner}
            </p>
          )}
        </div>
      </Card>
      
      {/* Rewards */}
      <Card className="mt-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span>🎁</span>
          Rewards
        </h3>
        <div className="space-y-3">
          {event.rewards.sbt && (
            <div className="flex items-center gap-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <span className="text-2xl">🎖</span>
              <div>
                <p className="font-medium text-sm">Genesis SBT</p>
                <p className="text-xs text-zinc-500">Soulbound Token (non-transferable)</p>
              </div>
            </div>
          )}
          {event.rewards.xp && (
            <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-medium text-sm">{event.rewards.xp} XP</p>
                <p className="text-xs text-zinc-500">Experience points</p>
              </div>
            </div>
          )}
          {event.rewards.token && (
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <span className="text-2xl">🪙</span>
              <div>
                <p className="font-medium text-sm">{event.rewards.token.amount} {event.rewards.token.symbol}</p>
                <p className="text-xs text-zinc-500">Token reward</p>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {/* Requirements */}
      {event.requirements && event.requirements.length > 0 && (
        <Card className="mt-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span>✅</span>
            Requirements
          </h3>
          <div className="space-y-2">
            {event.requirements.map((req, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                  {i + 1}
                </div>
                {req}
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* Progress */}
      {progress !== null && (
        <Card className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-400">Participants</span>
            <span className="font-medium">{event.participants} / {event.maxParticipants}</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          {isFull && (
            <p className="text-xs text-red-400 mt-2 text-center">This event is full</p>
          )}
        </Card>
      )}
      
      {/* Claim Section */}
      <div className="mt-6">
        {wrongNetwork && (
          <div className="mb-4 rounded-xl bg-red-900/30 border border-red-500/20 px-4 py-3 text-sm text-red-300 text-center">
            Wrong network. Please switch to Base.
          </div>
        )}
        
        {claimed || hasClaimed ? (
          <Card>
            <div className="text-center py-4">
              <span className="text-4xl">🎉</span>
              <h3 className="font-bold text-lg mt-2">Reward Claimed!</h3>
              <p className="text-sm text-zinc-400 mt-1">
                Congratulations! Your Genesis SBT is now in your wallet.
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
                  className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-all active:scale-95"
                >
                  Share on Farcaster
                </button>
                <p className="text-xs text-zinc-500 mt-2">
                  +50 XP bonus for sharing
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Button
              onClick={handleClaim}
              disabled={!isConnected || event.status !== 'active' || claiming || !!isFull || wrongNetwork}
            >
              {!isConnected
                ? 'Connect Wallet'
                : wrongNetwork
                ? 'Switch to Base'
                : event.status === 'upcoming'
                ? 'Coming Soon'
                : event.status === 'ended'
                ? 'Event Ended'
                : isFull
                ? 'Event Full'
                : claiming
                ? '⏳ Claiming...'
                : 'Claim SBT (Free + Gas)'}
            </Button>
            
            <p className="text-xs text-zinc-500 mt-2 text-center">
              One claim per wallet. Only pay gas fees (~$0.01).
            </p>
            
            {error && (
              <div className="mt-3 p-3 rounded-xl bg-red-900/30 border border-red-500/20 text-xs text-red-300 text-center">
                {error}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Share Preview */}
      {!claimed && (
        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-500">
            Share after claiming for +50 bonus XP
          </p>
        </div>
      )}
    </AppShell>
  )
}
