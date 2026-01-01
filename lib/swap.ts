import { parseEther } from 'viem'

// Swap logic and utilities

export interface SwapParams {
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
}

export const SWAP_ROUTER =
  '0x2626664c2603336E57B271c5C0b26F421741e481'

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
          { name: 'deadline', type: 'uint256' },
          { name: 'amountIn', type: 'uint256' },
          { name: 'amountOutMinimum', type: 'uint256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' }
        ]
      }
    ],
    outputs: [{ name: 'amountOut', type: 'uint256' }]
  }
]

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
  const minOut = (amountIn * BigInt(100 - slippage)) / BigInt(100)

  return {
    tokenIn: '0x4200000000000000000000000000000000000006', // WETH (Base)
    tokenOut,
    fee: 3000,
    recipient: user,
    deadline: BigInt(Math.floor(Date.now() / 1000 + 60 * 10)),
    amountIn,
    amountOutMinimum: minOut,
    sqrtPriceLimitX96: 0n
  }
}

export async function getQuote(amount: string) {
  if (!amount || Number(amount) <= 0) {
    return null
  }

  return {
    input: amount,
    output: (Number(amount) * 0.98).toFixed(4),
    priceImpact: '0.4%',
    fee: '0.3%'
  }
}

export async function executeSwap(params: SwapParams): Promise<string | null> {
  try {
    // Execute swap transaction (implementation placeholder)
    return null
  } catch (error) {
    console.error('Swap failed:', error)
    return null
  }
}
