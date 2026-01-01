# Reputation-Gated Copy Trading System

## Overview

The system prevents low-reputation traders from copy-trading while incentivizing good behavior through tier-based XP rewards.

## Reputation Gating Rules

### Copy Trading Access

| Tier | Rep Score | Copy Access | UI State |
|------|-----------|-------------|----------|
| Elite | 800+ | ✅ Enabled | 🟢 Green checkmark |
| Trusted | 600-799 | ✅ Enabled | 🔵 Blue approved |
| Regular | 400-599 | ✅ Enabled | 🟡 Yellow approved |
| New | <400 | ❌ Disabled | 🔴 Red blocked |

### Warning Modals

- **Medium-Risk (400-649):** Yellow modal warning "Review trades carefully"
- **Low-Risk (<400):** Red modal blocking "Copy-trading disabled. Build reputation first"

## XP Reward System

### Copier XP (per copy trade)

| Rep Tier | Reward |
|----------|--------|
| Elite (800+) | +40 XP |
| Trusted (600-799) | +25 XP |
| Regular (400-599) | +25 XP |
| New (<400) | 0 XP (disabled) |

### Trainer XP (for being copied)

| Rep Tier | Reward |
|----------|--------|
| Elite (800+) | +30 XP |
| Trusted (600-799) | +15 XP |
| Regular (400-599) | +15 XP |
| New (<400) | 0 XP (disabled) |

### First Copy Bonus

- **+50 XP** for the first copy-trade of the day (once per day per wallet)
- Applied to both copier and trainer

## Implementation Files

### Trader Profile Page
**File:** [app/trader/[address]/page.tsx](app/trader/[address]/page.tsx)

Features:
- Displays reputation score with animated progress bar
- Color-coded by tier (green/blue/yellow/red)
- Shows all 4 stats: XP, Trades, Followers, Copy Trades
- Copy Trade button:
  - **Disabled** if rep < 400 (greyed out, cursor not-allowed)
  - **Enabled** if rep >= 400 with tier label
  - Passes `tier` parameter: `/swap?copy=0x...&tier=elite|trusted|regular`
- Warning modals for medium-risk and low-risk traders
- Info boxes showing:
  - Expected XP rewards by tier
  - Safety tips (10% amount, 1% slippage, confirm before execute)

### XP Reward API
**File:** [app/api/xp/route.ts](app/api/xp/route.ts)

**POST Handler:**
```typescript
// Request body
{
  address: string,        // Copier wallet
  xp: number,            // Base XP amount
  copiedFrom?: string,   // Trainer wallet (optional)
  copiedFromRep?: number // Trainer reputation score
}

// Response
{
  address: string,
  xp: number,           // Total XP after update
  copiedFrom?: string,
  trainerXP?: number,   // XP awarded to trainer
  bonus?: number,       // First-copy bonus if applied
  message: string
}
```

**GET Handler:**
```typescript
// Query params
?address=0x...  // Specific user
// or no params for leaderboard

// Response (user)
{
  address: string,
  xp: number,
  copiedTrades: number,
  lastCopyDate: string
}

// Response (leaderboard)
[
  { address: string, xp: number },
  ...
]
```

### Reputation API (updated)
**File:** [app/api/reputation/route.ts](app/api/reputation/route.ts)

Features:
- Tries on-chain read first (if `NEXT_PUBLIC_REP_CONTRACT` set)
- Falls back to mock data if contract not set
- Returns: `{ address, score, source: 'onchain'|'mock', lastUpdated }`

## Data Flow

### Copy Trading Flow

1. User visits `/trader/0xabc...`
2. Page fetches:
   - Trader stats from `/api/trader?address=0xabc...`
   - Trader reputation from `/api/reputation?address=0xabc...`
3. Server compares reputation score:
   - If < 400: Copy button disabled + red warning
   - If 400-649: Copy button enabled + yellow warning
   - If >= 650: Copy button enabled (no warning)
4. User clicks "Copy Trade" → navigates to `/swap?copy=0xabc...&tier=elite|trusted|regular`
5. Swap page (TODO):
   - Shows copy context: "Copying @Trader Name (Elite, 850 rep)"
   - Prefills: 10% of balance, 1% max slippage
   - Requires manual confirmation
6. User confirms swap
7. Frontend calls `POST /api/xp` with:
   ```json
   {
     "address": "0xcurrentUser",
     "xp": 10,
     "copiedFrom": "0xabc...",
     "copiedFromRep": 850
   }
   ```
8. API calculates and awards XP:
   - Copier: +40 XP (Elite tier) or +50 if first copy today
   - Trainer: +30 XP (Elite tier)

## Testing Checklist

- [ ] Visit trader profile with rep >= 400 → Copy button enabled
- [ ] Visit trader profile with rep < 400 → Copy button disabled + red warning
- [ ] Visit trader profile with 400 <= rep < 650 → Yellow warning modal
- [ ] Click copy trade with rep >= 400 → Navigates to `/swap?copy=...&tier=...`
- [ ] POST to `/api/xp` with valid data → Correct XP awarded
- [ ] POST to `/api/xp` with first copy of day → +50 bonus XP added
- [ ] POST to `/api/xp` with trainer → Trainer XP calculated correctly

## TODO

- [ ] Update `/swap` page to show copy context banner
- [ ] Implement safety defaults (10% amount, 1% slippage)
- [ ] Display trader tier + reputation in swap page
- [ ] Require explicit "Confirm Copy" button
- [ ] Migrate XP storage to Supabase
- [ ] Add reputation update cron job (once per day)
- [ ] Add analytics tracking for copy trades
