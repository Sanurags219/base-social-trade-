# 🚀 DEPLOY NOW - ReputationCreditVault

**Your private key is secured in .env.local**  
**Use Remix IDE for safest, simplest deployment**

---

## ✨ Why Remix?

- ✅ No private key exposure to code
- ✅ MetaMask handles signing
- ✅ Visual verification
- ✅ Takes 5 minutes
- ✅ Industry standard

---

## 🎯 QUICK START

### 1️⃣ Open Remix
```
https://remix.ethereum.org
```

### 2️⃣ Create File
```
File → New File → ReputationCreditVault.sol
```

### 3️⃣ Copy & Paste Contract
```
From: C:\Users\om\base-social-trade\contracts\ReputationCreditVault.sol
Paste all code into Remix
```

### 4️⃣ Compile
```
Solidity Compiler (left sidebar)
Select: 0.8.20
Click: Compile ReputationCreditVault.sol
✅ Wait for green checkmark
```

### 5️⃣ Deploy with Constructor Args
```
Deploy & Run Transactions (left sidebar)
Environment: Injected Provider (MetaMask)

Contract: ReputationCreditVault

Constructor Args:
  _usdc:  0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
  _rep:   0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b

Click: Deploy
Confirm: MetaMask popup
⏱️  Wait: 30 seconds - 2 minutes
```

### 6️⃣ Copy Address
```
After deployment:
"ReputationCreditVault at 0x..."

COPY THIS ADDRESS
```

### 7️⃣ Update .env.local
```
NEXT_PUBLIC_CREDIT_CONTRACT=0x[PASTE_ADDRESS_HERE]
```

### 8️⃣ Rebuild & Test
```bash
npm run build
npm start
# Visit: http://localhost:3000/credit
```

---

## ✅ That's It!

5 minutes and you're done. Your private key never leaves your MetaMask.

**Go to:** https://remix.ethereum.org

**See detailed guide:** DEPLOY_CREDIT_CONTRACT_NOW.md
