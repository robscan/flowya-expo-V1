**Pendiente de revisión en V1.4**

---

# MODELO DE DATOS — FLOWYA V1.4

**Versión:** FLOWYA V1.3  
**Fecha:** 2026-01-11  
**Estado:** En progreso

---

## PROPÓSITO

Este documento define el modelo de datos de FLOWYA V1.3, separando explícitamente:
1. **Modelo Conceptual**: Entidades, relaciones y conceptos (independiente de implementación)
2. **Implementación Supabase**: Tablas, esquemas SQL y estructura de base de datos

**Referencias:**
- Modelo conceptual canónico: `definitions/FLOWYA V1.2/DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`
- Decisiones canónicas: `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md`

---

## PARTE 1: MODELO CONCEPTUAL

### Principios Fundamentales (Heredados de V1.2)

1. **Spot es Público**: Entidad pública, compartida por todos los usuarios
2. **Pin es Personal**: Relación personal usuario-spot, vive en espacio personal
3. **Estados Claros**: To visit y Visited son estados del Pin, no del Spot
4. **Diario Extiende Visited**: Notas y fotos personales solo para Pins con estado `visited`

### Entidades Principales

#### 1. Spot (World Content)

**Definición:**
- Lugar físico público, compartido por todos los usuarios
- Se crea con "Add Spot" (solo desde Mapa o Search)
- Independiente de relaciones personales

**Atributos Conceptuales:**
- `id`: Identificador único
- `name`: Nombre del lugar
- `type`: Tipo de lugar (enum)
- `location`: Ubicación geográfica (lat, lng, city, country)
- `shortDescription`: Descripción breve (opcional)
- `image`: Imagen principal (url, source, license)
- `hasGeneratedContent`: Flag de contenido generado por IA

**Relaciones:**
- Un Spot puede tener múltiples Pins (uno por usuario)
- Un Spot puede aparecer en múltiples Flows

**Referencia V1.2:** `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

#### 2. Pin (Relación Personal)

**Definición:**
- Relación personal entre usuario y un Spot existente
- Se crea con "Pin" (acción explícita del usuario)
- Tiene estados: `to_visit` | `visited`

**Atributos Conceptuales:**
- `spotId`: Referencia al Spot
- `userId`: Usuario que creó el Pin
- `state`: Estado del Pin (`to_visit` | `visited`)
- `pinnedAt`: Fecha/hora de creación del Pin
- `visitedAt`: Fecha/hora de primera visita (si `state === 'visited'`)
- `notes`: Notas personales opcionales (diario de viaje)
- `personalPhotos`: Array de URLs de fotos personales opcionales

**Relaciones:**
- Un Pin pertenece a un Usuario
- Un Pin referencia un Spot
- Un Usuario puede tener múltiples Pins
- Un Spot puede tener múltiples Pins (uno por usuario)

**Referencia V1.2:** `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

#### 3. Usuario

**Definición:**
- Usuario autenticado del sistema
- Identificado por Supabase Auth

**Atributos Conceptuales:**
- `id`: Identificador único (UUID de Supabase)
- `email`: Email del usuario
- `createdAt`: Fecha de creación de cuenta

**Relaciones:**
- Un Usuario puede tener múltiples Pins
- Un Usuario puede compartir múltiples Mapas

#### 4. Mapa Compartido

**Definición:**
- Vista de pines de un usuario compartida con otros usuarios
- Modo lectura (no editable)

**Atributos Conceptuales:**
- `id`: Identificador único
- `ownerId`: Usuario que comparte el mapa
- `sharedWith`: Array de IDs de usuarios con acceso
- `stateFilter`: Filtro de estado (`to_visit` | `visited` | `all`)
- `createdAt`: Fecha de creación del compartido
- `revokedAt`: Fecha de revocación (si aplica)

**Relaciones:**
- Un Mapa Compartido pertenece a un Usuario (owner)
- Un Mapa Compartido puede ser visto por múltiples Usuarios

**Referencia V1.3:** `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-05

### Reglas de Negocio (Heredadas de V1.2)

1. **Un usuario solo puede tener un Pin por Spot**
   - Si intenta crear otro, se actualiza el existente

2. **visitedAt preserva fecha de primera visita**
   - Si se cambia de `visited` → `to_visit` → `visited`, mantiene fecha original

3. **Diario solo disponible si Pin tiene estado `visited`**
   - Notas y fotos solo se pueden agregar/editar si `state === 'visited'`

4. **Nearby Places siempre visible**
   - No filtra por estado de Pin
   - Es sección contextual, no editorial

**Referencia V1.2:** `BITACORA_V1_2.md` - Ajuste 07

---

## PARTE 2: IMPLEMENTACIÓN SUPABASE

### Esquema de Base de Datos

#### Tabla: `spots`

```sql
CREATE TABLE spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- enum: 'restaurant', 'museum', 'park', etc.
  location JSONB NOT NULL, -- { lat: number, lng: number, city?: string, country?: string }
  short_description TEXT,
  image JSONB NOT NULL, -- { url: string, source?: string, license?: string }
  has_generated_content BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_spots_location ON spots USING GIN (location);
CREATE INDEX idx_spots_type ON spots (type);
CREATE INDEX idx_spots_created_at ON spots (created_at DESC);
```

**Notas:**
- `location` como JSONB permite queries geográficas eficientes
- `image` como JSONB permite metadata flexible
- `created_by` referencia auth.users (Supabase Auth)

#### Tabla: `pins`

```sql
CREATE TABLE pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL CHECK (state IN ('to_visit', 'visited')),
  pinned_at TIMESTAMPTZ DEFAULT NOW(),
  visited_at TIMESTAMPTZ,
  notes TEXT,
  personal_photos JSONB, -- Array de URLs: ["url1", "url2", ...]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(spot_id, user_id) -- Un Pin por usuario por Spot
);

-- Índices
CREATE INDEX idx_pins_user_id ON pins (user_id);
CREATE INDEX idx_pins_spot_id ON pins (spot_id);
CREATE INDEX idx_pins_state ON pins (state);
CREATE INDEX idx_pins_pinned_at ON pins (pinned_at DESC);
CREATE INDEX idx_pins_visited_at ON pins (visited_at DESC);
```

**Notas:**
- `UNIQUE(spot_id, user_id)` garantiza un Pin por usuario por Spot
- `personal_photos` como JSONB array de strings
- `visited_at` solo se establece cuando `state === 'visited'`

#### Tabla: `shared_maps`

```sql
CREATE TABLE shared_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state_filter TEXT NOT NULL CHECK (state_filter IN ('to_visit', 'visited', 'all')),
  shared_with JSONB NOT NULL, -- Array de user IDs: ["uuid1", "uuid2", ...]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(owner_id, state_filter) -- Un mapa compartido por estado por usuario
);

-- Índices
CREATE INDEX idx_shared_maps_owner_id ON shared_maps (owner_id);
CREATE INDEX idx_shared_maps_shared_with ON shared_maps USING GIN (shared_with);
```

**Notas:**
- `shared_with` como JSONB array de UUIDs
- `revoked_at` permite revocación sin eliminar registro

### Row Level Security (RLS)

#### Política: `pins`

```sql
-- Usuarios solo pueden ver sus propios pins
CREATE POLICY "Users can view own pins"
  ON pins FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios solo pueden crear sus propios pins
CREATE POLICY "Users can create own pins"
  ON pins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios solo pueden actualizar sus propios pins
CREATE POLICY "Users can update own pins"
  ON pins FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuarios solo pueden eliminar sus propios pins
CREATE POLICY "Users can delete own pins"
  ON pins FOR DELETE
  USING (auth.uid() = user_id);
```

#### Política: `shared_maps`

```sql
-- Usuarios pueden ver mapas compartidos con ellos
CREATE POLICY "Users can view shared maps"
  ON shared_maps FOR SELECT
  USING (
    auth.uid() = owner_id OR
    auth.uid() = ANY(SELECT jsonb_array_elements_text(shared_with)::uuid)
  );

-- Solo el owner puede crear/actualizar/eliminar
CREATE POLICY "Owners can manage shared maps"
  ON shared_maps FOR ALL
  USING (auth.uid() = owner_id);
```

### Funciones y Triggers

#### Trigger: `update_visited_at`

```sql
CREATE OR REPLACE FUNCTION update_visited_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo establecer visited_at si cambia a 'visited' y no existe
  IF NEW.state = 'visited' AND OLD.state != 'visited' AND NEW.visited_at IS NULL THEN
    NEW.visited_at := NOW();
  END IF;
  -- Preservar visited_at si ya existe (regla de primera visita)
  IF NEW.state = 'visited' AND OLD.visited_at IS NOT NULL THEN
    NEW.visited_at := OLD.visited_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_visited_at
  BEFORE UPDATE ON pins
  FOR EACH ROW
  WHEN (NEW.state = 'visited')
  EXECUTE FUNCTION update_visited_at();
```

**Nota:** Implementa regla de negocio de preservar fecha de primera visita.

---

## PARTE 3: MIGRACIÓN DESDE V1.2 (AsyncStorage)

### Datos a Migrar

1. **Pins** (desde `@flowya_saved` → `pins` table)
2. **Estados** (to_visit / visited)
3. **Diario** (notes, personalPhotos)

### Estrategia de Migración

1. **Detección de migración:**
   - Verificar si existe flag `_migrationV1_3Completed` en AsyncStorage
   - Si no existe, ejecutar migración

2. **Proceso de migración:**
   ```typescript
   // Pseudocódigo
   const localPins = await AsyncStorage.getItem('@flowya_saved');
   const parsed = JSON.parse(localPins);
   
   for (const [spotId, pinData] of Object.entries(parsed.pins)) {
     await supabase.from('pins').upsert({
       spot_id: spotId,
       user_id: currentUser.id,
       state: pinData.state,
       pinned_at: pinData.pinnedAt,
       visited_at: pinData.visitedAt,
       notes: pinData.notes,
       personal_photos: pinData.personalPhotos || []
     });
   }
   
   // Marcar migración completada
   await AsyncStorage.setItem('_migrationV1_3Completed', 'true');
   ```

3. **Validación:**
   - Verificar que todos los pins se migraron correctamente
   - Mantener datos locales como backup temporal

### Cache Local (Offline-First)

**Estrategia:**
- Mantener cache local en AsyncStorage para lectura rápida
- Sincronizar con Supabase en background
- Queue de operaciones pendientes para sync cuando hay conexión

**Estructura de cache:**
```typescript
interface LocalCache {
  pins: Record<string, PinData>;
  lastSyncAt: Date;
  pendingOperations: PendingOperation[];
}
```

**Referencia V1.3:** `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-02

---

## PARTE 4: RELACIONES Y CONSTRAINTS

### Diagrama de Relaciones

```
users (auth.users)
  ├── pins (1:N)
  │     └── spots (N:1)
  └── shared_maps (1:N)

spots
  ├── pins (1:N)
  └── flows (N:M, futura)
```

### Constraints Importantes

1. **Un Pin por Usuario por Spot**: `UNIQUE(spot_id, user_id)`
2. **Estado válido**: `CHECK (state IN ('to_visit', 'visited'))`
3. **visited_at solo si visited**: Validación en aplicación (no constraint DB)

---

## PRÓXIMOS PASOS

1. Validar esquema con equipo
2. Crear migraciones SQL
3. Implementar funciones de migración desde AsyncStorage
4. Testing de migración con datos reales

---

**Última actualización:** 2026-01-11  
**Estado:** Modelo conceptual y esquema Supabase definidos
