import { NextRequest, NextResponse } from 'next/server'

/**
 * Credit limits by reputation score
 */
const CREDIT_TIERS = {
  ELITE: { minScore: 850, limit: 5000 },      // $5,000 USDC
  TRUSTED: { minScore: 650, limit: 1500 },    // $1,500 USDC
  REGULAR: { minScore: 400, limit: 300 },     // $300 USDC
  NEW: { minScore: 0, limit: 0 }              // No credit
}

/**
 * Simulated loan database (in-memory)
 * TODO: Migrate to Supabase
 */
const loans: Map<string, {
  amount: number
  borrowedAt: number
  dueAt: number
  repaid: boolean
  defaulted: boolean
}> = new Map()

/**
 * Get credit tier and limit based on reputation score
 */
function getCreditTier(repScore: number): { tier: string; limit: number; emoji: string } {
  if (repScore >= CREDIT_TIERS.ELITE.minScore) {
    return { tier: 'Elite', limit: CREDIT_TIERS.ELITE.limit, emoji: '🟢' }
  }
  if (repScore >= CREDIT_TIERS.TRUSTED.minScore) {
    return { tier: 'Trusted', limit: CREDIT_TIERS.TRUSTED.limit, emoji: '🔵' }
  }
  if (repScore >= CREDIT_TIERS.REGULAR.minScore) {
    return { tier: 'Regular', limit: CREDIT_TIERS.REGULAR.limit, emoji: '🟡' }
  }
  return { tier: 'New', limit: 0, emoji: '🔴' }
}

/**
 * Check if user has active loan
 */
function hasActiveLoan(address: string): boolean {
  const loan = loans.get(address)
  if (!loan) return false
  return !loan.repaid && !loan.defaulted
}

/**
 * Get days until due date
 */
function getDaysUntilDue(dueAt: number): number {
  const now = Date.now()
  const daysMs = dueAt - now
  return Math.ceil(daysMs / (1000 * 60 * 60 * 24))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'No address provided' }, { status: 400 })
  }

  // Fetch reputation
  const repRes = await fetch(`${req.nextUrl.origin}/api/reputation?address=${address}`)
  const repData = await repRes.json()
  const repScore = repData.score || 0

  // Get credit tier
  const { tier, limit, emoji } = getCreditTier(repScore)

  // Get active loan if any
  const loan = loans.get(address)
  const hasLoan = hasActiveLoan(address)

  const response: any = {
    address,
    reputation: repScore,
    creditTier: tier,
    creditEmoji: emoji,
    creditLimit: limit,
    hasActiveLoan: hasLoan
  }

  if (hasLoan && loan) {
    const daysUntilDue = getDaysUntilDue(loan.dueAt)
    const isOverdue = daysUntilDue < 0

    response.activeLoan = {
      amount: loan.amount,
      borrowedAt: new Date(loan.borrowedAt).toISOString(),
      dueAt: new Date(loan.dueAt).toISOString(),
      daysUntilDue,
      isOverdue,
      status: isOverdue ? 'OVERDUE' : 'ACTIVE'
    }
  }

  return NextResponse.json(response)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { address, action } = body

  if (!address) {
    return NextResponse.json({ error: 'No address' }, { status: 400 })
  }

  // Fetch reputation
  const repRes = await fetch(`${req.nextUrl.origin}/api/reputation?address=${address}`)
  const repData = await repRes.json()
  const repScore = repData.score || 0

  const { tier, limit } = getCreditTier(repScore)

  if (action === 'borrow') {
    const { amount } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (limit === 0) {
      return NextResponse.json(
        { error: 'No credit available (reputation too low)' },
        { status: 403 }
      )
    }

    if (amount > limit) {
      return NextResponse.json(
        { error: `Exceeds credit limit of $${limit}` },
        { status: 400 }
      )
    }

    if (hasActiveLoan(address)) {
      return NextResponse.json(
        { error: 'Active loan exists. Repay first.' },
        { status: 400 }
      )
    }

    // Create loan
    const now = Date.now()
    const dueAt = now + 14 * 24 * 60 * 60 * 1000 // 14 days

    loans.set(address, {
      amount,
      borrowedAt: now,
      dueAt,
      repaid: false,
      defaulted: false
    })

    return NextResponse.json({
      success: true,
      message: `Borrowed $${amount} USDC`,
      loan: {
        amount,
        borrowedAt: new Date(now).toISOString(),
        dueAt: new Date(dueAt).toISOString(),
        term: '14 days'
      }
    })
  }

  if (action === 'repay') {
    const loan = loans.get(address)

    if (!loan || (loan.repaid || loan.defaulted)) {
      return NextResponse.json({ error: 'No active loan' }, { status: 400 })
    }

    // Mark as repaid
    loan.repaid = true

    return NextResponse.json({
      success: true,
      message: `Repaid $${loan.amount} USDC`,
      repaymentDetails: {
        amount: loan.amount,
        repaidAt: new Date().toISOString(),
        onTime: Date.now() <= loan.dueAt
      }
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
