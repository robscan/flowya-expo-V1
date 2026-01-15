-- Migration: Align spot_contributions with V2.0 canonical model
-- Date: 2026-01-15
-- Description: Add type column and allow null spot_id for create contributions

BEGIN;

ALTER TABLE spot_contributions
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'update';

ALTER TABLE spot_contributions
  ALTER COLUMN spot_id DROP NOT NULL;

ALTER TABLE spot_contributions
  DROP CONSTRAINT IF EXISTS spot_contributions_type_check;

ALTER TABLE spot_contributions
  ADD CONSTRAINT spot_contributions_type_check
  CHECK (type IN ('create', 'update', 'rollback'));

COMMIT;
