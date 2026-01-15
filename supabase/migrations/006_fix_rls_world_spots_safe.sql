-- Migration: Fix RLS policies for world spots (Versión Segura)
-- Date: 2026-01-11
-- Description: Permitir inserción de spots del mundo (spot_type = 'world') sin autenticación
-- Esta versión NO usa DROP, solo crea la política si no existe

-- Política: Permitir inserción de spots del mundo (sin autenticación requerida)
-- Esto permite insertar spots del mundo con created_by = null
-- Si la política ya existe, dará un error que puedes ignorar (o usar IF NOT EXISTS si tu versión de PostgreSQL lo soporta)
CREATE POLICY "Anyone can insert world spots"
  ON spots FOR INSERT
  WITH CHECK (spot_type = 'world' AND created_by IS NULL);

-- Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  with_check
FROM pg_policies
WHERE tablename = 'spots'
ORDER BY policyname;
