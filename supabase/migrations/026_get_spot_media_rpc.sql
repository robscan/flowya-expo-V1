-- Migration: RPC get_spot_media_for_spot_ids
-- Date: 2026-01-15
-- Description: RPC SECURITY DEFINER que devuelve spot_id, storage_path, created_at
--   desde spot_media_public para los ids dados. Evita que RLS oculte filas al cliente.

BEGIN;

CREATE OR REPLACE FUNCTION get_spot_media_for_spot_ids(spot_ids TEXT[])
RETURNS TABLE(spot_id TEXT, storage_path TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT m.spot_id, m.storage_path, m.created_at
  FROM spot_media_public m
  WHERE m.spot_id = ANY(spot_ids)
    AND m.status = 'active'
  ORDER BY m.created_at DESC;
$$;

COMMENT ON FUNCTION get_spot_media_for_spot_ids(TEXT[]) IS 'Returns spot media for given spot ids (SECURITY DEFINER). Use for client fetch when RLS hides rows.';

REVOKE EXECUTE ON FUNCTION get_spot_media_for_spot_ids(TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_spot_media_for_spot_ids(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_spot_media_for_spot_ids(TEXT[]) TO anon;

COMMIT;
