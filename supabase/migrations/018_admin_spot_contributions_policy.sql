-- Migration: Admin policies for spot_contributions (V2.0)
-- Date: 2026-01-15
-- Description: Permite a admin ver y actualizar contributions

BEGIN;

ALTER TABLE spot_contributions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'spot_contributions' AND policyname = 'Admin can view contributions'
  ) THEN
    CREATE POLICY "Admin can view contributions"
      ON spot_contributions
      FOR SELECT
      USING (is_admin_email());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'spot_contributions' AND policyname = 'Admin can update contributions'
  ) THEN
    CREATE POLICY "Admin can update contributions"
      ON spot_contributions
      FOR UPDATE
      USING (is_admin_email())
      WITH CHECK (is_admin_email());
  END IF;
END $$;

COMMIT;
