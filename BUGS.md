# Bug List

## Open

| ID  | Description | Notes |
|-----|-------------|-------|
| B7  | Profile plan: no view/edit mode separation | Should have a read-only view with an explicit Edit → Save flow |
| B13 | 30-day gap design — no visual treatment for large missed streaks | Needs design discussion |
| B15 | Photo: tapping thumbnail should open fullscreen overlay with Delete / Replace actions | Currently just a small thumbnail with no interaction |
| B22 | Supabase CLI not installable on Windows via standard path | Workaround: run migrations manually in SQL editor |
| B23 | App has no branding/identity on many pages | User may not know what app they are on — need app name or logo visible on key screens (today, profile, progress) |
| B25 | Photo feature not discoverable | No UI hints that photos live inside a commitment — user must know to add "Progress photo" in Profile first |
| ~~B26~~ | ~~No camera capture on desktop~~ | Fixed — built CameraSheet using getUserMedia; shows webcam preview with Take Photo + Retake flow, plus "Upload from device instead" fallback |
| ~~B37~~ | ~~Onboarding copy too thin~~ | Resolved — rewrote all 4 slides. New copy leads with transformation, works for both 75 Hard veterans and newcomers, drops hardcoded "75 days" language, and ends with reassurance that commitments can be changed. |
| B39 | Water tracking is a checkbox, not an accumulator | **Design decided — ready to implement.** Hydration card on Today screen works as an intra-day accumulator, not a checkbox. Details: (1) Unit system: user chooses oz or ml at setup — stored as `target_unit` on commitment, internal value always stored as entered in `numeric_value` on commitment_logs. (2) Quick-add buttons inline on card: oz → +8 / +16 / +32, ml → +250 / +500 / +750, plus a custom amount input. (3) Progress bar shows current/goal (e.g. 24 / 64 oz), state is none→partial→complete based on progress toward goal. (4) Tapping the progress total marks complete instantly (jumps to goal amount) — shortcut for users who hit their goal but didn't log incrementally. (5) Can exceed goal — track actual amount, display as-is (80/64 oz), stay in complete state. Don't cap. Schema needs: `target_value` (numeric) and `target_unit` ('oz' or 'ml') columns on commitments table. `numeric_value` on commitment_logs already exists for the running daily total. |
| B38 | No custom domain | Currently running on a Vercel-generated URL. Need a proper domain (e.g. 75flex.com or similar) before any public or beta promotion — the URL is part of the first impression. Needs: domain purchase, DNS configuration in Vercel, and Supabase auth callback URL updated to match the new domain. |
| B34 | No data export | Users must be able to export everything they've entered — notes, reflection scores, commitment logs, photos — in a portable format (PDF, CSV, or both). This is a trust and retention feature: users should never fear losing their data if they stop paying or stop using the app. A basic export (notes + logs, no photos) could be free; full export including photos is a paid feature. Key differentiator vs. competitors who trap or erase data. Needs: format decision, what data is included at each tier, and UI trigger (Profile page likely). |
| B35 | Intelligent messaging tracks missing | After data entry, surface contextually appropriate encouragement + education — not generic. Three tracks: (1) On track — positive reinforcement, tips for getting more from the challenge; (2) Off track — re-engagement, how to get back, normalizing setbacks; (3) Recovering — momentum messaging, back-on-track celebration. Messages should be short, non-intrusive, and not block data entry flow. Feeds from B31 (reflection score) and streak/log data. Not required for beta but needs content and logic design before production. |
| B36 | Social milestone posts | At key moments, offer to generate a shareable post celebrating the user's progress — Day 7, Day 21, Day 30, Day 75 complete, personal streaks, and calendar hooks (New Year, Valentine's Day, etc.). Post includes a link back to the app. Extends B33 (share cards). The Day 7 post is the highest-priority trigger — it hits when motivation is high and the habit is forming. Should feel like a reward, not an obligation. |
| B33 | No shareable / viral content generation | Users should be able to generate share cards to post on social — milestone moments (Day 1, Day 25, Day 75 complete), streak achievements, reflection quotes from their journal. Needs: design for share card templates (progress photo + stat overlay, day count, app branding), image generation approach (canvas-based in-browser, or server-side og-image style), and share targets (copy image, native share sheet on mobile, direct to Instagram/X). Key moments to trigger: challenge start, milestone days, completion, and potentially reflection highlights. Ties into B32 (journal) and B23 (branding). |
| B32 | No journal / diary view for the challenge | Users need a way to scroll back through their challenge as a narrative — day notes, reflection scores (B31), photos, and completion state in a readable timeline. Needs: dedicated Journal screen (or tab on Progress), chronological scrollable feed of daily entries, search across notes, and a print-friendly layout (CSS @media print or export to PDF). The day note + DayDetailSheet data already exists — this is primarily a new view over existing data. Needs design for the feed layout and decision on where it lives in the nav. |
| B31 | No end-of-day reflection prompt | After logging commitments, surface a "How did it go today?" moment with one-tap answers: Felt good / Tough, but done / Almost quit. Needs: trigger logic (when to show — after last commitment logged? explicit prompt?), storage (new column on daily_logs or separate table), and whether the response feeds into anything (B28 encouragement tone, streak analysis, future insights). Low implementation cost once decisions are made — the main question is timing and what we do with the data. |
| B30 | Pricing + subscription model not implemented | Paid tier: $7/month or $40/year. Free trial: 2 weeks. Occasional promos (e.g. 2 months free for completing a challenge). Needs: payment provider choice (Stripe likely), subscription state on user/account, trial expiry logic, paywall enforcement for paid features (B27, B29, etc.), pricing page or in-app upsell surface, and promo/coupon mechanism. Also needs pricing copy in Help/About. Large scope — requires product + infrastructure decisions before implementation. |
| B29 | Challenge length is hardcoded to 75 days | Core flexibility feature — users should be able to set their own challenge length (e.g. 30, 60, 90 days or custom). Paid tier. Needs: UI in onboarding + profile, schema change to challenges table (end_date is already stored but length is implied as 75 everywhere in logic), audit of all hardcoded 75/76 references throughout codebase (calcDayNumber, progress %, completion trigger, day caps, etc.). Non-trivial — requires a coordinated pass across queries, components, and routing logic. |
| B28 | Daily education / encouragement message missing | Each day should surface a short message — motivational, educational, or reflective — to guide thinking and sustain momentum. Needs: content strategy (static library vs. AI-generated vs. curated sequence), where it lives in the UI (today header? dedicated card?), cadence (day-specific, random, streak-aware?), and tone guidelines. Design + content decision required before implementation. |
| B27 | Beta access model undefined | Beta testers should get full paid feature set in exchange for structured feedback (surveys, etc.). Needs: definition of paid vs. free tier, what feedback is collected and when, how beta access is granted/revoked. Design + product decision required before any implementation. |

## Resolved

| ID  | Description | Resolution |
|-----|-------------|------------|
| B2  | Card thinning / layout collapse | Fixed padding and layout |
| B3  | Category + name on two lines looked wrong | Merged to single line with mono eyebrow prefix |
| B4  | Google auth (redirect) | Documented; config-only fix in Google Cloud Console |
| B5  | Overlay contrast too low | Darkened from bg-ink/40 to bg-black/60 |
| B6  | Re-engagement card not showing | Fixed missedRecent logic |
| B8  | Photo counted toward overall day state unconditionally | Optional photos now excluded from state calc; required photos included |
| B9  | Help sheet overlay contrast | Fixed |
| B10 | Dev switcher used fake @75flex.dev emails — Supabase rejected | Switched to Gmail + aliases (davidnhubbard+persona@gmail.com) |
| B11 | Auth hydration error from password managers | Fixed with dynamic(() => import, { ssr: false }) |
| B12 | Calendar day detail — no sheet when tapping a cell | Built DayDetailSheet with commitment rows, note, loading skeleton |
| B14 | Mark all complete showed confirmation sheet | Removed sheet, direct action with Clear all toggle |
| B15 | Note button hard to see | Applied border-green-600 text-green-700 |
| B16 | PC camera opens instead of file picker | Removed capture="environment" |
| B17 | Note save button disabled with no visual reason | Fixed hasChanges trigger on note change |
| B18 | Playfair Display used for display font | Reverted to Space Grotesk everywhere |
| B19 | No seed data for dev personas | Created supabase/seed/dev_personas.sql with 4 realistic personas |
| B20 | Seed persona had no data | Fixed in seed script |
| B21 | Photo commitment required/optional toggle | Added required boolean to schema, toggle in Add/Edit sheets, state calc updated |
| B24 | Help button (?) hard to see on dark header | Changed to solid white circle bg-white text-green-900 |
| B1  | Google OAuth redirect_uri_mismatch | Added Supabase callback URL to Google Cloud Console |
| B22 (migration) | commitment_required migration pending | Applied manually in Supabase SQL editor |
