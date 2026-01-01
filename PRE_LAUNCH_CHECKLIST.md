# 🚀 Pre-Launch Checklist

## ✅ Infrastructure (DONE)

- [x] App deployed to Vercel
- [x] GitHub connected for auto-deploy
- [x] Farcaster mini app metadata configured
- [x] Farcaster icon created
- [x] Home redirect to /swap
- [x] Edge runtime on critical APIs
- [x] Health check API (`/api/health`)
- [x] Sentry error tracking installed
- [x] Error utilities created

## ⏳ Pre-Launch Tasks (DO NOW)

### Task 1: Complete Sentry Setup (5 min)
- [ ] Go to https://sentry.io
- [ ] Create account / sign in
- [ ] Create new Next.js project
- [ ] Copy DSN
- [ ] Add to `.env.local`:
  ```
  NEXT_PUBLIC_SENTRY_DSN=your-dsn-here
  ```
- [ ] Run: `git add .env.local` (confirm it's in .gitignore)
- [ ] Redeploy to Vercel

### Task 2: Enable Vercel Analytics (2 min)
- [ ] Go to https://vercel.com/sanuragteam/base-social-trade
- [ ] Settings → Analytics
- [ ] Enable Web Analytics
- [ ] Enable Speed Insights
- [ ] Bookmark the Analytics dashboard

### Task 3: Set Uptime Alert (5 min)
- [ ] Go to https://uptimerobot.com (free account)
- [ ] Create new monitor
  - URL: `https://base-social-trade.vercel.app/api/health`
  - Check interval: 5 minutes
  - Alert email: your email
- [ ] Test the endpoint manually:
  ```
  curl https://base-social-trade.vercel.app/api/health
  ```

### Task 4: Create Monitoring Routine
- [ ] Bookmark https://vercel.com/sanuragteam/base-social-trade/analytics
- [ ] Bookmark https://sentry.io (your project)
- [ ] Set daily reminder: "Check monitoring dashboards"
- [ ] Plan: Review every morning (2 min) first 2 weeks

### Task 5: Deploy Remaining Contracts (Via Remix)
- [ ] ReputationCreditVault
  - Go to https://remix.ethereum.org
  - Network: Base Mainnet
  - Constructor: USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913) + ReputationSBT (0x0F2347309AE2d5D3AC4e92F251C6bE00D0a0A57b)
  - Copy address → add to MONITORING.md & .env.local
- [ ] CopyTradingVault
  - Same process, no constructor args
  - Copy address

### Task 6: Fund Credit Vault
- [ ] Get $1,000 USDC on Base (bridge from Ethereum)
- [ ] Approve vault for USDC spending
- [ ] Deposit 1,000 USDC

## 🎯 Soft Launch (5-10 Friends)

**Share this link:**
```
https://base-social-trade.vercel.app

Or try the Farcaster deep link:
farcaster://miniapps/open?url=https://base-social-trade.vercel.app
```

**Ask them to test:**
- [ ] Wallet connects
- [ ] Swap works (small amount)
- [ ] Share trade UI is intuitive
- [ ] Claim page loads
- [ ] Report any bugs

**Monitor:**
- [ ] Check Sentry for errors
- [ ] Watch Vercel Analytics for load times
- [ ] Scan replies for bug reports

## 🌍 Public Launch (Farcaster)

**When soft launch is good:**

1. Create launch cast:
```
🚀 BSTN Social Trade is LIVE on Base

• Connect wallet & swap ETH → BSTN
• Share trades → earn XP instantly
• Build onchain reputation
• Unlock credit lines

Try it in Farcaster or mobile:
farcaster://miniapps/open?url=https://base-social-trade.vercel.app

Or visit: https://base-social-trade.vercel.app
```

2. Pin the cast

3. Share in communities:
- Farcaster channels
- Base community Discord
- Twitter/X

## 🛡️ Safety Checks

Before announcing:
- [ ] Sentry has no critical errors
- [ ] Health check responds < 1s
- [ ] No contract reverts in testing
- [ ] Wallet connects reliably
- [ ] Error messages are clear
- [ ] Rate limiting is working (if implemented)

## 📋 First 48 Hours

### Hour 0-1 (Launch)
- Announce on Farcaster
- Share link with friends
- Monitor Sentry

### Hour 1-24 (Day 1)
- Check Vercel Analytics daily
- Monitor Sentry for errors
- Fix any urgent bugs
- Speed > perfection

### Hour 24-48 (Day 2)
- Review analytics
- Analyze user patterns
- Plan next feature
- Post update cast

## 🎊 Success Metrics (Track After 48h)

- [ ] 10+ unique visitors
- [ ] 5+ transactions
- [ ] < 500ms page load time
- [ ] 0 critical Sentry errors
- [ ] No downtime

---

## Emergency Procedures

If app goes down:
1. Check `/api/health` endpoint
2. Check Vercel deployments
3. Check Sentry for errors
4. Redeploy: `git push origin main`
5. Announce status on Farcaster

If many claim failures:
1. Check contract state in Etherscan
2. Check USDC balance in vault
3. Pause contract if needed
4. Announce fix ETA

---

**Ready to launch? Go through Task 1-3 above, then share with your beta group! 🚀**
