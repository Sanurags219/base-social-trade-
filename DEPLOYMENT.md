# Base Social Trade - Deployment Guide

## Pre-Deployment

### ✅ Contracts Deployed

- [x] BSTN.sol (ERC-20 token)
- [x] BSTNClaim.sol (XP → BSTN claim)

### ✅ Frontend Complete

- [x] Swap page (ETH/BSTN)
- [x] Leaderboard (XP rankings)
- [x] Claim page (BSTN redemption)

---

## Step 1: Deploy BSTN Contract

### Using Remix (Recommended)

1. Go to https://remix.ethereum.org
2. Create file: `BSTN.sol`
3. Copy from: `contracts/BSTN.sol`
4. Compile with Solidity **0.8.20**
5. Switch network: **Base Mainnet**
6. Deploy
   - Constructor: (no args)
   - Gas: ~500k
7. **Save contract address** → `BSTN_ADDRESS`

### Using Hardhat (Advanced)

```bash
npx hardhat run scripts/deploy.js --network base
```

---

## Step 2: Deploy BSTNClaim Contract

### Using Remix

1. Create file: `BSTNClaim.sol`
2. Copy from: `contracts/BSTNClaim.sol`
3. Compile with Solidity **0.8.20**
4. Deploy with constructor arg:
   - `_bstn`: `BSTN_ADDRESS` (from Step 1)
5. **Save address** → `CLAIM_ADDRESS`

---

## Step 3: Transfer BSTN Ownership

### Critical Step (Do This!)

1. Go to BSTN etherscan on Base
2. Write Contract
3. Call `transferOwnership()`
   - arg: `CLAIM_ADDRESS`
4. Sign transaction
5. ✅ Only BSTNClaim can now mint

**Verification:**
```
Read Contract → owner = CLAIM_ADDRESS
```

---

## Step 4: Update Frontend Code

### Update Contract Addresses

**File:** `app/claim/page.tsx`

```typescript
// Change this:
const CLAIM_CONTRACT = '0xYOUR_CLAIM_CONTRACT_ADDRESS'

// To your deployed address:
const CLAIM_CONTRACT = '0x...' // BSTNClaim address
```

**File:** `lib/swap.ts` (optional)

```typescript
// Update token out to BSTN:
tokenOut: '0x...' // BSTN token address
```

### Update Metadata

**File:** `app/layout.tsx`

```typescript
openGraph: {
  images: [`https://yoursite.com/api/og/trade`] // Update domain
}
```

---

## Step 5: Add Liquidity

### Using Uniswap V3

1. Go to https://app.uniswap.org
2. Network: **Base**
3. Pool → New Position
4. **Token A:** BSTN (`0x...`)
5. **Token B:** WETH or ETH
6. **Fee:** 0.3%
7. **Price Range:** Full Range
8. **Amounts:**
   - BSTN: 1,000,000 - 100,000,000
   - ETH: 10 - 1,000
9. Approve & Add Liquidity
10. ✅ Receive LP NFT

**Price Reference:**
```
1 BSTN = 0.00001 ETH (recommended)
```

### Verify Trading

1. Swap small amount ETH → BSTN
2. Check price doesn't revert
3. Slippage ~0.5%

---

## Step 6: Set XP Snapshot

### Admin Task (Before Claiming Allowed)

1. Gather leaderboard data from `/api/xp`
2. Call `setSnapshot()` on BSTNClaim
   ```
   users: [0xAddr1, 0xAddr2, ...]
   xp: [1000, 500, ...]
   ```
3. ⚠️ This locks snapshot (can't change!)

---

## Step 7: Verify Security

- [ ] Snapshot locked (immutable)
- [ ] LP tokens secured/locked
- [ ] Emergency pause functional
- [ ] Contract verified on Basescan
- [ ] No admin keys in code
- [ ] Rate limiting ready

---

## Step 8: Launch!

### Announcement

```
🚀 Base Social Trade is LIVE!

Swap ETH for BSTN
Share on Farcaster
Earn XP
Claim tokens

🔗 Trade: [app URL]
💧 Pool: [Uniswap URL]
🏆 Leaderboard: [app URL]/leaderboard
```

### Post-Launch Tasks

- [ ] Monitor pools for issues
- [ ] Respond to community
- [ ] Track swap volume
- [ ] Monitor claim redemptions
- [ ] Gather feedback

---

## Mainnet Checklist

- [ ] BSTN deployed → `0x...`
- [ ] BSTNClaim deployed → `0x...`
- [ ] Ownership transferred
- [ ] LP added (1M+ BSTN / 10+ ETH)
- [ ] Frontend updated
- [ ] Snapshot set
- [ ] Pause tested
- [ ] Trading verified
- [ ] Contracts verified on Basescan
- [ ] LP NFT locked
- [ ] Announcement published

---

## Disaster Recovery

### If Something Goes Wrong

1. **Call `setPaused(true)`** on BSTNClaim
   - Stops all claims
   - Gives time to fix
2. **Check contract on Basescan**
   - Verify state
   - Check balances
3. **Communicate with community**
   - Transparency = trust
4. **Post-mortem** when resolved

---

## Support

- Smart contract issues? Check Basescan
- Frontend issues? Check browser console
- Questions? Tweet @base or Discord

Good luck! 🎉
