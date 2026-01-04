'use client'

import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import sdk from '@farcaster/frame-sdk'

interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

interface MiniAppContextValue {
  isInMiniApp: boolean
  isReady: boolean
  safeAreaInsets: SafeAreaInsets
  user: any | null
  clientFid: number | null
}

const MiniAppContext = createContext<MiniAppContextValue>({
  isInMiniApp: false,
  isReady: false,
  safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
  user: null,
  clientFid: null
})

export function useMiniAppContext() {
  return useContext(MiniAppContext)
}

interface MiniAppProviderProps {
  children: ReactNode
}

export function MiniAppProvider({ children }: MiniAppProviderProps) {
  const [isInMiniApp, setIsInMiniApp] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  })
  const [user, setUser] = useState<any>(null)
  const [clientFid, setClientFid] = useState<number | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const inMiniApp = await sdk.isInMiniApp()
        setIsInMiniApp(inMiniApp)

        if (inMiniApp) {
          const context = await sdk.context
          
          // Extract safe area insets
          if (context?.client?.safeAreaInsets) {
            setSafeAreaInsets(context.client.safeAreaInsets)
          }
          
          // Extract user info
          if (context?.user) {
            setUser(context.user)
          }
          
          // Extract client FID
          if (context?.client?.clientFid) {
            setClientFid(context.client.clientFid)
          }

          // Signal app is ready
          await sdk.actions.ready()
        }
        
        setIsReady(true)
      } catch (error) {
        console.error('MiniApp init error:', error)
        setIsReady(true)
      }
    }

    init()
  }, [])

  return (
    <MiniAppContext.Provider value={{
      isInMiniApp,
      isReady,
      safeAreaInsets,
      user,
      clientFid
    }}>
      {/* Apply safe area CSS variables */}
      <div
        style={{
          '--safe-area-top': `${safeAreaInsets.top}px`,
          '--safe-area-bottom': `${safeAreaInsets.bottom}px`,
          '--safe-area-left': `${safeAreaInsets.left}px`,
          '--safe-area-right': `${safeAreaInsets.right}px`,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </MiniAppContext.Provider>
  )
}
