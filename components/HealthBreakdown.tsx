type Item = {
  label: string
  value: number
  max: number
}

export function HealthBreakdown({
  items
}: {
  items: Item[]
}) {
  return (
    <div className="mt-4 space-y-4">
      {items.map((item) => {
        const pct = Math.round((item.value / item.max) * 100)

        return (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-400">
                {item.label}
              </span>
              <span className="text-zinc-500">
                {item.value}/{item.max}
              </span>
            </div>

            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
