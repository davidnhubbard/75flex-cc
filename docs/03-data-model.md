# 03 — Data Model

## Core Tables

### Challenges
```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT,                    -- "75 Soft challenge"
  template TEXT,                 -- "75_hard" | "75_soft" | "custom"
  start_date DATE,
  end_date DATE,                 -- calculated: start_date + 75 days
  status TEXT,                   -- "active" | "archived" | "complete"
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Notes:**
- `status = 'archived'` when user voluntarily restarts
- `status = 'complete'` when Day 75 is logged
- `end_date` is calculated on creation (immutable)
- Photos are never deleted, even if challenge is archived

### Commitments
```sql
CREATE TABLE commitments (
  id UUID PRIMARY KEY,
  challenge_id UUID REFERENCES challenges,
  category TEXT,                 -- "physical", "nutrition", "hydration", "personal_dev", etc.
  name TEXT,                     -- "One workout"
  definition TEXT,               -- "You define it"
  sort_order INT,                -- for UI ordering
  active_from INT,               -- day number when this definition became active (default 1)
  created_at TIMESTAMPTZ
);
```

**Notes:**
- Category cannot be changed mid-challenge (user defines category on Day 1)
- Definition can change anytime (tracked in CommitmentHistory)
- `active_from` tracks when this definition version started (for backfill display)

### CommitmentHistory
```sql
CREATE TABLE commitment_history (
  id UUID PRIMARY KEY,
  commitment_id UUID REFERENCES commitments,
  old_definition TEXT,
  new_definition TEXT,
  changed_on_day INT,            -- which day user made this change
  changed_at TIMESTAMPTZ
);
```

**Notes:**
- Preserves every edit
- Allows backfill to show "what did this mean on Day 5?"
- Display in plan management (last 3 changes shown by default)

### DailyLog
```sql
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY,
  challenge_id UUID REFERENCES challenges,
  day_number INT,                -- 1 to 75
  log_date DATE,                 -- which calendar date this day represents
  overall_state TEXT,            -- "none" | "partial" | "complete" (calculated from commitment logs)
  logged_at TIMESTAMPTZ,         -- when user last touched this day
  updated_at TIMESTAMPTZ
);
```

**Notes:**
- One row per day per challenge
- `overall_state` is denormalized (calculated from CommitmentLogs for fast queries)
- `log_date` allows backfill: Day 5 might be logged on Day 8

### CommitmentLog
```sql
CREATE TABLE commitment_logs (
  id UUID PRIMARY KEY,
  daily_log_id UUID REFERENCES daily_logs,
  commitment_id UUID REFERENCES commitments,
  state TEXT,                    -- "none" | "partial" | "complete"
  numeric_value INT,             -- for incremental tracking (water oz, steps, etc.)
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Notes:**
- One row per commitment per day
- `numeric_value` stores incremental progress (64 for water, 8500 for steps, etc.)
- State is always manually overridable (user can mark "complete" at any % progress)

### Benchmarks
```sql
CREATE TABLE benchmarks (
  id UUID PRIMARY KEY,
  challenge_id UUID REFERENCES challenges,
  notes_text TEXT,               -- "185 lbs, 36" waist..."
  created_at TIMESTAMPTZ
);
```

**Notes:**
- One per challenge (optional)
- Photos stored in Supabase Storage with key: `benchmarks/{challenge_id}/photo_1`, etc.
- Retained permanently even if challenge is archived

### DayNote
```sql
CREATE TABLE day_notes (
  id UUID PRIMARY KEY,
  daily_log_id UUID REFERENCES daily_logs,
  note_text TEXT,                -- "Legs were really tired but got the run in anyway."
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Notes:**
- Optional per day
- Saves automatically (no explicit "Save Note" button)

## Indexes

For performance:

```sql
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_daily_logs_challenge_id ON daily_logs(challenge_id);
CREATE INDEX idx_daily_logs_log_date ON daily_logs(log_date);
CREATE INDEX idx_commitment_logs_daily_log_id ON commitment_logs(daily_log_id);
CREATE INDEX idx_benchmarks_challenge_id ON benchmarks(challenge_id);
```

## Relationships

```
User (via auth.users)
  └─ Challenges (many)
      ├─ Commitments (many, 2-6 per challenge)
      │   └─ CommitmentHistory (many, changes over time)
      ├─ DailyLogs (75 per challenge)
      │   ├─ CommitmentLogs (many, one per commitment per day)
      │   └─ DayNote (optional, one per day)
      └─ Benchmarks (optional, one per challenge)
```

## Design Rationale

**Why CommitmentHistory instead of versioning Commitments?**
- Commitments is the current state; History is immutable log.
- Simpler to query "what was active on Day 5" without complex temporal logic.
- Preserves all edits for transparency.

**Why denormalize overall_state on DailyLog?**
- Faster queries for calendar (show completed days without joining CommitmentLogs).
- Still single source of truth: calculated from CommitmentLogs on each save.

**Why numeric_value on CommitmentLog?**
- Supports incremental tracking (water, steps) without a separate table.
- Null for non-incremental commitments (workout, nutrition).

**Why soft deletes (status) instead of hard deletes?**
- History is valuable. Never delete a challenge or its logs.
- Photos are intentionally permanent (even after restart or deletion).
- Status field allows filtering (show only "active", archive old ones).

## Constraints

```sql
-- Minimum 2 commitments per challenge
CONSTRAINT min_commitments CHECK (
  (SELECT COUNT(*) FROM commitments WHERE challenge_id = challenges.id) >= 2
);

-- Free tier max 4 commitments (enforced in application layer)
-- Paid tier max 6 commitments (enforced in application layer)

-- Day number 1-75
CONSTRAINT valid_day_number CHECK (day_number BETWEEN 1 AND 75);

-- Valid states
CONSTRAINT valid_state CHECK (state IN ('none', 'partial', 'complete'));
```
