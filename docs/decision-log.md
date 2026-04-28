# 75 Flex Decision Log

Purpose: a lightweight history of key product/UX decisions and why we made them.

Format:
- `Date`
- `Decision`
- `Why`
- `Impact / Follow-up`

---

## 2026-04-27

### D-001: Profile IA split into hub + dedicated pages
- Decision: Keep `/profile` as a control hub and move full workflows into dedicated pages:
  - `/profile/benchmark`
  - `/profile/plan`
  - `/profile/reports`
  - `/profile/personal` (placeholder first, then V1 form)
- Why: the old single-page profile was becoming long and unclear; users need immediate “what can I do here?” clarity.
- Impact / Follow-up: enables independent growth of reporting and personal profile without bloating hub UX.

### D-002: Restart challenge moved from Profile hub to Plan page Danger Zone
- Decision: remove restart from main Profile hub and place in `/profile/plan` under a clearly labeled Danger Zone.
- Why: restart is destructive/high-anxiety and is most contextually related to plan changes.
- Impact / Follow-up: lower accidental taps; still keeps reset discoverable during meaningful plan edits.

### D-003: Photo diary gallery implemented under Reports
- Decision: launch first gallery at `/profile/reports/gallery` with mobile-first two-column grid and detail sheet on tap.
- Why: fulfills pictorial diary need and keeps “reporting” capabilities grouped in one location.
- Impact / Follow-up: future additions include filters (with notes / by commitment), exports, and trend views.

### D-004: Note and photo cards aligned to shared state-color language
- Decision: use same `none / partial / complete` visual state palette for note/photo-adjacent progress cards.
- Why: users need consistent color semantics across cards; ad hoc styling caused confusion.
- Impact / Follow-up: documented in brand guide under cross-card state consistency.

### D-005: Note preview compactness
- Decision: note card shows one-line preview + `More`; full edit remains in sheet.
- Why: prevent long notes from consuming Today page real estate and hurting scanability.
- Impact / Follow-up: keep editing discoverable by card tap, avoid extra helper lines unless needed.

### D-006: Progressive profiling strategy
- Decision: onboarding stays lightweight (preferred name first), richer fields collected later via optional prompts.
- Why: reduce onboarding friction while still enabling personalization and CRM features over time.
- Impact / Follow-up: staged rollout for full name, birthday, goals/bio, social links, contact consent.

### D-007: Minimum commitment rule tightened
- Decision: require at least 2 commitments excluding Photo.
- Why: Photo alone should not satisfy plan minimum; core behavior requires meaningful non-photo commitments.
- Impact / Follow-up: enforced in onboarding and runtime redirect guard to Plan for legacy/bad data.

### D-008: Production domain acquired (`75flex.fit`)
- Decision: standardize public launch identity on `75flex.fit`.
- Why: beta/public promotion needs a stable, brand-aligned domain rather than preview/temporary URLs.
- Impact / Follow-up: complete Vercel domain attach + DNS routing, then update Supabase Auth Site URL and redirect/callback URLs to production domain(s).

### D-009: Commitment category names locked to canonical labels
- Decision: use one canonical human-readable name per system category and stop supporting legacy/custom title drift.
- Why: user-defined name artifacts caused confusion ("display name" vs category meaning) and inconsistent UI language.
- Impact / Follow-up: canonical names are now source-of-truth in `web/src/lib/categories.ts`; legacy names are normalized on fetch and persisted back to `commitments.name`.
  - `physical` -> `Physical Activity`
  - `nutrition` -> `Nutrition`
  - `hydration` -> `Water Intake`
  - `personal_dev` -> `Personal Development`
  - `photo` -> `Progress Photo`
  - `sleep` -> `Sleep`
  - `mindfulness` -> `Meditation`
  - `cold_shower` -> `Cold Exposure`

---

## Process agreement (working rule)

For future changes:
1. Add/adjust bug records in `BUGS.md` / `BUGS_ARCHIVE.md`.
2. Record major product/UX decisions in this file (`docs/decision-log.md`).
3. If visual language changes, update `docs/brand-guide.md`.
4. If strategy/packaging changes, update `PRODUCT.md`.
