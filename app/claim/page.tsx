'use client'

import { useAccount, useWriteContract, useChainId } from 'wagmi'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const CLAIM_CONTRACT = process.env.NEXT_PUBLIC_BSTN_CLAIM || '0xC822EFcF4DD0f84FF7718266F79A65DEbE418538'
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
      // TODO: Read claimed status from smart contract
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
    <div className="min-h-screen bg-[#05060A] text-white px-3 py-6">
      <div className="max-w-md mx-auto">

        <h1 className="text-lg font-semibold tracking-tight mb-4">
          Claim BSTN
        </h1>

        {wrongNetwork && (
          <div className="mb-4 rounded-xl bg-red-900/50 border border-red-500/30 px-4 py-3 text-sm text-red-200">
            ⚠️ Wrong network. Please switch to Base.
          </div>
        )}

        <Card>
          <p className="text-xs text-zinc-500 mb-1">
            Your allocation
          </p>

          <div className="text-3xl font-bold mb-1">
            1,250 BSTN
          </div>

          <p className="text-xs text-zinc-500 mb-4">
            Based on your XP snapshot
          </p>

          <div className="mb-4 p-3 rounded-xl bg-black/50 border border-[#1E293B]">
            <p className="text-xs text-zinc-500 mb-1">Connected wallet</p>
            <p className="text-sm font-mono text-zinc-300">
              {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : 'Not connected'}
            </p>
          </div>

          <Button
            onClick={handleClaim}
            disabled={!address || isPending || userClaimed || wrongNetwork || contractPaused}
          >
            {isPending ? 'Claiming...' : userClaimed ? 'Already Claimed' : 'Claim Tokens'}
          </Button>

          {status && (
            <div className={`mt-4 p-3 rounded-xl text-sm ${
              status.startsWith('✅') 
                ? 'bg-green-900/30 border border-green-500/30 text-green-300' 
                : status.includes('⏸️') 
                  ? 'bg-yellow-900/30 border border-yellow-500/30 text-yellow-300' 
                  : 'bg-red-900/30 border border-red-500/30 text-red-300'
            }`}>
              {status}
            </div>
          )}
        </Card>

        <div className="mt-4">
          <Card>
            <p className="text-xs text-zinc-500 mb-2">How it works</p>
            <ul className="space-y-1 text-xs text-zinc-400">
              <li>• 100 BSTN per 1,000 XP earned</li>
              <li>• One-time claim per wallet</li>
              <li>• Tokens sent directly to your wallet</li>
            </ul>
          </Card>
        </div>

      </div>
    </div>
  )
}
