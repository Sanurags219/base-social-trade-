# 🚀 Deployment Steps - Execute Now

**Status:** Build ✅ | Contracts ✅ | Ready to Deploy

---

## Step 1: Deploy Smart Contracts (10 minutes)

### Option A: Deploy to Base Sepolia (Testnet) - RECOMMENDED FOR FIRST TIME
```
Network: Base Sepolia (chain ID 84532)
Cost: FREE (testnet)
Purpose: Test everything before mainnet
```

### Option B: Deploy to Base Mainnet
```
Network: Base Mainnet (chain ID 8453)
Cost: ~$0.20-0.50 gas
Purpose: Production live
```

### Deploy via Remix IDE (Easiest)

1. **Go to** [https://remix.ethereum.org](https://remix.ethereum.org)

2. **Create File 1: ReputationSBT.sol**
   - Copy from: `contracts/ReputationSBT.sol`
   - Paste into Remix
   - Compile with Solidity 0.8.20

3. **Create File 2: ReputationCreditVault.sol**
   - Copy from: `contracts/ReputationCreditVault.sol`
   - Paste into Remix
   - Compile with Solidity 0.8.20

4. **Create File 3: CopyTradingVault.sol**
   - Copy from: `contracts/CopyTradingVault.sol`
   - Paste into Remix
   - Compile with Solidity 0.8.20

### Deploy Order

**Deploy 1: ReputationSBT.sol**
```
Contract: ReputationSBT
Constructor Args: (none)
Result: Save this address as NEXT_PUBLIC_REP_CONTRACT
Example: 0x1234567890123456789012345678901234567890
```

**Deploy 2: ReputationCreditVault.sol**
```
Contract: ReputationCreditVault
Constructor Args:
  - USDC Address (Base): 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  - ReputationSBT Address: [PASTE ADDRESS FROM STEP 1]
  - Owner: [YOUR WALLET ADDRESS]
Result: Save as NEXT_PUBLIC_CREDIT_CONTRACT
Example: 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

**Deploy 3: CopyTradingVault.sol (Optional Test)**
```
Contract: CopyTradingVault
Constructor Args: (none)
Result: For testing only, deploy one for each trader to test
```

---

## Step 2: Update Environment Variables (1 minute)

**File:** `.env.local`

```bash
# Add these two lines:
NEXT_PUBLIC_REP_CONTRACT=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_CREDIT_CONTRACT=0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

Replace with your actual deployed contract addresses from Step 1.

---

## Step 3: Verify Contracts Work (5 minutes)

In terminal:
```bash
npm run dev
```

Visit http://localhost:3000/credit

**Verify:**
- Page loads without errors ✓
- Connect wallet works ✓
- Credit limits display (if contracts deployed correctly) ✓

---

## Step 4: Deploy Frontend (5 minutes)

### Option A: Deploy to Vercel (Recommended)

```bash
# 1. Push to GitHub
git add .
git commit -m "deploy: production ready"
git push origin main

# 2. Go to https://vercel.com
# 3. Import your GitHub repository
# 4. Deploy automatically
```

### Option B: Self-host with `npm start`

```bash
# Build once
npm run build

# Start server
npm start

# Server runs on http://localhost:3000
```

### Option C: Docker

```bash
docker build -t base-trade .
docker run -p 3000:3000 base-trade
```

---

## Step 5: Test Production (2 minutes)

**If using Vercel:**
```
https://your-project.vercel.app
```

**If self-hosting:**
```
http://localhost:3000
```

Test:
- [ ] Homepage loads
- [ ] Wallet connects
- [ ] Swap page works
- [ ] Credit page shows limits
- [ ] Leaderboard displays
- [ ] Copy trading available

---

## Step 6: Launch Beta (Week 1)

**Invite Users:**
1. Select 20 trusted users
2. Share deployment URL
3. Monitor:
   - TVL (Total Value Locked)
   - Repayment rate
   - Copy success rate

**Daily Checks:**
```
Questions to ask:
- Are trades executing?
- Are copies working?
- Any errors in console?
- Are loans being repaid?
```

---

## Contract Addresses Needed

**From Step 1, you'll need to save:**

```
NEXT_PUBLIC_REP_CONTRACT = 0x...       (ReputationSBT address)
NEXT_PUBLIC_CREDIT_CONTRACT = 0x...    (ReputationCreditVault address)
```

**Where to use:**
- `.env.local` file (for frontend to read on-chain reputation)
- Vercel environment variables (if deploying to Vercel)
- Docker environment variables (if self-hosting)

---

## Troubleshooting

### "Contract address is undefined"
- Check `.env.local` has both contract addresses
- Verify contract addresses are correct
- Rebuild: `npm run build`

### "Transaction reverted"
- Check network is Base (Sepolia for testnet, Mainnet for production)
- Verify USDC address is correct for the network
- Check owner address is correct

### "npm run dev fails"
```bash
# Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Clear cache
Remove-Item -Path .\.next -Recurse -Force

# Rebuild
npm run build

# Start
npm run dev
```

### "Build fails"
```bash
# Clear node_modules
Remove-Item -Path .\node_modules -Recurse -Force
npm install

# Rebuild
npm run build
```

---

## Success Criteria

**Before going live, verify:**

- [ ] Smart contracts deployed to Base
- [ ] Both contract addresses saved in `.env.local`
- [ ] `npm run build` succeeds (shows 14 routes ✓)
- [ ] `npm run dev` works (localhost:3000 loads)
- [ ] `/credit` page works and shows contract data
- [ ] Frontend deployed (Vercel or self-hosted)
- [ ] All routes load on production URL
- [ ] Wallet connection works on production
- [ ] Copy trading UI available
- [ ] Credit system functional

---

## Next Steps After Deployment

### Week 1-2: Beta Testing
- Run with 20 users
- Monitor daily
- Fix any bugs
- Gather feedback

### Week 2-4: Expansion
- Grow to 100 users
- Monitor TVL, repayment rate
- Implement backend trade listener
- Add reputation oracle updates

### Month 1+: Production
- Full public launch
- Active marketing
- Ongoing monitoring
- Feature upgrades

---

## Gas Costs (Testnet vs Mainnet)

**Sepolia (Free):**
- All transactions free
- Good for testing
- No real value

**Base Mainnet (Real):**
- Deploy ReputationSBT: ~$0.02
- Deploy ReputationCreditVault: ~$0.03
- Deploy CopyTradingVault: ~$0.02
- Per-user operations: ~$0.01-0.05 each
- **Total initial: ~$0.10-0.20 ETH equivalent**

---

## Quick Command Reference

```bash
# Check current location
pwd

# Enter project directory
cd C:\Users\om\base-social-trade

# Install dependencies (if needed)
npm install

# Build production
npm run build

# Start dev server
npm run dev

# Start production server
npm start

# Check for errors
npm run lint

# View git history
git log --oneline

# Commit and push
git add .
git commit -m "deploy: [description]"
git push origin main
```

---

## You're Ready! 🎉

**Current Status:**
- Build: ✅ All 14 routes
- Contracts: ✅ Ready to deploy
- Environment: ✅ Configured
- Documentation: ✅ Complete

**Next Action:** Start Step 1 - Deploy contracts to Remix

**Time to Live:** ~30 minutes

Good luck! 🚀
