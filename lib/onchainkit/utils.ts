// OnchainKit Utility Functions

import { getAvatar, getName, getAddress } from '@coinbase/onchainkit/identity'
import { formatAmount } from '@coinbase/onchainkit/token'
import type { Token } from '@coinbase/onchainkit/token'
import type { Address } from 'viem'

// Identity utilities
export async function fetchAvatar(ensName: string): Promise<string | null> {
  try {
    const avatar = await getAvatar({ ensName })
    return avatar
  } catch (error) {
    console.error('Error fetching avatar:', error)
    return null
  }
}

export async function fetchName(address: Address): Promise<string | null> {
  try {
    const name = await getName({ address })
    return name
  } catch (error) {
    console.error('Error fetching name:', error)
    return null
  }
}

export async function fetchAddress(name: string): Promise<Address | null> {
  try {
    const address = await getAddress({ name })
    return address
  } catch (error) {
    console.error('Error fetching address:', error)
    return null
  }
}

// Token utilities - Token list is managed client-side since getTokens is not exported
export const BASE_TOKENS: Token[] = [
  {
    name: 'Ethereum',
    address: '' as `0x${string}`,
    symbol: 'ETH',
    decimals: 18,
    image: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png',
    chainId: 8453,
  },
  {
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
    symbol: 'USDC',
    decimals: 6,
    image: 'https://d3r81g40ber91i.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTg0NjQtMWI4OGEwYjBiODE2',
    chainId: 8453,
  },
  {
    name: 'Wrapped Ether',
    address: '0x4200000000000000000000000000000000000006' as `0x${string}`,
    symbol: 'WETH',
    decimals: 18,
    image: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png',
    chainId: 8453,
  },
]

export function fetchTokens(options?: {
  search?: string
  limit?: number
}): Token[] {
  let tokens = BASE_TOKENS
  if (options?.search) {
    const search = options.search.toLowerCase()
    tokens = tokens.filter(
      t => t.name.toLowerCase().includes(search) || t.symbol.toLowerCase().includes(search)
    )
  }
  if (options?.limit) {
    tokens = tokens.slice(0, options.limit)
  }
  return tokens
}

// Format token amount using OnchainKit's formatAmount
export function formatTokenAmountOCK(amount: string | number): string {
  return formatAmount(String(amount))
}

// Formatting utilities
export function formatTokenBalance(balance: string, decimals: number): string {
  const num = parseFloat(balance) / Math.pow(10, decimals)
  if (num === 0) return '0'
  if (num < 0.001) return '<0.001'
  if (num < 1) return num.toFixed(4)
  if (num < 1000) return num.toFixed(2)
  if (num < 1000000) return `${(num / 1000).toFixed(2)}K`
  return `${(num / 1000000).toFixed(2)}M`
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

// Chain utilities
export const SUPPORTED_CHAINS = {
  base: {
    id: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  baseSepolia: {
    id: 84532,
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
} as const

export function getBlockExplorerUrl(
  address: string,
  type: 'address' | 'tx' = 'address',
  chainId: number = 8453
): string {
  const chain = chainId === 84532 ? SUPPORTED_CHAINS.baseSepolia : SUPPORTED_CHAINS.base
  return `${chain.blockExplorer}/${type}/${address}`
}

// Validation utilities
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function isValidTransactionHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}
