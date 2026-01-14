-- Migration: Create spot_media table for FLOWYA V1.3
-- Date: 2026-01-20
-- Description: Tabla para almacenar contribuciones de media (imágenes) a World Spots sin requerir pin

-- Crear tabla spot_media
CREATE TABLE IF NOT EXISTS spot_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL, -- Referencia a spots.id (World Spot o User Spot)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable para contribuciones anónimas futuras
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')), -- Extensible para futuro
  source_type TEXT NOT NULL DEFAULT 'real' CHECK (source_type IN ('real', 'stock')), -- real = usuario, stock = Unsplash
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT spot_media_spot_id_fk FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_spot_media_spot_id ON spot_media (spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_media_user_id ON spot_media (user_id);
CREATE INDEX IF NOT EXISTS idx_spot_media_status ON spot_media (status);
CREATE INDEX IF NOT EXISTS idx_spot_media_spot_status ON spot_media (spot_id, status);

-- Row Level Security (RLS)
ALTER TABLE spot_media ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden ver media aprobada
CREATE POLICY "Anyone can view approved media"
  ON spot_media FOR SELECT
  USING (status = 'approved');

-- Política: Usuarios pueden ver su propia media (incluso pendiente)
CREATE POLICY "Users can view own media"
  ON spot_media FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuarios autenticados pueden crear media
CREATE POLICY "Authenticated users can create media"
  ON spot_media FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuarios pueden actualizar su propia media (solo si está pendiente)
CREATE POLICY "Users can update own pending media"
  ON spot_media FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Política: Usuarios pueden eliminar su propia media
CREATE POLICY "Users can delete own media"
  ON spot_media FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at automáticamente
-- Nota: La función update_updated_at_column() ya existe en 001_create_pins_table.sql
CREATE TRIGGER update_spot_media_updated_at
  BEFORE UPDATE ON spot_media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE spot_media IS 'Contribuciones de media (imágenes/videos) a spots sin requerir pin';
COMMENT ON COLUMN spot_media.spot_id IS 'ID del Spot (referencia a spots)';
COMMENT ON COLUMN spot_media.user_id IS 'ID del usuario que contribuyó (nullable para futuro)';
COMMENT ON COLUMN spot_media.media_url IS 'URL de la imagen/video';
COMMENT ON COLUMN spot_media.media_type IS 'Tipo de media: image o video';
COMMENT ON COLUMN spot_media.source_type IS 'Tipo de fuente: real (usuario) o stock (Unsplash)';
COMMENT ON COLUMN spot_media.status IS 'Estado: pending (pendiente), approved (aprobada), rejected (rechazada)';
