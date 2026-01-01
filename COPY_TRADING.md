# Copy Trading Feature

## 🔄 What is Copy Trading?

Copy trading lets users discover and replicate trades from top traders on the leaderboard.

**Flow:**
1. User browses leaderboard
2. Clicks "View →" to see trader profile
3. Sees trader stats (XP, trades, followers)
4. Clicks "Copy Trade"
5. Gets redirected to swap page with trader context
6. Both users earn XP

---

## 📋 Features

### Trader Profile Page (`/trader/[address]`)

Shows individual trader statistics:
- **Total XP** - How much activity
- **Trades** - Number of swaps executed
- **Followers** - Users copying their trades
- **Copy Trades** - Trades copied by others

**Actions:**
- Copy Trade button (redirect to swap with context)
- Back to leaderboard link

---

### Leaderboard Integration

Updated leaderboard shows:
- **Rank** - Position on board
- **Address** - Trader wallet
- **XP** - Total earned
- **View →** - Link to profile (new)

---

### Copy-Trade Context

When user clicks "Copy Trade", swap page shows:
- Purple banner: "Copying trades from 0xA3…91"
- Normal swap flow proceeds
- Tracks the copy relationship

---

## 💰 XP Rewards (Copy Trading)

| Action | XP | Notes |
|--------|-----|-------|
| Copy a trade | +25 XP | User who copies |
| Trader gets copied | +15 XP | Original trader |
| First copy of day | +50 XP | Bonus for first copy |

**Example:**
- User A trades ETH → USDC
- User B copies User A's trade
- User B: +25 XP (for copying)
- User A: +15 XP (for being copied)
- Total: 40 XP created per copy

---

## 🔗 API Endpoints

### GET `/api/trader?address=0x...`

Returns trader statistics:

```json
{
  "address": "0x123...",
  "xp": 4200,
  "trades": 37,
  "followers": 128,
  "copiedTrades": 12
}
```

**Currently:** Mock data (randomized)
**TODO:** Query real database

---

## 🛣️ User Journeys

### Discovery Path
```
Home → Leaderboard → Trader Profile → Copy Trade → Swap → Share
                                                          ↓
                                                        +XP
```

### Network Effects
```
Top traders earn followers
→ More copy trades
→ More XP for top traders
→ More incentive to stay active
→ Viral loop
```

---

## 🚀 Why This Matters

### For Users
- **Discovery:** Find skilled traders
- **Engagement:** Follow traders you trust
- **Network:** Build social graph
- **Rewards:** Earn XP from copying

### For Traders
- **Influence:** Build follower base
- **Reputation:** Become known
- **Income:** Future fee opportunities
- **Motivation:** Get copied = earn XP

### For Platform
- **Network Effects:** Social graph
- **Engagement:** Copy trading drives activity
- **Discovery Engine:** Leaderboard becomes social
- **Monetization:** Future: take fees on copies (0.5%)

---

## 📊 Next Steps

### MVP (Now)
✅ Trader profiles
✅ Copy-trade context
✅ Leaderboard integration
✅ XP rewards

### Phase 2 (Week 2)
- [ ] Real database for stats
- [ ] Copy history page
- [ ] Trader follow button
- [ ] Notification when copied

### Phase 3 (Week 3)
- [ ] Copy trade PnL tracking
- [ ] Trader performance metrics
- [ ] Fee system (0.5% on copies)
- [ ] Trading pairs selection

### Phase 4 (Month 2)
- [ ] Copy automation (websocket)
- [ ] API for traders
- [ ] Trader dashboard
- [ ] Advanced analytics

---

## 🔐 Security

**Current:** Mock data (no real risk)

**Post-Launch Checklist:**
- [ ] Validate address format
- [ ] Rate limit copy requests
- [ ] Prevent self-copies
- [ ] Audit copy-to-XP mapping
- [ ] Monitor for gaming

---

## 💡 Creative Ideas

**Short-term:**
- "Trader Spotlight" daily cast (feature top copier)
- "Copy King" badge for most-copied trader
- Weekly copy leaderboard (separate from XP)

**Medium-term:**
- Team/syndicate trading (copy multiple traders)
- Copy trade contests ("Most successful copies this week")
- Trader tokens (future governance)

**Long-term:**
- Algorithmic copy trading (follow strategy, not trader)
- Derivatives on trader performance
- NFT "verified trader" badges

---

## 📚 Files Updated

- [app/trader/[address]/page.tsx](../app/trader/[address]/page.tsx) - Trader profile
- [app/api/trader/route.ts](../app/api/trader/route.ts) - Trader stats API
- [app/swap/page.tsx](../app/swap/page.tsx) - Copy-trade context banner
- [app/leaderboard/page.tsx](../app/leaderboard/page.tsx) - Added "View →" links

---

## Success Metrics

Track these after launch:

| Metric | Week 1 Target | Month 1 Target |
|--------|---------------|----------------|
| Total copies | 100 | 5,000 |
| Avg copies/user | 0.5 | 2.5 |
| Repeat copiers | 10% | 40% |
| Trader followers | 5/trader | 25/trader |

**If copies ↑, DAW and shares ↑.**
