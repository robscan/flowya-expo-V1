-- Migration: Add spot_type column to spots table
-- Date: 2026-01-11
-- Description: Agregar campo spot_type para diferenciar spots del mundo de spots de usuario/legacy

-- Agregar campo spot_type si no existe
ALTER TABLE spots 
ADD COLUMN IF NOT EXISTS spot_type TEXT DEFAULT NULL;

-- Crear índice para performance
CREATE INDEX IF NOT EXISTS idx_spots_spot_type ON spots (spot_type);

-- Comentario para documentación
COMMENT ON COLUMN spots.spot_type IS 'Tipo de spot: world (spots del mundo curados) o NULL/user (spots de usuario/legacy)';

-- Verificar estructura
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'spots' AND column_name = 'spot_type';
