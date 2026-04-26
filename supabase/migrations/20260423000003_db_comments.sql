-- Add database documentation comments for 75 Flex schema

-- Tables

COMMENT ON TABLE challenges IS 'One 75-day challenge run per user. A user may have multiple challenges over time (archived + active).';

COMMENT ON TABLE commitments IS 'Daily habits or commitments for a specific challenge. Multiple commitments per challenge, each trackable independently.';

COMMENT ON TABLE commitment_history IS 'Audit trail tracking when and how a commitment''s definition was modified during an active challenge.';

COMMENT ON TABLE daily_logs IS 'Daily summary state for a challenge day. Aggregates the completion status across all commitments for that day.';

COMMENT ON TABLE commitment_logs IS 'Per-habit completion record for a specific day. Links a commitment to a daily_log and records the user''s progress.';

COMMENT ON TABLE benchmarks IS 'Starting metrics and photos captured at the beginning of a challenge for progress comparison.';

COMMENT ON TABLE day_notes IS 'User''s free-form reflections and notes for a specific day in a challenge.';

-- Columns

COMMENT ON COLUMN challenges.id IS 'Unique identifier for the challenge.';
COMMENT ON COLUMN challenges.user_id IS 'Supabase auth.users ID of the challenge owner.';
COMMENT ON COLUMN challenges.title IS 'User-friendly name for the challenge (e.g., "75 Hard Round 2").';
COMMENT ON COLUMN challenges.template IS 'Template used: 75_hard (strict rules), 75_soft (flexible variant), or custom (user-defined).';
COMMENT ON COLUMN challenges.start_date IS 'Calendar date when day 1 of the challenge begins.';
COMMENT ON COLUMN challenges.end_date IS 'Calendar date when day 75 ends (typically start_date + 74 days).';
COMMENT ON COLUMN challenges.status IS 'Lifecycle state: active (current run), archived (user restarted or quit), complete (finished day 75).';
COMMENT ON COLUMN challenges.created_at IS 'Timestamp when the challenge was created.';
COMMENT ON COLUMN challenges.updated_at IS 'Timestamp of the most recent change to the challenge.';

COMMENT ON COLUMN commitments.id IS 'Unique identifier for the commitment.';
COMMENT ON COLUMN commitments.challenge_id IS 'Foreign key to the parent challenge.';
COMMENT ON COLUMN commitments.category IS 'Classification of the commitment (e.g., workout, nutrition, hydration, personal).';
COMMENT ON COLUMN commitments.name IS 'Display name of the commitment (e.g., "Run 3 miles", "Drink 2L water").';
COMMENT ON COLUMN commitments.definition IS 'Detailed description of what constitutes successful completion.';
COMMENT ON COLUMN commitments.sort_order IS 'Display order within the challenge (lower numbers appear first).';
COMMENT ON COLUMN commitments.active_from IS 'Day number when this commitment starts being tracked (e.g., 1 for day 1, 15 for day 15).';
COMMENT ON COLUMN commitments.created_at IS 'Timestamp when the commitment was first created.';

COMMENT ON COLUMN commitment_history.id IS 'Unique identifier for the history record.';
COMMENT ON COLUMN commitment_history.commitment_id IS 'Foreign key to the commitment that was modified.';
COMMENT ON COLUMN commitment_history.old_definition IS 'Previous definition before the change.';
COMMENT ON COLUMN commitment_history.new_definition IS 'Updated definition after the change.';
COMMENT ON COLUMN commitment_history.changed_on_day IS 'Day number (1-75) when the change was made.';
COMMENT ON COLUMN commitment_history.changed_at IS 'Timestamp when the definition was modified.';

COMMENT ON COLUMN daily_logs.id IS 'Unique identifier for the daily log.';
COMMENT ON COLUMN daily_logs.challenge_id IS 'Foreign key to the parent challenge.';
COMMENT ON COLUMN daily_logs.day_number IS 'Day number within the challenge (1-75).';
COMMENT ON COLUMN daily_logs.log_date IS 'Calendar date corresponding to this day.';
COMMENT ON COLUMN daily_logs.overall_state IS 'Aggregate completion state for the day: none = no commitments completed, partial = some completed, complete = all completed.';
COMMENT ON COLUMN daily_logs.logged_at IS 'Timestamp when the user marked the day as complete (null if not yet finalized).';
COMMENT ON COLUMN daily_logs.updated_at IS 'Timestamp of the most recent change to this day''s log.';

COMMENT ON COLUMN commitment_logs.id IS 'Unique identifier for the commitment log entry.';
COMMENT ON COLUMN commitment_logs.daily_log_id IS 'Foreign key to the parent daily_log.';
COMMENT ON COLUMN commitment_logs.commitment_id IS 'Foreign key to the tracked commitment.';
COMMENT ON COLUMN commitment_logs.state IS 'Per-habit completion state for the day: none = not done, partial = some effort, complete = fully done.';
COMMENT ON COLUMN commitment_logs.numeric_value IS 'Optional quantitative measurement (e.g., miles run, grams consumed, reps completed).';
COMMENT ON COLUMN commitment_logs.photo_url IS 'Public URL of the progress photo uploaded to Supabase Storage for photo-type commitments.';
COMMENT ON COLUMN commitment_logs.created_at IS 'Timestamp when the commitment log was first created.';
COMMENT ON COLUMN commitment_logs.updated_at IS 'Timestamp of the most recent change to this commitment''s daily record.';

COMMENT ON COLUMN benchmarks.id IS 'Unique identifier for the benchmark record.';
COMMENT ON COLUMN benchmarks.challenge_id IS 'Foreign key to the challenge (one benchmark per challenge).';
COMMENT ON COLUMN benchmarks.notes_text IS 'Starting measurements and baseline notes (e.g., weight, body measurements, performance metrics).';
COMMENT ON COLUMN benchmarks.photo_url IS 'Public URL of the starting photo uploaded to Supabase Storage for visual progress comparison.';
COMMENT ON COLUMN benchmarks.created_at IS 'Timestamp when the benchmark was recorded (typically on or before challenge start).';

COMMENT ON COLUMN day_notes.id IS 'Unique identifier for the note.';
COMMENT ON COLUMN day_notes.daily_log_id IS 'Foreign key to the parent daily_log (one note per day).';
COMMENT ON COLUMN day_notes.note_text IS 'User''s free-form journal entry or reflection for the day.';
COMMENT ON COLUMN day_notes.created_at IS 'Timestamp when the note was first created.';
COMMENT ON COLUMN day_notes.updated_at IS 'Timestamp of the most recent change to the note.';
