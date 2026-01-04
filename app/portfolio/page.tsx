'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { AppShell } from '@/components/AppShell'
import { PortfolioSecurityHero } from '@/components/PortfolioSecurityHero'
import { ReviewSuggestedNavigator } from '@/components/ReviewSuggestedNavigator'
import { AirdropBanner, AirdropShareBanner } from '@/components/AirdropBanner'
import { ConnectFallback } from '@/components/ConnectFallback'
import { ProfileCard } from '@/components/ProfileCard'
import { 
  QuickStats, 
  PerformanceChart, 
  HoldingsTable, 
  PortfolioTabs, 
  AllocationCard,
  BarChart,
  PieChart
} from '@/components/portfolio'
import { calculateHealthScore, scoreStatus, scoreSubtitle, categorizeToken, Asset } from '@/lib/scoreEngine'
import { reviewRoutes } from '@/lib/reviewRoutes'
import { Share2 } from 'lucide-react'

interface TokenData {
  symbol: string
  balance: number
  valueUSD: number
}

interface PortfolioData {
  tokens: TokenData[]
  totalValueUSD: number
}

function formatUSD(value: number): string {
  if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M'
  if (value >= 1000) return '$' + (value / 1000).toFixed(2) + 'K'
  if (value >= 1) return '$' + value.toFixed(2)
  return '$' + value.toFixed(2)
}

function generateChartData(): number[] {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 50) + 30)
}

function generateBarData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map(month => ({
    month,
    value: Math.floor(Math.random() * 40) + 10
  }))
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount()
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')
  const [userXP, setUserXP] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const endpoint = address
          ? '/api/healthscore?address=' + address
          : '/api/healthscore?address=demo'
        const res = await fetch(endpoint)
        if (res.ok) {
          setData(await res.json())
        }
      } catch (e) {
        console.error('Failed to fetch portfolio:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [address])

  // Fetch XP from localStorage or API
  useEffect(() => {
    const storedXP = localStorage.getItem('user_xp')
    if (storedXP) {
      setUserXP(parseInt(storedXP, 10))
    } else {
      // Default XP based on activity
      const txCount = parseInt(localStorage.getItem('swap_tx_count') || '0', 10)
      const copyTrades = localStorage.getItem('copy_traded') ? 1 : 0
      setUserXP(txCount * 10 + copyTrades * 100)
    }
  }, [])


  const scoreData = useMemo(() => {
    if (!data?.tokens) return null

    const assets: Asset[] = data.tokens.map(t => {
      const { category, risk } = categorizeToken(t.symbol)
      return {
        symbol: t.symbol,
        usdValue: t.valueUSD,
        category,
        risk
      }
    })

    return calculateHealthScore(assets)
  }, [data])

  const score = scoreData?.score ?? 0
  const status = scoreStatus(score)
  const subtitle = scoreSubtitle(score)
  const routes = useMemo(() => {
    if (!scoreData || score >= 50) return []
    return reviewRoutes(scoreData.breakdown)
  }, [scoreData, score])

  const stats = useMemo(() => {
    if (!data) return { growth: '+0%', trades: 0, profit: '$0', holdings: 0 }
    const growth = '+24%'
    const trades = Math.floor(data.tokens.length * 3)
    const profit = formatUSD(data.totalValueUSD * 0.24)
    const holdings = data.tokens.length
    return { growth, trades, profit, holdings }
  }, [data])

  const allocations = useMemo(() => {
    if (!data?.tokens) return []
    const colors = ['#2dd4bf', '#60a5fa', '#a78bfa', '#facc15', '#f87171', '#34d399']
    return data.tokens.slice(0, 6).map((t, i) => ({
      name: t.symbol,
      color: colors[i % colors.length],
      percent: Math.round((t.valueUSD / data.totalValueUSD) * 100)
    }))
  }, [data])

  const pieData = useMemo(() => {
    if (!data?.tokens) return []
    return data.tokens.slice(0, 5).map(t => ({
      x: t.symbol,
      y: Math.round((t.valueUSD / data.totalValueUSD) * 100)
    }))
  }, [data])

  const holdings = useMemo(() => {
    if (!data?.tokens) return []
    return data.tokens.map(t => ({
      symbol: t.symbol,
      name: t.symbol,
      amount: t.balance < 0.0001 ? t.balance.toExponential(2) : t.balance.toFixed(4),
      value: t.valueUSD.toFixed(2),
      percent: Math.round((t.valueUSD / data.totalValueUSD) * 100),
      change24h: (Math.random() - 0.3) * 10
    }))
  }, [data])

  const handleShare = useCallback(() => {
    if (!data) return
    const text = 'My wallet health score is ' + score + '/100 (' + status + ')\n\nCheck your wallet health'
    const url = 'https://base-social-trade.vercel.app/portfolio'
    window.open('https://warpcast.com/~/compose?text=' + encodeURIComponent(text) + '&embeds[]=' + encodeURIComponent(url), '_blank')
  }, [data, score, status])

  if (!isConnected && !loading) {
    return (
      <AppShell>
        <main className="px-4 pt-20 text-center">
          <p className="text-sm text-zinc-400">
            Connect your wallet to view portfolio health
          </p>
          <ConnectFallback />
        </main>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <main className="bg-[#05060A] pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Profile Card with Farcaster */}
            <ProfileCard showFullCard={true} />

            {/* Hero Section */}
            <PortfolioSecurityHero
              score={score}
              status={status}
              subtitle={'Total portfolio value ' + formatUSD(data.totalValueUSD)}
            />

            {/* Quick Stats */}
            <QuickStats 
              growth={stats.growth}
              trades={stats.trades}
              totalValue={formatUSD(data.totalValueUSD)}
              holdings={stats.holdings}
            />

            {/* Review Navigator - show when score < 60 */}
            {score < 60 && (
              <ReviewSuggestedNavigator 
                routes={routes} 
                score={score}
                assets={data.tokens.map(t => ({
                  symbol: t.symbol,
                  percent: Math.round((t.valueUSD / data.totalValueUSD) * 100),
                  value: t.valueUSD
                }))}
              />
            )}

            {/* Tabs */}
            <PortfolioTabs
              tabs={['Overview', 'Holdings', 'Charts', 'Activity']}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            {activeTab === 'Overview' && (
              <>
                <div className="px-4">
                  <PerformanceChart 
                    data={generateChartData()}
                    title="Monthly Performance"
                    period="Last 12 Months"
                  />
                </div>

                <div className="px-4">
                  <AllocationCard
                    totalValue={formatUSD(data.totalValueUSD)}
                    allocations={allocations}
                  />
                </div>

                <div className="px-4">
                  <AirdropShareBanner xp={userXP} />
                </div>

                <div className="px-4">
                  <div className="relative rounded-xl p-4 bg-gradient-to-b from-[#0E1F24] to-[#071317] border border-white/10">
                    <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.08),transparent_60%)] pointer-events-none" />
                    
                    <div className="relative space-y-4">
                      <p className="text-xs text-zinc-400">Health Breakdown</p>
                      
                      {[
                        { label: 'Diversification', v: scoreData?.breakdown.diversification ?? 0, m: 30 },
                        { label: 'Stablecoin Ratio', v: scoreData?.breakdown.stableScore ?? 0, m: 25 },
                        { label: 'DeFi Score', v: scoreData?.breakdown.defiScore ?? 0, m: 15 },
                        { label: 'Concentration', v: scoreData?.breakdown.concentrationScore ?? 0, m: 20 }
                      ].map(r => (
                        <div key={r.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-400">{r.label}</span>
                            <span className="text-zinc-500">{r.v}/{r.m}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal-400/80 to-teal-500/80 transition-all duration-500"
                              style={{ width: (r.v / r.m) * 100 + '%' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'Holdings' && (
              <HoldingsTable holdings={holdings} />
            )}

            {activeTab === 'Charts' && (
              <div className="space-y-6">
                <div className="px-4">
                  <BarChart 
                    data={generateBarData()}
                    title="Monthly Breakdown"
                  />
                </div>

                <div className="px-4">
                  <PieChart 
                    data={pieData}
                    title="Asset Allocation"
                    totalValue={formatUSD(data.totalValueUSD)}
                  />
                </div>
              </div>
            )}

            {activeTab === 'Activity' && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-zinc-400">No recent activity</p>
                <p className="text-xs text-zinc-500 mt-1">Your transactions will appear here</p>
              </div>
            )}

            {/* Share Button */}
            <div className="px-4">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-zinc-400 hover:text-zinc-300 transition-all duration-200"
              >
                <Share2 size={16} />
                Share on Farcaster - Earn 25 XP
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            Failed to load portfolio
          </div>
        )}
      </main>
    </AppShell>
  )
}





