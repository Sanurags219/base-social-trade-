'use client'

import { useAccount, useWriteContract } from 'wagmi'
import { useState } from 'react'

const CLAIM_CONTRACT = '0xYOUR_CLAIM_CONTRACT_ADDRESS'
const CLAIM_ABI = [
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'claimed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'xpSnapshot',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

export default function ClaimPage() {
  const { address } = useAccount()
  const { writeContract, isPending } = useWriteContract()
  const [status, setStatus] = useState<string>('')

  const handleClaim = async () => {
    if (!address) {
      setStatus('Please connect your wallet')
      return
    }

    setStatus('Processing claim...')

    try {
      writeContract(
        {
          address: CLAIM_CONTRACT as `0x${string}`,
          abi: CLAIM_ABI,
          functionName: 'claim'
        },
        {
          onSuccess: () => {
            setStatus('✅ BSTN claimed successfully!')
          },
          onError: (error) => {
            setStatus(`❌ Error: ${error?.message || 'Claim failed'}`)
          }
        }
      )
    } catch (error: any) {
      setStatus(`❌ Error: ${error?.message || 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2">Claim BSTN</h1>
        <p className="text-zinc-400 mb-6">Convert your XP to Base Social Token</p>

        <div className="bg-zinc-900 rounded-xl p-6 mb-6">
          <p className="text-zinc-400 text-sm mb-2">Your Address</p>
          <p className="text-lg font-mono truncate">
            {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Not connected'}
          </p>
        </div>

        <button
          onClick={handleClaim}
          disabled={!address || isPending}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:cursor-not-allowed transition rounded-xl py-3 font-semibold mb-4"
        >
          {isPending ? 'Claiming...' : 'Claim BSTN'}
        </button>

        {status && (
          <div className={`p-4 rounded-xl ${status.startsWith('✅') ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {status}
          </div>
        )}

        <div className="mt-6 bg-zinc-900 rounded-xl p-4 text-sm text-zinc-400">
          <p className="font-semibold mb-2">How it works:</p>
          <ul className="space-y-1 text-xs">
            <li>• 100 BSTN per 1000 XP earned</li>
            <li>• One-time claim per wallet</li>
            <li>• Admin takes XP snapshot</li>
            <li>• Claim your tokens here</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
