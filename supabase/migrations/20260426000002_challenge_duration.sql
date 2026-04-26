alter table challenges
  add column if not exists duration_days integer not null default 75;
