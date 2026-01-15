-- Rollback por migration_batch_id
-- Nota: el rollback no reconstituye estados previos sobrescritos por UPSERT.

-- Definir migration_batch_id (el mismo usado en migracion)
with params as (
  select 'FLOWYA_V2_0_2060114'::text as migration_batch_id
)
-- FlowRuns -> Flows
delete from flow_runs where migration_batch_id = (select migration_batch_id from params);

with params as (select 'FLOWYA_V2_0_2060114'::text as migration_batch_id)
delete from flows where migration_batch_id = (select migration_batch_id from params);

-- Pins
with params as (select 'FLOWYA_V2_0_2060114'::text as migration_batch_id)
delete from pins where migration_batch_id = (select migration_batch_id from params);

-- Media y reportes (si se hubieran migrado)
with params as (select 'FLOWYA_V2_0_2060114'::text as migration_batch_id)
delete from spot_reports where migration_batch_id = (select migration_batch_id from params);

with params as (select 'FLOWYA_V2_0_2060114'::text as migration_batch_id)
delete from spot_media_public where migration_batch_id = (select migration_batch_id from params);

-- SpotVersions -> SpotContributions -> Spots
with params as (select 'FLOWYA_V2_0_2060114'::text as migration_batch_id)
delete from spot_versions where migration_batch_id = (select migration_batch_id from params);

with params as (select 'FLOWYA_V2_0_2060114'::text as migration_batch_id)
delete from spot_contributions where migration_batch_id = (select migration_batch_id from params);

with params as (select 'FLOWYA_V2_0_2060114'::text as migration_batch_id)
delete from spots where migration_batch_id = (select migration_batch_id from params);

-- Perfiles y stats
with params as (select 'FLOWYA_V2_0_2060114'::text as migration_batch_id)
delete from user_profile where migration_batch_id = (select migration_batch_id from params);

with params as (select 'FLOWYA_V2_0_2060114'::text as migration_batch_id)
delete from user_stats where migration_batch_id = (select migration_batch_id from params);

-- Auditoria de migracion (si se usa migration_audit con batch)
with params as (select 'FLOWYA_V2_0_2060114'::text as migration_batch_id)
delete from migration_audit where migration_batch_id = (select migration_batch_id from params);

-- Datos irrecuperables (si hubo UPSERT):
-- - Pins: valores anteriores pueden haber sido sobrescritos.
-- - UserStats: valores previos pueden haber sido recalculados.
-- Se requiere respaldo previo si se desea restaurar estado exacto.
