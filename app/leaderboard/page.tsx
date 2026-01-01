'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'

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
        if (Array.isArray(data)) {
          setUsers(data)
          data.forEach((u: UserXP) => {
            fetch(`/api/reputation?address=${u.address}`)
              .then((r) => r.json())
              .then((rep) => {
                setReputations((prev) => ({ ...prev, [u.address]: rep }))
              })
              .catch(() => {})
          })
        }
      })
  }, [])

  return (
    <div className="min-h-screen bg-[#05060A] text-white px-3 py-6">
      <div className="max-w-md mx-auto">

        <h1 className="text-lg font-semibold tracking-tight mb-4">
          Leaderboard
        </h1>

        <div className="space-y-3">
          {users.length === 0 ? (
            <Card>
              <p className="text-sm text-zinc-400 text-center py-4">
                No traders yet. Be the first!
              </p>
            </Card>
          ) : (
            users.map((u, i) => {
              const rep = reputations[u.address]
              const badge = rep ? getReputationBadge(rep.score) : null
              return (
                <Card key={u.address}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500 w-6">
                        #{i + 1}
                      </span>
                      <div>
                        <span className="text-sm text-zinc-300">
                          {u.address.slice(0, 6)}…{u.address.slice(-4)}
                        </span>
                        {badge && (
                          <span className="ml-2 text-xs text-zinc-500">
                            {badge.emoji} {badge.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-green-400">
                        {u.xp.toLocaleString()} XP
                      </span>
                      <a
                        href={`/trader/${u.address}`}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        View →
                      </a>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>

        <div className="mt-4">
          <Card>
            <p className="text-xs text-zinc-500 mb-2">How it works</p>
            <ul className="space-y-1 text-xs text-zinc-400">
              <li>• Earn XP by trading and social actions</li>
              <li>• Higher XP = better leaderboard position</li>
              <li>• Copy top traders to learn strategies</li>
            </ul>
          </Card>
        </div>

      </div>
    </div>
  )
}
