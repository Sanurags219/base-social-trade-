'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

function getReputationBadge(score: number): { color: string; label: string; emoji: string } {
  if (score >= 800) return { color: 'text-green-400', label: 'Elite', emoji: '🟢' }
  if (score >= 600) return { color: 'text-blue-400', label: 'Trusted', emoji: '🔵' }
  if (score >= 400) return { color: 'text-yellow-400', label: 'Regular', emoji: '🟡' }
  return { color: 'text-red-400', label: 'New', emoji: '🔴' }
}

function getComponentLabel(key: string): string {
  const labels: Record<string, string> = {
    xpScore: 'XP Earned',
    tradingScore: 'Trading Activity',
    ageScore: 'Account Age',
    socialScore: 'Social Proof',
    riskScore: 'Risk Behavior'
  }
  return labels[key] || key
}

function getComponentMax(key: string): number {
  const maxes: Record<string, number> = {
    xpScore: 300,
    tradingScore: 200,
    ageScore: 150,
    socialScore: 150,
    riskScore: 200
  }
  return maxes[key] || 100
}

export default function ReputationPage() {
  const { address } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return

    const fetchReputation = async () => {
      try {
        const res = await fetch(`/api/reputation?address=${address}`)
        const result = await res.json()
        setData(result)
      } catch (error) {
        console.error('Failed to fetch reputation:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReputation()
  }, [address])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div>Loading reputation…</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div>Reputation not found</div>
      </div>
    )
  }

  const badge = getReputationBadge(data.score)
  const addressStr = typeof address === 'string' ? address : ''

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Reputation Score</h1>
          <p className="text-zinc-400 text-sm font-mono">{addressStr}</p>
        </div>

        {/* Score Display */}
        <div className="mt-4 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 text-center mb-6 border border-zinc-700">
          <div className={`text-5xl font-bold ${badge.color} mb-2`}>
            {data.score}
          </div>
          <div className="text-zinc-400 text-sm mb-3">out of 1000</div>
          <div className={`text-lg font-semibold ${badge.color}`}>
            {badge.emoji} {badge.label}
          </div>
        </div>

        {/* Reputation Breakdown */}
        <div className="space-y-3 mb-6">
          {Object.entries(data.breakdown).map(([k, v]: any) => {
            const max = getComponentMax(k)
            const percentage = (v / max) * 100
            return (
              <div key={k} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{getComponentLabel(k)}</span>
                  <span className={`font-bold ${v > max * 0.7 ? 'text-green-400' : 'text-zinc-400'}`}>
                    {v}/{max}
                  </span>
                </div>
                <div className="w-full bg-black rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Score Levels Reference */}
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-sm text-zinc-400">
          <p className="font-semibold mb-3">Score Levels:</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>🟢 Elite</span>
              <span>800+</span>
            </div>
            <div className="flex justify-between">
              <span>🔵 Trusted</span>
              <span>600–799</span>
            </div>
            <div className="flex justify-between">
              <span>🟡 Regular</span>
              <span>400–599</span>
            </div>
            <div className="flex justify-between">
              <span>🔴 New</span>
              <span>&lt;400</span>
            </div>
          </div>
        </div>

        {/* Components Breakdown */}
        <div className="mt-6 bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-xs text-zinc-400">
          <p className="font-semibold mb-3">Score Components (Max 1000):</p>
          <ul className="space-y-1">
            <li>• <b>XP Earned</b> (300): Your activity in app</li>
            <li>• <b>Trading Activity</b> (200): Onchain trades</li>
            <li>• <b>Account Age</b> (150): Wallet history</li>
            <li>• <b>Social Proof</b> (150): Shares & followers</li>
            <li>• <b>Risk Behavior</b> (200): Safety metrics</li>
          </ul>
        </div>

        <a
          href="/leaderboard"
          className="block text-center mt-6 bg-zinc-900 hover:bg-zinc-800 transition rounded-xl py-3 font-semibold text-zinc-400"
        >
          Back to Leaderboard
        </a>
      </div>
    </div>
  )
}
