-- Validaciones post-migracion (FLOWYA V2.0)

-- 1) Conteo de spots vs seeds (si existe staging)
select
  (select count(*) from legacy_seed_spots) as seed_total,
  (select count(*) from spots where source = 'seed') as spots_seed;

-- 2) Todo spot tiene SpotVersion v1
select s.id as spot_id
from spots s
left join spot_versions sv on sv.spot_id = s.id and sv.version = 1
where sv.id is null;

-- 3) Pins huerfanos
select p.id as pin_id, p.spot_id
from pins p
left join spots s on s.id = p.spot_id
where s.id is null;

-- 4) Media sin spot
select m.id as media_id, m.spot_id
from spot_media_public m
left join spots s on s.id = m.spot_id
where s.id is null;

-- 5) Flows con spots invalidos
select f.id as flow_id, missing.spot_id
from flows f
cross join lateral (
  select spot_id
  from unnest(f.spots) as spot_id
  left join spots s on s.id = spot_id
  where s.id is null
) as missing;

-- 6) RLS efectivo: spots no permite UPDATE a clientes
select policyname, cmd, roles, permissive
from pg_policies
where tablename = 'spots' and cmd = 'UPDATE';

-- 7) Check critico: no UPDATEs directos a spots post-migracion
-- Heuristica: spots migrados no deben tener updated_at > created_at
select id, created_at, updated_at
from spots
where migration_batch_id = 'FLOWYA_V2_0_2060114'
  and updated_at > created_at;
