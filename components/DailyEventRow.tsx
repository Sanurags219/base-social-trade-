'use client'

export function DailyEventRow({
  title,
  reward,
  claimed,
  onClaim,
  loading,
  disabled
}: {
  title: string
  reward: string
  claimed?: boolean
  onClaim?: () => void
  loading?: boolean
  disabled?: boolean
}) {
  return (
    <div className="
      flex items-center justify-between
      p-4 rounded-xl bg-white/[0.04]
    ">
      <div>
        <p className="text-sm">{title}</p>
        <p className="text-xs text-zinc-500">{reward}</p>
      </div>

      <button
        disabled={claimed || loading || disabled}
        onClick={onClaim}
        className={`
          text-xs px-3 py-1.5 rounded-lg transition-all
          ${claimed
            ? 'bg-white/5 text-zinc-500'
            : disabled
            ? 'bg-white/5 text-zinc-500 cursor-not-allowed'
            : loading
            ? 'bg-white/5 text-zinc-400'
            : 'bg-white/10 text-zinc-300 active:scale-95'}
        `}
      >
        {loading ? '...' : claimed ? 'Done' : disabled ? 'Locked' : 'Claim'}
      </button>
    </div>
  )
}
