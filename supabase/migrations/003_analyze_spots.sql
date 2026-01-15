-- Script de Análisis de Spots
-- Ejecutar en Supabase SQL Editor para analizar estado actual

-- 1. Conteo total y por spot_type
SELECT 
  COUNT(*) as total_spots,
  COUNT(CASE WHEN spot_type = 'world' THEN 1 END) as world_spots,
  COUNT(CASE WHEN spot_type IS NULL OR spot_type != 'world' THEN 1 END) as non_world_spots,
  COUNT(CASE WHEN created_by IS NOT NULL THEN 1 END) as user_created_spots,
  COUNT(CASE WHEN spot_type IS NULL THEN 1 END) as null_spot_type
FROM spots;

-- 2. Listar spots NO del mundo (a eliminar)
SELECT 
  id,
  name,
  spot_type,
  type,
  created_by,
  created_at,
  location->>'city' as city,
  location->>'country' as country
FROM spots
WHERE spot_type IS NULL 
   OR spot_type != 'world'
ORDER BY created_at DESC;

-- 3. Pins asociados a spots NO del mundo
SELECT 
  p.id as pin_id,
  p.spot_id,
  p.user_id,
  p.state,
  s.name as spot_name,
  s.spot_type,
  s.created_by
FROM pins p
INNER JOIN spots s ON p.spot_id = s.id::text
WHERE s.spot_type IS NULL 
   OR s.spot_type != 'world'
ORDER BY p.created_at DESC;

-- 4. Conteo de pins a eliminar
SELECT COUNT(*) as pins_to_delete
FROM pins p
INNER JOIN spots s ON p.spot_id = s.id::text
WHERE s.spot_type IS NULL 
   OR s.spot_type != 'world';
