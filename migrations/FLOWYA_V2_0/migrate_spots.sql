-- Migracion de spots (seed + user) a V2.0
-- Reglas: normalizeSpotId obligatorio, SpotVersion v1 por spot, descartar coords invalidas.
-- AsyncStorage es fuente de extraccion; no replica shapes legacy.

-- Requiere tablas staging (cargadas manualmente):
-- legacy_seed_spots(legacy_id, name, type, lat, lng, city, country, short_description, has_generated_content, created_at, updated_at, created_by, raw_payload)
-- legacy_user_spots(legacy_id, name, type, lat, lng, city, country, short_description, has_generated_content, created_at, updated_at, created_by, raw_payload)

-- Tabla de auditoria de migracion (opcional, solo para registrar descartes)
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

-- Definir migration_batch_id (estatico por corrida)
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
seed_candidates as (
  select
    normalize_spot_id(legacy_id) as spot_id,
    legacy_id,
    name,
    type,
    lat,
    lng,
    city,
    country,
    short_description,
    coalesce(has_generated_content, false) as has_generated_content,
    created_at,
    updated_at,
    created_by,
    raw_payload
  from legacy_seed_spots
),
user_candidates as (
  select
    normalize_spot_id(legacy_id) as spot_id,
    legacy_id,
    name,
    type,
    lat,
    lng,
    city,
    country,
    short_description,
    coalesce(has_generated_content, false) as has_generated_content,
    created_at,
    updated_at,
    created_by,
    raw_payload
  from legacy_user_spots
),
all_candidates as (
  select *, 'seed'::text as source from seed_candidates
  union all
  select *, 'user'::text as source from user_candidates
),
invalid_coords as (
  select * from all_candidates
  where
    spot_id = '' or
    lat is null or lng is null or
    lat < -90 or lat > 90 or
    lng < -180 or lng > 180
),
valid_spots as (
  select * from all_candidates
  where not exists (
    select 1 from invalid_coords i
    where i.legacy_id = all_candidates.legacy_id
  )
)
insert into migration_audit (dataset, legacy_id, reason, payload, migration_batch_id)
select
  'spots' as dataset,
  legacy_id,
  'invalid_coordinates' as reason,
  jsonb_build_object('spot_id', spot_id, 'lat', lat, 'lng', lng, 'source', source, 'raw', raw_payload),
  params.migration_batch_id
from invalid_coords, params
on conflict do nothing;

-- Insertar spots canonicos
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
valid_spots as (
  select * from (
    select
      normalize_spot_id(legacy_id) as spot_id,
      name,
      type,
      lat,
      lng,
      city,
      country,
      short_description,
      coalesce(has_generated_content, false) as has_generated_content,
      created_at,
      updated_at,
      created_by,
      raw_payload,
      'seed'::text as source
    from legacy_seed_spots
    union all
    select
      normalize_spot_id(legacy_id) as spot_id,
      name,
      type,
      lat,
      lng,
      city,
      country,
      short_description,
      coalesce(has_generated_content, false) as has_generated_content,
      created_at,
      updated_at,
      created_by,
      raw_payload,
      'user'::text as source
    from legacy_user_spots
  ) s
  where
    s.spot_id <> '' and
    s.lat is not null and s.lng is not null and
    s.lat between -90 and 90 and
    s.lng between -180 and 180
)
insert into spots (
  id, name, type, location_lat, location_lng, location_city, location_country,
  short_description, has_generated_content, needs_review, source, created_by,
  created_at, updated_at, migration_batch_id
)
select
  spot_id,
  name,
  type,
  lat,
  lng,
  city,
  country,
  short_description,
  has_generated_content,
  false as needs_review,
  source,
  created_by,
  coalesce(created_at, now()),
  coalesce(updated_at, now()),
  params.migration_batch_id
from valid_spots, params
on conflict (id) do nothing;

-- Crear SpotContribution tipo create (append-only)
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
new_spots as (
  select s.id, s.created_by
  from spots s, params
  where s.migration_batch_id = params.migration_batch_id
),
to_insert as (
  select ns.*
  from new_spots ns, params
  where not exists (
    select 1 from spot_contributions sc
    where sc.spot_id = ns.id and sc.type = 'create'
  )
)
insert into spot_contributions (
  spot_id, author_id, type, payload, status, created_at, applied_at, applied_by, migration_batch_id
)
select
  ti.id,
  ti.created_by,
  'create',
  jsonb_build_object('spot_id', ti.id),
  'applied',
  now(),
  now(),
  ti.created_by,
  params.migration_batch_id
from to_insert ti, params;

-- Crear SpotVersion v1 por spot (snapshot inmutable)
with params as (
  select 'FLOWYA_V2_0_YYYYMMDD'::text as migration_batch_id
),
spot_base as (
  select s.*
  from spots s, params
  where s.migration_batch_id = params.migration_batch_id
),
contribs as (
  select sc.id as contribution_id, sc.spot_id
  from spot_contributions sc, params
  where sc.migration_batch_id = params.migration_batch_id
)
insert into spot_versions (
  spot_id, contribution_id, version, snapshot, created_at, created_by, migration_batch_id
)
select
  sb.id as spot_id,
  c.contribution_id,
  1 as version,
  jsonb_build_object(
    'id', sb.id,
    'name', sb.name,
    'type', sb.type,
    'location', jsonb_build_object('lat', sb.location_lat, 'lng', sb.location_lng, 'city', sb.location_city, 'country', sb.location_country),
    'shortDescription', sb.short_description,
    'hasGeneratedContent', sb.has_generated_content,
    'needsReview', sb.needs_review
  ) as snapshot,
  now(),
  sb.created_by,
  params.migration_batch_id
from spot_base sb
left join contribs c on c.spot_id = sb.id
, params
where not exists (
  select 1 from spot_versions sv where sv.spot_id = sb.id and sv.version = 1
);

-- Nota: SpotMediaPublic no se migra automaticamente desde URLs externas.
-- Si existen assets en Storage, crear registros en spot_media_public en un script aparte.
