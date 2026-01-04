export function PortfolioSecurityHero({
  score,
  status,
  subtitle
}: {
  score: number
  status: string
  subtitle: string
}) {
  // Color based on score
  const getColor = () => {
    if (score >= 75) return '#22c55e' // green
    if (score >= 50) return '#eab308' // yellow
    return '#f97316' // orange
  }

  const color = getColor()

  return (
    <section className="relative mt-6 px-4">
      {/* glow */}
      <div
        className="absolute inset-0 blur-2xl"
        style={{
          background: `radial-gradient(circle at center, ${color}2e, transparent 60%)`
        }}
      />

      <div className="
        relative rounded-3xl py-10
        bg-gradient-to-b from-[#0b0f14] to-black
        border border-white/10
      ">
        {/* ring */}
        <div className="flex justify-center">
          <div className="relative w-52 h-52">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="44" stroke="#1f2937" strokeWidth="6" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke={color}
                strokeWidth="6"
                fill="none"
                strokeDasharray="276"
                strokeDashoffset={276 - (score / 100) * 276}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-semibold">{score}%</div>
              <div className="text-sm text-zinc-400 mt-1">{status}</div>
            </div>
          </div>
        </div>

        {/* subtitle */}
        <p className="mt-6 text-center text-sm text-zinc-500">
          {subtitle}
        </p>

        {/* subtle action */}
        <button className="
          mt-6 mx-auto block px-6 py-2 rounded-lg
          bg-white/10 text-zinc-300 text-sm
          hover:bg-white/15 transition
        ">
          Review details
        </button>
      </div>
    </section>
  )
}
