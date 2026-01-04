'use client'

import { 
  FundButton,
  FundCard,
  getOnrampBuyUrl,
} from '@coinbase/onchainkit/fund'
import { useAccount } from 'wagmi'
import { useCallback } from 'react'

interface FundWalletProps {
  className?: string
  openIn?: 'popup' | 'tab'
  popupSize?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export function FundWallet({
  className,
  openIn = 'popup',
  popupSize = 'md',
  disabled = false,
}: FundWalletProps) {
  return (
    <FundButton 
      className={className}
      openIn={openIn}
      popupSize={popupSize}
      disabled={disabled}
    />
  )
}

// Fund card with multiple options
interface FundCardComponentProps {
  assetSymbol?: string
  className?: string
  country?: string
  subdivision?: string
  headerText?: string
  buttonText?: string
}

export function FundCardComponent({
  assetSymbol = 'ETH',
  className,
  country = 'US',
  subdivision,
  headerText = 'Add funds to your wallet',
  buttonText = 'Buy',
}: FundCardComponentProps) {
  return (
    <div className={className}>
      <FundCard
        assetSymbol={assetSymbol}
        country={country}
        subdivision={subdivision}
        headerText={headerText}
        buttonText={buttonText}
      />
    </div>
  )
}

// Custom fund button with render prop
interface CustomFundButtonProps {
  className?: string
  children?: React.ReactNode
}

export function CustomFundButton({ className, children }: CustomFundButtonProps) {
  // Use FundButton directly as getOnrampBuyUrl requires a session token
  return (
    <FundButton 
      className={className}
      openIn="popup"
    >
      {children}
    </FundButton>
  )
}

// Quick fund amounts - using simple FundButton
export function QuickFund({ className }: { className?: string }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <FundButton
        openIn="popup"
        popupSize="md"
        className="flex-1"
      />
    </div>
  )
}
