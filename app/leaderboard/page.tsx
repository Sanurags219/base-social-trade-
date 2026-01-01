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
            className="flex justify-between items-center bg-zinc-900 rounded-xl p-3"
          >
            <div className="flex-1">
              <span className="text-zinc-400">
                #{i + 1} {u.address.slice(0, 6)}…{u.address.slice(-4)}
              </span>
            </div>
            <span className="text-green-400 font-bold mr-4">
              {u.xp} XP
            </span>
            <a
              href={`/trader/${u.address}`}
              className="text-blue-400 hover:text-blue-300 text-sm whitespace-nowrap"
            >
              View →
            </a>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-zinc-900 rounded-xl p-4 text-sm text-zinc-400">
        <p className="font-semibold mb-2">💡 How it works:</p>
        <ul className="space-y-1 text-xs">
          <li>• Click "View →" to see trader profile</li>
          <li>• Click "Copy Trade" to follow them</li>
          <li>• Earn +25 XP per copy</li>
          <li>• Build your network</li>
        </ul>
      </div>
    </div>
  )
}
