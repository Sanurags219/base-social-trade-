export function XPOverview({
  xp,
  estimate
}: {
  xp: number
  estimate: string
}) {
  return (
    <section className="
      mt-4 rounded-3xl p-5
      bg-gradient-to-br from-white/10 via-white/5 to-transparent
      shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]
    ">
      <p className="text-xs text-zinc-400">Your XP</p>
      <div className="text-3xl font-semibold mt-1">{xp.toLocaleString()}</div>

      <p className="text-xs text-zinc-400 mt-3">
        Estimated BSTN airdrop share
      </p>
      <p className="text-sm font-medium text-blue-400">
        {estimate}
      </p>

      <p className="text-[11px] text-zinc-500 mt-1">
        Final allocation calculated at snapshot
      </p>
    </section>
  )
}
