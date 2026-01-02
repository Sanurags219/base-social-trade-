import { NextRequest, NextResponse } from 'next/server'
import { notifications, getTier, shouldNotify } from '@/lib/notify'

// Simple in-memory store for last scores (use Redis/DB in production)
const lastScores = new Map<number, number>()

interface NotifyRequest {
  fid: number
  newScore: number
  type?: 'score_change' | 'share' | 'weekly' | 'risk'
  xp?: number
  warning?: string
}

interface NotifyResult {
  success: boolean
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: NotifyRequest = await request.json()
    const { fid, newScore, type = 'score_change', xp, warning } = body

    if (!fid) {
      return NextResponse.json({ error: 'FID required' }, { status: 400 })
    }

    let result: NotifyResult = { success: false, error: 'Unknown type' }

    switch (type) {
      case 'score_change': {
        const oldScore = lastScores.get(fid) || 50 // Default to 50 for new users

        // Only notify if tier changed
        if (shouldNotify(oldScore, newScore)) {
          const newTier = getTier(newScore)
          const improved = newScore > oldScore

          if (improved) {
            result = await notifications.healthImproved(fid, newScore, newTier)
          } else {
            result = await notifications.healthDeclined(fid, newScore, newTier)
          }
        } else {
          result = { success: true, error: 'No tier change, no notification sent' }
        }

        // Update stored score
        lastScores.set(fid, newScore)
        break
      }

      case 'share': {
        if (xp) {
          result = await notifications.shareConfirmed(fid, xp)
        }
        break
      }

      case 'weekly': {
        const oldScore = lastScores.get(fid) || newScore
        const trend =
          newScore > oldScore + 5
            ? 'up'
            : newScore < oldScore - 5
            ? 'down'
            : 'stable'
        result = await notifications.weeklyDigest(fid, newScore, trend as 'up' | 'down' | 'stable')
        lastScores.set(fid, newScore)
        break
      }

      case 'risk': {
        if (warning) {
          result = await notifications.riskWarning(fid, warning)
        }
        break
      }
    }

    return NextResponse.json({
      ...result,
      tier: getTier(newScore),
      previousScore: lastScores.get(fid),
    })
  } catch (error) {
    console.error('Notify error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}

/**
 * GET: Check last score and notification status for a user
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const fid = searchParams.get('fid')

  if (!fid) {
    return NextResponse.json({ error: 'FID required' }, { status: 400 })
  }

  const fidNum = parseInt(fid, 10)
  const lastScore = lastScores.get(fidNum)

  return NextResponse.json({
    fid: fidNum,
    lastScore: lastScore || null,
    lastTier: lastScore ? getTier(lastScore) : null,
    hasHistory: lastScores.has(fidNum),
  })
}
