'use client'

import { VictoryPie, VictoryLabel } from 'victory'

interface PieChartData {
  x: string
  y: number
}

interface PieChartProps {
  data: PieChartData[]
  title?: string
  totalValue?: string
}

const COLORS = ['#2dd4bf', '#60a5fa', '#a78bfa', '#facc15', '#f87171', '#34d399']

export function PieChart({ data, title = 'Asset Allocation', totalValue }: PieChartProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-b from-[#0E1F24] to-[#071317] p-4 border border-white/10 shadow-lg">
      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.08),transparent_60%)] pointer-events-none" />
      
      <p className="text-xs text-zinc-400 mb-1">{title}</p>
      {totalValue && (
        <p className="text-xl font-semibold text-white mb-2">{totalValue}</p>
      )}
      
      <div className="relative h-48 flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          <VictoryPie
            standalone={false}
            data={data}
            colorScale={COLORS}
            innerRadius={70}
            padAngle={2}
            style={{
              labels: { fill: 'transparent' }
            }}
            animate={{
              duration: 500,
              onLoad: { duration: 300 }
            }}
          />
          {/* Center label */}
          <VictoryLabel
            textAnchor="middle"
            verticalAnchor="middle"
            x={200}
            y={200}
            style={{
              fontSize: 14,
              fill: '#e5e7eb',
              fontFamily: 'Inter',
              fontWeight: 600
            }}
            text={totalValue || ''}
          />
        </svg>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((item, i) => (
          <div key={item.x} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-xs text-zinc-400">{item.x}</span>
            <span className="text-xs text-zinc-500 ml-auto">{item.y}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
