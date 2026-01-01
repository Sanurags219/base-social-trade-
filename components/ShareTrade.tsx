'use client'

import { shareToFarcaster } from '@/lib/farcaster'
import { useAccount } from 'wagmi'

export function ShareTrade({ amount }: { amount: string }) {
  const { address } = useAccount()

  const onShare = async () => {
    if (!address) return alert('Connect wallet')

    shareToFarcaster(
      `I just swapped ${amount} ETH on Base 🚀`,
      `${location.origin}/api/og/trade?amount=${amount}`
    )

    await fetch('/api/xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    })
  }

  return (
    <button
      onClick={onShare}
      className="w-full mt-4 bg-green-600 hover:bg-green-500 transition rounded-xl py-3 font-semibold"
    >
      Share Trade + Earn XP
    </button>
  )
}
