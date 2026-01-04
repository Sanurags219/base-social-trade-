interface AllocationItem {
  name: string
  color: string
  percent: number
}

interface AllocationCardProps {
  totalValue: string
  allocations: AllocationItem[]
}

export function AllocationCard({ totalValue, allocations }: AllocationCardProps) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-[#0E1F24] to-[#071317] p-4 border border-white/10 shadow-lg overflow-hidden">
      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.1),transparent_60%)] pointer-events-none" />
      
      <div className="relative">
        <p className="text-xs text-zinc-400">Asset Allocation</p>
        <p className="text-2xl font-semibold text-white mt-1">{totalValue}</p>
        
        {/* Allocation bar */}
        <div className="mt-4 h-3 rounded-full overflow-hidden flex bg-white/5">
          {allocations.map((a, i) => (
            <div 
              key={a.name}
              className="h-full transition-all duration-500"
              style={{ 
                width: `${a.percent}%`, 
                backgroundColor: a.color,
                marginLeft: i > 0 ? '2px' : '0'
              }}
            />
          ))}
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {allocations.map((a) => (
            <div key={a.name} className="flex items-center gap-2">
              <div 
                className="w-2.5 h-2.5 rounded-full" 
                style={{ backgroundColor: a.color }}
              />
              <span className="text-xs text-zinc-400">{a.name}</span>
              <span className="text-xs text-zinc-500 ml-auto">{a.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}