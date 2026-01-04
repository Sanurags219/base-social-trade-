export type Asset = {
  symbol: string
  usdValue: number
  category: 'stable' | 'bluechip' | 'defi' | 'meme' | 'unknown'
  risk: 'low' | 'medium' | 'high'
}

export type DefiPosition = {
  protocol: string
  type: 'lp' | 'lending' | 'staking'
  value: number
}

export type ScoreBreakdown = {
  diversification: number      // 30%
  concentrationScore: number   // 25%
  stableScore: number          // 15%
  defiScore: number            // 15%
  nftScore: number             // 5%
  activityScore: number        // 10%
}

const zero = (): ScoreBreakdown => ({
  diversification: 0,
  concentrationScore: 0,
  stableScore: 0,
  defiScore: 0,
  nftScore: 0,
  activityScore: 0
})

/**
 * SCORE ENGINE — FINAL (LOCKED)
 * Total = 100%
 * - Asset diversification: 30%
 * - Concentration risk: 25%
 * - Stablecoin ratio: 15%
 * - DeFi participation: 15%
 * - NFT impact (toggle): 5%
 * - Activity consistency: 10%
 */
export function calculateHealthScore(
  assets: Asset[],
  options?: {
    defiPositions?: DefiPosition[]
    includeNFTs?: boolean
    nftValue?: number
    hasRecentActivity?: boolean
  }
): {
  score: number
  breakdown: ScoreBreakdown
} {
  const total = assets.reduce((s, a) => s + a.usdValue, 0)
  if (!total) return { score: 0, breakdown: zero() }

  const { defiPositions = [], includeNFTs = false, nftValue = 0, hasRecentActivity = false } = options || {}

  // 1. Asset Diversification (30 points max)
  const n = assets.length
  const diversification =
    n >= 5 ? 30 : n === 4 ? 24 : n === 3 ? 18 : n === 2 ? 10 : 5

  // 2. Concentration Risk (25 points max)
  // 60%+ single asset = penalty
  const max = Math.max(...assets.map(a => a.usdValue))
  const cr = max / total
  let concentrationScore: number
  if (cr >= 0.6) {
    concentrationScore = 5  // Heavy penalty for 60%+ concentration
  } else if (cr >= 0.4) {
    concentrationScore = 15
  } else {
    concentrationScore = 25 // Good diversification
  }

  // 3. Stablecoin Ratio (15 points max)
  // >=20% = bonus, <10% = penalty
  const stable = assets
    .filter(a => a.category === 'stable')
    .reduce((s, a) => s + a.usdValue, 0)
  const sr = stable / total
  let stableScore: number
  if (sr >= 0.2) {
    stableScore = 15  // Bonus for 20%+ stables
  } else if (sr >= 0.1) {
    stableScore = 8
  } else {
    stableScore = 3   // Penalty for <10% stables
  }

  // 4. DeFi Participation (15 points max)
  // 1 LP = +3, 2+ LP = +5, single protocol >70% = -4
  let defiScore = 0
  const lpCount = defiPositions.filter(p => p.type === 'lp').length
  if (lpCount >= 2) {
    defiScore = 15
  } else if (lpCount === 1) {
    defiScore = 10
  } else if (defiPositions.length > 0) {
    defiScore = 5
  }
  // Check single protocol concentration
  if (defiPositions.length > 0) {
    const protocols = defiPositions.map(p => p.protocol)
    const protocolCounts = protocols.reduce((acc, p) => {
      acc[p] = (acc[p] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const maxProtocolShare = Math.max(...Object.values(protocolCounts)) / defiPositions.length
    if (maxProtocolShare > 0.7) {
      defiScore = Math.max(0, defiScore - 4)
    }
  }

  // 5. NFT Impact (5 points max) - Toggle controlled
  // High value NFT = +2, Illiquid NFT = -2
  let nftScore = 0
  if (includeNFTs && nftValue > 0) {
    if (nftValue >= 1000) {
      nftScore = 5  // High value NFTs
    } else if (nftValue >= 100) {
      nftScore = 2
    } else {
      nftScore = -2 // Illiquid/low value
    }
  }
  nftScore = Math.max(0, nftScore)

  // 6. Activity Consistency (10 points max)
  // Any onchain tx in last 14 days = +2, no activity = 0
  let activityScore = 0
  if (hasRecentActivity) {
    activityScore = 10
  }

  const score = Math.min(100, Math.max(0,
    diversification +
    concentrationScore +
    stableScore +
    defiScore +
    nftScore +
    activityScore
  ))

  return {
    score,
    breakdown: {
      diversification,
      concentrationScore,
      stableScore,
      defiScore,
      nftScore,
      activityScore
    }
  }
}

export const scoreStatus = (s: number): string =>
  s >= 75 ? 'Healthy' : s >= 50 ? 'Somewhat Safe' : 'Review Suggested'

export const scoreSubtitle = (s: number): string =>
  s >= 75
    ? 'Your portfolio is well-balanced and diversified'
    : s >= 50
    ? 'Your portfolio health is stable with room to improve'
    : 'Your portfolio can be improved by taking the steps below'

// Map token symbols to categories
export function categorizeToken(symbol: string): { category: Asset['category']; risk: Asset['risk'] } {
  const upper = symbol.toUpperCase()

  // Stablecoins
  if (['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'FRAX', 'LUSD', 'USDBC', 'EURC'].includes(upper)) {
    return { category: 'stable', risk: 'low' }
  }

  // Blue chips
  if (['ETH', 'WETH', 'CBETH', 'STETH', 'RETH', 'BTC', 'WBTC', 'CBBTC'].includes(upper)) {
    return { category: 'bluechip', risk: 'low' }
  }

  // DeFi tokens
  if (['UNI', 'AAVE', 'COMP', 'MKR', 'LDO', 'CRV', 'SNX', 'LINK', 'PENDLE', 'GMX'].includes(upper)) {
    return { category: 'defi', risk: 'medium' }
  }

  // Meme coins
  if (['DEGEN', 'PEPE', 'SHIB', 'DOGE', 'FLOKI', 'BONK', 'WIF', 'BRETT', 'TOSHI'].includes(upper)) {
    return { category: 'meme', risk: 'high' }
  }

  // Unknown = high risk
  return { category: 'unknown', risk: 'high' }
}
