'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { getFactoryAddress, FACTORY_ABI } from '@/lib/copyvault'

interface AutoCopySettingsProps {
  traderAddress: string
  traderTier: string
  traderReputation: number
  onClose: () => void
}

export function AutoCopySettings({
  traderAddress,
  traderTier,
  traderReputation,
  onClose
}: AutoCopySettingsProps) {
  const { address } = useAccount()
  const [copyPercent, setCopyPercent] = useState(10)
  const [message, setMessage] = useState('')

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  const isEligible = traderReputation >= 650

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      setMessage('Vault created! Deposit ETH to start copy trading.')
      setTimeout(() => onClose(), 2000)
    }
  }, [isSuccess, onClose])

  const handleEnableAutoCopy = () => {
    if (!address || !isEligible) return

    setMessage('Confirm in wallet...')

    try {
      writeContract({
        address: getFactoryAddress() as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'createVault',
        args: [traderAddress as `0x${string}`, BigInt(copyPercent)]
      })
    } catch (e: unknown) {
      const err = e as { shortMessage?: string }
      setMessage(err?.shortMessage || 'Failed to create vault')
    }
  }

  if (!isEligible) {
    return (
      <div className="bg-zinc-900 rounded-xl p-6 border border-red-500">
        <h3 className="font-semibold mb-2 text-red-400">❌ Not Eligible</h3>
        <p className="text-sm text-zinc-300 mb-3">
          Only traders with Trusted+ reputation (650+) are eligible for auto-copy.
        </p>
        <p className="text-sm text-zinc-400">
          Current reputation: {traderReputation} ({traderTier})
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-zinc-700 hover:bg-zinc-600 rounded-lg py-2 text-sm font-semibold transition"
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-6 border border-blue-500">
      <h3 className="font-semibold mb-4">⚙️ Auto Copy Settings</h3>

      {/* Copy Percentage */}
      <div className="mb-6">
        <label className="text-sm text-zinc-400 block mb-2">
          Allocation: <span className="text-blue-400 font-semibold">{copyPercent}%</span>
        </label>
        <input
          type="range"
          min="5"
          max="50"
          step="5"
          value={copyPercent}
          onChange={(e) => setCopyPercent(Number(e.target.value))}
          className="w-full cursor-pointer"
        />
        <div className="text-xs text-zinc-500 mt-2">
          Of each trade, {copyPercent}% of your balance will be mirrored
        </div>
      </div>

      {/* Default Info */}
      <div className="bg-black rounded-lg p-3 mb-6 text-sm text-zinc-300 space-y-1">
        <div>✅ Slippage: capped at 1%</div>
        <div>✅ No lockup period</div>
        <div>✅ Withdraw anytime</div>
        <div>✅ Non-custodial vault</div>
      </div>

      {/* Fee Info */}
      <div className="bg-zinc-950 rounded-lg p-3 mb-6 text-xs text-zinc-400">
        <div className="font-semibold text-zinc-300 mb-1">📊 Fees (MVP)</div>
        <div>• Protocol fee: 0% (free during beta)</div>
        <div>• Trader reward: paid in BSTN (future)</div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleEnableAutoCopy}
          disabled={isPending || isConfirming}
          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg py-3 font-semibold transition"
        >
          {isPending || isConfirming ? 'Confirm in wallet...' : 'Create Vault'}
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-zinc-700 hover:bg-zinc-600 rounded-lg py-3 font-semibold transition"
        >
          Cancel
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className="text-xs text-center mt-3 p-2 rounded-lg bg-zinc-800">
          {message}
        </div>
      )}
    </div>
  )
}
