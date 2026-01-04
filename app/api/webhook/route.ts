import { NextRequest, NextResponse } from 'next/server'
import {
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from '@farcaster/miniapp-node'
import {
  setUserNotificationDetails,
  deleteUserNotificationDetails,
  sendMiniAppNotification,
  getActiveTokensCount
} from '@/lib/notificationStore'

export async function POST(request: NextRequest) {
  try {
    const requestJson = await request.json()
    
    // Parse and verify the webhook event
    let data: any
    try {
      data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar)
    } catch (e: unknown) {
      console.error('[Webhook] Verification failed:', e)
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const fid = data.fid as number
    const appFid = data.appFid as number // Base app is 309857
    const event = data.event as { event: string; notificationDetails?: { url: string; token: string } }

    console.log(`[Webhook] Received event: ${event.event} from FID ${fid} (App: ${appFid})`)

    // Handle different event types
    switch (event.event) {
      case 'miniapp_added':
        if (event.notificationDetails) {
          // Save notification token
          setUserNotificationDetails(fid, appFid, event.notificationDetails)
          
          // Send welcome notification (async, don't await)
          sendMiniAppNotification({
            fid,
            appFid,
            title: 'Welcome to Baseline! 🎉',
            body: 'Track your portfolio health and earn XP rewards',
            targetUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://base-line.vercel.app'}/events`,
          })
        }
        break

      case 'miniapp_removed':
        // Delete notification token
        deleteUserNotificationDetails(fid, appFid)
        break

      case 'notifications_enabled':
        if (event.notificationDetails) {
          // Save new notification token
          setUserNotificationDetails(fid, appFid, event.notificationDetails)
          
          // Send confirmation (async)
          sendMiniAppNotification({
            fid,
            appFid,
            title: 'Notifications enabled! 🔔',
            body: "You'll receive alerts for XP events and score changes",
          })
        }
        break

      case 'notifications_disabled':
        // Delete notification token
        deleteUserNotificationDetails(fid, appFid)
        break

      default:
        console.log(`[Webhook] Unknown event: ${event.event}`)
    }

    // Return success immediately (don't wait for notification send)
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check webhook status
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    activeTokens: getActiveTokensCount(),
    timestamp: new Date().toISOString()
  })
}
