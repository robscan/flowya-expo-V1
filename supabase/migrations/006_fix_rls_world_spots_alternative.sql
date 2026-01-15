-- Migration: Fix RLS policies for world spots (Alternativa sin DROP)
-- Date: 2026-01-11
-- Description: Permitir inserción de spots del mundo usando DO block para evitar errores

-- Usar DO block para crear política solo si no existe
DO $$
BEGIN
  -- Intentar crear la política, ignorar si ya existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'spots' 
    AND policyname = 'Anyone can insert world spots'
  ) THEN
    CREATE POLICY "Anyone can insert world spots"
      ON spots FOR INSERT
      WITH CHECK (spot_type = 'world' AND created_by IS NULL);
  END IF;
END $$;

-- Verificar políticas
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'spots'
ORDER BY policyname;
