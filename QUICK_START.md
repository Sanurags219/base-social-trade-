# 🚀 Quick Start & Reference

## What You Built

A **Web3 social trading platform on Base** with on-chain reputation, gated copy trading, XP rewards, and under-collateralized credit.

## All Routes (13 Total)

```
/                    → Home + wallet connection
/swap                → Token swap + copy context
/trader/[address]    → Trader profile + reputation gating
/reputation/[address]→ Detailed reputation breakdown
/leaderboard         → XP rankings with badges
/credit              → Credit dashboard & system
/claim               → BSTN token claims
/launch              → Event countdown page

/api/reputation      → Fetch reputation (on-chain or mock)
/api/xp              → XP tracking & leaderboard
/api/trader          → Trader stats
/api/credit          → Credit status & limits
/api/og/trade        → OG image generation
```

## Three Smart Contracts

### 1. ReputationSBT.sol (On-chain Identity)
- Non-transferable ERC721
- Stores: score (0-1000) + lastUpdated (timestamp)
- **Deploy:** Remix → Base mainnet
- **Save:** `NEXT_PUBLIC_REP_CONTRACT` in `.env.local`

### 2. ReputationCreditVault.sol (Under-Collateralized Loans)
- Reads reputation from SBT
- Credit tiers: Elite $5k, Trusted $1.5k, Regular $300
- Terms: 14 days, no interest, one per wallet
- **Deploy:** Remix → Base mainnet
- **Needs:** USDC address (0x833589...02913)

### 3. BSTN.sol + BSTNClaim.sol (Token + Claims)
- Already deployed on Base
- Merkle tree snapshot-based claiming

## Key Data Flows

### ✅ Copy Trade Flow
```
1. Visit /trader/0x...
2. Fetch reputation from /api/reputation
3. If rep >= 400 → Copy button enabled
4. Click → /swap?copy=0x...&tier=elite|trusted|regular
5. Swap page prefills 10%, caps slippage at 1%
6. Execute swap → POST /api/xp awards tier-based XP
7. Trainer also gets XP (tier-based)
8. First copy bonus: +50 XP
```

### 💳 Credit Flow
```
1. Visit /credit
2. Fetch credit tier from /api/credit?address=0x...
3. Get limit = creditLimit(reputation)
4. Borrow → POST /api/credit action=borrow
5. Loan stored: amount, dueAt (14 days), status
6. At due date → Check repayment status
7. Late → Reputation -20
8. On-time → Reputation +10
```

### 📊 XP Reward Math
```
Base XP:       +10 (borrow amount / 50)
Copier bonus:  +40 (Elite) | +25 (Trusted/Regular) | 0 (New)
Trainer bonus: +30 (Elite) | +15 (Trusted/Regular) | 0 (New)
First copy:    +50 (once per day)

Total = Base + Copier Bonus + Trainer Bonus + First Copy Bonus
```

## Reputation Tiers (Locked)

| Score | Tier | Copy? | Credit |
|-------|------|-------|--------|
| 850+ | 🟢 Elite | ✅ | $5,000 |
| 650-849 | 🔵 Trusted | ✅ | $1,500 |
| 400-649 | 🟡 Regular | ✅ | $300 |
| <400 | 🔴 New | ❌ | $0 |

## Environment Setup

```bash
# Required
NEXT_PUBLIC_WALLET_CONNECT_ID=your_project_id
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org

# Optional (falls back to mock)
NEXT_PUBLIC_REP_CONTRACT=0x...
NEXT_PUBLIC_CREDIT_CONTRACT=0x...
```

## Build & Deploy

```bash
# Build
npm run build

# Test (local)
npm run dev

# Deploy to Vercel
git push origin main
# Vercel auto-deploys on push
```

## Testing Checklist

- [ ] Visit trader with rep >= 400 → Copy button enabled
- [ ] Visit trader with rep < 400 → Copy button disabled + red warning
- [ ] Execute copy trade → XP awarded correctly
- [ ] Visit /credit → Credit limit matches reputation tier
- [ ] Borrow → Loan created, dueAt = 14 days
- [ ] Repay → Loan marked repaid, credit freed
- [ ] Leaderboard → XP and badges display correctly

## Common Issues

| Issue | Solution |
|-------|----------|
| Copy button always disabled | Check reputation >= 400, verify /api/reputation works |
| XP not awarded | Verify /api/xp POST includes copiedFrom & copiedFromRep |
| Credit showing $0 | Check reputation >= 400, verify /api/credit deploys |
| Build fails | Delete .next folder, run build again |
| Wallet not connecting | Verify NEXT_PUBLIC_WALLET_CONNECT_ID is set |

## File Quick Reference

### Pages (Under `app/`)
- `page.tsx` → Home
- `swap/page.tsx` → Swap interface
- `trader/[address]/page.tsx` → Trader profile
- `credit/page.tsx` → Credit dashboard
- `leaderboard/page.tsx` → XP rankings
- `claim/page.tsx` → Token claims
- `launch/page.tsx` → Event page

### APIs (Under `app/api/`)
- `reputation/route.ts` → On-chain + mock reputation
- `xp/route.ts` → XP tracking
- `credit/route.ts` → Credit limits & loans
- `trader/route.ts` → Trader stats
- `og/trade/route.ts` → OG images

### Components (Under `components/`)
- `CreditDashboard.tsx` → Credit UI
- `WalletConnect.tsx` → Wallet connection
- `XPBadge.tsx` → XP display
- `ShareTrade.tsx` → Social share

### Libraries (Under `lib/`)
- `swap.ts` → Uniswap V3 integration
- `sbt.ts` → SBT reading
- `reputation.ts` → Badge mapping

### Contracts (Under `contracts/`)
- `ReputationSBT.sol` → On-chain identity
- `ReputationCreditVault.sol` → Credit system
- `BSTN.sol` → Token (pre-deployed)
- `BSTNClaim.sol` → Claims (pre-deployed)

## Key Files to Know

| File | What It Does | Edit When |
|------|--------------|-----------|
| `next.config.ts` | Next.js config | Changing build behavior |
| `tailwind.config.ts` | Tailwind CSS | Changing colors/theme |
| `tsconfig.json` | TypeScript config | Changing path aliases |
| `package.json` | Dependencies | Adding new packages |
| `.env.local` | Secrets & config | Setting contract addresses |

## Deployment Platforms

### Recommended: Vercel
- 1-click deploy from GitHub
- Auto-preview on PRs
- 99.99% uptime
- Free tier generous

### Alternative: Self-Host
```bash
npm run build
npm start
# Use PM2 or systemd for process management
```

### Alternative: AWS / GCP / Azure
- More expensive
- More control
- Need DevOps knowledge

## Monitoring Checklist

### Daily
- [ ] Check `/leaderboard` for gaming
- [ ] Monitor `/api/xp` for anomalies
- [ ] Check `/api/credit` defaults
- [ ] Verify SBT minting normal

### Weekly
- [ ] Reputation distribution (should be bell curve)
- [ ] Copy trade volume trending
- [ ] Credit utilization rate
- [ ] User acquisition rate

### Monthly
- [ ] Tier migration rate (should increase)
- [ ] On-time repayment rate (should be >95%)
- [ ] Copy trade profitability
- [ ] Revenue (future)

## Next Steps (Phase 2)

1. **Database:** Migrate from in-memory to Supabase
2. **Liquidation:** Add risk management (Phase 2)
3. **Governance:** Add voting on parameters
4. **Analytics:** Build dashboard for metrics
5. **Mobile:** React Native app

## Resources

- [Next.js Docs](https://nextjs.org) — Framework
- [Viem Docs](https://viem.sh) — Ethereum JS
- [Wagmi Docs](https://wagmi.sh) — React hooks for Web3
- [Base Docs](https://docs.base.org) — L2 chain
- [Uniswap V3](https://uniswap.org) — DEX
- [Tailwind CSS](https://tailwindcss.com) — Styling

## Success Metrics (First 30 Days)

| Metric | Target | Good Sign If |
|--------|--------|---|
| Users | 50+ | Growing 10%+ daily |
| Copy Trades | 100+ | >50% of users copying |
| Avg Rep Score | 500+ | Users improving tier |
| On-Time Repayment | >95% | Trust building |
| TVL | $30k+ | Utilization high |

---

**Built with:** Next.js 16 + Viem + Wagmi + Base + Tailwind

**Status:** ✅ Ready for closed beta

🚀 **Go launch!**
