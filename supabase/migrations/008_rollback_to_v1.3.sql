-- Migration: Rollback a FLOWYA v1.3 (commit 9f3ce97)
-- Date: 2026-01-14
-- Description: Reversión de cambios posteriores al release v1.3
-- 
-- IMPORTANTE: Este script debe ejecutarse manualmente en Supabase SQL Editor
-- después de verificar el estado actual de la base de datos.
--
-- Estrategia:
-- 1. Eliminar tabla spot_media (NO existía en v1.3)
-- 2. Manejar tabla spots según estado (verificar si existía en v1.3)
-- 3. Eliminar datos agregados después del release si aplica

-- ============================================================================
-- PASO 1: Verificar estado actual (EJECUTAR PRIMERO PARA DIAGNÓSTICO)
-- ============================================================================

-- Verificar si existe tabla spot_media
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'spot_media'
) AS spot_media_exists;

-- Verificar si existe tabla spots
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'spots'
) AS spots_exists;

-- Contar registros en spot_media (si existe)
-- Usar DO block para evitar error si la tabla no existe
DO $$
DECLARE
  table_exists BOOLEAN;
  record_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spot_media'
  ) INTO table_exists;
  
  IF table_exists THEN
    SELECT COUNT(*) INTO record_count FROM spot_media;
    RAISE NOTICE 'spot_media existe con % registros', record_count;
  ELSE
    RAISE NOTICE 'spot_media NO existe (correcto para v1.3)';
  END IF;
END $$;

-- Análisis detallado de tabla spots (si existe)
-- Usar DO block para evitar error si la tabla no existe
DO $$
DECLARE
  table_exists BOOLEAN;
  world_spots_count INTEGER;
  total_spots_count INTEGER;
  user_spots_count INTEGER;
  null_type_count INTEGER;
  pins_count INTEGER;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spots'
  ) INTO table_exists;
  
  IF table_exists THEN
    -- Contar registros por tipo
    SELECT COUNT(*) INTO world_spots_count FROM spots WHERE spot_type = 'world';
    SELECT COUNT(*) INTO total_spots_count FROM spots;
    SELECT COUNT(*) INTO user_spots_count FROM spots WHERE spot_type IS NULL OR spot_type != 'world';
    SELECT COUNT(*) INTO null_type_count FROM spots WHERE spot_type IS NULL;
    
    -- Verificar si hay pins asociados a spots (datos de usuarios)
    SELECT COUNT(*) INTO pins_count 
    FROM pins 
    WHERE EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'pins'
    );
    
    RAISE NOTICE '=== ANÁLISIS DE TABLA spots ===';
    RAISE NOTICE 'Total de registros: %', total_spots_count;
    RAISE NOTICE 'Spots con spot_type = ''world'': % (agregados después del release)', world_spots_count;
    RAISE NOTICE 'Spots con spot_type NULL o diferente: %', user_spots_count;
    RAISE NOTICE 'Spots con spot_type NULL: %', null_type_count;
    RAISE NOTICE 'Pins asociados a spots: %', pins_count;
    RAISE NOTICE '';
    
    -- Recomendación basada en los datos
    IF pins_count > 0 THEN
      RAISE NOTICE '⚠️  HAY DATOS DE USUARIOS (pins). NO eliminar tabla spots.';
      RAISE NOTICE 'Recomendación: Eliminar solo spots con spot_type = ''world''';
    ELSIF world_spots_count > 0 AND total_spots_count = world_spots_count THEN
      RAISE NOTICE '✅ Solo hay spots agregados después del release.';
      RAISE NOTICE 'Recomendación: Eliminar tabla completa (OPCIÓN A)';
    ELSIF world_spots_count = 0 AND total_spots_count > 0 THEN
      RAISE NOTICE '⚠️  Hay spots pero NO son del tipo ''world''.';
      RAISE NOTICE 'Recomendación: Verificar si estos spots existían en v1.3 antes de eliminar';
    ELSE
      RAISE NOTICE '✅ Tabla spots vacía o solo con datos del release.';
      RAISE NOTICE 'Recomendación: Eliminar tabla completa (OPCIÓN A)';
    END IF;
  ELSE
    RAISE NOTICE 'spots NO existe (correcto para v1.3 - solo existía tabla pins)';
  END IF;
END $$;

-- ============================================================================
-- PASO 2: Eliminar tabla spot_media (SI EXISTE)
-- ============================================================================
-- Esta tabla NO existía en v1.3, es seguro eliminarla completamente
-- Ejecutar solo después de verificar que no hay datos críticos

-- DROP TABLE IF EXISTS spot_media CASCADE;

-- ============================================================================
-- PASO 3: Manejar tabla spots
-- ============================================================================
-- OPCIÓN A: Si la tabla spots NO existía en v1.3, eliminar completamente
-- (Descomentar solo si confirmado que la tabla fue creada después del release)
-- DROP TABLE IF EXISTS spots CASCADE;

-- OPCIÓN B: Si la tabla spots SÍ existía en v1.3, eliminar solo datos agregados
-- después del release (spots con spot_type = 'world')
-- (Descomentar solo si la tabla existía antes del release)
-- DELETE FROM spots WHERE spot_type = 'world';
-- ALTER TABLE spots DROP COLUMN IF EXISTS spot_type;

-- ============================================================================
-- NOTAS IMPORTANTES:
-- ============================================================================
-- 1. Ejecutar PASO 1 primero para diagnóstico
-- 2. Revisar resultados antes de ejecutar PASO 2 y PASO 3
-- 3. Hacer backup de datos antes de ejecutar DROP o DELETE
-- 4. Verificar que no haya datos de usuarios reales que deban preservarse
-- 5. Si hay datos de usuarios (pins asociados a spots), NO eliminar tabla spots
--    sino solo los registros con spot_type = 'world'
