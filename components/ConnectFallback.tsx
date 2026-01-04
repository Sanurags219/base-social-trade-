'use client'

import { useConnect, useAccount } from 'wagmi'
import { useEffect } from 'react'

export function ConnectFallback() {
  const { connect, connectors, isPending } = useConnect()
  const { isConnected } = useAccount()

  // Auto-connect in Mini App context
  useEffect(() => {
    const autoConnect = async () => {
      // Check if in Farcaster Mini App
      const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame')
      if (farcasterConnector) {
        try {
          connect({ connector: farcasterConnector })
          return
        } catch (e) {
          console.log('Farcaster connect failed, trying others')
        }
      }
    }
    
    if (!isConnected) {
      autoConnect()
    }
  }, [connectors, connect, isConnected])

  if (isConnected) return null

  const handleConnect = () => {
    // Try Farcaster first, then Coinbase Wallet
    const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame')
    const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWalletSDK')
    
    if (farcasterConnector) {
      connect({ connector: farcasterConnector })
    } else if (coinbaseConnector) {
      connect({ connector: coinbaseConnector })
    } else if (connectors[0]) {
      connect({ connector: connectors[0] })
    }
  }

  return (
    <div className="mt-8 text-center">
      <button
        onClick={handleConnect}
        disabled={isPending}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-medium text-sm hover:opacity-90 transition disabled:opacity-50"
      >
        {isPending ? 'Connecting...' : 'Connect Wallet'}
      </button>
      <p className="mt-2 text-xs text-zinc-500">
        Works with Base Wallet, Coinbase Wallet & Warpcast
      </p>
    </div>
  )
}
