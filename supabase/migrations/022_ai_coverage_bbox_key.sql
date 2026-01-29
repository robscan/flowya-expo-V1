-- Migration: AI Coverage bbox key (V1)
-- Date: 2026-01-15
-- Description: Add bbox_key for cooldown matching

BEGIN;

ALTER TABLE ai_coverage_sessions
  ADD COLUMN IF NOT EXISTS bbox_key TEXT;

CREATE INDEX IF NOT EXISTS idx_ai_coverage_sessions_bbox_key
  ON ai_coverage_sessions (bbox_key);

CREATE INDEX IF NOT EXISTS idx_ai_coverage_sessions_user_bbox
  ON ai_coverage_sessions (user_id, bbox_key);

COMMIT;
