# Bug Archive

## Resolved

| ID  | Description | Resolution |
|-----|-------------|------------|
| B1  | Google OAuth redirect_uri_mismatch | Added Supabase callback URL to Google Cloud Console |
| B2  | Card thinning / layout collapse | Fixed padding and layout |
| B3  | Category + name on two lines looked wrong | Merged to single line with mono eyebrow prefix |
| B4  | Google auth (redirect) | Documented; config-only fix in Google Cloud Console |
| B5  | Overlay contrast too low | Darkened from bg-ink/40 to bg-black/60 |
| B6  | Re-engagement card not showing | Fixed missedRecent logic |
| B7  | Profile plan: no view/edit mode separation | Implemented read-only view with explicit Edit -> Save flow |
| B8  | Photo counted toward overall day state unconditionally | Optional photos excluded from state calc; required photos included |
| B9  | Help sheet overlay contrast | Fixed |
| B10 | Dev switcher used fake @75flex.dev emails - Supabase rejected | Switched to Gmail + aliases (davidnhubbard+persona@gmail.com) |
| B11 | Auth hydration error from password managers | Fixed with dynamic(() => import, { ssr: false }) |
| B12 | Calendar day detail - no sheet when tapping a cell | Built DayDetailSheet with commitment rows, note, loading skeleton |
| B14 | Mark all complete showed confirmation sheet | Removed sheet, direct action with Clear all toggle |
| B15 | Photo: tapping thumbnail should open fullscreen overlay with Delete / Replace actions | Implemented `PhotoViewerSheet` fullscreen flow with view, replace, and delete actions from Today cards. |
| B16 | PC camera opens instead of file picker | Removed capture="environment" |
| B17 | Note save button disabled with no visual reason | Fixed hasChanges trigger on note change |
| B18 | Playfair Display used for display font | Reverted to Space Grotesk everywhere |
| B19 | No seed data for dev personas | Created supabase/seed/dev_personas.sql with 4 realistic personas |
| B20 | Seed persona had no data | Fixed in seed script |
| B21 | Photo commitment required/optional toggle | Added required boolean to schema, toggle in Add/Edit sheets, state calc updated |
| B24 | Help button (?) hard to see on dark header | Changed to solid white circle bg-white text-green-900 |
| B25 | Photo feature not discoverable | Added photo discoverability nudges (Today + Profile + onboarding), plus CTA path to add a Photo commitment quickly. |
| B26 | No camera capture on desktop | Built CameraSheet using getUserMedia; webcam preview with Take Photo + Retake, plus "Upload from device instead" fallback |
| B28 | Daily education / encouragement message | Phase-based message library (5 phases x up to 10 messages) + 5 streak milestones. Deterministic by day number. Card shown on Today tab only, hidden during re-engagement. |
| B29 | Challenge length hardcoded to 75 days | Configurable duration implemented - onboarding picker (21/30/75*/90/custom), schema migration, all logic updated |
| B31 | No end-of-day reflection prompt | Three-option card (Felt good / Tough, but done / Almost quit) on Today tab once any commitment is logged. Tap again to deselect. Stored on daily_logs.reflection. Shown in DayDetailSheet for past days. Needs migration 20260426000003_daily_log_reflection.sql run in Supabase SQL editor. |
| B37 | Onboarding copy too thin | Rewrote all 4 slides; new copy leads with transformation, drops hardcoded language, ends with reassurance |
| B39 | Water tracking is a checkbox, not an accumulator | Implemented hydration card with intra-day accumulator, unit system (oz/ml), quick-add buttons, progress bar, goal-tap shortcut |
| B40 | Define Commitments: category eyebrow label duplicates commitment name | Removed eyebrow label from plan-3 cards; name shown as sole card header |
| B41 | Placeholder text on commitment definition inputs near-invisible | Fixed - placeholder color lightened across all plan-3 inputs |
| B42 | Physical commitment default name "One Workout" too prescriptive | Renamed to "Physical Fitness" with updated definition clarifying intentional exercise |
| B46 | Note preview can overflow card height with long text | Note card now clamps to first-line preview with `More` indicator, opens edit on tap, and note labels/titles were normalized to Title Case. |
| B50 | Legacy/custom commitment category naming artifacts still appear for early users | Locked canonical system category names in `web/src/lib/categories.ts` and added runtime normalization/persistence in `getCommitments`, so legacy titles (for example "One Workout a Day") are auto-cleaned to approved labels. |
| B51 | Existing progress photo tap does not reliably open viewer | Updated photo card tap behavior to prioritize opening `PhotoViewerSheet` when a photo exists; viewer now remains the entry point for replace/delete flows. |
| B52 | Progress tab can incorrectly bounce active users to onboarding | Progress boot flow now validates user auth first and retries active-challenge fetch once before redirecting, reducing false onboarding bounces from transient session timing. |
