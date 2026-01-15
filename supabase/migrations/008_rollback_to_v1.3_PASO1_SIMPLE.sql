-- ============================================================================
-- PASO 1: DIAGNÓSTICO SIMPLE - Solo verificaciones de existencia
-- ============================================================================
-- Esta versión solo verifica qué tablas existen (sin errores)
-- Ejecuta esto primero para ver el estado básico

-- Verificar existencia de tablas
SELECT 
  'spot_media' AS tabla,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spot_media'
  ) AS existe,
  'NO debería existir en v1.3' AS nota;

SELECT 
  'spots' AS tabla,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'spots'
  ) AS existe,
  'Verificar si existía en v1.3' AS nota;

SELECT 
  'pins' AS tabla,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'pins'
  ) AS existe,
  'Sí debería existir en v1.3' AS nota;

-- ============================================================================
-- Si spots existe, ejecutar manualmente estas consultas:
-- ============================================================================
-- SELECT COUNT(*) AS total_spots FROM spots;
-- SELECT COUNT(*) AS world_spots FROM spots WHERE spot_type = 'world';
-- SELECT COUNT(*) AS pins_count FROM pins;
