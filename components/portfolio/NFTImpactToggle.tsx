'use client'

import { Image } from 'lucide-react'

export function NFTImpactToggle({
  enabled,
  onToggle,
  nftValue,
  nftCount
}: {
  enabled: boolean
  onToggle: () => void
  nftValue: number
  nftCount?: number
}) {
  return (
    <div className="mt-4 rounded-xl p-4 bg-[#0E1F24] border border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Image size={16} className="text-purple-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">NFT Impact</p>
          <p className="text-xs text-zinc-400">
            {nftCount || 0} NFTs • ${nftValue.toFixed(2)}
          </p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`
          px-3 py-1.5 rounded-full text-xs font-medium transition
          ${enabled
            ? 'bg-teal-400/20 text-teal-300'
            : 'bg-white/10 text-zinc-400 hover:bg-white/15'}
        `}
      >
        {enabled ? 'Included' : 'Excluded'}
      </button>
    </div>
  )
}
