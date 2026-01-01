'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { AutoCopySettings } from '@/components/AutoCopySettings'

interface TraderStats {
  xp: number
  trades: number
  followers: number
  copiedTrades: number
}

interface ReputationData {
  score: number
  source: string
}

function getReputationTier(score: number) {
  if (score >= 800) return { emoji: '🟢', label: 'Elite', color: 'text-green-400' }
  if (score >= 600) return { emoji: '🔵', label: 'Trusted', color: 'text-blue-400' }
  if (score >= 400) return { emoji: '🟡', label: 'Regular', color: 'text-yellow-400' }
  return { emoji: '🔴', label: 'New', color: 'text-red-400' }
}

export default function TraderProfile() {
  const { address } = useParams()
  const { address: userAddress } = useAccount()
  const [stats, setStats] = useState<TraderStats | null>(null)
  const [reputation, setReputation] = useState<ReputationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAutoCopySettings, setShowAutoCopySettings] = useState(false)

  useEffect(() => {
    if (!address) return

    const fetchData = async () => {
      try {
        const statsRes = await fetch(`/api/trader?address=${address}`)
        const statsData = await statsRes.json()
        setStats(statsData)

        const repRes = await fetch(`/api/reputation?address=${address}`)
        const repData = await repRes.json()
        setReputation(repData)
      } catch (error) {
        console.error('Failed to fetch trader data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
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
  const repScore = reputation?.score || 0
  const tier = getReputationTier(repScore)
  const canCopyTrade = repScore >= 400
  const isEligibleForAutoCopy = repScore >= 650
  const isMediumRisk = repScore >= 400 && repScore < 650

  if (showAutoCopySettings) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setShowAutoCopySettings(false)}
            className="mb-4 text-zinc-400 hover:text-white text-sm"
          >
            ← Back
          </button>
          <AutoCopySettings
            traderAddress={addressStr}
            traderTier={tier.label}
            traderReputation={repScore}
            onClose={() => setShowAutoCopySettings(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {addressStr.slice(0, 6)}…{addressStr.slice(-4)}
          </h1>
          <p className="text-zinc-400 text-sm font-mono">{addressStr}</p>
        </div>

        {reputation && (
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-xl p-4 mb-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-400 text-sm">Reputation Score</span>
              <span className={`text-2xl font-bold ${tier.color}`}>
                {tier.emoji} {repScore}/1000
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-700 rounded-full h-2">
                <div
                  className={`h-full rounded-full ${
                    repScore >= 800
                      ? 'bg-green-500'
                      : repScore >= 600
                      ? 'bg-blue-500'
                      : repScore >= 400
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${(repScore / 1000) * 100}%` }}
                />
              </div>
            </div>
            <p className={`text-sm mt-2 ${tier.color}`}>{tier.label} Trader</p>
          </div>
        )}

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

        {isMediumRisk && (
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-xl p-4 mb-4">
            <p className="text-yellow-400 text-sm font-semibold mb-2">⚠️ Medium Risk Trader</p>
            <p className="text-yellow-200 text-xs">
              This trader has moderate reputation. Review trades carefully.
            </p>
          </div>
        )}

        {!canCopyTrade && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-sm font-semibold mb-2">🚫 Copy-Trading Disabled</p>
            <p className="text-red-200 text-xs">
              Reputation too low ({repScore}/1000). Reach 400+ to enable copy-trading.
            </p>
          </div>
        )}

        {canCopyTrade ? (
          <>
            <a
              href={`/swap?copy=${addressStr}&tier=${repScore >= 800 ? 'elite' : repScore >= 600 ? 'trusted' : 'regular'}`}
              className="block text-center bg-blue-600 hover:bg-blue-500 transition rounded-xl py-3 font-semibold mb-3"
            >
              📋 Manual Copy Trade ({tier.label})
            </a>

            {isEligibleForAutoCopy && userAddress && (
              <button
                onClick={() => setShowAutoCopySettings(true)}
                className="block w-full text-center bg-green-600 hover:bg-green-500 transition rounded-xl py-3 font-semibold mb-4"
              >
                🤖 Enable Auto Copy
              </button>
            )}
          </>
        ) : (
          <button
            disabled
            className="block w-full text-center bg-zinc-700 text-zinc-400 rounded-xl py-3 font-semibold mb-4 cursor-not-allowed"
          >
            📋 Copy Trade (Reputation too low)
          </button>
        )}

        <a
          href={`/reputation/${addressStr}`}
          className="block text-center bg-purple-600 hover:bg-purple-500 transition rounded-xl py-3 font-semibold mb-4"
        >
          ⭐ View Reputation Details
        </a>

        <a
          href="/leaderboard"
          className="block text-center bg-zinc-900 hover:bg-zinc-800 transition rounded-xl py-3 font-semibold text-zinc-400"
        >
          Back to Leaderboard
        </a>

        <div className="mt-6 bg-zinc-900/50 rounded-xl p-4 text-xs text-zinc-400">
          <p className="font-semibold mb-2">📊 Copy Trading:</p>
          <ul className="space-y-1">
            <li>💰 Manual: Set amount & execute once</li>
            <li>🤖 Auto: Mirror trades automatically</li>
            <li>🔐 Non-custodial (you control funds)</li>
            <li>✅ Withdraw anytime, no lockup</li>
          </ul>
        </div>

        <div className="mt-4 bg-zinc-900/50 rounded-xl p-4 text-xs text-zinc-400">
          <p className="font-semibold mb-2">📊 XP Rewards by Tier:</p>
          <ul className="space-y-1">
            <li>🟢 Elite (800+) → +40 XP per copy</li>
            <li>🔵 Trusted (600-799) → +25 XP per copy</li>
            <li>🟡 Regular (400-599) → +25 XP per copy</li>
            <li>🔴 New (&lt;400) → Copy disabled</li>
          </ul>
        </div>

        <div className="mt-4 bg-zinc-900/50 rounded-xl p-4 text-xs text-zinc-400">
          <p className="font-semibold mb-2">💡 Safety Tips:</p>
          <ul className="space-y-1">
            <li>• Review recent trades before copying</li>
            <li>• Default copy amount = 10% balance</li>
            <li>• Slippage capped at 1% max</li>
            <li>• Always confirm before executing</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
