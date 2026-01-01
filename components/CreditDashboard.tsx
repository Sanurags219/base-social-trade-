'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface CreditData {
  address: string
  reputation: number
  creditTier: string
  creditEmoji: string
  creditLimit: number
  hasActiveLoan: boolean
  activeLoan?: {
    amount: number
    borrowedAt: string
    dueAt: string
    daysUntilDue: number
    isOverdue: boolean
    status: string
  }
}

export function CreditDashboard() {
  const { address } = useAccount()
  const [credit, setCredit] = useState<CreditData | null>(null)
  const [loading, setLoading] = useState(false)
  const [borrowAmount, setBorrowAmount] = useState('')
  const [action, setAction] = useState<'view' | 'borrow' | 'repay'>('view')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!address) return

    const fetchCredit = async () => {
      try {
        const res = await fetch(`/api/credit?address=${address}`)
        const data = await res.json()
        setCredit(data)
      } catch (e) {
        console.error('Failed to fetch credit:', e)
      }
    }

    fetchCredit()
  }, [address])

  const handleBorrow = async () => {
    if (!address || !borrowAmount) {
      setMessage('❌ Enter an amount')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          action: 'borrow',
          amount: Number(borrowAmount)
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(`✅ ${data.message}`)
        setBorrowAmount('')
        setAction('view')
        // Refresh credit data
        const refreshRes = await fetch(`/api/credit?address=${address}`)
        const refreshData = await refreshRes.json()
        setCredit(refreshData)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (e) {
      setMessage('❌ Failed to borrow')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRepay = async () => {
    if (!address) return

    setLoading(true)
    try {
      const res = await fetch('/api/credit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          action: 'repay'
        })
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(`✅ ${data.message}`)
        setAction('view')
        // Refresh credit data
        const refreshRes = await fetch(`/api/credit?address=${address}`)
        const refreshData = await refreshRes.json()
        setCredit(refreshData)
      } else {
        setMessage(`❌ ${data.error}`)
      }
    } catch (e) {
      setMessage('❌ Failed to repay')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (!address) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 text-center">
        <div className="text-sm text-zinc-400">💳 Credit System</div>
        <div className="text-zinc-300 mt-2">Connect wallet to view credit</div>
      </div>
    )
  }

  if (!credit) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-32 mb-4"></div>
        <div className="h-8 bg-zinc-800 rounded w-48"></div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-zinc-400">💳 Credit System</div>
          <div className="text-xs text-zinc-500 mt-1">
            Tier: {credit.creditEmoji} {credit.creditTier}
          </div>
        </div>
      </div>

      {/* Credit Limit */}
      <div className="bg-black rounded-lg p-4 mb-4">
        <div className="text-xs text-zinc-400 mb-1">Available Credit</div>
        <div className="text-3xl font-bold text-green-400">
          ${credit.creditLimit.toLocaleString()}
        </div>
        <div className="text-xs text-zinc-500 mt-2">
          Based on {credit.reputation} reputation score
        </div>
      </div>

      {/* Active Loan */}
      {credit.hasActiveLoan && credit.activeLoan && (
        <div
          className={`rounded-lg p-4 mb-4 border ${
            credit.activeLoan.isOverdue
              ? 'bg-red-500/10 border-red-500'
              : 'bg-blue-500/10 border-blue-500'
          }`}
        >
          <div className="text-xs font-semibold mb-2">
            {credit.activeLoan.isOverdue ? '⚠️ OVERDUE' : '📋 Active Loan'}
          </div>
          <div className="text-lg font-bold mb-2">${credit.activeLoan.amount}</div>
          <div className="text-xs text-zinc-300 space-y-1">
            <div>
              Due: {new Date(credit.activeLoan.dueAt).toLocaleDateString()}
            </div>
            <div>
              {credit.activeLoan.isOverdue
                ? `⚠️ ${Math.abs(credit.activeLoan.daysUntilDue)} days overdue`
                : `${credit.activeLoan.daysUntilDue} days remaining`}
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
              className="w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-2 text-sm font-semibold transition"
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
              className="w-full bg-green-600 hover:bg-green-500 rounded-lg py-2 text-sm font-semibold transition"
            >
              ✅ Repay Loan
            </button>
          )}

          {credit.creditLimit === 0 && (
            <div className="text-xs text-red-400 text-center py-2">
              🔴 No credit available. Build your reputation to qualify.
            </div>
          )}
        </div>
      ) : action === 'borrow' ? (
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Amount in USDC"
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            max={credit.creditLimit}
            className="w-full bg-black rounded-lg px-3 py-2 text-sm outline-none border border-zinc-700 text-white"
          />
          <div className="text-xs text-zinc-400">
            Max: ${credit.creditLimit.toLocaleString()}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBorrow}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold transition"
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
            <button
              onClick={() => {
                setAction('view')
                setMessage('')
              }}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 rounded-lg py-2 text-sm font-semibold transition"
            >
              Cancel
            </button>
          </div>
          <div className="text-xs text-zinc-300 bg-zinc-950 rounded-lg p-2">
            ℹ️ 14-day term, no interest. On-time repayment boosts reputation.
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="bg-black rounded-lg p-3 text-sm">
            <div className="text-zinc-400 mb-1">Repay amount:</div>
            <div className="text-xl font-bold text-green-400">
              ${credit.activeLoan?.amount}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRepay}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg py-2 text-sm font-semibold transition"
            >
              {loading ? 'Processing...' : 'Confirm Repayment'}
            </button>
            <button
              onClick={() => {
                setAction('view')
                setMessage('')
              }}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 rounded-lg py-2 text-sm font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className="text-xs text-center mt-3 p-2 rounded-lg bg-zinc-800">
          {message}
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-zinc-500 mt-4 space-y-1">
        <div>✅ No collateral required</div>
        <div>✅ Reputation-based limits</div>
        <div>✅ On-time repayment = better tier</div>
      </div>
    </div>
  )
}
