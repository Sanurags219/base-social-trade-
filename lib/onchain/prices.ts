// On-chain price feeds using Chainlink on Base
import { createPublicClient, http, formatUnits } from 'viem'
import { base } from 'viem/chains'

const publicClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'),
})

// Chainlink Price Feed Addresses on Base Mainnet
const PRICE_FEEDS = {
  'ETH/USD': '0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70',
  'USDC/USD': '0x7e860098F58bBFC8648a4311b374B1D669a2bc6B',
  'cbETH/ETH': '0x806b4ac04501c29769051e42783cf04dcE41440b',
} as const

const AGGREGATOR_ABI = [
  {
    name: 'latestRoundData',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      { name: 'roundId', type: 'uint80' },
      { name: 'answer', type: 'int256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'updatedAt', type: 'uint256' },
      { name: 'answeredInRound', type: 'uint80' }
    ]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  }
] as const

export interface PriceData {
  price: number
  updatedAt: number
  source: 'chainlink' | 'fallback'
}

// Cache for prices (5 minute TTL)
const priceCache: Map<string, { price: number; timestamp: number }> = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

async function getChainlinkPrice(feedAddress: string): Promise<number | null> {
  try {
    const [latestRound, decimals] = await Promise.all([
      publicClient.readContract({
        address: feedAddress as `0x${string}`,
        abi: AGGREGATOR_ABI,
        functionName: 'latestRoundData',
      }),
      publicClient.readContract({
        address: feedAddress as `0x${string}`,
        abi: AGGREGATOR_ABI,
        functionName: 'decimals',
      }),
    ])
    
    const price = Number(formatUnits(BigInt(latestRound[1].toString()), decimals))
    return price
  } catch (error) {
    console.error('Chainlink price fetch error:', error)
    return null
  }
}

export async function getETHPrice(): Promise<PriceData> {
  // Check cache
  const cached = priceCache.get('ETH')
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { price: cached.price, updatedAt: cached.timestamp, source: 'chainlink' }
  }
  
  const chainlinkPrice = await getChainlinkPrice(PRICE_FEEDS['ETH/USD'])
  
  if (chainlinkPrice) {
    priceCache.set('ETH', { price: chainlinkPrice, timestamp: Date.now() })
    return { price: chainlinkPrice, updatedAt: Date.now(), source: 'chainlink' }
  }
  
  // Fallback price
  return { price: 2400, updatedAt: Date.now(), source: 'fallback' }
}

export async function getTokenPrices(): Promise<Map<string, number>> {
  const prices = new Map<string, number>()
  
  // Get ETH price
  const ethPrice = await getETHPrice()
  prices.set('ETH', ethPrice.price)
  prices.set('WETH', ethPrice.price)
  
  // cbETH = ETH price * cbETH/ETH ratio
  const cbEthRatio = await getChainlinkPrice(PRICE_FEEDS['cbETH/ETH'])
  if (cbEthRatio) {
    prices.set('cbETH', ethPrice.price * cbEthRatio)
  } else {
    prices.set('cbETH', ethPrice.price * 1.04) // ~4% premium fallback
  }
  
  // Stablecoins
  prices.set('USDC', 1)
  prices.set('USDbC', 1)
  prices.set('DAI', 1)
  
  // DeFi tokens (would need additional feeds or DEX pricing)
  prices.set('AERO', 1.2) // Fallback - could integrate Aerodrome TWAP
  
  return prices
}

// Get portfolio value in USD using on-chain prices
export async function getPortfolioValueUSD(
  balances: { symbol: string; balance: number }[]
): Promise<{ totalUSD: number; prices: Map<string, number> }> {
  const prices = await getTokenPrices()
  
  let totalUSD = 0
  for (const token of balances) {
    const price = prices.get(token.symbol) || 0
    totalUSD += token.balance * price
  }
  
  return { totalUSD, prices }
}
