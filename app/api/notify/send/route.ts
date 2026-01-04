import { NextRequest, NextResponse } from 'next/server'
import { getUserNotificationDetails, sendMiniAppNotification } from '@/lib/notificationStore'

// Send notification to a specific user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fid, appFid, title, body: notificationBody, targetUrl } = body

    if (!fid || !title || !notificationBody) {
      return NextResponse.json(
        { error: 'Missing required fields: fid, title, body' },
        { status: 400 }
      )
    }

    // Default to Base app FID if not specified
    const clientAppFid = appFid || 309857

    const result = await sendMiniAppNotification({
      fid,
      appFid: clientAppFid,
      title,
      body: notificationBody,
      targetUrl
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Send Notification] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
