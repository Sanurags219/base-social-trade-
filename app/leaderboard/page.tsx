'use client'

import { useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'

type UserXP = {
  address: string
  xp: number
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<UserXP[]>([])

  useEffect(() => {
    fetch('/api/xp')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <AppShell>
      <h1 className="text-lg font-semibold mb-4">
        XP Leaderboard
      </h1>

      <div className="space-y-3">
        {users.length === 0 ? (
          <Card>
            <p className="text-sm text-zinc-400 text-center py-4">
              No traders yet. Be the first!
            </p>
          </Card>
        ) : (
          users.map((u, i) => (
            <Card key={u.address}>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">
                  #{i + 1} {u.address.slice(0, 6)}…{u.address.slice(-4)}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-green-400">
                    {u.xp.toLocaleString()} XP
                  </span>
                  <a
                    href={`/trader/${u.address}`}
                    className="text-xs text-zinc-500 hover:text-white"
                  >
                    View →
                  </a>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </AppShell>
  )
}
