-- Add structured goal fields to commitments for hydration tracking
alter table commitments add column if not exists target_value numeric;
alter table commitments add column if not exists target_unit  text check (target_unit in ('oz', 'ml'));
