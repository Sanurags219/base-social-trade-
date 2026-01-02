export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'

const REP_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_REP_CONTRACT || '0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b'
const BASE_RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org'

const FUNCTION_SELECTORS = {
  getReputation: '0xf1127ed8',
  reputation: '0x2929abe6',
  scores: '0x6a7cd8a1',
}

async function getOnChainReputation(address: string) {
  if (REP_CONTRACT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    return null
  }

  const paddedAddress = address.toLowerCase().replace('0x', '').padStart(64, '0')

  for (const [name, selector] of Object.entries(FUNCTION_SELECTORS)) {
    try {
      const response = await fetch(BASE_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            { to: REP_CONTRACT_ADDRESS, data: selector + paddedAddress },
            'latest'
          ],
          id: 1
        })
      })

      const data = await response.json()
      if (data.result && data.result !== '0x' && data.result.length > 2) {
        const score = parseInt(data.result.slice(0, 66), 16) || 0
        return { score, source: 'onchain', method: name }
      }
    } catch (error) {
      console.error(`Failed ${name}:`, error)
    }
  }
  return null
}

function getDefaultReputation(address: string) {
  const hash = address.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const score = (hash % 600) + 200 // 200-800 range
  
  // Generate breakdown scores (total = score)
  const xpScore = Math.floor(score * 0.25)
  const tradingScore = Math.floor(score * 0.30)
  const ageScore = Math.floor(score * 0.15)
  const socialScore = Math.floor(score * 0.15)
  const riskScore = score - xpScore - tradingScore - ageScore - socialScore

  const tier = score >= 850 ? 'Elite' : score >= 650 ? 'Trusted' : score >= 400 ? 'Regular' : 'New'
  
  return {
    address,
    score,
    tier,
    breakdown: {
      xpScore,
      tradingScore,
      ageScore,
      socialScore,
      riskScore
    },
    source: 'default'
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address') || '0x0000000000000000000000000000000000000000'

  const onChainRep = await getOnChainReputation(address)
  
  if (onChainRep) {
    const score = onChainRep.score
    const tier = score >= 850 ? 'Elite' : score >= 650 ? 'Trusted' : score >= 400 ? 'Regular' : 'New'
    
    return NextResponse.json({
      address,
      score,
      tier,
      breakdown: {
        xpScore: Math.floor(score * 0.25),
        tradingScore: Math.floor(score * 0.30),
        ageScore: Math.floor(score * 0.15),
        socialScore: Math.floor(score * 0.15),
        riskScore: Math.floor(score * 0.15)
      },
      source: 'onchain',
      lastUpdated: new Date().toISOString()
    })
  }

  const defaultRep = getDefaultReputation(address)
  return NextResponse.json({
    ...defaultRep,
    lastUpdated: new Date().toISOString()
  })
}
