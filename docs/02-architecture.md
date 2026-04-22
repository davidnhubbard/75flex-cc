# 02 — Architecture

## System Overview

75 Flex is a three-layer system:
- **Frontend:** React Native (mobile) + Next.js (web)
- **Backend:** Supabase (PostgreSQL + auth + storage)
- **State:** Redux (mobile) or React Context (web) + local persistence

## Data Flow

### Challenge Lifecycle

```
User → Onboarding → Create Challenge → Active (Days 1-75) → Complete/Archive
                         ↓
                    Plan Builder
                    (customize commitments)
```

At any point during Active, user can voluntarily restart (previous run archived, new run starts Day 1).

### Daily Logging Flow

```
User opens app → Route to state
  ├─ Onboarding incomplete? → Resume at next step
  ├─ Plan created, not started? → Show plan review + "Start Day 1" CTA
  ├─ Active in progress? → Today logging screen
  ├─ Off-track (3+ missed days)? → Show re-engagement card above log
  └─ Complete (Day 75 done)? → Show read-only post-challenge state
```

### State Management

**Mobile (React Native):**
- Redux for global state (challenges, daily logs, user settings)
- Local persistence via AsyncStorage
- Syncs to Supabase on next successful network call

**Web (Next.js):**
- React Context for session state
- SWR or React Query for server state
- Automatic sync on focus

## API Design (Supabase)

### Authentication
- Email + password (built-in Supabase Auth)
- OAuth (Google, Apple) — post-MVP
- Session tokens stored in secure storage (mobile) or cookies (web)

### Real-time Sync
- Challenges table: read-only (user can't edit their own)
- DailyLog table: read-write with RLS policies
- Commitments table: read-only at runtime, write-only from frontend during updates
- Photos in Supabase Storage (permanent, never deleted)

### Offline Strategy
- All state cached locally
- Tap-based logging works offline immediately
- On reconnect, queue syncs any unsaved changes
- Conflict resolution: server wins (last-write-wins)
- Show quiet banner "Having trouble saving · your progress is stored locally" if sync fails

## Key Architectural Decisions

**Why no forced resets?**
- Resets punish users for missing a day. That's demotivating.
- Instead: preserve all history, let users voluntarily restart.
- Technically: Challenge records are archived, never deleted. Photos stay forever.

**Why 3-day logging window?**
- Users need time to backdate if they forgot to log.
- After 3 days, day locks (prevents data inconsistency).
- Locked days auto-mark as missed (transparent, not punitive).

**Why instant-save on Today, explicit Save on backdate?**
- Today is the critical path — keep it frictionless (instant-save on tap).
- Backdate is an edge case — explicit Save reduces accidental changes.
- Different UX patterns signal different intent.

**Why save commitment versions, not just current state?**
- User edits "One workout" to "45-min gym" on Day 20.
- Day 5 (already logged) should show what "one workout" meant back then.
- Technically: CommitmentHistory table with old_definition, new_definition, changed_on_day.

**Why no red error states?**
- Red is alarming. Missed days happen. Show them honestly but quietly.
- Use muted colors for "not started." Use green only for "done" or "partial."
- No shame language anywhere.

## RLS (Row-Level Security) Policy

All Supabase tables protected:

```sql
-- Challenges: users can only see their own
WHERE auth.uid() = user_id

-- DailyLogs: users can only see their own challenge's logs
WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = auth.uid())

-- CommitmentLogs: same as above
-- Benchmarks: same as above
-- DayNotes: same as above
```

## Scalability Notes

Current design scales to:
- Millions of users (Supabase handles it)
- Thousands of days per user (75 days → future: multiple challenge runs)
- Real-time sync across devices (RLS policies keep data secure)

Post-MVP scaling concerns:
- Analytics queries might need indexing on (user_id, challenge_id, log_date)
- Photo storage (unlimited users, multiple photos per user) — monitor Supabase Storage costs
- If insights/analytics become complex, consider separate analytics database

See `08-future-growth.md` for roadmap.
