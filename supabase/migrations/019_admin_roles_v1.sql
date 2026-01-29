-- Migration: Admin roles and policies (V1)
-- Date: 2026-01-15
-- Description: Roles base para Admin System V1

BEGIN;

-- Tabla de roles (1 rol por usuario)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'curator', 'support', 'analyst')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles (role);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_user_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_roles_updated_at();

-- Helpers de rol
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  role_value TEXT;
BEGIN
  SELECT role INTO role_value
    FROM user_roles
   WHERE user_id = auth.uid();
  RETURN role_value;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION is_admin_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION can_access_admin_panel()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('admin', 'curator', 'support', 'analyst') OR is_admin_email();
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION can_moderate_contributions()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('admin', 'curator') OR is_admin_email();
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION can_moderate_reports()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_user_role() IN ('admin', 'curator', 'support') OR is_admin_email();
END;
$$ LANGUAGE plpgsql STABLE;

-- Policies: roles
DROP POLICY IF EXISTS "Admin can manage user roles" ON user_roles;
CREATE POLICY "Admin can manage user roles"
  ON user_roles
  FOR ALL
  USING (is_admin_role() OR is_admin_email())
  WITH CHECK (is_admin_role() OR is_admin_email());

DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
CREATE POLICY "Users can view own role"
  ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policies: contributions
DROP POLICY IF EXISTS "Admin can manage contributions" ON spot_contributions;
CREATE POLICY "Admin can manage contributions"
  ON spot_contributions
  FOR ALL
  USING (can_access_admin_panel())
  WITH CHECK (can_access_admin_panel());

-- Policies: reports/media/spots/versions
DROP POLICY IF EXISTS "Admin can view reports" ON spot_reports;
CREATE POLICY "Admin can view reports"
  ON spot_reports
  FOR SELECT
  USING (can_access_admin_panel());

DROP POLICY IF EXISTS "Admin can update media" ON spot_media_public;
CREATE POLICY "Admin can update media"
  ON spot_media_public
  FOR UPDATE
  USING (can_moderate_reports());

DROP POLICY IF EXISTS "Admin can update spots moderation" ON spots;
CREATE POLICY "Admin can update spots moderation"
  ON spots
  FOR UPDATE
  USING (can_moderate_reports());

DROP POLICY IF EXISTS "Admin can view spot versions" ON spot_versions;
CREATE POLICY "Admin can view spot versions"
  ON spot_versions
  FOR SELECT
  USING (can_access_admin_panel());

-- Policies: audit log
DROP POLICY IF EXISTS "Admin can view audit log" ON admin_audit_log;
CREATE POLICY "Admin can view audit log"
  ON admin_audit_log
  FOR SELECT
  USING (can_access_admin_panel());

DROP POLICY IF EXISTS "Admin can insert audit log" ON admin_audit_log;
CREATE POLICY "Admin can insert audit log"
  ON admin_audit_log
  FOR INSERT
  WITH CHECK (can_access_admin_panel());

-- RPCs: applier y rollback
CREATE OR REPLACE FUNCTION apply_spot_contribution_admin(contribution_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT can_moderate_contributions() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  PERFORM apply_spot_contribution(contribution_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION apply_spot_contribution_admin(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION apply_spot_contribution_admin(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION rollback_spot_to_version_admin(spot_id_input TEXT, version_id_input UUID)
RETURNS VOID AS $$
DECLARE
  version_row spot_versions%ROWTYPE;
  rollback_contribution_id UUID;
BEGIN
  IF NOT (is_admin_role() OR is_admin_email()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO version_row
  FROM spot_versions
  WHERE id = version_id_input
    AND spot_id = spot_id_input;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SpotVersion not found';
  END IF;

  INSERT INTO spot_contributions (
    spot_id,
    author_id,
    payload,
    status,
    applied_at,
    review_reason,
    reviewed_by
  )
  VALUES (
    spot_id_input,
    auth.uid(),
    jsonb_build_object(
      'name', version_row.snapshot->>'name',
      'type', version_row.snapshot->>'type',
      'short_description', version_row.snapshot->>'short_description',
      'description', version_row.snapshot->>'description',
      'image', version_row.snapshot->'image',
      'location', version_row.snapshot->'location',
      'has_generated_content', (version_row.snapshot->>'has_generated_content')::boolean,
      'needs_review', (version_row.snapshot->>'needs_review')::boolean,
      'needs_review_at', version_row.snapshot->>'needs_review_at'
    ),
    'applied',
    NOW(),
    'rollback',
    auth.uid()
  )
  RETURNING id INTO rollback_contribution_id;

  UPDATE spots
  SET
    name = COALESCE(version_row.snapshot->>'name', name),
    type = COALESCE(version_row.snapshot->>'type', type),
    short_description = COALESCE(version_row.snapshot->>'short_description', short_description),
    description = COALESCE(version_row.snapshot->>'description', description),
    image = COALESCE(version_row.snapshot->'image', image),
    location = COALESCE(version_row.snapshot->'location', location),
    has_generated_content = COALESCE((version_row.snapshot->>'has_generated_content')::boolean, has_generated_content),
    needs_review = COALESCE((version_row.snapshot->>'needs_review')::boolean, needs_review),
    needs_review_at = COALESCE((version_row.snapshot->>'needs_review_at')::timestamptz, needs_review_at)
  WHERE id = spot_id_input;

  INSERT INTO spot_versions (spot_id, contribution_id, snapshot, created_by)
  VALUES (spot_id_input, rollback_contribution_id, version_row.snapshot, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION rollback_spot_to_version_admin(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION rollback_spot_to_version_admin(TEXT, UUID) TO authenticated;

COMMIT;
