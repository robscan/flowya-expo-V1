-- Migration: Create SpotContribution, SpotVersion, moderation tables (V2.0)
-- Date: 2026-01-14
-- Description: Contributions + applier + moderation thresholds (canónico)

BEGIN;

-- Extend spots with moderation state
ALTER TABLE spots
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS needs_review_at TIMESTAMPTZ;

COMMENT ON COLUMN spots.needs_review IS 'Spot marcado para revisión por reportes (V2.0)';
COMMENT ON COLUMN spots.needs_review_at IS 'Fecha/hora en que se marcó needs_review';

-- Spot contributions (public edits)
CREATE TABLE IF NOT EXISTS spot_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  review_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_spot_contributions_spot_id ON spot_contributions (spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_contributions_author_id ON spot_contributions (author_id);
CREATE INDEX IF NOT EXISTS idx_spot_contributions_status ON spot_contributions (status);
CREATE INDEX IF NOT EXISTS idx_spot_contributions_created_at ON spot_contributions (created_at DESC);

ALTER TABLE spot_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contributions"
  ON spot_contributions FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create own contributions"
  ON spot_contributions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

COMMENT ON TABLE spot_contributions IS 'Ediciones públicas propuestas (V2.0). Solo via contributions.';

-- Spot versions (snapshots after apply)
CREATE TABLE IF NOT EXISTS spot_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  contribution_id UUID REFERENCES spot_contributions(id) ON DELETE SET NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_spot_versions_spot_id ON spot_versions (spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_versions_created_at ON spot_versions (created_at DESC);

ALTER TABLE spot_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view spot versions"
  ON spot_versions FOR SELECT
  USING (true);

COMMENT ON TABLE spot_versions IS 'Snapshots inmutables del Spot aplicados por applier (V2.0).';

-- Spot media (public)
CREATE TABLE IF NOT EXISTS spot_media_public (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  source TEXT,
  license TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'soft_hidden')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spot_media_spot_id ON spot_media_public (spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_media_status ON spot_media_public (status);
CREATE INDEX IF NOT EXISTS idx_spot_media_created_at ON spot_media_public (created_at DESC);

ALTER TABLE spot_media_public ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view spot media"
  ON spot_media_public FOR SELECT
  USING (true);

COMMENT ON TABLE spot_media_public IS 'Media pública de Spot con moderación ligera (V2.0).';

-- Reuse existing updated_at trigger function if present
CREATE TRIGGER update_spot_media_public_updated_at
  BEFORE UPDATE ON spot_media_public
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Spot reports (community)
CREATE TABLE IF NOT EXISTS spot_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  media_id UUID REFERENCES spot_media_public(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('incorrecta', 'no es del lugar', 'ofensiva', 'spam')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spot_reports_spot_id ON spot_reports (spot_id);
CREATE INDEX IF NOT EXISTS idx_spot_reports_media_id ON spot_reports (media_id);
CREATE INDEX IF NOT EXISTS idx_spot_reports_reporter_id ON spot_reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_spot_reports_created_at ON spot_reports (created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS spot_reports_unique_media
  ON spot_reports (media_id, reporter_id)
  WHERE media_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS spot_reports_unique_spot
  ON spot_reports (spot_id, reporter_id)
  WHERE media_id IS NULL;

ALTER TABLE spot_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
  ON spot_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users can create own reports"
  ON spot_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

COMMENT ON TABLE spot_reports IS 'Reportes de comunidad (V2.0).';

-- Applier function (admin/service role)
CREATE OR REPLACE FUNCTION apply_spot_contribution(contribution_id UUID)
RETURNS VOID AS $$
DECLARE
  contribution spot_contributions%ROWTYPE;
  updated_spot spots%ROWTYPE;
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

-- Moderation thresholds (V2.0)
CREATE OR REPLACE FUNCTION apply_spot_report_thresholds()
RETURNS TRIGGER AS $$
DECLARE
  media_report_count INTEGER;
  spot_report_count INTEGER;
BEGIN
  IF NEW.media_id IS NOT NULL THEN
    SELECT COUNT(DISTINCT reporter_id)
      INTO media_report_count
      FROM spot_reports
     WHERE media_id = NEW.media_id;

    IF media_report_count >= 3 THEN
      UPDATE spot_media_public
         SET status = 'soft_hidden',
             updated_at = NOW()
       WHERE id = NEW.media_id
         AND status <> 'soft_hidden';
    END IF;
  END IF;

  SELECT COUNT(DISTINCT reporter_id)
    INTO spot_report_count
    FROM spot_reports
   WHERE spot_id = NEW.spot_id;

  IF spot_report_count >= 5 THEN
    UPDATE spots
       SET needs_review = true,
           needs_review_at = COALESCE(needs_review_at, NOW())
     WHERE id = NEW.spot_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_apply_spot_report_thresholds
  AFTER INSERT ON spot_reports
  FOR EACH ROW
  EXECUTE FUNCTION apply_spot_report_thresholds();

COMMIT;
