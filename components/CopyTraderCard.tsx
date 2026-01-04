'use client'

import { TrendingUp, Users, Trophy } from 'lucide-react'
import { MiniSparkline } from './MiniSparkline'

interface CopyTraderCardProps {
  name: string
  address: string
  roi: number
  pnl: string
  copiers: number
  winRate: number
  avatar?: string
  strategy?: string
  chartData?: number[]
  onCopy?: () => void
}

export function CopyTraderCard({
  name,
  address,
  roi,
  pnl,
  copiers,
  winRate,
  avatar,
  strategy = 'Perpetual Futures',
  chartData,
  onCopy
}: CopyTraderCardProps) {
  const isPositive = roi >= 0

  return (
    <div className="
      relative rounded-2xl p-4
      bg-gradient-to-b from-[#0e1f24] to-[#071317]
      border border-white/5
      shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]
      transition-all duration-300
      hover:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95)]
      hover:border-white/10
    ">
      {/* Glow layer - THIS IS THE KEY */}
      <div className="
        absolute inset-0 rounded-2xl
        bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.15),transparent_60%)]
        pointer-events-none
      " />

      {/* Header */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="
            w-10 h-10 rounded-full 
            bg-gradient-to-br from-teal-400/30 to-blue-500/30
            border border-white/10
            flex items-center justify-center
            text-sm font-semibold
          ">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              name.slice(0, 2).toUpperCase()
            )}
          </div>
          
          <div>
            <p className="text-[16px] font-semibold text-white">{name}</p>
            <p className="text-[11px] text-zinc-400">{strategy}</p>
          </div>
        </div>

        <button 
          onClick={onCopy}
          className="
            px-4 py-1.5 rounded-full text-[13px] font-medium
            bg-teal-400/20 text-teal-300
            border border-teal-400/30
            hover:bg-teal-400/30
            transition-all duration-200
          "
        >
          Copy
        </button>
      </div>

      {/* Chart */}
      <div className="relative mt-4">
        <MiniSparkline data={chartData} positive={isPositive} height={56} />
      </div>

      {/* Stats Grid */}
      <div className="relative mt-4 grid grid-cols-3 gap-2">
        {/* ROI */}
        <div className="bg-black/30 rounded-xl p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={12} className="text-zinc-500" />
            <p className="text-[11px] text-zinc-400">30D ROI</p>
          </div>
          <p className={`text-[18px] font-bold ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{roi.toFixed(2)}%
          </p>
        </div>

        {/* Copiers */}
        <div className="bg-black/30 rounded-xl p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Users size={12} className="text-zinc-500" />
            <p className="text-[11px] text-zinc-400">Copiers</p>
          </div>
          <p className="text-[16px] font-semibold text-white">
            {copiers >= 1000 ? `${(copiers / 1000).toFixed(1)}K` : copiers}
          </p>
        </div>

        {/* Win Rate */}
        <div className="bg-black/30 rounded-xl p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Trophy size={12} className="text-zinc-500" />
            <p className="text-[11px] text-zinc-400">Win Rate</p>
          </div>
          <p className="text-[16px] font-semibold text-white">
            {winRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* PnL Footer */}
      <div className="relative mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <p className="text-[11px] text-zinc-500">Total PnL</p>
        <p className={`text-[14px] font-semibold ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
          {pnl}
        </p>
      </div>
    </div>
  )
}
