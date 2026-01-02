export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

const COPY_VAULT_FACTORY = process.env.NEXT_PUBLIC_COPY_VAULT_CONTRACT || '0x71a89FDa4e2101855a35394a713Fe54e9a17c77c'
const BASE_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'

// Function selectors
const GET_USER_VAULTS_SELECTOR = '0x0d6a3e90' // getUserVaults(address)
const TOTAL_VAULTS_SELECTOR = '0x96960c78' // totalVaults()
const GET_STATUS_SELECTOR = '0x4e69d560' // getStatus()

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

async function getTotalVaults(): Promise<number> {
  try {
    const result = await ethCall(COPY_VAULT_FACTORY, TOTAL_VAULTS_SELECTOR)
    if (result && result !== '0x') {
      return Number(BigInt(result))
    }
  } catch (e) {
    console.error('getTotalVaults error:', e)
  }
  return 0
}

async function getUserVaults(address: string): Promise<string[]> {
  try {
    const data = GET_USER_VAULTS_SELECTOR + padAddress(address)
    const result = await ethCall(COPY_VAULT_FACTORY, data)
    
    if (result && result !== '0x' && result.length > 130) {
      // Decode dynamic array
      const hex = result.slice(2)
      const offset = Number(BigInt('0x' + hex.slice(0, 64)))
      const length = Number(BigInt('0x' + hex.slice(offset * 2, offset * 2 + 64)))
      
      const vaults: string[] = []
      for (let i = 0; i < length; i++) {
        const start = (offset + 1 + i) * 64
        const addr = '0x' + hex.slice(start + 24, start + 64)
        vaults.push(addr)
      }
      return vaults
    }
  } catch (e) {
    console.error('getUserVaults error:', e)
  }
  return []
}

async function getVaultStatus(vaultAddress: string) {
  try {
    const result = await ethCall(vaultAddress, GET_STATUS_SELECTOR)
    if (result && result !== '0x' && result.length > 2) {
      const hex = result.slice(2)
      const owner = '0x' + hex.slice(24, 64)
      const trader = '0x' + hex.slice(88, 128)
      const copyPercent = Number(BigInt('0x' + hex.slice(128, 192)))
      const totalDeposited = BigInt('0x' + hex.slice(192, 256))
      const totalExecuted = BigInt('0x' + hex.slice(256, 320))
      const active = BigInt('0x' + hex.slice(320, 384)) === 1n

      return {
        address: vaultAddress,
        owner,
        trader,
        copyPercent,
        totalDeposited: Number(totalDeposited) / 1e6, // Assuming USDC
        totalExecuted: Number(totalExecuted) / 1e6,
        active
      }
    }
  } catch (e) {
    console.error('getVaultStatus error:', e)
  }
  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')
  const vault = searchParams.get('vault')

  // Get specific vault status
  if (vault) {
    const status = await getVaultStatus(vault)
    if (status) {
      return NextResponse.json({
        ...status,
        source: 'onchain'
      })
    }
    return NextResponse.json({ error: 'Vault not found' }, { status: 404 })
  }

  // Get user's vaults
  if (address) {
    const vaults = await getUserVaults(address)
    const vaultDetails = await Promise.all(
      vaults.map(v => getVaultStatus(v))
    )

    return NextResponse.json({
      address,
      vaults: vaultDetails.filter(Boolean),
      count: vaults.length,
      factory: COPY_VAULT_FACTORY,
      source: 'onchain'
    })
  }

  // Get factory stats
  const totalVaults = await getTotalVaults()

  return NextResponse.json({
    factory: COPY_VAULT_FACTORY,
    totalVaults,
    source: 'onchain'
  })
}
