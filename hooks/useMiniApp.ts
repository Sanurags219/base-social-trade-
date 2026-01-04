'use client'

import { useEffect, useState, useCallback } from 'react'
import sdk from '@farcaster/frame-sdk'

// Types for Mini App Context
export interface MiniAppUser {
  fid: number
  username?: string
  displayName?: string
  pfpUrl?: string
  bio?: string
  location?: {
    placeId?: string
    description?: string
  }
}

export interface MiniAppLocation {
  type: 'cast_embed' | 'cast_share' | 'notification' | 'launcher' | 'channel' | 'open_miniapp'
  embed?: string
  cast?: {
    author: MiniAppUser
    hash: string
    timestamp: number
    text: string
    embeds?: string[]
    channelKey?: string
  }
  notification?: {
    notificationId: string
    title: string
    body: string
  }
  channel?: {
    key: string
    name: string
    imageUrl?: string
  }
  referrerDomain?: string
}

export interface MiniAppClient {
  platformType?: 'web' | 'mobile'
  clientFid: number
  added: boolean
  safeAreaInsets?: {
    top: number
    bottom: number
    left: number
    right: number
  }
  notificationDetails?: {
    url: string
    token: string
  }
}

export interface MiniAppFeatures {
  haptics: boolean
  cameraAndMicrophoneAccess?: boolean
}

export interface MiniAppContext {
  user: MiniAppUser
  location?: MiniAppLocation
  client: MiniAppClient
  features?: MiniAppFeatures
}

export interface UseMiniAppReturn {
  isInMiniApp: boolean
  isLoading: boolean
  context: MiniAppContext | null
  user: MiniAppUser | null
  location: MiniAppLocation | null
  client: MiniAppClient | null
  safeAreaInsets: { top: number; bottom: number; left: number; right: number }
  // Actions
  ready: () => Promise<void>
  openUrl: (url: string) => Promise<void>
  composeCast: (text: string, embeds?: string[]) => Promise<void>
  viewCast: (castUrl: string) => Promise<void>
  viewProfile: (fid: number) => Promise<void>
  addMiniApp: () => Promise<any>
  hapticFeedback: (type?: 'light' | 'medium' | 'heavy') => void
}

export function useMiniApp(): UseMiniAppReturn {
  const [isInMiniApp, setIsInMiniApp] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [context, setContext] = useState<MiniAppContext | null>(null)

  useEffect(() => {
    const initMiniApp = async () => {
      try {
        // Check if we're in a Mini App
        const inMiniApp = await sdk.isInMiniApp()
        setIsInMiniApp(inMiniApp)

        if (inMiniApp) {
          // Get context
          const ctx = await sdk.context
          setContext(ctx as MiniAppContext)
          
          // Signal that app is ready
          await sdk.actions.ready()
        }
      } catch (error) {
        console.error('Mini App init error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initMiniApp()
  }, [])

  // Actions
  const ready = useCallback(async () => {
    try {
      await sdk.actions.ready()
    } catch (error) {
      console.error('Ready action error:', error)
    }
  }, [])

  const openUrl = useCallback(async (url: string) => {
    try {
      if (isInMiniApp) {
        await sdk.actions.openUrl(url)
      } else {
        window.open(url, '_blank')
      }
    } catch (error) {
      console.error('Open URL error:', error)
      window.open(url, '_blank')
    }
  }, [isInMiniApp])

  const composeCast = useCallback(async (text: string, embeds?: string[]) => {
    try {
      if (isInMiniApp) {
        await sdk.actions.composeCast({ text, embeds: embeds as [string, string] | [string] | [] })
      } else {
        // Fallback to Warpcast intent URL
        const params = new URLSearchParams({ text })
        if (embeds?.length) {
          params.set('embeds[]', embeds[0])
        }
        window.open(`https://warpcast.com/~/compose?${params}`, '_blank')
      }
    } catch (error) {
      console.error('Compose cast error:', error)
    }
  }, [isInMiniApp])

  const viewCast = useCallback(async (castUrl: string) => {
    try {
      if (isInMiniApp) {
        await sdk.actions.viewCast({ hash: castUrl })
      } else {
        window.open(castUrl, '_blank')
      }
    } catch (error) {
      console.error('View cast error:', error)
    }
  }, [isInMiniApp])

  const viewProfile = useCallback(async (fid: number) => {
    try {
      if (isInMiniApp) {
        await sdk.actions.viewProfile({ fid })
      } else {
        window.open(`https://warpcast.com/~/profiles/${fid}`, '_blank')
      }
    } catch (error) {
      console.error('View profile error:', error)
    }
  }, [isInMiniApp])

  const addMiniApp = useCallback(async () => {
    try {
      return await sdk.actions.addMiniApp()
    } catch (error) {
      console.error('Add mini app error:', error)
      throw error
    }
  }, [])

  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'medium') => {
    try {
      if (context?.features?.haptics) {
        // Haptics not available in current SDK
      }
    } catch (error) {
      // Haptics not available
    }
  }, [context?.features?.haptics])

  // Extract data from context
  const user = context?.user || null
  const location = context?.location || null
  const client = context?.client || null
  const safeAreaInsets = client?.safeAreaInsets || { top: 0, bottom: 0, left: 0, right: 0 }

  return {
    isInMiniApp,
    isLoading,
    context,
    user,
    location,
    client,
    safeAreaInsets,
    ready,
    openUrl,
    composeCast,
    viewCast,
    viewProfile,
    addMiniApp,
    hapticFeedback
  }
}
