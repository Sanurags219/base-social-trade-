// OnchainKit Hooks

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAccount, useBalance } from 'wagmi'
import type { Address } from 'viem'

import { useName, useAddress } from '@coinbase/onchainkit/identity'
import type { Token } from '@coinbase/onchainkit/token'

// Identity hooks wrapper
export function useIdentity(address?: Address) {
  const { data: name, isLoading: nameLoading } = useName({ address })
  
  return {
    avatar: null, // useAvatar requires ensName, not address
    name,
    isLoading: nameLoading,
    displayName: name || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''),
  }
}

// Address lookup from basename
export function useBasenameAddress(name?: string) {
  const { data: address, isLoading, error } = useAddress({ name: name || '' })
  
  return {
    address,
    isLoading,
    error,
    isFound: !!address,
  }
}

// Token balance hook
export function useTokenBalance(tokenAddress?: Address, userAddress?: Address) {
  const { address: connectedAddress } = useAccount()
  const targetAddress = userAddress || connectedAddress
  
  const { data: balance, isLoading, refetch } = useBalance({
    address: targetAddress,
    token: tokenAddress,
  })
  
  return {
    balance: balance?.value,
    formatted: balance?.formatted,
    symbol: balance?.symbol,
    decimals: balance?.decimals,
    isLoading,
    refetch,
  }
}

// ETH balance hook
export function useETHBalance(address?: Address) {
  const { address: connectedAddress } = useAccount()
  const targetAddress = address || connectedAddress
  
  const { data: balance, isLoading, refetch } = useBalance({
    address: targetAddress,
  })
  
  return {
    balance: balance?.value,
    formatted: balance?.formatted,
    isLoading,
    refetch,
  }
}

// Multi-token balances
export function useMultiTokenBalances(tokens: Token[], address?: Address) {
  const { address: connectedAddress } = useAccount()
  const targetAddress = address || connectedAddress
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  
  const fetchBalances = useCallback(async () => {
    if (!targetAddress) {
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    const newBalances: Record<string, string> = {}
    
    // This would need to be implemented with actual balance fetching
    // For now, return empty balances
    for (const token of tokens) {
      newBalances[token.symbol] = '0'
    }
    
    setBalances(newBalances)
    setIsLoading(false)
  }, [targetAddress, tokens])
  
  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])
  
  return {
    balances,
    isLoading,
    refetch: fetchBalances,
  }
}

// Wallet connection status
export function useWalletStatus() {
  const { address, isConnected, isConnecting, isReconnecting, isDisconnected, connector } = useAccount()
  
  return {
    address,
    isConnected,
    isConnecting,
    isReconnecting,
    isDisconnected,
    connectorName: connector?.name,
    status: isConnecting || isReconnecting 
      ? 'connecting' 
      : isConnected 
        ? 'connected' 
        : 'disconnected',
  }
}

// Transaction state hook
export function useTransactionState() {
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [hash, setHash] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)
  
  const reset = useCallback(() => {
    setIsPending(false)
    setIsSuccess(false)
    setIsError(false)
    setHash(null)
    setError(null)
  }, [])
  
  const setPending = useCallback((txHash?: string) => {
    setIsPending(true)
    setIsSuccess(false)
    setIsError(false)
    if (txHash) setHash(txHash)
    setError(null)
  }, [])
  
  const setSuccess = useCallback((txHash?: string) => {
    setIsPending(false)
    setIsSuccess(true)
    setIsError(false)
    if (txHash) setHash(txHash)
    setError(null)
  }, [])
  
  const setFailed = useCallback((err: Error) => {
    setIsPending(false)
    setIsSuccess(false)
    setIsError(true)
    setError(err)
  }, [])
  
  return {
    isPending,
    isSuccess,
    isError,
    hash,
    error,
    reset,
    setPending,
    setSuccess,
    setFailed,
  }
}

// Copy to clipboard hook
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false)
  
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return true
    } catch (error) {
      console.error('Failed to copy:', error)
      return false
    }
  }, [])
  
  return { copied, copy }
}

// Local storage hook for persistence
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })
  
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }, [key, storedValue])
  
  return [storedValue, setValue] as const
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}
