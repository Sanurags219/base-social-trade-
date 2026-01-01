'use client'

import { useEffect, useState } from 'react'

type UserXP = {
  address: string
  xp: number
}

type ReputationData = {
  score: number
  breakdown: {
    xpScore: number
    tradingScore: number
    ageScore: number
    socialScore: number
    riskScore: number
  }
}

function getReputationBadge(score: number) {
  if (score >= 800) return { emoji: '🟢', label: 'Elite' }
  if (score >= 600) return { emoji: '🔵', label: 'Trusted' }
  if (score >= 400) return { emoji: '🟡', label: 'Regular' }
  return { emoji: '🔴', label: 'New' }
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserXP[]>([])
  const [reputations, setReputations] = useState<Record<string, ReputationData>>({})

  useEffect(() => {
    fetch('/api/xp')
      .then((r) => r.json())
      .then((data) => {
        setUsers(data)
        // Fetch reputation for each user
        data.forEach((u: UserXP) => {
          fetch(`/api/reputation?address=${u.address}`)
            .then((r) => r.json())
            .then((rep) => {
              setReputations((prev) => ({ ...prev, [u.address]: rep }))
            })
            .catch(() => {})
        })
      })
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-xl font-bold mb-4">🏆 XP Leaderboard</h1>

      <div className="space-y-2">
        {users.map((u, i) => {
          const rep = reputations[u.address]
          const badge = rep ? getReputationBadge(rep.score) : null
          return (
            <div
              key={u.address}
              className="flex justify-between items-center bg-zinc-900 rounded-xl p-3"
            >
              <div className="flex-1">
                <span className="text-zinc-400">
                  #{i + 1} {u.address.slice(0, 6)}…{u.address.slice(-4)}
                </span>
                {badge && (
                  <span className="ml-2 text-xs">
                    {badge.emoji} {badge.label}
                  </span>
                )}
              </div>
              <span className="text-green-400 font-bold mr-4">
                {u.xp} XP
              </span>
              <a
                href={`/trader/${u.address}`}
                className="text-blue-400 hover:text-blue-300 text-sm whitespace-nowrap mr-2"
              >
                View →
              </a>
              {rep && (
                <a
                  href={`/reputation/${u.address}`}
                  className="text-purple-400 hover:text-purple-300 text-sm whitespace-nowrap"
                >
                  Rep →
                </a>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6 bg-zinc-900 rounded-xl p-4 text-sm text-zinc-400">
        <p className="font-semibold mb-2">💡 How it works:</p>
        <ul className="space-y-1 text-xs">
          <li>• Click "View →" to see trader profile</li>
          <li>• Click "Rep →" to see reputation details</li>
          <li>• Click "Copy Trade" to follow them</li>
          <li>• Earn +25 XP per copy</li>
          <li>• Build your network</li>
        </ul>
      </div>
    </div>
  )
}
