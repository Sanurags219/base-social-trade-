'use client'

import { useAccount } from 'wagmi'
import { Identity, Name, Avatar } from '@coinbase/onchainkit/identity'
import { base } from 'viem/chains'

export function AppHeader() {
  const { address, isConnected } = useAccount()

  return (
    <header className="
      sticky top-0 z-30
      h-14 px-4
      flex items-center justify-between
      bg-[#05060A]/80 backdrop-blur
      border-b border-white/5
    ">
      <span className="text-sm font-medium tracking-wide text-zinc-200">
        Baseline
      </span>

      <div className="flex items-center gap-2">
        {isConnected && address ? (
          <Identity
            address={address}
            chain={base}
            className="flex items-center gap-2"
          >
            <Avatar className="w-6 h-6 rounded-full" />
            <Name className="text-xs text-zinc-300" />
          </Identity>
        ) : (
          <span className="text-xs text-zinc-500">
            Not connected
          </span>
        )}
      </div>
    </header>
  )
}
