import Link from 'next/link'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05060A] text-white">
      <div className="max-w-md mx-auto px-3 py-4">

        {/* Top Nav */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-semibold tracking-tight">
            BSTN
          </span>

          <div className="flex gap-4 text-sm text-zinc-400">
            <Link href="/swap" className="hover:text-white transition">Swap</Link>
            <Link href="/leaderboard" className="hover:text-white transition">XP</Link>
            <Link href="/claim" className="hover:text-white transition">Claim</Link>
          </div>
        </div>

        {children}
      </div>
    </div>
  )
}
