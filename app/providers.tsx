'use client'

import { useEffect } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http()
  }
})

const queryClient = new QueryClient()

// Farcaster Mini App SDK initialization
function FarcasterReady() {
  useEffect(() => {
    // Dynamically import Farcaster SDK to avoid SSR issues
    const initFarcaster = async () => {
      try {
        const sdk = await import('@farcaster/miniapp-sdk')
        if (sdk && sdk.sdk && sdk.sdk.actions && sdk.sdk.actions.ready) {
          sdk.sdk.actions.ready()
        }
      } catch (e) {
        // Not in Farcaster context, ignore
        console.log('Not in Farcaster mini app context')
      }
    }
    initFarcaster()
  }, [])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider chain={base}>
          <FarcasterReady />
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
