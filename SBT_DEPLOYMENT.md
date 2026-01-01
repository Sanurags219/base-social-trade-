# Reputation SBT Deployment Guide

## Overview

The Reputation SBT (Soulbound Token) is a non-transferable on-chain token that stores trust scores immutably. Each wallet gets ONE SBT with a reputation score (0-1000) and timestamp.

**Benefits:**
- ✅ Immutable reputation history (auditable)
- ✅ Gas efficient (no off-chain XP calculations needed)
- ✅ Composable (other protocols can trust your reputation)
- ✅ Non-transferable (prevents reputation farming)
- ✅ Event logs (transparent reputation updates)

---

## Smart Contract: ReputationSBT.sol

Located at: `contracts/ReputationSBT.sol`

### Key Features

**Mapping:**
```solidity
mapping(address => Reputation) public reputation;  // Stores score + lastUpdated
mapping(address => bool) public hasSBT;            // Track who has an SBT
```

**Functions:**
- `issueOrUpdate(address user, uint256 score)` - Mint or update reputation
- `getReputation(address user)` - Read score + timestamp
- `hasSBTFor(address user)` - Check if wallet has SBT
- `_beforeTokenTransfer()` - Prevent transfers (soulbound enforcement)

**Security:**
- OpenZeppelin ERC721 standard
- `onlyOwner` on update function (oracle model)
- Non-transferable at contract level
- Event logs for auditing

---

## Deployment Steps (Remix)

### Step 1: Open Remix
Go to https://remix.ethereum.org

### Step 2: Create Contract
1. Click **File Explorer** → **Create New File**
2. Name it `ReputationSBT.sol`
3. Copy contract code from `contracts/ReputationSBT.sol`
4. Paste into Remix editor

### Step 3: Compile
1. Click **Solidity Compiler** (left sidebar)
2. Set Compiler: `0.8.20` (or latest 0.8.x)
3. Click **Compile ReputationSBT.sol**

### Step 4: Deploy
1. Click **Deploy & Run Transactions**
2. Select **Environment**: "Injected Provider - MetaMask"
3. Make sure MetaMask is on **Base Mainnet**
4. Click **Deploy** (select ReputationSBT)
5. Confirm transaction in MetaMask
6. Wait for confirmation

### Step 5: Save Contract Address
After deployment succeeds:
1. Copy the contract address from Remix output
2. Create `.env.local` in project root
3. Add:
```
NEXT_PUBLIC_REP_CONTRACT=0x<your_contract_address>
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
```

---

## Environment Variables

Create `.env.local`:

```env
# Reputation SBT Contract on Base
NEXT_PUBLIC_REP_CONTRACT=0x<deployed_address>
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
```

**Why .env.local?**
- `.env.local` is not committed to git (stays private)
- `NEXT_PUBLIC_` prefix makes it accessible from frontend
- Server-side can also read it for API calls

---

## Testing the Contract

### Via Remix (Read-Only)
1. After deploying, click contract name under "Deployed Contracts"
2. Click `getReputation` input box
3. Enter any address
4. See if `(0, 0)` returns (no reputation yet)

### Via Frontend
The frontend automatically tries to read from the contract via `/api/reputation`:

```typescript
// Request
GET /api/reputation?address=0x...

// Response (if on-chain)
{
  "address": "0x...",
  "score": 850,
  "source": "onchain",
  "lastUpdated": "2026-01-01T10:00:00Z"
}

// Fallback response (if no contract or not deployed)
{
  "address": "0x...",
  "score": 543,
  "breakdown": { ... },
  "source": "mock"
}
```

---

## Oracle Model: Update Reputation

### Flow
1. Backend calculates score (from XP, trades, age, etc.)
2. Backend calls `issueOrUpdate(user, score)` → costs gas
3. On-chain reputation updates + event emitted
4. Frontend reads from contract

### Backend Integration (Example)

```typescript
// In your backend service (e.g., Node.js)
import { createPublicClient, createWalletClient, http } from 'viem'
import { baseMainnet } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

const account = privateKeyToAccount('0x...')

const walletClient = createWalletClient({
  account,
  chain: baseMainnet,
  transport: http()
})

// Update reputation
const hash = await walletClient.writeContract({
  address: '0x...',
  abi: REP_ABI,
  functionName: 'issueOrUpdate',
  args: ['0xUserAddress', 750]
})

await publicClient.waitForTransactionReceipt({ hash })
```

### Cost Estimate
- **First update** (mint SBT): ~150,000 gas (~$2-5 USD)
- **Subsequent updates**: ~60,000 gas (~$1-2 USD)
- Use Base for cheap fees (~$0.01 per transaction)

---

## Architecture: Off-Chain Calculation → On-Chain Storage

```
┌─────────────────┐
│   User Activity │
│  (Trades, XP)   │
└────────┬────────┘
         │
         v
┌─────────────────────────────────┐
│  Backend Reputation Service     │
│  - XP Score (300)              │
│  - Trading Score (200)         │
│  - Age Score (150)             │
│  - Social Score (150)          │
│  - Risk Score (200)            │
│  TOTAL: 0-1000                 │
└────────┬────────────────────────┘
         │ issueOrUpdate(user, score)
         v
┌─────────────────────────────────┐
│     ReputationSBT Contract      │
│  - Mint SBT to user (once)      │
│  - Store score + timestamp      │
│  - Emit event for auditing      │
│  - Prevent transfers            │
└────────┬────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│   Frontend + Other Protocols    │
│  - Read score directly          │
│  - Display badge                │
│  - Use for governance/lending   │
└─────────────────────────────────┘
```

---

## Security Considerations

### ✅ Why This Is Safe

1. **No private keys on-chain** - Reputation is read-only
2. **One SBT per wallet** - Prevents double minting
3. **Non-transferable** - Prevents reputation theft
4. **Admin-controlled** - You control updates (oracle model)
5. **Event logs** - All changes auditable
6. **Gas efficient** - No heavy computation on-chain

### ⚠️ What to Watch

1. **Admin key security** - Protect your deployer private key
2. **Oracle reliability** - Reputation calculation must be fair
3. **Update frequency** - Balance between gas costs and freshness
4. **Frontrun prevention** - Score updates are public (acceptable)

---

## Reading from Contract (Frontend)

The frontend already handles this! It tries:

1. **On-chain first** (if contract deployed) → `eth_call` to `getReputation()`
2. **Fallback to mock** (if no contract or address) → seeded random data

### Manual Read (for testing)

```typescript
const publicClient = createPublicClient({
  chain: base,
  transport: http()
})

const [score, lastUpdated] = await publicClient.readContract({
  address: '0xReputationSBT',
  abi: REP_ABI,
  functionName: 'getReputation',
  args: ['0xUserAddress']
})

console.log(`Score: ${score}, Last Updated: ${lastUpdated}`)
```

---

## Events (Auditing)

The contract emits events for transparency:

```solidity
event ReputationIssued(address indexed user, uint256 score, uint256 timestamp);
event ReputationUpdated(address indexed user, uint256 oldScore, uint256 newScore, uint256 timestamp);
```

You can listen to these via `eth_getLogs`:

```typescript
const logs = await publicClient.getLogs({
  address: '0xReputationSBT',
  event: parseAbiItem('event ReputationUpdated(address indexed user, uint256 oldScore, uint256 newScore, uint256 timestamp)'),
  fromBlock: 'earliest'
})
```

---

## Upgrade Path

**Current (Mock):**
- Frontend reads from `/api/reputation`
- Backend returns mock data
- No on-chain state

**After SBT Deployment:**
- Frontend still reads from `/api/reputation`
- API tries on-chain first, falls back to mock
- Transparent migration (no UI changes needed)

**Full Migration:**
1. Deploy ReputationSBT contract
2. Backend starts calling `issueOrUpdate()` weekly/monthly
3. Phase out mock data gradually
4. Remove mock fallback (users must have SBT)

---

## Troubleshooting

### "Contract not found" error
- Check `NEXT_PUBLIC_REP_CONTRACT` is set correctly
- Verify contract is deployed on Base mainnet
- Check Base RPC is accessible

### "eth_call failed" error
- Contract might not have `getReputation()` function
- Try reading with Remix first to verify deployment

### No SBT minted for user
- Wallet must receive `issueOrUpdate()` call from owner
- Use backend oracle to trigger updates
- Check contract events to see if minted

### Transfer not working (expected)
- SBTs are non-transferable by design
- This is correct behavior - it's soulbound!

---

## Next Steps

1. ✅ Deploy ReputationSBT.sol to Base
2. ✅ Set environment variables
3. ✅ Test reading with frontend (automatic fallback works)
4. ✅ Build backend oracle to call `issueOrUpdate()`
5. ✅ Listen to events for audit logs
6. ✅ Integrate with lending/governance protocols

---

## Related Files

- Smart Contract: `contracts/ReputationSBT.sol`
- API Handler: `app/api/reputation/route.ts` (auto-reads on-chain)
- Reputation Helper: `lib/reputation.ts` (badge logic)
- Profile Page: `app/reputation/[address]/page.tsx` (displays SBT)

**Status:** Deployment-ready. Frontend automatically supports both mock (dev) and on-chain (prod) reputation sources.
