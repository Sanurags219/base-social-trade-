'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount, useWriteContract, useReadContract, useChainId } from 'wagmi'
import { AppShell } from '@/components/AppShell'
import { ConnectFallback } from '@/components/ConnectFallback'
import { ProfileCard } from '@/components/ProfileCard'
import { Gift, Share2, FileCheck, UserPlus, Star, ChevronRight, Zap, Check, Shield, Award, Sparkles, ArrowLeftRight, Users, Coins } from 'lucide-react'

// Contract addresses on Base Mainnet
const SBT_CONTRACT = '0xa8efb84f532278fd3a68fe4e0d4fe15c04e5b786' as const
const XP_CONTRACT = '0x9d357e2ca64199bb80db0fb356514d1f7e315edd' as const
const BSTN_TOKEN = '0x0000000000000000000000000000000000000000' as const // Placeholder - deploy your BSTN token
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
    name: 'claimSwapReward',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'user', type: 'address' }, { name: 'txCount', type: 'uint256' }],
    outputs: []
  },
  {
    name: 'claimCopyTradeReward',
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
  },
  {
    name: 'hasClaimedSwapReward',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'hasClaimedCopyReward',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const

interface EventTask {
  id: string
  title: string
  description: string
  xp: number
  bstn?: number
  icon: React.ReactNode
  action: string
  completed: boolean
  onchain?: boolean
  requirement?: string
}

export default function EventsPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, isPending } = useWriteContract()
  const [totalXP, setTotalXP] = useState(0)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const [claimedTasks, setClaimedTasks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)
  const [sbtStatus, setSbtStatus] = useState<string>('')
  const [txCount, setTxCount] = useState(0)
  const [hasCopyTraded, setHasCopyTraded] = useState(false)

  const wrongNetwork = chainId !== BASE_CHAIN_ID

  // SBT contract reads
  const { data: hasClaimed, refetch: refetchClaimed } = useReadContract({
    address: SBT_CONTRACT,
    abi: SBT_ABI,
    functionName: 'hasClaimed',
    args: address ? [address] : undefined,
  })

  const { data: totalSupply } = useReadContract({
    address: SBT_CONTRACT,
    abi: SBT_ABI,
    functionName: 'totalSupply',
  })

  // Check on-chain XP data
  const { data: userXPData } = useReadContract({
    address: XP_CONTRACT,
    abi: XP_ABI,
    functionName: 'getUserXP',
    args: address ? [address] : undefined,
  })

  // Load from localStorage on mount
  useEffect(() => {
    if (address) {
      const addrLower = address.toLowerCase()
      const stored = localStorage.getItem('xp_' + addrLower)
      if (stored) {
        const data = JSON.parse(stored)
        setTotalXP(data.totalXP || 0)
        setCompletedTasks(new Set(data.completed || []))
        setClaimedTasks(new Set(data.claimed || []))
      }
      
      // Load tx count from localStorage (try both formats)
      const txStored = localStorage.getItem('tx_count_' + addrLower) || localStorage.getItem('tx_count_' + address)
      if (txStored) setTxCount(parseInt(txStored) || 0)
      
      // Check copy trade status (try both formats)
      const copyStored = localStorage.getItem('copy_traded_' + addrLower) || localStorage.getItem('copy_traded_' + address)
      if (copyStored === 'true') setHasCopyTraded(true)
    }
  }, [address])

  // Save to localStorage
  const saveProgress = useCallback((xp: number, completed: Set<string>, claimed: Set<string>) => {
    if (address) {
      localStorage.setItem('xp_' + address, JSON.stringify({
        totalXP: xp,
        completed: Array.from(completed),
        claimed: Array.from(claimed)
      }))
    }
  }, [address])

  const tasks: EventTask[] = useMemo(() => [
    {
      id: 'connect-wallet',
      title: 'Connect Wallet',
      description: 'Connect your wallet to get started',
      xp: 50,
      icon: <UserPlus size={20} className="text-teal-400" />,
      action: 'claim',
      completed: isConnected
    },
    {
      id: 'view-portfolio',
      title: 'View Portfolio Health',
      description: 'Check your wallet health score',
      xp: 25,
      icon: <FileCheck size={20} className="text-blue-400" />,
      action: 'go',
      completed: completedTasks.has('view-portfolio')
    },
    {
      id: 'five-transactions',
      title: 'Complete 5 Transactions',
      description: 'Swap any amount 5 times to unlock',
      xp: 200,
      bstn: 50,
      icon: <ArrowLeftRight size={20} className="text-green-400" />,
      action: 'claim-onchain',
      completed: claimedTasks.has('five-transactions'),
      onchain: true,
      requirement: txCount + '/5 swaps completed'
    },
    {
      id: 'copy-trade',
      title: 'Use Copy Trading',
      description: 'Copy any trader with any amount',
      xp: 100,
      bstn: 10,
      icon: <Users size={20} className="text-orange-400" />,
      action: 'claim-onchain',
      completed: claimedTasks.has('copy-trade'),
      onchain: true,
      requirement: hasCopyTraded ? 'Eligible!' : 'Not yet'
    },
    {
      id: 'share-farcaster',
      title: 'Share on Farcaster',
      description: 'Share your health score to earn XP',
      xp: 100,
      icon: <Share2 size={20} className="text-purple-400" />,
      action: 'share',
      completed: completedTasks.has('share-farcaster')
    },
    {
      id: 'explore-traders',
      title: 'Explore Top Traders',
      description: 'Browse copy trading opportunities',
      xp: 30,
      icon: <Star size={20} className="text-yellow-400" />,
      action: 'go',
      completed: completedTasks.has('explore-traders')
    },
    {
      id: 'daily-checkin',
      title: 'Daily Check-in',
      description: 'Visit the app daily to earn bonus XP',
      xp: 10,
      icon: <Gift size={20} className="text-pink-400" />,
      action: 'claim',
      completed: completedTasks.has('daily-checkin')
    }
  ], [isConnected, completedTasks, claimedTasks, txCount, hasCopyTraded])

  const handleClaimSBT = async () => {
    if (!address || wrongNetwork) return
    setSbtStatus('Claiming SBT...')

    try {
      writeContract(
        {
          address: SBT_CONTRACT,
          abi: SBT_ABI,
          functionName: 'claim'
        },
        {
          onSuccess: () => {
            setSbtStatus('SBT Claimed! You are now a Baseline PRO member.')
            refetchClaimed()
          },
          onError: (error) => {
            if (error.message.includes('Already claimed')) {
              setSbtStatus('You have already claimed your SBT')
            } else {
              setSbtStatus('Error: ' + error.message)
            }
          }
        }
      )
    } catch (error: any) {
      setSbtStatus('Error: ' + (error?.message || 'Unknown error'))
    }
  }

  const handleOnchainClaim = async (taskId: string) => {
    if (!address) return
    
    setLoading(taskId)

    // Use localStorage for now - can upgrade to on-chain when contract is deployed
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate tx

    try {
      if (taskId === 'five-transactions') {
        if (txCount < 5) {
          alert('Complete 5 swap transactions first!')
          setLoading(null)
          return
        }

        const newClaimed = new Set(claimedTasks)
        newClaimed.add(taskId)
        setClaimedTasks(newClaimed)
        
        const newXP = totalXP + 200
        setTotalXP(newXP)
        saveProgress(newXP, completedTasks, newClaimed)
        setLoading(null)
        
      } else if (taskId === 'copy-trade') {
        if (!hasCopyTraded) {
          alert('Use copy trading first!')
          setLoading(null)
          return
        }

        const newClaimed = new Set(claimedTasks)
        newClaimed.add(taskId)
        setClaimedTasks(newClaimed)
        
        const newXP = totalXP + 100
        setTotalXP(newXP)
        saveProgress(newXP, completedTasks, newClaimed)
        setLoading(null)
      }
    } catch (error: any) {
      console.error('Claim failed:', error)
      setLoading(null)
    }
  }

  const handleTaskAction = useCallback(async (task: EventTask) => {
    if (claimedTasks.has(task.id)) return

    setLoading(task.id)

    if (task.action === 'go') {
      if (task.id === 'view-portfolio') {
        window.location.href = '/portfolio'
      } else if (task.id === 'explore-traders') {
        window.location.href = '/traders'
      }
      return
    }

    if (task.action === 'claim-onchain') {
      await handleOnchainClaim(task.id)
      return
    }

    if (task.action === 'share') {
      const text = 'I am earning XP rewards on Base Social Trade!\n\nCheck out the app and start earning too'
      const url = 'https://base-social-trade.vercel.app'
      window.open('https://warpcast.com/~/compose?text=' + encodeURIComponent(text) + '&embeds[]=' + encodeURIComponent(url), '_blank')
    }

    // Mark as completed and claimed
    await new Promise(resolve => setTimeout(resolve, 500))

    const newCompleted = new Set(completedTasks)
    newCompleted.add(task.id)

    const newClaimed = new Set(claimedTasks)
    newClaimed.add(task.id)
    
    const newXP = totalXP + task.xp

    setCompletedTasks(newCompleted)
    setClaimedTasks(newClaimed)
    setTotalXP(newXP)
    saveProgress(newXP, newCompleted, newClaimed)
    setLoading(null)
  }, [totalXP, completedTasks, claimedTasks, saveProgress, handleOnchainClaim])

  if (!isConnected) {
    return (
      <AppShell>
        <main className="px-4 pt-20 text-center">
          <p className="text-sm text-zinc-400">
            Connect your wallet to view events
          </p>
          <ConnectFallback />
        </main>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <main className="bg-[#05060A] pb-24">
        <div className="space-y-6">
          {/* Farcaster Profile Card */}
          <ProfileCard showFullCard={true} />

          {/* XP Banner */}
          <div className="mx-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500/20 via-blue-500/20 to-purple-500/20 p-[1px]">
            <div className="relative rounded-2xl bg-gradient-to-br from-[#0E1F24] to-[#071317] p-6">
              <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.15),transparent_50%)] pointer-events-none" />

              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Total XP Earned</p>
                  <div className="flex items-center gap-2">
                    <Zap size={24} className="text-yellow-400" />
                    <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {totalXP.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-zinc-400 mb-1">Level</p>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {Math.floor(totalXP / 100) + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>{totalXP % 100} / 100 XP</span>
                  <span>Next Level</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-400 transition-all duration-500"
                    style={{ width: (totalXP % 100) + '%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SBT Claim Section */}
          <div className="mx-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px]">
              <div className="relative rounded-2xl bg-gradient-to-br from-[#0E1F24] to-[#071317] p-5">
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)] pointer-events-none" />
                
                <div className="relative">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                        <Shield size={24} className="text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          Baseline PRO SBT
                          <Sparkles size={14} className="text-yellow-400" />
                        </h3>
                        <p className="text-xs text-zinc-400">Soulbound reputation token</p>
                      </div>
                    </div>
                    
                    {hasClaimed && (
                      <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                        <Check size={12} />
                        Claimed
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-zinc-500">Total Minted</p>
                      <p className="text-lg font-semibold text-white">
                        {totalSupply?.toString() || '0'} <span className="text-xs text-zinc-500">/ 30,000</span>
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-zinc-500">Claim Bonus</p>
                      <p className="text-lg font-semibold text-yellow-400 flex items-center gap-1">
                        <Zap size={16} />
                        +500 XP
                      </p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="bg-white/5 rounded-xl p-3 mb-4">
                    <p className="text-xs text-zinc-400 mb-2">Benefits</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <Award size={12} className="text-teal-400" />
                        On-chain reputation
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Star size={12} className="text-purple-400" />
                        PRO features access
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap size={12} className="text-yellow-400" />
                        Higher copy limits
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Gift size={12} className="text-pink-400" />
                        Exclusive airdrops
                      </div>
                    </div>
                  </div>

                  {/* Claim Button */}
                  <button
                    onClick={handleClaimSBT}
                    disabled={!address || isPending || hasClaimed || wrongNetwork}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white"
                  >
                    {isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Claiming...
                      </span>
                    ) : hasClaimed ? (
                      <span className="flex items-center justify-center gap-2">
                        <Check size={16} />
                        Already Claimed
                      </span>
                    ) : wrongNetwork ? (
                      'Switch to Base Network'
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Shield size={16} />
                        Claim SBT (Free + Gas)
                      </span>
                    )}
                  </button>

                  {sbtStatus && (
                    <p className={'text-xs mt-2 text-center ' + (sbtStatus.includes('Error') ? 'text-red-400' : 'text-green-400')}>
                      {sbtStatus}
                    </p>
                  )}

                  <p className="text-[10px] text-zinc-500 mt-2 text-center">
                    One claim per wallet. Only pay gas fees.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* On-Chain Rewards Section */}
          <div className="px-4">
            <div className="flex items-center gap-2 mb-3">
              <Coins size={18} className="text-yellow-400" />
              <h2 className="text-lg font-semibold text-white">On-Chain Rewards</h2>
            </div>
            <p className="text-sm text-zinc-400 mb-4">Complete tasks to earn XP + BSTN tokens (Base gas only)</p>
            
            <div className="space-y-3">
              {tasks.filter(t => t.onchain).map(task => {
                const isClaimed = claimedTasks.has(task.id)
                const isLoading = loading === task.id
                const canClaim = (task.id === 'five-transactions' && txCount >= 5) || 
                                 (task.id === 'copy-trade' && hasCopyTraded)

                return (
                  <div
                    key={task.id}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#0E1F24] to-[#071317] border border-white/10 p-4"
                  >
                    <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.05),transparent_50%)] pointer-events-none" />

                    <div className="relative">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                          {task.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white">{task.title}</p>
                            {isClaimed && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                                <Check size={12} />
                                Claimed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500">{task.description}</p>
                          <p className="text-xs text-teal-400 mt-1">{task.requirement}</p>
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-yellow-500/10">
                          <Zap size={14} className="text-yellow-400" />
                          <span className="text-sm font-semibold text-yellow-400">+{task.xp} XP</span>
                        </div>
                        {task.bstn && (
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-500/10">
                            <Coins size={14} className="text-teal-400" />
                            <span className="text-sm font-semibold text-teal-400">+{task.bstn} BSTN</span>
                          </div>
                        )}
                      </div>

                      {/* Claim Button */}
                      <button
                        onClick={() => handleTaskAction(task)}
                        disabled={isClaimed || isLoading || !canClaim}
                        className="w-full py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-400 hover:to-green-400 text-black"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            Claiming...
                          </span>
                        ) : isClaimed ? (
                          <span className="flex items-center justify-center gap-2">
                            <Check size={16} />
                            Claimed
                          </span>
                        ) : !canClaim ? (
                          task.id === 'five-transactions' ? 'Complete 5 swaps first' : 'Use copy trade first'
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Coins size={16} />
                            Claim Rewards
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section Title */}
          <div className="px-4">
            <h2 className="text-lg font-semibold text-white">Earn XP</h2>
            <p className="text-sm text-zinc-400">Complete tasks to level up</p>
          </div>

          {/* Task List */}
          <div className="px-4 space-y-3">
            {tasks.filter(t => !t.onchain).map(task => {
              const isClaimed = claimedTasks.has(task.id)
              const isLoading = loading === task.id

              return (
                <button
                  key={task.id}
                  onClick={() => handleTaskAction(task)}
                  disabled={isClaimed || isLoading}
                  className="w-full relative overflow-hidden rounded-xl bg-gradient-to-b from-[#0E1F24] to-[#071317] border border-white/10 p-4 text-left transition-all duration-200 hover:border-teal-500/30 disabled:opacity-60"
                >
                  <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.05),transparent_50%)] pointer-events-none" />

                  <div className="relative flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      {task.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{task.title}</p>
                        {isClaimed && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 text-xs">
                            <Check size={12} />
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10">
                        <Zap size={14} className="text-yellow-400" />
                        <span className="text-sm font-semibold text-yellow-400">+{task.xp}</span>
                      </div>

                      {!isClaimed && (
                        <ChevronRight size={16} className="text-zinc-500" />
                      )}
                    </div>
                  </div>

                  {isLoading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Info Card */}
          <div className="mx-4 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Coins size={18} className="text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Zero App Fees</p>
                <p className="text-xs text-zinc-400 mt-1">
                  All on-chain rewards are free to claim. You only pay Base network gas fees (~$0.01).
                </p>
              </div>
            </div>
          </div>

          {/* Farcaster Info Section */}
          <div className="mx-4 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Share2 size={18} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Farcaster Connected</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Your Farcaster identity is linked. Share achievements to earn bonus XP!
                </p>
                <a
                  href="https://warpcast.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Open Warpcast
                  <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  )
}