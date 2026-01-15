-- Migration: Admin policies and RPC for V2.0
-- Date: 2026-01-14
-- Description: Admin-only access for contributions/moderation and apply RPC

BEGIN;

-- Admin check using email from JWT
CREATE OR REPLACE FUNCTION is_admin_email()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  user_email := auth.jwt() ->> 'email';
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  RETURN lower(trim(user_email)) = lower('oscar@agenciaparadigma.com');
END;
$$ LANGUAGE plpgsql STABLE;

-- Admin policy for contributions (view/manage)
CREATE POLICY "Admin can manage contributions"
  ON spot_contributions
  FOR ALL
  USING (is_admin_email())
  WITH CHECK (is_admin_email());

-- Admin policy for reports/media/spots
CREATE POLICY "Admin can view reports"
  ON spot_reports
  FOR SELECT
  USING (is_admin_email());

CREATE POLICY "Admin can update media"
  ON spot_media_public
  FOR UPDATE
  USING (is_admin_email());

CREATE POLICY "Admin can update spots moderation"
  ON spots
  FOR UPDATE
  USING (is_admin_email());

-- Admin policy for spot versions (view)
CREATE POLICY "Admin can view spot versions"
  ON spot_versions
  FOR SELECT
  USING (is_admin_email());

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
