'use client'

import { ConnectWallet } from '@coinbase/onchainkit/wallet'

export function ConnectFallback() {
  return (
    <div className="mt-8 text-center">
      <ConnectWallet className="px-4 py-2 rounded-lg bg-white/10 text-sm text-zinc-300 hover:bg-white/15 transition" />
    </div>
  )
}
