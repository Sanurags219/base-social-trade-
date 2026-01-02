'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'

type ReputationData = {
  score: number
  tier: string
  breakdown: {
    xpScore: number
    tradingScore: number
    ageScore: number
    socialScore: number
    riskScore: number
  }
  source: string
}

const TIER_CONFIG = {
  Elite: { color: 'text-purple-400', bg: 'bg-purple-900/20', emoji: '', min: 850 },
  Trusted: { color: 'text-blue-400', bg: 'bg-blue-900/20', emoji: '', min: 650 },
  Regular: { color: 'text-yellow-400', bg: 'bg-yellow-900/20', emoji: '', min: 400 },
  New: { color: 'text-zinc-400', bg: 'bg-zinc-900/20', emoji: '', min: 0 }
}

const BREAKDOWN_LABELS = [
  { key: 'xpScore', label: 'XP Activity', icon: '', desc: 'Points from swaps, shares, daily login' },
  { key: 'tradingScore', label: 'Trading History', icon: '', desc: 'Trade count, volume, consistency' },
  { key: 'ageScore', label: 'Account Age', icon: '', desc: 'Time since first transaction' },
  { key: 'socialScore', label: 'Social Proof', icon: '', desc: 'Copiers, followers, shares' },
  { key: 'riskScore', label: 'Risk Behavior', icon: '', desc: 'No defaults, safe trading' }
]

export default function ReputationPage() {
  const params = useParams()
  const address = params.address as string
  const [data, setData] = useState<ReputationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (address) {
      fetch(`/api/reputation?address=${address}`)
        .then((r) => r.json())
        .then((d) => {
          setData(d)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [address])

  if (loading) {
    return (
      <AppShell>
        <Card>
          <p className="text-sm text-zinc-400 text-center py-8">Loading reputation...</p>
        </Card>
      </AppShell>
    )
  }

  const score = data?.score ?? 0
  const tier = data?.tier ?? 'New'
  const tierConfig = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.New
  const breakdown = data?.breakdown

  return (
    <AppShell>
      <h1 className="text-xl font-bold mb-4"> Reputation</h1>

      {/* Score Card */}
      <div className={`rounded-2xl p-6 mb-4 ${tierConfig.bg} border border-${tierConfig.color.replace('text-', '')}/30`}>
        <div className="text-center">
          <span className="text-5xl">{tierConfig.emoji}</span>
          <div className="text-5xl font-bold mt-2">{score}</div>
          <div className={`text-lg font-semibold ${tierConfig.color} mt-1`}>
            {tier} Tier
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {address?.slice(0, 8)}{address?.slice(-6)}
          </p>
        </div>

        {/* Progress to next tier */}
        {tier !== 'Elite' && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>{score} pts</span>
              <span>
                {tier === 'New' ? '400' : tier === 'Regular' ? '650' : '850'} pts
              </span>
            </div>
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <div
                className={`h-full ${tierConfig.color.replace('text-', 'bg-')} rounded-full`}
                style={{
                  width: `${Math.min(100, tier === 'New' 
                    ? (score / 400) * 100 
                    : tier === 'Regular' 
                      ? ((score - 400) / 250) * 100 
                      : ((score - 650) / 200) * 100
                  )}%`
                }}
              />
            </div>
            <p className="text-xs text-zinc-500 text-center mt-1">
              {tier === 'New' ? 400 - score : tier === 'Regular' ? 650 - score : 850 - score} pts to next tier
            </p>
          </div>
        )}
      </div>

      {/* Tier Benefits */}
      <Card>
        <p className="text-sm font-medium mb-3"> Tier Benefits</p>
        <div className="space-y-2 text-xs">
          <div className={`flex justify-between ${score >= 850 ? 'text-green-400' : 'text-zinc-500'}`}>
            <span> Elite (850+)</span>
            <span>$5k credit, VIP features</span>
          </div>
          <div className={`flex justify-between ${score >= 650 ? 'text-green-400' : 'text-zinc-500'}`}>
            <span> Trusted (650+)</span>
            <span>$1.5k credit, copy trading</span>
          </div>
          <div className={`flex justify-between ${score >= 400 ? 'text-green-400' : 'text-zinc-500'}`}>
            <span> Regular (400+)</span>
            <span>$300 credit, basic features</span>
          </div>
          <div className={`flex justify-between ${score < 400 ? 'text-yellow-400' : 'text-zinc-500'}`}>
            <span> New (0-399)</span>
            <span>Build your reputation</span>
          </div>
        </div>
      </Card>

      {/* Breakdown */}
      <div className="mt-4">
        <p className="text-sm font-medium mb-3"> Score Breakdown</p>
        <div className="space-y-2">
          {BREAKDOWN_LABELS.map((item) => {
            const value = breakdown?.[item.key as keyof typeof breakdown] ?? 0
            return (
              <div key={item.key} className="bg-[#0B0F1A] border border-zinc-800/60 rounded-xl p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">
                    {item.icon} {item.label}
                  </span>
                  <span className="font-semibold text-blue-400">{value}</span>
                </div>
                <p className="text-xs text-zinc-500">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* SBT Info */}
      <div className="mt-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-4">
        <p className="text-sm font-medium mb-2"> On-Chain Reputation SBT</p>
        <p className="text-xs text-zinc-400 mb-3">
          Your reputation is stored as a Soulbound Token (SBT) on Base. It's non-transferable and publicly verifiable.
        </p>
        <a
          href={`https://basescan.org/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          View on Basescan 
        </a>
      </div>

      {/* Actions */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href={`/trader/${address}`}
          className="bg-zinc-800 hover:bg-zinc-700 text-center py-3 rounded-xl text-sm font-medium transition"
        >
          View Profile
        </Link>
        <Link
          href="/credit"
          className="bg-blue-600 hover:bg-blue-500 text-center py-3 rounded-xl text-sm font-medium transition"
        >
          Check Credit
        </Link>
      </div>

      {/* Source */}
      <p className="mt-4 text-xs text-zinc-600 text-center">
        Data source: {data?.source === 'onchain' ? ' On-chain' : ' Computed'}
      </p>
    </AppShell>
  )
}
