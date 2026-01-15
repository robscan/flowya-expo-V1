-- ============================================================================
-- VERIFICACIÓN: Revisar si hay pins asociados a spots
-- ============================================================================
-- Ejecutar esto para verificar si hay datos de usuarios (pins) que referencien
-- los spots que vamos a eliminar

-- Verificar si hay pins que referencien spots con spot_type = 'world'
SELECT 
  COUNT(*) AS pins_asociados_a_world_spots,
  'Pins que referencian spots con spot_type = world' AS descripcion
FROM pins
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'pins'
)
AND EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'spots'
)
AND spot_id IN (
  SELECT id FROM spots WHERE spot_type = 'world'
);

-- Mostrar algunos ejemplos de pins (si existen)
SELECT 
  p.id AS pin_id,
  p.spot_id,
  s.name AS spot_name,
  s.spot_type,
  p.state AS pin_state,
  p.created_at AS pin_created_at
FROM pins p
LEFT JOIN spots s ON p.spot_id = s.id
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'pins'
)
AND EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'spots'
)
AND s.spot_type = 'world'
LIMIT 10;

-- Total de pins (para referencia)
SELECT 
  COUNT(*) AS total_pins,
  'Total de pins en la base de datos' AS descripcion
FROM pins
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'pins'
);
