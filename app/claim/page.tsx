'use client'

import { useAccount, useWriteContract, useChainId } from 'wagmi'
import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
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
  }
] as const

export default function ClaimPage() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { writeContract, isPending } = useWriteContract()
  const [status, setStatus] = useState<string>('')
  const [userClaimed, setUserClaimed] = useState(false)

  const wrongNetwork = chainId !== BASE_CHAIN_ID

  const handleClaim = async () => {
    if (!address) {
      setStatus('Please connect your wallet')
      return
    }

    if (wrongNetwork) {
      setStatus('Please switch to Base network')
      return
    }

    setStatus('Processing...')

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
            setStatus('Claimed successfully')
          },
          onError: (error) => {
            setStatus(`Error: ${error?.message || 'Claim failed'}`)
          }
        }
      )
    } catch (error: any) {
      setStatus(`Error: ${error?.message || 'Unknown error'}`)
    }
  }

  return (
    <AppShell>
      <h1 className="text-lg font-semibold mb-4">
        Claim BSTN
      </h1>

      {wrongNetwork && (
        <div className="mb-4 rounded-xl bg-red-900/30 border border-red-500/20 px-4 py-3 text-sm text-red-300">
          Wrong network. Please switch to Base.
        </div>
      )}

      <Card>
        <p className="text-sm text-zinc-400 mb-1">
          Your allocation
        </p>

        <div className="text-3xl font-bold mb-1">
          1,250 BSTN
        </div>

        <p className="text-xs text-zinc-500 mb-4">
          Based on your XP snapshot
        </p>

        <Button
          onClick={handleClaim}
          disabled={!address || isPending || userClaimed || wrongNetwork}
        >
          {isPending ? 'Claiming...' : userClaimed ? 'Claimed' : 'Claim Tokens'}
        </Button>

        {status && (
          <p className={`mt-3 text-xs ${status.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {status}
          </p>
        )}
      </Card>
    </AppShell>
  )
}
