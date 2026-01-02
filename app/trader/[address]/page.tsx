'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { readReputationSBT, getReputationBadge } from '@/lib/sbt'
import { getFactoryAddress, getUserVaults, FACTORY_ABI } from '@/lib/copyvault'

type TraderData = {
  address: string
  reputation: number
  hasToken: boolean
  lastUpdated: number
}

export default function TraderProfile() {
  const params = useParams()
  const traderAddress = params.address as string
  const { address: userAddress } = useAccount()
  
  const [trader, setTrader] = useState<TraderData | null>(null)
  const [copyPercent, setCopyPercent] = useState(10)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [userVaults, setUserVaults] = useState<string[]>([])
  const [message, setMessage] = useState('')

  const { writeContract, data: txHash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash })

  // Fetch trader's on-chain reputation
  useEffect(() => {
    if (traderAddress) {
      readReputationSBT(traderAddress).then((rep) => {
        if (rep) {
          setTrader({
            address: traderAddress,
            reputation: rep.score,
            hasToken: rep.hasToken,
            lastUpdated: rep.lastUpdated
          })
        } else {
          setTrader({
            address: traderAddress,
            reputation: 0,
            hasToken: false,
            lastUpdated: 0
          })
        }
      })
    }
  }, [traderAddress])

  // Fetch user's existing vaults
  useEffect(() => {
    if (userAddress) {
      getUserVaults(userAddress).then(setUserVaults)
    }
  }, [userAddress, isSuccess])

  // Handle successful vault creation
  useEffect(() => {
    if (isSuccess) {
      setMessage('✅ Vault created! Deposit funds to start copy trading.')
      setShowCopyModal(false)
    }
  }, [isSuccess])

  const handleCreateVault = () => {
    if (!userAddress) {
      setMessage('❌ Connect wallet first')
      return
    }

    setMessage('⏳ Confirm in wallet...')

    try {
      writeContract({
        address: getFactoryAddress() as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'createVault',
        args: [traderAddress as `0x${string}`, BigInt(copyPercent)]
      })
    } catch (e: any) {
      setMessage(`❌ ${e?.shortMessage || 'Failed to create vault'}`)
    }
  }

  if (!trader) {
    return (
      <AppShell>
        <Card>
          <p className="text-sm text-zinc-400 text-center py-4">
            Loading on-chain data...
          </p>
        </Card>
      </AppShell>
    )
  }

  const badge = getReputationBadge(trader.reputation)

  return (
    <AppShell>
      <h1 className="text-lg font-semibold mb-4">
        Trader Profile
      </h1>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Wallet</p>
            <p className="font-medium font-mono">
              {traderAddress.slice(0, 6)}…{traderAddress.slice(-4)}
            </p>
          </div>
          {trader.hasToken && (
            <div className={`text-xs px-2 py-1 rounded ${badge.bgColor}`}>
              {badge.emoji} {badge.label}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mt-4">
          <div className="bg-black rounded-lg p-3">
            <p className="text-zinc-400 text-xs">Reputation</p>
            <p className={`font-bold text-xl ${badge.color}`}>
              {trader.reputation}
            </p>
          </div>
          <div className="bg-black rounded-lg p-3">
            <p className="text-zinc-400 text-xs">Status</p>
            <p className="font-semibold">
              {trader.hasToken ? '🔗 Verified' : '⏳ Unverified'}
            </p>
          </div>
        </div>

        {trader.lastUpdated > 0 && (
          <p className="text-xs text-zinc-500 mt-3">
            Last updated: {new Date(trader.lastUpdated * 1000).toLocaleDateString()}
          </p>
        )}
      </Card>

      {/* Copy Trading Section */}
      <div className="mt-4">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">🤖 Copy Trading</p>
            <span className="text-xs text-green-400 bg-green-900/20 px-2 py-0.5 rounded">
              On-Chain
            </span>
          </div>

          <p className="text-xs text-zinc-400 mb-4">
            Create a vault to automatically mirror this trader's positions. You stay in full control of your funds.
          </p>

          {!showCopyModal ? (
            <Button onClick={() => setShowCopyModal(true)} disabled={!userAddress}>
              {userAddress ? '🚀 Create Copy Vault' : 'Connect Wallet'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  Copy Percentage (5-50%)
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={copyPercent}
                  onChange={(e) => setCopyPercent(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-center text-lg font-bold text-blue-400">
                  {copyPercent}%
                </div>
              </div>

              <div className="text-xs text-zinc-300 bg-zinc-950 rounded-lg p-3">
                <p>✅ Non-custodial vault (you own it)</p>
                <p>✅ Withdraw anytime (no lockup)</p>
                <p>✅ {copyPercent}% of vault mirrors trades</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateVault}
                  disabled={isPending || isConfirming}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl py-3 text-sm font-semibold transition"
                >
                  {isPending ? '⏳ Confirm...' : isConfirming ? '⏳ Creating...' : 'Create Vault'}
                </button>
                <button
                  onClick={() => setShowCopyModal(false)}
                  className="flex-1 bg-zinc-700 hover:bg-zinc-600 rounded-xl py-3 text-sm font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* User's existing vaults */}
          {userVaults.length > 0 && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-400 mb-2">Your Vaults ({userVaults.length})</p>
              {userVaults.slice(0, 3).map((vault) => (
                <a
                  key={vault}
                  href={`https://basescan.org/address/${vault}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs font-mono text-blue-400 hover:text-blue-300 truncate"
                >
                  {vault}
                </a>
              ))}
            </div>
          )}

          {message && (
            <div className={`text-xs text-center mt-3 p-2 rounded-lg ${
              message.includes('✅') ? 'bg-green-900/30 text-green-400' :
              message.includes('❌') ? 'bg-red-900/30 text-red-400' :
              'bg-zinc-800 text-zinc-300'
            }`}>
              {message}
            </div>
          )}
        </Card>
      </div>

      {/* Links */}
      <div className="mt-4 flex justify-between text-xs">
        <a
          href={`/reputation/${traderAddress}`}
          className="text-zinc-500 hover:text-white transition"
        >
          View full reputation →
        </a>
        <a
          href={`https://basescan.org/address/${traderAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-white transition"
        >
          Basescan →
        </a>
      </div>
    </AppShell>
  )
}
