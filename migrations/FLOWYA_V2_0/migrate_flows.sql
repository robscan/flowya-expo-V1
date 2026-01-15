-- Migracion de flows y flow_runs (si existen)
-- Fuente: AsyncStorage (@flowya_flows) y cualquier cache legacy equivalente.

-- Requiere tablas staging (cargadas manualmente):
-- legacy_flows(id, title, description, estimated_duration, movement_mode, spots, metadata, created_at, updated_at, created_by, raw_payload)
-- legacy_flow_runs(id, flow_id, user_id, status, current_spot_index, current_narration_block, started_at, paused_at, is_minimized, created_at, updated_at, raw_payload)

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
    id,
    title,
    description,
    estimated_duration,
    movement_mode,
    array(
      select normalize_spot_id(s)
      from unnest(spots) as s
      where normalize_spot_id(s) <> ''
    ) as spot_ids,
    metadata,
    created_at,
    updated_at,
    created_by,
    raw_payload
  from legacy_flows
),
invalid as (
  select * from normalized
  where id is null or id = '' or movement_mode not in ('walking','bike','car')
),
valid as (
  select * from normalized
  where not exists (
    select 1 from invalid i where i.id = normalized.id
  )
)
insert into migration_audit (dataset, legacy_id, reason, payload, migration_batch_id)
select
  'flows' as dataset,
  id as legacy_id,
  'invalid_flow' as reason,
  jsonb_build_object('raw', raw_payload),
  params.migration_batch_id
from invalid, params
on conflict do nothing;

-- Insert flows
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
valid as (
  select
    id,
    title,
    description,
    coalesce(estimated_duration, 0) as estimated_duration,
    movement_mode,
    spot_ids,
    metadata,
    created_at,
    updated_at,
    created_by
  from (
    select
      id,
      title,
      description,
      estimated_duration,
      movement_mode,
      array(
        select normalize_spot_id(s)
        from unnest(spots) as s
        where normalize_spot_id(s) <> ''
      ) as spot_ids,
      metadata,
      created_at,
      updated_at,
      created_by
    from legacy_flows
  ) f
  where id is not null and id <> ''
)
insert into flows (
  id, title, description, estimated_duration, movement_mode, spots, metadata,
  created_at, updated_at, created_by, migration_batch_id
)
select
  id, title, description, estimated_duration, movement_mode, spot_ids, metadata,
  coalesce(created_at, now()), coalesce(updated_at, now()), created_by, params.migration_batch_id
from valid, params
on conflict (id) do nothing;

-- Insert flow_runs (si hay dataset)
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
),
valid as (
  select *
  from legacy_flow_runs
  where flow_id is not null
)
insert into flow_runs (
  id, flow_id, user_id, status, current_spot_index, current_narration_block,
  started_at, paused_at, is_minimized, created_at, updated_at, migration_batch_id
)
select
  coalesce(id, gen_random_uuid()),
  flow_id,
  user_id,
  status,
  coalesce(current_spot_index, 0),
  current_narration_block,
  started_at,
  paused_at,
  coalesce(is_minimized, false),
  coalesce(created_at, now()),
  coalesce(updated_at, now()),
  params.migration_batch_id
from valid, params
on conflict (id) do nothing;
