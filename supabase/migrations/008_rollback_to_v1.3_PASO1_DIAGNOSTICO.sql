-- ============================================================================
-- PASO 1: DIAGNÓSTICO - Ejecutar primero para verificar estado actual
-- ============================================================================
-- Copiar y pegar este bloque completo en Supabase SQL Editor y ejecutar

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

-- Análisis detallado de spot_media (si existe)
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
