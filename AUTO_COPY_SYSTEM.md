# Step 22: Automated Copy Trading (Non-Custodial Vaults)

## Overview

Non-custodial smart contract vaults for automated copy trading. Users can set up automatic copying of any Trusted+ (650+) reputation trader.

**Design Philosophy:**
- **User-owned vaults** - Each follower owns their vault
- **Trader never touches funds** - No custody risk
- **Admin executes trades** - Protocol backend mirrors trades
- **No lockup** - Users can withdraw anytime
- **Reputation-gated** - Only Trusted+ traders can be copied

## Smart Contract

**File:** [contracts/CopyTradingVault.sol](contracts/CopyTradingVault.sol)

### Key Functions

```solidity
// Create vault (owner=follower, trader=trader being copied, admin=protocol)
constructor(address _owner, address _trader, address _admin, uint256 _copyPercent)

// Owner deposits tokens
function deposit(address token, uint256 amount) external onlyOwner

// Admin executes mirrored trade
function executeTrade(address token, address to, uint256 amount) external onlyAdmin

// Owner withdraws anytime
function withdraw(address token, uint256 amount) external onlyOwner

// Owner updates copy allocation
function updateCopyPercent(uint256 newPercent) external onlyOwner

// Owner deactivates vault (stops auto-copy)
function deactivate() external onlyOwner

// Get vault balance for token
function balance(address token) external view returns (uint256)

// Get vault status
function getStatus() external view returns (...)
```

### Safety Features

✅ **No re-entrancy vectors**
- Simple transfer-only pattern
- No delegate calls
- No loops with external calls

✅ **Separation of concerns**
- Owner (follower) owns vault
- Trader never interacts with contract
- Admin (protocol) only executes trades
- Token transfers only (no ETH)

✅ **User control**
- Owner can withdraw anytime
- No lockup period
- Copy percentage configurable (5-50%)
- Can deactivate anytime

✅ **Bounded operations**
- Max copy percent: 50% per trade
- One trade execution per vault per mirroring event
- No compound leverage

## API Endpoints

**File:** [app/api/copy-vault/route.ts](app/api/copy-vault/route.ts)

### GET /api/copy-vault

Fetch vaults for a user or trader.

```
GET /api/copy-vault?user=0x...
{
  "address": "0x...",
  "vaults": [
    {
      "vaultAddress": "0x...",
      "owner": "0x...",
      "trader": "0x...",
      "copyPercent": 10,
      "totalDeposited": 5000,
      "totalExecuted": 2500,
      "active": true,
      "createdAt": 1704067200000
    }
  ],
  "count": 1
}

GET /api/copy-vault?trader=0x...
{
  "traderAddress": "0x...",
  "followers": 3,
  "totalAllocated": 15000,
  "vaults": [...]
}
```

### POST /api/copy-vault

Create, update, or deactivate vaults.

```
POST /api/copy-vault
{
  "action": "create",
  "owner": "0x...",
  "trader": "0x...",
  "copyPercent": 10
}

Response:
{
  "success": true,
  "message": "Copy vault created",
  "vault": {
    "vaultAddress": "0x...",
    "owner": "0x...",
    "trader": "0x...",
    "copyPercent": 10,
    "createdAt": "2026-01-01T00:00:00Z"
  }
}

POST /api/copy-vault
{
  "action": "update",
  "owner": "0x...",
  "trader": "0x...",
  "copyPercent": 15
}

POST /api/copy-vault
{
  "action": "deactivate",
  "owner": "0x...",
  "trader": "0x..."
}
```

## Frontend Components

### AutoCopySettings Component

**File:** [components/AutoCopySettings.tsx](components/AutoCopySettings.tsx)

Modal for configuring auto-copy:
- Allocation slider (5-50%)
- Safety info (no lockup, withdraw anytime)
- Fee structure (0% during beta)
- Enable button with reputation check

Reputation gating:
- Only shows if trader rep >= 650 (Trusted+)
- Shows error message if trader not eligible
- Checked server-side on API

### Trader Profile Integration

**File:** [app/trader/[address]/page.tsx](app/trader/[address]/page.tsx)

Added to trader profiles:
- "🤖 Enable Auto Copy" button (if rep >= 650)
- "📋 Manual Copy Trade" button (if rep >= 400)
- Info box explaining difference between manual and auto
- Copy eligibility status

## Data Flow

### Enable Auto Copy

```
1. User visits /trader/0xabc...
2. Fetch trader reputation from /api/reputation
3. If rep >= 650 → Show "Enable Auto Copy" button
4. User clicks button → Modal opens
5. User sets allocation (5-50%)
6. User clicks "Enable Auto Copy"
7. POST /api/copy-vault action=create
   - Check trader rep >= 650
   - Check no existing vault for this user+trader
   - Create vault record
   - Return vault address
8. Frontend shows success message
9. Vault ready for funding
```

### Deposit to Vault

```
1. User approves USDC to vault contract
2. User calls deposit(USDC_address, amount)
3. USDC transferred from user to vault
4. Vault shows balance
```

### Mirror Trade

```
1. Trader executes swap on Base
2. Protocol backend detects trade
3. For each vault copying this trader:
   a. Calculate copy amount = vault.balance * vault.copyPercent
   b. Call vault.executeTrade(token, dex_router, amount)
   c. Vault transfers tokens to DEX
4. Trade mirrored at same price/slippage as trader
5. User's copy balance updated
```

### Withdraw from Vault

```
1. User calls vault.withdraw(token, amount)
2. Tokens transferred to user
3. Can do anytime, no restrictions
```

## Reputation Gating

### Eligibility Rules

| Reputation | Copy Type | Eligible |
|-----------|-----------|----------|
| 850+ | Auto Copy | ✅ Yes |
| 650-849 | Auto Copy | ✅ Yes |
| 400-649 | Auto Copy | ❌ No |
| <400 | Auto Copy | ❌ No |
| 850+ | Manual Copy | ✅ Yes |
| 650-849 | Manual Copy | ✅ Yes |
| 400-649 | Manual Copy | ✅ Yes |
| <400 | Manual Copy | ❌ No |

### Implementation

1. **Frontend:** AutoCopySettings checks `traderReputation >= 650`
2. **API:** POST /api/copy-vault checks trader reputation
3. **Contract:** Can be upgraded to read SBT directly (Phase 2)

## Fees & Incentives (MVP)

### Current (Beta)
- Performance fee: **0%**
- Protocol fee: **0%**
- Trader reward: **0%** (paid in BSTN future)

### Future (Phase 2+)
- Performance fee: 10% of profits (optional)
- Protocol fee: 0.5% per copy
- Trainer reward: Paid in BSTN tokens

## Risk Controls

### Built-In Safeguards

✅ **Copy percent bounded**
- Min: 5% (avoid dust)
- Max: 50% (prevent over-exposure)

✅ **User controls**
- Can update copy percent anytime
- Can deactivate vault anytime
- Can withdraw anytime

✅ **Transparent tracking**
- All trades logged on-chain
- totalDeposited tracked
- totalExecuted tracked
- Audit trail via events

### Operational Controls (Before Mainnet Scale)

- [ ] **Max copy size per trade:** e.g., $50k per trade
- [ ] **Max daily volume:** e.g., $500k per vault per day
- [ ] **Emergency pause:** Stop trade mirroring if needed
- [ ] **Reputation downgrade:** -20 rep if vault abuses

### Monitoring Dashboard (TODO)

Track metrics:
- Total TVL in vaults
- Number of active vaults
- Average copy percent
- Successful copies vs failures
- User withdrawal patterns
- Trader behavior (gaming detection)

## Deployment Checklist

### Smart Contract

- [ ] Deploy CopyTradingVault.sol to Base (Remix)
- [ ] Save contract to `NEXT_PUBLIC_COPY_VAULT_CONTRACT` (optional)
- [ ] Test deposit/withdraw/execute flow
- [ ] Test access controls (owner/admin)

### API

- [ ] Test GET /api/copy-vault?user=0x...
- [ ] Test GET /api/copy-vault?trader=0x...
- [ ] Test POST with reputation check
- [ ] Verify vault creation persists

### Frontend

- [ ] Test AutoCopySettings modal
- [ ] Test reputation gating (650+)
- [ ] Test form validation (5-50%)
- [ ] Test error messages
- [ ] Test on trader profile

### Backend (Trade Mirroring)

- [ ] Implement trade listener (Uniswap events or RPC polling)
- [ ] Implement vault trade executor
- [ ] Add slippage protection (1% cap)
- [ ] Add error handling & retry logic
- [ ] Set up monitoring/alerts

## Future Enhancements (Phase 2+)

### Vault Features
- [ ] Multiple traders per vault (diversified)
- [ ] Dynamic weight rebalancing
- [ ] Stop-loss limits
- [ ] Profit target settings
- [ ] Copy history & PnL tracking

### Smart Contract
- [ ] Direct SBT reading for gating
- [ ] Tiered fees by reputation
- [ ] Automatic liquidity mining
- [ ] Governance via token holders

### Trading
- [ ] Copy from multiple chains (cross-chain)
- [ ] Conditional copy (only if price impact < X%)
- [ ] Partial copy execution (split orders)
- [ ] Circuit breakers for extreme volatility

### Incentives
- [ ] BSTN rewards for successful copies
- [ ] Trainer bonuses for popularity
- [ ] Affiliate rewards for referrals
- [ ] Leaderboard rewards

## Testing Checklist

### Unit Tests

- [ ] CopyTradingVault:
  - [ ] Only owner can deposit
  - [ ] Only admin can execute trades
  - [ ] Only owner can withdraw
  - [ ] Copy percent validation (5-50)
  - [ ] Balance tracking
  - [ ] Deactivation logic

### Integration Tests

- [ ] API:
  - [ ] Create vault with reputation < 650 (should fail)
  - [ ] Create vault with reputation >= 650 (should succeed)
  - [ ] Can't create duplicate vault
  - [ ] Update copy percent (5-50 validation)
  - [ ] Deactivate stops new trades

### E2E Tests

- [ ] User flow:
  - [ ] Visit trader profile (rep 700)
  - [ ] Click "Enable Auto Copy"
  - [ ] Modal shows (not blocked)
  - [ ] Set allocation to 15%
  - [ ] Click "Enable Auto Copy"
  - [ ] Success message
  - [ ] Vault address shown
  - [ ] Can see vault in user's copy list

- [ ] Blocked flow:
  - [ ] Visit trader profile (rep 300)
  - [ ] No "Enable Auto Copy" button
  - [ ] Manual copy disabled

## Success Metrics (30 Days)

| Metric | Target |
|--------|--------|
| Active vaults | 20+ |
| Total vault TVL | $100k+ |
| Avg copy percent | 10-15% |
| Successful copy rate | >95% |
| User withdrawal rate | <5% per week |
| Average vault lifetime | >30 days |

---

**Status:** ✅ Step 22 Complete

**Implemented:**
- ✅ CopyTradingVault.sol (non-custodial)
- ✅ /api/copy-vault (create/update/deactivate)
- ✅ AutoCopySettings component
- ✅ Trader profile integration
- ✅ Reputation gating (650+)
- ✅ Build verification (14 routes)

**Ready for:**
- Beta testing with trusted traders
- Contract deployment to Base
- Backend trade mirroring implementation
