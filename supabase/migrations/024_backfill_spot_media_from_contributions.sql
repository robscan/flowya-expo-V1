-- Migration: Backfill spot_media_public from applied contributions with image
-- Date: 2026-01-15
-- Description: Inserta filas en spot_media_public para contribuciones ya aplicadas
--   que tienen image.url (Storage público), para que esas imágenes se muestren
--   en Home/Search/Map. Requiere 023 (extract_storage_path_from_public_url).

BEGIN;

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

COMMIT;
