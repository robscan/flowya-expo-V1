-- Migration: Allow contributions for new spots (V2.0)
-- Date: 2026-01-14
-- Description: spot_id nullable + applier creates spot when needed

BEGIN;

ALTER TABLE spot_contributions
  ALTER COLUMN spot_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS is_new_spot BOOLEAN DEFAULT false;

COMMENT ON COLUMN spot_contributions.is_new_spot IS 'Indica si la contribución crea un nuevo Spot (V2.0)';

CREATE OR REPLACE FUNCTION apply_spot_contribution(contribution_id UUID)
RETURNS VOID AS $$
DECLARE
  contribution spot_contributions%ROWTYPE;
  updated_spot spots%ROWTYPE;
  new_spot_id TEXT;
BEGIN
  SELECT * INTO contribution
  FROM spot_contributions
  WHERE id = contribution_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contribution not found';
  END IF;

  IF contribution.status <> 'pending' THEN
    RAISE EXCEPTION 'Contribution already processed';
  END IF;

  IF contribution.spot_id IS NULL OR contribution.is_new_spot THEN
    new_spot_id := 'spot-' || replace(gen_random_uuid()::text, '-', '');
    INSERT INTO spots (
      id,
      name,
      type,
      location,
      short_description,
      description,
      image,
      has_generated_content,
      created_by
    )
    VALUES (
      new_spot_id,
      contribution.payload->>'name',
      contribution.payload->>'type',
      contribution.payload->'location',
      contribution.payload->>'short_description',
      contribution.payload->>'description',
      contribution.payload->'image',
      COALESCE((contribution.payload->>'has_generated_content')::boolean, false),
      contribution.author_id
    )
    RETURNING * INTO updated_spot;

    UPDATE spot_contributions
    SET spot_id = new_spot_id,
        is_new_spot = true
    WHERE id = contribution.id;
  ELSE
    UPDATE spots
    SET
      name = COALESCE(contribution.payload->>'name', name),
      type = COALESCE(contribution.payload->>'type', type),
      short_description = COALESCE(contribution.payload->>'short_description', short_description),
      description = COALESCE(contribution.payload->>'description', description),
      image = COALESCE(contribution.payload->'image', image),
      location = COALESCE(contribution.payload->'location', location),
      has_generated_content = COALESCE((contribution.payload->>'has_generated_content')::boolean, has_generated_content)
    WHERE id = contribution.spot_id
    RETURNING * INTO updated_spot;
  END IF;

  INSERT INTO spot_versions (spot_id, contribution_id, snapshot, created_by)
  VALUES (updated_spot.id, contribution.id, to_jsonb(updated_spot), auth.uid());

  UPDATE spot_contributions
  SET status = 'applied',
      applied_at = NOW(),
      reviewed_by = auth.uid()
  WHERE id = contribution.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION apply_spot_contribution(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION apply_spot_contribution(UUID) TO service_role;

COMMIT;
