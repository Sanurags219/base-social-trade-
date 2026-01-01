'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TraderProfile() {
  const { address } = useParams()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return

    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/trader?address=${address}`)
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch trader stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [address])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div>Loading trader profile…</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div>Trader not found</div>
      </div>
    )
  }

  const addressStr = typeof address === 'string' ? address : ''

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {addressStr.slice(0, 6)}…{addressStr.slice(-4)}
          </h1>
          <p className="text-zinc-400 text-sm font-mono">{addressStr}</p>
        </div>

        <div className="bg-zinc-900 rounded-xl p-4 space-y-4 mb-6">
          <div className="border-b border-zinc-800 pb-4">
            <p className="text-zinc-400 text-sm mb-1">Total XP</p>
            <p className="text-3xl font-bold text-green-400">{stats.xp.toLocaleString()}</p>
          </div>

          <div className="border-b border-zinc-800 pb-4">
            <p className="text-zinc-400 text-sm mb-1">Trades</p>
            <p className="text-2xl font-bold">{stats.trades}</p>
          </div>

          <div className="border-b border-zinc-800 pb-4">
            <p className="text-zinc-400 text-sm mb-1">Followers</p>
            <p className="text-2xl font-bold">{stats.followers}</p>
          </div>

          <div>
            <p className="text-zinc-400 text-sm mb-1">Copy Trades</p>
            <p className="text-2xl font-bold">{stats.copiedTrades || 0}</p>
          </div>
        </div>

        <a
          href={`/swap?copy=${addressStr}`}
          className="block text-center bg-blue-600 hover:bg-blue-500 transition rounded-xl py-3 font-semibold mb-4"
        >
          📋 Copy Trade
        </a>

        <a
          href={`/reputation/${addressStr}`}
          className="block text-center bg-purple-600 hover:bg-purple-500 transition rounded-xl py-3 font-semibold mb-4"
        >
          ⭐ View Reputation
        </a>

        <a
          href="/leaderboard"
          className="block text-center bg-zinc-900 hover:bg-zinc-800 transition rounded-xl py-3 font-semibold text-zinc-400"
        >
          Back to Leaderboard
        </a>

        <div className="mt-6 bg-zinc-900/50 rounded-xl p-4 text-xs text-zinc-400">
          <p className="font-semibold mb-2">Copy Trading Info:</p>
          <ul className="space-y-1">
            <li>• Follow this trader's swaps</li>
            <li>• Earn +25 XP per copy</li>
            <li>• They earn +15 XP</li>
            <li>• Help build a trading network</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
