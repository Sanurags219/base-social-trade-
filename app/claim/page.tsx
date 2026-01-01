'use client'

import { useAccount, useWriteContract, useChainId } from 'wagmi'
import { useEffect, useState } from 'react'

const CLAIM_CONTRACT = '0xYOUR_CLAIM_CONTRACT_ADDRESS'
const BASE_CHAIN_ID = 8453
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
  },
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const

export default function ClaimPage() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { writeContract, isPending } = useWriteContract()
  const [status, setStatus] = useState<string>('')
  const [userClaimed, setUserClaimed] = useState(false)
  const [contractPaused, setContractPaused] = useState(false)

  const wrongNetwork = chainId !== BASE_CHAIN_ID

  useEffect(() => {
    const checkClaimStatus = async () => {
      if (!address) return

      try {
        // Check if user already claimed (would need contract read)
        // This is a placeholder - in production, read from contract
        const claimed = localStorage.getItem(`claimed_${address}`)
        if (claimed) {
          setUserClaimed(true)
          setStatus('✅ Already claimed - one claim per wallet')
        }
      } catch (error) {
        console.error('Error checking claim status:', error)
      }
    }

    checkClaimStatus()
  }, [address])

  const handleClaim = async () => {
    if (!address) {
      setStatus('Please connect your wallet')
      return
    }

    if (wrongNetwork) {
      setStatus('❌ Please switch to Base network')
      return
    }

    if (userClaimed) {
      setStatus('✅ Already claimed - one claim per wallet')
      return
    }

    if (contractPaused) {
      setStatus('⏸️ Claims are temporarily paused')
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
            localStorage.setItem(`claimed_${address}`, 'true')
            setUserClaimed(true)
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

        {wrongNetwork && (
          <div className="bg-red-900 text-red-200 rounded-xl p-4 mb-4">
            ⚠️ Wrong network. Please switch to Base.
          </div>
        )}

        <div className="bg-zinc-900 rounded-xl p-6 mb-6">
          <p className="text-zinc-400 text-sm mb-2">Your Address</p>
          <p className="text-lg font-mono truncate">
            {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Not connected'}
          </p>
          <p className="text-zinc-500 text-xs mt-2">
            {wrongNetwork && '❌ Wrong network'}
            {!wrongNetwork && address && '✅ Base network'}
          </p>
        </div>

        <button
          onClick={handleClaim}
          disabled={!address || isPending || userClaimed || wrongNetwork || contractPaused}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:cursor-not-allowed transition rounded-xl py-3 font-semibold mb-4"
        >
          {isPending ? 'Claiming...' : userClaimed ? 'Already Claimed' : 'Claim BSTN'}
        </button>

        {status && (
          <div className={`p-4 rounded-xl ${status.startsWith('✅') ? 'bg-green-900 text-green-200' : status.includes('⚠️') || status.includes('⏸️') ? 'bg-yellow-900 text-yellow-200' : 'bg-red-900 text-red-200'}`}>
            {status}
          </div>
        )}

        <div className="mt-6 bg-zinc-900 rounded-xl p-4 text-sm text-zinc-400">
          <p className="font-semibold mb-2">Security:</p>
          <ul className="space-y-1 text-xs">
            <li>✅ One-time claim per wallet (immutable)</li>
            <li>✅ Snapshot locked after admin setup</li>
            <li>✅ Emergency pause in case of issues</li>
            <li>✅ Base network required</li>
          </ul>
        </div>

        <div className="mt-4 bg-zinc-900 rounded-xl p-4 text-sm text-zinc-400">
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
