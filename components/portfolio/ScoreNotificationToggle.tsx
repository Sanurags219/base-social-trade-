'use client'

import { Bell, BellOff } from 'lucide-react'

export function ScoreNotificationToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="mt-4 rounded-xl p-4 bg-[#0E1F24] border border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${enabled ? 'bg-teal-500/20' : 'bg-white/10'}`}>
          {enabled ? (
            <Bell size={16} className="text-teal-400" />
          ) : (
            <BellOff size={16} className="text-zinc-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">Score Notifications</p>
          <p className="text-xs text-zinc-400">
            Get notified when score changes
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
        {enabled ? 'On' : 'Off'}
      </button>
    </div>
  )
}
