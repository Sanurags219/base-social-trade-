import { STABLES, BLUECHIPS, MEMES, classify, RiskCategory } from './riskTags'

export interface Token {
  symbol: string
  valueUSD: number
}

export interface HealthResult {
  score: number
  status: 'Healthy' | 'Good' | 'Moderate' | 'At Risk' | 'Risky'
  breakdown: {
    diversification: number
    stableRatio: number
    riskExposure: number
    concentration: number
  }
  tips: string[]
}

/**
 * Calculate wallet health score (0-100)
 * 
 * Breakdown:
 * - Diversification: 30 points (asset type variety)
 * - Stable Ratio: 25 points (optimal 20-40%)
 * - Risk Exposure: 25 points (meme/LP penalties)
 * - Concentration: 20 points (single asset exposure)
 */
export function calculateHealth(tokens: Token[], lpsUSD = 0): HealthResult {
  const total = tokens.reduce((a, t) => a + t.valueUSD, 0) + lpsUSD
  
  if (total === 0) {
    return {
      score: 0,
      status: 'Risky',
      breakdown: {
        diversification: 0,
        stableRatio: 0,
        riskExposure: 0,
        concentration: 0,
      },
      tips: ['Connect wallet to see your health score'],
    }
  }

  // --- DIVERSIFICATION (30 points max) ---
  // More asset types = better score
  // 1 type = 8pts, 2 = 16pts, 3 = 24pts, 4+ = 30pts
  const assetTypes = new Set<RiskCategory>()
  tokens.forEach(t => assetTypes.add(classify(t.symbol)))
  if (lpsUSD > 0) assetTypes.add('defi') // LPs count as DeFi exposure
  const diversification = Math.min(assetTypes.size * 8, 30)

  // --- STABLE RATIO (25 points max) ---
  // Optimal: 20-40% in stables for volatility protection
  const stableValue = tokens
    .filter(t => STABLES.includes(t.symbol.toUpperCase()))
    .reduce((a, t) => a + t.valueUSD, 0)
  const stablePct = stableValue / total
  
  let stableRatio = 5
  if (stablePct >= 0.2 && stablePct <= 0.4) {
    stableRatio = 25 // Perfect range
  } else if (stablePct >= 0.15 && stablePct <= 0.5) {
    stableRatio = 20 // Good
  } else if (stablePct >= 0.1 && stablePct <= 0.6) {
    stableRatio = 15 // Acceptable
  } else if (stablePct > 0.6) {
    stableRatio = 10 // Too conservative
  }

  // --- RISK EXPOSURE (25 points max) ---
  // Meme coins and unhedged LPs add risk
  const memeValue = tokens
    .filter(t => MEMES.includes(t.symbol.toUpperCase()))
    .reduce((a, t) => a + t.valueUSD, 0)
  const memePct = memeValue / total
  
  // LP penalty (impermanent loss risk)
  const lpPenalty = lpsUSD > 0 ? Math.min(Math.floor((lpsUSD / total) * 10), 5) : 0
  
  // Base 25, subtract for meme exposure and LP risk
  const riskExposure = Math.max(25 - Math.floor(memePct * 25) - lpPenalty, 0)

  // --- CONCENTRATION (20 points max) ---
  // Single asset dominance is risky
  const largest = Math.max(...tokens.map(t => t.valueUSD), lpsUSD)
  const largestPct = largest / total
  
  let concentration = 20
  if (largestPct > 0.8) {
    concentration = 5
  } else if (largestPct > 0.6) {
    concentration = 10
  } else if (largestPct > 0.4) {
    concentration = 15
  }

  // --- TOTAL SCORE ---
  const score = diversification + stableRatio + riskExposure + concentration
  
  // --- STATUS ---
  let status: HealthResult['status'] = 'Risky'
  if (score >= 80) status = 'Healthy'
  else if (score >= 65) status = 'Good'
  else if (score >= 50) status = 'Moderate'
  else if (score >= 35) status = 'At Risk'

  // --- ACTIONABLE TIPS ---
  const tips = generateTips(stablePct, memePct, largestPct, assetTypes.size, lpsUSD / total)

  return {
    score,
    status,
    breakdown: {
      diversification,
      stableRatio,
      riskExposure,
      concentration,
    },
    tips,
  }
}

function generateTips(
  stablePct: number,
  memePct: number,
  largestPct: number,
  assetTypes: number,
  lpPct: number
): string[] {
  const tips: string[] = []

  // Stablecoin advice
  if (stablePct < 0.15) {
    tips.push('Add stablecoins (15-30%) to reduce volatility')
  } else if (stablePct > 0.6) {
    tips.push('Consider diversifying into productive assets')
  }

  // Meme exposure
  if (memePct > 0.3) {
    tips.push('⚠️ High meme exposure - consider taking profits')
  } else if (memePct > 0.15) {
    tips.push('Meme allocation is moderate - monitor closely')
  }

  // Concentration
  if (largestPct > 0.7) {
    tips.push('⚠️ Single asset dominates - diversify to reduce risk')
  } else if (largestPct > 0.5) {
    tips.push('Consider spreading holdings across more assets')
  }

  // Diversification
  if (assetTypes < 2) {
    tips.push('Add different asset types for better diversification')
  }

  // LP exposure
  if (lpPct > 0.3) {
    tips.push('High LP exposure - watch for impermanent loss')
  }

  // Healthy wallet encouragement
  if (tips.length === 0) {
    tips.push('✨ Great balance! Your portfolio is well-diversified')
  }

  return tips.slice(0, 3) // Max 3 tips
}

/**
 * Get health tier from score
 */
export function getTier(score: number): string {
  if (score >= 80) return 'Healthy'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Moderate'
  if (score >= 35) return 'At Risk'
  return 'Risky'
}

/**
 * Check if tier changed between two scores
 */
export function tierChanged(oldScore: number, newScore: number): boolean {
  return getTier(oldScore) !== getTier(newScore)
}
