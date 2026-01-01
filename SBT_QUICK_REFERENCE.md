# Reputation SBT - Quick Reference

## What is Reputation SBT?

A **Soulbound Token (SBT)** that stores trust scores on-chain as a non-transferable NFT.

- **One per wallet** - Each address gets exactly one SBT
- **Non-transferable** - Can't be sold or stolen
- **Immutable** - Updates are audited on-chain
- **Composable** - Other protocols can trust your score

---

## File Structure

```
contracts/
├── ReputationSBT.sol       # Smart contract (deploy via Remix)
├── BSTN.sol                # Token (already deployed)
└── BSTNClaim.sol           # Claims (already deployed)

app/
├── api/reputation/route.ts # API (auto-reads on-chain + fallback)
└── reputation/[address]/   # Profile page (displays SBT)

lib/
├── sbt.ts                  # SBT helper functions (NEW)
└── reputation.ts           # Existing badge logic

docs/
├── SBT_DEPLOYMENT.md       # Full deployment guide (NEW)
└── REPUTATION.md           # Reputation system overview
```

---

## Deployment Checklist

- [ ] **Step 1:** Deploy ReputationSBT.sol via [Remix](https://remix.ethereum.org)
  - Copy code from `contracts/ReputationSBT.sol`
  - Compile with Solidity 0.8.20
  - Deploy to Base Mainnet
  - Save contract address

- [ ] **Step 2:** Add `.env.local`
  ```env
  NEXT_PUBLIC_REP_CONTRACT=0x<your_address>
  NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
  ```

- [ ] **Step 3:** Test
  ```bash
  npm run build  # Should succeed
  npm run dev    # Try /reputation/0x...
  ```

- [ ] **Step 4:** Backend integration
  - Call `issueOrUpdate(user, score)` from backend
  - Gas cost: ~150k (first), ~60k (update)
  - Run weekly/monthly for reputation updates

---

## API Usage

### Read Reputation

```bash
# Try on-chain first, fallback to mock
GET /api/reputation?address=0x...

# Response (on-chain)
{
  "address": "0x...",
  "score": 850,
  "source": "onchain"
}

# Response (fallback)
{
  "address": "0x...",
  "score": 543,
  "breakdown": { ... },
  "source": "mock"
}
```

### Read Contract Directly

```typescript
import { readReputationSBT } from '@/lib/sbt'

const rep = await readReputationSBT('0xUserAddress')
// { score: 850, lastUpdated: 1704110400, hasToken: true }
```

---

## Smart Contract Functions

### Mint/Update Reputation
```solidity
issueOrUpdate(address user, uint256 score)
// Only owner can call
// Mints SBT if needed, updates score
// Emits ReputationIssued or ReputationUpdated
```

### Read Reputation
```solidity
getReputation(address user) 
// Returns (score, lastUpdated)
```

### Check if Has SBT
```solidity
hasSBTFor(address user) 
// Returns bool
```

---

## Backend Integration Pattern

```typescript
// 1. Calculate reputation score
const score = calculateReputation(userAddress)

// 2. Call contract to update
const tx = await wallet.writeContract({
  address: REP_SBT_ADDRESS,
  abi: REP_ABI,
  functionName: 'issueOrUpdate',
  args: [userAddress, score]
})

// 3. Wait for confirmation
await publicClient.waitForTransactionReceipt({ hash: tx })

// 4. Frontend automatically reads new score
// via GET /api/reputation?address=...
```

---

## Security Model

### ✅ What's Secure
- Contract uses OpenZeppelin ERC721
- Non-transferable enforced at contract level
- One SBT per wallet (prevents duplicates)
- Admin-controlled updates (you control updates)
- Events logged for auditing
- No private keys on-chain

### ⚠️ What to Watch
- **Private key:** Protect deployer key (used for `issueOrUpdate`)
- **Oracle reliability:** Reputation calc must be fair
- **Update frequency:** Balance gas costs vs freshness

---

## Events (Auditing)

```solidity
event ReputationIssued(
  address indexed user, 
  uint256 score, 
  uint256 timestamp
);

event ReputationUpdated(
  address indexed user,
  uint256 oldScore,
  uint256 newScore,
  uint256 timestamp
);
```

Query events via:
```typescript
const logs = await publicClient.getLogs({
  address: '0xReputationSBT',
  event: parseAbiItem('event ReputationUpdated(...)'),
  fromBlock: 'earliest'
})
```

---

## Environment Variables

Required in `.env.local`:

```env
# Reputation SBT deployed contract
NEXT_PUBLIC_REP_CONTRACT=0x<your_deployed_address>

# Base RPC endpoint
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
```

If not set:
- Frontend falls back to mock reputation data
- No errors - development still works
- Perfect for local dev before deploying contract

---

## Gas Costs (Base Mainnet)

| Action | Gas | Cost (approx) |
|--------|-----|---------------|
| Mint SBT (first update) | 150,000 | $0.30 |
| Update score | 60,000 | $0.12 |
| Read score | 0 | Free (read-only) |

**Recommendation:** Update reputation weekly/monthly to balance costs.

---

## Frontend Components Using SBT

### Leaderboard (`app/leaderboard/page.tsx`)
- Shows reputation badge next to each user
- Links to `/reputation/[address]`

### Trader Profile (`app/trader/[address]/page.tsx`)
- "View Reputation" button
- Links to detailed reputation profile

### Reputation Profile (`app/reputation/[address]/page.tsx`)
- Displays on-chain SBT score
- Shows badge tier (Elite/Trusted/Regular/New)
- Displays last update timestamp

### Wallet Header (`components/WalletConnect.tsx`)
- Shows user's own reputation badge
- Clicks through to their reputation profile

---

## Upgrading from Mock to SBT

### Phase 1: Deploy (Now)
- Contract deployed
- API tries on-chain, falls back to mock
- No UI changes needed

### Phase 2: Start Updating (Week 1)
- Backend calls `issueOrUpdate()` weekly
- Real scores start appearing on-chain
- Mock is used as fallback for new wallets

### Phase 3: Full Migration (Month 1)
- All active users have on-chain scores
- Can optionally disable mock fallback
- Remove mock response from API

---

## Troubleshooting

### Build Error: "REP_ABI not defined"
- Check `lib/sbt.ts` was created
- Run `npm install` to refresh

### "Contract not found" at runtime
- Set `NEXT_PUBLIC_REP_CONTRACT` in `.env.local`
- Verify contract deployed on Base Mainnet
- Check contract address is correct

### User has no SBT yet
- Backend must call `issueOrUpdate()` first
- Check contract events to see if minted
- Admin key must be set correctly in backend

### Transfer blocked (expected)
- SBTs are non-transferable by design
- This is correct - prevents reputation theft

---

## Next Steps

1. **Deploy ReputationSBT.sol** → See SBT_DEPLOYMENT.md
2. **Set environment variables** → Add to `.env.local`
3. **Test frontend** → Try `/reputation/0x...`
4. **Build backend oracle** → Call `issueOrUpdate()` weekly
5. **Monitor events** → Audit reputation changes on-chain

---

## Resources

- **Deployment Guide:** [SBT_DEPLOYMENT.md](SBT_DEPLOYMENT.md)
- **Reputation Overview:** [REPUTATION.md](REPUTATION.md)
- **Smart Contract:** [contracts/ReputationSBT.sol](contracts/ReputationSBT.sol)
- **Helper Functions:** [lib/sbt.ts](lib/sbt.ts)
- **API Handler:** [app/api/reputation/route.ts](app/api/reputation/route.ts)

---

**Status:** ✅ Ready to deploy  
**Build:** ✅ Clean (no errors)  
**Frontend:** ✅ Supports both mock and on-chain  
**Backend:** ⏳ Oracle integration (your implementation)
