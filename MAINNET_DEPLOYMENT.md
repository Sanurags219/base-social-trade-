# 🚀 Base Mainnet Deployment Guide

**Status:** Ready for Live Deployment  
**Network:** Base Mainnet (Chain ID: 8453)  
**Date:** January 1, 2026  

---

## ✅ What's Already Deployed

| Contract | Address | Status |
|----------|---------|--------|
| ReputationSBT | `0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b` | ✅ Live |
| ReputationCreditVault | - | ⏳ Ready to Deploy |
| CopyTradingVault | - | ⏳ Ready to Deploy |

---

## 🔴 IMPORTANT - Gas Costs on Mainnet

**Real ETH Required:**
- Deploy ReputationCreditVault: ~$1-3 USD
- Deploy CopyTradingVault: ~$0.50-1 USD
- **Total: ~$2-4 USD equivalent**

**Before you deploy:**
1. ✅ Verify you have ETH on Base Mainnet
2. ✅ Double-check contract addresses are correct
3. ✅ Test gas estimates in Remix

---

## 🎯 Deploy Remaining Contracts

### Step 1: Deploy ReputationCreditVault

**Go to:** https://remix.ethereum.org

1. Create new file: `ReputationCreditVault.sol`
2. Copy contract code from: `contracts/ReputationCreditVault.sol`
3. **Compile** with Solidity 0.8.20
4. **Connect to Base Mainnet** in MetaMask
5. **Deploy** with constructor args:
   ```
   USDC (Base Mainnet): 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
   ReputationSBT Address: 0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b
   ```
6. **Save address** to `.env.local` as `NEXT_PUBLIC_CREDIT_CONTRACT`

### Step 2: Deploy CopyTradingVault

1. Create new file: `CopyTradingVault.sol`
2. Copy contract code from: `contracts/CopyTradingVault.sol`
3. **Compile** with Solidity 0.8.20
4. **Connect to Base Mainnet**
5. **Deploy** (no constructor args needed)
6. **Save address** to `.env.local` as `NEXT_PUBLIC_COPY_VAULT_CONTRACT`

---

## 🔧 Constructor Arguments Reference

### ReputationCreditVault Constructor

```solidity
constructor(address _usdc, address _rep)
```

**Arguments to provide in Remix:**
1. **_usdc** (USDC token address):
   - Base Mainnet: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
   
2. **_rep** (ReputationSBT address):
   - Already deployed: `0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b`

**Example in Remix:**
```
0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b
```

### CopyTradingVault Constructor

```solidity
constructor(address _owner, address _trader, address _admin, uint256 _copyPercent)
```

**For testing, you can use:**
- _owner: `0x22E228AdE324185123A54Ad25F3459a99CF51E7a`
- _trader: `0x22E228AdE324185123A54Ad25F3459a99CF51E7a`
- _admin: `0x22E228AdE324185123A54Ad25F3459a99CF51E7a`
- _copyPercent: `20` (copy 20% of balance)

---

## 📋 Deployment Checklist

**Before Deployment:**
- [ ] MetaMask connected to Base Mainnet (Chain ID 8453)
- [ ] Have ETH for gas (at least 0.01 ETH)
- [ ] ReputationSBT address saved: `0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b`
- [ ] USDC address verified: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

**During Deployment:**
- [ ] Open Remix IDE
- [ ] Paste ReputationCreditVault.sol
- [ ] Compile with 0.8.20
- [ ] Connect to Base Mainnet
- [ ] Enter correct constructor args
- [ ] Deploy & wait for confirmation
- [ ] Copy contract address

**After Deployment:**
- [ ] Save both new contract addresses to `.env.local`
- [ ] Verify in blockchain explorer
- [ ] Test contract interactions

---

## ✅ After Deployment

### Update .env.local

Once deployed, add to `.env.local`:

```bash
NEXT_PUBLIC_CREDIT_CONTRACT=0x[YOUR_CREDIT_VAULT_ADDRESS]
NEXT_PUBLIC_COPY_VAULT_CONTRACT=0x[YOUR_COPY_VAULT_ADDRESS]
```

### Verify on Explorer

Check your contracts are live:
- https://basescan.org

Search for each contract address to verify:
- Code is present
- Functions are callable
- Events are emitting

### Test Frontend

```bash
npm run build
npm start
```

Visit: http://localhost:3000/credit

Verify the credit page loads and shows your contract data.

---

## 🔗 Base Mainnet Resources

- **Block Explorer:** https://basescan.org
- **RPC Endpoint:** https://mainnet.base.org
- **Faucet:** Not needed (mainnet requires real ETH)
- **Chain ID:** 8453
- **USDC Address:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

---

## 🚨 Safety Checklist

Before each deployment, verify:

- [ ] You're on **Base Mainnet** (not testnet)
- [ ] Contract code is **correct** (copy from `/contracts/`)
- [ ] Constructor args are **correct**
- [ ] Gas estimation looks **reasonable** (<$5 for deployment)
- [ ] You have **sufficient ETH** for gas
- [ ] Private key is **secure** (.env.local only)

---

## 💰 Estimated Gas Costs

| Operation | Gas | Cost (ETH) | Cost (USD) |
|-----------|-----|-----------|-----------|
| Deploy ReputationCreditVault | ~150k | ~0.001 | $2-3 |
| Deploy CopyTradingVault | ~100k | ~0.0007 | $1-2 |
| **Total** | ~250k | ~0.0017 | **$3-5** |

*Prices vary with network congestion. Check Remix for actual estimates.*

---

## 🎯 Next Steps

1. **Deploy ReputationCreditVault** to Base Mainnet
2. **Deploy CopyTradingVault** to Base Mainnet
3. **Update .env.local** with new addresses
4. **Rebuild frontend** (`npm run build`)
5. **Deploy frontend** to Vercel or self-host
6. **Launch to users!**

---

## ⚠️ Important Notes

- **All transactions are final** - no undo on mainnet
- **Save all addresses** - you'll need them later
- **Private key is secure** - only in `.env.local`
- **Test thoroughly** - small bugs cost real money
- **Monitor contracts** - watch for errors/issues

---

## 🆘 If Something Goes Wrong

1. **Transaction failed?**
   - Check gas estimation
   - Verify constructor args
   - Try again with more gas

2. **Contract won't deploy?**
   - Check Solidity version (must be 0.8.20)
   - Verify all imports work
   - Check for compilation errors

3. **Lost contract address?**
   - Check MetaMask transaction history
   - Search your wallet on Basescan
   - Check browser console for error messages

---

**Ready to deploy? Let's go! 🚀**
