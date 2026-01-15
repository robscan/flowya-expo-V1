-- Migration: Align admin panel schema with V2.0 runtime
-- Date: 2026-01-15
-- Description: Ensure admin audit log + applier RPC exist and contributions have admin fields

BEGIN;

-- Ensure admin audit log exists (admin_id defaults to auth.uid())
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL DEFAULT auth.uid(),
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_audit_log' AND policyname = 'Admin can view audit log'
  ) THEN
    CREATE POLICY "Admin can view audit log"
      ON admin_audit_log
      FOR SELECT
      USING (is_admin_email());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_audit_log' AND policyname = 'Admin can insert audit log'
  ) THEN
    CREATE POLICY "Admin can insert audit log"
      ON admin_audit_log
      FOR INSERT
      WITH CHECK (is_admin_email());
  END IF;
END $$;

-- Align spot_contributions admin fields used by UI
ALTER TABLE spot_contributions
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID,
  ADD COLUMN IF NOT EXISTS review_reason TEXT;

-- Admin RPC wrapper for applier
CREATE OR REPLACE FUNCTION apply_spot_contribution_admin(contribution_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT is_admin_email() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  PERFORM apply_spot_contribution(contribution_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION apply_spot_contribution_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION apply_spot_contribution_admin(UUID) TO authenticated;

COMMIT;
