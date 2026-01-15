-- Script de Validación Post-Limpieza
-- Ejecutar después de cleanup para confirmar que solo quedan spots del mundo

-- 1. Verificar que solo existen spots del mundo
SELECT 
  COUNT(*) as total_spots,
  COUNT(CASE WHEN spot_type = 'world' THEN 1 END) as world_spots,
  COUNT(CASE WHEN spot_type IS NULL OR spot_type != 'world' THEN 1 END) as non_world_spots
FROM spots;

-- 2. Verificar que no hay pins huérfanos
SELECT 
  COUNT(*) as orphaned_pins
FROM pins p
LEFT JOIN spots s ON p.spot_id = s.id::text
WHERE s.id IS NULL;

-- 3. Distribución de spots del mundo por región
SELECT 
  location->>'country' as country,
  location->>'city' as city,
  COUNT(*) as spot_count
FROM spots
WHERE spot_type = 'world'
GROUP BY location->>'country', location->>'city'
ORDER BY spot_count DESC, country, city;

-- 4. Distribución por tipo
SELECT 
  type,
  COUNT(*) as spot_count
FROM spots
WHERE spot_type = 'world'
GROUP BY type
ORDER BY spot_count DESC;

-- 5. Lista completa de spots del mundo vigentes
SELECT 
  id,
  name,
  type,
  location->>'city' as city,
  location->>'country' as country,
  created_at
FROM spots
WHERE spot_type = 'world'
ORDER BY location->>'country', location->>'city', name;
