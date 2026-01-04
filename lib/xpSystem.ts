/**
 * XP SYSTEM — FINAL (LOCKED)
 * XP IS NOT A TOKEN
 * XP is ranking + eligibility signal only
 */

export const XP_SOURCES = {
  // One-time actions
  CLAIM_SBT: 500,
  
  // Trading actions
  SWAP_MIN_10: 20,       // Swap >= $10
  COPY_TRADE_MIN_10: 100, // Copy trade >= $10
  
  // DeFi actions  
  DEFI_INTERACTION: 50,
  
  // Engagement actions
  DAILY_LOGIN: 50,       // Any onchain tx that day
  SHARE: 50,             // With cooldown (1 per 24h)
  
  // Base actions
  ANY_TX: 10,            // Any transaction
} as const

export type XPAction = keyof typeof XP_SOURCES

/**
 * Calculate XP for an action
 */
export function getXPForAction(action: XPAction): number {
  return XP_SOURCES[action]
}

/**
 * AIRDROP SUPPLY SPLIT (LOCKED)
 * BSTN Total Supply = 100%
 */
export const BSTN_SUPPLY = {
  COMMUNITY_AIRDROP: 40,  // XP-based
  LIQUIDITY_ECOSYSTEM: 20,
  TEAM_VESTED: 20,
  TREASURY: 10,
  FUTURE_INCENTIVES: 10,
} as const

/**
 * Snapshot data structure
 */
export type SnapshotData = {
  address: string
  totalXP: number
  score: number
  firstSeenAt: number
  onchainActions: number
  sybilFlag: boolean
}

/**
 * Check eligibility for airdrop
 * - XP > 0
 * - >= 1 onchain action
 * - Not flagged as sybil
 */
export function isEligibleForAirdrop(data: SnapshotData): boolean {
  return (
    data.totalXP > 0 &&
    data.onchainActions >= 1 &&
    !data.sybilFlag
  )
}
