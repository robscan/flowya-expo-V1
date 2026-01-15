-- Migracion de pins (privados)
-- Reglas: normalizeSpotId obligatorio; user_id requerido; media privada solo si existe en Storage.

-- Requiere tablas staging (cargadas manualmente):
-- legacy_pins(user_id, spot_id, state, pinned_at, visited_at, notes, personal_photos, source, updated_at, raw_payload)
--   source: 'async' | 'supabase'

create table if not exists migration_audit (
  id uuid primary key default gen_random_uuid(),
  dataset text not null,
  legacy_id text,
  reason text not null,
  payload jsonb,
  created_at timestamptz not null default now(),
  migration_batch_id text
);

alter table migration_audit
  add column if not exists migration_batch_id text;

with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
normalized as (
  select
    user_id,
    normalize_spot_id(spot_id) as spot_id_norm,
    state,
    pinned_at,
    visited_at,
    notes,
    personal_photos,
    source,
    updated_at,
    raw_payload
  from legacy_pins
),
invalid as (
  select * from normalized
  where user_id is null or spot_id_norm = ''
),
valid as (
  select * from normalized
  where not exists (
    select 1 from invalid i
    where i.user_id = normalized.user_id
      and i.spot_id_norm = normalized.spot_id_norm
      and i.updated_at = normalized.updated_at
  )
),
dedup as (
  select distinct on (user_id, spot_id_norm)
    user_id,
    spot_id_norm,
    state,
    pinned_at,
    visited_at,
    notes,
    personal_photos,
    source,
    updated_at
  from valid
  order by user_id, spot_id_norm, updated_at desc
),
filtered_photos as (
  select
    user_id,
    spot_id_norm,
    state,
    pinned_at,
    visited_at,
    notes,
    case
      when personal_photos is null then null
      else array(
        select p
        from unnest(personal_photos) as p
        where p like 'flowya-private-pins/%'
      )
    end as personal_photos
  from dedup
)
insert into migration_audit (dataset, legacy_id, reason, payload, migration_batch_id)
select
  'pins' as dataset,
  coalesce(user_id::text, 'unknown') || ':' || coalesce(spot_id_norm, '') as legacy_id,
  'invalid_user_or_spot_id' as reason,
  jsonb_build_object('raw', raw_payload),
  params.migration_batch_id
from invalid, params
on conflict do nothing;

-- Insert/Upsert pins
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
normalized as (
  select
    user_id,
    normalize_spot_id(spot_id) as spot_id_norm,
    state,
    pinned_at,
    visited_at,
    notes,
    personal_photos,
    source,
    updated_at,
    raw_payload
  from legacy_pins
),
invalid as (
  select * from normalized
  where user_id is null or spot_id_norm = ''
),
valid as (
  select * from normalized
  where not exists (
    select 1 from invalid i
    where i.user_id = normalized.user_id
      and i.spot_id_norm = normalized.spot_id_norm
      and i.updated_at = normalized.updated_at
  )
),
dedup as (
  select distinct on (user_id, spot_id_norm)
    user_id,
    spot_id_norm,
    state,
    pinned_at,
    visited_at,
    notes,
    personal_photos,
    source,
    updated_at
  from valid
  order by user_id, spot_id_norm, updated_at desc
),
filtered_photos as (
  select
    user_id,
    spot_id_norm,
    state,
    pinned_at,
    visited_at,
    notes,
    case
      when personal_photos is null then null
      else array(
        select p
        from unnest(personal_photos) as p
        where p like 'flowya-private-pins/%'
      )
    end as personal_photos
  from dedup
),
filtered as (
  select * from filtered_photos
)
insert into pins (
  spot_id, user_id, state, pinned_at, visited_at, notes, personal_photos, migration_batch_id
)
select
  spot_id_norm,
  user_id,
  state,
  coalesce(pinned_at, now()),
  visited_at,
  notes,
  personal_photos,
  params.migration_batch_id
from filtered, params
on conflict (spot_id, user_id) do update
set
  state = excluded.state,
  pinned_at = excluded.pinned_at,
  visited_at = excluded.visited_at,
  notes = excluded.notes,
  personal_photos = excluded.personal_photos,
  migration_batch_id = excluded.migration_batch_id;
