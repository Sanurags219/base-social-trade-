'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { Share2, Gift, Sparkles } from 'lucide-react'
import { shareAirdrop } from '@/lib/shareAirdrop'

const XP_CONTRACT = '0x2fecd2012da58a01b844a5cd4d5d82e8303c1057' as const

const XP_ABI = [
  {
    name: 'getUserXP',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'xp', type: 'uint256' },
      { name: 'level', type: 'uint256' },
      { name: 'nextLevelXP', type: 'uint256' }
    ]
  }
] as const

type Props = {
  xpOverride?: number
  compact?: boolean
}

export function AirdropShareBanner({ xpOverride, compact = false }: Props) {
  const { address, isConnected } = useAccount()
  const [localXP, setLocalXP] = useState(0)

  // Get on-chain XP
  const { data: xpData } = useReadContract({
    address: XP_CONTRACT,
    abi: XP_ABI,
    functionName: 'getUserXP',
    args: address ? [address] : undefined,
  })

  // Load local XP from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_xp')
      if (stored) setLocalXP(parseInt(stored, 10))
    }
  }, [])

  const totalXP = xpOverride ?? (xpData ? Number(xpData[0]) : 0) + localXP

  const handleShare = () => {
    shareAirdrop(totalXP)
  }

  if (compact) {
    return (
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-white/10 hover:border-teal-500/30 transition"
      >
        <Share2 size={14} className="text-teal-400" />
        <span className="text-xs text-zinc-300">Share Airdrop Status</span>
      </button>
    )
  }

  return (
    <section className="relative rounded-2xl p-5 overflow-hidden bg-gradient-to-br from-[#0E1F24] to-[#071317] border border-white/10">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.1),transparent_50%)] pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/30 to-blue-500/30 flex items-center justify-center">
            <Gift size={16} className="text-teal-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">BSTN Airdrop</h3>
            <p className="text-xs text-zinc-500">Community Distribution</p>
          </div>
        </div>

        {/* Supply highlight */}
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">Community Allocation</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                40% BSTN
              </p>
            </div>
            <Sparkles size={24} className="text-teal-400/50" />
          </div>
        </div>

        {/* XP Display */}
        {isConnected && (
          <div className="mt-3 flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
            <span className="text-xs text-zinc-400">Your XP</span>
            <span className="text-sm font-medium text-white">{totalXP.toLocaleString()} XP</span>
          </div>
        )}

        {/* Info text */}
        <p className="mt-3 text-xs text-zinc-500 leading-relaxed">
          XP determines eligibility and relative allocation. 
          Final distribution calculated at snapshot.
        </p>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-500/20 to-blue-500/20 hover:from-teal-500/30 hover:to-blue-500/30 border border-teal-500/20 hover:border-teal-500/40 transition-all duration-200"
        >
          <Share2 size={16} className="text-teal-400" />
          <span className="text-sm font-medium text-teal-300">Share Airdrop Status</span>
        </button>
      </div>
    </section>
  )
}
