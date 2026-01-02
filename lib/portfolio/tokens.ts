import { createPublicClient, http, formatEther, formatUnits } from 'viem'
import { base } from 'viem/chains'
import { getTokenPrices } from '../onchain/prices'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
})

// Known tokens on Base
export const KNOWN_TOKENS = [
  { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6, type: 'stable' },
  { symbol: 'USDbC', address: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', decimals: 6, type: 'stable' },
  { symbol: 'DAI', address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18, type: 'stable' },
  { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18, type: 'blue-chip' },
  { symbol: 'cbETH', address: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', decimals: 18, type: 'blue-chip' },
  { symbol: 'AERO', address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631', decimals: 18, type: 'defi' },
] as const

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const

export interface TokenBalance {
  symbol: string
  address?: string
  balance: number
  valueUSD: number
  type: 'native' | 'stable' | 'blue-chip' | 'defi' | 'unknown'
}

// Get ETH balance
export async function getEthBalance(address: `0x${string}`): Promise<number> {
  try {
    const balance = await client.getBalance({ address })
    return Number(formatEther(balance))
  } catch (error) {
    console.error('Failed to get ETH balance:', error)
    return 0
  }
}

// Get single ERC20 balance
export async function getERC20Balance(
  tokenAddress: `0x${string}`,
  walletAddress: `0x${string}`,
  decimals: number
): Promise<number> {
  try {
    const balance = await client.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [walletAddress],
    })
    return Number(formatUnits(balance, decimals))
  } catch (error) {
    console.error(`Failed to get balance for ${tokenAddress}:`, error)
    return 0
  }
}

// Get all token balances with on-chain prices
export async function getAllTokenBalances(address: `0x${string}`): Promise<TokenBalance[]> {
  const tokens: TokenBalance[] = []
  
  // Get on-chain prices from Chainlink
  const prices = await getTokenPrices()
  const ethPrice = prices.get('ETH') || 2400

  // Get ETH balance
  const ethBalance = await getEthBalance(address)
  if (ethBalance > 0) {
    tokens.push({
      symbol: 'ETH',
      balance: ethBalance,
      valueUSD: ethBalance * ethPrice,
      type: 'native',
    })
  }

  // Get ERC20 balances in parallel
  const erc20Promises = KNOWN_TOKENS.map(async (token) => {
    const balance = await getERC20Balance(
      token.address as `0x${string}`,
      address,
      token.decimals
    )

    if (balance > 0.0001) { // Filter dust
      const price = prices.get(token.symbol) || 0
      return {
        symbol: token.symbol,
        address: token.address,
        balance,
        valueUSD: balance * price,
        type: token.type as TokenBalance['type'],
      } as TokenBalance
    }
    return null
  })
  
  const erc20Results = await Promise.all(erc20Promises)
  const validResults = erc20Results.filter((t): t is TokenBalance => t !== null)
  tokens.push(...validResults)
  
  // Sort by USD value
  tokens.sort((a, b) => b.valueUSD - a.valueUSD)
  
  return tokens
}
