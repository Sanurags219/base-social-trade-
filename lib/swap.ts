import { parseEther, parseUnits } from 'viem'

// Swap logic and utilities for Uniswap V3 on Base

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
}

// Uniswap V3 SwapRouter02 on Base
export const SWAP_ROUTER = '0x2626664c2603336E57B271c5C0b26F421741e481'

// WETH on Base
export const WETH = '0x4200000000000000000000000000000000000006'

// Token addresses and their preferred fee tiers on Base
const TOKEN_CONFIG: Record<string, { fee: number; decimals: number }> = {
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { fee: 500, decimals: 6 },   // USDC - 0.05% pool
  '0x4200000000000000000000000000000000000006': { fee: 500, decimals: 18 },  // WETH
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { fee: 3000, decimals: 18 }, // DAI - 0.3% pool
}

// SwapRouter02 ABI - exactInputSingle (IV3SwapRouter interface)
export const swapAbi = [
  {
    name: 'exactInputSingle',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'tokenIn', type: 'address' },
          { name: 'tokenOut', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'recipient', type: 'address' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' }
        ]
      }
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }]
  },
  // Multicall with deadline - correct signature for SwapRouter02
  {
    name: 'multicall',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'deadline', type: 'uint256' },
      { name: 'data', type: 'bytes[]' }
    ],
    outputs: [{ name: 'results', type: 'bytes[]' }]
  },
  // unwrapWETH9 to convert WETH back to ETH
  {
    name: 'unwrapWETH9',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'amountMinimum', type: 'uint256' },
      { name: 'recipient', type: 'address' }
    ],
    outputs: []
  },
  // refundETH to return unused ETH
  {
    name: 'refundETH',
    type: 'function',
    stateMutability: 'payable',
    inputs: [],
    outputs: []
  }
] as const

// ERC20 approve ABI
export const erc20Abi = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

// Build params for ETH -> Token swap
export function buildSwapParams({
  tokenOut,
  user,
  amount,
  slippage
}: {
  tokenOut: `0x${string}`
  user: `0x${string}`
  amount: string
  slippage: number
}) {
  const amountIn = parseEther(amount)
  const fee = TOKEN_CONFIG[tokenOut.toLowerCase()]?.fee || 500

  return {
    tokenIn: WETH as `0x${string}`,
    tokenOut,
    fee,
    recipient: user,
    amountIn,
    amountOutMinimum: 0n,
    sqrtPriceLimitX96: 0n
  }
}

// Build params for Token -> ETH swap
export function buildTokenToEthParams({
  tokenIn,
  user,
  amount,
  decimals
}: {
  tokenIn: `0x${string}`
  user: `0x${string}`
  amount: string
  decimals: number
}) {
  const amountIn = parseUnits(amount, decimals)
  const fee = TOKEN_CONFIG[tokenIn.toLowerCase()]?.fee || 500

  return {
    tokenIn,
    tokenOut: WETH as `0x${string}`,
    fee,
    recipient: user,
    amountIn,
    amountOutMinimum: 0n,
    sqrtPriceLimitX96: 0n
  }
}

// Token price cache
let priceCache: { [key: string]: { price: number; timestamp: number } } = {}
const CACHE_TTL = 60000 // 1 minute

// CoinGecko IDs for tokens
const COINGECKO_IDS: Record<string, string> = {
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'usd-coin',      // USDC
  '0x4200000000000000000000000000000000000006': 'ethereum',       // WETH
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': 'dai',           // DAI
  '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca': 'usd-coin',      // USDbC
  '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22': 'coinbase-wrapped-staked-eth', // cbETH
  '0x940181a94a35a4569e4529a3cdfb74e38fd98631': 'aerodrome-finance', // AERO
  '0x4ed4e862860bed51a9570b96d89af5e1b0efefed': 'degen-base',    // DEGEN
  '0x532f27101965dd16442e59d40670faf5ebb142e4': 'based-brett',   // BRETT
  '0xac1bd2486aaf3b5c0fc3fd868558b082a531b2b4': 'toshi-base',    // TOSHI
  '0x0578d8a44db98b23bf096a382e016e29a5ce0ffe': 'higher',        // HIGHER
}

async function getEthPrice(): Promise<number> {
  const cacheKey = 'eth'
  const cached = priceCache[cacheKey]
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price
  }

  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
      next: { revalidate: 60 }
    })
    const data = await res.json()
    const price = data.ethereum?.usd || 3500
    priceCache[cacheKey] = { price, timestamp: Date.now() }
    return price
  } catch {
    return priceCache[cacheKey]?.price || 3500
  }
}

async function getTokenPrice(tokenAddress: string): Promise<number> {
  const address = tokenAddress.toLowerCase()
  const cached = priceCache[address]
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price
  }

  // Stablecoins always return ~1
  if (address === '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' || // USDC
      address === '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca' || // USDbC
      address === '0x50c5725949a6f0c72e6c4a641f24049a917db0cb') { // DAI
    priceCache[address] = { price: 1, timestamp: Date.now() }
    return 1
  }

  const coingeckoId = COINGECKO_IDS[address]
  if (!coingeckoId) {
    // Unknown token - try to estimate from ETH price
    return 0.001
  }

  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`, {
      next: { revalidate: 60 }
    })
    const data = await res.json()
    const price = data[coingeckoId]?.usd || 0.01
    priceCache[address] = { price, timestamp: Date.now() }
    return price
  } catch {
    return priceCache[address]?.price || 0.01
  }
}

export async function getQuote(
  amount: string, 
  isReversed: boolean = false, 
  decimals: number = 18,
  tokenAddress: string = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' // Default USDC
) {
  if (!amount || Number(amount) <= 0) {
    return null
  }

  try {
    const ethPrice = await getEthPrice()
    const tokenPrice = await getTokenPrice(tokenAddress)
    
    // ETH value in USD
    const ethValueUsd = Number(amount) * ethPrice
    
    // Fee deduction (0.3% for most pools, 0.05% for stables)
    const feePercent = tokenAddress.toLowerCase() === '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' ? 0.0005 : 0.003
    const afterFee = 1 - feePercent

    if (isReversed) {
      // Token -> ETH
      const tokenValueUsd = Number(amount) * tokenPrice
      const ethOutput = (tokenValueUsd / ethPrice) * afterFee
      return {
        input: amount,
        output: ethOutput.toFixed(6),
        priceImpact: Number(amount) > 10000 ? '~0.5%' : '<0.1%',
        fee: feePercent === 0.0005 ? '0.05%' : '0.3%'
      }
    } else {
      // ETH -> Token
      const tokenOutput = (ethValueUsd / tokenPrice) * afterFee
      // Format based on token value
      const formatted = tokenPrice >= 1 
        ? tokenOutput.toFixed(2) 
        : tokenOutput.toFixed(tokenPrice < 0.001 ? 0 : 4)
      return {
        input: amount,
        output: formatted,
        priceImpact: Number(amount) > 1 ? '~0.3%' : '<0.1%',
        fee: feePercent === 0.0005 ? '0.05%' : '0.3%'
      }
    }
  } catch (e) {
    // Fallback to static estimate
    const fallbackEthPrice = 3500
    if (isReversed) {
      return {
        input: amount,
        output: (Number(amount) / fallbackEthPrice * 0.997).toFixed(6),
        priceImpact: '<0.1%',
        fee: '0.3%'
      }
    } else {
      return {
        input: amount,
        output: (Number(amount) * fallbackEthPrice * 0.997).toFixed(2),
        priceImpact: '<0.1%',
        fee: '0.3%'
      }
    }
  }
}