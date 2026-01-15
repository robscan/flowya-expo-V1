-- Migration: Admin rollback function (V2.0)
-- Date: 2026-01-14
-- Description: Rollback spot to a previous SpotVersion and register contribution

BEGIN;

CREATE OR REPLACE FUNCTION rollback_spot_to_version_admin(spot_id_input TEXT, version_id_input UUID)
RETURNS VOID AS $$
DECLARE
  version_row spot_versions%ROWTYPE;
  rollback_contribution_id UUID;
BEGIN
  IF NOT is_admin_email() THEN
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
