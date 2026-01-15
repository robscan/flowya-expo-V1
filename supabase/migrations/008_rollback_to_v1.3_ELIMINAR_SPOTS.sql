-- ============================================================================
-- ELIMINAR TABLA spots COMPLETA
-- ============================================================================
-- Este script elimina la tabla spots completa
-- ⚠️  ADVERTENCIA: Esto eliminará TODA la tabla spots y todos sus datos
-- ⚠️  Si hay foreign keys desde pins, se eliminarán las referencias

-- Eliminar tabla spots completa (CASCADE elimina dependencias)
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
