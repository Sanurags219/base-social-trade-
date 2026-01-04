'use client'

import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
  TransactionToast,
  TransactionToastAction,
  TransactionToastIcon,
  TransactionToastLabel,
} from '@coinbase/onchainkit/transaction'
import type { LifecycleStatus, TransactionError, TransactionResponseType } from '@coinbase/onchainkit/transaction'
import { useCallback } from 'react'
import type { Address, ContractFunctionParameters, TransactionReceipt } from 'viem'
import { parseEther, encodeFunctionData } from 'viem'

// Transaction component
interface TransactionComponentProps {
  contracts: ContractFunctionParameters[]
  className?: string
  onSuccess?: (response: TransactionResponseType) => void
  onError?: (error: TransactionError) => void
  onStatus?: (status: LifecycleStatus) => void
  isSponsored?: boolean
  chainId?: number
  disabled?: boolean
}

export function TransactionComponent({
  contracts,
  className,
  onSuccess,
  onError,
  onStatus,
  isSponsored = true,
  chainId = 8453,
  disabled = false,
}: TransactionComponentProps) {
  const handleSuccess = useCallback((response: TransactionResponseType) => {
    console.log('Transaction success:', response)
    onSuccess?.(response)
  }, [onSuccess])

  const handleError = useCallback((error: TransactionError) => {
    console.error('Transaction error:', error)
    onError?.(error)
  }, [onError])

  const handleStatus = useCallback((status: LifecycleStatus) => {
    console.log('Transaction status:', status)
    onStatus?.(status)
  }, [onStatus])

  return (
    <div className={className}>
      <Transaction
        calls={contracts}
        chainId={chainId}
        onSuccess={handleSuccess}
        onError={handleError}
        onStatus={handleStatus}
      >
        <TransactionButton disabled={disabled} />
        {isSponsored && <TransactionSponsor />}
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
        <TransactionToast>
          <TransactionToastIcon />
          <TransactionToastLabel />
          <TransactionToastAction />
        </TransactionToast>
      </Transaction>
    </div>
  )
}

// Simple ETH transfer
interface SendETHProps {
  to: Address
  amount: string // in ETH
  className?: string
  onSuccess?: (response: TransactionResponseType) => void
}

export function SendETH({ to, amount, className, onSuccess }: SendETHProps) {
  const calls = [
    {
      to,
      value: parseEther(amount),
    },
  ]

  return (
    <div className={className}>
      <Transaction
        calls={calls}
        chainId={8453}
        onSuccess={onSuccess}
      >
        <TransactionButton text={`Send ${amount} ETH`} />
        <TransactionSponsor />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
    </div>
  )
}

// Contract call helper
interface ContractCallProps {
  address: Address
  abi: any
  functionName: string
  args?: readonly unknown[]
  value?: bigint
  className?: string
  buttonText?: string
  onSuccess?: (response: TransactionResponseType) => void
  onError?: (error: TransactionError) => void
  isSponsored?: boolean
}

export function ContractCall({
  address,
  abi,
  functionName,
  args = [],
  value,
  className,
  buttonText = 'Execute',
  onSuccess,
  onError,
  isSponsored = true,
}: ContractCallProps) {
  const calls = [
    {
      address,
      abi,
      functionName,
      args,
      value,
    } as ContractFunctionParameters,
  ]

  return (
    <div className={className}>
      <Transaction
        calls={calls}
        chainId={8453}
        onSuccess={onSuccess}
        onError={onError}
      >
        <TransactionButton text={buttonText} />
        {isSponsored && <TransactionSponsor />}
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
        <TransactionToast>
          <TransactionToastIcon />
          <TransactionToastLabel />
          <TransactionToastAction />
        </TransactionToast>
      </Transaction>
    </div>
  )
}

// Batch transactions
interface BatchTransactionProps {
  calls: Array<{
    to: Address
    data?: `0x${string}`
    value?: bigint
  }>
  className?: string
  buttonText?: string
  onSuccess?: (response: TransactionResponseType) => void
  onError?: (error: TransactionError) => void
}

export function BatchTransaction({
  calls,
  className,
  buttonText = 'Execute Batch',
  onSuccess,
  onError,
}: BatchTransactionProps) {
  return (
    <div className={className}>
      <Transaction
        calls={calls}
        chainId={8453}
        onSuccess={onSuccess}
        onError={onError}
      >
        <TransactionButton text={buttonText} />
        <TransactionSponsor />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
        <TransactionToast>
          <TransactionToastIcon />
          <TransactionToastLabel />
          <TransactionToastAction />
        </TransactionToast>
      </Transaction>
    </div>
  )
}

// ERC20 Approve
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

interface ApproveERC20Props {
  tokenAddress: Address
  spenderAddress: Address
  amount: bigint
  className?: string
  onSuccess?: (response: TransactionResponseType) => void
}

export function ApproveERC20({
  tokenAddress,
  spenderAddress,
  amount,
  className,
  onSuccess,
}: ApproveERC20Props) {
  return (
    <ContractCall
      address={tokenAddress}
      abi={ERC20_ABI}
      functionName="approve"
      args={[spenderAddress, amount]}
      buttonText="Approve"
      className={className}
      onSuccess={onSuccess}
    />
  )
}

// Transfer ERC20
interface TransferERC20Props {
  tokenAddress: Address
  to: Address
  amount: bigint
  className?: string
  onSuccess?: (response: TransactionResponseType) => void
}

export function TransferERC20({
  tokenAddress,
  to,
  amount,
  className,
  onSuccess,
}: TransferERC20Props) {
  return (
    <ContractCall
      address={tokenAddress}
      abi={ERC20_ABI}
      functionName="transfer"
      args={[to, amount]}
      buttonText="Transfer"
      className={className}
      onSuccess={onSuccess}
    />
  )
}
