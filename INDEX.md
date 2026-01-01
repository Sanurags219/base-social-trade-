# 📚 Documentation Index

Complete guide to your Base social trading dApp.

## 🚀 Getting Started (Start Here)

1. **[DEPLOY_NOW.md](DEPLOY_NOW.md)** ⭐
   - 10-minute deployment guide
   - 3 contracts to deploy
   - Quick checklist
   - **👉 Start here if deploying today**

2. **[DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md)**
   - Current build status
   - Feature checklist
   - Go/no-go decision
   - Success metrics
   - **👉 Read this before going live**

3. **[QUICK_START.md](QUICK_START.md)**
   - All 14 routes
   - Quick reference
   - Environment setup
   - Common issues
   - **👉 Quick lookup guide**

---

## 📖 Full Documentation

### Project Overview
- **[README_COMPLETE.md](README_COMPLETE.md)** - Complete project guide (architecture, features, deployment, troubleshooting)

### Deployment
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Step-by-step Remix deployment
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Detailed testing checklist
- **[DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md)** - Go/no-go decision & metrics

### Features
- **[AUTO_COPY_SYSTEM.md](AUTO_COPY_SYSTEM.md)** - Automated copy trading vaults
- **[CREDIT_SYSTEM.md](CREDIT_SYSTEM.md)** - Under-collateralized lending
- **[REPUTATION_GATING.md](REPUTATION_GATING.md)** - Copy-trade gating rules
- **[SBT_DEPLOYMENT.md](SBT_DEPLOYMENT.md)** - SBT contract deployment (Phase 1)
- **[SBT_QUICK_REFERENCE.md](SBT_QUICK_REFERENCE.md)** - SBT quick reference
- **[REPUTATION.md](REPUTATION.md)** - Reputation system overview

---

## 🗺️ Routes & Structure

### Pages (8 total)
```
GET /                       Home + wallet connection
GET /swap                   Token swap + copy context
GET /claim                  BSTN token claims
GET /launch                 Event countdown page
GET /leaderboard            XP rankings + badges
GET /credit                 Credit dashboard & system info
GET /trader/[address]       Trader profile + reputation + auto-copy
GET /reputation/[address]   Detailed reputation breakdown
```

### APIs (6 total)
```
GET  /api/reputation?address=0x...   Fetch reputation (on-chain or mock)
POST /api/reputation                 (future: update reputation)

GET  /api/xp?address=0x...           Get user XP + leaderboard
POST /api/xp                         Award XP for copy trades

GET  /api/trader?address=0x...       Get trader stats
POST /api/trader                     (future: update stats)

GET  /api/credit?address=0x...       Get credit tier + active loans
POST /api/credit                     Borrow or repay

GET  /api/copy-vault?user=0x...      Get user's vaults
GET  /api/copy-vault?trader=0x...    Get vaults copying trader
POST /api/copy-vault                 Create/update/deactivate vault

GET  /api/og/trade                   Generate OG images
```

---

## 💡 Feature Guide

### Reputation System
- **On-chain:** SBT (non-transferable ERC721)
- **Off-chain:** Oracle calculates 1000-point score
- **Tiers:** Elite (850+) | Trusted (650-799) | Regular (400-599) | New (<400)
- **Components:** XP (300) + Trading (200) + Age (150) + Social (150) + Risk (200)

### Copy Trading
- **Manual:** Single trade via `/swap?copy=0x...`
  - Min reputation: 400+
  - XP reward: +10 (base) + tier bonus (+40/+25) + trainer bonus (+30/+15)
- **Automatic:** Via `CopyTradingVault.sol`
  - Min reputation: 650+ (Trusted+)
  - Setup: `/trader/[address]` → "🤖 Enable Auto Copy"
  - Allocation: 5-50% of balance per trade
  - Non-custodial: User owns vault

### Credit System
- **Tiers:**
  - Elite (850+): $5,000
  - Trusted (650-849): $1,500
  - Regular (400-649): $300
  - New (<400): $0
- **Terms:** 14 days, no interest (MVP)
- **Incentive:** On-time → +10 rep, Late → -20 rep

---

## 🔧 Development

### Setup
```bash
npm install              # Install dependencies
npm run dev             # Start dev server (localhost:3000)
npm run build           # Production build
```

### Environment
```bash
# Required
NEXT_PUBLIC_WALLET_CONNECT_ID=...   # WalletConnect v2
NEXT_PUBLIC_BASE_RPC=...            # Base mainnet RPC

# Deployed contracts
NEXT_PUBLIC_REP_CONTRACT=0x...      # ReputationSBT
NEXT_PUBLIC_CREDIT_CONTRACT=0x...   # ReputationCreditVault
```

### Technologies
- **Frontend:** Next.js 16 (Turbopack), TypeScript, Tailwind CSS
- **Web3:** Viem 1.x, Wagmi 2.x, OnchainKit
- **Blockchain:** Base mainnet (chain ID 8453)
- **DEX:** Uniswap V3
- **Smart Contracts:** Solidity 0.8.20

---

## 📊 Smart Contracts

### ReputationSBT.sol
- **Type:** ERC721 (non-transferable)
- **Purpose:** On-chain reputation storage
- **Functions:** 
  - `issueOrUpdate(user, score)` - Update reputation
  - `getReputation(user)` - Read score + timestamp
  - `transfer()` - Blocked (non-transferable)

### ReputationCreditVault.sol
- **Type:** Lending protocol
- **Purpose:** Under-collateralized loans
- **Functions:**
  - `creditLimit(user)` - Get credit based on reputation
  - `borrow(amount)` - Borrow up to limit
  - `repay()` - Repay loan
  - `markDefaulted(user)` - Admin marks late loans

### CopyTradingVault.sol
- **Type:** Non-custodial vault
- **Purpose:** Automated copy trading
- **Functions:**
  - `deposit(token, amount)` - Owner deposits funds
  - `executeTrade(token, to, amount)` - Admin mirrors trade
  - `withdraw(token, amount)` - Owner withdraws anytime
  - `updateCopyPercent(percent)` - Update allocation
  - `deactivate()` - Stop auto-copy

### BSTN.sol & BSTNClaim.sol
- **Type:** ERC-20 token + Merkle claim
- **Status:** Pre-deployed on Base
- **Use:** Governance + incentives

---

## 🎯 Success Metrics

### Week 1 (Beta)
- 20 active users
- 10+ copy trades
- 0 defaults

### Week 2-4 (Expansion)
- 50+ active users
- $50k TVL
- >95% on-time repayment

### Month 1 (Public)
- 200+ active users
- $200k TVL
- 100+ copy trades daily

---

## ⚠️ Risk Controls

- **TVL cap:** $50k (expandable after 2 weeks)
- **Whitelist:** First 20 users approved manually
- **Reputation gate:** Only Trusted+ (650+) can be copied
- **Emergency:** Admin can pause trade execution
- **Monitoring:** Daily check for anomalies & defaults

---

## 🐛 Troubleshooting

### Build Issues
1. Clear `.next`: `rm -r .next`
2. Reinstall: `npm install`
3. Rebuild: `npm run build`

### Contract Issues
1. Check Solidity version (0.8.20)
2. Verify constructor args
3. Check gas limits
4. Verify MetaMask on Base (chain ID 8453)

### Frontend Issues
1. Check environment variables in `.env.local`
2. Verify contract addresses are correct
3. Check browser console for errors
4. Clear browser cache

### Specific Issues
- See [README_COMPLETE.md](README_COMPLETE.md#troubleshooting) for detailed troubleshooting

---

## 📞 Support Resources

### Documentation
- [Remix Docs](https://docs.remix.run/)
- [Next.js Docs](https://nextjs.org/docs)
- [Viem Docs](https://viem.sh/)
- [Wagmi Docs](https://wagmi.sh/)
- [Base Docs](https://docs.base.org/)

### Tools
- [Remix IDE](https://remix.ethereum.org)
- [BaseScan](https://basescan.org) - Block explorer
- [Tenderly](https://tenderly.co/) - Debugging

### Community
- [Base Discord](https://base.org/discord)
- [Ethereum Stack Exchange](https://ethereum.stackexchange.com)

---

## 📋 Deployment Checklist

- [ ] Read [DEPLOY_NOW.md](DEPLOY_NOW.md)
- [ ] Setup MetaMask on Base
- [ ] Get 0.1+ ETH on Base
- [ ] Deploy 3 contracts via Remix
- [ ] Update `.env.local`
- [ ] Run `npm run build`
- [ ] Test `/credit` page
- [ ] Test `/trader/[address]` page
- [ ] Deploy to Vercel or self-host
- [ ] Invite 20 beta users
- [ ] Monitor metrics daily

---

## 📅 Timeline

**Today:**
- Deploy contracts
- Test locally
- Go live with closed beta

**Week 1:**
- Monitor 20 users
- Track TVL & repayment
- Fix bugs

**Week 2-4:**
- Expand to 50 users
- Increase TVL cap
- Implement trade mirroring

**Month 2+:**
- Public launch
- 200+ users
- Scale to $1M+ TVL

---

## 🎉 Project Status

✅ **PRODUCTION READY**

- 14 routes (all green)
- 3 smart contracts (ready to deploy)
- Full documentation
- Risk controls defined
- Go/no-go approved

**Next action:** Follow [DEPLOY_NOW.md](DEPLOY_NOW.md)

---

**Built January 1, 2026**  
**Technology:** Web3 × Base × Next.js  
**Mission:** Trustless social trading infrastructure
