'use client'

import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory'

interface BarChartData {
  month: string
  value: number
}

interface BarChartProps {
  data: BarChartData[]
  title?: string
}

export function BarChart({ data, title = 'Monthly Performance' }: BarChartProps) {
  return (
    <div className="rounded-2xl bg-[#0E1F24] p-4 border border-white/10 shadow-lg">
      <p className="text-xs text-zinc-400 mb-2">{title}</p>
      
      <div className="h-48">
        <VictoryChart
          theme={VictoryTheme.material}
          domainPadding={{ x: 15, y: 10 }}
          height={180}
          padding={{ top: 10, bottom: 40, left: 40, right: 20 }}
        >
          <VictoryAxis
            style={{
              axis: { stroke: '#374151' },
              tickLabels: { fill: '#9ca3af', fontSize: 9, fontFamily: 'Inter' },
              grid: { stroke: 'transparent' }
            }}
          />
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: '#374151' },
              tickLabels: { fill: '#9ca3af', fontSize: 9, fontFamily: 'Inter' },
              grid: { stroke: '#1f2937', strokeDasharray: '4,4' }
            }}
          />
          <VictoryBar
            data={data}
            x="month"
            y="value"
            cornerRadius={{ top: 4 }}
            style={{
              data: { 
                fill: '#2dd4bf',
                width: 20
              }
            }}
            animate={{
              duration: 500,
              onLoad: { duration: 300 }
            }}
          />
        </VictoryChart>
      </div>
    </div>
  )
}
