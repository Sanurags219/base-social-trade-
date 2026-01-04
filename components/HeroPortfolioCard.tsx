export function HeroPortfolioCard({
  totalUSD,
  score,
  status
}: {
  totalUSD: string
  score: number
  status: 'Healthy' | 'Needs Attention' | 'Review Suggested'
}) {
  const getStatusStyle = () => {
    if (status === 'Healthy') return 'bg-green-500/15 text-green-400'
    if (status === 'Needs Attention') return 'bg-orange-500/15 text-orange-400'
    return 'bg-yellow-500/15 text-yellow-400'
  }

  return (
    <section className="
      rounded-3xl p-5
      bg-gradient-to-br from-white/10 via-white/5 to-transparent
      shadow-[0_24px_48px_-24px_rgba(0,0,0,0.9)]
    ">
      <p className="text-xs text-zinc-400">
        Total Portfolio Value
      </p>

      <div className="mt-1 text-4xl font-semibold tracking-tight">
        {totalUSD}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs ${getStatusStyle()}`}>
          {status}
        </span>

        <span className="text-xs text-zinc-500">
          Health score {score}/100
        </span>
      </div>
    </section>
  )
}
