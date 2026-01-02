import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, formatEther, formatUnits } from 'viem'
import { base } from 'viem/chains'
import { getNFTCount } from '@/lib/portfolio/nfts'
import { getLPCount } from '@/lib/portfolio/lps'
import { calculateHealth, Token } from '@/lib/health/calc'
import { classify } from '@/lib/health/riskTags'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

// Known tokens on Base with prices
const TOKENS = [
  { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, price: 1 },
  { symbol: 'USDbC', address: '0xd9aAEc86B65D86f6E08f4c7C32D4f71b54bdA02913', decimals: 6, price: 1 },
  { symbol: 'DAI', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18, price: 1 },
  { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18, price: 2400 },
  { symbol: 'cbETH', address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', decimals: 18, price: 2500 },
  { symbol: 'AERO', address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', decimals: 18, price: 1.2 },
]

const ETH_PRICE = 2400

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

interface TokenData {
  symbol: string
  balance: number
  valueUSD: number
  type: string
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  
  // Demo mode for testing
  if (!address || address === 'demo') {
    return NextResponse.json(getDemoData())
  }
  
  try {
    // Fetch ETH balance
    const ethBalance = await client.getBalance({ address: address as `0x${string}` })
    const ethFormatted = Number(formatEther(ethBalance))
    const ethUSD = ethFormatted * ETH_PRICE
    
    const tokens: TokenData[] = []
    
    if (ethFormatted > 0.0001) {
      tokens.push({
        symbol: 'ETH',
        balance: ethFormatted,
        valueUSD: ethUSD,
        type: classify('ETH'),
      })
    }
    
    // Fetch ERC-20 balances in parallel
    const balancePromises = TOKENS.map(async (token) => {
      try {
        const balance = await client.readContract({
          address: token.address as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address as `0x${string}`],
        })
        
        const formatted = Number(formatUnits(balance, token.decimals))
        if (formatted > 0.0001) {
          return {
            symbol: token.symbol,
            balance: formatted,
            valueUSD: formatted * token.price,
            type: classify(token.symbol),
          } as TokenData
        }
      } catch {
        // Skip failed reads
      }
      return null
    })
    
    const results = await Promise.all(balancePromises)
    const validResults = results.filter((t): t is TokenData => t !== null)
    tokens.push(...validResults)
    
    // Calculate totals
    const totalValueUSD = tokens.reduce((sum, t) => sum + t.valueUSD, 0)
    
    // Fetch NFT and LP counts (non-blocking)
    let nftCount = 0
    let lpCount = 0
    let lpsUSD = 0
    
    try {
      [nftCount, lpCount] = await Promise.all([
        getNFTCount(address).catch(() => 0),
        getLPCount(address).catch(() => 0),
      ])
      // Estimate LP value (simplified - assume $500 per position)
      lpsUSD = lpCount * 500
    } catch {
      // Use defaults
    }
    
    // Calculate health score using new calc module
    const healthTokens: Token[] = tokens.map(t => ({
      symbol: t.symbol,
      valueUSD: t.valueUSD,
    }))
    
    const health = calculateHealth(healthTokens, lpsUSD)
    
    return NextResponse.json({
      address,
      tokens,
      totalValueUSD: totalValueUSD + lpsUSD,
      nfts: { count: nftCount, valueUSD: 0 },
      lps: { count: lpCount, valueUSD: lpsUSD },
      health,
    })
    
  } catch (error) {
    console.error('Health score fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

function getDemoData() {
  const demoTokens: Token[] = [
    { symbol: 'ETH', valueUSD: 3600 },
    { symbol: 'USDC', valueUSD: 1200 },
    { symbol: 'WETH', valueUSD: 1200 },
  ]
  
  const health = calculateHealth(demoTokens, 500)
  
  return {
    address: 'demo',
    tokens: [
      { symbol: 'ETH', balance: 1.5, valueUSD: 3600, type: 'bluechip' },
      { symbol: 'USDC', balance: 1200, valueUSD: 1200, type: 'stable' },
      { symbol: 'WETH', balance: 0.5, valueUSD: 1200, type: 'bluechip' },
    ],
    totalValueUSD: 6500,
    nfts: { count: 3, valueUSD: 800 },
    lps: { count: 1, valueUSD: 500 },
    health,
  }
}
