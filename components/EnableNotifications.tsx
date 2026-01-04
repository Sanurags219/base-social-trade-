'use client'

import { useState } from 'react'

export function EnableNotifications() {
  const [enabled, setEnabled] = useState(false)

  const handleEnable = async () => {
    // In Base Mini App, this would use the minikit API
    // For now, we'll just set state
    setEnabled(true)
  }

  if (enabled) return null

  return (
    <button
      onClick={handleEnable}
      className="px-4 py-2 rounded-lg bg-white/10 text-sm text-zinc-300 hover:bg-white/15 transition"
    >
      Enable notifications
    </button>
  )
}
