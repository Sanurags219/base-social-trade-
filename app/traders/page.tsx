'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { CopyTraderCard } from '@/components/CopyTraderCard'
import { useTaskTracking } from '@/hooks/useTaskTracking'
import { Search, TrendingUp, Shield, Users, Flame } from 'lucide-react'

type Trader = {
  address: string
  name: string
  reputation: number
  tier: string
  pnl: string
  trades: number
  copiers: number
  winRate: number
  roi: number
  strategy: string
  chartData: number[]
  source: 'onchain' | 'api'
}

const FILTERS = [
  { id: 'roi', label: 'Top ROI', icon: TrendingUp },
  { id: 'safe', label: 'Low Risk', icon: Shield },
  { id: 'popular', label: 'Most Copied', icon: Users },
  { id: 'trending', label: 'Trending', icon: Flame },
]

function getTier(reputation: number): string {
  if (reputation >= 850) return 'Elite'
  if (reputation >= 650) return 'Trusted'
  if (reputation >= 400) return 'Regular'
  return 'New'
}

function generateChartData(positive: boolean): number[] {
  const base = positive ? 20 : 30
  const trend = positive ? 2 : -1.5
  return Array.from({ length: 10 }, (_, i) => 
    Math.max(5, base + trend * i + (Math.random() - 0.5) * 10)
  )
}

// Genesis traders with premium data
const GENESIS_TRADERS: Trader[] = [
  {
    address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    name: 'Tony_Bro',
    reputation: 920,
    tier: 'Elite',
    pnl: '+$124,500',
    trades: 1247,
    copiers: 4057,
    winRate: 86,
    roi: 229.35,
    strategy: 'Perpetual Futures',
    chartData: generateChartData(true),
    source: 'api'
  },
  {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f5fF21',
    name: 'CRYPTOBOX',
    reputation: 875,
    tier: 'Elite',
    pnl: '+$87,200',
    trades: 892,
    copiers: 28111,
    winRate: 75,
    roi: 10.11,
    strategy: 'Spot Trading',
    chartData: generateChartData(true),
    source: 'api'
  },
  {
    address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    name: 'BaseWhale',
    reputation: 780,
    tier: 'Trusted',
    pnl: '+$45,800',
    trades: 567,
    copiers: 1892,
    winRate: 79,
    roi: 156.78,
    strategy: 'DeFi Yield',
    chartData: generateChartData(true),
    source: 'api'
  },
  {
    address: '0x22E228AdE324185123A54Ad25F3459a99CF51E7a',
    name: 'AlphaSeeker',
    reputation: 720,
    tier: 'Trusted',
    pnl: '+$32,100',
    trades: 423,
    copiers: 892,
    winRate: 72,
    roi: 45.23,
    strategy: 'Momentum',
    chartData: generateChartData(true),
    source: 'api'
  },
  {
    address: '0x1234567890AbCdEf1234567890AbCdEf12345678',
    name: 'SteadyHands',
    reputation: 650,
    tier: 'Trusted',
    pnl: '+$18,400',
    trades: 289,
    copiers: 342,
    winRate: 68,
    roi: 28.45,
    strategy: 'Value Picks',
    chartData: generateChartData(true),
    source: 'api'
  },
  {
    address: '0xFeDcBa0987654321FeDcBa0987654321FeDcBa09',
    name: 'RiskTaker',
    reputation: 520,
    tier: 'Regular',
    pnl: '-$2,100',
    trades: 156,
    copiers: 45,
    winRate: 52,
    roi: -5.23,
    strategy: 'High Risk',
    chartData: generateChartData(false),
    source: 'api'
  }
]

export default function TradersPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const [activeFilter, setActiveFilter] = useState('roi')
  const [traders, setTraders] = useState<Trader[]>(GENESIS_TRADERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  // Track page visit for XP task
  useTaskTracking()

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  // Filter and sort traders
  useEffect(() => {
    let filtered = [...GENESIS_TRADERS]
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    switch (activeFilter) {
      case 'roi':
        filtered.sort((a, b) => b.roi - a.roi)
        break
      case 'safe':
        filtered.sort((a, b) => b.winRate - a.winRate)
        break
      case 'popular':
        filtered.sort((a, b) => b.copiers - a.copiers)
        break
      case 'trending':
        filtered.sort((a, b) => b.reputation - a.reputation)
        break
    }

    setTraders(filtered)
  }, [activeFilter, searchQuery])

  const handleCopyTrader = (address: string) => {
    router.push('/trader/' + address)
  }

  return (
    <AppShell>
      {/* Hero Section */}
      <section className="
        relative rounded-2xl p-5 mb-6
        bg-gradient-to-r from-teal-500/20 to-blue-500/20
        border border-white/10
        overflow-hidden
      ">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.2),transparent_50%)]" />
        
        <div className="relative">
          <h1 className="text-xl font-semibold text-white">
            Copy Elite Traders
          </h1>
          <p className="text-[13px] text-zinc-300 mt-1">
            Performance-ranked traders on Base
          </p>
          
          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-[11px] text-zinc-400">Total Traders</p>
              <p className="text-lg font-bold text-white">2,847</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400">Total Copied</p>
              <p className="text-lg font-bold text-teal-400">$12.4M</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search traders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="
            w-full pl-10 pr-4 py-3 rounded-xl
            bg-[#0e1f24] border border-white/5
            text-[14px] text-white placeholder-zinc-500
            focus:outline-none focus:border-teal-500/50
            transition-colors
          "
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {FILTERS.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all duration-200 ' +
              (activeFilter === filter.id 
                ? 'bg-teal-400/20 text-teal-300 border border-teal-400/30' 
                : 'bg-white/5 text-zinc-400 border border-transparent hover:bg-white/10')
            }
          >
            <filter.icon size={12} />
            {filter.label}
          </button>
        ))}
      </div>

      {/* Security Badge */}
      <div className="
        relative rounded-xl p-3 mb-4
        bg-gradient-to-b from-[#0e1f24] to-[#071317]
        border border-white/5
      ">
        <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.1),transparent_60%)]" />
        <div className="relative flex items-center gap-2 text-[11px] text-zinc-400">
          <Shield size={14} className="text-teal-400" />
          <span>Non-custodial vaults</span>
          <span className="mx-1">|</span>
          <span>650+ rep required</span>
          <span className="mx-1">|</span>
          <span>Withdraw anytime</span>
        </div>
      </div>

      {/* Trader Cards */}
      <div className="grid gap-4 pb-24">
        {loading ? (
          <div className="
            relative rounded-2xl p-8
            bg-gradient-to-b from-[#0e1f24] to-[#071317]
            border border-white/5
            text-center
          ">
            <p className="text-zinc-400 text-sm">Loading traders...</p>
          </div>
        ) : traders.length === 0 ? (
          <div className="
            relative rounded-2xl p-8
            bg-gradient-to-b from-[#0e1f24] to-[#071317]
            border border-white/5
            text-center
          ">
            <p className="text-zinc-400 text-sm">No traders found</p>
          </div>
        ) : (
          traders.map((trader) => (
            <CopyTraderCard
              key={trader.address}
              name={trader.name}
              address={trader.address}
              roi={trader.roi}
              pnl={trader.pnl}
              copiers={trader.copiers}
              winRate={trader.winRate}
              strategy={trader.strategy}
              chartData={trader.chartData}
              onCopy={() => handleCopyTrader(trader.address)}
            />
          ))
        )}
      </div>

      {/* Become a Trader CTA */}
      {isConnected && (
        <div className="
          fixed bottom-20 left-4 right-4 max-w-md mx-auto
          rounded-2xl p-4
          bg-gradient-to-b from-[#0e1f24] to-[#071317]
          border border-white/10
          shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.8)]
        ">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold">Want to be copied?</p>
              <p className="text-[11px] text-zinc-400">Build 650+ reputation</p>
            </div>
            <Link
              href={'/reputation/' + address}
              className="
                px-4 py-2 rounded-full text-[13px] font-medium
                bg-teal-400/20 text-teal-300
                border border-teal-400/30
                hover:bg-teal-400/30
                transition-all duration-200
              "
            >
              View Rep
            </Link>
          </div>
        </div>
      )}
    </AppShell>
  )
}