'use client'

import { ConnectWallet } from '@coinbase/onchainkit/wallet'
import { useAccount } from 'wagmi'

export function WalletConnect() {
  const { address, isConnected } = useAccount()

  return (
    <div className="mb-4">
      {isConnected ? (
        <div className="text-sm text-green-400">
          Connected: {address?.slice(0, 6)}…{address?.slice(-4)}
        </div>
      ) : (
        <ConnectWallet />
      )}
    </div>
  )
}
