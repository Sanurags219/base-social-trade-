'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { Card } from '@/components/ui/Card'

interface Event {
  id: string
  title: string
  description: string
  type: 'launch' | 'challenge' | 'early-supporter' | 'partner'
  status: 'active' | 'upcoming' | 'ended'
  rewards: {
    sbt?: boolean
    xp?: number
    token?: { symbol: string; amount: number }
  }
  participants: number
  maxParticipants?: number
  startDate: string
  endDate: string
  partner?: string
}

function EventTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'launch':
      return <span className="text-lg">🚀</span>
    case 'challenge':
      return <span className="text-lg">🏆</span>
    case 'early-supporter':
      return <span className="text-lg">⭐</span>
    case 'partner':
      return <span className="text-lg">🤝</span>
    default:
      return <span className="text-lg">📅</span>
  }
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ended: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  }
  
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors[status as keyof typeof colors] || colors.ended}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function RewardBadges({ rewards }: { rewards: Event['rewards'] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {rewards.sbt && (
        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
          🎖 SBT
        </span>
      )}
      {rewards.xp && (
        <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
          ⭐ {rewards.xp} XP
        </span>
      )}
      {rewards.token && (
        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
          🪙 {rewards.token.amount} {rewards.token.symbol}
        </span>
      )}
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  const progress = event.maxParticipants 
    ? (event.participants / event.maxParticipants) * 100 
    : null
  
  const daysLeft = Math.ceil((new Date(event.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:border-zinc-700 transition-colors cursor-pointer">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
            <EventTypeIcon type={event.type} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{event.title}</h3>
              <StatusBadge status={event.status} />
            </div>
            <p className="text-xs text-zinc-500 line-clamp-2">{event.description}</p>
            <RewardBadges rewards={event.rewards} />
            
            {/* Progress bar for limited events */}
            {progress !== null && event.status === 'active' && (
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>{event.participants} claimed</span>
                  <span>{event.maxParticipants} max</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            {/* Time remaining */}
            {event.status === 'active' && daysLeft > 0 && (
              <p className="text-[10px] text-zinc-500 mt-2">
                ⏰ {daysLeft} days left
              </p>
            )}
            
            {/* Partner badge */}
            {event.partner && (
              <p className="text-[10px] text-blue-400 mt-2">
                Powered by {event.partner}
              </p>
            )}
          </div>
          
          {/* Arrow */}
          <svg className="w-4 h-4 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Card>
    </Link>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('all')
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events')
        if (res.ok) {
          const data = await res.json()
          setEvents(data.events)
        }
      } catch (e) {
        console.error('Failed to fetch events:', e)
      } finally {
        setLoading(false)
      }
    }
    
    fetchEvents()
  }, [])
  
  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.status === filter)
  
  const activeCount = events.filter(e => e.status === 'active').length
  
  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Events</h1>
        {activeCount > 0 && (
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
            {activeCount} Active
          </span>
        )}
      </div>
      
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'upcoming'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full transition ${
              filter === f 
                ? 'bg-[#0052FF] text-white' 
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      
      {loading ? (
        <Card>
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-zinc-500">Loading events...</p>
          </div>
        </Card>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <svg className="w-10 h-10 mx-auto text-zinc-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-zinc-500">No {filter !== 'all' ? filter : ''} events</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
      
      {/* Info */}
      <div className="mt-6 p-4 bg-white/[0.03] rounded-xl border border-white/5">
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          <span>💡</span>
          How Events Work
        </h3>
        <ul className="text-xs text-zinc-400 space-y-1">
          <li>• Complete requirements to claim rewards</li>
          <li>• Rewards include SBTs, XP, and tokens</li>
          <li>• Share claims on Farcaster for bonus XP</li>
          <li>• Limited events fill up fast!</li>
        </ul>
      </div>
    </AppShell>
  )
}
