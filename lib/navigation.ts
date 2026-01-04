'use client'

import sdk from '@farcaster/frame-sdk'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://base-line.vercel.app'

// Check if running in Mini App
export async function isInMiniApp(): Promise<boolean> {
  try {
    return await sdk.isInMiniApp()
  } catch {
    return false
  }
}

// Open external URL
export async function openUrl(url: string) {
  try {
    const inMiniApp = await isInMiniApp()
    if (inMiniApp) {
      await sdk.actions.openUrl(url)
    } else {
      window.open(url, '_blank')
    }
  } catch (error) {
    console.error('openUrl error:', error)
    window.open(url, '_blank')
  }
}

// Compose a cast with optional embeds
export async function composeCast(text: string, embeds?: string[]) {
  try {
    const inMiniApp = await isInMiniApp()
    if (inMiniApp) {
      await sdk.actions.composeCast({ text, embeds: embeds as [string, string] | [string] | [] })
    } else {
      const params = new URLSearchParams({ text })
      if (embeds?.length) {
        params.set('embeds[]', embeds[0])
      }
      window.open(`https://warpcast.com/~/compose?${params}`, '_blank')
    }
  } catch (error) {
    console.error('composeCast error:', error)
  }
}

// Share health score to Farcaster
export function shareHealthScore(score: number, address: string) {
  const text = `ðŸ¥ My DeFi Health Score: ${score}/100\n\nCheck your portfolio health on Baseline ðŸ‘‡`
  const embedUrl = `${APP_URL}/reputation/${address}`
  composeCast(text, [embedUrl])
}

// Share XP achievement
export function shareXPAchievement(xp: number, level: number) {
  const text = `âš¡ I've earned ${xp} XP on Baseline!\n\nLevel ${level} and climbing ðŸš€`
  composeCast(text, [APP_URL])
}

// Share trader profile
export function shareTrader(traderAddress: string, traderName: string, roi: number) {
  const text = `ðŸ“ˆ Found this trader on Baseline:\n\n${traderName}: ${roi > 0 ? '+' : ''}${roi}% ROI\n\nCopy trade their moves ðŸ‘‡`
  const embedUrl = `${APP_URL}/trader/${traderAddress}`
  composeCast(text, [embedUrl])
}

// View a cast by URL or hash
export async function viewCast(castUrlOrHash: string) {
  try {
    const inMiniApp = await isInMiniApp()
    if (inMiniApp) {
      await sdk.actions.viewCast({ hash: castUrlOrHash })
    } else {
      window.open(castUrlOrHash, '_blank')
    }
  } catch (error) {
    console.error('viewCast error:', error)
  }
}

// View a user profile by FID
export async function viewProfile(fid: number) {
  try {
    const inMiniApp = await isInMiniApp()
    if (inMiniApp) {
      await sdk.actions.viewProfile({ fid })
    } else {
      window.open(`https://warpcast.com/~/profiles/${fid}`, '_blank')
    }
  } catch (error) {
    console.error('viewProfile error:', error)
  }
}

// Trigger haptic feedback
export async function haptic(style: 'light' | 'medium' | 'heavy' = 'medium') {
  try {
    const inMiniApp = await isInMiniApp()
    if (inMiniApp) {
      // Haptics not available in current SDK
    }
  } catch {
    // Haptics not available
  }
}

// Deep link to Mini App
export function getMiniAppDeepLink(path: string = '') {
  const url = `${APP_URL}${path}`
  return `cbwallet://miniapp?url=${encodeURIComponent(url)}`
}

// Deep link to DM with address
export function getDMDeepLink(address: string) {
  return `cbwallet://messaging/${address}`
}
