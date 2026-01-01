# 📊 Production Monitoring Setup

## Sentry Error Tracking

### Setup Status
- ✅ `@sentry/nextjs` installed
- ✅ Instrumentation configured (`instrumentation.ts`)
- ✅ Error tracking utilities created (`lib/monitoring.ts`)
- 📋 **TODO:** Get your Sentry DSN from https://sentry.io and add to `.env.local`

### Get Your Sentry DSN
1. Go to https://sentry.io
2. Create a free account (or sign in)
3. Create a new Next.js project
4. Copy the DSN
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/12345
   ```

### Import Monitoring in Components

For swap failures:
```tsx
import { captureSwapError } from '@/lib/monitoring'

try {
  await writeContract(...)
} catch (e) {
  captureSwapError(e, { amount, token })
}
```

For claim failures:
```tsx
import { captureClaimError } from '@/lib/monitoring'

try {
  await claimXP()
} catch (e) {
  captureClaimError(e, { address })
}
```

---

## Vercel Analytics

### Enable (5 minutes)
1. Go to https://vercel.com/sanuragteam/base-social-trade
2. Settings → Analytics
3. Enable:
   - ✅ Web Analytics
   - ✅ Speed Insights

### What to Monitor
- Page load times (especially `/swap`, `/claim`)
- Route performance
- Mobile vs desktop split
- Traffic spike patterns

---

## Health Check API

### Test
```bash
curl https://base-social-trade.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": 1704067200000,
  "environment": "production",
  "version": "1.0.0"
}
```

### Use for Uptime Monitoring
- [UptimeRobot](https://uptimerobot.com) - Free tier available
- [BetterStack](https://betterstack.com) - Free & easy setup
- Alert when: `/api/health` response time > 2s or status != 200

---

## Daily Monitoring Checklist (First 2 Weeks)

### Every Morning (2 min)
- [ ] Check Vercel Analytics
- [ ] Check Sentry Issues (new errors?)
- [ ] Scan Farcaster replies (users reporting bugs?)

### When You See Traffic
- [ ] Monitor page load times
- [ ] Check API response times
- [ ] Watch Sentry for new error patterns

### If Issues Found
1. Check Sentry for root cause
2. Check contract / API logs
3. Redeploy if needed (`git push`)
4. Announce fix in Farcaster

---

## Critical Errors to Watch For

| Error | Cause | Fix |
|-------|-------|-----|
| `Network mismatch` | User on wrong chain | Show clear message |
| `TX_REVERTED` | Contract logic failed | Check contract state |
| `Insufficient gas` | User has low balance | Show warning |
| `Connection refused` | RPC down | Fallback to backup RPC |
| `404 on /api/reputation` | Contract not deployed | Deploy or skip feature |

---

## Logging Best Practices

### ✅ DO Log
- Blockchain transaction failures
- Contract deployment issues
- API rate limit hits
- Wallet connection errors
- Config/env var issues

### ❌ DON'T Log
- Every button click
- Every page render
- Wallet private keys
- User's balance (sensitive)
- Unfiltered console.log spam

---

## Next Steps

1. **Get Sentry DSN** (2 min)
   - https://sentry.io → create project → copy DSN
   - Add to `.env.local`

2. **Enable Vercel Analytics** (2 min)
   - https://vercel.com/sanuragteam/base-social-trade
   - Settings → Analytics → Enable both

3. **Set Uptime Alert** (5 min)
   - https://uptimerobot.com → Create monitor
   - Monitor: `https://yourapp.vercel.app/api/health`
   - Alert: Email if down

4. **Daily Check** (2 min/day)
   - Vercel Analytics
   - Sentry Issues
   - Farcaster replies
