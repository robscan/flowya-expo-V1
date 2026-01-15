# Auditoria e inventario de migracion (FLOWYA V2.0)

Regla clave:
- AsyncStorage es fuente de extraccion, no de reconciliacion. Ninguna estructura inferida se replica en V2.0.

Fuentes canonicas (obligatorias):
- /Users/apple-1/mini-tours-expo/definitions/FLOWYA V2.0/DEFINICIONES_CONSOLIDADAS_V2_0.md
- /Users/apple-1/mini-tours-expo/definitions/FLOWYA V2.0/DECISIONES_CANONICAS.md
- /Users/apple-1/mini-tours-expo/definitions/FLOWYA V2.0/MODELO_DATOS.md

## Inventario de fuentes legacy

### JSON seeds (legacy)
- data/seedSpots.v1.2.json
  - Tipo: spots legacy (seed)
  - Estado: migrar -> spots (source=seed) + spot_versions v1
  - Transformacion: normalizeSpotId, validacion de coordenadas, normalizacion de campos
  - Descarte: spots sin coordenadas validas (registrar en este archivo)

### AsyncStorage (extraccion)
Basado en contexts/* y utils/*.

- @flowya_spots (contexts/SpotContext.tsx)
  - Tipo: spots legacy (user-created y migrados)
  - Estado: migrar -> spots (source=user) + spot_versions v1
  - Transformacion: normalizeSpotId, validacion coordenadas, mapear a modelo V2.0
  - Observacion: contiene migraciones internas V1.2/V1.3, no se respetan shapes legacy

- @flowya_flows (contexts/PathContext.tsx)
  - Tipo: flows (definicion)
  - Estado: migrar -> flows
  - Transformacion: normalizeSpotId en lista de spots, fechas ISO -> timestamptz

- @flowya_saved (contexts/SavedContext.tsx)
  - Tipo: pins y afinidad (likes/saved/not_my_vibe), timeline
  - Estado: migrar solo pins -> pins
  - Transformacion: normalizeSpotId; descartar entradas sin user_id
  - Descarte: likes/saved/not_my_vibe/timeline (no canonicos en V2.0)

- @flowya_selected_region_id (contexts/RegionContext.tsx)
  - Tipo: preferencia UI
  - Estado: descartar (no canonico)

- @flowya_auth_session (contexts/AuthContext.tsx)
  - Tipo: cache de sesion
  - Estado: descartar (no canonico)

- Flags/compatibilidad (utils/*.ts)
  - @flowya_migration_v1_3_completed (SavedContext)
  - @flowya_v1_2_migration_done (SpotContext)
  - @flowya_region_remigration_done (SpotContext)
  - @flowya_legacy_marked (SpotContext)
  - @flowya_default_owner_id (utils/defaultOwner.ts)
  - @flowya_owner_migration_completed (utils/ownerMigration.ts)
  - @flowya_pin_first_time_shown (utils/pinFirstTime.ts)
  - Estado: descartar (flags locales no canonicos)

- Claves legacy mini_tours (utils/clearStorage.ts)
  - @mini_tours_spots, @mini_tours_paths, @mini_tours_flows, @mini_tours_saved, @mini_tours_preferences
  - Estado: extraer si existen; transformar segun reglas de spots/flows/pins; si no, descartar

### Supabase parcial (solo auditoria)
- Tabla pins existente (utils/pinsService.ts)
  - Tipo: pins server-side
  - Estado: migrar -> pins (upsert idempotente)
  - Transformacion: normalizeSpotId; preferir datos server-side cuando existan

- supabase/migrations/*.sql
  - Estado: referencia tecnica, no canonica. No se reutilizan como esquema final.

### Media legacy
- URLs externas en Spot.image.url (V1.2/V1.3) y personalPhotos en pins (SavedContext)
  - Estado: no migrar como media publica automatica
  - Regla: la DB solo guarda rutas de Storage; si no hay archivo en Storage, descartar y registrar

## Decisiones de migracion (con trazabilidad canonica)

- No edicion directa de Spots; solo via SpotContribution -> applier -> SpotVersion.
  - Fuente: definitions/FLOWYA V2.0/DECISIONES_CANONICAS.md (reglas no negociables)
- SpotContribution es append-only; correcciones se modelan como nueva contribucion.
  - Fuente: definitions/FLOWYA V2.0/DECISIONES_CANONICAS.md (contribuciones inmutables)
- AsyncStorage es fuente de extraccion, no de reconciliacion.
  - Fuente: requerimiento de migracion + principio de no replicar shapes legacy
- normalizeSpotId obligatorio para cualquier ID legacy.
  - Fuente: definitions/FLOWYA V2.0/DECISIONES_CANONICAS.md
- Descartar spots sin coordenadas validas para proteger Map/Search V2.
  - Fuente: criterio de migracion (PASO D) + consistencia con modelo canonico

## Inventario de datasets (clasificacion)

| Dataset | Fuente | Clasificacion | Notas |
| --- | --- | --- | --- |
| Spots seed | data/seedSpots.v1.2.json | Migrar | source=seed, requiere spot_versions v1 |
| Spots user | AsyncStorage @flowya_spots | Migrar | source=user, validar coords |
| Pins | AsyncStorage @flowya_saved + Supabase pins | Migrar | normalizeSpotId, user_id requerido |
| Flows | AsyncStorage @flowya_flows | Migrar | normalizeSpotId en spots[] |
| FlowRuns | Si existe en cache | Migrar | solo si hay dataset real |
| Perfiles | Auth/Supabase | Transformar | user_profile minimizado, sin PII |
| UserStats | Derivado | Transformar | trust_level por contribuciones aplicadas |
| Likes/Saves/Timeline | AsyncStorage @flowya_saved | Descartar | no canonico V2.0 |
| Preferencias UI | AsyncStorage @flowya_selected_region_id | Descartar | no canonico |
| Sesion | AsyncStorage @flowya_auth_session | Descartar | no canonico |

## Registro de descartes (actualizar durante migracion)

- Seeds cargados como spots "nuevos":
  - Total: 99 (source=seed)
  - Versionado: SpotVersion v1 para todos (missing_v1 = 0)
  - Imagenes: seeds sin `image` (placeholder UI esperado)
  - Staging eliminado: seed_upload

- Spots sin coordenadas validas:
  - (pendiente de ejecucion)

- Pins sin user_id o spot_id invalido:
  - (pendiente de ejecucion)

- Media sin archivo en Storage:
  - (pendiente de ejecucion)
