# ⚡ QUICK DEPLOY CHECKLIST - 15 Minutes to Live

**What you'll do:**
1. ✅ Deploy 2 contracts in Remix (10 min)
2. ✅ Update `.env.local` (1 min)
3. ✅ Test frontend (2 min)
4. ✅ Go live! (2 min)

---

## 🚀 START HERE

### Prerequisites
- [ ] MetaMask wallet
- [ ] Base Mainnet selected in MetaMask
- [ ] At least 0.01 ETH for gas
- [ ] Private key stored securely (✅ already done)

---

## 📝 STEP 1: Deploy ReputationCreditVault

### 1a. Open Remix
```
Go to: https://remix.ethereum.org
```

### 1b. Create New File
```
1. Click "File" on left sidebar
2. Click "New File"
3. Name: ReputationCreditVault.sol
4. Click "Create"
```

### 1c. Copy & Paste Contract Code
```
From your local file: contracts/ReputationCreditVault.sol
Paste ENTIRE content into Remix editor
```

**Contract code location:**
```bash
cat C:\Users\om\base-social-trade\contracts\ReputationCreditVault.sol
```

### 1d. Compile Contract
```
1. Click "Solidity Compiler" (left sidebar)
2. Select Compiler Version: 0.8.20
3. Click "Compile ReputationCreditVault.sol"
4. Wait for ✅ (green checkmark)
```

### 1e. Deploy to Base Mainnet
```
1. Click "Deploy & Run Transactions" (left sidebar)
2. Environment: Select "Injected Provider - MetaMask"
3. MetaMask will pop up - confirm connection
4. Contract: Select "ReputationCreditVault"
```

### 1f. Enter Constructor Arguments
```
In the "Deploy" section, you'll see two input fields:

Field 1 (_usdc):
0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

Field 2 (_rep):
0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b

Copy & paste these exactly (one per field)
```

### 1g. Click Deploy
```
1. Click the blue "Deploy" button
2. MetaMask window pops up
3. Review gas estimate (should be < 0.001 ETH = ~$2)
4. Click "Confirm"
5. Wait for transaction to complete (30 seconds - 2 minutes)
```

### 1h. Copy Contract Address
```
After deployment, you'll see:
"ReputationCreditVault at 0x..."

COPY THIS ADDRESS ⬆️

Example: 0xabcd1234...
```

### 1i. Save to .env.local
```bash
# Add this line to .env.local:
NEXT_PUBLIC_CREDIT_CONTRACT=0x[PASTE_YOUR_ADDRESS_HERE]
```

---

## 📝 STEP 2: Deploy CopyTradingVault

### 2a. Create New File in Remix
```
1. Click "File"
2. Click "New File"
3. Name: CopyTradingVault.sol
4. Click "Create"
```

### 2b. Copy & Paste Contract Code
```
From your local file: contracts/CopyTradingVault.sol
Paste ENTIRE content into Remix editor
```

### 2c. Compile Contract
```
1. Click "Solidity Compiler"
2. Select Version: 0.8.20
3. Click "Compile CopyTradingVault.sol"
4. Wait for ✅
```

### 2d. Deploy to Base Mainnet
```
1. Click "Deploy & Run Transactions"
2. Contract: Select "CopyTradingVault"
```

### 2e. Deploy (No Constructor Args!)
```
⚠️ IMPORTANT: CopyTradingVault has NO constructor arguments

Just click the blue "Deploy" button
(Don't enter anything in input fields)
```

### 2f. Confirm in MetaMask
```
1. MetaMask pops up
2. Review gas estimate
3. Click "Confirm"
4. Wait for completion
```

### 2g. Copy Contract Address
```
After deployment:
"CopyTradingVault at 0x..."

COPY THIS ADDRESS ⬆️
```

### 2h. Save to .env.local
```bash
# Add this line to .env.local:
NEXT_PUBLIC_COPY_VAULT_CONTRACT=0x[PASTE_YOUR_ADDRESS_HERE]
```

---

## ✅ STEP 3: Update .env.local

### Your .env.local should now have:

```bash
# Contract Addresses (Base Mainnet)
NEXT_PUBLIC_REP_CONTRACT=0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b
NEXT_PUBLIC_CREDIT_CONTRACT=0x[YOUR_DEPLOYED_ADDRESS]
NEXT_PUBLIC_COPY_VAULT_CONTRACT=0x[YOUR_DEPLOYED_ADDRESS]

# Owner
NEXT_PUBLIC_OWNER_ADDRESS=0x22E228AdE324185123A54Ad25F3459a99CF51E7a

# Network
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453
```

---

## 🧪 STEP 4: Test Frontend

### 4a. Rebuild
```bash
cd C:\Users\om\base-social-trade
npm run build
```

### 4b. Start Server
```bash
npm start
```

### 4c. Test in Browser
```
Go to: http://localhost:3000/credit

Verify:
- Page loads without errors ✓
- Credit information displays ✓
- No console errors ✓
```

---

## 🚀 STEP 5: Go Live!

### Option A: Deploy to Vercel (Recommended)

```bash
# Commit changes
git add .
git commit -m "deploy: mainnet contracts live"
git push origin main

# Vercel auto-deploys on push
# Wait 2-3 minutes
# Your site goes live!
```

### Option B: Self-Host
```bash
npm start
# Server runs on port 3000
```

---

## 🔍 VERIFICATION

### Check Contracts on Basescan

After deployment, verify each contract:

**1. ReputationCreditVault**
```
Go to: https://basescan.org
Search: 0x[YOUR_CREDIT_CONTRACT_ADDRESS]
Verify:
  - Code is present ✓
  - Functions listed ✓
```

**2. CopyTradingVault**
```
Go to: https://basescan.org
Search: 0x[YOUR_COPY_VAULT_ADDRESS]
Verify:
  - Code is present ✓
  - Functions listed ✓
```

---

## ❌ If Something Goes Wrong

### Contract won't compile?
```
- Check Solidity version = 0.8.20
- Check all code pasted correctly
- Copy from /contracts/ folder
```

### Deployment fails?
```
- Verify constructor args are correct
- Check you have enough ETH
- Verify Base Mainnet selected
- Check gas estimate is reasonable
```

### Can't find contract address?
```
- Check MetaMask transaction history
- Search your wallet on Basescan
- Check Remix console for errors
```

### Frontend won't load?
```
- Verify .env.local has all addresses
- Check addresses have 0x prefix
- Rebuild: npm run build
- Check console for errors
```

---

## ✨ Success Checklist

After all steps:

- [ ] ReputationCreditVault deployed
- [ ] CopyTradingVault deployed
- [ ] Both addresses in .env.local
- [ ] npm run build succeeds
- [ ] localhost:3000/credit loads
- [ ] Frontend deployed to Vercel/live
- [ ] Contracts verified on Basescan

---

## 📞 Quick Reference

| Item | Value |
|------|-------|
| Remix IDE | https://remix.ethereum.org |
| Network | Base Mainnet (8453) |
| RPC | https://mainnet.base.org |
| Explorer | https://basescan.org |
| USDC (Mainnet) | 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 |
| ReputationSBT | 0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b |

---

## 🎉 YOU'RE READY!

Everything is set up. Just follow the steps above and you'll be live in 15 minutes! 

**Questions?** See DEPLOY_ALL_NOW.md for more details.

**Let's go! 🚀**
