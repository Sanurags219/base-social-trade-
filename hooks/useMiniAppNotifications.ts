'use client'

import { useCallback, useState, useEffect } from 'react'
import sdk from '@farcaster/frame-sdk'

interface MiniAppState {
  isAdded: boolean
  notificationsEnabled: boolean
  loading: boolean
  error: string | null
}

export function useMiniAppNotifications() {
  const [state, setState] = useState<MiniAppState>({
    isAdded: false,
    notificationsEnabled: false,
    loading: true,
    error: null
  })

  // Check initial state on mount
  useEffect(() => {
    const checkState = async () => {
      try {
        const context = await sdk.context
        if (context?.client) {
          setState(prev => ({
            ...prev,
            isAdded: true, // If we have context, app is added
            loading: false
          }))
        } else {
          setState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        setState(prev => ({ ...prev, loading: false }))
      }
    }
    checkState()
  }, [])

  // Add Mini App to user's client
  const addMiniApp = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await sdk.actions.addMiniApp()
      
      setState(prev => ({
        ...prev,
        isAdded: true,
        notificationsEnabled: !!response.notificationDetails,
        loading: false
      }))

      return {
        success: true,
        notificationsEnabled: !!response.notificationDetails
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to add Mini App'
      }))
      return { success: false, error: error?.message }
    }
  }, [])

  // Request to enable notifications
  const enableNotifications = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      // addMiniApp also enables notifications if user approves
      const response = await sdk.actions.addMiniApp()
      
      setState(prev => ({
        ...prev,
        notificationsEnabled: !!response.notificationDetails,
        loading: false
      }))

      return { success: !!response.notificationDetails }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to enable notifications'
      }))
      return { success: false, error: error?.message }
    }
  }, [])

  return {
    ...state,
    addMiniApp,
    enableNotifications
  }
}
