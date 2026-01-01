# ✅ Deployment Checklist

Track your contract deployments and environment setup.

## Contracts to Deploy (3 total)

### 1. ReputationSBT.sol
**Purpose:** On-chain identity & reputation storage  
**Network:** Base Mainnet  
**Deploy via:** Remix

- [ ] Open [remix.ethereum.org](https://remix.ethereum.org)
- [ ] Create file: `ReputationSBT.sol`
- [ ] Paste contract code
- [ ] Compile with Solidity 0.8.20
- [ ] Deploy to Base
- [ ] Copy address: `0x...`
- [ ] Test `reputation()` function

**Deployed Address:**
```
NEXT_PUBLIC_REP_CONTRACT=0x
```

---

### 2. ReputationCreditVault.sol
**Purpose:** Under-collateralized lending  
**Network:** Base Mainnet  
**Deploy via:** Remix

**Constructor Args:**
```
_usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913  (USDC on Base)
_rep  = 0x...  (Your ReputationSBT address from above)
```

- [ ] Create file: `ReputationCreditVault.sol`
- [ ] Paste contract code
- [ ] Compile with Solidity 0.8.20
- [ ] Enter constructor args (see above)
- [ ] Deploy to Base
- [ ] Copy address: `0x...`
- [ ] Test `creditLimit()` function

**Deployed Address:**
```
NEXT_PUBLIC_CREDIT_CONTRACT=0x
```

---

### 3. CopyTradingVault.sol
**Purpose:** Non-custodial automated copy trading  
**Network:** Base Mainnet  
**Deploy via:** Remix (for testing, then via API in production)

**Test Vault Args:**
```
_owner       = 0x...  (your wallet)
_trader      = 0x...  (test trader wallet)
_admin       = 0x...  (your backend wallet)
_copyPercent = 10
```

- [ ] Create file: `CopyTradingVault.sol`
- [ ] Paste contract code
- [ ] Compile with Solidity 0.8.20
- [ ] Enter constructor args (see above)
- [ ] Deploy to Base
- [ ] Test `deposit()` and `withdraw()` functions
- [ ] Verify event logs

**Note:** Production vaults created via API, no global address needed

---

## Environment Setup

### 1. Update `.env.local`

```bash
cd C:\Users\om\base-social-trade

# Add these lines (update addresses from deployments above)
echo NEXT_PUBLIC_REP_CONTRACT=0x... >> .env.local
echo NEXT_PUBLIC_CREDIT_CONTRACT=0x... >> .env.local
```

**Full `.env.local`:**
```
# Required
NEXT_PUBLIC_WALLET_CONNECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org

# Deployed Contracts
NEXT_PUBLIC_REP_CONTRACT=0x...
NEXT_PUBLIC_CREDIT_CONTRACT=0x...

# Optional (defaults to mock data if not set)
# NEXT_PUBLIC_COPY_VAULT_CONTRACT=0x...
```

- [ ] File created/updated
- [ ] All addresses filled in
- [ ] No quotes around addresses
- [ ] RPC endpoint correct

---

## Build & Test

### 1. Build

```bash
cd C:\Users\om\base-social-trade
npm run build
```

- [ ] Build succeeds (no errors)
- [ ] All 14 routes compile
- [ ] TypeScript checks pass

**Expected output:**
```
✓ Compiled successfully
Route (app)
├─ / (Static)
├─ /api/copy-vault (Dynamic)
├─ /api/credit (Dynamic)
├─ /api/og/trade (Dynamic)
├─ /api/reputation (Dynamic)
├─ /api/trader (Dynamic)
├─ /api/xp (Dynamic)
├─ /claim (Static)
├─ /credit (Static)
├─ /launch (Static)
├─ /leaderboard (Static)
├─ /reputation/[address] (Dynamic)
├─ /swap (Static)
└─ /trader/[address] (Dynamic)
```

### 2. Local Test

```bash
npm run dev
```

- [ ] Server starts on http://localhost:3000
- [ ] No runtime errors in console
- [ ] Can connect wallet
- [ ] Pages load without errors

---

## Frontend Testing

### 1. Credit System

**URL:** [http://localhost:3000/credit](http://localhost:3000/credit)

- [ ] Page loads
- [ ] Shows credit tier info
- [ ] If contract deployed: shows your reputation + credit limit
- [ ] Borrow button works (frontend)
- [ ] Repay button works (if active loan)

### 2. Trader Profile

**URL:** [http://localhost:3000/trader/0x1234...](http://localhost:3000/trader/0x1234...)

- [ ] Page loads
- [ ] Shows trader stats
- [ ] Shows reputation badge
- [ ] If rep >= 650: "🤖 Enable Auto Copy" button visible
- [ ] If rep >= 400: "📋 Manual Copy" button visible
- [ ] If rep < 400: Disabled (red message)

### 3. Copy Trading

- [ ] Click "🤖 Enable Auto Copy"
- [ ] Modal opens with allocation slider
- [ ] Slider works (5-50%)
- [ ] "Enable Auto Copy" button clickable
- [ ] Success message appears

### 4. Manual Copy

- [ ] Click "📋 Manual Copy Trade"
- [ ] Redirects to `/swap?copy=0x...&tier=...`
- [ ] Swap page shows copy context banner
- [ ] Shows trader tier + reputation
- [ ] Safety defaults applied (10% amount, 1% slippage)

---

## Smart Contract Testing

### ReputationSBT

In Remix **Read** tab:
```
reputation(0x...any_address)
→ Returns: score=0, lastUpdated=0
```

- [ ] Query works
- [ ] Returns (uint256, uint256) tuple

**Call issueOrUpdate (owner only):**
```
issueOrUpdate(
  user: 0x...test_address,
  score: 650
)
```

- [ ] Transaction succeeds
- [ ] Query again shows: score=650, lastUpdated=<timestamp>

---

### ReputationCreditVault

In Remix **Read** tab:
```
creditLimit(0x...address)
→ Returns: uint256
```

- [ ] If address has 0 reputation: returns 0
- [ ] If you issued reputation: returns $300-$5000 based on tier

**Check credit tiers:**
```
creditLimit(0x...elite_address)      → 5000000000 (5000 USDC, 6 decimals)
creditLimit(0x...trusted_address)    → 1500000000 (1500 USDC)
creditLimit(0x...regular_address)    → 300000000  (300 USDC)
creditLimit(0x...new_address)        → 0
```

- [ ] All return correct values

---

### CopyTradingVault

In Remix **Read** tab:
```
getStatus()
→ Returns: owner, trader, copyPercent, totalDeposited, totalTrades, active
```

- [ ] Shows vault details
- [ ] active = true
- [ ] copyPercent = what you set

**Call deposit:**
```
deposit(
  token: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,  (USDC)
  amount: 1000000000  (1000 USDC, 6 decimals)
)
```

⚠️ **First approve USDC to vault:**
```
// In USDC contract (0x833589...)
approve(vault_address, 1000000000)
```

- [ ] Approval succeeds
- [ ] Deposit succeeds
- [ ] balance() shows 1000000000

**Call withdraw:**
```
withdraw(
  token: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,
  amount: 500000000  (500 USDC)
)
```

- [ ] Withdraw succeeds
- [ ] balance() shows 500000000
- [ ] User receives USDC in wallet

---

## Deployment Status

| Step | Status | Notes |
|------|--------|-------|
| MetaMask on Base | ⏳ | - |
| ReputationSBT deployed | ⏳ | Save address |
| ReputationCreditVault deployed | ⏳ | Save address |
| CopyTradingVault tested | ⏳ | Test vault only |
| `.env.local` updated | ⏳ | Update addresses |
| Build successful | ⏳ | npm run build |
| Frontend test | ⏳ | npm run dev |
| Contract tests | ⏳ | In Remix |
| Ready for beta | ⏳ | All tests pass |

---

## Go-Live Checklist

- [ ] All contracts deployed
- [ ] `.env.local` updated
- [ ] Build succeeds
- [ ] All 14 routes working
- [ ] Credit system shows correct limits
- [ ] Trader profiles show correct gates
- [ ] Auto-copy UI works
- [ ] Contract functions callable
- [ ] No console errors
- [ ] Ready for 20 beta users

---

## Support

**If stuck:**

1. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
2. Verify gas (need ~0.1 ETH on Base)
3. Verify MetaMask on Base mainnet (chain ID 8453)
4. Check contract addresses in `.env.local`
5. Clear `.next` folder and rebuild: `rm -r .next && npm run build`

**Contract questions:**
- See contract comments in `contracts/`
- Check [AUTO_COPY_SYSTEM.md](AUTO_COPY_SYSTEM.md)
- Check [CREDIT_SYSTEM.md](CREDIT_SYSTEM.md)

---

**Next:** Follow [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) step-by-step
