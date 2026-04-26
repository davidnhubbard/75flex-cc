# Bug List

## Open

| ID  | Description | Notes |
|-----|-------------|-------|
| B13 | 30-day gap design — no visual treatment for large missed streaks | Needs design discussion |
| B15 | Photo: tapping thumbnail should open fullscreen overlay with Delete / Replace actions | Currently just a small thumbnail with no interaction |
| B22 | Supabase CLI not installable on Windows via standard path | Workaround: run migrations manually in SQL editor |
| B23 | App has no branding/identity on many pages | Need app name or logo visible on Today, Progress, Profile screens |
| B25 | Photo feature not discoverable | No UI hints that photos live inside a commitment — user must know to add "Progress Photo" in Profile first |
| B27 | Beta access model undefined | Beta testers should get full paid feature set in exchange for structured feedback. Needs: definition of paid vs. free tier, what feedback is collected and when, how beta access is granted/revoked. |
| B30 | Pricing + subscription model not implemented | Paid tier: $7/month or $40/year. Free trial: 2 weeks. Needs: payment provider (Stripe likely), subscription state, trial expiry, paywall enforcement, pricing page, promo/coupon mechanism. |
| B32 | No journal / diary view for the challenge | Chronological scrollable feed of daily entries — notes, reflection scores, photos, completion state. Data already exists; primarily a new view. Needs design for feed layout and nav placement. |
| B33 | No shareable / viral content generation | Shareable cards for milestone moments (Day 1, Day 25, completion, streaks). Needs: card templates, image generation approach, share targets. |
| B34 | No data export | Export all data (notes, logs, photos) as PDF/CSV. Trust and retention feature — users should never fear losing their data. Basic export free; full export with photos paid. |
| B35 | Intelligent messaging tracks missing | Contextual encouragement after data entry: on-track / off-track / recovering. Feeds from B31 and streak data. Not required for beta. |
| B36 | Social milestone posts | Auto-generate shareable posts at Day 7, Day 21, Day 30, completion, etc. Day 7 is highest priority. Extends B33. |
| B38 | No custom domain | Need a proper domain before any public/beta promotion. Needs: domain purchase, DNS config in Vercel, Supabase auth callback URL updated. |
| B43 | Benchmark supports only 1 photo | Should support up to 4 — 1 main + up to 3 supplementals. Needs schema change, multi-photo UI in BenchmarkSheet, and storage path convention. Enhancement: prompt for matching "after" photos on completion screen with before/after comparison — strong shareable card moment (B33). |
| B44 | Logo image needs redesign | Current logo is placeholder. New design: "75" inside a heart shape, with "FLEX" alongside, on a transparent background (PNG). Should work on both light and dark backgrounds. Drops in at `web/public/brand/75flex-logo-heart.png`. |

## Resolved

| ID  | Description | Resolution |
|-----|-------------|------------|
| B1  | Google OAuth redirect_uri_mismatch | Added Supabase callback URL to Google Cloud Console |
| B2  | Card thinning / layout collapse | Fixed padding and layout |
| B3  | Category + name on two lines looked wrong | Merged to single line with mono eyebrow prefix |
| B4  | Google auth (redirect) | Documented; config-only fix in Google Cloud Console |
| B5  | Overlay contrast too low | Darkened from bg-ink/40 to bg-black/60 |
| B6  | Re-engagement card not showing | Fixed missedRecent logic |
| B7  | Profile plan: no view/edit mode separation | Implemented read-only view with explicit Edit → Save flow |
| B8  | Photo counted toward overall day state unconditionally | Optional photos excluded from state calc; required photos included |
| B9  | Help sheet overlay contrast | Fixed |
| B10 | Dev switcher used fake @75flex.dev emails — Supabase rejected | Switched to Gmail + aliases (davidnhubbard+persona@gmail.com) |
| B11 | Auth hydration error from password managers | Fixed with dynamic(() => import, { ssr: false }) |
| B12 | Calendar day detail — no sheet when tapping a cell | Built DayDetailSheet with commitment rows, note, loading skeleton |
| B14 | Mark all complete showed confirmation sheet | Removed sheet, direct action with Clear all toggle |
| B16 | PC camera opens instead of file picker | Removed capture="environment" |
| B17 | Note save button disabled with no visual reason | Fixed hasChanges trigger on note change |
| B18 | Playfair Display used for display font | Reverted to Space Grotesk everywhere |
| B19 | No seed data for dev personas | Created supabase/seed/dev_personas.sql with 4 realistic personas |
| B20 | Seed persona had no data | Fixed in seed script |
| B21 | Photo commitment required/optional toggle | Added required boolean to schema, toggle in Add/Edit sheets, state calc updated |
| B24 | Help button (?) hard to see on dark header | Changed to solid white circle bg-white text-green-900 |
| B26 | No camera capture on desktop | Built CameraSheet using getUserMedia; webcam preview with Take Photo + Retake, plus "Upload from device instead" fallback |
| B29 | Challenge length hardcoded to 75 days | Configurable duration implemented — onboarding picker (21/30/75★/90/custom), schema migration, all logic updated |
| B28 | Daily education / encouragement message | Phase-based message library (5 phases × up to 10 messages) + 5 streak milestones. Deterministic by day number. Card shown on Today tab only, hidden during re-engagement. |
| B31 | No end-of-day reflection prompt | Three-option card (✦ Felt good / 💪 Tough, but done / 😤 Almost quit) on Today tab once any commitment is logged. Tap again to deselect. Stored on daily_logs.reflection. Shown in DayDetailSheet for past days. Needs migration 20260426000003_daily_log_reflection.sql run in Supabase SQL editor. |
| B37 | Onboarding copy too thin | Rewrote all 4 slides; new copy leads with transformation, drops hardcoded language, ends with reassurance |
| B39 | Water tracking is a checkbox, not an accumulator | Implemented hydration card with intra-day accumulator, unit system (oz/ml), quick-add buttons, progress bar, goal-tap shortcut |
| B40 | Define Commitments: category eyebrow label duplicates commitment name | Removed eyebrow label from plan-3 cards; name shown as sole card header |
| B41 | Placeholder text on commitment definition inputs near-invisible | Fixed — placeholder color lightened across all plan-3 inputs |
| B42 | Physical commitment default name "One Workout" too prescriptive | Renamed to "Physical Fitness" with updated definition clarifying intentional exercise |
