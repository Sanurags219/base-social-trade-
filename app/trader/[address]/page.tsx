'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

type TraderData = {
  address: string
  xp: number
  reputation?: number
  followers?: number
  trades?: number
}

export default function TraderProfile() {
  const params = useParams()
  const address = params.address as string
  const [trader, setTrader] = useState<TraderData | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (address) {
      fetch(`/api/xp?address=${address}`)
        .then((r) => r.json())
        .then((data) => {
          setTrader({
            address,
            xp: data.xp ?? 0,
            reputation: 0,
            followers: 0,
            trades: 0
          })
        })
        .catch(() => {
          setTrader({
            address,
            xp: 0,
            reputation: 0,
            followers: 0,
            trades: 0
          })
        })

      fetch(`/api/reputation?address=${address}`)
        .then((r) => r.json())
        .then((data) => {
          setTrader((prev) => prev ? { ...prev, reputation: data.score ?? 0 } : null)
        })
        .catch(() => {})
    }
  }, [address])

  const handleCopyTrade = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!trader) {
    return (
      <AppShell>
        <Card>
          <p className="text-sm text-zinc-400 text-center py-4">
            Loading...
          </p>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <h1 className="text-lg font-semibold mb-4">
        Trader Profile
      </h1>

      <Card>
        <p className="text-sm text-zinc-400 mb-1">
          Wallet
        </p>
        <p className="font-medium mb-3">
          {address.slice(0, 6)}…{address.slice(-4)}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-zinc-400">Reputation</p>
            <p className="font-semibold text-green-400">
              {trader.reputation}
            </p>
          </div>
          <div>
            <p className="text-zinc-400">XP</p>
            <p className="font-semibold">
              {trader.xp.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-zinc-400">Trades</p>
            <p className="font-semibold">
              {trader.trades}
            </p>
          </div>
          <div>
            <p className="text-zinc-400">Followers</p>
            <p className="font-semibold">
              {trader.followers}
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-4">
        <Card>
          <p className="text-sm text-zinc-400 mb-2">
            Copy trading
          </p>

          <p className="text-xs text-zinc-500 mb-4">
            Trades are mirrored manually. You stay in control.
          </p>

          <Button onClick={handleCopyTrade}>
            {copied ? 'Following' : 'Copy Trades'}
          </Button>
        </Card>
      </div>

      <div className="mt-4 text-center">
        <a
          href={`/reputation/${address}`}
          className="text-xs text-zinc-500 hover:text-white"
        >
          View full reputation →
        </a>
      </div>
    </AppShell>
  )
}
