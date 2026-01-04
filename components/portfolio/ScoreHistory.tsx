'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type ScoreHistoryPoint = {
  date: string
  score: number
}

export function ScoreHistory({ history }: { history: ScoreHistoryPoint[] }) {
  if (!history?.length) {
    return (
      <div className="mt-4 rounded-xl p-4 bg-[#0E1F24] border border-white/10">
        <h4 className="text-sm font-semibold text-white mb-2">Score History</h4>
        <p className="text-xs text-zinc-400">Not enough data to show history yet.</p>
      </div>
    )
  }

  // Generate SVG points
  const maxScore = Math.max(...history.map(p => p.score), 100)
  const minScore = Math.min(...history.map(p => p.score), 0)
  const range = maxScore - minScore || 1
  
  const width = 120
  const height = 60
  const padding = 5
  
  const points = history
    .map((p, i) => {
      const x = padding + (i / (history.length - 1)) * (width - 2 * padding)
      const y = height - padding - ((p.score - minScore) / range) * (height - 2 * padding)
      return `${x},${y}`
    })
    .join(' ')

  const firstScore = history[0]?.score || 0
  const lastScore = history[history.length - 1]?.score || 0
  const change = lastScore - firstScore
  
  const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus
  const trendColor = change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-zinc-400'
  const trendText = change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable'

  return (
    <div className="mt-4 rounded-xl p-4 bg-[#0E1F24] border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-white">Score History</h4>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon size={14} />
          <span className="text-xs">{change > 0 ? '+' : ''}{change}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16">
        {/* Grid lines */}
        <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        
        {/* Line chart */}
        <polyline
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        
        {/* Dots */}
        {history.map((p, i) => {
          const x = padding + (i / (history.length - 1)) * (width - 2 * padding)
          const y = height - padding - ((p.score - minScore) / range) * (height - 2 * padding)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#0E1F24"
              stroke="#2dd4bf"
              strokeWidth="1.5"
            />
          )
        })}
      </svg>

      {/* Labels */}
      <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
        {history.slice(0, 4).map((p, i) => (
          <span key={i}>{p.date}</span>
        ))}
      </div>

      <p className="mt-3 text-xs text-zinc-400 text-center">
        Your score is {trendText} over time
      </p>
    </div>
  )
}
