-- Migration: Create spots table for FLOWYA V1.3
-- Date: 2026-01-11
-- Description: Tabla para almacenar spots del mundo (contenido curado) y spots de usuario

-- Crear tabla spots
CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- enum: 'restaurant', 'museum', 'park', 'beach', 'monument', etc.
  location JSONB NOT NULL, -- { lat: number, lng: number, city?: string, country?: string }
  short_description TEXT,
  description TEXT,
  image JSONB NOT NULL, -- { url: string, source?: string, license?: string }
  has_generated_content BOOLEAN DEFAULT false,
  spot_type TEXT, -- 'world' para spots del mundo, NULL/user para spots de usuario/legacy
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_spots_location ON spots USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_spots_type ON spots (type);
CREATE INDEX IF NOT EXISTS idx_spots_spot_type ON spots (spot_type);
CREATE INDEX IF NOT EXISTS idx_spots_created_at ON spots (created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_spots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_spots_updated_at
  BEFORE UPDATE ON spots
  FOR EACH ROW
  EXECUTE FUNCTION update_spots_updated_at();

-- Row Level Security (RLS)
ALTER TABLE spots ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver spots del mundo
CREATE POLICY "Anyone can view world spots"
  ON spots FOR SELECT
  USING (spot_type = 'world');

-- Política: Usuarios pueden ver sus propios spots
CREATE POLICY "Users can view own spots"
  ON spots FOR SELECT
  USING (auth.uid() = created_by);

-- Política: Usuarios pueden crear sus propios spots
CREATE POLICY "Users can create own spots"
  ON spots FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Política: Usuarios pueden actualizar sus propios spots
CREATE POLICY "Users can update own spots"
  ON spots FOR UPDATE
  USING (auth.uid() = created_by);

-- Política: Usuarios pueden eliminar sus propios spots
CREATE POLICY "Users can delete own spots"
  ON spots FOR DELETE
  USING (auth.uid() = created_by);

-- Comentarios para documentación
COMMENT ON TABLE spots IS 'Spots del mundo (contenido curado) y spots de usuario';
COMMENT ON COLUMN spots.spot_type IS 'Tipo de spot: world (spots del mundo curados) o NULL/user (spots de usuario/legacy)';
COMMENT ON COLUMN spots.location IS 'Ubicación geográfica en formato JSONB: {lat, lng, city?, country?}';
COMMENT ON COLUMN spots.image IS 'Imagen en formato JSONB: {url, source?, license?}';
