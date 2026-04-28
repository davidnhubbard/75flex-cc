# Bug List

On-the-fly fix tracking:
- Keep active work in this file (`BUGS.md`).
- When a bug is fixed in implementation, move it to `BUGS_ARCHIVE.md` with a one-line resolution note.
- Do not leave resolved items in Open.

## Open

| ID  | Description | Notes |
|-----|-------------|-------|
| B13 | 30-day gap design - no visual treatment for large missed streaks | Needs design discussion |
| B22 | Supabase CLI not installable on Windows via standard path | Workaround: run migrations manually in SQL editor |
| B23 | App has no branding/identity on many pages | Need app name or logo visible on Today, Progress, Profile screens |
| B27 | Beta access model undefined | Beta testers should get full paid feature set in exchange for structured feedback. Needs: definition of paid vs. free tier, what feedback is collected and when, how beta access is granted/revoked. |
| B30 | Pricing + subscription model not implemented | Paid tier: $7/month or $40/year. Free trial: 2 weeks. Needs: payment provider (Stripe likely), subscription state, trial expiry, paywall enforcement, pricing page, promo/coupon mechanism. |
| B32 | No journal / diary view for the challenge | Chronological scrollable feed of daily entries - notes, reflection scores, photos, completion state. Data already exists; primarily a new view. Needs design for feed layout and nav placement. |
| B33 | No shareable / viral content generation | Shareable cards for milestone moments (Day 1, Day 25, completion, streaks). Needs: card templates, image generation approach, share targets. |
| B34 | No data export | Export all data (notes, logs, photos) as PDF/CSV. Trust and retention feature - users should never fear losing their data. Basic export free; full export with photos paid. |
| B35 | Intelligent messaging tracks missing | Contextual encouragement after data entry: on-track / off-track / recovering. Feeds from B31 and streak data. Not required for beta. |
| B36 | Social milestone posts | Auto-generate shareable posts at Day 7, Day 21, Day 30, completion, etc. Day 7 is highest priority. Extends B33. |
| B38 | Custom domain setup incomplete (domain purchased) | `75flex.fit` is purchased. Remaining: attach domain in Vercel, configure DNS records, and update Supabase Auth Site URL + redirect/callback URLs to `https://75flex.fit` (and `https://www.75flex.fit` if used). |
| B43 | Benchmark supports only 1 photo | Should support up to 4 - 1 main + up to 3 supplementals. Needs schema change, multi-photo UI in BenchmarkSheet, and storage path convention. Enhancement: prompt for matching "after" photos on completion screen with before/after comparison - strong shareable card moment (B33). |
| B44 | Logo image needs redesign | Current logo is placeholder. New design: "75" inside a heart shape, with "FLEX" alongside, on a transparent background (PNG). Should work on both light and dark backgrounds. Drops in at `web/public/brand/75flex-logo-heart.png`. |
| B45 | No photo gallery / pictorial diary view | Add a gallery of all challenge photos. Mobile web: default 2-column grid. Desktop web (future): responsive wider rows. Optional note snippet per photo card and tap-to-open full detail. |
| B47 | Restart Challenge action placement is risky on main Profile hub | Move destructive reset out of primary Profile hub area. Place in a secondary Settings/Personal page under a clearly labeled Danger Zone with explicit caution copy. |
| B48 | No profile-completion progress indicator | Add progress tracking for setup completeness (for example Benchmark + Personal Info), shown as a clear status like "Profile 70% Complete". |
| B49 | Onboarding does not capture user's name | Use progressive profiling: onboarding asks only "What should we call you?" (preferred/display name). After engagement (for example Day 3/streak), prompt for fuller profile fields (full name, birthday, etc.) with skip option and no logging block. |
| B53 | Funnel assumes auth intent before value is understood (auth-first onboarding) | Rework first-run journey to value-first: explain app purpose/how it works before account creation, collect lightweight preferred name, then request login to save progress and continue to plan setup. |

## Resolved

Resolved issues are archived in [BUGS_ARCHIVE.md](./BUGS_ARCHIVE.md).
