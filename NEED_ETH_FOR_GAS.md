# ⛽ Need ETH for Gas - Quick Fix

Your deployment wallet has **0.001 ETH** but needs **0.005 ETH minimum** for contract deployment.

## 🚨 Problem
```
Deployer: 0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b
Balance: 0.001239904497991594 ETH  ❌ NOT ENOUGH
Required: 0.005 ETH                  ✅ For deployment
```

---

## ✅ Solution: Get Base ETH

### Option 1: Bridge from Ethereum (Recommended)
1. Go to https://bridge.base.org
2. Connect MetaMask
3. Transfer 0.1 ETH from Ethereum to Base
4. Select your address: **0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b**
5. Wait ~2 minutes for confirmation

### Option 2: Buy on Coinbase & Withdraw
1. Open Coinbase app
2. Buy 0.1 ETH
3. Go to "Send/Receive"
4. Send to: **0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b**
5. Select "Base" network
6. Wait 2-5 minutes

### Option 3: Trade on Uniswap Base
1. Visit https://app.uniswap.org
2. Switch to Base network
3. Trade USDC/other tokens for ETH
4. Withdraw to your wallet

---

## 📋 Your Deployment Address
```
0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b
```

**Save this!** Use it whenever you need to send funds for deployment.

---

## ⏱️ Once You Have ETH

Run deployment again:
```bash
npx hardhat run scripts/deploy-bstn.js --network base
```

Or use direct deployment:
```bash
node scripts/deploy.mjs
```

---

## 💡 Why You Need ETH

Smart contract deployments cost gas:
- BSTN token: ~$0.50-$1.00
- BSTNClaim: ~$0.50-$1.00
- Ownership transfer: ~$0.10-$0.20
- **Total: ~$1-$2.50 USD**

Base is extremely cheap (100x cheaper than Ethereum), so even 0.01 ETH covers everything!

---

## ✨ Next: After Getting ETH

1. **Get 0.1 ETH on Base**
2. **Run deployment:**
   ```bash
   node scripts/deploy.mjs
   ```
3. **Script will:**
   - Deploy BSTN token
   - Deploy BSTNClaim
   - Auto-update .env.local
   - Show contract addresses

**Est. Time: 3-5 minutes** ⚡
