'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ReviewRoute } from '@/lib/reviewRoutes'
import { HoldingBubble, AssetBreakdownModal, ScorePath, DefiImpact, ScoreHistory, ScoreNotificationToggle } from './portfolio'

type Asset = {
  symbol: string
  percent: number
  value: number
}

type Props = {
  routes: ReviewRoute[]
  score?: number
  assets?: Asset[]
}

export function ReviewSuggestedNavigator({ routes, score = 48, assets = [] }: Props) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  
  // Get top 3 assets
  const topAssets = assets.length > 0 
    ? assets.slice(0, 3) 
    : [
        { symbol: 'ETH', percent: 82, value: 4.88 },
        { symbol: 'USDC', percent: 12, value: 0.72 },
        { symbol: 'WETH', percent: 6, value: 0.36 }
      ]

  const largestAsset = topAssets[0]
  const stablePercent = topAssets.find(a => ['USDC', 'USDbC', 'DAI', 'USDT'].includes(a.symbol))?.percent || 0
  
  // Generate score history (mock for now)
  const [scoreHistory] = useState([
    { date: 'Oct', score: Math.max(30, score - 15) },
    { date: 'Nov', score: Math.max(35, score - 8) },
    { date: 'Dec', score: Math.max(40, score - 3) },
    { date: 'Jan', score: score }
  ])

  // Load notification preference
  useEffect(() => {
    const saved = localStorage.getItem('score_notifications')
    if (saved === 'true') setNotificationsEnabled(true)
  }, [])

  const handleNotificationToggle = () => {
    const newValue = !notificationsEnabled
    setNotificationsEnabled(newValue)
    localStorage.setItem('score_notifications', String(newValue))
  }

  if (routes.length === 0 && score >= 50) return null

  // Determine warning message
  let warningMessage = ''
  if (largestAsset.percent > 60) {
    warningMessage = `High ${largestAsset.symbol} concentration detected`
  } else if (largestAsset.percent > 40) {
    warningMessage = `${largestAsset.symbol} is a significant portion of portfolio`
  } else if (stablePercent < 10) {
    warningMessage = 'Consider adding stablecoins for stability'
  }

  return (
    <section className="mt-6 rounded-2xl bg-gradient-to-b from-[#0E1F24] to-[#071317] border border-white/10 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Review Suggested</h3>
        <span className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
          {score}%
        </span>
      </div>

      {/* Asset Bubbles */}
      <div className="mt-4 flex justify-center gap-3">
        {topAssets.map((asset, i) => (
          <div
            key={asset.symbol}
            className="bubble-animate"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <HoldingBubble
              symbol={asset.symbol}
              percent={asset.percent}
              onClick={() => setSelectedAsset(asset)}
            />
          </div>
        ))}
      </div>

      {/* Warning Message */}
      {warningMessage && (
        <p className="mt-3 text-xs text-orange-300 text-center">
          {warningMessage}
        </p>
      )}

      {/* Score Path */}
      <ScorePath 
        currentScore={score}
        largestAsset={largestAsset.symbol}
        largestPercent={largestAsset.percent}
        stablePercent={stablePercent}
        assetCount={topAssets.length}
      />

      {/* DeFi Impact */}
      <DefiImpact positions={[]} />

      {/* Score History */}
      <ScoreHistory history={scoreHistory} />

      {/* Notifications Toggle */}
      <ScoreNotificationToggle
        enabled={notificationsEnabled}
        onToggle={handleNotificationToggle}
      />

      {/* Original Routes */}
      {routes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          {routes.map(r => (
            <div key={r.label} className="flex items-center justify-between">
              <p className="text-xs text-zinc-400">{r.label}</p>
              <Link
                href={r.href}
                className="text-xs text-teal-400 hover:text-teal-300 transition"
              >
                {r.cta} 
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Asset Modal */}
      <AssetBreakdownModal
        open={!!selectedAsset}
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />
    </section>
  )
}