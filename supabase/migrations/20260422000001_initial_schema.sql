-- 75 Flex initial schema

create table challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  template text not null check (template in ('75_hard', '75_soft', 'custom')),
  start_date date not null,
  end_date date not null,
  status text not null default 'active' check (status in ('active', 'archived', 'complete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table commitments (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges not null,
  category text not null,
  name text not null,
  definition text,
  sort_order int not null default 0,
  active_from int not null default 1,
  created_at timestamptz not null default now()
);

create table commitment_history (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid references commitments not null,
  old_definition text,
  new_definition text,
  changed_on_day int not null,
  changed_at timestamptz not null default now()
);

create table daily_logs (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges not null,
  day_number int not null check (day_number between 1 and 75),
  log_date date not null,
  overall_state text not null default 'none' check (overall_state in ('none', 'partial', 'complete')),
  logged_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (challenge_id, day_number)
);

create table commitment_logs (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid references daily_logs not null,
  commitment_id uuid references commitments not null,
  state text not null default 'none' check (state in ('none', 'partial', 'complete')),
  numeric_value int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (daily_log_id, commitment_id)
);

create table benchmarks (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges not null unique,
  notes_text text,
  created_at timestamptz not null default now()
);

create table day_notes (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid references daily_logs not null unique,
  note_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_challenges_user_id on challenges (user_id);
create index idx_commitments_challenge_id on commitments (challenge_id);
create index idx_daily_logs_challenge_id on daily_logs (challenge_id);
create index idx_daily_logs_log_date on daily_logs (log_date);
create index idx_commitment_logs_daily_log_id on commitment_logs (daily_log_id);
create index idx_benchmarks_challenge_id on benchmarks (challenge_id);

-- RLS
alter table challenges enable row level security;
alter table commitments enable row level security;
alter table commitment_history enable row level security;
alter table daily_logs enable row level security;
alter table commitment_logs enable row level security;
alter table benchmarks enable row level security;
alter table day_notes enable row level security;

create policy "users see own challenges"
  on challenges for all
  using (auth.uid() = user_id);

create policy "users see own commitments"
  on commitments for all
  using (challenge_id in (select id from challenges where user_id = auth.uid()));

create policy "users see own commitment history"
  on commitment_history for all
  using (commitment_id in (
    select c.id from commitments c
    join challenges ch on ch.id = c.challenge_id
    where ch.user_id = auth.uid()
  ));

create policy "users see own daily logs"
  on daily_logs for all
  using (challenge_id in (select id from challenges where user_id = auth.uid()));

create policy "users see own commitment logs"
  on commitment_logs for all
  using (daily_log_id in (
    select dl.id from daily_logs dl
    join challenges ch on ch.id = dl.challenge_id
    where ch.user_id = auth.uid()
  ));

create policy "users see own benchmarks"
  on benchmarks for all
  using (challenge_id in (select id from challenges where user_id = auth.uid()));

create policy "users see own day notes"
  on day_notes for all
  using (daily_log_id in (
    select dl.id from daily_logs dl
    join challenges ch on ch.id = dl.challenge_id
    where ch.user_id = auth.uid()
  ));
