import { ScoreBreakdown } from './scoreEngine'

export type ReviewRoute = {
  label: string
  cta: string
  href: string
}

/**
 * Generate review routes based on score breakdown
 * Used to show actionable suggestions in Review Suggested state
 */
export function reviewRoutes(b: ScoreBreakdown): ReviewRoute[] {
  const r: ReviewRoute[] = []

  // Diversification below threshold
  if (b.diversification < 18) {
    r.push({
      label: 'Low diversification',
      cta: 'Diversify assets',
      href: '/traders'
    })
  }

  // Concentration too high (single asset 60%+)
  if (b.concentrationScore < 15) {
    r.push({
      label: 'High concentration',
      cta: 'Rebalance',
      href: '/swap?from=ETH'
    })
  }

  // Stablecoins below 20%
  if (b.stableScore < 10) {
    r.push({
      label: 'Low stablecoins',
      cta: 'Add USDC',
      href: '/swap?to=USDC'
    })
  }

  // No DeFi participation
  if (b.defiScore < 5) {
    r.push({
      label: 'No DeFi exposure',
      cta: 'Explore DeFi',
      href: '/traders'
    })
  }

  // No recent activity
  if (b.activityScore < 5) {
    r.push({
      label: 'Inactive wallet',
      cta: 'Make a swap',
      href: '/swap'
    })
  }

  return r
}
