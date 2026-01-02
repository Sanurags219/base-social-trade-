export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

const CREDIT_CONTRACT = process.env.NEXT_PUBLIC_CREDIT_CONTRACT || '0xE0ae4de04B9Fa02e4a187601B7CF502CF55A0a2a'
const BASE_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'

// Function selectors
const CREDIT_LIMIT_SELECTOR = '0x7c3a00fd' // creditLimit(address)
const CREDIT_TIER_SELECTOR = '0x4a4f5b0b' // creditTier(address) 
const GET_LOAN_SELECTOR = '0xe90c2e1e' // getLoan(address)

function padAddress(address: string): string {
  return address.toLowerCase().replace('0x', '').padStart(64, '0')
}

async function ethCall(to: string, data: string) {
  const response = await fetch(BASE_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_call',
      params: [{ to, data }, 'latest'],
      id: 1
    })
  })
  const json = await response.json()
  return json.result
}

async function getCreditLimit(address: string): Promise<number> {
  try {
    const data = CREDIT_LIMIT_SELECTOR + padAddress(address)
    const result = await ethCall(CREDIT_CONTRACT, data)
    if (result && result !== '0x') {
      // Result is in USDC (6 decimals)
      const raw = BigInt(result)
      return Number(raw) / 1_000_000
    }
  } catch (e) {
    console.error('getCreditLimit error:', e)
  }
  return 0
}

async function getLoan(address: string) {
  try {
    const data = GET_LOAN_SELECTOR + padAddress(address)
    const result = await ethCall(CREDIT_CONTRACT, data)
    if (result && result !== '0x' && result.length > 2) {
      // Decode: amount, borrowedAt, dueAt, repaid, defaulted, isOverdue
      const hex = result.slice(2)
      const amount = BigInt('0x' + hex.slice(0, 64))
      const borrowedAt = BigInt('0x' + hex.slice(64, 128))
      const dueAt = BigInt('0x' + hex.slice(128, 192))
      const repaid = BigInt('0x' + hex.slice(192, 256)) === 1n
      const defaulted = BigInt('0x' + hex.slice(256, 320)) === 1n
      const isOverdue = BigInt('0x' + hex.slice(320, 384)) === 1n

      if (amount > 0n) {
        return {
          amount: Number(amount) / 1_000_000,
          borrowedAt: Number(borrowedAt),
          dueAt: Number(dueAt),
          repaid,
          defaulted,
          isOverdue
        }
      }
    }
  } catch (e) {
    console.error('getLoan error:', e)
  }
  return null
}

function getCreditTierFromLimit(limit: number): { tier: string; emoji: string } {
  if (limit >= 5000) return { tier: 'Elite', emoji: '🟢' }
  if (limit >= 1500) return { tier: 'Trusted', emoji: '🔵' }
  if (limit >= 300) return { tier: 'Regular', emoji: '🟡' }
  return { tier: 'New', emoji: '🔴' }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }

  const [creditLimit, loan] = await Promise.all([
    getCreditLimit(address),
    getLoan(address)
  ])

  const { tier, emoji } = getCreditTierFromLimit(creditLimit)
  const hasActiveLoan = loan && !loan.repaid && !loan.defaulted

  let daysUntilDue = 0
  if (loan && loan.dueAt) {
    daysUntilDue = Math.ceil((loan.dueAt * 1000 - Date.now()) / (1000 * 60 * 60 * 24))
  }

  return NextResponse.json({
    address,
    creditLimit,
    creditTier: tier,
    creditEmoji: emoji,
    reputation: creditLimit >= 5000 ? 850 : creditLimit >= 1500 ? 650 : creditLimit >= 300 ? 400 : 0,
    hasActiveLoan: !!hasActiveLoan,
    activeLoan: hasActiveLoan ? {
      amount: loan!.amount,
      borrowedAt: new Date(loan!.borrowedAt * 1000).toISOString(),
      dueAt: new Date(loan!.dueAt * 1000).toISOString(),
      daysUntilDue,
      isOverdue: loan!.isOverdue,
      status: loan!.isOverdue ? 'overdue' : 'active'
    } : null,
    contract: CREDIT_CONTRACT,
    source: 'onchain'
  })
}

export async function POST(req: NextRequest) {
  // POST requests should be handled client-side via wagmi writeContract
  return NextResponse.json({
    error: 'Use wallet to interact with contract',
    message: 'Borrow and repay functions must be called directly from your wallet',
    contract: CREDIT_CONTRACT
  }, { status: 400 })
}
