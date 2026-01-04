'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { AppShell } from '@/components/AppShell'
import { WalletConnect } from '@/components/WalletConnect'

interface TokenData {
  symbol: string
  balance: number
  valueUSD: number
}

export default function ConcentrationPage() {
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

  const total = tokens.reduce((s, t) => s + t.valueUSD, 0)
  const sorted = [...tokens].sort((a, b) => b.valueUSD - a.valueUSD)
  const largest = sorted[0]
  const largestPercent = total > 0 && largest ? ((largest.valueUSD / total) * 100).toFixed(1) : '0'
  const isConcentrated = Number(largestPercent) > 60

  return (
    <AppShell>
      <WalletConnect />

      <main className="pb-24">
        <h1 className="text-lg font-semibold">Concentration</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Largest positions in your portfolio
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className={`mt-4 p-4 rounded-2xl ${isConcentrated ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
              <p className="text-xs text-zinc-400">Largest position</p>
              <p className={`text-2xl font-semibold mt-1 ${isConcentrated ? 'text-yellow-400' : 'text-green-400'}`}>
                {largestPercent}%
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {largest?.symbol || 'N/A'} • ${largest?.valueUSD.toFixed(2) || '0'}
              </p>
            </div>

            {/* All Assets Sorted */}
            <div className="mt-6 space-y-3">
              {sorted.map((t, i) => {
                const percent = total > 0 ? ((t.valueUSD / total) * 100) : 0
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/[0.04]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                          {t.symbol.slice(0, 2)}
                        </div>
                        <p className="text-sm font-medium">{t.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{percent.toFixed(1)}%</p>
                        <p className="text-xs text-zinc-500">${t.valueUSD.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percent > 60 ? 'bg-yellow-500' : percent > 40 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Action */}
            {isConcentrated && (
              <div className="mt-6">
                <a
                  href="/swap?mode=rebalance"
                  className="block w-full py-3 rounded-xl bg-yellow-500 text-black text-sm font-medium text-center"
                >
                  Rebalance Portfolio
                </a>
              </div>
            )}
          </>
        )}
      </main>
    </AppShell>
  )
}
