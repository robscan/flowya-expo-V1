# Proyecto de migracion FLOWYA V2.0 a Supabase

Este directorio define una migracion completa, segura y reversible hacia el modelo canonico V2.0.
No ejecuta cambios automaticamente y no modifica el codigo de la app.

Fuentes canonicas obligatorias:
- /Users/apple-1/mini-tours-expo/definitions/FLOWYA V2.0/DEFINICIONES_CONSOLIDADAS_V2_0.md
- /Users/apple-1/mini-tours-expo/definitions/FLOWYA V2.0/DECISIONES_CANONICAS.md
- /Users/apple-1/mini-tours-expo/definitions/FLOWYA V2.0/MODELO_DATOS.md

Reglas de alcance:
- AsyncStorage es fuente de extraccion, no de reconciliacion (no replica shapes legacy).
- Migraciones existentes y codigo actual solo se usan para auditoria.
- No se redefine el modelo V2.0.
- No se ejecutan migraciones automaticamente.

Contenido:
- audit.md: inventario de datos, clasificacion y decisiones de descarte/transformacion.
- schema.sql: esquema canonico V2.0, helpers y RLS de alto nivel.
- storage.md: buckets y politicas de Supabase Storage.
- runbook.md: checklist operativo paso a paso (no experto).
- migrate_spots.sql: migracion de spots + spot_versions v1.
- migrate_pins.sql: migracion de pins (normalizeSpotId obligatorio).
- migrate_flows.sql: migracion de flows y flow_runs si existen.
- migrate_profiles.sql: perfiles minimizados y user_stats derivados.
- rollback.sql: estrategia de reversa por batch.
- validate.sql: checks post-migracion, incluyendo bloqueo de UPDATE a spots.

Ejecucion sugerida (manual):
1) Cargar fuentes legacy a tablas staging (ver audit.md).
2) Ejecutar schema.sql (crea tablas y RLS).
3) Ejecutar storage.md (configuracion de buckets).
4) Ejecutar migrate_*.sql en el orden: spots -> pins -> flows -> profiles.
5) Ejecutar validate.sql.
6) Si falla algo, aplicar rollback.sql con el mismo migration_batch_id.

Nota sobre idempotencia:
- Todos los inserts usan on conflict do nothing o filtros por migration_batch_id.
- Es obligatorio definir un migration_batch_id estable por corrida.
