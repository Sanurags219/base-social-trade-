'use client'

import { 
  Earn,
  EarnDeposit,
  EarnWithdraw,
  EarnDetails,
  EarnProvider
} from '@coinbase/onchainkit/earn'
import type { LifecycleStatus } from '@coinbase/onchainkit/earn'
import { useCallback } from 'react'
import type { Address } from 'viem'

// Morpho Blue vault on Base for USDC earning
const MORPHO_USDC_VAULT = '0xc1256Ae5FF1cf2719D4937adb3bbCCab2E00A2Ca' as Address

interface EarnUSDCProps {
  vaultAddress?: Address
  className?: string
  onStatus?: (status: LifecycleStatus) => void
}

export function EarnUSDC({
  vaultAddress = MORPHO_USDC_VAULT,
  className,
  onStatus,
}: EarnUSDCProps) {
  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log('Earn status:', status)
    onStatus?.(status)
  }, [onStatus])

  return (
    <div className={className}>
      <Earn vaultAddress={vaultAddress} onStatus={handleStatus}>
        <EarnDetails />
        <EarnDeposit />
        <EarnWithdraw />
      </Earn>
    </div>
  )
}

// Standalone deposit component
interface EarnDepositProps {
  vaultAddress?: Address
  className?: string
  onSuccess?: () => void
}

export function EarnDepositCard({
  vaultAddress = MORPHO_USDC_VAULT,
  className,
  onSuccess,
}: EarnDepositProps) {
  const handleStatus = useCallback((status: LifecycleStatus) => {
    if (status.statusName === 'success') {
      onSuccess?.()
    }
  }, [onSuccess])

  return (
    <div className={className}>
      <EarnProvider vaultAddress={vaultAddress}>
        <div className="rounded-xl bg-zinc-900 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Deposit to Earn</h3>
          <EarnDetails />
          <div className="mt-4">
            <EarnDeposit />
          </div>
        </div>
      </EarnProvider>
    </div>
  )
}

// Standalone withdraw component
interface EarnWithdrawProps {
  vaultAddress?: Address
  className?: string
  onSuccess?: () => void
}

export function EarnWithdrawCard({
  vaultAddress = MORPHO_USDC_VAULT,
  className,
  onSuccess,
}: EarnWithdrawProps) {
  const handleStatus = useCallback((status: LifecycleStatus) => {
    if (status.statusName === 'success') {
      onSuccess?.()
    }
  }, [onSuccess])

  return (
    <div className={className}>
      <EarnProvider vaultAddress={vaultAddress}>
        <div className="rounded-xl bg-zinc-900 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Withdraw Earnings</h3>
          <EarnDetails />
          <div className="mt-4">
            <EarnWithdraw />
          </div>
        </div>
      </EarnProvider>
    </div>
  )
}
