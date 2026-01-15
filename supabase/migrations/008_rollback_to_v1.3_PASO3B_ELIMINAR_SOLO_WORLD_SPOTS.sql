-- ============================================================================
-- PASO 3 - OPCIÓN B: Eliminar solo spots con spot_type = 'world'
-- ============================================================================
-- USAR SOLO SI:
-- - La tabla spots SÍ existía en v1.3
-- - HAY datos de usuarios (pins) asociados que deben preservarse
-- - Solo queremos eliminar los spots agregados después del release
--
-- ⚠️  ADVERTENCIA: Esto eliminará solo spots con spot_type = 'world'
-- ⚠️  Los spots de usuarios y la estructura de la tabla se preservarán

-- Eliminar solo spots agregados después del release
DELETE FROM spots WHERE spot_type = 'world';

-- Opcional: Eliminar columna spot_type si no existía en v1.3
-- (Descomentar solo si confirmado que la columna fue agregada después del release)
-- ALTER TABLE spots DROP COLUMN IF EXISTS spot_type;

-- Verificar resultado
DO $$
DECLARE
  remaining_world_spots INTEGER;
  total_spots INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_world_spots FROM spots WHERE spot_type = 'world';
  SELECT COUNT(*) INTO total_spots FROM spots;
  
  IF remaining_world_spots = 0 THEN
    RAISE NOTICE '✅ Todos los spots con spot_type = ''world'' fueron eliminados';
    RAISE NOTICE 'Total de spots restantes: %', total_spots;
  ELSE
    RAISE NOTICE '⚠️  Aún quedan % spots con spot_type = ''world''', remaining_world_spots;
  END IF;
END $$;
