/**
 * Notification service for Farcaster via Neynar
 * Used to send push notifications to users in Base Mini Apps
 */

const NEYNAR_API_URL = 'https://api.neynar.com/v2/farcaster'

interface NotificationPayload {
  fid: number
  title: string
  body: string
  targetUrl?: string
}

/**
 * Send a notification to a Farcaster user via Neynar
 */
export async function sendNotification({
  fid,
  title,
  body,
  targetUrl = 'https://base-social-trade.vercel.app/portfolio',
}: NotificationPayload): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.NEYNAR_API_KEY

  if (!apiKey) {
    console.warn('NEYNAR_API_KEY not set, skipping notification')
    return { success: false, error: 'API key not configured' }
  }

  try {
    const response = await fetch(`${NEYNAR_API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        api_key: apiKey,
      },
      body: JSON.stringify({
        fid,
        title,
        body,
        target_url: targetUrl,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Neynar notification failed:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Notification error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Pre-built notification templates
 */
export const notifications = {
  healthImproved: (fid: number, newScore: number, newTier: string) =>
    sendNotification({
      fid,
      title: '🎉 Wallet Health Improved!',
      body: `You moved to ${newTier} (${newScore}/100)`,
    }),

  healthDeclined: (fid: number, newScore: number, newTier: string) =>
    sendNotification({
      fid,
      title: '⚠️ Wallet Health Alert',
      body: `Your score dropped to ${newTier} (${newScore}/100)`,
    }),

  shareConfirmed: (fid: number, xpEarned: number) =>
    sendNotification({
      fid,
      title: '✅ Share Confirmed',
      body: `+${xpEarned} XP earned! Keep sharing to grow your reputation.`,
    }),

  weeklyDigest: (fid: number, score: number, trend: 'up' | 'down' | 'stable') =>
    sendNotification({
      fid,
      title: '📊 Weekly Health Digest',
      body:
        trend === 'up'
          ? `Your score improved to ${score}/100 this week 📈`
          : trend === 'down'
          ? `Your score dropped to ${score}/100 this week 📉`
          : `Your score is stable at ${score}/100 this week`,
    }),

  riskWarning: (fid: number, warning: string) =>
    sendNotification({
      fid,
      title: '🚨 Portfolio Risk Alert',
      body: warning,
    }),

  eventReminder: (fid: number, eventTitle: string) =>
    sendNotification({
      fid,
      title: '🗓️ Event Starting Soon',
      body: `"${eventTitle}" is about to begin!`,
      targetUrl: 'https://base-social-trade.vercel.app/events',
    }),
}

/**
 * Get health tier from score
 */
export function getTier(score: number): string {
  if (score >= 80) return 'Healthy'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Moderate'
  if (score >= 35) return 'At Risk'
  return 'Risky'
}

/**
 * Check if score change warrants a notification
 */
export function shouldNotify(oldScore: number, newScore: number): boolean {
  return getTier(oldScore) !== getTier(newScore)
}
