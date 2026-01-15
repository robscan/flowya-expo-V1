-- ============================================================================
-- PASO 3 - OPCIÓN A: Eliminar tabla spots completa
-- ============================================================================
-- USAR SOLO SI:
-- - La tabla spots NO existía en v1.3 (fue creada después del release)
-- - NO hay datos de usuarios (pins) asociados
-- - Solo hay spots con spot_type = 'world' (agregados después del release)
--
-- ⚠️  ADVERTENCIA: Esto eliminará TODA la tabla spots
-- ⚠️  Hacer backup antes de ejecutar si hay dudas

-- Eliminar tabla spots completa
DROP TABLE IF EXISTS spots CASCADE;

-- Verificar que se eliminó correctamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spots'
  ) THEN
    RAISE NOTICE '✅ Tabla spots eliminada correctamente';
  ELSE
    RAISE NOTICE '⚠️  La tabla spots aún existe';
  END IF;
END $$;
