export function AirdropBanner() {
  return (
    <section className="
      mt-4 rounded-2xl p-4
      bg-gradient-to-r from-blue-600/20 to-purple-600/20
      border border-white/10
    ">
      <p className="text-sm font-medium text-white">
        BSTN Airdrop
      </p>

      <p className="text-xs text-zinc-300 mt-1">
        40% of total BSTN supply is reserved for the community.
      </p>

      <p className="text-xs text-zinc-400 mt-2">
        XP determines eligibility and relative allocation.
        Final distribution will be calculated at snapshot.
      </p>
    </section>
  )
}
