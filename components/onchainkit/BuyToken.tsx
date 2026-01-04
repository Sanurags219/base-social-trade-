'use client'

import { Buy } from '@coinbase/onchainkit/buy'
import type { LifecycleStatus, SwapError } from '@coinbase/onchainkit/swap'
import type { Token } from '@coinbase/onchainkit/token'
import { useCallback } from 'react'
import type { TransactionReceipt } from 'viem'

// Common tokens on Base
export const TOKENS = {
  ETH: {
    name: 'Ethereum',
    address: '' as `0x${string}`,
    symbol: 'ETH',
    decimals: 18,
    image: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png',
    chainId: 8453,
  },
  USDC: {
    name: 'USD Coin',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
    symbol: 'USDC',
    decimals: 6,
    image: 'https://d3r81g40ber91i.cloudfront.net/wallet/wais/44/2b/442b80bd16af0c0d9b22e03a16753823fe826e5bfd457292b55fa0ba8c1ba213-ZWUzYjJmZGUtMDYxNy00NDcyLTg0NjQtMWI4OGEwYjBiODE2',
    chainId: 8453,
  },
  DEGEN: {
    name: 'Degen',
    address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed' as `0x${string}`,
    symbol: 'DEGEN',
    decimals: 18,
    image: 'https://d3r81g40ber91i.cloudfront.net/wallet/wais/3b/bf/3bbf118b5e6dc2f9e7fc607a6e7526647b4ba8f0bea87125f971446d57b296d2-MDNmNjY0MmEtNGFiZi00N2I0LWIwMTItMDUyMzg2ZDZhMWNm',
    chainId: 8453,
  },
  BRETT: {
    name: 'Brett',
    address: '0x532f27101965dd16442E59d40670FaF5eBB142E4' as `0x${string}`,
    symbol: 'BRETT',
    decimals: 18,
    image: 'https://assets.coingecko.com/coins/images/35529/standard/1000050750.png',
    chainId: 8453,
  },
} as const

interface BuyTokenProps {
  toToken?: Token
  fromToken?: Token
  className?: string
  disabled?: boolean
  onSuccess?: (receipt?: TransactionReceipt) => void
  onError?: (error: SwapError) => void
  onStatus?: (status: LifecycleStatus) => void
}

export function BuyToken({
  toToken = TOKENS.ETH,
  fromToken,
  className,
  disabled = false,
  onSuccess,
  onError,
  onStatus,
}: BuyTokenProps) {
  const handleSuccess = useCallback((receipt?: TransactionReceipt) => {
    console.log('Buy success:', receipt)
    onSuccess?.(receipt)
  }, [onSuccess])

  const handleError = useCallback((error: SwapError) => {
    console.error('Buy error:', error)
    onError?.(error)
  }, [onError])

  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log('Buy status:', status)
    onStatus?.(status)
  }, [onStatus])

  return (
    <div className={className}>
      <Buy
        toToken={toToken}
        fromToken={fromToken}
        disabled={disabled}
        onSuccess={handleSuccess}
        onError={handleError}
        onStatus={handleStatus}
        isSponsored={true}
        experimental={{ useAggregator: true }}
      />
    </div>
  )
}

// Quick buy buttons for common tokens
export function BuyETH({ className }: { className?: string }) {
  return <BuyToken toToken={TOKENS.ETH} className={className} />
}

export function BuyUSDC({ className }: { className?: string }) {
  return <BuyToken toToken={TOKENS.USDC} className={className} />
}

export function BuyDEGEN({ className }: { className?: string }) {
  return <BuyToken toToken={TOKENS.DEGEN} className={className} />
}
