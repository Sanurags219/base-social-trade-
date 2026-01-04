'use client'

import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { usePathname } from 'next/navigation'

// Hook to track page visits for task verification
export function useTaskTracking() {
  const { address, isConnected } = useAccount()
  const pathname = usePathname()

  useEffect(() => {
    if (!isConnected || !address) return

    // Track page visits
    const trackVisit = async (action: string) => {
      try {
        await fetch('/api/verify-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, action })
        })
      } catch (error) {
        console.error('Failed to track visit:', error)
      }
    }

    // Track based on current page
    if (pathname === '/portfolio') {
      trackVisit('visit_portfolio')
    } else if (pathname === '/traders') {
      trackVisit('visit_traders')
    }
  }, [pathname, address, isConnected])
}

// Hook to check task verification status
export function useTaskVerification(address: string | undefined) {
  const checkTask = async (taskId: string): Promise<boolean> => {
    if (!address) return false

    try {
      const res = await fetch(`/api/verify-task?address=${address}&task=${taskId}`)
      if (!res.ok) return false
      
      const data = await res.json()
      return data.verified === true
    } catch (error) {
      console.error('Task verification error:', error)
      return false
    }
  }

  const checkAllTasks = async (): Promise<Record<string, boolean>> => {
    if (!address) return {}

    try {
      const res = await fetch(`/api/verify-task?address=${address}`)
      if (!res.ok) return {}
      
      const data = await res.json()
      return data.verifications || {}
    } catch (error) {
      console.error('All tasks verification error:', error)
      return {}
    }
  }

  return { checkTask, checkAllTasks }
}
