export type Asset = {
  symbol: string
  usdValue: number
  category: 'stable' | 'bluechip' | 'defi' | 'meme' | 'unknown'
  risk: 'low' | 'medium' | 'high'
}

export type ScoreBreakdown = {
  diversification: number
  stableScore: number
  riskScore: number
  concentrationScore: number
}

const zero = (): ScoreBreakdown => ({
  diversification: 0,
  stableScore: 0,
  riskScore: 0,
  concentrationScore: 0
})

export function calculateHealthScore(assets: Asset[]): {
  score: number
  breakdown: ScoreBreakdown
} {
  const total = assets.reduce((s, a) => s + a.usdValue, 0)
  if (!total) return { score: 0, breakdown: zero() }

  // Diversification (30)
  const n = assets.length
  const diversification =
    n >= 5 ? 30 : n === 4 ? 24 : n === 3 ? 18 : n === 2 ? 10 : 5

  // Stable ratio (25)
  const stable = assets
    .filter(a => a.category === 'stable')
    .reduce((s, a) => s + a.usdValue, 0)
  const sr = stable / total
  const stableScore = sr >= 0.3 ? 25 : sr >= 0.2 ? 18 : sr >= 0.1 ? 10 : 3

  // Risk exposure (25)
  const high = assets
    .filter(a => a.risk === 'high')
    .reduce((s, a) => s + a.usdValue, 0)
  const rr = high / total
  const riskScore = rr < 0.2 ? 25 : rr < 0.4 ? 18 : rr < 0.6 ? 10 : 3

  // Concentration (20)
  const max = Math.max(...assets.map(a => a.usdValue))
  const cr = max / total
  const concentrationScore = cr < 0.4 ? 20 : cr < 0.6 ? 14 : cr < 0.8 ? 7 : 2

  const score = diversification + stableScore + riskScore + concentrationScore

  return {
    score,
    breakdown: { diversification, stableScore, riskScore, concentrationScore }
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
  if (['USDC', 'USDT', 'DAI', 'BUSD', 'TUSD', 'FRAX', 'LUSD'].includes(upper)) {
    return { category: 'stable', risk: 'low' }
  }

  // Blue chips
  if (['ETH', 'WETH', 'CBETH', 'STETH', 'RETH', 'BTC', 'WBTC'].includes(upper)) {
    return { category: 'bluechip', risk: 'low' }
  }

  // DeFi tokens
  if (['UNI', 'AAVE', 'COMP', 'MKR', 'LDO', 'CRV', 'SNX', 'LINK'].includes(upper)) {
    return { category: 'defi', risk: 'medium' }
  }

  // Meme coins
  if (['DEGEN', 'PEPE', 'SHIB', 'DOGE', 'FLOKI', 'BONK', 'WIF'].includes(upper)) {
    return { category: 'meme', risk: 'high' }
  }

  // Unknown = high risk
  return { category: 'unknown', risk: 'high' }
}
