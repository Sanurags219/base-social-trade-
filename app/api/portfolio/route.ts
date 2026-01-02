import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, formatEther, formatUnits } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

// Known tokens on Base
const TOKENS = [
  { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, type: 'stable' },
  { symbol: 'USDbC', address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', decimals: 6, type: 'stable' },
  { symbol: 'DAI', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18, type: 'stable' },
  { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18, type: 'blue-chip' },
  { symbol: 'cbETH', address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', decimals: 18, type: 'blue-chip' },
  { symbol: 'AERO', address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', decimals: 18, type: 'defi' },
  { symbol: 'BSTN', address: '0x52B11d41a013CdcFEF71231aF61D7b8DDCf757F2', decimals: 18, type: 'defi' },
]

// Prices (in production, fetch from CoinGecko/DeFiLlama)
const PRICES: Record<string, number> = {
  ETH: 2400,
  WETH: 2400,
  cbETH: 2500,
  USDC: 1,
  USDbC: 1,
  DAI: 1,
  AERO: 1.2,
  BSTN: 0.01,
}

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

interface TokenBalance {
  symbol: string
  balance: string
  balanceUSD: number
  type: string
  percentage?: number
}

function calculateHealthScore(tokens: TokenBalance[], totalValue: number): {
  score: number
  status: string
  breakdown: {
    diversification: number
    stablecoinRatio: number
    riskExposure: number
    concentration: number
  }
} {
  if (totalValue === 0) {
    return {
      score: 50,
      status: 'New Wallet',
      breakdown: { diversification: 0, stablecoinRatio: 0, riskExposure: 0, concentration: 0 }
    }
  }

  const nonZeroTokens = tokens.filter(t => t.balanceUSD > 0)
  
  // 1. Diversification (30 points)
  // More assets = better, optimal is 5+
  let diversification = Math.min(nonZeroTokens.length * 6, 30)
  
  // 2. Stablecoin Ratio (25 points)
  // 20-40% stables is optimal
  const stableValue = tokens
    .filter(t => t.type === 'stable')
    .reduce((sum, t) => sum + t.balanceUSD, 0)
  const stableRatio = stableValue / totalValue
  
  let stablecoinRatio = 0
  if (stableRatio >= 0.2 && stableRatio <= 0.4) {
    stablecoinRatio = 25 // Optimal
  } else if (stableRatio >= 0.1 && stableRatio <= 0.5) {
    stablecoinRatio = 20 // Good
  } else if (stableRatio > 0.5 && stableRatio <= 0.7) {
    stablecoinRatio = 15 // Too conservative
  } else if (stableRatio > 0.7) {
    stablecoinRatio = 10 // Very conservative
  } else if (stableRatio < 0.1 && stableRatio > 0) {
    stablecoinRatio = 12 // Too risky
  } else {
    stablecoinRatio = 5 // No stables
  }
  
  // 3. Risk Exposure (25 points)
  // Blue-chip ratio - higher is safer
  const blueChipValue = tokens
    .filter(t => t.type === 'blue-chip' || t.type === 'stable')
    .reduce((sum, t) => sum + t.balanceUSD, 0)
  const safeRatio = blueChipValue / totalValue
  
  let riskExposure = Math.round(safeRatio * 25)
  
  // 4. Concentration (20 points)
  // Largest position shouldn't exceed 60%
  const largestPosition = Math.max(...tokens.map(t => t.balanceUSD))
  const concentrationRatio = largestPosition / totalValue
  
  let concentration = 20
  if (concentrationRatio > 0.8) {
    concentration = 5
  } else if (concentrationRatio > 0.6) {
    concentration = 10
  } else if (concentrationRatio > 0.4) {
    concentration = 15
  }
  
  const score = Math.round(diversification + stablecoinRatio + riskExposure + concentration)
  
  let status = 'Critical'
  if (score >= 80) status = 'Excellent'
  else if (score >= 65) status = 'Healthy'
  else if (score >= 50) status = 'Moderate'
  else if (score >= 35) status = 'At Risk'
  
  return {
    score,
    status,
    breakdown: {
      diversification,
      stablecoinRatio,
      riskExposure,
      concentration,
    }
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  
  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }
  
  try {
    // Fetch ETH balance
    const ethBalance = await client.getBalance({ address: address as `0x${string}` })
    const ethFormatted = formatEther(ethBalance)
    const ethUSD = Number(ethFormatted) * PRICES.ETH
    
    const tokens: TokenBalance[] = [
      {
        symbol: 'ETH',
        balance: Number(ethFormatted).toFixed(4),
        balanceUSD: ethUSD,
        type: 'blue-chip',
      }
    ]
    
    // Fetch ERC-20 balances
    const balancePromises = TOKENS.map(async (token) => {
      try {
        const balance = await client.readContract({
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`],
        })
        
        const formatted = formatUnits(balance, token.decimals)
        const usdValue = Number(formatted) * (PRICES[token.symbol] || 0)
        
        return {
          symbol: token.symbol,
          balance: Number(formatted).toFixed(4),
          balanceUSD: usdValue,
          type: token.type,
        }
      } catch {
        return null
      }
    })
    
    const tokenResults = await Promise.all(balancePromises)
    tokens.push(...tokenResults.filter((t): t is TokenBalance => t !== null && Number(t.balance) > 0))
    
    // Calculate total value
    const totalValue = tokens.reduce((sum, t) => sum + t.balanceUSD, 0)
    
    // Add percentages
    tokens.forEach(t => {
      t.percentage = totalValue > 0 ? (t.balanceUSD / totalValue) * 100 : 0
    })
    
    // Sort by USD value
    tokens.sort((a, b) => b.balanceUSD - a.balanceUSD)
    
    // Calculate health score
    const health = calculateHealthScore(tokens, totalValue)
    
    return NextResponse.json({
      address,
      totalValue,
      tokens,
      health,
      nfts: [], // TODO: Integrate Alchemy/Moralis
      lpPositions: [], // TODO: Integrate Uniswap Position Manager
    })
    
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}
