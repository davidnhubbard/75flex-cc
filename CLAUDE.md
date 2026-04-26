# 75 Flex — Claude Code Context

This file is read automatically at the start of every Claude Code session.
It gives you enough context to continue development without re-deriving everything.

---

## What this app is

**75 Flex** — a flexible habit tracker based on the 75 Hard challenge. Users commit to 75 days of daily habits (commitments), log each day, and track progress. The tone is calm and supportive, not drill-sergeant.

---

## Monorepo structure

```
75flex-cc/
  web/          ← Next.js 14 app (primary focus)
  supabase/
    migrations/ ← SQL migrations applied manually via Supabase SQL editor (CLI not available on Windows)
    seed/       ← dev_personas.sql — seed data for 4 test personas
  docs/
    brand-guide.md ← SOURCE OF TRUTH for colors, type, spacing, voice
  BUGS.md       ← Active bug list — read this before starting work
```

---

## Tech stack

- **Next.js 14** (App Router, all routes under `web/src/app/`)
- **Supabase** — Postgres + Auth + Storage
- **Tailwind CSS** — custom token system, no component library
- **TypeScript** throughout
- **Fonts:** Space Grotesk (`font-display`, `font-sans`) + JetBrains Mono (`font-mono`) — two fonts only, never add a third

---

## Key directories

```
web/src/
  app/
    (app)/          ← authenticated routes (layout wraps with auth check + BottomNav)
      today/        ← TodayContent.tsx — main daily logging screen
      progress/     ← ProgressContent.tsx — calendar + stats
      profile/      ← ProfileContent.tsx — plan management, benchmark
      complete/     ← CompleteContent.tsx — day 75 celebration
    auth/           ← login, signup, AuthForm
    onboarding/     ← OnboardingContent.tsx — new user setup
    dev/            ← dev tools page
  components/
    CommitmentCard.tsx        ← tap-to-cycle state card (none/partial/complete)
    CameraSheet.tsx           ← webcam capture UI (getUserMedia + preview + upload fallback)
    AddCommitmentSheet.tsx    ← add a new commitment to the plan
    EditCommitmentSheet.tsx   ← edit definition, required toggle, remove
    BenchmarkSheet.tsx        ← starting benchmark photo + notes
    DayDetailSheet.tsx        ← calendar day detail (commitment rows + note)
    DevSwitcher.tsx           ← dev-only persona switcher (Gmail + aliases)
    HelpButton.tsx            ← ? button in PageHeader (white circle on dark header)
    PageHeader.tsx            ← dark green header band used on all main screens
    BottomNav.tsx             ← Today / Progress / Profile tabs
  lib/
    queries.ts        ← all Supabase query functions
    categories.ts     ← CATEGORIES array (8 commitment types)
    database.types.ts ← generated types — regenerate with supabase gen types
    supabase.ts       ← browser Supabase client
    supabase-server.ts← server Supabase client
```

---

## Data model (key tables)

- **challenges** — one active challenge per user (`status: active|archived|complete`)
- **commitments** — the user's plan items (`category`, `name`, `definition`, `sort_order`, `required`)
- **daily_logs** — one row per day (`day_number`, `overall_state: none|partial|complete`)
- **commitment_logs** — per-commitment state per day (`state`, `photo_url`)
- **day_notes** — optional free-text note per daily_log
- **benchmarks** — starting photo + notes (one per challenge)
- **commitment_history** — audit log of definition changes

---

## Critical decisions already made

### Photo commitments
- The `photo` category is **binary** — no partial state, only none/complete
- Photo commitments have a `required` boolean on the `commitments` table
- **`required = true`**: photo must be taken for the day to be complete (counts in overall state calc)
- **`required = false`**: photo is optional, excluded from overall state calc
- Filter for overall state: `commitments.filter(c => c.category !== 'photo' || c.required)`
- `handleCompleteAll` / `handleClearAll` always exclude ALL photo commitments (can't auto-complete a photo)
- **Photo capture uses `CameraSheet`** — webcam via `getUserMedia`, with "Upload from device instead" fallback. The hidden file input approach was replaced. Do NOT revert to a hidden `<input type="file">` for photo commitments.

### State colors (Signal palette)
- `state-none-bg` / `state-none` / `state-none-ink` — warm stone
- `state-partial-bg` / `state-partial` / `state-partial-ink` — sunflower yellow
- `state-done-bg` / `state-done` / `state-done-ink` — emerald green
- All tokens live in `tailwind.config.ts` under `state.*`
- **Never use raw hex values in components** — always use tokens
- Cards must always contrast against their background (see brand guide §6.1)

### Card contrast rule (permanent)
- Page body is `surface` (`#F4F1EA`)
- State cards use the Signal palette — all three are visually distinct from surface
- Never use `bg-card` for a commitment card on `bg-surface` — they're too close in tone

### Typography
- **Space Grotesk everywhere** for `font-display` and `font-sans`
- JetBrains Mono for `font-mono` (eyebrows, chips, meta labels)
- Playfair Display was tried and explicitly rejected — do not use it

### Backdate logging
- Users can log up to 3 days back (today, yesterday, day before)
- Today tab: instant-save on tap
- Backdate tabs: stage changes, explicit Save button
- Days older than 2 days back are locked (LockedDayOverlay)

### Dev testing
- Dev switcher uses Gmail `+` aliases: `davidnhubbard+persona@gmail.com`
- Seed data: `supabase/seed/dev_personas.sql` (4 personas: new, day2, re-engage, day60, day75)
- Run seed in Supabase SQL editor — it's idempotent

### Migrations
- Supabase CLI doesn't work on Windows — all migrations run manually in Supabase SQL editor
- Check `supabase/migrations/` for pending migrations before schema work
- **Pending:** `20260424000001_commitment_required.sql` — adds `required boolean` to commitments

### Auth
- Login/Signup pages use `dynamic(() => import('../AuthForm'), { ssr: false })` to fix password-manager hydration errors
- Google OAuth needs Supabase callback URL in Google Cloud Console (B1 — not yet fixed)

---

## Component patterns

### Adding a new sheet (bottom sheet modal)
Use the existing `Sheet` component (`ui/Sheet.tsx`) or follow the pattern in `AddCommitmentSheet.tsx`:
- `fixed inset-0 z-50` overlay
- `bg-black/70` backdrop with `onClick={onClose}`
- `rounded-t-[20px]` panel with drag handle (`w-10 h-1 bg-border`)

### Adding a new query
Add to `web/src/lib/queries.ts`. Always wrap Supabase errors: `if (error) throw new Error(error.message)`.

### Commitment categories
Eight categories in `web/src/lib/categories.ts`. The `photo` category has special handling throughout — search for `c.category === 'photo'` or `c.category !== 'photo'` to find all special cases.

---

## Known open bugs

See `BUGS.md` at repo root for the full list. Key open items:
- **B1** — Google OAuth not configured
- **B7** — Profile plan needs view/edit mode separation
- **B15** — Photo thumbnail should open fullscreen with Delete/Replace
- **B23** — App has no branding on many pages
- **B25** — Photo feature not discoverable (no hints to add "Progress photo" commitment)

---

## What NOT to do

- Don't add `capture="environment"` back to any `<input type="file">` — it was removed intentionally (forced camera on desktop)
- Don't use `paper` as a token yet — not defined in tailwind.config.ts (planned but not implemented)
- Don't add a third font
- Don't hardcode hex colors in components
- Don't mock the Supabase client in any way — always use the real client
- Don't create new UI patterns without checking the brand guide first
