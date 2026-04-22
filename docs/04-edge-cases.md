# 04 — Edge Cases & Design Decisions

This document captures all 36 design decisions made during spec creation, organized by domain. Each decision includes reasoning so Claude Code understands the intent, not just the rule.

## Onboarding & Plan Building

**C1: Minimum 2 commitments required**
- *Decision:* Users must select at least 2 commitment categories before starting.
- *Reasoning:* Too few commitments make the challenge trivial. 2 is the minimum viable effort.
- *Implementation:* "Select at least two to continue" message. CTA disables below 2. No exceptions.

**C2: Template label becomes "Custom" silently**
- *Decision:* If user picks "75 Soft" but deviates (e.g., changes nutrition definition), template label doesn't update visually. It just becomes "Custom" internally.
- *Reasoning:* Avoids confusion. User selected "75 Soft" and expects that label, even if they tweaked it.
- *Implementation:* Template field stays frozen. Internal logic handles Custom vs. template at runtime.

**C3: Empty commitment definition is allowed**
- *Decision:* User can leave a commitment's definition blank (e.g., "Nutrition — [empty]").
- *Reasoning:* Users might define it later or intentionally keep it vague. Don't block them.
- *Implementation:* Card subtitle falls back to category name ("Nutrition") if definition is empty.

**C4: Resume per phase, not per screen**
- *Decision:* Onboarding has two phases: (1) 4 slides, (2) 3-step plan builder. Each phase is resumable independently. Within plan builder, each step is resumable.
- *Reasoning:* Users might close app mid-onboarding. Resume should put them back where they left off, not restart the whole flow.
- *Implementation:* Track `onboarding_state` (null | "slides_complete" | "plan_step_1" | "plan_step_2" | "plan_step_3").

**C5: Desktop benchmark uses file upload, not camera**
- *Decision:* Mobile: camera or photo library. Desktop: file upload zone only.
- *Reasoning:* Desktops don't have built-in cameras. File upload is the norm.
- *Implementation:* Conditional UI based on platform. Mobile gets Expo Camera + Image Picker. Web gets drag-drop + file picker.

## Daily Logging

**C6: Day 1 tab row hidden; Day 2 two tabs; Day 3+ three tabs**
- *Decision:* Tab row appears progressively. Day 1: no tabs (header flows directly to cards). Day 2: Today + Yesterday tabs. Day 3+: Today + Yesterday + Day Before tabs.
- *Reasoning:* Day 1 has no past to log. Day 2 introduces backfill concept gently. Day 3+ opens full 3-day window.
- *Implementation:* Conditional rendering. Show/hide tab row based on day_number.

**C7: Zero-state save is valid**
- *Decision:* User can tap "Save" on an empty day (no commitments logged) and it saves successfully.
- *Reasoning:* User might intentionally log "nothing was done today" or plan to backfill later.
- *Implementation:* No validation preventing empty saves. Save goes through. Overall_state calculates as "none".

**C8: Today = instant-save; Backdate = explicit Save button**
- *Decision:* Tapping a commitment card on Today tab immediately saves (no Save button). On backdate tabs, explicit Save button required.
- *Reasoning:* Today is the critical path (speed matters). Backdate is intentional (confirm before saving).
- *Implementation:* Two different save flows. Today: onTap → save immediately. Backdate: onTap cycles state → explicit Save button.

**C9: Complete All confirmation copy is static**
- *Decision:* "Mark all commitments as complete for Day N?" Same copy every time, regardless of which commitments are already done.
- *Reasoning:* Clarity. User knows exactly what will happen.
- *Implementation:* Single confirmation sheet. No dynamic text like "3 of 4 already done" — just the simple question.

**C10: Complete All available on all open days, disabled on locked days**
- *Decision:* Today, Yesterday, Day Before (within 3-day window) all have "Complete All" button. Locked days don't (greyed out / hidden).
- *Reasoning:* User might want to mark Day Before as complete if they didn't log it. Locked days are immutable.
- *Implementation:* Show/hide button based on day status (open vs. locked).

**C11: Notes available on all open days**
- *Decision:* Day note field available on Today, Yesterday, Day Before. Same 3-day window as logging.
- *Reasoning:* User might want to add context to any recent day.
- *Implementation:* Notes persist to DayNote table. Saves automatically (no explicit Save for notes alone).

**C12: Long-press disabled on non-incremental cards**
- *Decision:* Only "Water" and "Steps" commitments support long-press (incremental detail screen). Other commitments don't respond to long-press.
- *Reasoning:* Long-press is for fine-grained numeric tracking. Other commitments are binary/ternary (not started / partial / complete).
- *Implementation:* Gesture recognizer only active on incremental commitment cards. Non-incremental cards have no long-press handler.

**C13: Card list scrolls; fixed height cards; actions below**
- *Decision:* Commitment cards in a scrollable list (not fixed heights). Actions (Save, Complete All, Add Note) anchor below the list.
- *Reasoning:* On a small phone with many commitments, cards shouldn't push actions off-screen.
- *Implementation:* ScrollView for cards. Sticky footer for actions.

**C14: Progress Photo card is standard 3-state, no camera shortcut**
- *Decision:* Progress Photo commitment is a regular card with "not started / partial / complete" states. No inline camera button. Tapping doesn't open camera.
- *Reasoning:* MVP simplification. Camera can be added post-MVP as an enhancement.
- *Implementation:* Progress Photo is a standard card. Photos are added in Plan Management or Benchmark capture only.

**C15: Tapping locked tab shows existing locked-day overlay**
- *Decision:* If user taps Day Before when it's locked, the locked-day overlay appears (not a message toast, not an error).
- *Reasoning:* Clear, visual feedback. "This day is closed."
- *Implementation:* Locked day overlay: "🔒 This day is closed. Day X (date) is outside the 3-day logging window..."

## Progress View

**C16: Today cell tap navigates to Today tab; past days show detail bar; future days not tappable**
- *Decision:* Calendar cells: Today → navigate to Today tab. Past days → show detail bar (inline, non-modal). Future → do nothing.
- *Reasoning:* Today is the primary action. Past days show status. Future is locked (can't navigate to them).
- *Implementation:* Cell tap handler checks day status. Conditional behavior.

**C17: Streak 0 shows "—" not "0"; suppress citrus highlight**
- *Decision:* When current streak is 0 (user missed days), show "—" instead of "0". Hero box loses dark green background (becomes light with border instead).
- *Reasoning:* "0" looks like a failure. "—" is neutral, honest.
- *Implementation:* Conditional rendering. If streak === 0: show "—", use light-bordered card style, show copy "Ready to start a new streak."

**C18: Show-up rate hidden until Day 4**
- *Decision:* Show-up rate (percentage of days completed/attempted) not shown until Day 4. Before that, show "—".
- *Reasoning:* First 3 days are too small a sample. Showing 100% on Day 1 is meaningless.
- *Implementation:* Hide metric if day_number < 4.

**C19: Preserve weekday alignment; blank leading cells OK**
- *Decision:* Calendar grid starts on Sunday. Day 1 might not be a Sunday (blank cells appear before it). This is fine and expected.
- *Reasoning:* Weekday alignment is familiar. Blank cells are fine visual noise.
- *Implementation:* Standard 7-column grid. Day 1 appears in correct weekday column.

**C20: No special treatment for early days**
- *Decision:* First 3 days look like any other day (no special styling, badges, or callouts).
- *Reasoning:* Avoid over-celebration. Focus is consistency.
- *Implementation:* Standard cell styling for Days 1-3.

## Plan Management

**C21: Quiet note below Save button**
- *Decision:* After editing a commitment, below the Save button show: "Applies today" if today unlogged, "Takes effect tomorrow" if today already logged.
- *Reasoning:* User needs to understand timing immediately.
- *Implementation:* Conditional text. Query if today's DailyLog exists.

**C22: Saved log = committed record**
- *Decision:* Once a day is logged and saved, any edits to commitments take effect tomorrow (not retroactive to that day).
- *Reasoning:* Logged days are immutable once saved (data integrity). Changes shouldn't rewrite history.
- *Implementation:* CommitmentHistory tracks change date. Backfill display uses that to show what was active on each day.

**C23: Minimum 2 commitments enforced**
- *Decision:* Remove button is muted (disabled) when challenge would drop below 2 commitments.
- *Reasoning:* User can't remove all commitments or drop to 1.
- *Implementation:* Button state checked on render. Muted at 40% opacity. Quiet text below: "minimum 2 commitments required".

**C24: At cap, Add button stays visible with lock badge**
- *Decision:* Free tier at 4 commitments: Add button is still visible but shows lock badge "FREE". Tapping opens paywall (post-MVP).
- *Reasoning:* Clear path to upgrade. Not hidden, just locked.
- *Implementation:* Button styling changes (opacity, badge). onTap triggers paywall navigation.

**C25: Change log shows last 3; expands in place; newest first**
- *Decision:* Plan management shows last 3 changes by default. "Show all N changes" expands the list in place. Most recent first.
- *Reasoning:* User wants to see recent changes most of the time. Expand-in-place avoids modal.
- *Implementation:* State tracks expanded/collapsed. Conditional rendering of change entries.

**C26: Backdate shows commitment version active on that day**
- *Decision:* When backfilling Day 5 (on Day 8), the commitment definition shown is what was active on Day 5, not the current definition. Quiet note if different: "Using your plan from Day N."
- *Reasoning:* Transparency. User sees what they committed to on that day.
- *Implementation:* Query CommitmentHistory. Find version active on that day using changed_on_day.

## Lifecycle

**C27: Day rollover on next foreground event**
- *Decision:* Day doesn't roll over at midnight (no live timer). Rolls over on next time app comes to foreground after midnight.
- *Reasoning:* Simpler, no background tasks. Works offline. User sees fresh day when they open app.
- *Implementation:* Check current date on appResume. If different from last_active_date, increment day_number.

**C28: Pre-momentum restart copy varies**
- *Decision:* Before user starts challenge: 0 days logged = "Ready to begin?". 1-2 days logged = "Ready to pick back up?".
- *Reasoning:* Acknowledge momentum. First attempt feels fresh. Restarting after 1-2 days is a recovery.
- *Implementation:* Query max day logged. Conditional copy.

**C29: Re-engagement episode ends on any activity**
- *Decision:* Once user logs anything (any commitment on any day), the re-engagement card disappears and never shows again for that episode.
- *Reasoning:* Card's job is to re-engage. Once engaged, it's done.
- *Implementation:* Track re_engagement_shown flag on Challenge or separate table. Set to false on next successful log.

**C30: Re-engagement card shows day progress + show-up rate only**
- *Decision:* Card displays: days logged (cumulative), show-up rate, days remaining. NOT current streak.
- *Reasoning:* Streak might be 0 (discouraging). Total days logged feels like progress.
- *Implementation:* Calculate from data. Don't show streak.

**C31: Completion screen after Day 75**
- *Decision:* After Day 75 is logged and saved, a dedicated completion screen appears. Full calendar + stats + CTAs.
- *Reasoning:* Celebration moment. Can't skip it. Different from normal day view.
- *Implementation:* Navigation check. If day_number === 75 && today logged → show completion screen.

**C32: Post-challenge Today tab is read-only**
- *Decision:* After challenge complete (Day 76+), Today tab exists but cards are greyed out, non-tappable. Single CTA: "Start a new challenge."
- *Reasoning:* Challenge is done. Can't log more days. But user can see their last day and optionally restart.
- *Implementation:* Cards rendered with opacity: 0.4. onClick handlers ignored. CTA routes to plan builder or restart flow.

## Profile

**C33: Benchmark view is passive**
- *Decision:* In Profile, benchmark shows Day 1 photos with date label. No comparison prompt ("Does this feel different?"). No side-by-side comparison.
- *Reasoning:* MVP simplicity. User can visually compare themselves without UI guidance.
- *Implementation:* Display photos + date. That's it.

**C34: Empty benchmark shows quiet card**
- *Decision:* If no benchmark: "No starting benchmark · Add one anytime."
- *Reasoning:* Gentle invitation, no guilt. Tappable (opens benchmark capture).
- *Implementation:* Card with light border and dashed style. onTap routes to benchmark capture.

## System

**C35: Silent offline; only show status on sync failure**
- *Decision:* When offline, the app works normally (reads local cache, saves locally). Only show a banner if sync fails: "Having trouble saving · your progress is stored locally".
- *Reasoning:* Offline should be invisible. Only alert user if something goes wrong.
- *Implementation:* No "offline" indicator. Banner only on sync error. Retry button visible.

**C36: Greeting varies by time of day; no name if none exists; Day 1 uses same greeting**
- *Decision:* Morning (before noon) = "Good morning". Afternoon (noon–5pm) = "Good afternoon". Evening (after 5pm) = "Good evening". If no display name, omit name entirely (just "Good morning"). Day 1 uses same greeting (no special Day 1 copy).
- *Reasoning:* Personalization feels warm. Omitting name is better than showing "null" or "[Name]".
- *Implementation:* Check hour of day. Check user.display_name. Conditional copy.

---

## Decision Matrix

| Domain | Count | Notes |
|--------|-------|-------|
| Onboarding | 5 | C1–C5 |
| Daily Logging | 10 | C6–C15 |
| Progress View | 5 | C16–C20 |
| Plan Management | 6 | C21–C26 |
| Lifecycle | 6 | C27–C32 |
| Profile | 2 | C33–C34 |
| System | 2 | C35–C36 |
| **Total** | **36** | |
