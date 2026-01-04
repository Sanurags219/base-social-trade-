'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useEffect, useState } from 'react'

function getReputationBadge(score: number) {
  if (score >= 800) return { emoji: '🟢', label: 'Elite', color: 'text-green-400' }
  if (score >= 600) return { emoji: '🔵', label: 'Trusted', color: 'text-blue-400' }
  if (score >= 400) return { emoji: '🟡', label: 'Regular', color: 'text-yellow-400' }
  return { emoji: '🔴', label: 'New', color: 'text-red-400' }
}

export function WalletConnect() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [reputation, setReputation] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showOptions, setShowOptions] = useState(false)

  // Auto-connect Farcaster wallet in frame context
  useEffect(() => {
    const autoConnect = async () => {
      if (isConnected || isConnecting) return
      
      // Try Farcaster Mini App connector first (works in Warpcast)
      const farcasterConnector = connectors.find(c => c.id === 'farcasterMiniApp')
      if (farcasterConnector) {
        try {
          connect({ connector: farcasterConnector })
          return
        } catch (e) {
          // Not in frame context
        }
      }
    }
    
    // Small delay to let connectors initialize
    const timer = setTimeout(autoConnect, 500)
    return () => clearTimeout(timer)
  }, [isConnected, isConnecting, connectors, connect])

  // Fetch reputation when connected
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
        {isConnecting || isPending ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-blue-400">Connecting...</span>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="w-full py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition"
            >
              Connect Wallet
            </button>
            
            {showOptions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden z-50">
                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => {
                      connect({ connector })
                      setShowOptions(false)
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition border-b border-white/5 last:border-0"
                  >
                    {connector.name === 'Farcaster' ? '🟣 Farcaster' : 
                     connector.name === 'Coinbase Wallet' ? '🔵 Coinbase Wallet' :
                     connector.name === 'Injected' ? '💳 Browser Wallet' : connector.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const badge = reputation ? getReputationBadge(reputation.score) : null

  return (
    <div className="mb-4">
      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-green-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {address?.slice(0, 6)}…{address?.slice(-4)}
            </div>
            {badge && (
              <a
                href={`/reputation/${address}`}
                className={`text-xs ${badge.color} hover:underline flex items-center gap-1 mt-1`}
              >
                {badge.emoji} {badge.label} ({reputation?.score || 0}/1000)
              </a>
            )}
          </div>
          <button
            onClick={() => disconnect()}
            className="text-xs text-zinc-500 hover:text-zinc-400 px-2 py-1"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  )
}
