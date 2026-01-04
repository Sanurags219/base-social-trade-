'use client'

type BubbleProps = {
  symbol: string
  percent: number
  onClick?: () => void
}

export function HoldingBubble({ symbol, percent, onClick }: BubbleProps) {
  const riskColor =
    percent > 50
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : percent > 20
      ? 'bg-orange-400/20 text-orange-300 border-orange-400/30'
      : 'bg-green-500/20 text-green-400 border-green-500/30'

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center
        w-16 h-16 rounded-full
        ${riskColor}
        border
        text-xs font-medium
        transition-transform active:scale-95
      `}
    >
      <span>{symbol}</span>
      <span className="text-[10px] opacity-80">{percent}%</span>
    </Component>
  )
}
