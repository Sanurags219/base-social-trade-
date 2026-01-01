# 🎯 Quick Deploy Summary

Deploy 3 smart contracts to Base mainnet using Remix. Takes ~10 minutes.

## Contracts to Deploy

### 1️⃣ ReputationSBT.sol
**What:** On-chain reputation storage (ERC721 SBT)  
**Copy from:** `contracts/ReputationSBT.sol`  
**Network:** Base Mainnet  
**Constructor:** No args

**After deploy:** Save address as `NEXT_PUBLIC_REP_CONTRACT`

---

### 2️⃣ ReputationCreditVault.sol
**What:** Under-collateralized lending based on reputation  
**Copy from:** `contracts/ReputationCreditVault.sol`  
**Network:** Base Mainnet  
**Constructor args:**
- `_usdc`: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- `_rep`: `0x...` (your ReputationSBT address from step 1)

**After deploy:** Save address as `NEXT_PUBLIC_CREDIT_CONTRACT`

---

### 3️⃣ CopyTradingVault.sol
**What:** Non-custodial vault for automated copy trading  
**Copy from:** `contracts/CopyTradingVault.sol`  
**Network:** Base Mainnet  
**Constructor args (for testing):**
- `_owner`: Your wallet address
- `_trader`: A test trader address
- `_admin`: Your backend admin address (can be same as owner)
- `_copyPercent`: 10

**After deploy:** Just test it, no need to save address (created dynamically in prod)

---

## How to Deploy

### Via Remix (Easiest)

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. For each contract:
   - Create new file: `FileName.sol`
   - Copy-paste contract code from `contracts/` folder
   - Compile: Solidity > 0.8.20 > Compile
   - Deploy: Set env to "Injected Provider - MetaMask"
   - Fill constructor args (if any)
   - Click Deploy
   - Confirm in MetaMask
   - Copy deployed address

---

## After Deployment

### 1. Update `.env.local`

```bash
cd C:\Users\om\base-social-trade

# Add these two lines with your deployed addresses
echo NEXT_PUBLIC_REP_CONTRACT=0xYourReputationSBTAddress >> .env.local
echo NEXT_PUBLIC_CREDIT_CONTRACT=0xYourCreditVaultAddress >> .env.local
```

### 2. Test Build

```bash
npm run build
```

Should show:
```
✓ Compiled successfully
Route (app)
├─ / (Static)
├─ /api/copy-vault (Dynamic)
├─ /api/credit (Dynamic)
├─ /api/reputation (Dynamic)
├─ /api/xp (Dynamic)
├─ /api/trader (Dynamic)
├─ /api/og/trade (Dynamic)
├─ /claim (Static)
├─ /credit (Static)
├─ /launch (Static)
├─ /leaderboard (Static)
├─ /reputation/[address] (Dynamic)
├─ /swap (Static)
└─ /trader/[address] (Dynamic)
```

### 3. Test Frontend

```bash
npm run dev
```

Visit [http://localhost:3000/credit](http://localhost:3000/credit)

Should show:
- Your credit tier (if rep > 0)
- Available credit limit
- Borrow/repay buttons

---

## Checklist

- [ ] MetaMask connected to Base
- [ ] Have 0.1+ ETH on Base (for gas)
- [ ] ReputationSBT deployed
- [ ] ReputationCreditVault deployed
- [ ] CopyTradingVault tested
- [ ] `.env.local` updated with both addresses
- [ ] `npm run build` succeeds
- [ ] `/credit` page shows correct tier & limit
- [ ] No errors in console

---

## Cost

Total gas: **~$0.10-$0.50** (depending on Base network congestion)

---

## Help

**Full guide:** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)  
**Detailed checklist:** See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)  
**Stuck?** Check troubleshooting in [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

**Next:** After deploying, update env variables and test the credit page.
