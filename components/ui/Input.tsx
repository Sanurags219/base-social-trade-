export function Input({
  value,
  onChange,
  placeholder
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        bg-transparent
        outline-none
        text-3xl
        font-semibold
        w-full
      "
    />
  )
}
