-- Migration: Cleanup Non-World Spots
-- Date: 2026-01-11
-- Description: Eliminar todos los spots que NO sean del mundo (spot_type != 'world' o NULL)
-- ⚠️ ADVERTENCIA: Esta migración elimina datos permanentemente

-- PASO 1: Eliminar pins asociados a spots NO del mundo
-- Esto evita referencias rotas en la tabla pins

DELETE FROM pins
WHERE spot_id IN (
  SELECT id::text
  FROM spots
  WHERE spot_type IS NULL 
     OR spot_type != 'world'
);

-- Verificar eliminación de pins
SELECT 
  COUNT(*) as remaining_pins_to_delete,
  'Pins restantes asociados a spots NO del mundo' as status
FROM pins p
INNER JOIN spots s ON p.spot_id = s.id::text
WHERE s.spot_type IS NULL 
   OR s.spot_type != 'world';

-- PASO 2: Eliminar spots NO del mundo
DELETE FROM spots
WHERE spot_type IS NULL 
   OR spot_type != 'world';

-- PASO 3: Validar que solo quedan spots del mundo
SELECT 
  COUNT(*) as total_spots,
  COUNT(CASE WHEN spot_type = 'world' THEN 1 END) as world_spots,
  COUNT(CASE WHEN spot_type IS NULL OR spot_type != 'world' THEN 1 END) as non_world_spots,
  CASE 
    WHEN COUNT(CASE WHEN spot_type IS NULL OR spot_type != 'world' THEN 1 END) = 0 
    THEN '✅ Solo quedan spots del mundo'
    ELSE '⚠️ Aún hay spots NO del mundo'
  END as validation_status
FROM spots;

-- PASO 4: Verificar pins huérfanos (no debería haber)
SELECT 
  COUNT(*) as orphaned_pins,
  'Pins huérfanos (sin spot asociado)' as status
FROM pins p
LEFT JOIN spots s ON p.spot_id = s.id::text
WHERE s.id IS NULL;
