'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight, ArrowRightLeft, Wallet, TrendingUp, Users } from 'lucide-react'

type ScoreAction = {
  label: string
  delta: number
  route: string
  icon: 'swap' | 'stable' | 'defi' | 'copy'
}

const iconMap = {
  swap: ArrowRightLeft,
  stable: Wallet,
  defi: TrendingUp,
  copy: Users
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

  const actions: ScoreAction[] = []

  if (largestPercent && largestPercent > 60) {
    actions.push({
      label: 'Reduce ' + (largestAsset || 'ETH') + ' concentration below 60%',
      delta: 8,
      route: '/swap?from=' + (largestAsset || 'ETH'),
      icon: 'swap'
    })
  }

  if (!stablePercent || stablePercent < 20) {
    actions.push({
      label: 'Hold at least 20% stablecoins',
      delta: 6,
      route: '/swap?to=USDC',
      icon: 'stable'
    })
  }

  actions.push({
    label: 'Add a DeFi position',
    delta: 4,
    route: '/traders',
    icon: 'defi'
  })

  if (!assetCount || assetCount < 3) {
    actions.push({
      label: 'Diversify via copy trading',
      delta: 4,
      route: '/traders',
      icon: 'copy'
    })
  }

  const targetScore = Math.min(70, currentScore + actions.reduce((s, a) => s + a.delta, 0))

  return (
    <div className="mt-4 rounded-xl p-4 bg-[#0E1F24] border border-white/10">
      <h4 className="text-sm font-semibold text-white mb-3">
        How to reach {targetScore}%
      </h4>

      <div className="space-y-2">
        {actions.slice(0, 4).map((action, i) => {
          const Icon = iconMap[action.icon]
          return (
            <button
              key={i}
              onClick={() => router.push(action.route)}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 hover:border-teal-500/20 border border-transparent transition group"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center">
                  <Icon size={12} className="text-teal-400" />
                </div>
                <span className="text-xs text-zinc-300">{action.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-green-400">+{action.delta}</span>
                <ChevronRight size={14} className="text-zinc-500 group-hover:text-teal-400 transition" />
              </div>
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-xs text-zinc-500 text-center">
        Current: {currentScore}  Target: {targetScore}
      </p>
    </div>
  )
}
