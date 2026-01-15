-- Migracion de perfiles minimizados y stats derivados
-- Regla: crear user_profile solo si el usuario existe en auth.users. No inventar PII.

-- Requiere tablas staging (cargadas manualmente):
-- legacy_profiles(user_id, display_name, avatar_path, bio, raw_payload)

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
valid_profiles as (
  select lp.*
  from legacy_profiles lp
  join auth.users u on u.id = lp.user_id
)
insert into user_profile (
  user_id, display_name, avatar_path, bio, migration_batch_id
)
select
  user_id,
  display_name,
  avatar_path,
  bio,
  params.migration_batch_id
from valid_profiles, params
on conflict (user_id) do nothing;

-- Registrar descartes (usuarios inexistentes)
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
)
insert into migration_audit (dataset, legacy_id, reason, payload, migration_batch_id)
select
  'user_profile',
  lp.user_id::text,
  'user_not_found',
  jsonb_build_object('raw', lp.raw_payload),
  params.migration_batch_id
from legacy_profiles lp
left join auth.users u on u.id = lp.user_id
, params
where u.id is null
on conflict do nothing;

-- UserStats derivado desde contribuciones aplicadas
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
applied as (
  select author_id as user_id, count(*) as applied_count
  from spot_contributions
  where status = 'applied' and author_id is not null
  group by author_id
)
insert into user_stats (user_id, trust_level, applied_contributions_count, last_calculated_at, migration_batch_id)
select
  u.id,
  case
    when coalesce(a.applied_count, 0) = 0 then 'nuevo'
    when coalesce(a.applied_count, 0) between 1 and 2 then 'creciente'
    else 'confiable'
  end as trust_level,
  coalesce(a.applied_count, 0) as applied_contributions_count,
  now(),
  params.migration_batch_id
from auth.users u
left join applied a on a.user_id = u.id, params
on conflict (user_id) do update
set
  trust_level = excluded.trust_level,
  applied_contributions_count = excluded.applied_contributions_count,
  last_calculated_at = excluded.last_calculated_at,
  migration_batch_id = excluded.migration_batch_id;
