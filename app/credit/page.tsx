'use client'

import { CreditDashboard } from '@/components/CreditDashboard'

export default function CreditPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">💳 Credit System</h1>
          <p className="text-zinc-400">
            Borrow power is earned, not deposited. Reputation-based under-collateralized lending.
          </p>
        </div>

        {/* Credit Dashboard */}
        <CreditDashboard />

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* Credit Tiers */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <h3 className="font-semibold mb-3">📊 Credit Tiers</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>🟢 Elite (850+)</span>
                <span className="text-green-400">$5,000</span>
              </div>
              <div className="flex justify-between">
                <span>🔵 Trusted (650-849)</span>
                <span className="text-blue-400">$1,500</span>
              </div>
              <div className="flex justify-between">
                <span>🟡 Regular (400-649)</span>
                <span className="text-yellow-400">$300</span>
              </div>
              <div className="flex justify-between">
                <span>🔴 New (&lt;400)</span>
                <span className="text-red-400">—</span>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <h3 className="font-semibold mb-3">⚙️ Loan Rules</h3>
            <div className="space-y-2 text-sm text-zinc-300">
              <div>✅ One active loan per wallet</div>
              <div>✅ 14-day fixed term</div>
              <div>✅ No interest</div>
              <div>✅ No leverage or liquidation</div>
              <div>✅ Late payment = rep penalty</div>
            </div>
          </div>
        </div>

        {/* Reputation Impact */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 mt-8 border border-blue-500/30">
          <h3 className="font-semibold mb-3">🧠 How Reputation Affects Credit</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-green-400 mb-1">✅ Positive Actions</div>
              <ul className="space-y-1 text-zinc-300">
                <li>• On-time repayment → +rep</li>
                <li>• Multiple cycles → tier upgrade</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-red-400 mb-1">❌ Negative Actions</div>
              <ul className="space-y-1 text-zinc-300">
                <li>• Late repayment → -rep</li>
                <li>• Default → credit frozen</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Launch Guardrails */}
        <div className="bg-zinc-900 rounded-xl p-4 mt-8 border border-zinc-800 text-sm">
          <h3 className="font-semibold mb-3">🔐 Launch Guardrails (MVP)</h3>
          <ul className="space-y-2 text-zinc-300">
            <li>✓ Total TVL capped at $50,000</li>
            <li>✓ Trusted+ only (650+ reputation)</li>
            <li>✓ Manual whitelist (first 20 users)</li>
            <li>✓ Daily monitoring & alerts</li>
            <li>✓ Gradual rollout to public</li>
          </ul>
        </div>

        {/* Why This Matters */}
        <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-4 mt-8 border border-green-500/30">
          <h3 className="font-semibold mb-2">🚀 Why This Is Huge</h3>
          <p className="text-sm text-zinc-300">
            You've built the complete Web3 trust stack:
          </p>
          <ul className="mt-3 space-y-1 text-sm text-zinc-300">
            <li>🔐 On-chain identity (SBT)</li>
            <li>📊 Trust scoring (reputation)</li>
            <li>🤝 Social trading (copy trades)</li>
            <li>💳 Credit without collateral (loans)</li>
          </ul>
          <p className="text-xs text-green-400 mt-3">
            This is what Web3 promises, done responsibly.
          </p>
        </div>
      </div>
    </div>
  )
}
