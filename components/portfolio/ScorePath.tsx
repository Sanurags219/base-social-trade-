'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

type ScoreAction = {
  label: string
  delta: number
  route: string
}

export function ScorePath({ 
  currentScore,
  largestAsset,
  largestPercent,
  stablePercent,
  assetCount
}: { 
  currentScore: number
  largestAsset?: string
  largestPercent?: number
  stablePercent?: number
  assetCount?: number
}) {
  const router = useRouter()
  
  // Generate dynamic actions based on portfolio state
  const actions: ScoreAction[] = []
  
  if (largestPercent && largestPercent > 60) {
    actions.push({
      label: `Reduce ${largestAsset || 'ETH'} below 60%`,
      delta: 8,
      route: '/swap?from=ETH'
    })
  }
  
  if (!stablePercent || stablePercent < 20) {
    actions.push({
      label: 'Hold at least 20% stablecoins',
      delta: 6,
      route: '/swap?to=USDC'
    })
  }
  
  actions.push({
    label: 'Add a DeFi position',
    delta: 4,
    route: '/traders'
  })
  
  if (!assetCount || assetCount < 3) {
    actions.push({
      label: 'Diversify into 3+ assets',
      delta: 4,
      route: '/traders'
    })
  }

  const targetScore = Math.min(70, currentScore + actions.reduce((s, a) => s + a.delta, 0))

  return (
    <div className="mt-4 rounded-xl p-4 bg-[#0E1F24] border border-white/10">
      <h4 className="text-sm font-semibold text-white mb-3">
        How to reach {targetScore}%
      </h4>

      <div className="space-y-2">
        {actions.slice(0, 4).map((action, i) => (
          <button
            key={i}
            onClick={() => router.push(action.route)}
            className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 transition group"
          >
            <span className="text-xs text-zinc-300">{action.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-400">+{action.delta}</span>
              <ChevronRight size={14} className="text-zinc-500 group-hover:text-white transition" />
            </div>
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-zinc-500 text-center">
        Current: {currentScore} → Target: {targetScore}
      </p>
    </div>
  )
}
