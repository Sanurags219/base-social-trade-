import { NextResponse } from 'next/server'
import { createPublicClient, http, getContract } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

const erc20Abi = [
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }]
  },
  {
    name: 'symbol',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }]
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }]
  }
] as const

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address || !address.startsWith('0x') || address.length !== 42) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  try {
    const contract = getContract({
      address: address as `0x${string}`,
      abi: erc20Abi,
      client
    })

    const [name, symbol, decimals] = await Promise.all([
      contract.read.name().catch(() => 'Unknown'),
      contract.read.symbol().catch(() => 'TOKEN'),
      contract.read.decimals().catch(() => 18)
    ])

    return NextResponse.json({
      name,
      symbol,
      decimals: Number(decimals),
      address
    })
  } catch (error) {
    console.error('Token info error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch token info',
      name: 'Unknown Token',
      symbol: 'TOKEN',
      decimals: 18,
      address
    }, { status: 200 })
  }
}
