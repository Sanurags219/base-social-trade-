# ⚡ DEPLOY ReputationCreditVault NOW

**Time:** 5 minutes  
**Cost:** ~$2-3 USD (gas)  
**Network:** Base Mainnet (8453)  

---

## 🎯 STEP BY STEP

### STEP 1: Open Remix
```
Go to: https://remix.ethereum.org
```

### STEP 2: Create New File
```
1. Click "File" icon (left sidebar)
2. Click "New File"
3. Name it: ReputationCreditVault.sol
4. Click "Create"
```

### STEP 3: Copy Contract Code
```
From your computer:
C:\Users\om\base-social-trade\contracts\ReputationCreditVault.sol

Open that file, select ALL (Ctrl+A), copy (Ctrl+C)
```

### STEP 4: Paste into Remix
```
Paste (Ctrl+V) the entire contract code into the Remix editor
```

### STEP 5: Compile
```
1. Click "Solidity Compiler" (left sidebar)
2. Select Version: 0.8.20
3. Click "Compile ReputationCreditVault.sol"
4. Wait for ✅ green checkmark
```

### STEP 6: Deploy
```
1. Click "Deploy & Run Transactions" (left sidebar)
2. Environment: Select "Injected Provider - MetaMask"
3. MetaMask will pop up - CONFIRM CONNECTION
4. Contract dropdown: Select "ReputationCreditVault"
```

### STEP 7: Enter Constructor Arguments
```
You'll see 2 input boxes:

BOX 1 (_usdc):
Paste: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

BOX 2 (_rep):
Paste: 0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b
```

### STEP 8: Click Deploy
```
1. Click the blue "Deploy" button
2. MetaMask pops up
3. Review gas estimate (should be ~$2-3)
4. Click "Confirm" in MetaMask
5. WAIT for transaction (30 seconds - 2 minutes)
```

### STEP 9: Copy Contract Address
```
After deployment, Remix shows:
"ReputationCreditVault at 0x..."

COPY THIS ADDRESS (the 0x... part)
```

### STEP 10: Update .env.local
```bash
Open: C:\Users\om\base-social-trade\.env.local

Add/Update this line:
NEXT_PUBLIC_CREDIT_CONTRACT=0x[PASTE_YOUR_ADDRESS_HERE]

Example:
NEXT_PUBLIC_CREDIT_CONTRACT=0xabcd1234567890abcd1234567890abcd12345678
```

---

## ✅ VERIFY DEPLOYMENT

### Check on Basescan
```
1. Go to: https://basescan.org
2. Search for your contract address
3. Verify:
   - Code is present ✓
   - Contract name shows ✓
   - Read/Write tabs available ✓
```

### Test in Frontend
```bash
cd C:\Users\om\base-social-trade
npm run build
npm start
# Visit: http://localhost:3000/credit
```

---

## 🔧 Constructor Arguments Reference

**For This Contract:**

| Parameter | Value | Purpose |
|-----------|-------|---------|
| _usdc | 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 | USDC token (Base Mainnet) |
| _rep | 0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b | ReputationSBT contract |

**Don't change these - use exact values above!**

---

## 🆘 If Something Goes Wrong

**"Compilation error"?**
- Solidity version must be 0.8.20
- Copy ENTIRE contract (start to finish)
- Check no text is missing

**"MetaMask won't connect"?**
- Make sure Base Mainnet is selected (not Sepolia)
- Refresh Remix
- Try again

**"Deployment fails"?**
- Check you have ETH for gas
- Gas estimate should be < $5
- Try with higher gas limit

**"Can't find address after deploy"?**
- Check MetaMask transaction history
- Look for "ReputationCreditVault" in transactions
- Copy address from there

---

## 📋 Checklist

Before you start:
- [ ] MetaMask installed
- [ ] Base Mainnet selected
- [ ] Have ETH (0.01+ ETH)
- [ ] Contract code ready to copy

During deployment:
- [ ] Remix compiles ✓
- [ ] Constructor args entered ✓
- [ ] Deploy button clicked ✓
- [ ] MetaMask confirmed ✓

After deployment:
- [ ] Contract address copied
- [ ] Address added to .env.local
- [ ] npm run build succeeds
- [ ] http://localhost:3000/credit loads

---

## 🚀 THEN

After this contract is deployed:

```bash
# Update .env.local with the new address
NEXT_PUBLIC_CREDIT_CONTRACT=0x[YOUR_ADDRESS]

# Build
npm run build

# Test locally
npm start

# Visit http://localhost:3000/credit
```

---

## ⏱️ Timeline

- Deploy contract: 2-5 minutes
- Update .env.local: 30 seconds
- Rebuild: 1 minute
- Test locally: 1 minute
- **Total: ~5 minutes**

---

## 🎉 NEXT

After this deploys successfully:
1. Deploy CopyTradingVault (same process)
2. Update .env.local with that address too
3. Deploy frontend to Vercel
4. Go live! 🚀

---

**Ready? Go to https://remix.ethereum.org and start! ⏱️**
