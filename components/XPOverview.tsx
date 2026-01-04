export function XPOverview({ xp }: { xp: number }) {
  return (
    <section className="
      mt-4 rounded-3xl p-5
      bg-gradient-to-br from-white/10 via-white/5 to-transparent
      shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]
    ">
      <p className="text-xs text-zinc-400">Your XP</p>
      <div className="text-3xl font-semibold mt-1">{xp.toLocaleString()}</div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-zinc-400">Community Airdrop</p>
        <p className="text-sm font-medium text-teal-400 mt-1">
          40% of BSTN supply reserved
        </p>
      </div>

      <p className="text-[11px] text-zinc-500 mt-2">
        XP determines eligibility and relative allocation.
        Final distribution calculated at snapshot.
      </p>
    </section>
  )
}
