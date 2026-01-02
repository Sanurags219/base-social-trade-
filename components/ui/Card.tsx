export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
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
