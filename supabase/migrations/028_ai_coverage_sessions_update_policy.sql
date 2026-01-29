-- Migration: AI Coverage sessions - allow user to update own session (V1)
-- Description: Sin esta política, el usuario no puede actualizar status/generated_count/cooldown_until tras generar.

BEGIN;

DROP POLICY IF EXISTS "Users can update own ai coverage sessions" ON ai_coverage_sessions;
CREATE POLICY "Users can update own ai coverage sessions"
  ON ai_coverage_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMIT;
