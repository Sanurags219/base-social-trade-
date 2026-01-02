'use client'

import { useEffect, useState } from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { OnchainKitProvider } from '@coinbase/onchainkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const wagmiConfig = createConfig({
  chains: [base],
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

// Farcaster Mini App SDK initialization
function FarcasterReady() {
  useEffect(() => {
    const initFarcaster = async () => {
      try {
        const sdk = await import('@farcaster/miniapp-sdk')
        if (sdk && sdk.sdk && sdk.sdk.actions && sdk.sdk.actions.ready) {
          sdk.sdk.actions.ready()
        }
      } catch (e) {
        // Not in Farcaster context, ignore
      }
    }
    initFarcaster()
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
          <FarcasterReady />
          {mounted ? children : <div style={{ visibility: 'hidden' }}>{children}</div>}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
