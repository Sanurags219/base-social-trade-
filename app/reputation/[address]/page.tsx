'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'

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

function getTier(score: number) {
  if (score >= 800) return 'Elite'
  if (score >= 600) return 'Trusted'
  if (score >= 400) return 'Regular'
  return 'New'
}

export default function ReputationPage() {
  const params = useParams()
  const address = params.address as string
  const [data, setData] = useState<ReputationData | null>(null)

  useEffect(() => {
    if (address) {
      fetch(`/api/reputation?address=${address}`)
        .then((r) => r.json())
        .then(setData)
        .catch(() => {})
    }
  }, [address])

  const score = data?.score ?? 0
  const breakdown = [
    { label: 'XP Activity', value: data?.breakdown?.xpScore ?? 0 },
    { label: 'Trading History', value: data?.breakdown?.tradingScore ?? 0 },
    { label: 'Account Age', value: data?.breakdown?.ageScore ?? 0 },
    { label: 'Social Proof', value: data?.breakdown?.socialScore ?? 0 },
    { label: 'Risk Behavior', value: data?.breakdown?.riskScore ?? 0 }
  ]

  return (
    <AppShell>
      <h1 className="text-lg font-semibold mb-4">
        Reputation
      </h1>

      <Card>
        <p className="text-sm text-zinc-400 mb-1">
          Reputation Score
        </p>

        <div className="text-4xl font-bold tracking-tight">
          {score}
        </div>

        <p className="text-xs text-zinc-500 mt-1">
          {getTier(score)} tier
        </p>
      </Card>

      <div className="mt-4 space-y-3">
        {breakdown.map((b) => (
          <Card key={b.label}>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-400">
                {b.label}
              </span>
              <span className="font-medium">
                {b.value}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-4 text-xs text-zinc-500 text-center">
        {address?.slice(0, 6)}…{address?.slice(-4)}
      </p>
    </AppShell>
  )
}
