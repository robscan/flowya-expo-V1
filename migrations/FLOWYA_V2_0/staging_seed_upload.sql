-- Staging para cargar seeds via CSV y luego migrar a spots canonicos
-- Paso 1: crear staging
create table if not exists seed_upload (
  id text,
  name text,
  type text,
  lat double precision,
  lng double precision,
  city text,
  country text,
  "shortDescription" text,
  "hasGeneratedContent" boolean,
  "createdAt" timestamptz,
  "updatedAt" timestamptz
);

-- Paso 2: migrar desde staging a spots + contributions + versions
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
valid as (
  select *
  from seed_upload
  where
    id is not null and id <> '' and
    name is not null and name <> '' and
    type is not null and type <> '' and
    lat is not null and lng is not null and
    lat between -90 and 90 and
    lng between -180 and 180 and
    type in ('beach','cafe','viewpoint','museum','restaurant','park','monument','market','other')
)
insert into spots (
  id, name, type, location_lat, location_lng, location_city, location_country,
  short_description, has_generated_content, needs_review, source, created_at, updated_at,
  migration_batch_id
)
select
  id, name, type, lat, lng, city, country,
  "shortDescription", coalesce("hasGeneratedContent", false), false, 'seed',
  coalesce("createdAt", now()), coalesce("updatedAt", now()),
  params.migration_batch_id
from valid, params
on conflict (id) do nothing;

-- SpotContributions tipo create
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
new_spots as (
  select s.id
  from spots s, params
  where s.migration_batch_id = params.migration_batch_id
)
insert into spot_contributions (
  spot_id, author_id, type, payload, status, created_at, applied_at, applied_by, migration_batch_id
)
select
  ns.id,
  null,
  'create',
  jsonb_build_object('spot_id', ns.id),
  'applied',
  now(),
  now(),
  null,
  params.migration_batch_id
from new_spots ns, params
where not exists (
  select 1 from spot_contributions sc
  where sc.spot_id = ns.id and sc.type = 'create'
);

-- SpotVersion v1 por spot
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
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
  null,
  params.migration_batch_id
from spot_base sb
left join contribs c on c.spot_id = sb.id
, params
where not exists (
  select 1 from spot_versions sv where sv.spot_id = sb.id and sv.version = 1
);
