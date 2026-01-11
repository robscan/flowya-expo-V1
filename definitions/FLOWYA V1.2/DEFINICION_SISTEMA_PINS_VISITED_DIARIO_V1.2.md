---
name: Definición Sistema Pins Visited Diario
overview: Análisis documental y propuesta conceptual validada para definir el sistema de Pins, Estados de Visita (To visit / Visited) y Diario de Viaje en FLOWYA, diferenciando claramente entre Add Spot (crear lugar público) y Pin (relación personal usuario-spot).
todos:
  - id: documentar-modelo-final
    content: Documentar modelo final validado en FUENTE_UNICA_VERDAD_V2.0.md
    status: pending
  - id: actualizar-bitacora
    content: Actualizar BITACORA_V1_1.md con análisis documental, decisiones validadas y modelo final
    status: pending
  - id: crear-plan-implementacion
    content: Crear plan de implementación detallado con migración de datos, cambios en SavedContext, y actualización de UI
    status: pending
  - id: script-migracion
    content: "Crear script de migración: savedSpots → pins, eliminar likedSpots"
    status: pending
---

# Definición del Sistema de Pins, Visited y Diario de Viaje en FLOWYA

**Versión:** Validada por Product Owner (Oscar)

**Fecha:** 2026-01-11

**Estado:** Modelo final validado, listo para implementación

---

## Análisis Documental (Fuentes de Verdad)

### Documentos Analizados

1. **BITACORA_V1_1.md** - Decisiones previas y cambios acordados
2. **FLOWYA Product Definition V2.0.md** - Definición de producto canónica
3. **FUENTE_UNICA_VERDAD_V2.0.md** - Arquitectura canónica establecida
4. **DECISIONES_TECNICAS.md** - Decisiones de naming y arquitectura
5. **FLOWYA — BACKLOG V1.1.md** - Prioridades y scope actual
6. **contexts/SavedContext.tsx** - Implementación actual del sistema de afinidad
7. **data/spots.ts** - Modelo de datos de Spot
8. **components/ui/SavedFilterHeader.tsx** - Selector actual de filtros (Spots/Flows/All)

### Hallazgos Clave

#### Estado Actual del Sistema

**Spot (Entidad Pública):**

- Entidad pública, independiente del usuario, compartida por todos
- Se crea con "Add Spot" (`createSpot` en SpotContext)
- Vive en `@flowya_spots` (AsyncStorage)
- No tiene relación directa con usuario (excepto `createdBy` opcional)

**SavedContext (Sistema de Afinidad Actual):**

- `savedSpots: string[]` - Spots guardados (bookmark/save)
- `likedSpots: string[]` - Spots con like (afinidad positiva) → **SE ELIMINA**
- `notMyVibeSpots: string[]` - Spots marcados como "not my vibe" (se mantiene)
- `savedFlows: string[]` - Flows guardados
- `timeline: TimelineEntry[]` - Historial ligero (se elimina del alcance)
- **NO EXISTE** concepto de "visited" o "to visit" actualmente

**SavedFilterHeader (Selector Actual):**

- Filtros actuales: "Spots" | "Flows" | "All"
- Ubicación: Header de Saved Screen
- **CONFLICTO IDENTIFICADO:** Selector existente filtra por tipo (Spots/Flows), no por estado de Pin

---

## Modelo Conceptual Final (Validado)

### Principios Fundamentales

1. **Spot es Público**: Spot es entidad pública, independiente del usuario
2. **Pin es Personal**: Pin es relación usuario-spot, vive en espacio personal
3. **Add Spot ≠ Add Pin**: Crear lugar público vs. marcar lugar personal
4. **Pin reemplaza Like**: Si está Pin, entonces le gusta (no necesita Like separado)
5. **Estados Claros**: To visit y Visited son estados del Pin, no del Spot

### Definiciones Canónicas

#### 1. Spot (Entidad Pública)

**Definición:**

- Lugar físico público, compartido por todos los usuarios
- Se crea con "Add Spot" (acción explícita de creación)
- Vive en base de datos pública (`@flowya_spots`)
- Independiente de relaciones personales

**Dónde se crea:**

- Desde Mapa (long press o botón "Add Spot")
- Desde Search (botón "+" o crear si no existe)
- **NO se crea desde Cards ni Flow Detail** (solo marcar Pin)

#### 2. Pin (Relación Personal Usuario ↔ Spot)

**Definición:**

- Relación personal entre usuario y un Spot existente
- Se crea con "Pin" (acción explícita del usuario)
- Vive en espacio personal del usuario (`@flowya_saved`)
- Tiene estados: `to_visit` | `visited`
- **Reemplaza "Save" y "Like"**: Si está Pin, entonces le gusta

**Dónde se crea:**

- Desde Card de Spot (SpotMediaCard, SpotInlineCard)
- Desde Detalle de Spot (SpotDetail)
- Desde Flow (Flow Detail, Flow Screen)
- **NO se crea desde Mapa o Search** (solo crear Spot)

**Modelo de datos:**

```typescript
interface Pin {
  spotId: string;           // Referencia al Spot
  userId: string;           // Usuario que creó el Pin
  state: 'to_visit' | 'visited';
  pinnedAt: Date;           // Cuándo se creó el Pin
  visitedAt?: Date;         // Cuándo se visitó (si state === 'visited')
  notes?: string;           // Notas personales opcionales (diario de viaje)
  personalPhotos?: string[]; // Fotos personales opcionales (diario de viaje)
}
```

**Flujo de creación (NUEVO):**

1. Usuario presiona botón "Pin" (icono pin diferenciado)
2. Aparece modal/dropdown con dos opciones:

   - "To Visit" → Crea Pin con estado `to_visit`
   - "Visited" → Crea Pin con estado `visited`

3. Pin se crea con el estado seleccionado
4. Pin aparece en "Pinned" (anteriormente "Saved")
5. Pin aparece en mapa personal con indicador correspondiente

#### 3. Estados del Pin

**To Visit (`to_visit`):**

- Estado inicial cuando usuario selecciona "To Visit" al crear Pin
- Significa: "Quiero visitar este lugar"
- Aparece en mapa personal con marker "pin to visit"
- Aparece en "Pinned" filtrado por "To Visit"

**Visited (`visited`):**

- Estado cuando usuario selecciona "Visited" al crear Pin o cambia estado
- Significa: "Ya visité este lugar"
- Aparece en mapa personal con marker "pin visited"
- Aparece en "Pinned" filtrado por "Visited"
- Puede tener fecha de visita (`visitedAt`)
- Puede tener notas personales y fotos personales (diario de viaje)

**Escalabilidad:**

- Modelo mantiene solo dos estados por ahora (`to_visit`, `visited`)
- Estructura de datos permite agregar estados futuros sin refactor masivo
- Estados adicionales (ej: `favorite`, `revisit`) pueden agregarse en V2.x si se requiere

#### 4. Edición de Estado

**Acción universal: Cambiar estado Pin**

- Disponible desde: Card de Spot, Spot Detail, Map Marker, Flow
- Cambia entre: `to_visit` ↔ `visited`
- Sin formulario: Acción directa (botón o toggle)
- Actualiza inmediatamente: Estado, marker en mapa, visualización en Pinned

**Implementación:**

- Botón "Mark as visited" (si está `to_visit`)
- Botón "Mark as to visit" (si está `visited`)
- O toggle simple que intercambia estados

### Diario de Viaje (Notas y Fotos Personales)

#### Definición y Estructura

**Nivel de detalle:** General, memorias generales (según benchmark de apps de viaje)

**Estructura propuesta (benchmark):**

- Notas de texto: Memoria general del lugar, experiencias, impresiones
- Fotos personales: Momentos capturados por el usuario en ese lugar
- Fecha automática: `visitedAt` se registra automáticamente al cambiar a `visited`
- Sin estructura rígida: Usuario escribe lo que quiera, sin campos obligatorios

**Características:**

- **No obligatorio**: Usuario puede tener Pin visited sin notas ni fotos
- **No bloqueante**: No se muestra formulario automático, solo botón opcional
- **Sin límite de caracteres**: Notas pueden ser tan largas como el usuario quiera
- **Botón "Add Notes"**: Visible en Spot Detail si hay Pin visited, permite agregar notas
- **Botón "Add Photos"**: Visible en Spot Detail si hay Pin visited, permite agregar fotos personales

**Modelo de datos extendido:**

```typescript
interface Pin {
  spotId: string;
  userId: string;
  state: 'to_visit' | 'visited';
  pinnedAt: Date;
  visitedAt?: Date;
  notes?: string;           // Texto libre, sin límite de caracteres
  personalPhotos?: string[]; // URLs o paths de fotos personales (almacenamiento local o cloud)
}
```

**Flujo de agregar notas/fotos:**

1. Usuario tiene Pin con estado `visited`
2. Usuario abre Spot Detail
3. Ve botón "Add Notes" (si no hay notas) o "Edit Notes" (si hay notas)
4. Ve botón "Add Photos" (siempre visible si estado es `visited`)
5. Al presionar, abre editor simple (no modal bloqueante)
6. Guarda notas/fotos inmediatamente
7. Notas/fotos se muestran en Spot Detail (vista personal)

#### Exportar y Compartir Diario

**Funcionalidad (Posible Feature Premium):**

- Exportar: Notas y fotos personales en formato JSON, PDF, o formato estándar de diario
- Compartir: Compartir entrada de diario (notas + fotos) con otros usuarios o fuera de app
- Premium: Identificar como feature monetizable (freemium o suscripción)

**Flujo de exportar/compartir:**

1. Usuario tiene Pin visited con notas/fotos
2. Usuario abre Spot Detail
3. Ve botón "Export" o "Share" en sección de notas personales
4. Exporta/comparte:

   - Formato: JSON (datos brutos), PDF (formato legible), o formato estándar
   - Incluye: Notas, fotos personales, fecha de visita, información del Spot
   - Compartir: Link, imagen, o formato social (Instagram story, etc.)

**Nota para implementación futura:** Esta funcionalidad se define pero NO se implementa en primera versión. Se marca como feature premium para monetización.

### Representación en Mapa

#### Tres Tipos de Markers

**Normal (sin Pin):**

- Marker estándar del Spot (público)
- Color/tipo según tipo de Spot (según sistema actual)
- Comportamiento: Click abre Spot Detail
- Icono: Icono según tipo de Spot (actual)

**Pin To Visit (con Pin, estado `to_visit`):**

- Marker que **reemplaza** el marker normal del usuario
- Color: Azul/cyan
- Icono: Icono de pin (diferente al bookmark, diferenciable fácilmente)
- Comportamiento: Click abre Spot Detail con opción "Mark as visited"

**Pin Visited (con Pin, estado `visited`):**

- Marker que **reemplaza** el marker normal del usuario
- Color: Verde
- Icono: Icono de check o pin con check (diferente al bookmark y pin to visit)
- Comportamiento: Click abre Spot Detail con opción "Mark as to visit"

**Regla de visualización:**

- **Se reemplazan**: Si usuario tiene Pin, ve SU marker (to visit o visited) en lugar del marker normal
- **No hay superposición**: Un Spot solo muestra UN marker por usuario (el de Pin si existe, sino el normal)
- **Claridad visual**: Tres tipos de markers son fácilmente diferenciables:
  - Normal: Color según tipo de Spot, icono de tipo
  - Pin To Visit: Azul, icono de pin
  - Pin Visited: Verde, icono de check/pin con check

**Menú de filtro en Map:**

- Agregar menú en parte superior del mapa (junto a controles de zoom)
- Opciones: "All" | "To Visit" | "Visited" | "None" (sin pin)
- Al seleccionar filtro, muestra solo markers correspondientes
- Permite ver claramente distribución de pins por estado

### Pinned (Biblioteca Personal) - Redefinición

**Naming:** "Saved" se renombra a "Pinned" (o se mantiene "Saved" pero conceptualmente es Pinned)

**Estructura propuesta - Resolver conflicto con selector actual:**

**Problema identificado:**

- SavedFilterHeader actual tiene filtros: "Spots" | "Flows" | "All"
- Nueva propuesta requiere filtros: "To Visit" | "Visited" | "All"
- **CONFLICTO:** No pueden coexistir ambos sistemas de filtrado

**Soluciones propuestas:**

**Opción A: Dos niveles de filtrado (RECOMENDADO)**

- Header principal: Filtro por tipo (Spots | Flows | All) - se mantiene
- Sub-filtro o tabs internos: Filtro por estado de Pin (To Visit | Visited | All)
- Estructura: Spots/Flows/All → Dentro de cada uno, tabs To Visit/Visited/All
- Ventaja: Mantiene selector actual, agrega funcionalidad sin romper UX
- Desventaja: Puede ser complejo si hay muchos Pins

**Opción B: Unificar filtros (ALTERNATIVA)**

- Reemplazar selector actual con: "To Visit" | "Visited" | "All"
- Flows se mueven a otra sección (Perfil o sección dedicada)
- Ventaja: Más simple, enfocado en estados de Pin
- Desventaja: Pierde capacidad de filtrar por tipo (Spots vs Flows)

**Opción C: Mover Flows a Perfil (ALTERNATIVA)**

- Pinned solo gestiona Pins (Spots con relación personal)
- Flows guardados se mueven a sección "My Flows" en Perfil
- Pinned tiene filtros: "To Visit" | "Visited" | "All"
- Ventaja: Separación clara (Pins vs Flows)
- Desventaja: Flows requieren navegación adicional

**Recomendación:** Opción A (dos niveles) para mantener compatibilidad y funcionalidad existente.

**Estructura final propuesta (Opción A):**

```
Pinned Screen
├── Header: SavedFilterHeader (Spots | Flows | All) - se mantiene
├── Sub-header o tabs: PinStateFilter (To Visit | Visited | All) - nuevo
└── Contenido filtrado según ambos filtros
```

**Funcionalidades:**

- Cambiar estado: `to_visit` ↔ `visited` desde cualquier punto (Card, Detail, Map)
- Agregar notas personales (diario de viaje) - botón opcional
- Agregar fotos personales - botón opcional
- Exportar/compartir diario (feature premium)
- Filtrar por tipo de Spot (selector actual)
- Filtrar por estado de Pin (nuevo selector)

### Diferenciación: Add Spot vs Add Pin

#### Add Spot (Crear Lugar Público)

**Dónde se puede crear:**

- **Solo desde Mapa**: Long press o botón "Add Spot" en Map Screen
- **Solo desde Search**: Botón "+" o crear si no existe en resultados de búsqueda
- **NO desde Cards**: Cards solo permiten Pin (marcar lugar existente)
- **NO desde Spot Detail**: Detail solo permite Pin (marcar lugar existente)
- **NO desde Flow**: Flow solo permite Pin (marcar lugares del flow)

**Flujo:**

1. Usuario está en Mapa o Search
2. Presiona "Add Spot" (icono `add-location` o `plus`)
3. Completa formulario (ubicación, nombre, foto, etc.)
4. Spot se crea en base pública
5. Spot aparece para todos los usuarios

#### Add Pin (Marcar Lugar Personal)

**Dónde se puede crear:**

- **Desde Card de Spot**: Botón "Pin" en SpotMediaCard o SpotInlineCard
- **Desde Detalle de Spot**: Botón "Pin" en SpotDetail
- **Desde Flow**: Botón "Pin" en Flow Detail o Flow Screen (para spots del flow)
- **NO desde Mapa**: Mapa es para exploración, Pin se hace desde Card/Detail
- **NO desde Search**: Search es para búsqueda, Pin se hace desde Card/Detail

**Flujo:**

1. Usuario ve Spot (en Card, Detail, o Flow)
2. Presiona botón "Pin" (icono de pin, diferenciado de bookmark y otros iconos)
3. Aparece modal/dropdown con opciones:

   - "To Visit" → Crea Pin con estado `to_visit`
   - "Visited" → Crea Pin con estado `visited`

4. Pin se crea con el estado seleccionado
5. Pin aparece en "Pinned" filtrado por estado
6. Pin aparece en mapa personal con marker correspondiente

**Diferencia clave:**

- Add Spot = Crear entidad pública (solo Mapa/Search)
- Add Pin = Marcar relación personal (Card/Detail/Flow)

### Sistema de Iconos

#### Iconos Diferenciables (REQUERIMIENTO CRÍTICO)

**Regla:** Todos los iconos deben ser fácilmente diferenciables, NO usar el mismo icono para diferentes acciones.

**Iconos propuestos:**

1. **Add Spot** (`add-location` o `plus-circle`):

   - Significado: Crear lugar público
   - Dónde: Mapa, Search
   - Diferencia: Icono de "agregar ubicación" o "plus"

2. **Pin** (`pin` o `location-on` o nuevo icono):

   - Significado: Marcar lugar personal
   - Dónde: Cards, Spot Detail, Flow
   - Diferencia: Icono de "pin" o "location pin" (diferente a bookmark)

3. **Bookmark** (`bookmark`):

   - **ELIMINAR** (ya no se usa, reemplazado por Pin)

4. **Like** (`favorite`):

   - **ELIMINAR** (ya no se usa, reemplazado por Pin)

5. **Map View** (`visibility` o `map`):

   - Significado: Ver en mapa
   - Dónde: Cards
   - Diferencia: Icono de "ojo" o "map" (ya implementado)

**Recomendación de iconos MaterialIcons:**

- Pin: `'location-on'` (pin de mapa) o `'push-pin'` (alfiler) o `'place'` (lugar)
- Add Spot: `'add-location'` (ya existe en iconMap)
- Map View: `'visibility'` (ya existe en iconMap)

**Validación:** Iconos deben ser visualmente distintos y claros en tamaño pequeño (24px).

### Eliminación de Like

**Decisión:** Like se elimina completamente del sistema.

**Razonamiento:**

- Pin reemplaza Like: Si un lugar está Pin, entonces le gusta al usuario
- Simplifica modelo: No hay confusión entre "like" y "pin"
- Claridad conceptual: Pin = relación personal, Like = señal redundante

**Migración:**

- `likedSpots: string[]` se elimina de SavedContext
- `toggleLikeSpot()` se elimina
- `isSpotLiked()` se elimina
- UI: Todos los botones de "Like" se reemplazan por "Pin"

**Script de migración:**

- Si usuario tiene `likedSpots`, crear Pins con estado `to_visit` (asumir intención de visita)
- Eliminar `likedSpots` después de migración

### Timeline/History (Fuera de Alcance)

**Decisión:** Timeline/History se saca del alcance desde versión anterior.

**Implicaciones:**

- No se implementa funcionalidad de timeline
- No se muestra tab "History" en Saved
- No se rastrean acciones de Pin en timeline
- `timeline: TimelineEntry[]` puede mantenerse para compatibilidad pero no se usa

**Nota:** Esta decisión viene de versión anterior, se respeta.

---

## Cambios en Modelo de Datos

### SavedContext - Nuevo Modelo de Pin

```typescript
interface PinData {
  spotId: string;
  state: 'to_visit' | 'visited';
  pinnedAt: Date;
  visitedAt?: Date;
  notes?: string;           // Texto libre, sin límite de caracteres
  personalPhotos?: string[]; // URLs o paths de fotos personales
}

interface SavedData {
  // ELIMINAR
  // savedSpots: string[];  // Se reemplaza por pins
  // likedSpots: string[];  // Se elimina (Pin reemplaza Like)
  
  // NUEVO
  pins: Record<string, PinData>; // spotId -> PinData
  
  // MANTENER
  notMyVibeSpots: string[];      // Se mantiene (afinidad negativa independiente)
  savedFlows: string[];           // Se mantiene (Flows guardados)
  savedFlowNames: Record<string, string>; // Se mantiene
  
  // OPCIONAL (mantener para compatibilidad pero no usar)
  timeline: TimelineEntry[];      // Se mantiene pero no se usa (fuera de alcance)
}
```

### Nuevas Funciones en SavedContext

```typescript
interface SavedContextType {
  // Pins
  pins: Record<string, PinData>;
  pinSpot: (spotId: string, state: 'to_visit' | 'visited') => void; // Crear Pin con estado
  unpinSpot: (spotId: string) => void;                               // Eliminar Pin
  changePinState: (spotId: string, newState: 'to_visit' | 'visited') => void; // Cambiar estado
  isSpotPinned: (spotId: string) => boolean;
  getPinState: (spotId: string) => 'to_visit' | 'visited' | null;
  getPinnedSpots: (state?: 'to_visit' | 'visited') => string[]; // Filtrar por estado
  
  // Diario de Viaje
  updatePinNotes: (spotId: string, notes: string) => void;
  addPinPhoto: (spotId: string, photoUrl: string) => void;
  removePinPhoto: (spotId: string, photoUrl: string) => void;
  exportPinDiary: (spotId: string) => Promise<DiaryExport>; // Feature premium
  sharePinDiary: (spotId: string) => Promise<void>; // Feature premium
  
  // ELIMINAR
  // toggleLikeSpot: ... (eliminado)
  // isSpotLiked: ... (eliminado)
  
  // MANTENER
  notMyVibeSpots: string[];
  toggleNotMyVibeSpot: (spotId: string) => void;
  savedFlows: string[];
  toggleSaveFlow: (flowId: string) => void;
  // ... resto de funciones existentes
}
```

---

## Cambios en UI

### SpotMediaCard

**Cambios:**

- Botón "Save" → Botón "Pin" (icono de pin, no bookmark)
- Indicador visual de estado del Pin:
  - Si está `to_visit`: Badge/indicador azul "To Visit"
  - Si está `visited`: Badge/indicador verde "Visited"
- Acción: Click en botón "Pin" abre modal con opciones "To Visit" | "Visited"
- Acción rápida: Long press en botón "Pin" cambia estado directamente (toggle)

**Iconos:**

- Pin: `'location-on'` o `'push-pin'` (nuevo icono en iconMap)
- Diferente a: bookmark, like, map (ya no se usan)

### SpotDetail

**Cambios:**

- Botón "Save" → Botón "Pin" (si no está pinned) o indicador de estado (si está pinned)
- Sección "Personal Notes" (si hay Pin con estado `visited`):
  - Muestra notas existentes (si hay)
  - Botón "Add Notes" o "Edit Notes" (siempre visible)
  - Editor simple (no modal bloqueante)
- Botón "Add Photos" (si hay Pin con estado `visited`):
  - Permite agregar fotos personales
  - Muestra galería de fotos personales
- Botón "Mark as visited" / "Mark as to visit" (si está pinned)
- Botones "Export" / "Share" (si hay notas/fotos, feature premium)

### Saved Screen → Pinned Screen

**Cambios:**

- Renombrar "Saved" a "Pinned" (o mantener "Saved" pero conceptualmente es Pinned)
- Mantener SavedFilterHeader con filtros: "Spots" | "Flows" | "All"
- Agregar tabs o sub-filtro: "To Visit" | "Visited" | "All"
- Estructura: Dos niveles de filtrado (tipo × estado)
- Contenido: Muestra Pins filtrados según ambos filtros
- Acción: Cambiar estado desde Cards (toggle rápido)

### Map Screen

**Cambios:**

- Tres tipos de markers (Normal, Pin To Visit, Pin Visited)
- Markers se reemplazan: Si hay Pin, muestra marker de Pin (no superposición)
- Menú de filtro en parte superior:
  - Opciones: "All" | "To Visit" | "Visited" | "None"
  - Filtra markers visibles según estado de Pin
- Leyenda explicando tipos de markers
- Click en marker: Abre Spot Detail con opciones de Pin

### Flow Detail / Flow Screen

**Cambios:**

- Botón "Pin" en cada Spot del Flow
- Acción: Pin spot individual del Flow
- Modal con opciones "To Visit" | "Visited" al presionar Pin

---

## Compartir (Nueva Funcionalidad)

### Compartir Mapa de Pines

**Funcionalidad:**

- Compartir vista de mapa filtrada por estado de Pin
- Opciones:
  - "Share My To Visit Map" → Comparte mapa con solo pins `to_visit`
  - "Share My Visited Map" → Comparte mapa con solo pins `visited`
  - "Share My Flows" → Comparte Flows guardados

**Flujo:**

1. Usuario en Map Screen o Pinned Screen
2. Selecciona filtro de estado (To Visit, Visited)
3. Presiona botón "Share" en header o menú
4. Opciones de compartir:

   - Link público (si implementado backend)
   - Imagen del mapa
   - Export JSON con coordenadas de pins

5. Comparte vía sistema de compartir del dispositivo

**Implementación:**

- Feature básica: Compartir imagen del mapa con pins filtrados
- Feature avanzada (futuro): Link público con vista filtrada (requiere backend)

### Compartir Flows

**Funcionalidad:**

- Compartir Flows guardados (ya existe conceptualmente)
- Agregar a menú de compartir en Pinned Screen (si Flows quedan ahí)

---

## Flows en Pinned (Resolución de Conflicto)

### Análisis

**Estado actual:**

- SavedFilterHeader filtra: Spots | Flows | All
- Flows guardados aparecen en Saved Screen

**Problema:**

- Pinned Screen se enfoca en Pins (relación personal usuario-spot)
- Flows no son Pins (son entidades diferentes)
- Conflicto conceptual: ¿Flows van en Pinned o en otra sección?

### Decisiones Propuestas

**Opción A: Mantener Flows en Pinned (RECOMENDADO para primera versión)**

- Ventaja: No rompe UX actual
- Ventaja: Usuario encuentra Flows donde espera
- Desventaja: Mezcla conceptos (Pins vs Flows)
- Implementación: Dos niveles de filtrado (tipo × estado de Pin)

**Opción B: Mover Flows a Perfil (ALTERNATIVA para futuro)**

- Ventaja: Separación clara (Pins vs Flows)
- Ventaja: Pinned se enfoca solo en Pins
- Desventaja: Requiere navegación adicional
- Implementación: Nueva sección "My Flows" en Perfil

**Recomendación:**

- **V1.x:** Opción A (mantener Flows en Pinned, dos niveles de filtrado)
- **V2.x:** Evaluar Opción B (mover Flows a Perfil si mejora UX)

---

## Migración de Datos

### Script de Migración

**Migración de savedSpots → pins:**

```typescript
// Pseudocódigo
for each spotId in savedSpots:
  create Pin {
    spotId: spotId,
    state: 'to_visit', // Estado inicial asumido
    pinnedAt: Date.now(),
    visitedAt: undefined,
    notes: undefined,
    personalPhotos: undefined
  }
```

**Migración de likedSpots → pins:**

```typescript
// Pseudocódigo
for each spotId in likedSpots:
  // Solo crear Pin si no existe ya (por savedSpots)
  if (!pins[spotId]):
    create Pin {
      spotId: spotId,
      state: 'to_visit', // Asumir intención de visita
      pinnedAt: Date.now(),
      visitedAt: undefined,
      notes: undefined,
      personalPhotos: undefined
    }
```

**Limpieza:**

- Eliminar `savedSpots: string[]`
- Eliminar `likedSpots: string[]`
- Mantener `timeline` (compatibilidad) pero no usar
- Mantener `notMyVibeSpots` (independiente)

---

## Riesgos Identificados

### Riesgos Técnicos

1. **Migración de datos:**

   - Riesgo: Pérdida de datos si migración falla
   - Mitigación: Backup antes de migración, rollback si falla
   - Testing: Script de migración en ambiente de desarrollo

2. **Cambio de naming:**

   - Riesgo: Confusión temporal en código
   - Mitigación: Mantener alias temporal "Save" → "Pin"
   - Testing: Buscar todas las referencias a "Save" y actualizar gradualmente

3. **Conflictos de filtrado:**

   - Riesgo: UX compleja con dos niveles de filtrado
   - Mitigación: Testing exhaustivo, UI clara, documentación

### Riesgos de UX

1. **Confusión conceptual:**

   - Riesgo: Usuarios confunden "Add Spot" con "Pin"
   - Mitigación: Iconos diferenciados, UI clara, onboarding

2. **Cambio de comportamiento:**

   - Riesgo: Usuarios esperan "Save" pero ven "Pin"
   - Mitigación: Comunicación clara, transición gradual, ayuda contextual

---

## Plan de Implementación (Alto Nivel)

### Fase 1: Modelo de Datos

1. Actualizar SavedContext con modelo de Pin
2. Agregar funciones: `pinSpot`, `unpinSpot`, `changePinState`, etc.
3. Crear script de migración (savedSpots → pins, likedSpots → pins)
4. Eliminar funciones de Like

### Fase 2: UI - Botones y Acciones

1. Actualizar SpotMediaCard: Botón "Pin" con modal de opciones
2. Actualizar SpotDetail: Botón "Pin", sección de notas personales
3. Actualizar Map Screen: Tres tipos de markers, filtro de estado
4. Agregar iconos nuevos al iconMap

### Fase 3: Pinned Screen

1. Resolver conflicto de filtrado (dos niveles)
2. Agregar tabs/sub-filtro de estado de Pin
3. Actualizar visualización de Pins filtrados
4. Agregar acciones de cambio de estado

### Fase 4: Diario de Viaje

1. Implementar editor de notas (simple, no bloqueante)
2. Implementar agregar fotos personales
3. Mostrar notas/fotos en Spot Detail
4. (Futuro) Implementar exportar/compartir (feature premium)

### Fase 5: Compartir

1. Implementar compartir mapa filtrado por estado
2. Implementar compartir Flows (si aplica)
3. (Futuro) Backend para links públicos

---

## Decisiones Validadas (Finales)

1. ✅ **Pin reemplaza "Save" y "Like"**: Naming unificado, concepto claro
2. ✅ **Dos estados de Pin**: `to_visit` y `visited` (escalable para futuro)
3. ✅ **Modal de opciones al Pin**: Usuario selecciona estado al crear Pin
4. ✅ **Edición universal de estado**: Disponible desde cualquier punto (Card, Detail, Map, Flow)
5. ✅ **Diario de Viaje**: Notas y fotos opcionales, sin límite, botones no bloqueantes
6. ✅ **Exportar/Compartir**: Feature premium, definir flujo pero no implementar aún
7. ✅ **Mapa**: Tres tipos de markers que se reemplazan, filtro por estado
8. ✅ **Iconos diferenciables**: Pin usa icono distinto a bookmark, like, map
9. ✅ **Add Spot solo desde Mapa/Search**: Cards/Detail solo permiten Pin
10. ✅ **Pin desde Card/Detail/Flow**: No desde Mapa/Search
11. ✅ **Like eliminado**: Pin reemplaza completamente Like
12. ✅ **Timeline/History fuera de alcance**: No se implementa

---

## Próximos Pasos (Implementación)

1. ✅ Validar modelo final con Product Owner (Oscar) - **COMPLETADO**
2. Documentar modelo final en FUENTE_UNICA_VERDAD_V2.0.md
3. Actualizar BITACORA_V1_1.md con análisis documental y decisiones validadas
4. Crear plan de implementación detallado (con tareas específicas)
5. Crear script de migración de datos (savedSpots → pins, likedSpots → pins)
6. Implementar modelo de datos (SavedContext)
7. Actualizar UI (SpotMediaCard, SpotDetail, Map Screen, Pinned Screen)
8. Testing exhaustivo de migración, UX y comportamiento
9. Validación final con Product Owner

---

## Documentos Consultados

- BITACORA_V1_1.md
- FLOWYA Product Definition V2.0.md
- FUENTE_UNICA_VERDAD_V2.0.md
- DECISIONES_TECNICAS.md
- FLOWYA — BACKLOG V1.1.md
- contexts/SavedContext.tsx
- contexts/SpotContext.tsx
- data/spots.ts
- components/SpotMediaCard.tsx
- components/ui/SavedFilterHeader.tsx
- app/(tabs)/saved.tsx

---

**Estado:** ✅ Modelo validado y listo para implementación