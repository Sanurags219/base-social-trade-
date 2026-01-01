'use client'

import { useEffect, useState } from 'react'

type UserXP = {
  address: string
  xp: number
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserXP[]>([])

  useEffect(() => {
    fetch('/api/xp')
      .then((r) => r.json())
      .then(setUsers)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-xl font-bold mb-4">🏆 XP Leaderboard</h1>

      <div className="space-y-2">
        {users.map((u, i) => (
          <div
            key={u.address}
            className="flex justify-between bg-zinc-900 rounded-xl p-3"
          >
            <span className="text-zinc-400">
              #{i + 1} {u.address.slice(0, 6)}…{u.address.slice(-4)}
            </span>
            <span className="text-green-400 font-bold">
              {u.xp} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
