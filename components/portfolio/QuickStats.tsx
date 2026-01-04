import { TrendingUp, Activity, DollarSign, Wallet } from 'lucide-react'

interface QuickStatsProps {
  growth: string
  trades: number
  profit: string
  holdings?: number
}

export function QuickStats({ growth, trades, profit, holdings }: QuickStatsProps) {
  const stats = [
    { 
      label: 'Portfolio Growth', 
      value: growth, 
      icon: TrendingUp,
      color: 'text-teal-400'
    },
    { 
      label: 'Active Trades', 
      value: trades.toString(), 
      icon: Activity,
      color: 'text-blue-400'
    },
    { 
      label: 'Total Profit', 
      value: profit, 
      icon: DollarSign,
      color: 'text-green-400'
    },
    { 
      label: 'Holdings', 
      value: holdings?.toString() || trades.toString(), 
      icon: Wallet,
      color: 'text-purple-400'
    },
  ]

  return (
    <div className="mt-6 px-4 grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="rounded-xl bg-[#0E1F24] p-3 border border-white/10 shadow-md"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <stat.icon size={12} className={stat.color} />
            <p className="text-xs text-zinc-400">{stat.label}</p>
          </div>
          <p className="text-lg font-semibold text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  )
}