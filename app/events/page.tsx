'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAccount, useWriteContract, useReadContract, useChainId } from 'wagmi'
import { keccak256, toBytes } from 'viem'
import { AppShell } from '@/components/AppShell'
import { ConnectFallback } from '@/components/ConnectFallback'
import { ProfileCard } from '@/components/ProfileCard'
import { AirdropShareBanner } from '@/components/AirdropBanner'
import { Gift, Share2, FileCheck, UserPlus, Star, ChevronRight, Zap, Check, Shield, Award, Sparkles, ArrowLeftRight, Users, Coins, Eye, Calendar } from 'lucide-react'

// Contract addresses on Base Mainnet
const SBT_CONTRACT = '0xa8efb84f532278fd3a68fe4e0d4fe15c04e5b786' as const
const XP_SYSTEM = '0x7fc8e5570947b168832dedf54bcab01a4580c820' as const
const BSTN_TOKEN = '0xa6cd42c89fec11a1fd78c2f23d000db25b3f2f4c' as const
const BASE_CHAIN_ID = 8453

// Task IDs (must match contract)
const TASK_IDS = {
  connect: keccak256(toBytes('connect')),
  portfolio: keccak256(toBytes('portfolio')),
  share: keccak256(toBytes('share')),
  traders: keccak256(toBytes('traders')),
  daily: keccak256(toBytes('daily')),
  swap_5tx: keccak256(toBytes('swap_5tx')),
  copy_trade: keccak256(toBytes('copy_trade'))
}

const SBT_ABI = [
  { name: 'claim', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'hasClaimed', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'bool' }] },
  { name: 'totalSupply', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint256' }] }
] as const

const XP_ABI = [
  { name: 'completeTask', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'taskId', type: 'bytes32' }], outputs: [] },
  { name: 'dailyCheckin', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'getUserXP', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [
    { name: 'totalXP', type: 'uint256' },
    { name: 'totalBSTN', type: 'uint256' },
    { name: 'dailyStreak', type: 'uint256' },
    { name: 'level', type: 'uint256' },
    { name: 'nextLevelXP', type: 'uint256' }
  ]},
  { name: 'getCompletedTasks', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [
    { name: 'connect', type: 'bool' },
    { name: 'portfolio', type: 'bool' },
    { name: 'share', type: 'bool' },
    { name: 'traders', type: 'bool' },
    { name: 'swap5tx', type: 'bool' },
    { name: 'copyTrade', type: 'bool' },
    { name: 'lastDaily', type: 'uint256' }
  ]},
  { name: 'hasCompletedTask', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }, { name: 'taskId', type: 'bytes32' }], outputs: [{ name: '', type: 'bool' }] }
] as const

interface EventTask {
  id: string
  taskId: keyof typeof TASK_IDS
  title: string
  description: string
  xp: number
  bstn?: number
  icon: React.ReactNode
  action?: string
  completed: boolean
}

export default function EventsPage() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, isPending } = useWriteContract()
  const [loading, setLoading] = useState<string | null>(null)
  const [sbtStatus, setSbtStatus] = useState<string>('')

  const wrongNetwork = chainId !== BASE_CHAIN_ID

  // SBT contract reads
  const { data: hasClaimed, refetch: refetchClaimed } = useReadContract({
    address: SBT_CONTRACT,
    abi: SBT_ABI,
    functionName: 'hasClaimed',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // XP System reads
  const { data: userXPData, refetch: refetchXP } = useReadContract({
    address: XP_SYSTEM,
    abi: XP_ABI,
    functionName: 'getUserXP',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  const { data: completedTasks, refetch: refetchTasks } = useReadContract({
    address: XP_SYSTEM,
    abi: XP_ABI,
    functionName: 'getCompletedTasks',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  const totalXP = userXPData ? Number(userXPData[0]) : 0
  const totalBSTN = userXPData ? Number(userXPData[1]) / 1e18 : 0
  const dailyStreak = userXPData ? Number(userXPData[2]) : 0
  const level = userXPData ? Number(userXPData[3]) : 1

  // Check if daily checkin is available
  const today = Math.floor(Date.now() / 1000 / 86400)
  const lastDaily = completedTasks ? Number(completedTasks[6]) : 0
  const canCheckinToday = today > lastDaily

  const tasks: EventTask[] = useMemo(() => [
    {
      id: 'connect',
      taskId: 'connect',
      title: 'Connect Wallet',
      description: 'Connect your wallet to get started',
      xp: 50,
      icon: <UserPlus size={18} className="text-teal-400" />,
      completed: completedTasks?.[0] || false
    },
    {
      id: 'portfolio',
      taskId: 'portfolio',
      title: 'View Portfolio Health',
      description: 'Check your wallet health score',
      xp: 25,
      icon: <Eye size={18} className="text-blue-400" />,
      action: '/portfolio',
      completed: completedTasks?.[1] || false
    },
    {
      id: 'share',
      taskId: 'share',
      title: 'Share on Farcaster',
      description: 'Share your health score to earn XP',
      xp: 100,
      icon: <Share2 size={18} className="text-purple-400" />,
      completed: completedTasks?.[2] || false
    },
    {
      id: 'traders',
      taskId: 'traders',
      title: 'Explore Top Traders',
      description: 'Browse copy trading opportunities',
      xp: 30,
      icon: <Users size={18} className="text-orange-400" />,
      action: '/traders',
      completed: completedTasks?.[3] || false
    },
    {
      id: 'daily',
      taskId: 'daily',
      title: 'Daily Check-in',
      description: `Streak: ${dailyStreak} days (${dailyStreak > 7 ? '3x' : dailyStreak > 3 ? '2x' : '1x'} bonus)`,
      xp: 10,
      icon: <Calendar size={18} className="text-yellow-400" />,
      completed: !canCheckinToday
    },
    {
      id: 'swap_5tx',
      taskId: 'swap_5tx',
      title: 'Complete 5 Swaps',
      description: 'Earn BSTN tokens for trading',
      xp: 200,
      bstn: 50,
      icon: <ArrowLeftRight size={18} className="text-green-400" />,
      action: '/swap',
      completed: completedTasks?.[4] || false
    },
    {
      id: 'copy_trade',
      taskId: 'copy_trade',
      title: 'Copy a Trader',
      description: 'Follow a successful trader',
      xp: 100,
      bstn: 10,
      icon: <Users size={18} className="text-pink-400" />,
      action: '/traders',
      completed: completedTasks?.[5] || false
    }
  ], [completedTasks, dailyStreak, canCheckinToday])

  // Claim SBT
  const handleClaimSBT = useCallback(async () => {
    if (!address || hasClaimed) return
    setLoading('sbt')
    setSbtStatus('Claiming SBT...')
    
    try {
      await writeContract({
        address: SBT_CONTRACT,
        abi: SBT_ABI,
        functionName: 'claim'
      })
      setSbtStatus('SBT Claimed!')
      refetchClaimed()
    } catch (error: any) {
      setSbtStatus('Failed: ' + (error?.shortMessage || 'Unknown error'))
    } finally {
      setLoading(null)
    }
  }, [address, hasClaimed, writeContract, refetchClaimed])

  // Complete task on-chain
  const handleCompleteTask = useCallback(async (task: EventTask) => {
    if (!address || task.completed) return
    setLoading(task.id)

    try {
      if (task.taskId === 'daily') {
        // Daily checkin has special function
        await writeContract({
          address: XP_SYSTEM,
          abi: XP_ABI,
          functionName: 'dailyCheckin'
        })
      } else {
        // Regular task completion
        await writeContract({
          address: XP_SYSTEM,
          abi: XP_ABI,
          functionName: 'completeTask',
          args: [TASK_IDS[task.taskId]]
        })
      }
      
      // Refetch data
      refetchXP()
      refetchTasks()
    } catch (error: any) {
      console.error('Task error:', error)
    } finally {
      setLoading(null)
    }
  }, [address, writeContract, refetchXP, refetchTasks])

  // Auto-claim disabled - let user click manually

  if (!isConnected) {
    return (
      <AppShell>
        <main className="px-4 pt-20 pb-24 text-center">
          <Gift size={48} className="mx-auto mb-4 text-teal-400" />
          <h1 className="text-xl font-bold text-white mb-2">Earn XP</h1>
          <p className="text-sm text-zinc-400 mb-6">Complete tasks to level up</p>
          <ConnectFallback />
        </main>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <main className="bg-[#05060A] pb-24">
        <div className="space-y-6">
          <ProfileCard showFullCard={false} />

          {/* XP Overview */}
          <div className="mx-4 p-5 rounded-2xl bg-gradient-to-br from-[#0E1F24] to-[#071317] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-zinc-400">Total XP</p>
                <span className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {totalXP.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400">Level</p>
                <span className="text-lg font-bold text-white">{level}</span>
              </div>
            </div>
            
            {totalBSTN > 0 && (
              <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-teal-500/10">
                <Coins size={14} className="text-teal-400" />
                <span className="text-xs text-teal-300">{totalBSTN.toFixed(0)} BSTN earned</span>
              </div>
            )}

            {dailyStreak > 0 && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-500/10">
                <Zap size={14} className="text-yellow-400" />
                <span className="text-xs text-yellow-300">{dailyStreak} day streak!</span>
              </div>
            )}
            
            <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-blue-400 transition-all duration-500"
                style={{ width: (totalXP % 100) + '%' }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">{totalXP % 100} / 100 XP to next level</p>
          </div>

          {wrongNetwork && (
            <div className="mx-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400 text-center">
                Please switch to Base network
              </p>
            </div>
          )}

          {/* SBT Claim */}
          {!hasClaimed && (
            <div className="mx-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
              <div className="flex items-center gap-3">
                <Shield size={24} className="text-purple-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Claim Your SBT</p>
                  <p className="text-xs text-zinc-400">Soulbound token for early supporters</p>
                </div>
                <button
                  onClick={handleClaimSBT}
                  disabled={loading === 'sbt' || wrongNetwork}
                  className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 text-sm font-medium hover:bg-purple-500/30 transition disabled:opacity-50"
                >
                  {loading === 'sbt' ? 'Claiming...' : 'Claim'}
                </button>
              </div>
              {sbtStatus && <p className="text-xs text-zinc-400 mt-2">{sbtStatus}</p>}
            </div>
          )}

          {/* Tasks - All On-Chain */}
          <div className="mx-4 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-400" />
              On-Chain Tasks
            </h3>
            
            {tasks.map(task => {
              // Check if task requires action first (has link but not yet visited)
              const hasAction = !!task.action
              const canClaim = !task.completed && !wrongNetwork && !isPending
              
              return (
                <div
                  key={task.id}
                  className={`w-full p-4 rounded-xl border transition-all duration-200 ${
                    task.completed
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      task.completed ? 'bg-green-500/20' : 'bg-white/5'
                    }`}>
                      {task.completed ? <Check size={18} className="text-green-400" /> : task.icon}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${task.completed ? 'text-green-400' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-zinc-400">{task.description}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <p className="text-sm font-bold text-teal-400">+{task.xp} XP</p>
                        {task.bstn && (
                          <p className="text-xs text-yellow-400">+{task.bstn} BSTN</p>
                        )}
                      </div>
                      
                      {/* Two buttons: Go (if has action) + Claim */}
                      {!task.completed && (
                        <div className="flex gap-2">
                          {hasAction && (
                            <a
                              href={task.action}
                              className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-medium hover:bg-blue-500/30 transition"
                            >
                              Go
                            </a>
                          )}
                          <button
                            onClick={() => handleCompleteTask(task)}
                            disabled={!canClaim || loading === task.id}
                            className="px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-medium hover:bg-teal-500/30 transition disabled:opacity-50"
                          >
                            {loading === task.id ? '...' : 'Claim'}
                          </button>
                        </div>
                      )}
                      
                      {task.completed && (
                        <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium">
                          Done ✓
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {loading === task.id && (
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-zinc-400">Confirming on-chain...</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Airdrop Share */}
          <div className="mx-4">
            <AirdropShareBanner xp={totalXP} />
          </div>

          {/* Info */}
          <div className="mx-4 p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20">
            <div className="flex items-start gap-3">
              <Coins size={18} className="text-green-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">100% On-Chain</p>
                <p className="text-xs text-zinc-400 mt-1">
                  All XP tasks are recorded on Base. Gas fee ~$0.01 per action.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  )
}


