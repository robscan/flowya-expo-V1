# Instrucciones para Ejecutar Migración SQL en Supabase

## Paso 1: Acceder al SQL Editor de Supabase

1. Abre tu navegador y ve al [Dashboard de Supabase](https://supabase.com/dashboard)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto FLOWYA
4. En el menú lateral izquierdo, haz clic en **SQL Editor** (icono de terminal/código)

## Paso 2: Ejecutar la Migración

1. En el SQL Editor, haz clic en el botón **New query** (o usa el área de texto principal)
2. Copia TODO el contenido del archivo `supabase/migrations/001_create_pins_table.sql`
3. Pega el contenido en el SQL Editor
4. Haz clic en el botón **Run** (o presiona `Ctrl+Enter` / `Cmd+Enter`)

## Paso 3: Verificar que la Migración fue Exitosa

Deberías ver un mensaje de éxito. Para verificar que la tabla se creó correctamente:

1. En el menú lateral, ve a **Table Editor**
2. Deberías ver la tabla `pins` en la lista de tablas
3. Haz clic en `pins` para ver su estructura:
   - `id` (UUID, Primary Key)
   - `spot_id` (TEXT)
   - `user_id` (UUID, Foreign Key a auth.users)
   - `state` (TEXT, CHECK: 'to_visit' o 'visited')
   - `pinned_at` (TIMESTAMPTZ)
   - `visited_at` (TIMESTAMPTZ, nullable)
   - `notes` (TEXT, nullable)
   - `personal_photos` (JSONB)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

## Paso 4: Verificar RLS (Row Level Security)

1. En **Table Editor**, haz clic en `pins`
2. Ve a la pestaña **Policies**
3. Deberías ver 4 políticas:
   - "Users can view own pins" (SELECT)
   - "Users can create own pins" (INSERT)
   - "Users can update own pins" (UPDATE)
   - "Users can delete own pins" (DELETE)

## Paso 5: Verificar Triggers

1. En **Table Editor**, haz clic en `pins`
2. Ve a la pestaña **Triggers**
3. Deberías ver 2 triggers:
   - `update_pins_updated_at` (BEFORE UPDATE)
   - `trigger_update_visited_at` (BEFORE UPDATE)

## Solución de Problemas

### Error: "relation 'pins' already exists"
- La tabla ya existe. Puedes eliminarla primero con:
```sql
DROP TABLE IF EXISTS pins CASCADE;
```
- Luego ejecuta la migración nuevamente

### Error: "permission denied"
- Asegúrate de estar usando el usuario correcto con permisos de administrador
- Verifica que estás en el proyecto correcto

### Error: "syntax error"
- Verifica que copiaste TODO el contenido del archivo SQL
- Asegúrate de que no haya caracteres adicionales o faltantes

## Nota Importante

Después de ejecutar la migración:
- ✅ La tabla `pins` estará disponible
- ✅ Los errores 404 al intentar upsert deberían desaparecer
- ✅ Los pins se persistirán correctamente en Supabase
- ✅ RLS protegerá los datos de cada usuario

## Verificación Post-Migración

1. Vuelve a la app (`http://localhost/`)
2. Intenta agregar un pin a un spot
3. Verifica en la consola que NO aparezca el error 404
4. Verifica en Supabase Table Editor que el pin se creó correctamente
