-- Migration: Admin can delete spots (V2.0)
-- Description: Permite a admin/curator eliminar cualquier spot sin tocar otras reglas.

BEGIN;

DROP POLICY IF EXISTS "Admin can delete spots" ON spots;
CREATE POLICY "Admin can delete spots"
  ON spots
  FOR DELETE
  USING (can_moderate_contributions() OR is_admin_email());

COMMIT;
