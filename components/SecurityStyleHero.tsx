export function SecurityStyleHero({
  score,
  status,
  total
}: {
  score: number
  status: string
  total: string
}) {
  return (
    <section className="relative mx-auto mt-4 rounded-3xl p-6
      bg-gradient-to-b from-[#121212] via-[#0B0B0B] to-black
      shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)]
      overflow-hidden
    ">

      {/* subtle glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72
        bg-green-500/10 blur-[120px]" />

      {/* Ring */}
      <div className="flex justify-center">
        <div className="relative w-40 h-40 rounded-full
          bg-black
          shadow-inner
        ">
          <svg className="absolute inset-0" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#1f2937"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#22c55e"
              strokeWidth="6"
              fill="none"
              strokeDasharray="264"
              strokeDashoffset={264 - (score / 100) * 264}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-semibold">{score}%</div>
            <div className="text-xs text-zinc-400 mt-1">{status}</div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-zinc-500">Total Portfolio Value</p>
        <p className="text-2xl font-semibold mt-1">{total}</p>
      </div>

      {/* CTA */}
      <button className="
        mt-5 w-full py-3 rounded-xl
        bg-green-500 text-black text-sm font-medium
      ">
        Review Portfolio
      </button>
    </section>
  )
}
