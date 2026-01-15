-- FLOWYA V2.0 schema (canonico) - Supabase
-- Fuente de verdad: definitions/FLOWYA V2.0/*
-- Reglas clave: no WorldSpot/UserSpot, spots versionados, contribuciones inmutables.

-- Extensions
create extension if not exists pgcrypto;

-- Helper: normalize_spot_id (equivalente a normalizeSpotId())
create or replace function normalize_spot_id(raw_id text)
returns text
language sql
immutable
as $$
  select
    case
      when raw_id is null then ''
      else
        coalesce(
          nullif(
            regexp_replace(
              regexp_replace(
                regexp_replace(lower(trim(raw_id)), '[\\s_]+', '-', 'g'),
                '[^a-z0-9-]',
                '',
                'g'
              ),
              '-+',
              '-',
              'g'
            ),
            ''
          ),
          lower(trim(raw_id))
        )
    end;
$$;

-- Updated-at trigger
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Spots (canonico)
create table if not exists spots (
  id text primary key,
  name text not null,
  type text not null,
  location_lat double precision not null,
  location_lng double precision not null,
  location_city text,
  location_country text,
  short_description text,
  has_generated_content boolean not null default false,
  needs_review boolean not null default false,
  source text not null default 'unknown', -- seed | user | unknown
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  migration_batch_id text
);

alter table spots
  add constraint spots_type_check
  check (type in ('beach','cafe','viewpoint','museum','restaurant','park','monument','market','other'));

alter table spots
  add constraint spots_source_check
  check (source in ('seed','user','unknown'));

alter table spots
  add constraint spots_location_check
  check (
    location_lat between -90 and 90
    and location_lng between -180 and 180
  );

drop trigger if exists set_spots_updated_at on spots;
create trigger set_spots_updated_at
before update on spots
for each row execute function set_updated_at();

-- SpotContributions (append-only)
create table if not exists spot_contributions (
  id uuid primary key default gen_random_uuid(),
  spot_id text references spots(id) on delete set null,
  author_id uuid,
  type text not null, -- create | update | rollback
  payload jsonb not null,
  status text not null default 'pending', -- pending | applied | rejected
  created_at timestamptz not null default now(),
  applied_at timestamptz,
  applied_by uuid,
  migration_batch_id text
);

alter table spot_contributions
  add constraint spot_contributions_type_check
  check (type in ('create','update','rollback'));

alter table spot_contributions
  add constraint spot_contributions_status_check
  check (status in ('pending','applied','rejected'));

create index if not exists spot_contributions_spot_id_idx on spot_contributions (spot_id);
create index if not exists spot_contributions_author_id_idx on spot_contributions (author_id);
create index if not exists spot_contributions_status_idx on spot_contributions (status);

-- SpotVersions (snapshot inmutable)
create table if not exists spot_versions (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null references spots(id) on delete cascade,
  contribution_id uuid references spot_contributions(id) on delete set null,
  version int not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid,
  migration_batch_id text
);

create unique index if not exists spot_versions_unique_per_spot on spot_versions (spot_id, version);
create index if not exists spot_versions_contribution_id_idx on spot_versions (contribution_id);

-- SpotMediaPublic (media publica con moderacion ligera)
create table if not exists spot_media_public (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null references spots(id) on delete cascade,
  storage_path text not null,
  mime_type text,
  width int,
  height int,
  metadata jsonb,
  status text not null default 'active', -- active | soft_hidden
  report_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  source text not null default 'user', -- user | seed | unknown
  migration_batch_id text
);

alter table spot_media_public
  add constraint spot_media_public_status_check
  check (status in ('active','soft_hidden'));

alter table spot_media_public
  add constraint spot_media_public_source_check
  check (source in ('user','seed','unknown'));

create index if not exists spot_media_public_spot_id_idx on spot_media_public (spot_id);

drop trigger if exists set_spot_media_public_updated_at on spot_media_public;
create trigger set_spot_media_public_updated_at
before update on spot_media_public
for each row execute function set_updated_at();

-- SpotReports (moderacion ligera)
create table if not exists spot_reports (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null references spots(id) on delete cascade,
  media_id uuid references spot_media_public(id) on delete set null,
  reporter_id uuid,
  reason text not null, -- incorrecta | no_es_del_lugar | ofensiva | spam
  created_at timestamptz not null default now(),
  migration_batch_id text
);

alter table spot_reports
  add constraint spot_reports_reason_check
  check (reason in ('incorrecta','no_es_del_lugar','ofensiva','spam'));

create index if not exists spot_reports_spot_id_idx on spot_reports (spot_id);
create index if not exists spot_reports_media_id_idx on spot_reports (media_id);
create index if not exists spot_reports_reporter_id_idx on spot_reports (reporter_id);

-- Pins (privados por usuario)
create table if not exists pins (
  id uuid primary key default gen_random_uuid(),
  spot_id text not null references spots(id) on delete cascade,
  user_id uuid not null,
  state text not null, -- to_visit | visited
  pinned_at timestamptz not null,
  visited_at timestamptz,
  notes text,
  personal_photos text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  migration_batch_id text
);

alter table pins
  add constraint pins_state_check
  check (state in ('to_visit','visited'));

create unique index if not exists pins_unique_per_user_spot on pins (spot_id, user_id);
create index if not exists pins_user_id_idx on pins (user_id);

drop trigger if exists set_pins_updated_at on pins;
create trigger set_pins_updated_at
before update on pins
for each row execute function set_updated_at();

-- Flows (definicion)
create table if not exists flows (
  id text primary key,
  title text not null,
  description text,
  estimated_duration int not null,
  movement_mode text not null, -- walking | bike | car
  spots text[] not null,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid,
  migration_batch_id text
);

alter table flows
  add constraint flows_movement_mode_check
  check (movement_mode in ('walking','bike','car'));

drop trigger if exists set_flows_updated_at on flows;
create trigger set_flows_updated_at
before update on flows
for each row execute function set_updated_at();

-- FlowRuns (ejecucion viva)
create table if not exists flow_runs (
  id uuid primary key default gen_random_uuid(),
  flow_id text references flows(id) on delete cascade,
  user_id uuid,
  status text not null, -- idle | active | paused
  current_spot_index int not null default 0,
  current_narration_block text, -- anticipation | presence | transition
  started_at timestamptz,
  paused_at timestamptz,
  is_minimized boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  migration_batch_id text
);

alter table flow_runs
  add constraint flow_runs_status_check
  check (status in ('idle','active','paused'));

alter table flow_runs
  add constraint flow_runs_block_check
  check (current_narration_block is null or current_narration_block in ('anticipation','presence','transition'));

create index if not exists flow_runs_flow_id_idx on flow_runs (flow_id);
create index if not exists flow_runs_user_id_idx on flow_runs (user_id);

drop trigger if exists set_flow_runs_updated_at on flow_runs;
create trigger set_flow_runs_updated_at
before update on flow_runs
for each row execute function set_updated_at();

-- UserProfile (minimizado)
create table if not exists user_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_path text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  migration_batch_id text
);

drop trigger if exists set_user_profile_updated_at on user_profile;
create trigger set_user_profile_updated_at
before update on user_profile
for each row execute function set_updated_at();

-- UserStats (derivado)
create table if not exists user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  trust_level text not null default 'nuevo', -- nuevo | creciente | confiable
  applied_contributions_count int not null default 0,
  last_calculated_at timestamptz not null default now(),
  migration_batch_id text
);

alter table user_stats
  add constraint user_stats_trust_level_check
  check (trust_level in ('nuevo','creciente','confiable'));

-- RLS (alto nivel, conservador)
alter table spots enable row level security;
alter table spot_contributions enable row level security;
alter table spot_versions enable row level security;
alter table spot_media_public enable row level security;
alter table spot_reports enable row level security;
alter table pins enable row level security;
alter table flows enable row level security;
alter table flow_runs enable row level security;
alter table user_profile enable row level security;
alter table user_stats enable row level security;

-- Nota: service role bypassa RLS. Las politicas below son para anon/auth.
do $$
begin
  -- Spots: lectura publica, UPDATE prohibido a clientes (solo via applier/service role)
  if not exists (select 1 from pg_policies where tablename = 'spots' and policyname = 'spots_select_public') then
    create policy spots_select_public on spots for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'spots' and policyname = 'spots_update_blocked') then
    create policy spots_update_blocked on spots for update using (false);
  end if;
end $$;

do $$
begin
  -- SpotContributions: insert por autenticados, select por autor
  if not exists (select 1 from pg_policies where tablename = 'spot_contributions' and policyname = 'spot_contributions_insert') then
    create policy spot_contributions_insert on spot_contributions
      for insert with check (auth.role() = 'authenticated');
  end if;
  if not exists (select 1 from pg_policies where tablename = 'spot_contributions' and policyname = 'spot_contributions_select_own') then
    create policy spot_contributions_select_own on spot_contributions
      for select using (author_id = auth.uid());
  end if;
end $$;

do $$
begin
  -- Pins: privados por usuario
  if not exists (select 1 from pg_policies where tablename = 'pins' and policyname = 'pins_select_own') then
    create policy pins_select_own on pins for select using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'pins' and policyname = 'pins_modify_own') then
    create policy pins_modify_own on pins for insert with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'pins' and policyname = 'pins_update_own') then
    create policy pins_update_own on pins for update using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'pins' and policyname = 'pins_delete_own') then
    create policy pins_delete_own on pins for delete using (user_id = auth.uid());
  end if;
end $$;

do $$
begin
  -- Flows/FlowRuns: conservador (solo owner)
  if not exists (select 1 from pg_policies where tablename = 'flows' and policyname = 'flows_select_own') then
    create policy flows_select_own on flows for select using (created_by = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'flows' and policyname = 'flows_insert_own') then
    create policy flows_insert_own on flows for insert with check (created_by = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'flows' and policyname = 'flows_update_own') then
    create policy flows_update_own on flows for update using (created_by = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'flow_runs' and policyname = 'flow_runs_select_own') then
    create policy flow_runs_select_own on flow_runs for select using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'flow_runs' and policyname = 'flow_runs_insert_own') then
    create policy flow_runs_insert_own on flow_runs for insert with check (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'flow_runs' and policyname = 'flow_runs_update_own') then
    create policy flow_runs_update_own on flow_runs for update using (user_id = auth.uid());
  end if;
end $$;

do $$
begin
  -- UserProfile: conservador (solo owner). UserStats: solo owner lectura.
  if not exists (select 1 from pg_policies where tablename = 'user_profile' and policyname = 'user_profile_select_own') then
    create policy user_profile_select_own on user_profile for select using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'user_profile' and policyname = 'user_profile_update_own') then
    create policy user_profile_update_own on user_profile for update using (user_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where tablename = 'user_profile' and policyname = 'user_profile_insert_own') then
    create policy user_profile_insert_own on user_profile for insert with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where tablename = 'user_stats' and policyname = 'user_stats_select_own') then
    create policy user_stats_select_own on user_stats for select using (user_id = auth.uid());
  end if;
end $$;
