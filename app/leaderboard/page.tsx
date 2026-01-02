'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'
import { WalletConnect } from '@/components/WalletConnect'

type UserXP = {
  address: string
  xp: number
  trades?: number
  streak?: number
}

type MyXP = {
  xp: number
  level: number
  trades: number
  streak: number
  rank: number
  nextLevelXP: number
}

export default function LeaderboardPage() {
  const { address, isConnected } = useAccount()
  const [users, setUsers] = useState<UserXP[]>([])
  const [myXP, setMyXP] = useState<MyXP | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/xp')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (address) {
      fetch(`/api/xp?address=${address}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.xp !== undefined) {
            setMyXP(data)
          }
        })
        .catch(() => {})
    }
  }, [address])

  return (
    <AppShell>
      <WalletConnect />
      
      <h1 className="text-xl font-bold mb-4"> XP Leaderboard</h1>

      {/* My Stats */}
      {isConnected && myXP && (
        <div className="mb-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-400">Your Stats</span>
            <span className="text-xs bg-blue-600 px-2 py-1 rounded-full">
              Rank #{myXP.rank}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{myXP.xp.toLocaleString()}</p>
              <p className="text-xs text-zinc-500">Total XP</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">Lv.{myXP.level}</p>
              <p className="text-xs text-zinc-500">Level</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-400"> {myXP.streak}</p>
              <p className="text-xs text-zinc-500">Day Streak</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>{myXP.xp} XP</span>
              <span>{myXP.nextLevelXP} XP</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                style={{ width: `${(myXP.xp % 1000) / 10}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* How to Earn XP */}
      <Card>
        <p className="text-sm font-medium mb-2"> How to Earn XP</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-green-400">+10-100</span> Swap tokens
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">+50</span> Copy a trader
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">+25</span> Share a trade
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">+100</span> Daily login
          </div>
        </div>
      </Card>

      {/* Leaderboard */}
      <div className="space-y-2 mt-4">
        {loading ? (
          <Card>
            <p className="text-sm text-zinc-400 text-center py-4">Loading...</p>
          </Card>
        ) : users.length === 0 ? (
          <Card>
            <p className="text-sm text-zinc-400 text-center py-4">
              No traders yet. Be the first!
            </p>
          </Card>
        ) : (
          users.map((u, i) => {
            const isMe = address?.toLowerCase() === u.address.toLowerCase()
            const medal = i === 0 ? '' : i === 1 ? '' : i === 2 ? '' : `#${i + 1}`
            
            return (
              <div 
                key={u.address}
                className={`bg-[#0B0F1A] border rounded-2xl p-4 ${isMe ? 'border-blue-500/50 bg-blue-900/20' : 'border-zinc-800/60'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-lg w-8">{medal}</span>
                    <div>
                      <p className="text-sm font-medium">
                        {u.address.slice(0, 6)}{u.address.slice(-4)}
                        {isMe && <span className="ml-2 text-xs text-blue-400">(You)</span>}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {u.trades || 0} trades   {u.streak || 0} streak
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{u.xp.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">XP</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </AppShell>
  )
}
