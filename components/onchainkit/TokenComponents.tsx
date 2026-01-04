'use client'

import {
  TokenChip,
  TokenImage,
  TokenRow,
  TokenSelectDropdown,
  TokenBalance,
  formatAmount,
} from '@coinbase/onchainkit/token'
import type { Token } from '@coinbase/onchainkit/token'
import { useCallback, useState } from 'react'

// Token list for Base
export const BASE_TOKEN_LIST: Token[] = [
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
  {
    name: 'Degen',
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed' as `0x${string}`,
    symbol: 'DEGEN',
    decimals: 18,
    image: 'https://d3r81g40ber91i.cloudfront.net/wallet/wais/3b/bf/3bbf118b5e6dc2f9e7fc607a6e7526647b4ba8f0bea87125f971446d57b296d2-MDNmNjY0MmEtNGFiZi00N2I0LWIwMTItMDUyMzg2ZDZhMWNm',
    chainId: 8453,
  },
  {
    name: 'Brett',
    address: '0x532f27101965dd16442E59d40670FaF5eBB142E4' as `0x${string}`,
    symbol: 'BRETT',
    decimals: 18,
    image: 'https://assets.coingecko.com/coins/images/35529/standard/1000050750.png',
    chainId: 8453,
  },
  {
    name: 'Dai Stablecoin',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' as `0x${string}`,
    symbol: 'DAI',
    decimals: 18,
    image: 'https://d3r81g40ber91i.cloudfront.net/wallet/wais/d0/d7/d0d7784975771dbbac9a22c8c0c12928cc6f658cbcf2bbbf7c909f0fa2426dec-NmU4ZWViMDItOTQyYy00Yjk5LTkzODUtNGJlZmJiMTA1ODEw',
    chainId: 8453,
  },
]

// Token chip display
interface TokenChipDisplayProps {
  token: Token
  className?: string
}

export function TokenChipDisplay({ token, className }: TokenChipDisplayProps) {
  return (
    <div className={className}>
      <TokenChip token={token} />
    </div>
  )
}

// Token image
interface TokenImageDisplayProps {
  token: Token
  size?: number
  className?: string
}

export function TokenImageDisplay({ token, size = 32, className }: TokenImageDisplayProps) {
  return (
    <TokenImage token={token} size={size} className={className} />
  )
}

// Token row with balance
interface TokenRowDisplayProps {
  token: Token
  amount?: string
  className?: string
  onClick?: (token: Token) => void
}

export function TokenRowDisplay({ token, amount, className, onClick }: TokenRowDisplayProps) {
  const handleClick = useCallback(() => {
    onClick?.(token)
  }, [onClick, token])

  return (
    <div className={className} onClick={handleClick}>
      <TokenRow token={token} amount={amount} />
    </div>
  )
}

// Token search - using custom search implementation since TokenSearch is not exported
interface TokenSearchComponentProps {
  tokens?: Token[]
  className?: string
  onSelect?: (token: Token) => void
}

export function TokenSearchComponent({
  tokens = BASE_TOKEN_LIST,
  className,
  onSelect,
}: TokenSearchComponentProps) {
  const [search, setSearch] = useState('')
  const filteredTokens = tokens.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.symbol.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={className}>
      <input
        type="text"
        placeholder="Search tokens..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 mb-2"
      />
      <div className="max-h-60 overflow-y-auto space-y-1">
        {filteredTokens.map((token) => (
          <div
            key={token.address || token.symbol}
            onClick={() => onSelect?.(token)}
            className="cursor-pointer hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <TokenRow token={token} />
          </div>
        ))}
      </div>
    </div>
  )
}

// Token selector dropdown
interface TokenSelectorProps {
  tokens?: Token[]
  selectedToken?: Token
  className?: string
  onSelect?: (token: Token) => void
}

export function TokenSelector({
  tokens = BASE_TOKEN_LIST,
  selectedToken,
  className,
  onSelect,
}: TokenSelectorProps) {
  const [selected, setSelected] = useState<Token | undefined>(selectedToken)

  const handleSelect = useCallback((token: Token) => {
    setSelected(token)
    onSelect?.(token)
  }, [onSelect])

  return (
    <div className={className}>
      <TokenSelectDropdown
        token={selected}
        setToken={handleSelect}
        options={tokens}
      />
    </div>
  )
}

// Token list display
interface TokenListProps {
  tokens?: Token[]
  className?: string
  onTokenClick?: (token: Token) => void
}

export function TokenList({
  tokens = BASE_TOKEN_LIST,
  className,
  onTokenClick,
}: TokenListProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {tokens.map((token) => (
        <div
          key={token.address || token.symbol}
          onClick={() => onTokenClick?.(token)}
          className="cursor-pointer hover:bg-zinc-800 rounded-lg p-2 transition-colors"
        >
          <TokenRow token={token} />
        </div>
      ))}
    </div>
  )
}

// Format token amount utility
export function formatTokenAmount(amount: string, decimals: number): string {
  return formatAmount(amount, { maximumFractionDigits: decimals })
}

// Token balance display - renamed to avoid conflict with imported TokenBalance
interface TokenBalanceDisplayProps {
  token: Token
  balance: string
  className?: string
}

export function TokenBalanceDisplay({ token, balance, className }: TokenBalanceDisplayProps) {
  const formattedBalance = formatAmount(balance, { maximumFractionDigits: token.decimals })
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TokenImage token={token} size={24} />
      <span className="font-medium">{formattedBalance}</span>
      <span className="text-zinc-400">{token.symbol}</span>
    </div>
  )
}

// Re-export TokenBalance from OnchainKit
export { TokenBalance }
