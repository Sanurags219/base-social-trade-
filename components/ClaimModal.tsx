'use client'

import { useEffect } from 'react'

export function ClaimModal({
  open,
  title,
  xp,
  txHash,
  onClose,
  onShare
}: {
  open: boolean
  title: string
  xp: number
  txHash?: string
  onClose: () => void
  onShare: () => void
}) {
  // Auto-close after 2 seconds
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end">
      <div className="w-full rounded-t-3xl bg-[#05060A] p-6 border-t border-white/10">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

        <p className="text-xs text-zinc-400">Reward Claimed</p>
        <h2 className="text-lg font-semibold mt-1">{title}</h2>

        <div className="mt-4 rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-zinc-400">XP Earned</p>
          <p className="text-3xl font-semibold mt-1">+{xp}</p>
        </div>

        {txHash && (
          <a
            href={`https://basescan.org/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-3 text-xs text-blue-400 hover:underline text-center"
          >
            View on BaseScan
          </a>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-white/5 text-zinc-400"
          >
            Close
          </button>
          <button
            onClick={onShare}
            className="flex-1 py-3 rounded-xl bg-green-500 text-black font-medium"
          >
            Share XP
          </button>
        </div>
      </div>
    </div>
  )
}
