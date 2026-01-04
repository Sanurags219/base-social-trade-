'use client'

import { Checkout, CheckoutButton, CheckoutStatus } from '@coinbase/onchainkit/checkout'
import type { LifecycleStatus } from '@coinbase/onchainkit/checkout'
import { useCallback } from 'react'

interface CheckoutFlowProps {
  chargeHandler?: () => Promise<string>
  productId?: string
  className?: string
  disabled?: boolean
  onStatus?: (status: LifecycleStatus) => void
}

export function CheckoutFlow({
  chargeHandler,
  productId,
  className,
  disabled = false,
  onStatus,
}: CheckoutFlowProps) {
  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log('Checkout status:', status)
    onStatus?.(status)
  }, [onStatus])

  // Default charge handler for demo
  const defaultChargeHandler = useCallback(async () => {
    // In production, this would call your backend to create a charge
    // For now, return a demo charge ID
    console.log('Creating charge...')
    return 'demo-charge-id'
  }, [])

  return (
    <div className={className}>
      <Checkout 
        chargeHandler={chargeHandler || defaultChargeHandler}
        productId={productId}
        onStatus={handleStatus}
      >
        <CheckoutButton 
          disabled={disabled}
          coinbaseBranded={true}
        />
        <CheckoutStatus />
      </Checkout>
    </div>
  )
}

// USDC payment checkout
interface USDCCheckoutProps {
  amount: string
  recipientAddress: `0x${string}`
  productName?: string
  className?: string
  onSuccess?: () => void
}

export function USDCCheckout({
  amount,
  recipientAddress,
  productName = 'Premium Feature',
  className,
  onSuccess,
}: USDCCheckoutProps) {
  const handleStatus = useCallback((status: LifecycleStatus) => {
    if (status.statusName === 'success') {
      onSuccess?.()
    }
  }, [onSuccess])

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{productName}</h3>
        <p className="text-zinc-400">{amount} USDC</p>
      </div>
      <Checkout onStatus={handleStatus}>
        <CheckoutButton coinbaseBranded={true} />
        <CheckoutStatus />
      </Checkout>
    </div>
  )
}
