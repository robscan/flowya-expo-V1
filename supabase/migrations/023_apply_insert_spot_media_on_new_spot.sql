-- Migration: Insert spot_media_public when apply creates new spot with image
-- Date: 2026-01-15
-- Description: Al crear un spot nuevo vía apply, insertar en spot_media_public
--   si el payload tiene image.url (URL pública de Storage), para que la imagen
--   se muestre en Home/Search/Map vía fetch de media.

BEGIN;

-- Extraer storage_path desde URL pública de Supabase Storage.
-- Formato: https://.../storage/v1/object/public/flowya-public-spots/<path>
CREATE OR REPLACE FUNCTION extract_storage_path_from_public_url(url_in TEXT)
RETURNS TEXT AS $$
  SELECT CASE
    WHEN url_in IS NULL OR trim(url_in) = '' THEN NULL
    WHEN url_in ~ '/storage/v1/object/public/flowya-public-spots/' THEN
      regexp_replace(
        trim(url_in),
        '^.*/storage/v1/object/public/flowya-public-spots/',
        ''
      )
    ELSE NULL
  END;
$$ LANGUAGE sql IMMUTABLE;

-- Asegurar que spot_media_public tenga storage_path (si existe solo url, añadir y backfill).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'spot_media_public' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE spot_media_public ADD COLUMN storage_path TEXT;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'spot_media_public' AND column_name = 'url'
    ) THEN
      UPDATE spot_media_public
      SET storage_path = regexp_replace(trim(url), '^.*/storage/v1/object/public/flowya-public-spots/', '')
      WHERE url IS NOT NULL AND trim(url) <> '' AND url ~ '/storage/v1/object/public/flowya-public-spots/';
    END IF;
  END IF;
  -- Si existe url NOT NULL, hacerla nullable para que INSERT solo con storage_path sea válido.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'spot_media_public' AND column_name = 'url'
  ) THEN
    BEGIN
      ALTER TABLE spot_media_public ALTER COLUMN url DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- ignorar si ya es nullable o no aplicable
    END;
  END IF;
END $$;

-- Apply: compatible con esquema FLOWYA (spots sin image, location_lat/lng).
-- Inserta en spot_media_public cuando el payload tiene image.url (Storage público).
CREATE OR REPLACE FUNCTION apply_spot_contribution(contribution_id UUID)
RETURNS VOID AS $$
DECLARE
  contribution spot_contributions%ROWTYPE;
  updated_spot spots%ROWTYPE;
  new_spot_id TEXT;
  img_url TEXT;
  img_path TEXT;
  img_source TEXT;
  loc JSONB;
  lat_val DOUBLE PRECISION;
  lng_val DOUBLE PRECISION;
  snap JSONB;
  ver INT;
BEGIN
  SELECT * INTO contribution
  FROM spot_contributions
  WHERE id = contribution_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contribution not found';
  END IF;

  IF contribution.status <> 'pending' THEN
    RAISE EXCEPTION 'Contribution already processed';
  END IF;

  loc := contribution.payload->'location';
  IF loc IS NULL AND contribution.spot_id IS NULL THEN
    RAISE EXCEPTION 'Payload location required for new spot';
  END IF;

  IF contribution.spot_id IS NULL THEN
    new_spot_id := 'spot-' || replace(gen_random_uuid()::text, '-', '');
    lat_val := (loc->>'lat')::double precision;
    lng_val := (loc->>'lng')::double precision;
    IF lat_val IS NULL OR lng_val IS NULL OR lat_val < -90 OR lat_val > 90 OR lng_val < -180 OR lng_val > 180 THEN
      RAISE EXCEPTION 'Invalid location lat/lng in payload';
    END IF;

    INSERT INTO spots (
      id,
      name,
      type,
      location_lat,
      location_lng,
      location_city,
      location_country,
      short_description,
      has_generated_content,
      source,
      created_by
    )
    VALUES (
      new_spot_id,
      contribution.payload->>'name',
      contribution.payload->>'type',
      lat_val,
      lng_val,
      NULLIF(trim(loc->>'city'), ''),
      NULLIF(trim(loc->>'country'), ''),
      NULLIF(trim(contribution.payload->>'short_description'), ''),
      COALESCE((contribution.payload->>'has_generated_content')::boolean, false),
      'user',
      contribution.author_id
    )
    RETURNING * INTO updated_spot;

    -- Insertar en spot_media_public si hay image.url (Storage público)
    img_url := contribution.payload->'image'->>'url';
    img_path := extract_storage_path_from_public_url(img_url);
    img_source := COALESCE(NULLIF(trim(contribution.payload->'image'->>'source'), ''), 'user');
    IF img_path IS NOT NULL AND img_path <> '' THEN
      INSERT INTO spot_media_public (spot_id, storage_path, source, created_by, status)
      VALUES (new_spot_id, img_path, img_source, contribution.author_id, 'active');
    END IF;

    UPDATE spot_contributions
    SET spot_id = new_spot_id
    WHERE id = contribution.id;
  ELSE
    UPDATE spots
    SET
      name = COALESCE(contribution.payload->>'name', name),
      type = COALESCE(contribution.payload->>'type', type),
      short_description = COALESCE(NULLIF(trim(contribution.payload->>'short_description'), ''), short_description),
      has_generated_content = COALESCE((contribution.payload->>'has_generated_content')::boolean, has_generated_content),
      location_lat = CASE WHEN (loc->>'lat') IS NOT NULL AND (loc->>'lat') <> '' THEN (loc->>'lat')::double precision ELSE location_lat END,
      location_lng = CASE WHEN (loc->>'lng') IS NOT NULL AND (loc->>'lng') <> '' THEN (loc->>'lng')::double precision ELSE location_lng END,
      location_city = CASE WHEN (loc->>'city') IS NOT NULL THEN NULLIF(trim(loc->>'city'), '') ELSE location_city END,
      location_country = CASE WHEN (loc->>'country') IS NOT NULL THEN NULLIF(trim(loc->>'country'), '') ELSE location_country END
    WHERE id = contribution.spot_id
    RETURNING * INTO updated_spot;

    -- En updates: insertar en spot_media_public si payload tiene image.url (Storage público)
    img_url := contribution.payload->'image'->>'url';
    img_path := extract_storage_path_from_public_url(img_url);
    img_source := COALESCE(NULLIF(trim(contribution.payload->'image'->>'source'), ''), 'user');
    IF img_path IS NOT NULL AND img_path <> '' THEN
      INSERT INTO spot_media_public (spot_id, storage_path, source, created_by, status)
      SELECT contribution.spot_id, img_path, img_source, contribution.author_id, 'active'
      WHERE NOT EXISTS (
        SELECT 1 FROM spot_media_public m
        WHERE m.spot_id = contribution.spot_id AND m.storage_path = img_path
      );
    END IF;
  END IF;

  snap := to_jsonb(updated_spot);
  IF contribution.spot_id IS NULL THEN
    ver := 1;
  ELSE
    SELECT COALESCE(MAX(version), 0) + 1 INTO ver
    FROM spot_versions WHERE spot_id = contribution.spot_id;
  END IF;
  INSERT INTO spot_versions (spot_id, contribution_id, version, snapshot, created_by)
  VALUES (updated_spot.id, contribution.id, ver, snap, auth.uid());

  UPDATE spot_contributions
  SET status = 'applied',
      applied_at = NOW(),
      reviewed_by = auth.uid()
  WHERE id = contribution.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION apply_spot_contribution(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION apply_spot_contribution(UUID) TO service_role;

COMMIT;
