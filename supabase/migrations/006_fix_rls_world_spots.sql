-- Migration: Fix RLS policies for world spots
-- Date: 2026-01-11
-- Description: Permitir inserción de spots del mundo (spot_type = 'world') sin autenticación

-- Eliminar política restrictiva de INSERT (si existe)
DROP POLICY IF EXISTS "Users can create own spots" ON spots;

-- Política: Usuarios pueden crear sus propios spots (con created_by)
CREATE POLICY "Users can create own spots"
  ON spots FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Política: Permitir inserción de spots del mundo (sin autenticación requerida)
-- Esto permite insertar spots del mundo con created_by = null
CREATE POLICY "Anyone can insert world spots"
  ON spots FOR INSERT
  WITH CHECK (spot_type = 'world' AND created_by IS NULL);

-- Verificar políticas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'spots'
ORDER BY policyname;
