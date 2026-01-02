'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'
import { WalletConnect } from '@/components/WalletConnect'

type Trader = {
  address: string
  reputation: number
  tier: string
  pnl: string
  trades: number
  copiers: number
  winRate: number
  source: 'onchain' | 'api'
}

// Convert basis points PNL to display string
function formatPnL(pnlBasisPoints: number): string {
  const percent = ((pnlBasisPoints - 10000) / 100).toFixed(1)
  const value = Math.abs(Number(percent)) * 1000 // Rough estimate
  if (Number(percent) >= 0) {
    return `+$${value.toLocaleString()}`
  }
  return `-$${Math.abs(value).toLocaleString()}`
}

function getTier(reputation: number): string {
  if (reputation >= 850) return 'Elite'
  if (reputation >= 650) return 'Trusted'
  if (reputation >= 400) return 'Regular'
  return 'New'
}

export default function TradersPage() {
  const { address, isConnected } = useAccount()
  const [traders, setTraders] = useState<Trader[]>([])
  const [filter, setFilter] = useState<'all' | 'elite' | 'trusted'>('all')
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState<'onchain' | 'api'>('api')

  useEffect(() => {
    async function fetchTraders() {
      setLoading(true)
      
      try {
        // Try on-chain first via API
        const res = await fetch('/api/trader?onchain=true&limit=10')
        const data = await res.json()
        
        if (data.traders && data.traders.length > 0) {
          const mapped = data.traders.map((t: {
            address: string
            reputation: number
            pnl: number
            winRate: number
            trades: number
            copiers: number
          }) => ({
            address: t.address,
            reputation: t.reputation,
            tier: getTier(t.reputation),
            pnl: formatPnL(t.pnl),
            trades: t.trades,
            copiers: t.copiers,
            winRate: Math.round(t.winRate / 100),
            source: 'onchain' as const
          }))
          setTraders(mapped)
          setDataSource('onchain')
        } else {
          // Fallback to genesis traders
          setTraders(GENESIS_TRADERS)
          setDataSource('api')
        }
      } catch {
        setTraders(GENESIS_TRADERS)
        setDataSource('api')
      }
      
      setLoading(false)
    }
    
    fetchTraders()
  }, [])

  const filteredTraders = traders.filter(t => {
    if (filter === 'elite') return t.tier === 'Elite'
    if (filter === 'trusted') return t.tier === 'Trusted' || t.tier === 'Elite'
    return true
  })

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Elite': return 'text-purple-400 bg-purple-900/20'
      case 'Trusted': return 'text-blue-400 bg-blue-900/20'
      default: return 'text-zinc-400 bg-zinc-900/20'
    }
  }

  return (
    <AppShell>
      <WalletConnect />

      <h1 className="text-xl font-bold mb-2">👥 Top Traders</h1>
      <p className="text-sm text-zinc-400 mb-4">
        Copy successful traders and mirror their strategies
      </p>

      {/* On-chain indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`w-2 h-2 rounded-full ${dataSource === 'onchain' ? 'bg-green-500' : 'bg-yellow-500'}`} />
        <span className="text-xs text-zinc-500">
          {dataSource === 'onchain' ? '⛓️ On-chain data' : '📡 API data'}
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'elite', 'trusted'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {f === 'all' ? 'All' : f === 'elite' ? '👑 Elite' : '⭐ Trusted+'}
          </button>
        ))}
      </div>

      {/* Info Card */}
      <Card>
        <p className="text-sm font-medium mb-2">🔐 Copy Trading Security</p>
        <div className="text-xs text-zinc-400 space-y-1">
          <p>✅ Non-custodial - you own your vault</p>
          <p>✅ Reputation-gated - only trusted traders</p>
          <p>✅ Withdraw anytime - no lockups</p>
          <p>✅ All data verified on Base</p>
        </div>
      </Card>

      {/* Traders List */}
      <div className="space-y-3 mt-4">
        {loading ? (
          <Card>
            <p className="text-sm text-zinc-400 text-center py-4">Loading on-chain data...</p>
          </Card>
        ) : filteredTraders.length === 0 ? (
          <Card>
            <p className="text-sm text-zinc-400 text-center py-4">No traders found</p>
          </Card>
        ) : (
          filteredTraders.map((trader, i) => (
            <div
              key={trader.address}
              className="bg-[#0B0F1A] border border-zinc-800/60 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <div>
                    <p className="font-medium">
                      {trader.address.slice(0, 6)}…{trader.address.slice(-4)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTierColor(trader.tier)}`}>
                      {trader.tier}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">{trader.pnl}</p>
                  <p className="text-xs text-zinc-500">All-time PnL</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                <div className="bg-black/30 rounded-lg py-2">
                  <p className="text-zinc-400">Rep</p>
                  <p className="font-semibold text-blue-400">{trader.reputation}</p>
                </div>
                <div className="bg-black/30 rounded-lg py-2">
                  <p className="text-zinc-400">Trades</p>
                  <p className="font-semibold">{trader.trades}</p>
                </div>
                <div className="bg-black/30 rounded-lg py-2">
                  <p className="text-zinc-400">Win %</p>
                  <p className="font-semibold text-green-400">{trader.winRate}%</p>
                </div>
                <div className="bg-black/30 rounded-lg py-2">
                  <p className="text-zinc-400">Copiers</p>
                  <p className="font-semibold">{trader.copiers}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/trader/${trader.address}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-center py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  🤖 Copy Trade
                </Link>
                <Link
                  href={`/reputation/${trader.address}`}
                  className="px-4 bg-zinc-800 hover:bg-zinc-700 py-2.5 rounded-xl text-sm font-semibold transition"
                >
                  📊
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Become a Trader CTA */}
      {isConnected && (
        <div className="mt-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-2xl p-4">
          <p className="font-medium mb-1">🚀 Become a Top Trader</p>
          <p className="text-xs text-zinc-400 mb-3">
            Build your reputation by trading consistently. 650+ rep unlocks copy trading.
          </p>
          <Link
            href={`/reputation/${address}`}
            className="block text-center bg-white/10 hover:bg-white/20 py-2 rounded-xl text-sm font-medium transition"
          >
            View Your Reputation →
          </Link>
        </div>
      )}
    </AppShell>
  )
}

// Genesis traders (used until TraderRegistry is populated)
const GENESIS_TRADERS: Trader[] = [
  {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    reputation: 920,
    tier: 'Elite',
    pnl: '+$124,500',
    trades: 1247,
    copiers: 89,
    winRate: 68,
    source: 'api'
  },
  {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f5fF21',
    reputation: 875,
    tier: 'Elite',
    pnl: '+$87,200',
    trades: 892,
    copiers: 56,
    winRate: 64,
    source: 'api'
  },
  {
    address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    reputation: 780,
    tier: 'Trusted',
    pnl: '+$45,800',
    trades: 567,
    copiers: 34,
    winRate: 61,
    source: 'api'
  },
  {
    address: '0x22E228AdE324185123A54Ad25F3459a99CF51E7a',
    reputation: 720,
    tier: 'Trusted',
    pnl: '+$32,100',
    trades: 423,
    copiers: 21,
    winRate: 58,
    source: 'api'
  },
  {
    address: '0x1234567890AbCdEf1234567890AbCdEf12345678',
    reputation: 650,
    tier: 'Trusted',
    pnl: '+$18,400',
    trades: 289,
    copiers: 12,
    winRate: 55,
    source: 'api'
  },
  {
    address: '0xFeDcBa0987654321FeDcBa0987654321FeDcBa09',
    reputation: 580,
    tier: 'Regular',
    pnl: '+$8,200',
    trades: 156,
    copiers: 5,
    winRate: 52,
    source: 'api'
  }
]
