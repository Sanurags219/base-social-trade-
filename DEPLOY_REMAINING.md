# 🚀 Deploy Remaining Contracts

**Status:** 2 of 5 contracts deployed ✅

```
✅ ReputationSBT        (0x0F234...)
✅ BSTN Token           (0x52B11...)
✅ BSTNClaim            (0xC822E...)
⏳ ReputationCreditVault (via Remix)
⏳ CopyTradingVault      (via Remix)
```

---

## 📋 Option 1: Deploy via Remix (Easiest - 5 min each)

### ReputationCreditVault

1. **Go to Remix:**
   - Open: https://remix.ethereum.org

2. **Create File:**
   - Click "Create New File"
   - Name: `ReputationCreditVault.sol`
   - Copy from: `C:\Users\om\base-social-trade\contracts\ReputationCreditVault.sol`

3. **Compile:**
   - Select Solidity Compiler on left
   - Version: `0.8.20`
   - Click "Compile ReputationCreditVault.sol"

4. **Deploy:**
   - Click "Deploy & Run Transactions"
   - Select "Injected Provider - MetaMask"
   - Switch MetaMask to Base Mainnet (8453)
   - Select `ReputationCreditVault` contract
   - Constructor Arguments:
     ```
     USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
     ReputationSBT: 0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b
     ```
   - Click "Deploy"
   - Pay gas ~$1-2 USD
   - Copy the deployed address
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_CREDIT_CONTRACT=0x...
     ```

### CopyTradingVault

Same steps as above, but:
- File: `CopyTradingVault.sol`
- **No constructor arguments** (empty)
- Add to `.env.local`:
  ```
  NEXT_PUBLIC_COPY_VAULT_CONTRACT=0x...
  ```

---

## 🎯 Option 2: Deploy via Hardhat (Advanced)

```bash
# After both contracts are ready:
npx hardhat run scripts/deploy-remaining.js --network base
```

---

## 📦 After Both Deployed

Update `.env.local`:
```
NEXT_PUBLIC_REP_CONTRACT=0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b
NEXT_PUBLIC_CREDIT_CONTRACT=0x...
NEXT_PUBLIC_COPY_VAULT_CONTRACT=0x...
NEXT_PUBLIC_BSTN_TOKEN=0x52B11d41a013CdcFEF71231aF61D7b8DDCf757F2
NEXT_PUBLIC_BSTN_CLAIM=0xC822EFcF4DD0f84FF7718266F79A65DEbE418538
```

Then:
```bash
npm run build
npm start
```

---

## 🎪 Frontend Deployment (5 min)

### To Vercel:
```bash
git add .
git commit -m "deploy: all contracts live"
git push origin main
```
(Auto-deploys if connected)

### Or Self-Host:
```bash
npm run build
npm start  # Runs on http://localhost:3000
```

---

## ✅ Ready for Beta Launch!

Once both contracts deployed:
- [ ] Fund ReputationCreditVault with $1,000 USDC
- [ ] Build & test locally
- [ ] Deploy frontend
- [ ] Invite beta users
- [ ] Monitor TVL & repayment rate

**Estimated time:** 20 minutes total 🚀
