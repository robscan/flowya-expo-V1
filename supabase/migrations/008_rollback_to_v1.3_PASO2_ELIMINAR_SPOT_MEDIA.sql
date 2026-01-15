-- ============================================================================
-- PASO 2: Eliminar tabla spot_media (SI EXISTE)
-- ============================================================================
-- Esta tabla NO existía en v1.3, es seguro eliminarla completamente
-- Ejecutar solo después de verificar PASO 1 que no hay datos críticos

DROP TABLE IF EXISTS spot_media CASCADE;

-- Verificar que se eliminó correctamente
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spot_media'
  ) THEN
    RAISE NOTICE '✅ Tabla spot_media eliminada correctamente';
  ELSE
    RAISE NOTICE '⚠️  La tabla spot_media aún existe';
  END IF;
END $$;
