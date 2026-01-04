'use client'

import { useEffect, useState } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
import { coinbaseWallet, injected } from 'wagmi/connectors'

// Create connector for Farcaster Mini App
const farcasterConnector = farcasterFrame()

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [
    farcasterConnector,
    coinbaseWallet({
      appName: 'Baseline',
      preference: 'smartWalletOnly',
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

// Farcaster SDK Ready + Auto-connect
function FarcasterInit() {
  useEffect(() => {
    const init = async () => {
      try {
        // Import Farcaster SDK
        const { sdk } = await import('@farcaster/miniapp-sdk')
        
        // Signal ready to Farcaster host
        if (sdk?.actions?.ready) {
          sdk.actions.ready()
        }
      } catch (e) {
        console.log('Not in Farcaster context')
      }
    }
    init()
  }, [])
  
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider chain={base}>
          <FarcasterInit />
          {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
