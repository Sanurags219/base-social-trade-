export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`
      bg-[#0B0F1A]
      border border-[#1E293B]
      rounded-2xl
      p-4
      shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_70px_-30px_rgba(37,99,235,0.6)]
      ${className}
    `}>
      {children}
    </div>
  )
}
