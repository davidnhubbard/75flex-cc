-- Add photo storage to commitment_logs
alter table commitment_logs add column photo_url text;

-- Progress photos bucket (public so we can use stable URLs without signed-URL expiry)
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', true)
on conflict (id) do nothing;

-- Only the owning user can upload/delete; anyone can read (URL is unguessable)
create policy "Users upload own progress photos"
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "Public read progress photos"
  on storage.objects for select
  using (bucket_id = 'progress-photos');

create policy "Users delete own progress photos"
  on storage.objects for delete
  using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "Users update own progress photos"
  on storage.objects for update
  using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );
