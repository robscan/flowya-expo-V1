-- Carga asistida de datos legacy (para SQL Editor)
-- Uso: pega este archivo en SQL Editor y reemplaza los bloques JSON.
-- Cada bloque espera un JSON array: [ {...}, {...} ]

-- 1) legacy_seed_spots
with payload as (
  select
    '[]'::jsonb as data -- reemplaza con tu JSON array de seeds
)
insert into legacy_seed_spots (
  legacy_id, name, type, lat, lng, city, country, short_description,
  has_generated_content, created_at, updated_at, created_by, raw_payload
)
select
  item->>'legacy_id',
  item->>'name',
  item->>'type',
  (item->>'lat')::double precision,
  (item->>'lng')::double precision,
  item->>'city',
  item->>'country',
  item->>'short_description',
  coalesce((item->>'has_generated_content')::boolean, false),
  (item->>'created_at')::timestamptz,
  (item->>'updated_at')::timestamptz,
  nullif(item->>'created_by','')::uuid,
  item->'raw_payload'
from payload, jsonb_array_elements(payload.data) as item;

-- 2) legacy_user_spots
with payload as (
  select
    '[]'::jsonb as data -- reemplaza con tu JSON array de user spots
)
insert into legacy_user_spots (
  legacy_id, name, type, lat, lng, city, country, short_description,
  has_generated_content, created_at, updated_at, created_by, raw_payload
)
select
  item->>'legacy_id',
  item->>'name',
  item->>'type',
  (item->>'lat')::double precision,
  (item->>'lng')::double precision,
  item->>'city',
  item->>'country',
  item->>'short_description',
  coalesce((item->>'has_generated_content')::boolean, false),
  (item->>'created_at')::timestamptz,
  (item->>'updated_at')::timestamptz,
  nullif(item->>'created_by','')::uuid,
  item->'raw_payload'
from payload, jsonb_array_elements(payload.data) as item;

-- 3) legacy_pins
with payload as (
  select
    '[]'::jsonb as data -- reemplaza con tu JSON array de pins
)
insert into legacy_pins (
  user_id, spot_id, state, pinned_at, visited_at, notes, personal_photos,
  source, updated_at, raw_payload
)
select
  nullif(item->>'user_id','')::uuid,
  item->>'spot_id',
  item->>'state',
  (item->>'pinned_at')::timestamptz,
  (item->>'visited_at')::timestamptz,
  item->>'notes',
  case
    when jsonb_typeof(item->'personal_photos') = 'array'
      then array(select jsonb_array_elements_text(item->'personal_photos'))
    else null
  end,
  item->>'source',
  (item->>'updated_at')::timestamptz,
  item->'raw_payload'
from payload, jsonb_array_elements(payload.data) as item;

-- 4) legacy_flows
with payload as (
  select
    '[]'::jsonb as data -- reemplaza con tu JSON array de flows
)
insert into legacy_flows (
  id, title, description, estimated_duration, movement_mode, spots,
  metadata, created_at, updated_at, created_by, raw_payload
)
select
  item->>'id',
  item->>'title',
  item->>'description',
  coalesce((item->>'estimated_duration')::int, 0),
  item->>'movement_mode',
  case
    when jsonb_typeof(item->'spots') = 'array'
      then array(select jsonb_array_elements_text(item->'spots'))
    else array[]::text[]
  end,
  item->'metadata',
  (item->>'created_at')::timestamptz,
  (item->>'updated_at')::timestamptz,
  nullif(item->>'created_by','')::uuid,
  item->'raw_payload'
from payload, jsonb_array_elements(payload.data) as item;

-- 5) legacy_flow_runs
with payload as (
  select
    '[]'::jsonb as data -- reemplaza con tu JSON array de flow runs
)
insert into legacy_flow_runs (
  id, flow_id, user_id, status, current_spot_index, current_narration_block,
  started_at, paused_at, is_minimized, created_at, updated_at, raw_payload
)
select
  nullif(item->>'id','')::uuid,
  item->>'flow_id',
  nullif(item->>'user_id','')::uuid,
  item->>'status',
  coalesce((item->>'current_spot_index')::int, 0),
  item->>'current_narration_block',
  (item->>'started_at')::timestamptz,
  (item->>'paused_at')::timestamptz,
  coalesce((item->>'is_minimized')::boolean, false),
  (item->>'created_at')::timestamptz,
  (item->>'updated_at')::timestamptz,
  item->'raw_payload'
from payload, jsonb_array_elements(payload.data) as item;

-- 6) legacy_profiles
with payload as (
  select
    '[]'::jsonb as data -- reemplaza con tu JSON array de profiles
)
insert into legacy_profiles (
  user_id, display_name, avatar_path, bio, raw_payload
)
select
  nullif(item->>'user_id','')::uuid,
  item->>'display_name',
  item->>'avatar_path',
  item->>'bio',
  item->'raw_payload'
from payload, jsonb_array_elements(payload.data) as item;
