'use client'

import { useEffect, useState } from 'react'
import { WagmiProvider, createConfig, http, useConnect, useAccount } from 'wagmi'
import { base } from 'wagmi/chains'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { coinbaseWallet, injected } from 'wagmi/connectors'

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'Baseline',
      preference: 'smartWalletOnly', // Use Base smart wallet
    }),
    injected(),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org')
  },
  ssr: true,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

// Auto-connect for Base Mini App
function AutoConnect() {
  const { connect, connectors } = useConnect()
  const { isConnected } = useAccount()

  useEffect(() => {
    // Check if running in Mini App context (Warpcast/Base)
    const isMiniApp = typeof window !== 'undefined' && (
      window.parent !== window || // iframe
      navigator.userAgent.includes('Warpcast') ||
      navigator.userAgent.includes('Base') ||
      window.location.search.includes('miniApp=true')
    )

    if (isMiniApp && !isConnected) {
      // Auto-connect with Coinbase Wallet
      const coinbaseConnector = connectors.find(c => c.id === 'coinbaseWalletSDK')
      if (coinbaseConnector) {
        connect({ connector: coinbaseConnector })
      }
    }
  }, [connect, connectors, isConnected])

  return null
}

// Farcaster Mini App SDK initialization
function FarcasterReady() {
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        const sdk = await import('@farcaster/miniapp-sdk')
        if (sdk?.sdk?.actions?.ready) {
          sdk.sdk.actions.ready()
        }
      } catch (e) {
        // Not in Farcaster context
      }
    }
    initFarcaster()
  }, [])
  return null
}

function InnerProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <OnchainKitProvider chain={base}>
      <FarcasterReady />
      <AutoConnect />
      {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
    </OnchainKitProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <InnerProviders>{children}</InnerProviders>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
