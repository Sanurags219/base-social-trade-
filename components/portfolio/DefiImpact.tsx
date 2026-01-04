'use client'

import { Layers } from 'lucide-react'

type DefiPosition = {
  protocol: string
  type: 'lp' | 'stable' | 'lending' | 'staking'
  value: number
}

export function DefiImpact({ positions }: { positions?: DefiPosition[] }) {
  if (!positions?.length) {
    return (
      <div className="mt-4 rounded-xl p-4 bg-[#0E1F24] border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Layers size={16} className="text-zinc-400" />
          <h4 className="text-sm font-semibold text-white">DeFi Impact</h4>
        </div>
        <p className="text-xs text-zinc-400">
          No DeFi positions detected. Add liquidity or stake to improve your score.
        </p>
        <div className="mt-2 text-xs text-zinc-500">
          Score impact: <span className="text-zinc-400">+0</span>
        </div>
      </div>
    )
  }

  const lpCount = positions.filter(p => p.type === 'lp').length
  const hasStableLP = positions.some(p => p.type === 'stable')
  const hasStaking = positions.some(p => p.type === 'staking')
  const hasLending = positions.some(p => p.type === 'lending')
  
  let scoreDelta = 0
  if (lpCount >= 2) scoreDelta += 5
  else if (lpCount === 1) scoreDelta += 3
  if (hasStableLP) scoreDelta += 4
  if (hasStaking) scoreDelta += 2
  if (hasLending) scoreDelta += 2

  return (
    <div className="mt-4 rounded-xl p-4 bg-[#0E1F24] border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Layers size={16} className="text-teal-400" />
        <h4 className="text-sm font-semibold text-white">DeFi Impact</h4>
      </div>

      <ul className="space-y-1.5 text-xs">
        <li className="flex justify-between text-zinc-300">
          <span>Active LP positions</span>
          <span className="text-white">{lpCount}</span>
        </li>
        {hasStableLP && (
          <li className="flex justify-between text-green-400">
            <span>Stable LP detected</span>
            <span>+4</span>
          </li>
        )}
        {hasStaking && (
          <li className="flex justify-between text-green-400">
            <span>Staking active</span>
            <span>+2</span>
          </li>
        )}
        {hasLending && (
          <li className="flex justify-between text-green-400">
            <span>Lending position</span>
            <span>+2</span>
          </li>
        )}
      </ul>

      <div className="mt-3 pt-3 border-t border-white/5">
        <p className="text-xs text-teal-300">
          Score impact: <span className="font-medium">+{scoreDelta}</span>
        </p>
      </div>
    </div>
  )
}
