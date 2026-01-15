# Runbook de migracion (paso a paso, nivel no experto)

Este documento es un checklist operativo para ejecutar la migracion V2.0 sin improvisar.
No ejecuta nada automaticamente y no requiere modificar el codigo de la app.

## 0) Conceptos basicos (muy corto)

- Supabase = Postgres + Auth + Storage.
- Todo lo que sigue se hace manualmente en SQL Editor o consola.
- La migracion usa tablas "staging" (temporales) para cargar datos legacy.
- Luego se insertan datos limpios en el esquema V2.0.
- Todo se identifica con un `migration_batch_id` para poder revertir.

## 1) Preparacion

1.1 Define un identificador de corrida (obligatorio)
- Ejemplo: `FLOWYA_V2_0_20260114`
- Este valor se usa en TODOS los scripts (schema/migrate/rollback/validate).

1.2 Crea un respaldo (recomendado)
- Exporta las tablas actuales si existen datos previos.
- Exporta buckets de Storage si ya hay media cargada.

## 2) Crear esquema canonico V2.0 (click por click)

2.1 Abre el panel de Supabase
- Entra a tu proyecto en Supabase.
- Ve a la barra lateral y abre **SQL Editor**.

2.2 Ejecuta `schema.sql`
- Haz clic en **New query** (o **+ New**).
- Abre el archivo `migrations/FLOWYA_V2_0/schema.sql` en tu editor local.
- Copia TODO el contenido.
- Pega en el SQL Editor.
- Haz clic en **Run**.
- Espera el mensaje de exito (o revisa el panel de errores si falla).

Resultado esperado:
- Tablas canonicas creadas.
- RLS habilitado.
- UPDATE directo a `spots` bloqueado para clientes.

## 3) Configurar Storage (click por click)

3.1 Crear buckets via SQL Editor
- En Supabase, abre **SQL Editor**.
- **New query**.
- Abre `migrations/FLOWYA_V2_0/storage.md` y copia el bloque SQL.
- Pega y presiona **Run**.

3.2 (Opcional) Verificar buckets
- Ve a **Storage** en la barra lateral.
- Debes ver: `flowya-public-spots` y `flowya-private-pins`.

## 4) Crear tablas staging (legacy_*)

Estas tablas solo sirven para cargar datos legacy (exportados desde JSON/AsyncStorage).
Se pueden borrar despues de la migracion.

Ejecuta este bloque:

```sql
create table if not exists legacy_seed_spots (
  legacy_id text,
  name text,
  type text,
  lat double precision,
  lng double precision,
  city text,
  country text,
  short_description text,
  has_generated_content boolean,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  raw_payload jsonb
);

create table if not exists legacy_user_spots (
  legacy_id text,
  name text,
  type text,
  lat double precision,
  lng double precision,
  city text,
  country text,
  short_description text,
  has_generated_content boolean,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  raw_payload jsonb
);

create table if not exists legacy_pins (
  user_id uuid,
  spot_id text,
  state text,
  pinned_at timestamptz,
  visited_at timestamptz,
  notes text,
  personal_photos text[],
  source text,
  updated_at timestamptz,
  raw_payload jsonb
);

create table if not exists legacy_flows (
  id text,
  title text,
  description text,
  estimated_duration int,
  movement_mode text,
  spots text[],
  metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  raw_payload jsonb
);

create table if not exists legacy_flow_runs (
  id uuid,
  flow_id text,
  user_id uuid,
  status text,
  current_spot_index int,
  current_narration_block text,
  started_at timestamptz,
  paused_at timestamptz,
  is_minimized boolean,
  created_at timestamptz,
  updated_at timestamptz,
  raw_payload jsonb
);

create table if not exists legacy_profiles (
  user_id uuid,
  display_name text,
  avatar_path text,
  bio text,
  raw_payload jsonb
);
```

## 5) Cargar datos legacy en staging

Si te pierdes en este punto, usa el script `migrations/FLOWYA_V2_0/load_legacy.sql`.
Te permite pegar JSON arrays directo en SQL Editor y cargar en `legacy_*`.

Si NO quieres legacy y deseas cargar seeds como spots "nuevos":
- Usa `migrations/FLOWYA_V2_0/load_seeds_direct.sql`.
- Este script valida campos requeridos y crea spots + contribuciones + versiones.

5.1 Seeds (JSON)
- Fuente: `data/seedSpots.v1.2.json`
- Convierte cada item en una fila de `legacy_seed_spots`.
- Conserva el objeto original en `raw_payload`.

5.2 AsyncStorage
- Extrae los keys indicados en `audit.md`:
  - `@flowya_spots` -> `legacy_user_spots`
  - `@flowya_flows` -> `legacy_flows`
  - `@flowya_saved` -> `legacy_pins`
- Importante:
  - Normaliza fechas a ISO antes de cargar.
  - Si no hay `user_id`, el pin se descartara (esto es canonico).

5.3 Supabase pins existentes (si aplica)
- Si ya hay tabla `pins` con datos, exportalos a `legacy_pins` con source = 'supabase'.

5.4 Ejemplos de carga (CSV / JSONL)

Opcion A: Importar CSV desde Table Editor
- En Supabase, ve a **Table Editor**.
- Haz clic en la tabla `legacy_seed_spots` (o la que corresponda).
- Busca el boton **Import data** o **Upload CSV**.
- Selecciona tu archivo CSV y confirma el mapeo de columnas.

Ejemplo CSV (legacy_seed_spots):
```
legacy_id,name,type,lat,lng,city,country,short_description,has_generated_content,created_at,updated_at,created_by,raw_payload
spot-1,Playa Central,beach,9.935,-84.091,San Jose,CR,"Playa tranquila",false,2023-01-01T00:00:00Z,2023-01-01T00:00:00Z,,{"id":"spot-1","name":"Playa Central"}
```

Ejemplo CSV (legacy_pins):
```
user_id,spot_id,state,pinned_at,visited_at,notes,personal_photos,source,updated_at,raw_payload
00000000-0000-0000-0000-000000000001,spot-1,to_visit,2024-01-01T00:00:00Z,,,"{""flowya-private-pins/pins/000.../spot-1/abc.jpg""}",async,2024-01-01T00:00:00Z,{"spotId":"spot-1","state":"to_visit"}
```

Opcion B: Importar JSONL (linea por linea)
- Prepara un archivo `.jsonl` donde cada linea es un objeto.
- Abre **SQL Editor** y usa INSERT con `jsonb_populate_record`.

Ejemplo JSONL (legacy_seed_spots.jsonl):
```
{"legacy_id":"spot-1","name":"Playa Central","type":"beach","lat":9.935,"lng":-84.091,"city":"San Jose","country":"CR","short_description":"Playa tranquila","has_generated_content":false,"created_at":"2023-01-01T00:00:00Z","updated_at":"2023-01-01T00:00:00Z","created_by":null,"raw_payload":{"id":"spot-1","name":"Playa Central"}}
{"legacy_id":"spot-2","name":"Mirador Norte","type":"viewpoint","lat":9.94,"lng":-84.09,"city":"San Jose","country":"CR","short_description":"Vista abierta","has_generated_content":false,"created_at":"2023-01-02T00:00:00Z","updated_at":"2023-01-02T00:00:00Z","created_by":null,"raw_payload":{"id":"spot-2","name":"Mirador Norte"}}
```

Ejemplo SQL para insertar 1 fila JSON (manual):
```sql
insert into legacy_seed_spots (
  legacy_id, name, type, lat, lng, city, country, short_description,
  has_generated_content, created_at, updated_at, created_by, raw_payload
)
values (
  'spot-1',
  'Playa Central',
  'beach',
  9.935,
  -84.091,
  'San Jose',
  'CR',
  'Playa tranquila',
  false,
  '2023-01-01T00:00:00Z',
  '2023-01-01T00:00:00Z',
  null,
  '{"id":"spot-1","name":"Playa Central"}'::jsonb
);
```

5.5 Script directo para SQL Editor (recomendado)
- Abre `migrations/FLOWYA_V2_0/load_legacy.sql`
- Reemplaza cada bloque `[]` por tu JSON array
- Pega el contenido completo en SQL Editor y presiona **Run**

5.6 Alternativa sin legacy (seeds directos)
- Abre `migrations/FLOWYA_V2_0/load_seeds_direct.sql`
- Reemplaza el JSON array en `payload.data` con `data/seedSpots.v1.2.json`
- Ejecuta el script en SQL Editor
- Verifica el resultado del bloque de validacion (conteos de faltantes)

5.7 Importante sobre imagenes de seeds (V2.0)
- Los seeds actuales tienen URLs de Unsplash (stock), no placeholders.
- Si quieres eliminar `image` antes de pegarlo:
  - Ejecuta: `node scripts/strip-seed-images.js`
  - Usa el archivo generado: `data/seedSpots.v1.2.noimage.json`
  - Pega ese JSON en `load_seeds_direct.sql`

## 6) Ejecutar migraciones (orden)

6.1 Migrar spots
- En SQL Editor: **New query**
- Abre `migrate_spots.sql`, reemplaza `FLOWYA_V2_0_YYYYMMDD` por tu `migration_batch_id`
- Pega y presiona **Run**
- Resultado:
  - Inserta `spots`
  - Crea `spot_contributions` tipo create
  - Genera `spot_versions` v1
  - Descarta spots sin coordenadas validas (se registran en `migration_audit`)

6.2 Migrar pins
- **New query** en SQL Editor
- Reemplaza `FLOWYA_V2_0_YYYYMMDD`
- **Run**
- Resultado:
  - Inserta/Upsert en `pins`
  - Descarta pins sin `user_id` o `spot_id` valido
  - Filtra `personal_photos` para que solo queden paths dentro de Storage

6.3 Migrar flows y flow_runs
- **New query** en SQL Editor
- Reemplaza `FLOWYA_V2_0_YYYYMMDD`
- **Run**
- Resultado:
  - Inserta `flows` normalizando spot IDs
  - Inserta `flow_runs` si existe dataset real

6.4 Migrar perfiles y stats
- **New query** en SQL Editor
- Reemplaza `FLOWYA_V2_0_YYYYMMDD`
- **Run**
- Resultado:
  - Inserta `user_profile` solo si el usuario existe en Auth
  - Calcula `user_stats` (trust_level) desde contribuciones aplicadas

## 7) Validaciones post-migracion

7.1 Ejecuta `validate.sql`
- En SQL Editor: **New query**
- Reemplaza `FLOWYA_V2_0_YYYYMMDD`
- **Run**
- Revisa los resultados de cada query
- Checks principales:
  - Conteo de spots seed vs `spots` source=seed
  - Cada spot tiene SpotVersion v1
  - Pins huerfanos (spot inexistente)
  - Media sin spot
  - Flows con spots invalidos
  - RLS con UPDATE bloqueado en spots
  - No hay UPDATEs directos a spots post-migracion

7.2 Si hay problemas
- Corrige en staging y vuelve a ejecutar migraciones
- Recuerda que los inserts usan `migration_batch_id`

## 8) Rollback (si algo sale mal)

8.1 Ejecuta `rollback.sql` usando el mismo `migration_batch_id`
- En SQL Editor: **New query**
- Reemplaza `FLOWYA_V2_0_YYYYMMDD`
- **Run**
- Borra todo lo insertado por la corrida.
- Nota: pins y user_stats pueden haber sobreescrito valores previos si hubo UPSERT.

## 9) Limpieza opcional

9.1 Elimina tablas staging
- Puedes borrar `legacy_*` y `migration_audit` si ya no se necesitan.

## 10) Registro y trazabilidad

- Actualiza `audit.md` con descartes reales:
  - spots sin coordenadas
  - pins sin usuario/spot valido
  - media sin archivo en Storage
- Mantener este documento como evidencia de decisiones canonicas.
