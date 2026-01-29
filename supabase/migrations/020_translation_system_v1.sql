-- Migration: Translation System V1
-- Date: 2026-01-15
-- Description: Tabla de traducciones canonicas ES/EN con estados

BEGIN;

CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  field TEXT NOT NULL,
  lang TEXT NOT NULL CHECK (lang IN ('es', 'en')),
  status TEXT NOT NULL CHECK (status IN ('machine', 'reviewed', 'published')),
  text TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS translations_unique_key
  ON translations (entity_type, entity_id, field, lang);

CREATE INDEX IF NOT EXISTS idx_translations_entity
  ON translations (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_translations_status
  ON translations (status);

CREATE INDEX IF NOT EXISTS idx_translations_lang
  ON translations (lang);

ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION update_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_translations_updated_at ON translations;
CREATE TRIGGER update_translations_updated_at
  BEFORE UPDATE ON translations
  FOR EACH ROW
  EXECUTE FUNCTION update_translations_updated_at();

DROP POLICY IF EXISTS "Anyone can view published translations" ON translations;
CREATE POLICY "Anyone can view published translations"
  ON translations
  FOR SELECT
  USING (status = 'published');

DROP POLICY IF EXISTS "Admin can manage translations" ON translations;
CREATE POLICY "Admin can manage translations"
  ON translations
  FOR ALL
  USING (can_access_admin_panel())
  WITH CHECK (can_access_admin_panel());

COMMIT;
