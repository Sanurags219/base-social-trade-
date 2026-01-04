import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface Holding {
  symbol: string
  name: string
  amount: string
  value: string
  percent: number
  change24h: number
  icon?: string
}

interface HoldingsTableProps {
  holdings: Holding[]
}

export function HoldingsTable({ holdings }: HoldingsTableProps) {
  return (
    <div className="mt-6 px-4 space-y-3">
      <p className="text-xs text-zinc-400 mb-3">Holdings</p>
      
      {holdings.map((h) => (
        <div 
          key={h.symbol} 
          className="flex items-center justify-between bg-[#0E1F24] p-3 rounded-xl border border-white/10 shadow-md"
        >
          <div className="flex items-center gap-3">
            {/* Token Icon */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-semibold border border-white/10">
              {h.icon || h.symbol.slice(0, 2)}
            </div>
            
            <div>
              <p className="text-sm font-medium text-white">{h.symbol}</p>
              <p className="text-xs text-zinc-500">{h.amount}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-semibold text-white">${h.value}</p>
            <div className="flex items-center justify-end gap-1">
              {h.change24h >= 0 ? (
                <ArrowUpRight size={12} className="text-teal-400" />
              ) : (
                <ArrowDownRight size={12} className="text-red-400" />
              )}
              <p className={`text-xs ${h.change24h >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                {h.change24h >= 0 ? '+' : ''}{h.change24h.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}