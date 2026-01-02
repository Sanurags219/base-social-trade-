'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'
import { WalletConnect } from '@/components/WalletConnect'
import { 
  ExclusiveEventCard, 
  InviteCard, 
  LockedEventCard,
  UnlockMoreEvents,
  type ExclusiveEvent 
} from '@/components/ExclusiveEventCard'

interface UserStats {
  health: number
  xp: number
  tier: 'New' | 'Regular' | 'Trusted' | 'Elite'
}

export default function EventsPage() {
  const { address, isConnected } = useAccount()
  const [events, setEvents] = useState<ExclusiveEvent[]>([])
  const [inviteEvents, setInviteEvents] = useState<ExclusiveEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMoreToUnlock, setHasMoreToUnlock] = useState(false)
  const [userStats, setUserStats] = useState<UserStats>({ health: 50, xp: 200, tier: 'Regular' })
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      try {
        // Fetch user health/xp if connected
        let health = 50
        let xp = 200
        let tier: UserStats['tier'] = 'Regular'
        
        if (address) {
          // Get user health score
          const healthRes = await fetch(`/api/healthscore?address=${address}`)
          if (healthRes.ok) {
            const healthData = await healthRes.json()
            health = healthData.health?.score || 50
          }
          
          // Get user XP
          const xpRes = await fetch(`/api/xp?address=${address}`)
          if (xpRes.ok) {
            const xpData = await xpRes.json()
            xp = xpData.xp || 200
            // Determine tier from XP
            if (xp >= 5000) tier = 'Elite'
            else if (xp >= 1000) tier = 'Trusted'
            else if (xp >= 200) tier = 'Regular'
            else tier = 'New'
          }
        }
        
        setUserStats({ health, xp, tier })
        
        // Fetch qualified events
        const eventsRes = await fetch(`/api/events?health=${health}&xp=${xp}&tier=${tier}`)
        if (eventsRes.ok) {
          const data = await eventsRes.json()
          
          // Separate invite-only events
          const invites = data.events.filter((e: ExclusiveEvent) => e.type === 'invite-only')
          const regular = data.events.filter((e: ExclusiveEvent) => e.type !== 'invite-only')
          
          setInviteEvents(invites)
          setEvents(regular)
          setHasMoreToUnlock(data.hasMoreToUnlock)
        }
      } catch (e) {
        console.error('Failed to fetch events:', e)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [address])
  
  const liveEvents = events.filter(e => e.status === 'live')
  const upcomingEvents = events.filter(e => e.status === 'upcoming')
  
  return (
    <AppShell>
      <WalletConnect />
      
      <h1 className="text-lg font-semibold mb-6">Events</h1>
      
      {loading ? (
        <Card>
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-zinc-500">Loading your events...</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Invite-only events (ultra premium) */}
          {inviteEvents.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-purple-400">🔒 Private Invitations</span>
              </div>
              <div className="space-y-3">
                {inviteEvents.map((event) => (
                  <InviteCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
          
          {/* Exclusive for You section */}
          {liveEvents.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-zinc-400 mb-3">Exclusive for You</p>
              <div className="space-y-3">
                {liveEvents.map((event) => (
                  <ExclusiveEventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
          
          {/* Upcoming */}
          {upcomingEvents.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-zinc-400 mb-3">Coming Soon</p>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <ExclusiveEventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
          
          {/* No events state */}
          {liveEvents.length === 0 && upcomingEvents.length === 0 && inviteEvents.length === 0 && (
            <Card>
              <div className="text-center py-8">
                <span className="text-3xl mb-3 block">🔒</span>
                <p className="text-sm font-medium">No events available yet</p>
                <p className="text-xs text-zinc-500 mt-1">
                  Improve your wallet health to unlock exclusive events
                </p>
              </div>
            </Card>
          )}
          
          {/* Locked preview - shows aspiration */}
          {hasMoreToUnlock && (
            <div className="mb-6">
              <p className="text-xs text-zinc-500 mb-3">More to unlock</p>
              <LockedEventCard />
            </div>
          )}
          
          {/* Unlock More Events - Aspiration block */}
          <UnlockMoreEvents 
            userHealth={userStats.health} 
            userXP={userStats.xp} 
            userTier={userStats.tier} 
          />
          
          {/* Quick stats */}
          {isConnected && (
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-lg font-semibold">{userStats.health}</p>
                <p className="text-[10px] text-zinc-500">Health</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-lg font-semibold">{userStats.xp}</p>
                <p className="text-[10px] text-zinc-500">XP</p>
              </div>
              <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                <p className="text-lg font-semibold">{userStats.tier}</p>
                <p className="text-[10px] text-zinc-500">Tier</p>
              </div>
            </div>
          )}
        </>
      )}
    </AppShell>
  )
}
