-- Migration: RPC backfill_spot_media_from_applied
-- Date: 2026-01-15
-- Description: RPC que ejecuta la lógica de 024 (backfill spot_media_public desde
--   contribuciones aplicadas con image.url). SECURITY DEFINER para evitar RLS en INSERT.
--   Requiere 023 (extract_storage_path_from_public_url).

BEGIN;

CREATE OR REPLACE FUNCTION backfill_spot_media_from_applied()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count INT := 0;
BEGIN
  WITH candidates AS (
    SELECT
      c.spot_id,
      c.payload->'image'->>'url' AS img_url,
      COALESCE(NULLIF(trim(c.payload->'image'->>'source'), ''), 'user') AS img_source,
      c.author_id
    FROM spot_contributions c
    WHERE c.status = 'applied'
      AND c.spot_id IS NOT NULL
      AND c.spot_id <> ''
      AND c.payload->'image'->>'url' IS NOT NULL
      AND trim(c.payload->'image'->>'url') <> ''
      AND (c.payload->'image'->>'url') ~ '/storage/v1/object/public/flowya-public-spots/'
  ),
  with_path AS (
    SELECT
      spot_id,
      img_source,
      author_id,
      extract_storage_path_from_public_url(img_url) AS storage_path
    FROM candidates
    WHERE extract_storage_path_from_public_url(img_url) IS NOT NULL
      AND extract_storage_path_from_public_url(img_url) <> ''
  )
  INSERT INTO spot_media_public (spot_id, storage_path, source, created_by, status)
  SELECT w.spot_id, w.storage_path, w.img_source, w.author_id, 'active'
  FROM with_path w
  WHERE NOT EXISTS (
    SELECT 1 FROM spot_media_public m
    WHERE m.spot_id = w.spot_id AND m.storage_path = w.storage_path
  );

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

COMMENT ON FUNCTION backfill_spot_media_from_applied() IS 'Backfill spot_media_public from applied contributions with image.url (024 logic).';

REVOKE EXECUTE ON FUNCTION backfill_spot_media_from_applied() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION backfill_spot_media_from_applied() TO authenticated;
GRANT EXECUTE ON FUNCTION backfill_spot_media_from_applied() TO anon;

-- Diagnóstico: cuenta candidates / with_path y muestra img_url + extract result.
CREATE OR REPLACE FUNCTION backfill_spot_media_diagnostic()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c_count INT := 0;
  w_count INT := 0;
  sample_url TEXT;
  sample_path TEXT;
  total_media INT := 0;
  match_media INT := 0;
  out JSONB;
BEGIN
  SELECT COUNT(*)::INT INTO total_media FROM spot_media_public;

  WITH candidates AS (
    SELECT
      c.spot_id,
      c.payload->'image'->>'url' AS img_url,
      COALESCE(NULLIF(trim(c.payload->'image'->>'source'), ''), 'user') AS img_source,
      c.author_id
    FROM spot_contributions c
    WHERE c.status = 'applied'
      AND c.spot_id IS NOT NULL
      AND c.spot_id <> ''
      AND c.payload->'image'->>'url' IS NOT NULL
      AND trim(c.payload->'image'->>'url') <> ''
      AND (c.payload->'image'->>'url') ~ '/storage/v1/object/public/flowya-public-spots/'
  ),
  with_path AS (
    SELECT
      spot_id,
      img_url,
      extract_storage_path_from_public_url(img_url) AS storage_path
    FROM candidates
  )
  SELECT
    (SELECT COUNT(*)::INT FROM candidates),
    (SELECT COUNT(*)::INT FROM with_path WHERE storage_path IS NOT NULL AND storage_path <> ''),
    (SELECT left(img_url, 160) FROM with_path LIMIT 1),
    (SELECT left(storage_path, 120) FROM with_path LIMIT 1),
    (SELECT COUNT(*)::INT FROM with_path w WHERE EXISTS (SELECT 1 FROM spot_media_public m WHERE m.spot_id = w.spot_id AND m.storage_path = w.storage_path))
  INTO c_count, w_count, sample_url, sample_path, match_media;

  out := jsonb_build_object(
    'candidates_count', c_count,
    'with_path_count', w_count,
    'sample_url', sample_url,
    'sample_path', sample_path,
    'total_spot_media_rows', total_media,
    'match_spot_media_rows', match_media
  );
  RETURN out;
END;
$$;

COMMENT ON FUNCTION backfill_spot_media_diagnostic() IS 'Diagnostic for backfill: candidates vs with_path counts and sample url/path.';

REVOKE EXECUTE ON FUNCTION backfill_spot_media_diagnostic() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION backfill_spot_media_diagnostic() TO authenticated;
GRANT EXECUTE ON FUNCTION backfill_spot_media_diagnostic() TO anon;

COMMIT;
