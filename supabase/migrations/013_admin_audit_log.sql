-- Migration: Admin audit log (V2.0)
-- Date: 2026-01-14
-- Description: Tabla para registrar acciones admin

BEGIN;

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_entity ON admin_audit_log (entity_type, entity_id);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view audit log"
  ON admin_audit_log
  FOR SELECT
  USING (is_admin_email());

CREATE POLICY "Admin can insert audit log"
  ON admin_audit_log
  FOR INSERT
  WITH CHECK (is_admin_email());

COMMENT ON TABLE admin_audit_log IS 'Registro de acciones admin (V2.0).';

COMMIT;
