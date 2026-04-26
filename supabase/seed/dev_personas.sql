-- ─────────────────────────────────────────────────────────────────────────────
-- Dev persona seed data
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Safe to re-run: wipes and rebuilds each persona's data from scratch
--
-- Personas:
--   davidnhubbard+day2@gmail.com     → Day 2, fresh start
--   davidnhubbard+reengage@gmail.com → Day 15, missed last 3 days (re-engagement card)
--   davidnhubbard+day60@gmail.com    → Day 60, strong consistency
--   davidnhubbard+day75@gmail.com    → Day 75, challenge complete
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  uid_day2     uuid;
  uid_reengage uuid;
  uid_day60    uuid;
  uid_day75    uuid;
  cid          uuid;
  comms        uuid[];
  dl_id        uuid;
  day_n        integer;
  state_val    text;
BEGIN

-- ── Resolve user IDs ──────────────────────────────────────────────────────────

SELECT id INTO uid_day2     FROM auth.users WHERE email = 'davidnhubbard+day2@gmail.com';
SELECT id INTO uid_reengage FROM auth.users WHERE email = 'davidnhubbard+reengage@gmail.com';
SELECT id INTO uid_day60    FROM auth.users WHERE email = 'davidnhubbard+day60@gmail.com';
SELECT id INTO uid_day75    FROM auth.users WHERE email = 'davidnhubbard+day75@gmail.com';

-- ══════════════════════════════════════════════════════════════════════════════
-- PERSONA: Day 2
-- Today is day 2. Day 1 was logged complete.
-- ══════════════════════════════════════════════════════════════════════════════

IF uid_day2 IS NOT NULL THEN
  -- Clean up (reverse FK order)
  DELETE FROM day_notes        WHERE daily_log_id IN (SELECT dl.id FROM daily_logs dl JOIN challenges c ON c.id = dl.challenge_id WHERE c.user_id = uid_day2);
  DELETE FROM commitment_logs  WHERE daily_log_id IN (SELECT dl.id FROM daily_logs dl JOIN challenges c ON c.id = dl.challenge_id WHERE c.user_id = uid_day2);
  DELETE FROM commitment_history WHERE commitment_id IN (SELECT cm.id FROM commitments cm JOIN challenges c ON c.id = cm.challenge_id WHERE c.user_id = uid_day2);
  DELETE FROM daily_logs       WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = uid_day2);
  DELETE FROM commitments      WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = uid_day2);
  DELETE FROM benchmarks       WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = uid_day2);
  DELETE FROM challenges       WHERE user_id = uid_day2;

  INSERT INTO challenges (user_id, title, template, start_date, end_date, status)
  VALUES (uid_day2, '75 Flex', '75_soft', CURRENT_DATE - 1, CURRENT_DATE + 73, 'active')
  RETURNING id INTO cid;

  INSERT INTO commitments (challenge_id, category, name, definition, sort_order, active_from) VALUES
    (cid, 'physical',  'One Workout',    '30 minutes minimum, any movement counts', 0, 1),
    (cid, 'hydration', 'Drink 2L Water', null, 1, 1);

  SELECT array_agg(id ORDER BY sort_order) INTO comms FROM commitments WHERE challenge_id = cid;

  -- Day 1: complete
  INSERT INTO daily_logs (challenge_id, day_number, log_date, overall_state, logged_at)
  VALUES (cid, 1, CURRENT_DATE - 1, 'complete', (CURRENT_DATE - 1)::timestamptz + interval '21 hours')
  RETURNING id INTO dl_id;

  INSERT INTO commitment_logs (daily_log_id, commitment_id, state) VALUES
    (dl_id, comms[1], 'complete'),
    (dl_id, comms[2], 'complete');

  RAISE NOTICE 'Seeded: Day 2 persona';
END IF;

-- ══════════════════════════════════════════════════════════════════════════════
-- PERSONA: Re-engage (Day 15, missed last 3 days)
-- Days 1–11 logged (mix of complete/partial). Days 12–14 missed. Today = day 15.
-- ══════════════════════════════════════════════════════════════════════════════

IF uid_reengage IS NOT NULL THEN
  DELETE FROM day_notes        WHERE daily_log_id IN (SELECT dl.id FROM daily_logs dl JOIN challenges c ON c.id = dl.challenge_id WHERE c.user_id = uid_reengage);
  DELETE FROM commitment_logs  WHERE daily_log_id IN (SELECT dl.id FROM daily_logs dl JOIN challenges c ON c.id = dl.challenge_id WHERE c.user_id = uid_reengage);
  DELETE FROM commitment_history WHERE commitment_id IN (SELECT cm.id FROM commitments cm JOIN challenges c ON c.id = cm.challenge_id WHERE c.user_id = uid_reengage);
  DELETE FROM daily_logs       WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = uid_reengage);
  DELETE FROM commitments      WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = uid_reengage);
  DELETE FROM benchmarks       WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = uid_reengage);
  DELETE FROM challenges       WHERE user_id = uid_reengage;

  INSERT INTO challenges (user_id, title, template, start_date, end_date, status)
  VALUES (uid_reengage, '75 Flex', '75_soft', CURRENT_DATE - 14, CURRENT_DATE + 60, 'active')
  RETURNING id INTO cid;

  INSERT INTO commitments (challenge_id, category, name, definition, sort_order, active_from) VALUES
    (cid, 'physical',  'One Workout',    '30 min exercise',    0, 1),
    (cid, 'nutrition', 'No Junk Food',   null,                 1, 1),
    (cid, 'hydration', 'Drink 2L Water', null,                 2, 1);

  SELECT array_agg(id ORDER BY sort_order) INTO comms FROM commitments WHERE challenge_id = cid;

  -- Days 1–11: complete except day 4 and 8 are partial
  FOR day_n IN 1..11 LOOP
    state_val := CASE WHEN day_n IN (4, 8) THEN 'partial' ELSE 'complete' END;

    INSERT INTO daily_logs (challenge_id, day_number, log_date, overall_state, logged_at)
    VALUES (cid, day_n, CURRENT_DATE - 14 + day_n - 1, state_val, (CURRENT_DATE - 14 + day_n - 1)::timestamptz + interval '21 hours')
    RETURNING id INTO dl_id;

    INSERT INTO commitment_logs (daily_log_id, commitment_id, state) VALUES
      (dl_id, comms[1], CASE WHEN state_val = 'complete' THEN 'complete' ELSE 'partial' END),
      (dl_id, comms[2], 'complete'),
      (dl_id, comms[3], 'complete');
  END LOOP;

  -- Days 12–14: no logs (triggers re-engagement card on day 15)

  RAISE NOTICE 'Seeded: Re-engage persona';
END IF;

-- ══════════════════════════════════════════════════════════════════════════════
-- PERSONA: Day 60
-- 59 days logged with strong consistency. Today = day 60, not yet logged.
-- ══════════════════════════════════════════════════════════════════════════════

IF uid_day60 IS NOT NULL THEN
  DELETE FROM day_notes        WHERE daily_log_id IN (SELECT dl.id FROM daily_logs dl JOIN challenges c ON c.id = dl.challenge_id WHERE c.user_id = uid_day60);
  DELETE FROM commitment_logs  WHERE daily_log_id IN (SELECT dl.id FROM daily_logs dl JOIN challenges c ON c.id = dl.challenge_id WHERE c.user_id = uid_day60);
  DELETE FROM commitment_history WHERE commitment_id IN (SELECT cm.id FROM commitments cm JOIN challenges c ON c.id = cm.challenge_id WHERE c.user_id = uid_day60);
  DELETE FROM daily_logs       WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = uid_day60);
  DELETE FROM commitments      WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = uid_day60);
  DELETE FROM benchmarks       WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = uid_day60);
  DELETE FROM challenges       WHERE user_id = uid_day60;

  INSERT INTO challenges (user_id, title, template, start_date, end_date, status)
  VALUES (uid_day60, '75 Hard', '75_hard', CURRENT_DATE - 59, CURRENT_DATE + 15, 'active')
  RETURNING id INTO cid;

  INSERT INTO commitments (challenge_id, category, name, definition, sort_order, active_from) VALUES
    (cid, 'physical',     'Two Workouts',   'Two 45-min sessions, one must be outdoor', 0, 1),
    (cid, 'nutrition',    'Clean Diet',      'No alcohol, no cheat meals',               1, 1),
    (cid, 'hydration',    'Drink 1 Gallon',  null,                                       2, 1),
    (cid, 'personal_dev', 'Read 10 Pages',   'Non-fiction only',                         3, 1);

  SELECT array_agg(id ORDER BY sort_order) INTO comms FROM commitments WHERE challenge_id = cid;

  -- Days 1–59: mostly complete, a few partial, two missed
  FOR day_n IN 1..59 LOOP
    state_val := CASE
      WHEN day_n IN (12, 33) THEN 'none'
      WHEN day_n % 7 = 0     THEN 'partial'
      ELSE 'complete'
    END;

    INSERT INTO daily_logs (challenge_id, day_number, log_date, overall_state, logged_at)
    VALUES (cid, day_n, CURRENT_DATE - 59 + day_n - 1, state_val, (CURRENT_DATE - 59 + day_n - 1)::timestamptz + interval '21 hours')
    RETURNING id INTO dl_id;

    IF state_val != 'none' THEN
      INSERT INTO commitment_logs (daily_log_id, commitment_id, state) VALUES
        (dl_id, comms[1], CASE WHEN state_val = 'complete' THEN 'complete' ELSE 'partial' END),
        (dl_id, comms[2], 'complete'),
        (dl_id, comms[3], 'complete'),
        (dl_id, comms[4], CASE WHEN state_val = 'complete' THEN 'complete' ELSE 'partial' END);
    END IF;
  END LOOP;

  RAISE NOTICE 'Seeded: Day 60 persona';
END IF;

-- ══════════════════════════════════════════════════════════════════════════════
-- PERSONA: Day 75 complete
-- All 75 days logged. Day 75 is complete → redirects to /complete screen.
-- ══════════════════════════════════════════════════════════════════════════════

IF uid_day75 IS NOT NULL THEN
  DELETE FROM day_notes        WHERE daily_log_id IN (SELECT dl.id FROM daily_logs dl JOIN challenges c ON c.id = dl.challenge_id WHERE c.user_id = uid_day75);
  DELETE FROM commitment_logs  WHERE daily_log_id IN (SELECT dl.id FROM daily_logs dl JOIN challenges c ON c.id = dl.challenge_id WHERE c.user_id = uid_day75);
  DELETE FROM commitment_history WHERE commitment_id IN (SELECT cm.id FROM commitments cm JOIN challenges c ON c.id = cm.challenge_id WHERE c.user_id = uid_day75);
  DELETE FROM daily_logs       WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = uid_day75);
  DELETE FROM commitments      WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = uid_day75);
  DELETE FROM benchmarks       WHERE challenge_id IN (SELECT id FROM challenges WHERE user_id = uid_day75);
  DELETE FROM challenges       WHERE user_id = uid_day75;

  INSERT INTO challenges (user_id, title, template, start_date, end_date, status)
  VALUES (uid_day75, '75 Flex', '75_soft', CURRENT_DATE - 74, CURRENT_DATE, 'active')
  RETURNING id INTO cid;

  INSERT INTO commitments (challenge_id, category, name, definition, sort_order, active_from) VALUES
    (cid, 'physical',  'One Workout',    '30 min minimum', 0, 1),
    (cid, 'nutrition', 'No Junk Food',   null,             1, 1),
    (cid, 'hydration', 'Drink 2L Water', null,             2, 1);

  SELECT array_agg(id ORDER BY sort_order) INTO comms FROM commitments WHERE challenge_id = cid;

  -- All 75 days: complete except a few partial, day 75 always complete
  FOR day_n IN 1..75 LOOP
    state_val := CASE
      WHEN day_n % 10 = 0 THEN 'partial'
      ELSE 'complete'
    END;

    INSERT INTO daily_logs (challenge_id, day_number, log_date, overall_state, logged_at)
    VALUES (cid, day_n, CURRENT_DATE - 74 + day_n - 1, state_val, (CURRENT_DATE - 74 + day_n - 1)::timestamptz + interval '21 hours')
    RETURNING id INTO dl_id;

    INSERT INTO commitment_logs (daily_log_id, commitment_id, state) VALUES
      (dl_id, comms[1], CASE WHEN state_val = 'complete' THEN 'complete' ELSE 'partial' END),
      (dl_id, comms[2], 'complete'),
      (dl_id, comms[3], 'complete');
  END LOOP;

  RAISE NOTICE 'Seeded: Day 75 persona';
END IF;

END $$;
