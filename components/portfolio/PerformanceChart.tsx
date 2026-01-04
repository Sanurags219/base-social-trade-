'use client'

import { Sparklines, SparklinesLine, SparklinesBars } from 'react-sparklines'

interface PerformanceChartProps {
  data: number[]
  title?: string
  period?: string
}

export function PerformanceChart({ 
  data, 
  title = 'Monthly Performance',
  period = 'Last 12 Months'
}: PerformanceChartProps) {
  const isPositive = data.length > 1 && data[data.length - 1] >= data[0]
  const change = data.length > 1 
    ? (((data[data.length - 1] - data[0]) / data[0]) * 100).toFixed(1)
    : '0'

  return (
    <div className="rounded-2xl bg-[#0E1F24] p-4 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-zinc-400">{title}</p>
          <p className="text-[11px] text-zinc-500">{period}</p>
        </div>
        <div className={`text-sm font-semibold ${isPositive ? 'text-teal-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{change}%
        </div>
      </div>
      
      <div className="h-32">
        <Sparklines data={data} margin={5} height={120} width={300}>
          <SparklinesBars 
            style={{ 
              fill: isPositive ? 'rgba(45,212,191,0.15)' : 'rgba(239,68,68,0.15)',
              fillOpacity: 0.5
            }} 
          />
          <SparklinesLine
            style={{ 
              stroke: isPositive ? '#2dd4bf' : '#ef4444', 
              strokeWidth: 2.5,
              fill: 'none'
            }}
          />
        </Sparklines>
      </div>
    </div>
  )
}