'use client'

import { shareToFarcaster } from '@/lib/farcaster'

export function ShareTrade({ amount }: { amount: string }) {
  const onShare = async () => {
    shareToFarcaster(
      `I just swapped ${amount} ETH on Base 🚀`,
      `${location.origin}/api/og/trade?amount=${amount}`
    )

    // award XP
    await fetch('/api/xp', { method: 'POST' })
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
