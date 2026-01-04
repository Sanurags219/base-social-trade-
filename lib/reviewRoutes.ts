import { ScoreBreakdown } from './scoreEngine'

export type ReviewRoute = {
  label: string
  cta: string
  href: string
}

export function reviewRoutes(b: ScoreBreakdown): ReviewRoute[] {
  const r: ReviewRoute[] = []

  if (b.diversification < 15) {
    r.push({
      label: 'Low diversification',
      cta: 'Diversify assets',
      href: '/swap?mode=diversify'
    })
  }

  if (b.stableScore < 15) {
    r.push({
      label: 'Low stablecoins',
      cta: 'Add USDC',
      href: '/swap?token=USDC'
    })
  }

  if (b.riskScore < 15) {
    r.push({
      label: 'High risk exposure',
      cta: 'Review risk',
      href: '/insights/risk'
    })
  }

  if (b.concentrationScore < 10) {
    r.push({
      label: 'High concentration',
      cta: 'Rebalance',
      href: '/insights/concentration'
    })
  }

  return r
}
