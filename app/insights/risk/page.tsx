'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { AppShell } from '@/components/AppShell'
import { WalletConnect } from '@/components/WalletConnect'
import { categorizeToken } from '@/lib/scoreEngine'

interface TokenData {
  symbol: string
  balance: number
  valueUSD: number
}

export default function RiskInsightsPage() {
  const { address } = useAccount()
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const endpoint = address
          ? `/api/healthscore?address=${address}`
          : '/api/healthscore?address=demo'
        const res = await fetch(endpoint)
        if (res.ok) {
          const data = await res.json()
          setTokens(data.tokens || [])
        }
      } catch (e) {
        console.error('Failed to fetch:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [address])

  const riskyTokens = tokens.filter(t => {
    const { risk } = categorizeToken(t.symbol)
    return risk === 'high'
  })

  const total = tokens.reduce((s, t) => s + t.valueUSD, 0)
  const riskyTotal = riskyTokens.reduce((s, t) => s + t.valueUSD, 0)
  const riskyPercent = total > 0 ? ((riskyTotal / total) * 100).toFixed(1) : '0'

  return (
    <AppShell>
      <WalletConnect />

      <main className="pb-24">
        <h1 className="text-lg font-semibold">Risk Exposure</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Assets contributing most to portfolio volatility
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="mt-4 p-4 rounded-2xl bg-orange-500/10">
              <p className="text-xs text-zinc-400">High-risk exposure</p>
              <p className="text-2xl font-semibold text-orange-400 mt-1">
                {riskyPercent}%
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                ${riskyTotal.toFixed(2)} of ${total.toFixed(2)} total
              </p>
            </div>

            {/* Risky Assets */}
            <div className="mt-6 space-y-3">
              {riskyTokens.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">
                  No high-risk assets detected ✓
                </p>
              ) : (
                riskyTokens.map((t, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/[0.04] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-xs">
                        {t.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{t.symbol}</p>
                        <p className="text-xs text-zinc-500">High risk</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${t.valueUSD.toFixed(2)}</p>
                      <p className="text-xs text-zinc-500">
                        {total > 0 ? ((t.valueUSD / total) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action */}
            {riskyTokens.length > 0 && (
              <div className="mt-6">
                <a
                  href="/swap?mode=reduce-risk"
                  className="block w-full py-3 rounded-xl bg-orange-500 text-black text-sm font-medium text-center"
                >
                  Reduce Risk Exposure
                </a>
              </div>
            )}
          </>
        )}
      </main>
    </AppShell>
  )
}
