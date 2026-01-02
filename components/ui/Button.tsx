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
        rounded-[14px]
        text-sm font-semibold
        bg-[#0052FF]
        hover:bg-[#0047E1]
        active:scale-[0.98]
        transition
        disabled:opacity-50
      "
    >
      {children}
    </button>
  )
}
