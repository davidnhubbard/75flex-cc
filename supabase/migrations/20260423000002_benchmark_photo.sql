-- Add photo storage to benchmarks
alter table benchmarks add column photo_url text;

-- Benchmark photos bucket
insert into storage.buckets (id, name, public)
values ('benchmark-photos', 'benchmark-photos', true)
on conflict (id) do nothing;

create policy "Users upload own benchmark photos"
  on storage.objects for insert
  with check (
    bucket_id = 'benchmark-photos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "Public read benchmark photos"
  on storage.objects for select
  using (bucket_id = 'benchmark-photos');

create policy "Users delete own benchmark photos"
  on storage.objects for delete
  using (
    bucket_id = 'benchmark-photos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "Users update own benchmark photos"
  on storage.objects for update
  using (
    bucket_id = 'benchmark-photos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );
