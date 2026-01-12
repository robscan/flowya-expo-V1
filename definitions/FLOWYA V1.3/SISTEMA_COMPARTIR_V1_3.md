# SISTEMA DE COMPARTIR — FLOWYA V1.3

**Versión:** FLOWYA V1.3  
**Fecha:** 2026-01-11  
**Estado:** En progreso

---

## PROPÓSITO

Este documento define el sistema completo de compartir mapas entre usuarios en FLOWYA V1.3.

**Referencias:**
- Decisiones canónicas: `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md` - D-V1.3-05
- Modelo de datos: `definitions/FLOWYA V1.3/MODELO_DATOS_V1_3.md`
- Seguridad: `definitions/FLOWYA V1.3/SEGURIDAD_V1_3.md`

---

## CONCEPTO GENERAL

### Objetivo

Permitir a usuarios compartir sus mapas de pines (to_visit / visited) con otros usuarios, permitiendo:
- Ver mapas compartidos en modo lectura
- Diferenciar claramente pines propios vs compartidos
- Agregar pines compartidos a la cuenta propia

**Referencia:** `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-05

---

## MODELO DE DATOS

### Entidad: Shared Map

**Definición:**
- Vista de pines de un usuario compartida con otros usuarios
- Filtrado por estado: `to_visit`, `visited`, o `all`
- Modo lectura (no editable por usuarios compartidos)

**Atributos:**
- `id`: Identificador único
- `ownerId`: Usuario que comparte el mapa
- `stateFilter`: Filtro de estado (`to_visit` | `visited` | `all`)
- `sharedWith`: Array de IDs de usuarios con acceso
- `createdAt`: Fecha de creación
- `revokedAt`: Fecha de revocación (si aplica)

**Referencia:** `MODELO_DATOS_V1_3.md` - Parte 1

---

## FLUJOS DE USUARIO

### Flujo 1: Compartir Mapa

```
Usuario A (Owner)
  │
  ▼
Abre Map o Pinned Screen
  │
  ▼
Selecciona filtro de estado (To Visit / Visited)
  │
  ▼
Presiona botón "Share"
  │
  ▼
Modal de compartir:
  - Lista de usuarios (búsqueda)
  - Seleccionar usuarios
  - Opción: "Share To Visit" o "Share Visited"
  │
  ▼
Presiona "Share"
  │
  ▼
Mapa compartido creado en Supabase
  │
  ▼
Usuarios seleccionados reciben notificación (futuro)
```

### Flujo 2: Ver Mapa Compartido

```
Usuario B (Shared With)
  │
  ▼
Recibe notificación o ve en lista de mapas compartidos
  │
  ▼
Tap en mapa compartido
  │
  ▼
Abre vista de mapa compartido:
  - Mapa con pines del owner
  - Filtrado por estado seleccionado
  - Modo lectura (no editable)
  │
  ▼
Puede:
  - Ver detalles de spots
  - Agregar pines a su cuenta propia
  - NO puede editar pines del owner
```

### Flujo 3: Agregar Pines Compartidos

```
Usuario B en vista de mapa compartido
  │
  ▼
Ve spot interesante
  │
  ▼
Tap en spot → Spot Detail
  │
  ▼
Ve botón "Add to my map"
  │
  ▼
Presiona "Add to my map"
  │
  ▼
Modal de selección de estado:
  - "To Visit"
  - "Visited"
  │
  ▼
Selecciona estado
  │
  ▼
Pin creado en cuenta de Usuario B
  │
  ▼
Spot aparece en sección correspondiente (To Visit / Visited)
```

---

## DIFERENCIACIÓN VISUAL

### Pines Propios vs Compartidos

**En Mapa:**
- **Pines propios:** Color normal (azul para to_visit, verde para visited)
- **Pines compartidos:** Color diferente (ej: naranja) o borde diferenciado
- **Leyenda:** Explicar diferencia de colores

**En Lista/Cards:**
- **Badge/indicador:** "Shared" o icono de compartir
- **Tooltip:** "Shared by [nombre usuario]"
- **Color de fondo sutil:** Diferente para items compartidos

**En Spot Detail:**
- **Header:** Indicador "Shared by [nombre usuario]"
- **Botón Pin:** Reemplazado por "Add to my map" si no está en cuenta propia

---

## PERMISOS Y SEGURIDAD

### Permisos del Owner

- ✅ Compartir mapa con usuarios
- ✅ Revocar acceso
- ✅ Ver quién tiene acceso
- ✅ Editar sus propios pines (normal)

### Permisos de Usuarios Compartidos

- ✅ Ver mapa compartido (modo lectura)
- ✅ Ver detalles de spots
- ✅ Agregar pines a su cuenta propia
- ❌ NO puede editar pines del owner
- ❌ NO puede eliminar pines del owner
- ❌ NO puede compartir el mapa compartido (solo el owner)

### Revocación

**Flujo:**
1. Owner presiona "Revoke access" en mapa compartido
2. Selecciona usuarios a revocar (o todos)
3. Confirma revocación
4. `revokedAt` se actualiza en Supabase
5. Usuarios revocados pierden acceso inmediatamente

**Comportamiento:**
- Revocación es inmediata
- Usuarios revocados no pueden acceder al mapa
- Datos de pines agregados a cuenta propia se mantienen

**Referencia:** `SEGURIDAD_V1_3.md`

---

## IMPLEMENTACIÓN TÉCNICA

### Backend (Supabase)

#### Tabla: `shared_maps`

```sql
CREATE TABLE shared_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state_filter TEXT NOT NULL CHECK (state_filter IN ('to_visit', 'visited', 'all')),
  shared_with JSONB NOT NULL, -- Array de user IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);
```

#### Row Level Security (RLS)

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

**Referencia:** `MODELO_DATOS_V1_3.md` - Parte 2

### Frontend

#### Componente: ShareMapModal

```typescript
interface ShareMapModalProps {
  stateFilter: 'to_visit' | 'visited' | 'all';
  onShare: (userIds: string[]) => void;
  onCancel: () => void;
}
```

**Funcionalidad:**
- Búsqueda de usuarios
- Lista de usuarios seleccionables
- Confirmación de compartir

#### Componente: SharedMapView

```typescript
interface SharedMapViewProps {
  sharedMapId: string;
  onAddPin: (spotId: string, state: PinState) => void;
}
```

**Funcionalidad:**
- Muestra mapa con pines del owner
- Filtrado por estado
- Modo lectura
- Botón "Add to my map" en cada spot

---

## CASOS DE USO

### Caso 1: Compartir Lista de "To Visit"

**Escenario:**
Usuario A tiene lista de lugares que quiere visitar en París. Quiere compartirla con Usuario B que también va a París.

**Flujo:**
1. Usuario A filtra por "To Visit" en Map/Pinned
2. Presiona "Share"
3. Selecciona Usuario B
4. Usuario B recibe acceso
5. Usuario B ve mapa con pines "To Visit" de Usuario A
6. Usuario B puede agregar pines a su cuenta propia

### Caso 2: Compartir Lista de "Visited"

**Escenario:**
Usuario A visitó varios lugares y quiere compartir su experiencia con Usuario B.

**Flujo:**
1. Usuario A filtra por "Visited" en Map/Pinned
2. Presiona "Share"
3. Selecciona Usuario B
4. Usuario B ve mapa con pines "Visited" de Usuario A
5. Usuario B puede ver detalles y agregar a su lista "To Visit"

### Caso 3: Revocar Acceso

**Escenario:**
Usuario A compartió mapa con Usuario B, pero ahora quiere revocar el acceso.

**Flujo:**
1. Usuario A abre lista de mapas compartidos
2. Selecciona mapa compartido con Usuario B
3. Presiona "Revoke access"
4. Selecciona Usuario B
5. Confirma revocación
6. Usuario B pierde acceso inmediatamente

---

## NOTIFICACIONES (FUTURO)

### Notificaciones de Compartir

**Tipo 1: Nuevo mapa compartido**
- "Usuario A compartió su mapa 'To Visit' contigo"
- Acción: Ver mapa compartido

**Tipo 2: Acceso revocado**
- "Usuario A revocó el acceso a su mapa compartido"
- Acción: Ninguna (solo informativo)

**Implementación futura:**
- Push notifications
- In-app notifications
- Email notifications (opcional)

---

## LIMITACIONES Y CONSIDERACIONES

### Limitaciones Actuales

1. **Búsqueda de usuarios:** Requiere implementar sistema de búsqueda de usuarios
2. **Notificaciones:** No implementadas en V1.3 inicial
3. **Compartir masivo:** Solo compartir con usuarios seleccionados (no público)

### Consideraciones Futuras

1. **Links públicos:** Compartir con link (no requiere cuenta)
2. **Grupos:** Compartir con grupos de usuarios
3. **Permisos granulares:** Diferentes niveles de acceso

---

## TESTING

### Casos de Prueba

1. **Compartir mapa:**
   - [ ] Owner puede compartir con usuarios
   - [ ] Usuarios compartidos pueden ver mapa
   - [ ] Validación de permisos RLS

2. **Ver mapa compartido:**
   - [ ] Modo lectura funciona correctamente
   - [ ] Diferenciación visual de pines
   - [ ] Filtrado por estado funciona

3. **Agregar pines compartidos:**
   - [ ] Usuario puede agregar pines a su cuenta
   - [ ] Manejo de conflictos (pin ya existe)
   - [ ] Pines agregados aparecen en secciones correctas

4. **Revocación:**
   - [ ] Owner puede revocar acceso
   - [ ] Usuarios revocados pierden acceso inmediatamente
   - [ ] Pines agregados se mantienen

---

**Última actualización:** 2026-01-11  
**Estado:** Sistema de compartir definido
