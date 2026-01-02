'use client'

import { useAccount } from 'wagmi'
import {
  Identity,
  Avatar,
  Name,
  Badge,
} from '@coinbase/onchainkit/identity'
import { base } from 'viem/chains'

export function ProfileBadge() {
  const { address, isConnected } = useAccount()

  if (!isConnected || !address) {
    return (
      <div className="flex items-center gap-2 text-zinc-500">
        <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <span className="text-xs">Connect</span>
      </div>
    )
  }

  return (
    <Identity
      address={address}
      chain={base}
      className="flex items-center gap-2 bg-zinc-900/50 rounded-full pl-1 pr-3 py-1 hover:bg-zinc-800/50 transition-colors cursor-pointer"
    >
      <Avatar 
        className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600"
      />
      <Name 
        className="text-sm font-medium text-white max-w-[100px] truncate"
      />
      <Badge className="ml-0.5" />
    </Identity>
  )
}
