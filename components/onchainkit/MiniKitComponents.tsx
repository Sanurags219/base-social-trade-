'use client'

// MiniKit integration for Base Mini Apps
import { useMiniKit, useAddFrame, useNotification } from '@coinbase/onchainkit/minikit'
import { useCallback, useEffect, useState } from 'react'

// MiniKit context hook
export function useMiniKitContext() {
  const { setFrameReady, isFrameReady, context } = useMiniKit()
  
  useEffect(() => {
    // Signal to the host that the Mini App is ready
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [isFrameReady, setFrameReady])
  
  return {
    isReady: isFrameReady,
    context,
    user: context?.user,
    client: context?.client,
    location: context?.location,
  }
}

// Add to home screen
interface AddToHomeProps {
  className?: string
  children?: React.ReactNode
}

export function AddToHomeButton({ className, children }: AddToHomeProps) {
  const addFrame = useAddFrame()
  const [added, setAdded] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const handleAdd = useCallback(async () => {
    setLoading(true)
    try {
      const result = await addFrame()
      if (result) {
        setAdded(true)
      }
    } catch (error) {
      console.error('Failed to add to home:', error)
    } finally {
      setLoading(false)
    }
  }, [addFrame])
  
  if (added) {
    return (
      <button 
        className={`${className} opacity-50 cursor-not-allowed`}
        disabled
      >
        Added ✓
      </button>
    )
  }
  
  return (
    <button 
      onClick={handleAdd}
      disabled={loading}
      className={className}
    >
      {loading ? 'Adding...' : (children || 'Add to Home')}
    </button>
  )
}

// Send notification button
interface SendNotificationProps {
  title: string
  body: string
  className?: string
  children?: React.ReactNode
}

export function SendNotificationButton({
  title,
  body,
  className,
  children,
}: SendNotificationProps) {
  const sendNotification = useNotification()
  const [loading, setLoading] = useState(false)
  
  const handleSend = useCallback(async () => {
    setLoading(true)
    try {
      await sendNotification({ title, body })
    } catch (error) {
      console.error('Failed to send notification:', error)
    } finally {
      setLoading(false)
    }
  }, [sendNotification, title, body])
  
  return (
    <button 
      onClick={handleSend}
      disabled={loading}
      className={className}
    >
      {loading ? 'Sending...' : (children || 'Send Notification')}
    </button>
  )
}

// MiniKit provider wrapper
interface MiniKitWrapperProps {
  children: React.ReactNode
}

export function MiniKitWrapper({ children }: MiniKitWrapperProps) {
  const { setFrameReady, isFrameReady } = useMiniKit()
  
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [isFrameReady, setFrameReady])
  
  return <>{children}</>
}

// Context display for debugging
export function MiniKitDebug({ className }: { className?: string }) {
  const { context, isReady } = useMiniKitContext()
  
  if (!context) {
    return (
      <div className={`text-zinc-500 text-sm ${className}`}>
        Not in Mini App context
      </div>
    )
  }
  
  return (
    <div className={`text-xs font-mono bg-zinc-900 p-4 rounded-lg ${className}`}>
      <div className="text-green-400 mb-2">
        ✓ Mini App Ready: {isReady ? 'Yes' : 'No'}
      </div>
      <pre className="text-zinc-400 overflow-auto">
        {JSON.stringify(context, null, 2)}
      </pre>
    </div>
  )
}
