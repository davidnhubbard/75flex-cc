-- Add required flag to commitments
-- Controls whether a photo commitment must have a photo for the day to be complete
alter table commitments add column required boolean not null default false;

comment on column commitments.required is 'For photo commitments: if true, a photo must be taken for the day to be marked complete. If false, the photo is optional and does not affect overall day state.';
