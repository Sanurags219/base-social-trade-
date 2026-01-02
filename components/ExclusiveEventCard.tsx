'use client'

import Link from 'next/link'

export interface EventGate {
  minHealth?: number
  minXP?: number
  minTier?: 'Trusted' | 'Elite'
}

export interface ExclusiveEvent {
  id: string
  title: string
  description: string
  type: 'exclusive' | 'invite-only' | 'public'
  status: 'live' | 'upcoming' | 'ended'
  rewards: {
    sbt?: boolean
    xp?: number
    token?: { symbol: string; amount: number }
  }
  requirements?: string[]
  gate?: EventGate
  spots?: number
  spotsRemaining?: number
  closesIn?: string
  partner?: string
}

interface UserQualification {
  health: number
  xp: number
  tier: 'New' | 'Regular' | 'Trusted' | 'Elite'
}

// Check if user qualifies for an event
export function userQualifies(event: ExclusiveEvent, user: UserQualification): boolean {
  if (!event.gate) return true
  
  if (event.gate.minHealth && user.health < event.gate.minHealth) return false
  if (event.gate.minXP && user.xp < event.gate.minXP) return false
  if (event.gate.minTier) {
    const tierRank = { 'New': 0, 'Regular': 1, 'Trusted': 2, 'Elite': 3 }
    if (tierRank[user.tier] < tierRank[event.gate.minTier]) return false
  }
  
  return true
}

// Format gate requirements as readable text
function formatGateRequirements(gate?: EventGate): string {
  if (!gate) return ''
  
  const parts: string[] = []
  if (gate.minHealth) parts.push(`Health ≥ ${gate.minHealth}`)
  if (gate.minXP) parts.push(`XP ≥ ${gate.minXP}`)
  if (gate.minTier) parts.push(`${gate.minTier}+ tier`)
  
  return parts.join(' · ')
}

// Exclusive Event Card - Premium styling
export function ExclusiveEventCard({ event }: { event: ExclusiveEvent }) {
  const gateText = formatGateRequirements(event.gate)
  
  return (
    <Link href={`/events/${event.id}`}>
      <div className="relative rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-500/5 to-transparent p-4 hover:border-blue-500/50 transition-colors cursor-pointer">
        
        {/* Exclusive badge */}
        {event.type === 'exclusive' && (
          <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-blue-500/15 text-blue-400">
            Exclusive
          </div>
        )}
        
        {event.type === 'invite-only' && (
          <div className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-purple-500/15 text-purple-400">
            Invited
          </div>
        )}

        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
            {event.type === 'exclusive' ? '⭐' : event.type === 'invite-only' ? '🔒' : '🎯'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold truncate">{event.title}</p>
              {event.status === 'live' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                  Live
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
              {event.description}
            </p>

            {/* Access requirements */}
            {gateText && (
              <div className="mt-2 text-[10px] text-zinc-500">
                Requires: {gateText}
              </div>
            )}

            {/* Rewards */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {event.rewards.xp && (
                <span className="px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400 text-[10px]">
                  ⭐ {event.rewards.xp} XP
                </span>
              )}
              {event.rewards.sbt && (
                <span className="px-2 py-1 rounded-full bg-purple-500/15 text-purple-400 text-[10px]">
                  🎖 SBT
                </span>
              )}
              {event.rewards.token && (
                <span className="px-2 py-1 rounded-full bg-green-500/15 text-green-400 text-[10px]">
                  🪙 {event.rewards.token.amount} {event.rewards.token.symbol}
                </span>
              )}
            </div>

            {/* Spots remaining / closes in */}
            <div className="flex items-center gap-3 mt-3 text-[10px] text-zinc-500">
              {event.spotsRemaining !== undefined && (
                <span>{event.spotsRemaining} spots left</span>
              )}
              {event.closesIn && (
                <span>Closes in {event.closesIn}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Locked Event Card - For events user doesn't qualify for
export function LockedEventCard() {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 opacity-60">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
          🔒
        </div>

        <div>
          <p className="text-sm font-medium">Exclusive Event</p>
          <p className="text-xs text-zinc-500 mt-1">
            Unlock by improving your wallet health
          </p>
        </div>
      </div>
    </div>
  )
}

// Unlock More Events - Aspiration block
export function UnlockMoreEvents({ userHealth, userXP, userTier }: { userHealth: number; userXP: number; userTier: string }) {
  const tips: string[] = []
  
  if (userHealth < 60) tips.push('Improve wallet health to 60+')
  if (userXP < 500) tips.push('Earn more XP through trading')
  if (userTier === 'New' || userTier === 'Regular') tips.push('Reach Trusted tier')
  
  if (tips.length === 0) {
    tips.push('Keep trading to maintain your status')
    tips.push('Check back for new exclusive events')
  }
  
  return (
    <div className="mt-6 rounded-2xl bg-white/[0.03] border border-white/5 p-4">
      <p className="text-sm font-medium">Unlock more exclusive events</p>

      <ul className="mt-2 text-xs text-zinc-400 space-y-1">
        {tips.map((tip, i) => (
          <li key={i}>• {tip}</li>
        ))}
      </ul>
    </div>
  )
}

// Invite Card - For invite-only events
export function InviteCard({ event }: { event: ExclusiveEvent }) {
  return (
    <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-500/5 to-transparent p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔒</span>
        <span className="text-xs text-purple-400">Private Invitation</span>
      </div>
      
      <p className="text-sm font-semibold">{event.title}</p>
      <p className="text-xs text-zinc-400 mt-1">{event.description}</p>
      
      <div className="flex flex-wrap gap-1.5 mt-3">
        {event.rewards.xp && (
          <span className="px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400 text-[10px]">
            ⭐ {event.rewards.xp} XP
          </span>
        )}
        {event.rewards.sbt && (
          <span className="px-2 py-1 rounded-full bg-purple-500/15 text-purple-400 text-[10px]">
            🎖 SBT
          </span>
        )}
      </div>
      
      <Link 
        href={`/events/${event.id}`}
        className="mt-4 block w-full rounded-[14px] bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium py-2.5 text-center transition"
      >
        View Invitation
      </Link>
    </div>
  )
}
