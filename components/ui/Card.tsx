interface CardProps {
  children: React.ReactNode
  className?: string
  glow?: boolean
  premium?: boolean
}

export function Card({ children, className = '', glow = false, premium = false }: CardProps) {
  if (premium) {
    return (
      <div className={`
        relative rounded-2xl p-4
        bg-gradient-to-b from-[#0e1f24] to-[#071317]
        border border-white/5
        shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]
        ${className}
      `}>
        {glow && (
          <div className="
            absolute inset-0 rounded-2xl
            bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.15),transparent_60%)]
            pointer-events-none
          " />
        )}
        <div className="relative">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={`
      bg-white/[0.03]
      border border-white/5
      rounded-2xl
      p-4
      ${className}
    `}>
      {children}
    </div>
  )
}

// Premium card with all depth layers
export function PremiumCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      relative rounded-2xl p-4
      bg-gradient-to-b from-[#0e1f24] to-[#071317]
      border border-white/5
      shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]
      transition-all duration-300
      hover:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95)]
      hover:border-white/10
      ${className}
    `}>
      {/* Glow layer */}
      <div className="
        absolute inset-0 rounded-2xl
        bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.15),transparent_60%)]
        pointer-events-none
      " />
      <div className="relative">
        {children}
      </div>
    </div>
  )
}