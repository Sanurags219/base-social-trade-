'use client'

export function ExclusiveEventCard({
  title,
  description,
  rewards,
  cta,
  claimed,
  onClaim,
  loading,
  disabled
}: {
  title: string
  description: string
  rewards: string[]
  cta: string
  claimed: boolean
  onClaim?: () => void
  loading?: boolean
  disabled?: boolean
}) {
  return (
    <div className="
      relative rounded-2xl p-4
      bg-gradient-to-b from-[#121212] to-black
      border border-white/10
    ">
      {!claimed && !disabled && (
        <span className="absolute top-3 right-3 text-xs px-2 py-0.5
          rounded-full bg-white/10 text-zinc-300">
          Exclusive
        </span>
      )}

      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-zinc-400 mt-1">{description}</p>

      <div className="flex gap-2 mt-3">
        {rewards.map(r => (
          <span
            key={r}
            className="text-xs px-2 py-1 rounded-full
              bg-white/10 text-zinc-300"
          >
            {r}
          </span>
        ))}
      </div>

      <button
        disabled={claimed || loading || disabled}
        onClick={onClaim}
        className={`
          mt-4 w-full py-2 rounded-xl text-sm font-medium transition-all
          ${claimed
            ? 'bg-white/5 text-zinc-500'
            : disabled
            ? 'bg-white/5 text-zinc-500 cursor-not-allowed'
            : loading
            ? 'bg-green-500/50 text-black/50'
            : 'bg-green-500 text-black active:scale-[0.98]'}
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Claiming...
          </span>
        ) : claimed ? 'Claimed' : cta}
      </button>
    </div>
  )
}
