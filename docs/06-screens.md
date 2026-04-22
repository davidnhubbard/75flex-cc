# 06 — Screens

## Complete Screen Inventory

All screens are listed below with their reference IDs. The ? help button is a global component that appears on every screen (see `05-visual-system.md` for details).

### Sheet 01 — Onboarding (01.1 – 01.7b)

| ID | Name | Purpose |
|----|------|---------|
| 01.1 | Welcome slide | Introduce 75 Flex concept |
| 01.2 | Your rules slide | Explain customization |
| 01.3 | No forced resets slide | Explain no-restart philosophy |
| 01.4 | Ready slide | CTA to start plan builder |
| 01.5 | Plan builder Step 1 | Choose template (75 Hard or 75 Soft) |
| 01.6 | Plan builder Step 2 | Select commitment categories (min 2) |
| 01.7a | Plan builder Step 3 (partial) | Define first commitments; some blank |
| 01.7b | Plan builder Step 3 (complete) | All commitments defined; ready to start |

### Sheet 02 — Benchmark Capture (02.1 – 02.5)

| ID | Name | Purpose |
|----|------|---------|
| 02.1 | Mobile benchmark empty | Capture starting point (mobile, empty) |
| 02.2 | Mobile benchmark filled | Capture starting point (mobile, with data) |
| 02.3 | Nudge banner on Today | Reminder to add benchmark if skipped |
| 02.4 | Desktop benchmark empty | Capture starting point (desktop, empty) |
| 02.5 | Desktop benchmark filled | Capture starting point (desktop, with data) |

### Sheet 03 — Daily Logging (03.1 – 03.10)

| ID | Name | Purpose |
|----|------|---------|
| 03.1 | Today in progress | Main daily logging (partial completion) |
| 03.2 | Today all complete | Main daily logging (all done) |
| 03.3 | Day 1 (no tab row) | Day 1 specific (no backdate yet) |
| 03.4 | Day 2 (two tabs) | Day 2 specific (introduce backdate) |
| 03.5 | Backdate (yesterday selected) | Logging for yesterday |
| 03.6 | Locked day | Day outside 3-day window (closed for logging) |
| 03.7 | Day note expanded | Adding note to a day (inline, not modal) |
| 03.8 | Complete All confirmation | Confirmation sheet before marking all done |
| 03.9 | Re-engagement card | Supportive nudge after 3+ missed days |
| 03.10 | Sync failure banner | Connection lost (with retry) |

### Sheet 04 — Progress View (04.1 – 04.4)

| ID | Name | Purpose |
|----|------|---------|
| 04.1 | Mid-challenge, day tapped | Calendar view with detail bar (missed day) |
| 04.2 | Streak = 0 | Return to challenge after gap (reset streak) |
| 04.3 | Early days (Day 3) | First week (show-up rate hidden) |
| 04.4 | Complete day tapped | Calendar with detail bar (successful day) |

### Sheet 05 — Plan Management (05.1 – 05.6)

| ID | Name | Purpose |
|----|------|---------|
| 05.1 | Plan overview | View and manage commitments |
| 05.2 | Plan at free tier cap | View plan at 4-commitment limit (lock shown) |
| 05.3 | Edit commitment (tomorrow) | Edit commitment definition (takes effect tomorrow) |
| 05.4 | Edit commitment (today) | Edit commitment definition (applies today if unlogged) |
| 05.5 | Remove confirmation | Confirmation sheet for deleting a commitment |
| 05.6 | Remove disabled | Try to remove at min 2 commitments (disabled) |

### Sheet 06 — Profile & Help (06.1 – 06.4)

| ID | Name | Purpose |
|----|------|---------|
| 06.1 | Profile with benchmark | Profile tab (showing captured benchmark) |
| 06.2 | Profile without benchmark | Profile tab (no benchmark yet; nudge to add) |
| 06.3 | About 75 Flex | Educational screen (dark background, via Help) |
| 06.4 | Help sheet | Navigation sheet (accessible from ? on any screen) |

### Sheet 07 — Completion & Restart (07.1 – 07.3)

| ID | Name | Purpose |
|----|------|---------|
| 07.1 | Day 75 completion | Celebration screen after final day logged |
| 07.2 | Post-challenge Today | Read-only state (Day 76+) |
| 07.3 | Voluntary restart | Confirmation to restart from Day 1 |

### Sheet 08 — Incremental Tracking (08.1 – 08.2)

| ID | Name | Purpose |
|----|------|---------|
| 08.1 | Water detail screen | Long-press detail for incremental commitments (water example) |
| 08.2 | Steps detail screen | Long-press detail for incremental commitments (steps example) |

## Screen Groups by Tab

### Today Tab
- Today in progress (03.1)
- Today all complete (03.2)
- Day 1 (03.3)
- Day 2 (03.4)
- Backdate: yesterday (03.5)
- Locked day (03.6)
- Day note (03.7)
- Re-engagement card (03.9)
- Sync failure (03.10)

### Progress Tab
- Calendar (04.1, 04.2, 04.3, 04.4)

### Profile Tab
- Benchmark (06.1, 06.2)
- Plan overview (05.1, 05.2)
- Edit commitment (05.3, 05.4)
- Remove commitment (05.5, 05.6)
- Settings (implied, not designed)

### Modal / Overlay Screens
- Onboarding slides (01.1 – 01.4)
- Plan builder (01.5 – 01.7b)
- Benchmark capture (02.1 – 02.5)
- Complete All confirmation (03.8)
- Remove confirmation (05.5)
- Locked day overlay (03.6)
- Day note field (03.7)
- Re-engagement card (03.9)
- Completion screen (07.1)
- Restart confirmation (07.3)
- Help sheet (06.4)
- About screen (06.3)
- Incremental detail (08.1, 08.2)

## Flow Maps

### Onboarding Flow
```
Welcome (01.1)
  ↓ Next
Your rules (01.2)
  ↓ Next
No forced resets (01.3)
  ↓ Next
Ready (01.4)
  ↓ Build my challenge
Template picker (01.5)
  ↓ Select template
Category selector (01.6)
  ↓ Select 2+ categories
Commitment definer (01.7a / 01.7b)
  ↓ Start my challenge
[Benchmark capture (02.1 / 02.2)]
  ↓ Save & start Day 1 (or skip)
[Today logging (03.1)]
```

### Daily Logging Flow
```
Today (03.1)
  ├─ Tap card → cycle state
  ├─ Tap note → open note field (03.7)
  ├─ Tap Complete All → confirm (03.8)
  └─ Tab to Yesterday (03.5)
     ├─ Tap card → cycle state
     └─ Tap Save → save day
```

### Plan Management Flow
```
Profile tab
  ↓ My plan
Plan overview (05.1)
  ├─ Tap commitment → edit (05.3)
  │   ├─ Save changes → saved
  │   └─ Remove → confirm (05.5)
  ├─ Add commitment (if space)
  └─ Restart challenge → confirm (07.3)
```

### Progress Flow
```
Progress tab
  ↓ Calendar
Show calendar (04.1, 04.2, 04.3, 04.4)
  ├─ Tap today → navigate to Today tab
  └─ Tap past day → show detail bar
```

## State-Based Navigation

| User State | Landing Screen | Available Actions |
|-----------|----------------|-------------------|
| New user | Onboarding slide 1 (01.1) | Next, resume onboarding |
| Onboarding incomplete | Next step in flow | Resume, back |
| Plan created, not started | Benchmark (02.1) or Plan review | Skip benchmark, start challenge |
| Active in progress | Today (03.1) | Log, tap Progress/Profile |
| Off-track (3+ missed) | Today with re-engagement (03.9) | Log, dismiss card |
| Challenge complete | Completion screen (07.1) | See summary, new challenge |
| Post-challenge | Read-only Today (07.2) | Start new challenge |

## Help Entry Points

The ? help button appears on all screens. Tapping opens the help sheet (06.4), which includes:
- How this works → About 75 Flex (06.3)
- Use on your computer → External link
- Help & FAQ → External link
- Contact & feedback → External link
- What's new → Release notes (not designed, placeholder)

## Visual Reference Sheets

Companion HTML files show actual designs for every screen:
- `75flex_sheet_01_onboarding.html` – Screenshots of all onboarding screens
- `75flex_sheet_02_benchmark.html` – Screenshots of benchmark capture
- `75flex_sheet_03_daily_logging.html` – Screenshots of daily logging
- ... and so on through Sheet 08

Use these alongside this document for complete visual understanding.
