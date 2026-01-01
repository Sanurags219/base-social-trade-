'use client'

import { useEffect, useState } from 'react'

export function XPBadge() {
  const [xp, setXp] = useState(0)

  useEffect(() => {
    fetch('/api/xp')
      .then((r) => r.json())
      .then((d) => setXp(d.xp))
  }, [])

  return (
    <div className="absolute top-4 right-4 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 text-sm">
      <span className="text-zinc-400">XP</span>
      <span className="ml-2 font-bold text-green-400">{xp}</span>
    </div>
  )
}
