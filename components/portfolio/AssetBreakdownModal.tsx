'use client'

import { X } from 'lucide-react'

type Asset = {
  symbol: string
  percent: number
  value: number
}

export function AssetBreakdownModal({
  open,
  onClose,
  asset,
}: {
  open: boolean
  onClose: () => void
  asset: Asset | null
}) {
  if (!open || !asset) return null

  const riskLevel = 
    asset.percent > 50 ? 'High' : 
    asset.percent > 20 ? 'Medium' : 'Low'
  
  const riskColor = 
    asset.percent > 50 ? 'text-red-400' : 
    asset.percent > 20 ? 'text-orange-300' : 'text-green-400'

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end">
      <div className="w-full rounded-t-2xl bg-[#0E1F24] p-5 border-t border-white/10 animate-slide-up">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white">
            {asset.symbol} Allocation
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Portfolio Share</span>
            <span className="text-white font-medium">{asset.percent}%</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Value</span>
            <span className="text-white font-medium">${asset.value.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Risk Level</span>
            <span className={`font-medium ${riskColor}`}>{riskLevel}</span>
          </div>

          {asset.percent > 50 && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-300">
                ⚠️ High concentration increases portfolio risk. Consider diversifying into other assets.
              </p>
            </div>
          )}

          {asset.percent > 20 && asset.percent <= 50 && (
            <div className="mt-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-xs text-orange-300">
                This asset has moderate weight in your portfolio. Monitor for changes.
              </p>
            </div>
          )}

          {asset.percent <= 20 && (
            <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs text-green-300">
                ✓ Healthy allocation. This position is well-balanced.
              </p>
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-xl bg-teal-400/20 text-teal-300 text-sm font-medium hover:bg-teal-400/30 transition"
        >
          Close
        </button>
      </div>
    </div>
  )
}
