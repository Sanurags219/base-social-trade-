'use client'

import { ConnectWallet } from '@coinbase/onchainkit/wallet'
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

function getReputationBadge(score: number) {
  if (score >= 800) return { emoji: '🟢', label: 'Elite', color: 'text-green-400' }
  if (score >= 600) return { emoji: '🔵', label: 'Trusted', color: 'text-blue-400' }
  if (score >= 400) return { emoji: '🟡', label: 'Regular', color: 'text-yellow-400' }
  return { emoji: '🔴', label: 'New', color: 'text-red-400' }
}

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const [reputation, setReputation] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) {
      setReputation(null)
      return
    }

    setLoading(true)
    const url = `/api/reputation?address=${address}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setReputation(data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <div className="mb-4">
        <ConnectWallet />
      </div>
    )
  }

  const badge = reputation ? getReputationBadge(reputation.score) : null

  return (
    <div className="mb-4">
      <div className="text-sm">
        <div className="text-green-400 mb-1">
          Connected: {address?.slice(0, 6)}…{address?.slice(-4)}
        </div>
        {badge && (
          <a
            href={`/reputation/${address}`}
            className={`text-xs ${badge.color} hover:underline flex items-center gap-1`}
          >
            {badge.emoji} {badge.label} ({reputation?.score || 0}/1000)
          </a>
        )}
      </div>
    </div>
  )
}
