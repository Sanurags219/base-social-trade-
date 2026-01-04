'use client'

import {
  Swap,
  SwapAmountInput,
  SwapButton,
  SwapMessage,
  SwapToggleButton,
  SwapToast,
  SwapSettings,
  SwapSettingsSlippageDescription,
  SwapSettingsSlippageInput,
  SwapSettingsSlippageTitle,
} from '@coinbase/onchainkit/swap'
import type { SwapError, LifecycleStatus } from '@coinbase/onchainkit/swap'
import type { Token } from '@coinbase/onchainkit/token'
import { useCallback } from 'react'
import type { TransactionReceipt } from 'viem'

// Common tokens
export const BASE_TOKENS: Record<string, Token> = {
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
  WETH: {
    name: 'Wrapped Ether',
    address: '0x4200000000000000000000000000000000000006' as `0x${string}`,
    symbol: 'WETH',
    decimals: 18,
    image: 'https://wallet-api-production.s3.amazonaws.com/uploads/tokens/eth_288.png',
    chainId: 8453,
  },
  DAI: {
    name: 'Dai Stablecoin',
    address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' as `0x${string}`,
    symbol: 'DAI',
    decimals: 18,
    image: 'https://d3r81g40ber91i.cloudfront.net/wallet/wais/d0/d7/d0d7784975771dbbac9a22c8c0c12928cc6f658cbcf2bbbf7c909f0fa2426dec-NmU4ZWViMDItOTQyYy00Yjk5LTkzODUtNGJlZmJiMTA1ODEw',
    chainId: 8453,
  },
}

interface SwapComponentProps {
  className?: string
  fromToken?: Token
  toToken?: Token
  onSuccess?: (receipt: TransactionReceipt) => void
  onError?: (error: SwapError) => void
  onStatus?: (status: LifecycleStatus) => void
  isSponsored?: boolean
}

export function SwapComponent({
  className,
  fromToken = BASE_TOKENS.ETH,
  toToken = BASE_TOKENS.USDC,
  onSuccess,
  onError,
  onStatus,
  isSponsored = true,
}: SwapComponentProps) {
  const handleSuccess = useCallback((receipt: TransactionReceipt) => {
    console.log('Swap success:', receipt)
    onSuccess?.(receipt)
  }, [onSuccess])

  const handleError = useCallback((error: SwapError) => {
    console.error('Swap error:', error)
    onError?.(error)
  }, [onError])

  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log('Swap status:', status)
    onStatus?.(status)
  }, [onStatus])

  return (
    <div className={className}>
      <Swap
        onSuccess={handleSuccess}
        onError={handleError}
        onStatus={handleStatus}
        isSponsored={isSponsored}
        experimental={{ useAggregator: true }}
      >
        <SwapSettings>
          <SwapSettingsSlippageTitle>Max Slippage</SwapSettingsSlippageTitle>
          <SwapSettingsSlippageDescription>Your transaction will revert if the price changes by more than this percentage</SwapSettingsSlippageDescription>
          <SwapSettingsSlippageInput />
        </SwapSettings>
        <SwapAmountInput
          label="From"
          token={fromToken}
          type="from"
          swappableTokens={Object.values(BASE_TOKENS)}
        />
        <SwapToggleButton />
        <SwapAmountInput
          label="To"
          token={toToken}
          type="to"
          swappableTokens={Object.values(BASE_TOKENS)}
        />
        <SwapButton />
        <SwapMessage />
        <SwapToast />
      </Swap>
    </div>
  )
}

// Simple swap with fixed tokens
interface SimpleSwapProps {
  fromToken: Token
  toToken: Token
  className?: string
  onSuccess?: (receipt: TransactionReceipt) => void
}

export function SimpleSwap({
  fromToken,
  toToken,
  className,
  onSuccess,
}: SimpleSwapProps) {
  return (
    <div className={className}>
      <Swap onSuccess={onSuccess} isSponsored={true}>
        <SwapAmountInput label="From" token={fromToken} type="from" />
        <SwapToggleButton />
        <SwapAmountInput label="To" token={toToken} type="to" />
        <SwapButton />
        <SwapMessage />
      </Swap>
    </div>
  )
}

// ETH to USDC quick swap
export function SwapETHtoUSDC({ className }: { className?: string }) {
  return (
    <SimpleSwap
      fromToken={BASE_TOKENS.ETH}
      toToken={BASE_TOKENS.USDC}
      className={className}
    />
  )
}

// USDC to ETH quick swap
export function SwapUSDCtoETH({ className }: { className?: string }) {
  return (
    <SimpleSwap
      fromToken={BASE_TOKENS.USDC}
      toToken={BASE_TOKENS.ETH}
      className={className}
    />
  )
}
