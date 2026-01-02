import { parseEther } from 'viem'

// Swap logic and utilities for Uniswap V3 on Base

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
}

// Uniswap V3 SwapRouter02 on Base
export const SWAP_ROUTER = '0x2626664c2603336E57B271c5C0b26F421741e481'

// WETH on Base
const WETH = '0x4200000000000000000000000000000000000006'

// Token addresses and their preferred fee tiers on Base
const TOKEN_CONFIG: Record<string, { fee: number }> = {
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': { fee: 500 },   // USDC - 0.05% pool
  '0x4200000000000000000000000000000000000006': { fee: 500 },   // WETH
  '0x50c5725949a6f0c72e6c4a641f24049a917db0cb': { fee: 3000 },  // DAI - 0.3% pool
}

// SwapRouter02 ABI - note: no deadline in struct, uses different format
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
  }
] as const

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
  
  // Get fee tier for the output token (default to 500 = 0.05%)
  const fee = TOKEN_CONFIG[tokenOut.toLowerCase()]?.fee || 500

  // SwapRouter02 struct - NO deadline field
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

export async function getQuote(amount: string) {
  if (!amount || Number(amount) <= 0) {
    return null
  }

  // Rough ETH/USDC estimate (~$3000 per ETH)
  const ethPrice = 3000
  const output = (Number(amount) * ethPrice * 0.995).toFixed(2)

  return {
    input: amount,
    output,
    priceImpact: '<0.1%',
    fee: '0.05%'
  }
}

export async function executeSwap(params: SwapParams): Promise<string | null> {
  try {
    return null
  } catch (error) {
    console.error('Swap failed:', error)
    return null
  }
}
