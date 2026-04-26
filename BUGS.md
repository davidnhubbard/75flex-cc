# Bug List

## Open

| ID  | Description | Notes |
|-----|-------------|-------|
| B1  | Google OAuth redirect_uri_mismatch | Add Supabase callback URL to Google Cloud Console authorized redirect URIs |
| B7  | Profile plan: no view/edit mode separation | Should have a read-only view with an explicit Edit → Save flow |
| B13 | 30-day gap design — no visual treatment for large missed streaks | Needs design discussion |
| B15 | Photo: tapping thumbnail should open fullscreen overlay with Delete / Replace actions | Currently just a small thumbnail with no interaction |
| B22 | Supabase CLI not installable on Windows via standard path | Workaround: run migrations manually in SQL editor |
| B23 | App has no branding/identity on many pages | User may not know what app they are on — need app name or logo visible on key screens (today, profile, progress) |
| B25 | Photo feature not discoverable | No UI hints that photos live inside a commitment — user must know to add "Progress photo" in Profile first |
| ~~B26~~ | ~~No camera capture on desktop~~ | Fixed — built CameraSheet using getUserMedia; shows webcam preview with Take Photo + Retake flow, plus "Upload from device instead" fallback |

## Pending migration

- `supabase/migrations/20260424000001_commitment_required.sql` — adds `required boolean` to commitments. Run in Supabase SQL editor.

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
