export function Button({
  children,
  onClick,
  disabled
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="
        w-full
        py-3
        rounded-xl
        text-sm font-semibold
        bg-gradient-to-b from-[#2563EB] to-[#1D4ED8]
        shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_20px_50px_-15px_rgba(37,99,235,1)]
        active:scale-[0.97]
        transition
        disabled:opacity-50
      "
    >
      {children}
    </button>
  )
}
