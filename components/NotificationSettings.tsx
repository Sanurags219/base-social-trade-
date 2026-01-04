'use client'

import { useState } from 'react'
import { Bell, BellOff, Plus, CheckCircle, Loader2 } from 'lucide-react'
import { useMiniAppNotifications } from '@/hooks/useMiniAppNotifications'

export function NotificationSettings() {
  const { 
    isAdded, 
    notificationsEnabled, 
    loading, 
    error,
    addMiniApp,
    enableNotifications 
  } = useMiniAppNotifications()
  
  const [status, setStatus] = useState<string>('')

  const handleAddMiniApp = async () => {
    setStatus('Adding Mini App...')
    const result = await addMiniApp()
    
    if (result.success) {
      if (result.notificationsEnabled) {
        setStatus('✅ Added with notifications enabled!')
      } else {
        setStatus('✅ Added! Enable notifications for alerts.')
      }
    } else {
      setStatus(`❌ ${result.error || 'Failed to add'}`)
    }
  }

  const handleEnableNotifications = async () => {
    setStatus('Enabling notifications...')
    const result = await enableNotifications()
    
    if (result.success) {
      setStatus('✅ Notifications enabled!')
    } else {
      setStatus(`❌ ${result.error || 'Failed to enable'}`)
    }
  }

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
      <div className="flex items-center gap-3 mb-3">
        {notificationsEnabled ? (
          <Bell size={20} className="text-green-400" />
        ) : (
          <BellOff size={20} className="text-zinc-400" />
        )}
        <div>
          <h3 className="text-sm font-medium text-white">Mini App Notifications</h3>
          <p className="text-xs text-zinc-400">
            {notificationsEnabled 
              ? 'Notifications are enabled' 
              : isAdded 
                ? 'Enable to get XP alerts' 
                : 'Add app to enable notifications'}
          </p>
        </div>
      </div>

      {!isAdded && (
        <button
          onClick={handleAddMiniApp}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-purple-500/20 text-purple-300 text-sm font-medium hover:bg-purple-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Add Mini App
        </button>
      )}

      {isAdded && !notificationsEnabled && (
        <button
          onClick={handleEnableNotifications}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg bg-blue-500/20 text-blue-300 text-sm font-medium hover:bg-blue-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Bell size={16} />
          )}
          Enable Notifications
        </button>
      )}

      {isAdded && notificationsEnabled && (
        <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-green-500/10 text-green-400 text-sm">
          <CheckCircle size={16} />
          <span>Notifications active</span>
        </div>
      )}

      {status && (
        <p className="text-xs text-zinc-400 mt-2 text-center">{status}</p>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  )
}

// Compact version for embedding in other components
export function NotificationBadge() {
  const { isAdded, notificationsEnabled, addMiniApp } = useMiniAppNotifications()

  if (notificationsEnabled) {
    return (
      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
        <Bell size={12} />
        <span>On</span>
      </div>
    )
  }

  return (
    <button
      onClick={addMiniApp}
      className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/30 transition"
    >
      <BellOff size={12} />
      <span>{isAdded ? 'Enable' : 'Add'}</span>
    </button>
  )
}
