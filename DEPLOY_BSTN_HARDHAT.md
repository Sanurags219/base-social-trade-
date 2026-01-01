# 🎁 Deploy BSTN Token & Claims with Hardhat

**Time:** 10 minutes  
**Cost:** ~$3-5 USD gas  

---

## 🎯 What You're Deploying

1. **BSTN Token** - ERC-20 governance token
2. **BSTNClaim** - Contract for converting XP to BSTN

---

## 🚀 Deploy Now

### Option A: Deploy to Base Mainnet (Live)

```bash
cd C:\Users\om\base-social-trade

npx hardhat run scripts/deploy-bstn.js --network base
```

**What happens:**
1. Deploys BSTN token
2. Deploys BSTNClaim contract
3. Grants mint permissions
4. Auto-updates `.env.local`
5. Shows addresses to save

### Option B: Deploy to Base Sepolia (Test First)

```bash
npx hardhat run scripts/deploy-bstn.js --network baseSepolia
```

**Better for testing before mainnet.**

---

## 📋 Prerequisites

✅ Private key in `.env.local` (you already have this)  
✅ Base network selected in your config  
✅ ETH for gas (~0.002 ETH = $3-5)  

---

## 🔧 What the Script Does

1. **Deploys BSTN**
   - Simple ERC-20 token
   - You own it initially
   - Can mint unlimited supply

2. **Deploys BSTNClaim**
   - Takes BSTN address as arg
   - Users convert XP → BSTN
   - Formula: 100 BSTN per 1000 XP

3. **Sets Permissions**
   - Transfers ownership to BSTNClaim
   - BSTNClaim can now mint BSTN
   - Users can claim anytime

4. **Updates .env.local**
   - Saves both contract addresses
   - No manual copy-paste needed

---

## 📖 Expected Output

```
🚀 Deploying BSTN Token & Claims System...

📝 Deployer: 0x22E228AdE324185123A54Ad25F3459a99CF51E7a
💰 Balance: 2.5 ETH

📦 Step 1: Deploying BSTN Token...
✅ BSTN deployed to: 0xabcd1234567890abcd1234567890abcd12345678

📦 Step 2: Deploying BSTNClaim...
✅ BSTNClaim deployed to: 0xdef01234567890def01234567890def012345678

📦 Step 3: Granting mint permissions...
✅ BSTNClaim can now mint BSTN

🎉 DEPLOYMENT COMPLETE

📋 Add to .env.local:
NEXT_PUBLIC_BSTN_TOKEN=0xabcd1234567890abcd1234567890abcd12345678
NEXT_PUBLIC_BSTN_CLAIM=0xdef01234567890def01234567890def012345678

✅ .env.local updated automatically!
```

---

## ✅ After Deployment

### 1. Verify on Basescan
```
https://basescan.org/address/[BSTN_ADDRESS]
https://basescan.org/address/[CLAIM_ADDRESS]
```

### 2. Set XP Snapshots (Optional for Beta)
```
# In BSTNClaim contract, call:
setSnapshot(userAddresses[], xpAmounts[])

# Example:
Users: [0xUser1, 0xUser2, 0xUser3]
XP:    [5000, 3000, 2000]
```

### 3. Rebuild Frontend
```bash
npm run build
npm start

# Visit: http://localhost:3000/claim
```

---

## 🚨 Troubleshooting

### "Private key not found"
```bash
# Check .env.local has:
PRIVATE_KEY_DEPLOYER=0x...
```

### "Not enough gas"
```bash
# Get more ETH on Base:
- Bridge from Ethereum
- Or buy on Coinbase
```

### "Compilation error"
```bash
# Make sure Solidity 0.8.20 contracts exist:
contracts/BSTN.sol
contracts/BSTNClaim.sol
```

---

## 🎯 Full Deployment Order

1. ✅ ReputationSBT (already deployed)
2. ⏳ ReputationCreditVault (Remix)
3. ⏳ CopyTradingVault (Remix)
4. ⏳ BSTN Token (Hardhat - this script)
5. ⏳ BSTNClaim (Hardhat - this script)

---

## 🚀 Ready?

**Run this command:**

```bash
npx hardhat run scripts/deploy-bstn.js --network base
```

**Or test first:**

```bash
npx hardhat run scripts/deploy-bstn.js --network baseSepolia
```

**Takes 2 minutes!** 🎉
