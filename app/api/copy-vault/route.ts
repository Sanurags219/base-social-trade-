import { NextRequest, NextResponse } from 'next/server'

/**
 * Simulated vault database (in-memory)
 * TODO: Migrate to Supabase
 */
const vaults: Map<string, {
  vaultAddress: string
  owner: string
  trader: string
  copyPercent: number
  totalDeposited: number
  totalExecuted: number
  active: boolean
  createdAt: number
}> = new Map()

/**
 * Get all vaults for a user (as owner)
 */
function getUserVaults(address: string): any[] {
  const userVaults = []
  for (const [, vault] of vaults) {
    if (vault.owner.toLowerCase() === address.toLowerCase()) {
      userVaults.push(vault)
    }
  }
  return userVaults
}

/**
 * Get all vaults copying a specific trader
 */
function getTraderVaults(traderAddress: string): any[] {
  const traderVaults = []
  for (const [, vault] of vaults) {
    if (vault.trader.toLowerCase() === traderAddress.toLowerCase() && vault.active) {
      traderVaults.push(vault)
    }
  }
  return traderVaults
}

/**
 * Fetch reputation for eligibility check
 */
async function getTraderReputation(address: string, origin: string): Promise<number> {
  try {
    const res = await fetch(`${origin}/api/reputation?address=${address}`)
    const data = await res.json()
    return data.score || 0
  } catch (e) {
    console.error('Failed to fetch reputation:', e)
    return 0
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userAddress = searchParams.get('user')
  const traderAddress = searchParams.get('trader')

  if (userAddress) {
    // Get all vaults owned by user
    const userVaults = getUserVaults(userAddress)
    return NextResponse.json({
      address: userAddress,
      vaults: userVaults,
      count: userVaults.length
    })
  }

  if (traderAddress) {
    // Get all active vaults copying this trader
    const traderVaults = getTraderVaults(traderAddress)
    return NextResponse.json({
      traderAddress,
      followers: traderVaults.length,
      totalAllocated: traderVaults.reduce((sum, v) => sum + v.totalDeposited, 0),
      vaults: traderVaults
    })
  }

  return NextResponse.json({ error: 'Provide user or trader address' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action } = body

  if (action === 'create') {
    const { owner, trader, copyPercent } = body

    if (!owner || !trader) {
      return NextResponse.json({ error: 'Invalid owner or trader' }, { status: 400 })
    }

    if (!copyPercent || copyPercent < 5 || copyPercent > 50) {
      return NextResponse.json(
        { error: 'Copy percent must be 5-50' },
        { status: 400 }
      )
    }

    // Check trader reputation (must be Trusted+ = 650+)
    const traderRep = await getTraderReputation(trader, req.nextUrl.origin)
    if (traderRep < 650) {
      return NextResponse.json(
        { error: `Trader reputation too low (${traderRep} < 650)` },
        { status: 403 }
      )
    }

    // Check user doesn't already have vault for this trader
    const existingVault = Array.from(vaults.values()).find(
      v => v.owner.toLowerCase() === owner.toLowerCase() &&
           v.trader.toLowerCase() === trader.toLowerCase() &&
           v.active
    )

    if (existingVault) {
      return NextResponse.json(
        { error: 'Already copying this trader' },
        { status: 400 }
      )
    }

    // Simulate vault deployment (in real scenario, would deploy smart contract)
    const vaultAddress = `0x${Math.random().toString(16).slice(2)}` // Mock address
    const vaultKey = `${owner}-${trader}`

    vaults.set(vaultKey, {
      vaultAddress,
      owner,
      trader,
      copyPercent,
      totalDeposited: 0,
      totalExecuted: 0,
      active: true,
      createdAt: Date.now()
    })

    return NextResponse.json({
      success: true,
      message: 'Copy vault created',
      vault: {
        vaultAddress,
        owner,
        trader,
        copyPercent,
        createdAt: new Date().toISOString()
      }
    })
  }

  if (action === 'update') {
    const { owner, trader, copyPercent } = body

    if (!copyPercent || copyPercent < 5 || copyPercent > 50) {
      return NextResponse.json(
        { error: 'Copy percent must be 5-50' },
        { status: 400 }
      )
    }

    const vaultKey = `${owner}-${trader}`
    const vault = vaults.get(vaultKey)

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
    }

    vault.copyPercent = copyPercent

    return NextResponse.json({
      success: true,
      message: 'Vault updated',
      vault
    })
  }

  if (action === 'deactivate') {
    const { owner, trader } = body

    const vaultKey = `${owner}-${trader}`
    const vault = vaults.get(vaultKey)

    if (!vault) {
      return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
    }

    vault.active = false

    return NextResponse.json({
      success: true,
      message: 'Vault deactivated'
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
