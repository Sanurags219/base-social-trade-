export async function notifyFarcaster(fid: number, text: string) {
  if (!process.env.NEYNAR_API_KEY) {
    console.warn('NEYNAR_API_KEY not set, skipping notification')
    return
  }

  try {
    await fetch('https://api.neynar.com/v2/farcaster/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY
      },
      body: JSON.stringify({
        fid,
        notification: {
          title: 'Baseline',
          body: text
        }
      })
    })
  } catch (error) {
    console.error('Failed to send Farcaster notification:', error)
  }
}
