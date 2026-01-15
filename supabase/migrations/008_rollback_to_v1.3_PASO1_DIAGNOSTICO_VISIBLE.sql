-- ============================================================================
-- PASO 1: DIAGNÓSTICO - Versión con resultados visibles en tabla
-- ============================================================================
-- Esta versión muestra los resultados en tablas que puedes ver fácilmente
-- en la pestaña "Results" del SQL Editor

-- ============================================================================
-- 1. Verificar existencia de tablas
-- ============================================================================
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'spot_media'
) AS spot_media_exists;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'spots'
) AS spots_exists;

-- ============================================================================
-- 2. Contar registros (si las tablas existen)
-- ============================================================================

-- Contar registros en spot_media (usando función para evitar error si no existe)
DO $$
DECLARE
  count_result INTEGER;
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spot_media'
  ) THEN
    SELECT COUNT(*) INTO count_result FROM spot_media;
    RAISE NOTICE 'spot_media_count: %', count_result;
  ELSE
    RAISE NOTICE 'spot_media_count: 0 (tabla no existe)';
  END IF;
END $$;

-- Contar registros (usando función para evitar errores si las tablas no existen)
DO $$
DECLARE
  total_spots INTEGER := 0;
  world_spots INTEGER := 0;
  null_type_spots INTEGER := 0;
  total_pins INTEGER := 0;
  spots_exists BOOLEAN;
  pins_exists BOOLEAN;
BEGIN
  -- Verificar y contar spots
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spots'
  ) INTO spots_exists;
  
  IF spots_exists THEN
    SELECT COUNT(*) INTO total_spots FROM spots;
    SELECT COUNT(*) INTO world_spots FROM spots WHERE spot_type = 'world';
    SELECT COUNT(*) INTO null_type_spots FROM spots WHERE spot_type IS NULL;
  END IF;
  
  -- Verificar y contar pins
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'pins'
  ) INTO pins_exists;
  
  IF pins_exists THEN
    SELECT COUNT(*) INTO total_pins FROM pins;
  END IF;
  
  -- Mostrar resultados
  RAISE NOTICE '=== CONTEO DE REGISTROS ===';
  RAISE NOTICE 'total_spots_count: %', total_spots;
  RAISE NOTICE 'world_spots_count: %', world_spots;
  RAISE NOTICE 'null_type_spots_count: %', null_type_spots;
  RAISE NOTICE 'total_pins_count: %', total_pins;
END $$;

-- ============================================================================
-- 3. Análisis detallado (tabla resumen usando función)
-- ============================================================================
DO $$
DECLARE
  spot_media_exists BOOLEAN;
  spot_media_count INTEGER := 0;
  spots_exists BOOLEAN;
  spots_count INTEGER := 0;
  world_spots_count INTEGER := 0;
  pins_exists BOOLEAN;
  pins_count INTEGER := 0;
BEGIN
  -- Verificar spot_media
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spot_media'
  ) INTO spot_media_exists;
  
  IF spot_media_exists THEN
    SELECT COUNT(*) INTO spot_media_count FROM spot_media;
  END IF;
  
  -- Verificar spots
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spots'
  ) INTO spots_exists;
  
  IF spots_exists THEN
    SELECT COUNT(*) INTO spots_count FROM spots;
    SELECT COUNT(*) INTO world_spots_count FROM spots WHERE spot_type = 'world';
  END IF;
  
  -- Verificar pins
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'pins'
  ) INTO pins_exists;
  
  IF pins_exists THEN
    SELECT COUNT(*) INTO pins_count FROM pins;
  END IF;
  
  -- Mostrar resumen
  RAISE NOTICE '';
  RAISE NOTICE '=== RESUMEN DE TABLAS ===';
  RAISE NOTICE 'spot_media: % - % registros', 
    CASE WHEN spot_media_exists THEN 'EXISTE' ELSE 'NO EXISTE (correcto para v1.3)' END,
    spot_media_count;
  RAISE NOTICE 'spots: % - % registros totales', 
    CASE WHEN spots_exists THEN 'EXISTE' ELSE 'NO EXISTE' END,
    spots_count;
  RAISE NOTICE 'spots (world): % registros (agregados después del release)', world_spots_count;
  RAISE NOTICE 'pins: % - % registros', 
    CASE WHEN pins_exists THEN 'EXISTE' ELSE 'NO EXISTE' END,
    pins_count;
END $$;

-- ============================================================================
-- 4. Recomendación (basada en los datos)
-- ============================================================================
DO $$
DECLARE
  spots_exists BOOLEAN;
  pins_exists BOOLEAN;
  world_spots_count INTEGER := 0;
  total_spots_count INTEGER := 0;
  pins_count INTEGER := 0;
  recomendacion TEXT;
BEGIN
  -- Verificar existencia y contar
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spots'
  ) INTO spots_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'pins'
  ) INTO pins_exists;
  
  IF spots_exists THEN
    SELECT COUNT(*) INTO total_spots_count FROM spots;
    SELECT COUNT(*) INTO world_spots_count FROM spots WHERE spot_type = 'world';
  END IF;
  
  IF pins_exists THEN
    SELECT COUNT(*) INTO pins_count FROM pins;
  END IF;
  
  -- Determinar recomendación
  IF pins_count > 0 THEN
    recomendacion := 'OPCIÓN B: Eliminar solo spots con spot_type = ''world'' (hay ' || pins_count || ' pins - datos de usuarios)';
  ELSIF world_spots_count > 0 AND total_spots_count = world_spots_count THEN
    recomendacion := 'OPCIÓN A: Eliminar tabla spots completa (solo hay ' || world_spots_count || ' spots del release)';
  ELSIF world_spots_count = 0 AND total_spots_count > 0 THEN
    recomendacion := 'VERIFICAR: Hay ' || total_spots_count || ' spots pero NO son del tipo ''world''. Revisar si existían en v1.3';
  ELSIF world_spots_count = 0 THEN
    recomendacion := 'OPCIÓN A: Eliminar tabla spots completa (no hay datos del release)';
  ELSE
    recomendacion := 'No se requiere acción en tabla spots';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== RECOMENDACIÓN ===';
  RAISE NOTICE '%', recomendacion;
END $$;
