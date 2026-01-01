# 🚀 Smart Contract Deployment Guide

Deploy all contracts to Base mainnet using Remix.

## Prerequisites

1. **MetaMask wallet** with Base mainnet added
   - RPC: https://mainnet.base.org
   - Chain ID: 8453
   - Currency: ETH

2. **Test ETH on Base** (~0.1 ETH for gas)
   - Get from [Coinbase Wallet](https://www.coinbase.com/wallet)
   - Or [Uniswap Faucet](https://uniswap.org)
   - Or transfer from Ethereum via bridge

3. **USDC on Base** (for testing)
   - Address: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
   - Get from Uniswap or Coinbase

## Deployment Order

1. **ReputationSBT.sol** (on-chain identity)
2. **ReputationCreditVault.sol** (credit system)
3. **CopyTradingVault.sol** (copy trading)

---

## Step 1: Deploy ReputationSBT.sol

### Open Remix

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create new file: `ReputationSBT.sol`
3. Paste contract from [contracts/ReputationSBT.sol](../contracts/ReputationSBT.sol)

### Compile

1. Click **Solidity Compiler** (left sidebar)
2. Select compiler version: **0.8.20**
3. Click **Compile ReputationSBT.sol**
4. Verify ✅ (should show green checkmark)

### Deploy

1. Click **Deploy & Run Transactions** (left sidebar)
2. **Environment:** Select "Injected Provider - MetaMask"
3. **Contract:** Select "ReputationSBT"
4. Click **Deploy**
5. MetaMask popup: confirm transaction
6. Wait for confirmation (~30 seconds)

### Save Address

In terminal:
```bash
cd C:\Users\om\base-social-trade

# Create or edit .env.local
echo NEXT_PUBLIC_REP_CONTRACT=0x... >> .env.local
```

Copy deployed address from Remix and paste after `=`

**Example:**
```
NEXT_PUBLIC_REP_CONTRACT=0x1234567890abcdef1234567890abcdef12345678
```

### Verify (Optional)

Go to [BaseScan](https://basescan.org), search contract address, confirm it's ReputationSBT.

---

## Step 2: Deploy ReputationCreditVault.sol

### Open Remix

1. Create new file: `ReputationCreditVault.sol`
2. Paste from [contracts/ReputationCreditVault.sol](../contracts/ReputationCreditVault.sol)

### Compile

1. **Solidity Compiler** → Select version **0.8.20**
2. Click **Compile ReputationCreditVault.sol**

### Deploy with Constructor Args

1. **Deploy & Run Transactions**
2. **Environment:** "Injected Provider - MetaMask"
3. **Contract:** "ReputationCreditVault"
4. **Constructor parameters:**
   - `_usdc`: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` (USDC on Base)
   - `_rep`: `0x...` (your ReputationSBT address from Step 1)

5. Click **Deploy**
6. Confirm in MetaMask

### Save Address

```bash
echo NEXT_PUBLIC_CREDIT_CONTRACT=0x... >> .env.local
```

---

## Step 3: Deploy CopyTradingVault.sol

### Open Remix

1. Create new file: `CopyTradingVault.sol`
2. Paste from [contracts/CopyTradingVault.sol](../contracts/CopyTradingVault.sol)

### Compile

1. **Solidity Compiler** → version **0.8.20**
2. Click **Compile CopyTradingVault.sol**

### Deploy

⚠️ **CopyTradingVault is deployed per-vault (not once globally)**

This is intentional - each user/trader pair gets their own vault.

For testing:
1. **Contract:** "CopyTradingVault"
2. **Constructor parameters:**
   - `_owner`: Your wallet address
   - `_trader`: Trader address (e.g., a test trader)
   - `_admin`: Protocol executor address (your backend wallet)
   - `_copyPercent`: 10

3. Click **Deploy**
4. Test vault created ✓

**Note:** Production vaults are created dynamically via API on `/api/copy-vault`

---

## Configure Environment

Update `.env.local`:

```bash
# Required
NEXT_PUBLIC_WALLET_CONNECT_ID=your_walletconnect_id
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org

# Deployed Contracts
NEXT_PUBLIC_REP_CONTRACT=0x...       # ReputationSBT
NEXT_PUBLIC_CREDIT_CONTRACT=0x...   # ReputationCreditVault

# CopyTradingVault is created per-vault (no global address)
# NEXT_PUBLIC_COPY_VAULT_TEMPLATE=0x... (optional, factory pattern - Phase 2)
```

---

## Post-Deployment Testing

### 1. Test ReputationSBT

In Remix **Read** tab:
```
reputation(0x...your_address)
→ Should return: score=0, lastUpdated=0 (not yet issued)
```

Call **issueOrUpdate** (only owner):
- user: `0x...your_address`
- score: `650`

Then read again:
→ Should return: score=650, lastUpdated=<current_timestamp>

### 2. Test Credit System

Visit [http://localhost:3000/credit](http://localhost:3000/credit)

If `NEXT_PUBLIC_CREDIT_CONTRACT` is set:
- Should show your reputation tier
- Should show credit limit ($300-$5000 based on rep)
- Can test borrow/repay flows

### 3. Test Copy Trading

Visit [http://localhost:3000/trader/0x...trusted_trader](http://localhost:3000/trader/0x...trusted_trader)

If trader has rep >= 650:
- "🤖 Enable Auto Copy" button appears
- Can set allocation (5-50%)
- Can create vault

---

## Deployment Checklist

### Pre-Deployment
- [ ] MetaMask connected to Base mainnet
- [ ] Have ~0.1 ETH on Base for gas
- [ ] Know wallet address (for constructor args)

### ReputationSBT
- [ ] Compiled with version 0.8.20
- [ ] Deployed to Base
- [ ] Address saved to `.env.local` as `NEXT_PUBLIC_REP_CONTRACT`
- [ ] Tested on BaseScan

### ReputationCreditVault
- [ ] Compiled with version 0.8.20
- [ ] Constructor args filled:
  - [ ] USDC: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
  - [ ] Rep: Your ReputationSBT address
- [ ] Deployed to Base
- [ ] Address saved to `.env.local` as `NEXT_PUBLIC_CREDIT_CONTRACT`

### CopyTradingVault
- [ ] Compiled with version 0.8.20
- [ ] Test vault created with:
  - [ ] Owner: your address
  - [ ] Trader: test trader address
  - [ ] Admin: your backend address
  - [ ] Copy percent: 10
- [ ] Tested deposit/withdraw

### Environment
- [ ] `.env.local` updated with contract addresses
- [ ] `npm run build` successful
- [ ] All 14 routes compile

---

## Remix Tips

### Copy Contract Code

**Easy way:**
1. In VS Code, right-click contract file
2. Select "Copy file"
3. In Remix, create file, paste

### Fix Import Errors

If you see "source file not found" errors:
1. Make sure all interfaces are in the same file
2. Or use flattened version (see below)

### Get Deployment Address

After deploy, look for green checkmark in **Transactions** panel:
- Click transaction
- Copy "Deployed at" address

### Save ABI

In Remix **Compiler Details**:
1. Compile contract
2. Scroll down to "ABI"
3. Copy full ABI
4. Save to `lib/abis/YourContract.json` for frontend use

---

## Troubleshooting

### "MetaMask not detected"
- Refresh Remix
- Make sure MetaMask extension is enabled
- Check MetaMask is on Base mainnet (chain ID 8453)

### "Insufficient gas"
- Need more ETH on Base
- Get from Coinbase or bridge from Ethereum

### "Source file not found"
- Paste entire contract including all interfaces
- Or use flattened version

### "Constructor argument mismatch"
- Copy address format: `0x...` (with 0x prefix)
- Check it's the right contract address
- For USDC, always use: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

### Contract won't deploy
- Check gas estimate (might be too high)
- Ensure you have enough ETH
- Try again in a few minutes (network might be congested)

---

## What Each Contract Does

### ReputationSBT.sol
- Non-transferable ERC721
- Stores reputation scores on-chain
- Used by credit system and copy trading for gating
- **Owner:** You (protocol admin)
- **Can call:** issueOrUpdate() to update user reputation

### ReputationCreditVault.sol
- Manages under-collateralized loans
- Reads reputation from ReputationSBT
- Calculates credit limits based on tier
- **Owner:** Each individual borrower
- **Needs:** USDC address (for lending)

### CopyTradingVault.sol
- Non-custodial vault per user/trader pair
- Stores funds for automated copying
- User can withdraw anytime
- **Owner:** Follower (person copying trades)
- **Trader:** Address being copied
- **Admin:** Protocol executor (your backend)

---

## Cost Estimate

| Contract | Gas (estimate) | Cost (at 1 gwei) |
|----------|----------------|------------------|
| ReputationSBT | 1.2M | ~$0.04 |
| ReputationCreditVault | 1.5M | ~$0.05 |
| CopyTradingVault | 1.1M | ~$0.04 |
| **Total** | **~3.8M** | **~$0.13** |

*Prices vary with gas market. During peak times: ~$0.50. Off-peak: ~$0.10*

---

## Next Steps After Deployment

1. **Update `.env.local`** with contract addresses
2. **Test endpoints:**
   - `/api/reputation?address=0x...`
   - `/credit` dashboard
   - `/trader/[address]` auto-copy button

3. **Populate reputation:**
   - Call `issueOrUpdate()` to give test users reputation scores
   - Use test addresses with scores >= 650 for auto-copy testing

4. **Implement trade mirroring:**
   - Listen to trader swap events
   - Call `vault.executeTrade()` for each follower vault
   - Track success/failure

5. **Launch closed beta:**
   - Invite 20 trusted users
   - Monitor TVL and repayment rates
   - Collect feedback

---

## Security Notes

⚠️ **Before Mainnet Scale:**

- [ ] Audit contracts (optional for MVP, required for >$1M TVL)
- [ ] Test withdrawal scenarios
- [ ] Test reputation update oracle
- [ ] Set rate limits on API
- [ ] Monitor for exploit attempts
- [ ] Have pause/emergency functions ready
- [ ] Cap TVL (start at $50k)
- [ ] Whitelist first 20 users

---

**Status:** Ready for deployment

Next command: Deploy contracts in Remix, update `.env.local`, then push to prod!
