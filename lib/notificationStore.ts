// Notification token storage
// In production, use Redis or a database

interface NotificationToken {
  url: string
  token: string
  fid: number
  appFid: number
  createdAt: number
}

// Global storage (persists during server runtime)
const globalForTokens = globalThis as unknown as {
  notificationTokens: Map<string, NotificationToken> | undefined
}

export const notificationTokens = globalForTokens.notificationTokens ?? new Map<string, NotificationToken>()

if (process.env.NODE_ENV !== 'production') {
  globalForTokens.notificationTokens = notificationTokens
}

// Get user's notification details by FID
export function getUserNotificationDetails(fid: number, appFid: number): NotificationToken | undefined {
  const key = `${fid}:${appFid}`
  return notificationTokens.get(key)
}

// Save user's notification details
export function setUserNotificationDetails(fid: number, appFid: number, details: { url: string; token: string }) {
  const key = `${fid}:${appFid}`
  notificationTokens.set(key, {
    ...details,
    fid,
    appFid,
    createdAt: Date.now()
  })
  console.log(`[NotificationStore] Saved token for FID ${fid} (App: ${appFid})`)
}

// Delete user's notification details
export function deleteUserNotificationDetails(fid: number, appFid: number) {
  const key = `${fid}:${appFid}`
  notificationTokens.delete(key)
  console.log(`[NotificationStore] Deleted token for FID ${fid} (App: ${appFid})`)
}

// Get all active tokens count
export function getActiveTokensCount(): number {
  return notificationTokens.size
}

// Send notification to user
export async function sendMiniAppNotification({
  fid,
  appFid,
  title,
  body,
  targetUrl,
}: {
  fid: number
  appFid: number
  title: string
  body: string
  targetUrl?: string
}): Promise<{ state: string; error?: any }> {
  const details = getUserNotificationDetails(fid, appFid)
  if (!details) {
    console.log(`[Notification] No token found for FID ${fid}`)
    return { state: 'no_token' }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://base-line.vercel.app'
  
  try {
    const response = await fetch(details.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: crypto.randomUUID(),
        title: title.slice(0, 32),
        body: body.slice(0, 128),
        targetUrl: targetUrl || appUrl,
        tokens: [details.token],
      }),
    })

    const responseJson = await response.json()

    if (response.status === 200) {
      if (responseJson.result?.invalidTokens?.length) {
        deleteUserNotificationDetails(fid, appFid)
        return { state: 'invalid_token' }
      }
      if (responseJson.result?.rateLimitedTokens?.length) {
        return { state: 'rate_limit' }
      }
      console.log(`[Notification] Sent to FID ${fid}: ${title}`)
      return { state: 'success' }
    } else {
      console.error(`[Notification] Error:`, responseJson)
      return { state: 'error', error: responseJson }
    }
  } catch (error) {
    console.error(`[Notification] Failed:`, error)
    return { state: 'error', error }
  }
}
