-- Migration: Allow admin to create spots directly (V2.0)
-- Date: 2026-01-14
-- Description: Permitir INSERT en spots solo para usuario admin canónico

BEGIN;

-- Admin policy for creating spots
CREATE POLICY "Admin can create spots"
  ON spots
  FOR INSERT
  WITH CHECK (is_admin_email());

COMMIT;
