# BSTN Liquidity & Launch Guide

## Phase 1: Pre-Launch Setup

### 1. Decide Initial Price (LOCKED)

**Recommended Price Point:**
```
1 BSTN = 0.00001 ETH
```

**Examples:**
- 100 BSTN = 0.001 ETH
- 10,000 BSTN = 0.1 ETH
- 1,000,000 BSTN = 10 ETH

**Why this price?**
- ✅ Low entry price (accessible)
- ✅ Good upside narrative
- ✅ Healthy liquidity curve

---

## Phase 2: Liquidity Allocation

### Total Supply: 1,000,000,000 BSTN

**Distribution:**
- **10% for liquidity** = 100,000,000 BSTN
- **90% community** = 900,000,000 BSTN

### Recommended Initial Pool

**Conservative Start:**
- BSTN: 1,000,000
- ETH: 10 ETH

**Comfortable Start:**
- BSTN: 10,000,000
- ETH: 100 ETH

**Aggressive Start:**
- BSTN: 100,000,000
- ETH: 1,000 ETH

---

## Phase 3: Uniswap V3 Pool Setup

### Pool Configuration

| Setting | Value |
|---------|-------|
| Token A | BSTN |
| Token B | WETH (or ETH) |
| Fee Tier | 0.30% (3000) |
| Price Range | Full Range |
| Network | Base Mainnet |

**Why 0.3%?**
- ✅ Best for volatile new tokens
- ✅ Attracts market makers
- ✅ Standard for emerging tokens

**Why Full Range?**
- ✅ Simpler at launch
- ✅ Wider trading paths
- ✅ Less rebalancing needed

---

## Phase 4: Adding Liquidity (Step-by-Step)

### Option A: Uniswap UI (RECOMMENDED)

1. Go to **https://app.uniswap.org**
2. Switch network → **Base Mainnet**
3. Click **Pool** → **New Position**
4. Select tokens:
   - Token A: `0xBSTN_CONTRACT_ADDRESS`
   - Token B: `ETH` or `0xWETH_ADDRESS`
5. Set Fee tier: **0.3%**
6. Set Price range: **Full Range**
7. Enter amounts:
   - BSTN amount
   - ETH amount
8. Click **Approve BSTN** (sign transaction)
9. Click **Add Liquidity** (sign transaction)
10. 🎉 Receive LP NFT as receipt

### Option B: Programmatic (Later)

For advanced users or bots. For now, UI is safest.

---

## Phase 5: Post-Liquidity Verification

### ✅ Verify Trading Works

1. Go to **Swap** tab
2. Attempt: Small ETH → BSTN
3. Check:
   - [ ] Price updates
   - [ ] No revert errors
   - [ ] Slippage calculation correct
   - [ ] Transaction succeeds

---

## Phase 6: Update App Code

### Update Swap Token Address

In `lib/swap.ts`:

```typescript
// Before (USDC)
tokenOut: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'

// After (BSTN)
tokenOut: '0xBSTN_TOKEN_ADDRESS'
```

Or make it dynamic in `app/swap/page.tsx`:

```typescript
const [selectedToken, setSelectedToken] = useState('BSTN')
const tokenOut = selectedToken === 'BSTN' 
  ? '0xBSTN_ADDRESS'
  : '0xUSDC_ADDRESS'
```

---

## Phase 7: LP Token Safety (CRITICAL)

### 🚫 What NOT to do:

- ❌ Remove liquidity early
- ❌ Change token contract
- ❌ Mint extra tokens
- ❌ Move LP to personal wallet

### ✅ What TO do:

**Lock LP Token (Recommended):**

Option 1: **Time-lock contract** (best)
- Lock for 12 months
- Transparent proof

Option 2: **Multisig wallet**
- 2-of-3 required to unlock
- Community oversight

Option 3: **Public commitment**
- Twitter announcement
- Blog post
- Community trust

**Example Announcement:**
```
🔒 LP Locked for 12 months
↳ Verified on @LockSmith_eth
↳ Proof: [txHash]

Community trust = BSTN value
```

---

## Phase 8: Launch & Marketing

### 📢 Launch Message (Copy-Paste)

```
🚀 BSTN is now live on Base

• XP-powered token
• Social trading rewards
• Built as a Base Mini App

Trade now:
• Pool: [Uniswap link]
• App: [Your app URL]

Community-first. Transparent. Decentralized.
```

### 📱 Share On:
- Twitter/X
- Farcaster
- Discord
- Medium/Mirror

### 📊 Post-Launch Monitoring

- Monitor pool liquidity
- Track volume
- Watch for slippage issues
- Community feedback

---

## Deployment Checklist

- [ ] Total supply allocated: 1B BSTN
- [ ] BSTN contract deployed
- [ ] BSTNClaim contract deployed
- [ ] BSTN ownership transferred to BSTNClaim
- [ ] Liquidity pool created (BSTN/WETH 0.3%)
- [ ] Initial liquidity added
- [ ] Swap tested (small amounts)
- [ ] App code updated with token address
- [ ] LP NFT secured/locked
- [ ] Launch announcement ready
- [ ] Community notified

---

## Important Notes

**Price is set once.** Never change it after listing.

**LP lock proves legitimacy.** Do this before launch.

**Supply is fixed.** No inflation, no surprises.

**Your reputation = token value.** Be transparent.

Good luck! 🚀
