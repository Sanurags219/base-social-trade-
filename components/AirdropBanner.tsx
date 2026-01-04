'use client'

import { Share2, Gift, Sparkles } from 'lucide-react'

interface AirdropShareBannerProps {
  xp: number
  onShare?: () => void
}

export function AirdropShareBanner({ xp, onShare }: AirdropShareBannerProps) {
  const handleShare = () => {
    const ogUrl = encodeURIComponent(
      window.location.origin + '/api/og/airdrop?xp=' + xp
    )
    const text = encodeURIComponent(
      "I'm earning XP on Baseline!\n\n40% of BSTN supply is reserved for the community.\n\nCheck your eligibility:"
    )
    
    window.open(
      'https://warpcast.com/~/compose?text=' + text + '&embeds[]=' + ogUrl,
      '_blank'
    )
    
    onShare?.()
  }

  return (
    <section className="mt-4 rounded-2xl p-5 bg-gradient-to-br from-teal-500/10 via-blue-500/10 to-purple-500/10 border border-white/10 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.15),transparent_60%)] pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Gift size={18} className="text-teal-400" />
          <p className="text-sm font-semibold text-white">
            BSTN Community Airdrop
          </p>
        </div>

        {/* Supply highlight */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-purple-400" />
          <p className="text-lg font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
            40% of Total Supply
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400 mb-4">
          XP determines eligibility and relative allocation.
          Final distribution calculated at snapshot.
        </p>

        {/* XP Display */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 mb-4">
          <span className="text-xs text-zinc-400">Your XP</span>
          <span className="text-sm font-bold text-teal-400">{xp.toLocaleString()}</span>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-teal-500/20 to-blue-500/20 hover:from-teal-500/30 hover:to-blue-500/30 border border-teal-500/30 text-sm font-medium text-teal-300 transition-all duration-200"
        >
          <Share2 size={16} />
          Share Airdrop Status
        </button>
      </div>
    </section>
  )
}

// Simple version without XP
export function AirdropBanner() {
  return (
    <section className="mt-4 rounded-2xl p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10">
      <p className="text-sm font-medium text-white">
        BSTN Airdrop
      </p>

      <p className="text-xs text-zinc-300 mt-1">
        40% of total BSTN supply is reserved for the community.
      </p>

      <p className="text-xs text-zinc-400 mt-2">
        XP determines eligibility and relative allocation.
        Final distribution will be calculated at snapshot.
      </p>
    </section>
  )
}
