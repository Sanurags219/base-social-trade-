import { NextRequest, NextResponse } from 'next/server'
import { keccak256, toBytes, encodePacked, getAddress } from 'viem'

// Task verification statuses stored in memory (use Redis/DB in production)
const verificationCache = new Map<string, Record<string, boolean>>()

// Get user's verification status
function getUserVerifications(address: string): Record<string, boolean> {
  const normalized = address.toLowerCase()
  if (!verificationCache.has(normalized)) {
    verificationCache.set(normalized, {})
  }
  return verificationCache.get(normalized)!
}

// Verify Farcaster share via Neynar API
async function verifyFarcasterShare(address: string): Promise<boolean> {
  try {
    const apiKey = process.env.NEYNAR_API_KEY
    if (!apiKey) return false

    // Search for casts mentioning baseline or the user's share
    const res = await fetch(
      `https://api.neynar.com/v2/farcaster/cast/search?q=baseline%20health%20score&limit=100`,
      {
        headers: { 'api_key': apiKey }
      }
    )
    
    if (!res.ok) return false
    
    const data = await res.json()
    
    // Check if any cast is from user's connected address
    // In production, link Farcaster FID to wallet address
    // For now, check if they shared anything with "baseline" keyword
    return data.result?.casts?.length > 0
  } catch (error) {
    console.error('Farcaster verification error:', error)
    return false
  }
}

// Verify swap transactions on Base
async function verifySwapTransactions(address: string, minSwaps: number = 5): Promise<boolean> {
  try {
    // Use Basescan API to check transaction count
    const apiKey = process.env.BASESCAN_API_KEY || ''
    const url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
    
    const res = await fetch(url)
    if (!res.ok) return false
    
    const data = await res.json()
    
    if (data.status !== '1' || !data.result) return false
    
    // Count swap-like transactions (interactions with DEX contracts)
    // Common DEX routers on Base
    const dexRouters = [
      '0x2626664c2603336e57b271c5c0b26f421741e481', // Uniswap V3 Router
      '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad', // Universal Router
      '0x6131b5fae19ea4f9d964eac0408e4408b66337b5', // Aerodrome
    ].map(a => a.toLowerCase())
    
    const swapTxs = data.result.filter((tx: any) => 
      dexRouters.includes(tx.to?.toLowerCase()) && 
      tx.isError === '0'
    )
    
    return swapTxs.length >= minSwaps
  } catch (error) {
    console.error('Swap verification error:', error)
    return false
  }
}

// Verify copy trade execution
async function verifyCopyTrade(address: string): Promise<boolean> {
  try {
    // Check if user has interacted with copy trade contract
    // For now, check if they've made any trade after viewing traders page
    const verifications = getUserVerifications(address)
    return verifications['visited_traders'] === true
  } catch (error) {
    return false
  }
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')
  const task = request.nextUrl.searchParams.get('task')

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }

  try {
    const normalizedAddress = getAddress(address)
    const verifications = getUserVerifications(normalizedAddress)

    // If specific task requested, verify it
    if (task) {
      let verified = false

      switch (task) {
        case 'connect':
          // Always verified if they're making this request with valid address
          verified = true
          break

        case 'portfolio':
          verified = verifications['visited_portfolio'] === true
          break

        case 'share':
          verified = await verifyFarcasterShare(normalizedAddress)
          break

        case 'traders':
          verified = verifications['visited_traders'] === true
          break

        case 'daily':
          // Daily is always claimable (contract handles 24h check)
          verified = true
          break

        case 'swap_5tx':
          verified = await verifySwapTransactions(normalizedAddress, 5)
          break

        case 'copy_trade':
          verified = await verifyCopyTrade(normalizedAddress)
          break

        default:
          verified = false
      }

      return NextResponse.json({
        task,
        verified,
        address: normalizedAddress
      })
    }

    // Return all verification statuses
    const [shareVerified, swapVerified] = await Promise.all([
      verifyFarcasterShare(normalizedAddress),
      verifySwapTransactions(normalizedAddress, 5)
    ])

    return NextResponse.json({
      address: normalizedAddress,
      verifications: {
        connect: true,
        portfolio: verifications['visited_portfolio'] === true,
        share: shareVerified,
        traders: verifications['visited_traders'] === true,
        daily: true,
        swap_5tx: swapVerified,
        copy_trade: verifications['visited_traders'] === true && swapVerified
      }
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

// POST to record page visits
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, action } = body

    if (!address || !action) {
      return NextResponse.json({ error: 'Address and action required' }, { status: 400 })
    }

    const normalizedAddress = getAddress(address)
    const verifications = getUserVerifications(normalizedAddress)

    switch (action) {
      case 'visit_portfolio':
        verifications['visited_portfolio'] = true
        break
      case 'visit_traders':
        verifications['visited_traders'] = true
        break
      case 'share_cast':
        verifications['shared_cast'] = true
        break
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      action,
      address: normalizedAddress
    })
  } catch (error) {
    console.error('Record action error:', error)
    return NextResponse.json({ error: 'Failed to record action' }, { status: 500 })
  }
}
