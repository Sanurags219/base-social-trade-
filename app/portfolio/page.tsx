'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'
import { WalletConnect } from '@/components/WalletConnect'
import { HealthBreakdown } from '@/components/HealthBreakdown'

interface TokenData {
  symbol: string
  balance: number
  valueUSD: number
  type: string
}

interface HealthData {
  score: number
  status: string
  breakdown: {
    diversification: number
    stableRatio: number
    riskExposure: number
    concentration: number
  }
  tips?: string[]
}

interface PortfolioData {
  address: string
  tokens: TokenData[]
  totalValueUSD: number
  nfts: { count: number; valueUSD: number }
  lps: { count: number; valueUSD: number }
  health: HealthData
}

// Health Score Ring Component - Smaller, supporting role
function HealthScoreRing({ score, size = 96 }: { score: number; size?: number }) {
  const radius = (size / 2) - 6
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  
  const getColor = () => {
    if (score >= 80) return '#22c55e' // Green - Healthy
    if (score >= 50) return '#eab308' // Yellow - Needs Attention
    return '#f97316' // Orange - High Risk (no red)
  }
  
  const color = getColor()
  
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth="6"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold">{score}</span>
      </div>
    </div>
  )
}

// Token Icon Helper
function TokenIcon({ symbol, type }: { symbol: string; type: string }) {
  if (symbol === 'ETH' || symbol === 'WETH') return <span>⟠</span>
  if (symbol === 'cbETH') return <span>🔵</span>
  if (type === 'stable') return <span>💵</span>
  return <span>🪙</span>
}

// Format USD
function formatUSD(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
  if (value >= 1000) return `$${(value / 1000).toFixed(2)}K`
  if (value >= 1) return `$${value.toFixed(2)}`
  return `$${value.toFixed(4)}`
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount()
  const [data, setData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(false)
  const [xpToast, setXpToast] = useState<{ show: boolean; xp: number; message: string }>({ show: false, xp: 0, message: '' })
  const [shareLoading, setShareLoading] = useState(false)
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const endpoint = address 
          ? `/api/healthscore?address=${address}`
          : '/api/healthscore?address=demo'
        const res = await fetch(endpoint)
        if (res.ok) {
          const result = await res.json()
          setData(result)
        }
      } catch (e) {
        console.error('Failed to fetch portfolio:', e)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [address])
  
  const handleShare = useCallback(async () => {
    if (!data) return
    
    setShareLoading(true)
    
    const text = `My wallet health score is ${data.health.score}/100 (${data.health.status}) 💪\n\nCheck your wallet health 👇`
    const url = 'https://base-social-trade.vercel.app/portfolio'
    
    // Farcaster share
    const farcasterUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`
    window.open(farcasterUrl, '_blank')
    
    // Award XP for sharing
    try {
      const res = await fetch('/api/xp/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: address || 'anonymous',
          type: 'health'
        }),
      })
      
      const result = await res.json()
      
      if (result.success) {
        setXpToast({ show: true, xp: result.xp, message: result.message })
        setTimeout(() => setXpToast({ show: false, xp: 0, message: '' }), 3000)
      } else if (result.error) {
        setXpToast({ show: true, xp: 0, message: result.error })
        setTimeout(() => setXpToast({ show: false, xp: 0, message: '' }), 3000)
      }
    } catch (e) {
      console.error('Failed to award XP:', e)
    } finally {
      setShareLoading(false)
    }
  }, [data, address])
  
  const getStatusColor = (status: string) => {
    if (status === 'Healthy') return 'text-green-400 bg-green-500/10'
    if (status === 'Good') return 'text-green-400 bg-green-500/10'
    if (status === 'Moderate') return 'text-yellow-400 bg-yellow-500/10'
    if (status === 'At Risk') return 'text-orange-400 bg-orange-500/10'
    return 'text-orange-400 bg-orange-500/10'
  }

  const getStatusLabel = (status: string) => {
    if (status === 'At Risk') return 'Needs Attention'
    if (status === 'Critical') return 'High Risk'
    return status
  }
  
  return (
    <AppShell>
      <WalletConnect />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Portfolio</h1>
        {!isConnected && (
          <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">
            Demo Mode
          </span>
        )}
      </div>
      
      {loading ? (
        <Card>
          <div className="text-center py-12">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">Analyzing wallet...</p>
          </div>
        </Card>
      ) : data ? (
        <>
          {/* Main Health Card - Restructured: Value → Status → Score */}
          <Card>
            {/* Total Portfolio Value - Primary */}
            <p className="text-xs text-zinc-400">Total Portfolio Value</p>
            <div className="text-3xl font-semibold mt-1">
              {formatUSD(data.totalValueUSD)}
            </div>
            
            {/* Health Status + Score - Supporting */}
            <div className="flex items-center gap-2 mt-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(data.health.status)}`}>
                {getStatusLabel(data.health.status)}
              </span>
              <span className="text-xs text-zinc-500">
                Health score: {data.health.score} / 100
              </span>
            </div>
            
            {/* Score Breakdown - Native details element */}
            <details className="mt-4 border-t border-zinc-800 pt-3">
              <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-300 transition">
                View score breakdown
              </summary>
              
              <div className="flex justify-center mt-4">
                <HealthScoreRing score={data.health.score} size={96} />
              </div>
              
              <HealthBreakdown
                items={[
                  { label: 'Diversification', value: data.health.breakdown.diversification, max: 30 },
                  { label: 'Stablecoin Ratio', value: data.health.breakdown.stableRatio, max: 25 },
                  { label: 'Risk Exposure', value: data.health.breakdown.riskExposure, max: 25 },
                  { label: 'Asset Concentration', value: data.health.breakdown.concentration, max: 20 }
                ]}
              />
            </details>
          </Card>
          
          {/* Tokens - Cleaner list with breathing room */}
          <Card className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-zinc-300">Tokens</h3>
              <span className="text-xs text-zinc-500">{data.tokens.length} assets</span>
            </div>
            
            {data.tokens.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">No tokens found</p>
            ) : (
              <div className="space-y-3">
                {data.tokens.map((token, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-lg">
                        <TokenIcon symbol={token.symbol} type={token.type} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{token.symbol}</p>
                        <p className="text-xs text-zinc-500">
                          {token.balance < 0.0001 
                            ? token.balance.toExponential(2) 
                            : token.balance.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatUSD(token.valueUSD)}</p>
                      <p className="text-xs text-zinc-500">
                        {((token.valueUSD / data.totalValueUSD) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          {/* NFTs */}
          <Card className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-300">NFTs</h3>
              <span className="text-xs text-zinc-500">{data.nfts.count} items</span>
            </div>
            {data.nfts.count > 0 ? (
              <p className="text-xs text-zinc-400 mt-2">
                Floor value: {formatUSD(data.nfts.valueUSD)}
              </p>
            ) : (
              <p className="text-xs text-zinc-600 mt-2">Coming soon</p>
            )}
          </Card>
          
          {/* LP Positions */}
          <Card className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-300">LP Positions</h3>
              <span className="text-xs text-zinc-500">{data.lps.count} positions</span>
            </div>
            {data.lps.count > 0 ? (
              <p className="text-sm text-zinc-400 mt-2">
                Total value: {formatUSD(data.lps.valueUSD)}
              </p>
            ) : (
              <p className="text-xs text-zinc-600 mt-2">Coming soon</p>
            )}
          </Card>
          
          {/* Share Button */}
          <div className="mt-6 text-center">
            <button
              onClick={handleShare}
              disabled={shareLoading}
              className="bg-[#0052FF] hover:bg-[#0047E1] disabled:opacity-50 text-white text-sm font-medium px-8 py-3 rounded-[14px] transition-all active:scale-[0.98]"
            >
              {shareLoading ? 'Sharing...' : 'Share My Score'}
            </button>
            <p className="text-xs text-zinc-500 mt-2">
              Share on Farcaster • Earn 25 XP
            </p>
          </div>
          
          {/* XP Toast */}
          {xpToast.show && (
            <div className={`fixed top-4 left-1/2 -translate-x-1/2 ${xpToast.xp > 0 ? 'bg-green-600' : 'bg-zinc-700'} text-white px-4 py-2 rounded-xl shadow-lg animate-bounce z-50`}>
              <span className="font-bold">{xpToast.message}</span>
            </div>
          )}
          
          {/* Tips from Health Analysis */}
          {data.health.tips && data.health.tips.length > 0 && (
            <div className="mt-6 p-4 bg-white/[0.03] rounded-xl border border-white/5">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <span>💡</span>
                {data.health.score >= 75 ? 'Portfolio Insights' : 'Improve Your Score'}
              </h4>
              <ul className="text-xs text-zinc-400 space-y-1.5">
                {data.health.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-zinc-500">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-zinc-400">Failed to load portfolio</p>
          </div>
        </Card>
      )}
    </AppShell>
  )
}
