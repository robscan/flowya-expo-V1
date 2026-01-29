-- Migration: AI Coverage sessions (V1)
-- Date: 2026-01-15
-- Description: Registro de sesiones AI Coverage con bbox y reason

BEGIN;

CREATE TABLE IF NOT EXISTS ai_coverage_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  source TEXT,
  reason TEXT,
  bbox JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'generated', 'failed', 'cooldown')),
  generated_count INTEGER DEFAULT 0,
  cooldown_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_coverage_sessions_user
  ON ai_coverage_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_ai_coverage_sessions_status
  ON ai_coverage_sessions (status);

ALTER TABLE ai_coverage_sessions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION update_ai_coverage_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ai_coverage_sessions_updated_at ON ai_coverage_sessions;
CREATE TRIGGER update_ai_coverage_sessions_updated_at
  BEFORE UPDATE ON ai_coverage_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_coverage_sessions_updated_at();

DROP POLICY IF EXISTS "Admin can view ai coverage sessions" ON ai_coverage_sessions;
CREATE POLICY "Admin can view ai coverage sessions"
  ON ai_coverage_sessions
  FOR SELECT
  USING (can_access_admin_panel());

DROP POLICY IF EXISTS "Users can create own ai coverage sessions" ON ai_coverage_sessions;
CREATE POLICY "Users can create own ai coverage sessions"
  ON ai_coverage_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

COMMIT;
