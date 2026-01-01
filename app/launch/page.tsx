'use client'

import { useEffect, useState } from 'react'
import { useAccount, useWriteContract } from 'wagmi'

const CLAIM_CONTRACT = '0xYOUR_CLAIM_CONTRACT'
const TOTAL_AIRDROP = 400_000_000 // 40% of supply

const CLAIM_ABI = [
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  }
]

export default function LaunchPage() {
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  const [claimed, setClaimed] = useState(0)
  const [now, setNow] = useState(Date.now())

  // fake progress for UI (replace with real onchain read later)
  useEffect(() => {
    setClaimed(82_500_000)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const launchTime = new Date('2026-01-10T12:00:00Z').getTime()
  const diff = launchTime - now

  const live = diff <= 0

  const hours = Math.max(0, Math.floor(diff / 1000 / 60 / 60))
  const mins = Math.max(0, Math.floor((diff / 1000 / 60) % 60))
  const secs = Math.max(0, Math.floor((diff / 1000) % 60))

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-6">

        <h1 className="text-2xl font-bold text-center">
          🚀 BSTN Launch Event
        </h1>

        {!live && (
          <div className="mt-4 text-center">
            <p className="text-zinc-400 mb-2">Claim opens in</p>
            <div className="text-3xl font-mono font-bold">
              {hours}h {mins}m {secs}s
            </div>
          </div>
        )}

        {live && (
          <>
            <div className="mt-6">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Claimed</span>
                <span>
                  {claimed.toLocaleString()} / {TOTAL_AIRDROP.toLocaleString()} BSTN
                </span>
              </div>
              <div className="w-full h-3 bg-black rounded-full mt-2">
                <div
                  className="h-3 bg-green-500 rounded-full transition-all"
                  style={{
                    width: `${(claimed / TOTAL_AIRDROP) * 100}%`
                  }}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-2">
                {((claimed / TOTAL_AIRDROP) * 100).toFixed(1)}% claimed
              </p>
            </div>

            <button
              onClick={() =>
                writeContract({
                  address: CLAIM_CONTRACT as `0x${string}`,
                  abi: CLAIM_ABI,
                  functionName: 'claim'
                })
              }
              disabled={!address}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed transition rounded-xl py-3 font-semibold"
            >
              {address ? 'Claim BSTN' : 'Connect Wallet'}
            </button>
          </>
        )}

        <div className="mt-6 space-y-3">
          <div className="bg-black rounded-lg p-4 text-sm">
            <p className="text-zinc-400 mb-2">📊 Airdrop Details</p>
            <ul className="space-y-1 text-xs text-zinc-300">
              <li>• Total: 400M BSTN (40% of supply)</li>
              <li>• Based on XP earned</li>
              <li>• One-time claim per wallet</li>
              <li>• Trade on Uniswap V3</li>
            </ul>
          </div>

          <div className="space-y-2 text-center text-sm">
            <a
              href="/leaderboard"
              className="block text-blue-400 hover:underline py-2"
            >
              📈 View XP Leaderboard
            </a>
            <a
              href="https://app.uniswap.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 hover:underline py-2"
            >
              💱 Trade BSTN on Uniswap
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
