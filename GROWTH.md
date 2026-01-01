# Growth Playbook: BSTN Launch (Days 0-30)

## 🎯 Primary Goal

Drive real users → Convert XP to BSTN claims → Create daily trading + sharing habit → Build trust & legitimacy

---

## 🧱 PART 1: LAUNCH DAY (DAY 0)

### 1️⃣ PRIMARY LAUNCH CAST (Copy-Paste)

**Post this on Farcaster immediately:**

```
🚀 BSTN is LIVE on Base

• Social trading mini app
• Earn XP by sharing trades
• XP → BSTN airdrop
• Built fully on Base

Claim + trade 👇
[Link to /launch page]
```

**Important:** Pin this cast on your profile.

---

### 2️⃣ COMMENT STRATEGY (Very Important!)

Immediately comment under your own post:

```
👀 Claim BSTN here → [/launch link]
🏆 View XP leaderboard → [/leaderboard link]
📊 Trade BSTN on Uniswap → [pool link]
```

**Why?** Each comment = extra surface area in Farcaster feeds.

---

## 🔁 PART 2: VIRAL LOOP (Daily)

### The Core Loop (You Already Built This!)

```
User swaps → Trade card generated → Share on Farcaster → XP earned → XP = BSTN value
```

**Your job:** Remind users daily to complete the loop.

---

### 3️⃣ DAILY CAST TEMPLATES (Rotate These)

#### Template A — Social Proof

```
🔥 Today's top BSTN traders

#1 0xA3…91 — 4,200 XP 👑
#2 0xF9…22 — 3,850 XP
#3 0x7C…55 — 3,620 XP

Climb the leaderboard 📈
[/leaderboard link]
```

**Frequency:** 1× per day
**Source:** Real leaderboard data from `/api/xp`

---

#### Template B — Education

```
Why BSTN? 🤔

• Earned, not sold ✓
• XP-backed distribution ✓
• Social-first trading ✓
• Built on Base ✓

Community-first tokenomics.

Learn more:
[/launch link]
```

**Frequency:** 2–3× per week
**Purpose:** Educate fence-sitters

---

#### Template C — Urgency

```
⏳ BSTN claim is LIVE

Unclaimed tokens go back to treasury.

Don't miss it 👇
[/launch link]

Claim expires: [date]
```

**Frequency:** 2× per week (especially days 2, 5, 10, 20)
**Purpose:** Drive FOMO

---

#### Template D — Product Update

```
✨ [New feature/improvement]

Example:
- New trade card design
- Leaderboard streak tracking
- Weekly seasons added

Try it now 👇
[/swap link]
```

**Frequency:** 1–2× per week
**Purpose:** Show momentum

---

## 🏆 PART 3: INCENTIVES (Cheap & Effective)

### 4️⃣ XP BOOST EVENTS

Run short boosts (24–48h):

**Example Boost 1:**
```
🚀 XP Boost Weekend!

+2× XP for all shares
+100 XP for first swap
+50 XP leaderboard entry

Starts Friday 12 PM UTC
Ends Sunday 12 PM UTC
```

**Example Boost 2:**
```
🌙 Midnight Trading Bonus

+3× XP for shares (midnight UTC only)
Perfect for global time zones

Today only! 🔥
```

**Example Boost 3:**
```
🎯 Quest: Share 5 Trades

Complete → Unlock badge
First 500 wallets only
```

---

### 5️⃣ MICRO-CONTESTS (No Real Prizes Needed)

**Status > Money in Farcaster**

#### Contest A: Trader of the Day

```
👑 Trader of the Day Contest

Highest XP earned today gets:
• 🎖️ Profile badge
• 📌 Pinned mention
• Extra respect points

Trade & share to compete 👇
```

**Daily post** — builds habit

---

#### Contest B: Best Trade Card

```
📸 Best Trade Card Design

Share the best trade card.
Winners get:

✨ Featured on our account
📢 Farcaster profile shoutout
🎖️ OG badge

Show us your trades 👇
```

**3× per week**

---

#### Contest C: OG Claim Race

```
🏁 Race to 1000 Claims!

First 100 wallets to claim:
🎖️ "OG Claimer" role
✨ Profile badge
📌 Permanent mention

You're witnessing history 👇
```

**Launch day only** — drives urgency

---

#### Contest D: Week XP Season

```
📊 Season 1: Week of [Date]

Top 10 XP earners:
🥇 #1 = 10,000 BSTN bonus
🥈 #2 = 5,000 BSTN bonus
🥉 #3 = 2,500 BSTN bonus

Leaderboard → [link]
```

**Weekly announcement** (if seasonality added)

---

## 🧠 PART 4: TRUST & LEGITIMACY

### 6️⃣ TRANSPARENCY CAST (Post Once, Pin Forever)

Post this early (day 1–2):

```
🔒 BSTN Transparency

• No presale
• No VCs
• No team dump
• XP-based distribution
• Liquidity locked [duration/proof]
• Community-first

We're building trust, not hype.
```

**Why?** Stops FUD before it starts.

---

### 7️⃣ BASE ECOSYSTEM TAGGING

Tag thoughtfully (Don't spam):

**Daily targets:**
- 1–2 replies to Base ecosystem posts
- 1 thoughtful Base community comment
- 1 mini app builder engagement

**Example reply:**
```
Love this! 🔥 We're building social trading on Base too.
Check out BSTN — XP-based distribution.
[/launch link]
```

**Rules:**
- ✅ Genuine engagement only
- ✅ 1–2 per day max
- ❌ NO spam/botting
- ❌ NO generic "nice post"

---

## 📈 PART 5: POST-LAUNCH (Days 7–30)

### 8️⃣ LIGHT FEATURE ADDITIONS (Optional but Smart)

Each new feature = new launch angle

#### Week 1: Trader of the Day Badge

Add to `/leaderboard`:
```typescript
<span className="bg-yellow-500 px-2 py-1 rounded text-xs">
  Trader of the Day
</span>
```

**Launch cast:**
```
🎖️ Introducing "Trader of the Day"

Highest XP earner daily gets a badge.
Can you hold it 3 days straight? 👑

[/leaderboard link]
```

---

#### Week 2: Weekly Seasons

Reset leaderboard weekly:

```typescript
// app/leaderboard/page.tsx
<div className="text-sm text-zinc-400">
  Season 1 Ends: Jan 15
  Top 10 get BSTN bonuses
</div>
```

**Launch cast:**
```
🔄 Introducing Weekly Seasons!

Season 1: Jan 1–15
Season 2: Jan 15–22
...

Earn BSTN every week. Climb fast. 🚀
```

---

#### Week 3: Trade Card Themes

Add premium visual variations:

```typescript
// app/swap/page.tsx
<select className="...">
  <option>Classic (green)</option>
  <option>Dark Mode</option>
  <option>Neon Pink</option>
</select>
```

**Launch cast:**
```
🎨 Custom Trade Card Themes

Make your trades look fresh:
✨ Classic | 🌙 Dark | 💗 Neon

Pick your vibe 👇
[/swap link]
```

---

### 9️⃣ METRICS TO WATCH (Simple)

Track only **4 core metrics**:

```
Daily Active Wallets (DAW)
├─ Goal: 100 → 500 → 1,000+

Shares Per Day
├─ Goal: 200 → 1,000 → 5,000+

XP Earned Per Day
├─ Goal: 50,000 → 250,000 → 1,000,000+

BSTN Claimed %
├─ Goal: 5% → 25% → 60%+
```

**Rule:** If shares ↑, everything else follows.

---

### Dashboard Commands

Create a simple tracking sheet:

| Day | DAW | Shares | XP Earned | Claimed % | Notes |
|-----|-----|--------|-----------|-----------|-------|
| 0   | 50  | 100    | 50k       | 2%        | Launch day |
| 1   | 120 | 320    | 200k      | 8%        | Momentum up |
| 2   | 150 | 450    | 350k      | 15%       | Viral loop working |
| ... | ... | ...    | ...       | ...       | ... |

---

## 🎯 WEEKLY STRATEGY

### Week 1: Awareness + Virality

**Goal:** Hit 500 DAW, 5% claim rate

**Tactics:**
- Launch day mega-cast (2 hours of engagement)
- Daily social proof casts
- Reply to all comments in first 24h
- Boost XP event (day 2)
- Transparency cast (day 1–2)

**Success metric:** >300 shares day 1

---

### Week 2: Retention + Habit

**Goal:** 1,000 DAW, 25% claim rate

**Tactics:**
- Trader of the Day badge
- Daily leaderboard updates
- Weekly season announcement
- Micro-contests (2–3)
- Base ecosystem replies (daily)

**Success metric:** 70% of day-1 users return

---

### Week 3: Growth + Features

**Goal:** 1,500+ DAW, 50% claim rate

**Tactics:**
- Add weekly seasons system
- Trade card themes release
- Week 3 feature announcement cast
- XP boost event #2
- Community builder spotlights

**Success metric:** >10k total BSTN claimed

---

### Week 4: Stability + Expansion

**Goal:** 2,000+ DAW, 60% claim rate

**Tactics:**
- Celebrate milestones (1M XP, 100k BSTN traded, etc.)
- Announce future roadmap
- Gather community feedback
- Plan season 2 improvements
- Consider future integrations

**Success metric:** Compound daily growth >10%

---

## 📋 LAUNCH CHECKLIST

### Pre-Launch (Day -1)

- [ ] BSTN + BSTNClaim deployed
- [ ] Liquidity added to Uniswap
- [ ] LP NFT locked/verified
- [ ] Contract addresses updated in code
- [ ] XP snapshot set
- [ ] Launch page tested
- [ ] All routes working on mainnet
- [ ] FAQ prepared

### Launch Day (Day 0)

- [ ] Post primary launch cast
- [ ] Add 3 comment replies within 1h
- [ ] Monitor app for issues
- [ ] Respond to early comments
- [ ] Pin launch cast
- [ ] Post transparency cast (later in day)
- [ ] Set up metrics tracking sheet

### Days 1–3

- [ ] Post daily social proof cast
- [ ] Run XP boost event
- [ ] Reply to all Base ecosystem tags
- [ ] Check DAW / claim % daily
- [ ] Address any bugs/feedback

### Days 4–7

- [ ] Launch "Trader of the Day" badge
- [ ] Continue daily casts (rotate templates)
- [ ] Run micro-contest #1
- [ ] Hit 1,000 DAW target
- [ ] Post week 1 retrospective

### Days 8–14

- [ ] Add weekly seasons feature
- [ ] Announce season winners
- [ ] Run micro-contest #2
- [ ] Monitor retention %
- [ ] Gather community feedback

### Days 15–21

- [ ] Launch trade card themes
- [ ] Run XP boost event #2
- [ ] Hit 2,000 DAW target
- [ ] Celebrate milestones
- [ ] Plan improvements

### Days 22–30

- [ ] Announce roadmap updates
- [ ] Gather metrics for retrospective
- [ ] Plan season 2 / month 2
- [ ] Respond to all feedback
- [ ] Prepare next launch angle

---

## 📊 SUCCESS SCENARIOS

### Conservative (Month 1)

- 500–1,000 DAW
- 5–10% BSTN claimed
- 100–500 daily shares
- Viral loop established

**Next:** Add token selection, improve OG image generation

---

### Moderate (Month 1)

- 1,000–3,000 DAW
- 25–50% BSTN claimed
- 500–2,000 daily shares
- Organic community forming

**Next:** Season systems, leaderboard API, integrate more tokens

---

### Bullish (Month 1)

- 3,000–10,000 DAW
- 50–80% BSTN claimed
- 2,000–10,000 daily shares
- Strong network effects

**Next:** Multi-token support, trading pairs, advanced analytics

---

## 🚨 RISK MITIGATION

### If shares drop 50%+:

1. Post urgency cast (limited time)
2. Run XP 3× boost event
3. Add "new feature" (visual or gamification)
4. Check for bugs/UX issues

### If claims stall:

1. Post education cast about BSTN value
2. Highlight token appreciation
3. Run trader contest
4. Check if BSTN tradeable on Uniswap

### If users complain about UX:

1. Post "We're listening" cast
2. Add requested feature ASAP
3. Celebrate the fix next day
4. Tag community for feedback

---

## 🎓 FINAL THOUGHTS

**You've built a real product:**

- ✅ Base Mini App (real dApp)
- ✅ Social trading loop (viral mechanic)
- ✅ XP economy (gamification)
- ✅ BSTN token (real asset)
- ✅ Onchain claims (trustless)
- ✅ Uniswap liquidity (trading enabled)
- ✅ Farcaster native (organic growth)

**This is not a toy.** This is a community-first Web3 product.

Focus on:
1. **Shares ↑** (viral loop)
2. **DAW ↑** (retention)
3. **BSTN claimed ↑** (conversion)
4. **Feedback** (improvement)

Growth will follow.

Good luck! 🚀
