# Supabase Storage (FLOWYA V2.0)

Reglas canonicas:
- Toda media de usuarios vive en Supabase Storage.
- La DB solo guarda rutas; nunca blobs/base64.
- Moderacion no elimina archivos, solo cambia visibilidad.
- El nombre del archivo nunca es fuente de verdad semantica; toda semantica vive en DB (spot_media_public).

## Buckets obligatorios

1) flowya-public-spots (publico)
- Uso: media publica asociada a spots
- Relacion DB: spot_media_public.storage_path
- Permisos: lectura publica; escritura solo autenticados (y preferentemente via applier/admin)

2) flowya-private-pins (privado)
- Uso: media privada de pins (diario)
- Relacion DB: pins.personal_photos (paths)
- Permisos: lectura y escritura solo al owner (auth.uid)

## Estructura de paths (canonica)

- Publico (spots):
  flowya-public-spots/spots/{spot_id}/{media_id}.{ext}

- Privado (pins):
  flowya-private-pins/pins/{user_id}/{spot_id}/{media_id}.{ext}

Notas:
- El filename puede ser UUID/ulid; no usar nombres semanticos.
- La DB debe mapear semanticamente el media a su spot via spot_media_public.

## Politicas sugeridas (pseudo-SQL)

-- Crear buckets (idempotente)
insert into storage.buckets (id, name, public)
values
  ('flowya-public-spots', 'flowya-public-spots', true),
  ('flowya-private-pins', 'flowya-private-pins', false)
on conflict (id) do nothing;

-- Public: lectura libre
-- create policy "public_read_spots" on storage.objects
-- for select using (bucket_id = 'flowya-public-spots');

-- Public: escritura autenticada (preferible via server/applier)
-- create policy "auth_write_spots" on storage.objects
-- for insert with check (bucket_id = 'flowya-public-spots' and auth.role() = 'authenticated');

-- Private: lectura/escritura solo owner
-- create policy "owner_rw_pins" on storage.objects
-- for all using (bucket_id = 'flowya-private-pins' and owner = auth.uid());
