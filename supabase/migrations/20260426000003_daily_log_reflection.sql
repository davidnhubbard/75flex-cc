-- B31: End-of-day reflection on daily_logs
-- Values: 'felt_good' | 'tough_but_done' | 'almost_quit'

ALTER TABLE daily_logs
  ADD COLUMN reflection text
    CHECK (reflection IN ('felt_good', 'tough_but_done', 'almost_quit'));

COMMENT ON COLUMN daily_logs.reflection IS
  'Optional end-of-day reflection: felt_good | tough_but_done | almost_quit';
