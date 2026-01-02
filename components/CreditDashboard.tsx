'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { 
  getCreditInfo, 
  getCreditContractAddress, 
  getUSDCAddress,
  parseUSDC,
  CREDIT_ABI,
  USDC_ABI,
  type CreditInfo 
} from '@/lib/credit'

export function CreditDashboard() {
  const { address } = useAccount()
  const [credit, setCredit] = useState<CreditInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [borrowAmount, setBorrowAmount] = useState('')
  const [action, setAction] = useState<'view' | 'borrow' | 'repay'>('view')
  const [message, setMessage] = useState('')

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Fetch on-chain credit data
  useEffect(() => {
    if (!address) return

    const fetchCredit = async () => {
      setLoading(true)
      const data = await getCreditInfo(address)
      setCredit(data)
      setLoading(false)
    }

    fetchCredit()
  }, [address, isSuccess])

  // Handle successful tx
  useEffect(() => {
    if (isSuccess) {
      setMessage('✅ Transaction confirmed!')
      setAction('view')
      setBorrowAmount('')
    }
  }, [isSuccess])

  const handleBorrow = async () => {
    if (!address || !borrowAmount || !credit) {
      setMessage('❌ Enter an amount')
      return
    }

    const amount = Number(borrowAmount)
    if (amount > credit.creditLimit) {
      setMessage('❌ Exceeds credit limit')
      return
    }

    setMessage('⏳ Confirm in wallet...')
    
    try {
      writeContract({
        address: getCreditContractAddress() as `0x${string}`,
        abi: CREDIT_ABI,
        functionName: 'borrow',
        args: [parseUSDC(amount)]
      })
    } catch (e: any) {
      setMessage(`❌ ${e?.shortMessage || 'Transaction failed'}`)
    }
  }

  const handleApproveAndRepay = async () => {
    if (!address || !credit?.loan) return

    setMessage('⏳ Approving USDC...')

    try {
      writeContract({
        address: getUSDCAddress() as `0x${string}`,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [getCreditContractAddress() as `0x${string}`, parseUSDC(credit.loan.amount)]
      })
    } catch (e: any) {
      setMessage(`❌ ${e?.shortMessage || 'Approval failed'}`)
    }
  }

  const handleRepay = async () => {
    if (!address) return

    setMessage('⏳ Confirm repayment...')

    try {
      writeContract({
        address: getCreditContractAddress() as `0x${string}`,
        abi: CREDIT_ABI,
        functionName: 'repay'
      })
    } catch (e: any) {
      setMessage(`❌ ${e?.shortMessage || 'Repay failed'}`)
    }
  }

  const getTierEmoji = (tier: string) => {
    switch (tier) {
      case 'Elite': return '🟢'
      case 'Trusted': return '🔵'
      case 'Regular': return '🟡'
      default: return '🔴'
    }
  }

  if (!address) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 text-center border border-zinc-800">
        <div className="text-sm text-zinc-400">💳 Credit System</div>
        <div className="text-zinc-300 mt-2">Connect wallet to view credit</div>
      </div>
    )
  }

  if (loading || !credit) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 animate-pulse border border-zinc-800">
        <div className="h-4 bg-zinc-800 rounded w-32 mb-4"></div>
        <div className="h-8 bg-zinc-800 rounded w-48"></div>
      </div>
    )
  }

  const daysUntilDue = credit.loan 
    ? Math.ceil((credit.loan.dueAt * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-zinc-400">💳 On-Chain Credit</div>
          <div className="text-xs text-zinc-500 mt-1">
            Tier: {getTierEmoji(credit.creditTier)} {credit.creditTier}
          </div>
        </div>
        <div className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded">
          🔗 Base Mainnet
        </div>
      </div>

      {/* Credit Limit */}
      <div className="bg-black rounded-lg p-4 mb-4">
        <div className="text-xs text-zinc-400 mb-1">Available Credit</div>
        <div className="text-3xl font-bold text-green-400">
          ${credit.creditLimit.toLocaleString()}
        </div>
        <div className="text-xs text-zinc-500 mt-2">
          USDC • Based on on-chain reputation
        </div>
      </div>

      {/* Active Loan */}
      {credit.hasActiveLoan && credit.loan && (
        <div
          className={`rounded-lg p-4 mb-4 border ${
            credit.loan.isOverdue
              ? 'bg-red-500/10 border-red-500'
              : 'bg-blue-500/10 border-blue-500'
          }`}
        >
          <div className="text-xs font-semibold mb-2">
            {credit.loan.isOverdue ? '⚠️ OVERDUE' : '📋 Active Loan'}
          </div>
          <div className="text-lg font-bold mb-2">${credit.loan.amount.toLocaleString()} USDC</div>
          <div className="text-xs text-zinc-300 space-y-1">
            <div>
              Due: {new Date(credit.loan.dueAt * 1000).toLocaleDateString()}
            </div>
            <div>
              {credit.loan.isOverdue
                ? `⚠️ ${Math.abs(daysUntilDue)} days overdue`
                : `${daysUntilDue} days remaining`}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {action === 'view' ? (
        <div className="space-y-2">
          {!credit.hasActiveLoan && credit.creditLimit > 0 && (
            <button
              onClick={() => {
                setAction('borrow')
                setMessage('')
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-3 text-sm font-semibold transition"
            >
              🏦 Borrow USDC
            </button>
          )}

          {credit.hasActiveLoan && (
            <button
              onClick={() => {
                setAction('repay')
                setMessage('')
              }}
              className="w-full bg-green-600 hover:bg-green-500 rounded-lg py-3 text-sm font-semibold transition"
            >
              ✅ Repay Loan
            </button>
          )}

          {credit.creditLimit === 0 && (
            <div className="text-xs text-red-400 text-center py-2">
              🔴 No credit available. Build your reputation to qualify (400+ score).
            </div>
          )}
        </div>
      ) : action === 'borrow' ? (
        <div className="space-y-3">
          <input
            type="number"
            placeholder="Amount in USDC"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            max={credit.creditLimit}
            className="w-full bg-black rounded-lg px-4 py-3 text-sm outline-none border border-zinc-700 text-white"
          />
          <div className="text-xs text-zinc-400">
            Max: ${credit.creditLimit.toLocaleString()} USDC
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBorrow}
              disabled={isPending || isConfirming}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg py-3 text-sm font-semibold transition"
            >
              {isPending ? '⏳ Confirm in wallet...' : isConfirming ? '⏳ Confirming...' : 'Borrow'}
            </button>
            <button
              onClick={() => {
                setAction('view')
                setMessage('')
              }}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 rounded-lg py-3 text-sm font-semibold transition"
            >
              Cancel
            </button>
          </div>
          <div className="text-xs text-zinc-300 bg-zinc-950 rounded-lg p-3">
            ℹ️ 14-day term, 0% interest. On-time repayment boosts reputation.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-black rounded-lg p-4 text-sm">
            <div className="text-zinc-400 mb-1">Repay amount:</div>
            <div className="text-xl font-bold text-green-400">
              ${credit.loan?.amount.toLocaleString()} USDC
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApproveAndRepay}
              disabled={isPending || isConfirming}
              className="flex-1 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 rounded-lg py-3 text-sm font-semibold transition"
            >
              {isPending ? '⏳ Approving...' : '1. Approve USDC'}
            </button>
            <button
              onClick={handleRepay}
              disabled={isPending || isConfirming}
              className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg py-3 text-sm font-semibold transition"
            >
              {isConfirming ? '⏳ Confirming...' : '2. Repay'}
            </button>
          </div>
          <button
            onClick={() => {
              setAction('view')
              setMessage('')
            }}
            className="w-full bg-zinc-700 hover:bg-zinc-600 rounded-lg py-2 text-sm font-semibold transition"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`text-xs text-center mt-3 p-2 rounded-lg ${
          message.includes('✅') ? 'bg-green-900/30 text-green-400' :
          message.includes('❌') ? 'bg-red-900/30 text-red-400' :
          'bg-zinc-800 text-zinc-300'
        }`}>
          {message}
        </div>
      )}

      {/* Contract Info */}
      <div className="text-xs text-zinc-500 mt-4 pt-4 border-t border-zinc-800">
        <a 
          href={`https://basescan.org/address/${getCreditContractAddress()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-300 transition"
        >
          📄 View Contract on Basescan →
        </a>
      </div>
    </div>
  )
}
