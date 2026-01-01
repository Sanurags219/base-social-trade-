# 🚀 Complete Mainnet Deployment - All 3 Contracts

**Status:** Ready to Deploy  
**Network:** Base Mainnet (Chain ID: 8453)  
**Total Gas:** ~$3-5 USD  

---

## 📦 Contracts to Deploy

| # | Contract | Status | Deploy Cost |
|---|----------|--------|------------|
| 1 | ReputationSBT | ✅ **DEPLOYED** | - |
| 2 | ReputationCreditVault | ⏳ Ready | ~$2-3 |
| 3 | CopyTradingVault | ⏳ Ready | ~$1-2 |

---

## 🎯 Deploy Contracts (Step by Step)

### **IMPORTANT: Use Remix IDE**
1. Go to: **https://remix.ethereum.org**
2. Make sure MetaMask is on **Base Mainnet**
3. Verify you have **ETH for gas**

---

## 📋 CONTRACT #2: ReputationCreditVault

### Copy Contract Code
```bash
# From: contracts/ReputationCreditVault.sol
# Paste into Remix as new file
```

### Remix Deployment Steps

**1. In Remix:**
```
- File → New File → ReputationCreditVault.sol
- Paste entire contract code
- Click Compile (select Solidity 0.8.20)
```

**2. Connect Wallet:**
```
- Click "Deploy & Run Transactions"
- Select "Injected Provider" (MetaMask)
- Confirm MetaMask is on Base Mainnet
```

**3. Deploy with Constructor Args:**
```
Contract: ReputationCreditVault

Constructor Parameters:
  _usdc:  0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  _rep:   0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b

(Just paste these in Remix deployment dialog)
```

**4. Confirm & Wait:**
```
- Click "Deploy"
- Confirm in MetaMask
- Wait for transaction confirmation
- Copy the contract address that appears
```

**5. Save Address:**
```
Add to .env.local:
NEXT_PUBLIC_CREDIT_CONTRACT=0x[ADDRESS_FROM_STEP_4]
```

---

## 📋 CONTRACT #3: CopyTradingVault

### Copy Contract Code
```bash
# From: contracts/CopyTradingVault.sol
# Paste into Remix as new file
```

### Remix Deployment Steps

**1. In Remix:**
```
- File → New File → CopyTradingVault.sol
- Paste entire contract code
- Click Compile (select Solidity 0.8.20)
```

**2. Connect Wallet:**
```
- MetaMask should already be connected
- Verify still on Base Mainnet
```

**3. Deploy (No Constructor Args):**
```
Contract: CopyTradingVault

Constructor Parameters: NONE
(CopyTradingVault creates per-user instances)

Just click "Deploy"
```

**4. Confirm & Wait:**
```
- Click "Deploy"
- Confirm in MetaMask
- Wait for confirmation
- Copy the contract address
```

**5. Save Address:**
```
Add to .env.local:
NEXT_PUBLIC_COPY_VAULT_CONTRACT=0x[ADDRESS_FROM_STEP_4]
```

---

## ✅ After Deployment - Update Config

### Your .env.local should have:

```bash
NEXT_PUBLIC_REP_CONTRACT=0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b
NEXT_PUBLIC_CREDIT_CONTRACT=0x[NEW_ADDRESS_FROM_DEPLOYMENT]
NEXT_PUBLIC_COPY_VAULT_CONTRACT=0x[NEW_ADDRESS_FROM_DEPLOYMENT]
NEXT_PUBLIC_OWNER_ADDRESS=0x22E228AdE324185123A54Ad25F3459a99CF51E7a
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_CHAIN_ID=8453
```

---

## 🔍 Verify Deployments

### Check on Basescan
After deployment, verify contracts are live:

1. Go to: https://basescan.org
2. Search for your contract address
3. Verify:
   - Code is present ✓
   - Functions listed correctly ✓
   - Read/Write tabs available ✓

### Example Verification
```
Contract: ReputationCreditVault
Address: 0x[YOUR_ADDRESS]
Network: Base Mainnet
Status: Active
```

---

## 🧪 Test Frontend

After updating `.env.local`:

```bash
# Rebuild with new contract addresses
npm run build

# Start server
npm start

# Visit http://localhost:3000/credit
# Should load without errors
# Should read from your contract
```

---

## 🚨 Important Checklist

Before deploying each contract:

**ReputationCreditVault:**
- [ ] Solidity version is 0.8.20
- [ ] Constructor args are correct (USDC + ReputationSBT)
- [ ] MetaMask is on Base Mainnet
- [ ] You have ETH for gas (~0.001 ETH)

**CopyTradingVault:**
- [ ] Solidity version is 0.8.20
- [ ] No constructor args needed
- [ ] MetaMask is on Base Mainnet
- [ ] You have ETH for gas (~0.0005 ETH)

---

## 💾 Save All Addresses

Create a backup of all contract addresses:

```
# SAVE THIS SOMEWHERE SAFE (not in git)

ReputationSBT: 0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b
ReputationCreditVault: 0x[YOUR_DEPLOYED_ADDRESS]
CopyTradingVault: 0x[YOUR_DEPLOYED_ADDRESS]

Owner: 0x22E228AdE324185123A54Ad25F3459a99CF51E7a
```

---

## 🔗 Useful Links

- **Remix IDE:** https://remix.ethereum.org
- **Basescan (Explorer):** https://basescan.org
- **MetaMask:** https://metamask.io
- **RPC Endpoint:** https://mainnet.base.org

---

## ⚠️ If Deployment Fails

**Transaction reverted?**
```
- Check constructor arguments are correct
- Verify you have enough ETH for gas
- Try increasing gas limit in MetaMask
```

**Can't compile?**
```
- Check Solidity version (must be 0.8.20)
- Check all imports are available
- Copy exact code from /contracts/
```

**Contract not showing on Basescan?**
```
- Wait 30 seconds for indexing
- Verify correct network (Base Mainnet = 8453)
- Check transaction hash in MetaMask
```

---

## ✨ Success Criteria

After all deployments:

- [ ] All 3 contracts deployed to Base Mainnet
- [ ] All addresses saved in `.env.local`
- [ ] All addresses verified on Basescan
- [ ] Frontend builds successfully
- [ ] `/credit` page loads without errors
- [ ] Ready for frontend deployment

---

## 🎉 You're Ready!

Everything is set up. Time to deploy! 

**Next steps:**
1. Deploy ReputationCreditVault via Remix
2. Deploy CopyTradingVault via Remix
3. Update `.env.local` with new addresses
4. Test frontend locally
5. Deploy to Vercel

**Let's go live! 🚀**
