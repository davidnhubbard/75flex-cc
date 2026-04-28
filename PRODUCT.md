# 75 Flex — Product & Marketing

This file captures positioning, monetization thinking, and strategic decisions.
It is a living document — update it as thinking evolves.

Related: detailed implementation/product decision history lives in `docs/decision-log.md`.

---

## Domain status

- Domain purchased: `75flex.fit`
- Remaining launch wiring:
  - attach `75flex.fit` in Vercel project domains
  - point DNS records to Vercel
  - update Supabase Auth Site URL and redirect/callback URLs to production domain(s)

---

## What this app is (positioning)

**75 Flex** is a calm, flexible habit challenge tracker. It's built for people who want the
structure and accountability of the 75 Hard challenge without the rigidity or drill-sergeant tone.

The name says it: flexible. You define your commitments, you set your pace, you own your data.

---

## Core differentiators

### 1. Your data is yours — always
Competing apps erase data when a challenge is restarted, lock photos at thumbnail size, or make
data inaccessible when a subscription lapses. 75 Flex exports everything: notes, logs, photos, and
reflection scores, in a portable format. This is a trust feature and a marketing message.

### 2. Calm, supportive tone
Not a drill sergeant. Not a hustle-culture app. The language is honest and human — "Almost quit"
not "FAILED." This is a deliberate positioning choice and must be maintained across all copy,
messages, and UI.

### 3. Flexibility (paid)
Most competitors lock users into 75 days. Custom challenge length is a paid feature that directly
justifies the app's name and differentiates it from free alternatives.

### 4. Intelligent encouragement
Messages adapt to where the user is — on track, off track, or recovering. Not a generic quote of
the day. Feeds from real data (streaks, reflection scores, log history).

---

## Competitor pain points we solve

- Data loss on challenge restart or subscription lapse
- Photos inaccessible or locked at low resolution
- Locked into exactly 75 days
- Harsh, judgmental tone
- No reflection or journaling — just checkboxes
- No way to share progress meaningfully

---

## Monetization

### Pricing (decided)
- **Free tier**: core logging, up to 4 commitments, 75-day challenge, basic export (notes + logs)
- **Paid monthly**: $7/month
- **Paid annual**: $40/year (~$3.33/month)
- **Free trial**: 2 weeks, full paid feature access
- **Challenge pass** (to consider): $12 one-time for a single full challenge run — lower commitment
  for first-timers who aren't ready for a subscription. Converts to subscription for repeat runners.

### Paid features (so far)
- Custom challenge length (B29)
- Full data export including photos (B34)
- Advanced messaging tracks (B35)
- Additional commitments beyond free tier cap

### Promotions
- 2 months free for completing a challenge (75 days, all commitments logged)
- 1 month free for Day 21 streak milestone — hits at habit-formation window when conversion
  likelihood is highest
- Referral: refer a paying friend, get a free month

### No advertising — ever
This is a firm decision. The user doing a 75-day discipline challenge is exactly the person who
will pay rather than be distracted. Ads would undermine the product's tone and signal cheapness
at the moment users are deciding whether to trust the app with something personal.

---

## Beta strategy

- Web-first. No app store during beta — too slow to iterate, forces a "done" mindset prematurely.
- Beta users get full paid feature access in exchange for structured feedback (surveys, interviews).
- Direct recruitment — Whatsapp, personal outreach. Small group (5–15 people) before any broader push.
- Key questions to answer in beta:
  - Do users actually use the reflection prompt (B31)? If not, why?
  - Do users understand the photo commitment flow?
  - Where do people drop off?
  - What do they wish existed?
- Database migrations are additive only — beta user data is never wiped.

---

## Viral / growth loops

- **Share cards** at Day 7, Day 21, Day 30, Day 75 — celebratory, branded, include a link back.
  Day 7 is highest priority: motivation is high and more people reach it than Day 75.
- **Data export as marketing**: a well-designed PDF/export of someone's 75-day journey is something
  people share. Give basic export free for this reason.
- **Referral program**: completing a challenge + referring a friend = extended free time.
- **Calendar hooks**: New Year's, Valentine's Day, back-to-school — timely milestone posts.

---

## Content & messaging philosophy

- Tone: honest, warm, matter-of-fact. Not cheerleading, not harsh.
- Messages should be short and non-blocking — never interrupt data entry flow.
- Three tracks (see B35): On track / Off track / Recovering.
- Longer term: messages that reference the user's own data ("you've shown up 14 days in a row")
  are more powerful than any generic quote.

---

## Competitive landscape

### Top competitors
| App | Platform | Price | Key weakness |
|-----|----------|-------|--------------|
| Official 75 Hard (44Seven Media) | iOS + Android | $40/year | Photos crash and disappear, no customization, backlash from $5→$40 price jump |
| 75 Days Challenge Tough & Soft | iOS | Free/paid | Weight tracker bug resets to 80 lbs daily |
| 75 Days Hard Challenge Tracker | Android | Free + ads | Ads escalate to 10+ seconds after one week, no image export |
| BeHard | Android | $13/mo or $40/yr | Confusing UX, missing advertised features |
| 75 Soft Challenge Official | iOS | Paid | Immediate paywall, no free trial |

### Top user complaints across all apps (ranked)
1. Photos disappear, crash, or are inaccessible after challenge ends — **this is our #1 differentiator**
2. No water intake tracking
3. App crashes when viewing accumulated photos
4. No widget support
5. No Apple Health / Fitbit / Strava integration
6. No customization — rigid all-or-nothing
7. No export of data or photos
8. Subscription price resentment (official app went $5 one-time → $40/year)
9. Ads that get progressively longer
10. Day counter errors and crashes that reset progress

### What users actually like
- Simple checklist interface
- Photo-based accountability (when it works)
- The 75 Soft variant is gaining traction — more sustainable, broader audience

### Gaps 75 Flex is positioned to own
- **Data ownership** — photos and notes always exportable, never lost (our strongest story)
- **Flexible challenge length** — no competitor does this well (paid feature)
- **Web-first** — nearly all competitors are mobile-only; cross-device is uncontested
- **Calm, non-punishing tone** — the market is drill-sergeant by default
- **Freemium with honest pricing** — users are burned by surprise subscription jumps

### Pricing context
- Official app: $40/year (caused backlash when raised from $5)
- BeHard: $13/month or $40/year
- Our pricing ($7/month, $40/year) is competitive — monthly is actually cheaper than BeHard
- A 2-week free trial is a differentiator — most competitors have no trial

## Target audience segmentation

Two distinct audiences, growing at different rates:

**Audience A — 75 Hard veterans** (early majority, ~50% at year 2, shrinking % at year 3+)
- Have tried 75 Hard, most have failed at least once
- Know exactly what a structured challenge is — don't need it explained
- Their pain: rigidity, forced resets, all-or-nothing rules
- Their hook: "same structure, your rules, no forced resets" — permission to not be perfect
- They arrive pre-motivated. The app just needs to not get in their way.

**Audience B — Challenge newcomers** (smaller early on, dominant long-term)
- Have never heard of 75 Hard
- Need the concept of a structured daily challenge sold to them first
- Their hook: the transformation angle — what 75 days of intentional habits does for you
- Slightly longer journey from awareness to action

**Implication for onboarding copy:**
The copy needs to work for both without alienating either. The solution is probably to lead
with the outcome/transformation (works for everyone) rather than positioning against 75 Hard
(only resonates with Audience A). The "no forced resets" differentiator can live in the flow
without requiring 75 Hard knowledge — it just reads as "flexible and forgiving" to newcomers.

**Acquisition strategy for Audience A:**
Find people who publicly failed at 75 Hard — Reddit, Instagram, TikTok. They are abundant,
self-identified, and already sold on the concept. The pitch is short: "same challenge, built for
real life."

## Open strategic questions

- Challenge pass pricing tier: does it cannibalize subscription or expand the top of funnel?
- What is the minimum viable export for the free tier? (notes + logs but not photos?)
- At what point does "calm and flexible" need to be more explicitly named in marketing copy?
- App store timing: what milestone triggers the decision to publish to iOS/Android?

## Profile IA direction (productized, post-MVP)

Decision: **Profile should be a control hub**, not a long single-page editor.

### Profile hub (`/profile`)
- Benchmark: baseline snapshot (photo, measurements, short note preview)
- Plan: commitment configuration (edited intentionally, not daily)
- Reports: gallery, insights, and export tools

Each section should be a compact card with a short explainer + CTA.

### Dedicated pages
- `/profile/benchmark`: full editor + guidance copy
- `/profile/plan`: full editor + intentional-change guidance
- `/profile/reports`: photo diary/gallery + analytics + export

Why:
- Better "what can I do here?" clarity
- Avoids long-scroll cognitive overload
- Lets reporting/gallery expand without bloating Profile

### Reporting and gallery notes
- Photo diary gallery should be mobile-first: 2-column grid
- Desktop web can become responsive wider rows (3-5 columns)
- Optional note snippet per photo card; tap opens full detail

## Personal profile expansion (full product, not MVP gate)

This is strategically strong for stickiness and personalization, but should be rolled out in phases.

### Candidate fields
- Birthday (month/day/year)
- Short bio
- Goal statement ("why this challenge matters now")
- Communication preferences
- Optional social links

### Product value
- Birthday moments (in-app celebration/message)
- Future age-aware insights/benchmarks
- Better personalization and motivational copy
- Stronger "identity + intention" commitment effect at onboarding/profile

### Guardrails
- Keep all personal fields optional at first
- Do not block core challenge logging behind profile completion
- Use progressive completion prompts (gentle nudges, not hard gates)
- Add clear privacy language near data-entry points
- Separate communication consent from core profile data

### Suggested rollout
1. Phase 1: goal statement + short bio (highest behavior impact, lowest sensitivity)
2. Phase 2: birthday + celebration moments
3. Phase 3: communication prefs + optional social links
4. Phase 4: personalized reporting/messaging based on profile data
