'use client'

import {
  NFTCard,
  NFTMintCard,
} from '@coinbase/onchainkit/nft'
import type { LifecycleStatus } from '@coinbase/onchainkit/nft'
import { useCallback } from 'react'
import type { Address } from 'viem'

interface NFTViewCardProps {
  contractAddress: Address
  tokenId: string
  className?: string
}

export function NFTViewCard({ contractAddress, tokenId, className }: NFTViewCardProps) {
  return (
    <div className={className}>
      <NFTCard
        contractAddress={contractAddress}
        tokenId={tokenId}
      />
    </div>
  )
}

// Mint card for NFTs
interface NFTMintProps {
  contractAddress: Address
  tokenId?: string
  className?: string
  onStatus?: (status: LifecycleStatus) => void
  onSuccess?: () => void
  onError?: (error: Error) => void
  isSponsored?: boolean
}

export function NFTMint({
  contractAddress,
  tokenId,
  className,
  onStatus,
  onSuccess,
  onError,
  isSponsored = true,
}: NFTMintProps) {
  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log('NFT Mint status:', status)
    onStatus?.(status)
    
    if (status.statusName === 'success') {
      onSuccess?.()
    } else if (status.statusName === 'error') {
      onError?.(new Error(status.statusData?.message || 'Mint failed'))
    }
  }, [onStatus, onSuccess, onError])

  return (
    <div className={className}>
      <NFTMintCard
        contractAddress={contractAddress}
        tokenId={tokenId}
        onStatus={handleStatus}
        isSponsored={isSponsored}
      />
    </div>
  )
}

// Default mint card
interface NFTMintDefaultProps {
  contractAddress: Address
  tokenId?: string
  className?: string
}

export function NFTMintDefault({ contractAddress, tokenId, className }: NFTMintDefaultProps) {
  return (
    <div className={className}>
      <NFTMintCard
        contractAddress={contractAddress}
        tokenId={tokenId}
      />
    </div>
  )
}

// Compact NFT display
interface NFTCompactProps {
  contractAddress: Address
  tokenId: string
  className?: string
}

export function NFTCompact({ contractAddress, tokenId, className }: NFTCompactProps) {
  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <NFTCard contractAddress={contractAddress} tokenId={tokenId} />
    </div>
  )
}

// Collection of NFT addresses on Base for demo
export const DEMO_NFTS = {
  basepaintBrush: {
    contractAddress: '0xD68fE5b53e7E1AbeB5A4d0A6660667791f39263a' as Address,
    tokenId: '1',
  },
  baseIntroduced: {
    contractAddress: '0x1fc10ef15E041C5D3C54042e52EB0C54CB9b710c' as Address,
    tokenId: '1',
  },
} as const
