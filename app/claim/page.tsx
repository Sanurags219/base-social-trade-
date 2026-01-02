'use client'

import { useAccount, useWriteContract, useReadContract, useChainId } from 'wagmi'
import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const SBT_CONTRACT = process.env.NEXT_PUBLIC_REP_CONTRACT || '0xa8efb84f532278fd3a68fe4e0d4fe15c04e5b786'
const XP_CONTRACT = process.env.NEXT_PUBLIC_XP_CONTRACT || '0x9d357e2ca64199bb80db0fb356514d1f7e315edd'
const BASE_CHAIN_ID = 8453

const SBT_ABI = [
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'hasClaimed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'getReputation',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'score', type: 'uint256' },
      { name: 'lastUpdated', type: 'uint256' }
    ]
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  }
] as const

const XP_ABI = [
  {
    name: 'recordDaily',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: []
  },
  {
    name: 'getUserXP',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'xp', type: 'uint256' },
      { name: 'trades', type: 'uint256' },
      { name: 'streak', type: 'uint256' },
      { name: 'level', type: 'uint256' },
      { name: 'nextLevelXP', type: 'uint256' }
    ]
  }
] as const

export default function ClaimPage() {
  const { address } = useAccount()
  const chainId = useChainId()
  const { writeContract, isPending } = useWriteContract()
  const [status, setStatus] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'sbt' | 'xp'>('sbt')

  const wrongNetwork = chainId !== BASE_CHAIN_ID

  const { data: hasClaimed, refetch: refetchClaimed } = useReadContract({
    address: SBT_CONTRACT as `0x${string}`,
    abi: SBT_ABI,
    functionName: 'hasClaimed',
    args: address ? [address] : undefined,
  })

  const { data: reputation } = useReadContract({
    address: SBT_CONTRACT as `0x${string}`,
    abi: SBT_ABI,
    functionName: 'getReputation',
    args: address ? [address] : undefined,
  })

  const { data: totalSupply } = useReadContract({
    address: SBT_CONTRACT as `0x${string}`,
    abi: SBT_ABI,
    functionName: 'totalSupply',
  })

  const { data: userXP, refetch: refetchXP } = useReadContract({
    address: XP_CONTRACT as `0x${string}`,
    abi: XP_ABI,
    functionName: 'getUserXP',
    args: address ? [address] : undefined,
  })

  const handleClaimSBT = async () => {
    if (!address || wrongNetwork) return
    setStatus('Claiming SBT...')

    try {
      writeContract(
        {
          address: SBT_CONTRACT as `0x${string}`,
          abi: SBT_ABI,
          functionName: 'claim'
        },
        {
          onSuccess: () => {
            setStatus('SBT Claimed! You are now a Baseline PRO member.')
            refetchClaimed()
          },
          onError: (error) => {
            if (error.message.includes('Already claimed')) {
              setStatus('You have already claimed your SBT')
            } else {
              setStatus(`Error: ${error.message}`)
            }
          }
        }
      )
    } catch (error: any) {
      setStatus(`Error: ${error?.message || 'Unknown error'}`)
    }
  }

  const handleClaimDailyXP = async () => {
    if (!address || wrongNetwork) return
    setStatus('Claiming daily XP...')

    try {
      writeContract(
        {
          address: XP_CONTRACT as `0x${string}`,
          abi: XP_ABI,
          functionName: 'recordDaily',
          args: [address]
        },
        {
          onSuccess: () => {
            setStatus('+100 XP claimed! Come back tomorrow.')
            refetchXP()
          },
          onError: (error) => {
            if (error.message.includes('Already claimed')) {
              setStatus('Already claimed today. Come back tomorrow!')
            } else {
              setStatus(`Error: ${error.message}`)
            }
          }
        }
      )
    } catch (error: any) {
      setStatus(`Error: ${error?.message || 'Unknown error'}`)
    }
  }

  return (
    <AppShell>
      <h1 className="text-lg font-semibold mb-4">Claim Rewards</h1>

      {wrongNetwork && (
        <div className="mb-4 rounded-xl bg-red-900/30 border border-red-500/20 px-4 py-3 text-sm text-red-300">
          Wrong network. Please switch to Base.
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('sbt')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'sbt'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          🏆 Reputation SBT
        </button>
        <button
          onClick={() => setActiveTab('xp')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === 'xp'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          ⚡ Daily XP
        </button>
      </div>

      {activeTab === 'sbt' && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h2 className="font-semibold">Baseline PRO SBT</h2>
              <p className="text-sm text-zinc-400">Soulbound reputation token</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Your Score</p>
              <p className="text-xl font-bold text-green-400">
                {reputation ? Number(reputation[0]) : hasClaimed ? 500 : 0}
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-500">Total Minted</p>
              <p className="text-xl font-bold">{totalSupply?.toString() || '0'} / 30,000</p>
            </div>
          </div>

          <div className="bg-zinc-800/30 rounded-lg p-3 mb-4">
            <p className="text-xs text-zinc-400 mb-2">✨ Benefits</p>
            <ul className="text-sm text-zinc-300 space-y-1">
              <li>• On-chain reputation proof</li>
              <li>• Access to PRO features</li>
              <li>• Higher copy-trading limits</li>
              <li>• Governance voting rights</li>
            </ul>
          </div>

          <Button
            onClick={handleClaimSBT}
            disabled={!address || isPending || hasClaimed || wrongNetwork}
          >
            {isPending ? 'Claiming...' : hasClaimed ? '✅ Already Claimed' : 'Claim SBT (Free + Gas)'}
          </Button>

          <p className="text-xs text-zinc-500 mt-2 text-center">
            One claim per wallet. Only pay gas fees.
          </p>
        </Card>
      )}

      {activeTab === 'xp' && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h2 className="font-semibold">Daily XP Claim</h2>
              <p className="text-sm text-zinc-400">+100 XP every day</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Total XP</p>
              <p className="text-lg font-bold text-yellow-400">
                {userXP ? Number(userXP[0]) : 0}
              </p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Level</p>
              <p className="text-lg font-bold">{userXP ? Number(userXP[3]) : 1}</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
              <p className="text-xs text-zinc-500">Streak</p>
              <p className="text-lg font-bold text-orange-400">
                {userXP ? Number(userXP[2]) : 0} 🔥
              </p>
            </div>
          </div>

          <div className="bg-zinc-800/30 rounded-lg p-3 mb-4">
            <p className="text-xs text-zinc-400 mb-2">🎯 XP Sources (On-Chain)</p>
            <ul className="text-sm text-zinc-300 space-y-1">
              <li>• Daily check-in: +100 XP</li>
              <li>• Swap tokens: +10 XP + volume bonus</li>
              <li>• Copy trade: +50 XP</li>
              <li>• Share profile: +25 XP</li>
            </ul>
          </div>

          <Button
            onClick={handleClaimDailyXP}
            disabled={!address || isPending || wrongNetwork}
          >
            {isPending ? 'Claiming...' : 'Claim Daily XP (Free + Gas)'}
          </Button>

          <p className="text-xs text-zinc-500 mt-2 text-center">
            Claim once per day. Maintain streak for bonuses!
          </p>
        </Card>
      )}

      {status && (
        <div className={`mt-4 rounded-lg p-3 text-sm ${
          status.includes('Error') ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'
        }`}>
          {status}
        </div>
      )}
    </AppShell>
  )
}
