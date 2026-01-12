-- Migration: Create pins table for FLOWYA V1.3
-- Date: 2026-01-11
-- Description: Tabla para persistir Pins (relación User ↔ Spot) con estados y diario

-- Crear tabla pins
CREATE TABLE IF NOT EXISTS pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('to_visit', 'visited')),
  pinned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  visited_at TIMESTAMPTZ,
  notes TEXT,
  personal_photos JSONB DEFAULT '[]'::jsonb, -- Array de URLs: ["url1", "url2", ...]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT pins_spot_user_unique UNIQUE(spot_id, user_id) -- Un Pin por usuario por Spot
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pins_user_id ON pins (user_id);
CREATE INDEX IF NOT EXISTS idx_pins_spot_id ON pins (spot_id);
CREATE INDEX IF NOT EXISTS idx_pins_state ON pins (state);
CREATE INDEX IF NOT EXISTS idx_pins_pinned_at ON pins (pinned_at DESC);
CREATE INDEX IF NOT EXISTS idx_pins_visited_at ON pins (visited_at DESC);

-- Row Level Security (RLS)
ALTER TABLE pins ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo pueden ver sus propios pins
CREATE POLICY "Users can view own pins"
  ON pins FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuarios solo pueden crear sus propios pins
CREATE POLICY "Users can create own pins"
  ON pins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuarios solo pueden actualizar sus propios pins
CREATE POLICY "Users can update own pins"
  ON pins FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Usuarios solo pueden eliminar sus propios pins
CREATE POLICY "Users can delete own pins"
  ON pins FOR DELETE
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_pins_updated_at
  BEFORE UPDATE ON pins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para establecer visited_at cuando cambia a 'visited' (solo primera vez)
CREATE OR REPLACE FUNCTION update_visited_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo establecer visited_at si cambia a 'visited' y no existe
  IF NEW.state = 'visited' AND (OLD.state IS NULL OR OLD.state != 'visited') AND NEW.visited_at IS NULL THEN
    NEW.visited_at := NOW();
  END IF;
  -- Preservar visited_at si ya existe (regla de primera visita)
  IF NEW.state = 'visited' AND OLD.visited_at IS NOT NULL THEN
    NEW.visited_at := OLD.visited_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para visited_at
CREATE TRIGGER trigger_update_visited_at
  BEFORE UPDATE ON pins
  FOR EACH ROW
  WHEN (NEW.state = 'visited')
  EXECUTE FUNCTION update_visited_at();

-- Comentarios para documentación
COMMENT ON TABLE pins IS 'Pins (relación User ↔ Spot) con estados to_visit/visited y diario';
COMMENT ON COLUMN pins.spot_id IS 'ID del Spot (referencia a spots)';
COMMENT ON COLUMN pins.user_id IS 'ID del usuario (referencia a auth.users)';
COMMENT ON COLUMN pins.state IS 'Estado del Pin: to_visit o visited';
COMMENT ON COLUMN pins.pinned_at IS 'Fecha/hora de creación del Pin';
COMMENT ON COLUMN pins.visited_at IS 'Fecha/hora de primera visita (preservada si se cambia estado)';
COMMENT ON COLUMN pins.notes IS 'Notas personales del diario (texto libre)';
COMMENT ON COLUMN pins.personal_photos IS 'Fotos personales del diario (array JSON de URLs)';
