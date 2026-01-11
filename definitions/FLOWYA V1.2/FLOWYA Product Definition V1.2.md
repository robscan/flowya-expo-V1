# FLOWYA
## Product Definition V1.2 · Antecedente Oficial para Desarrollo

**Versión canónica**  
**Última actualización:** 2026-01-11  
**Estado:** Definición conceptual completada, listo para implementación

---

## MANIFIESTO

El mundo está lleno de lugares.
Pero moverse sin intención convierte el descubrimiento en ruido.

FLOWYA existe para ayudar a las personas a notar lugares, no a completar listas.
No se trata de ver más.
Se trata de elegir mejor.

FLOWYA no optimiza el viaje.
Lo afina.

---

## PRINCIPIO RECTOR

En FLOWYA no se empieza creando contenido.
Se empieza moviéndose y señalando el mundo.

El usuario camina, observa y nota algo.
Puede pensar:

- ¿Qué es este lugar?
- Este lugar debería estar aquí
- Not my vibe

Crear, editar y organizar no son tareas explícitas.
Son consecuencias naturales del movimiento y la curiosidad.

FLOWYA acompaña el movimiento.
Nunca lo dirige.

---

## LENGUAJE OFICIAL DEL PRODUCTO

FLOWYA utiliza un lenguaje propio, simple y consistente.

- **Spot**: un lugar señalado (entidad pública).
- **Pin**: relación personal usuario-spot con estados (to_visit, visited).
- **Path**: un camino posible, una sugerencia.
- **Flow**: el estado activo de consulta o reproducción de un Path.
- **Map**: exploración libre y planeación.
- **Explore**: exploración contextual sin compromiso.
- **Gems**: lugares y Paths que brillan ahora.
- **Pinned**: memoria personal del usuario (anteriormente "Saved").
- **Not my vibe**: señal de afinidad negativa (sin juicio).
- **Narration**: acompañamiento emocional y contextual.
- **Search**: búsqueda contextual de Spots y Paths.

**Cambios en V1.2:**
- "Saved" se renombra conceptualmente a "Pinned"
- "Like" se elimina (Pin reemplaza Like)
- "Pin" es el nuevo término para relación personal usuario-spot

Este lenguaje no se explica: se descubre usándolo.

---

## ARQUITECTURA V2.0

La arquitectura V2.0 se mantiene en V1.2 sin cambios fundamentales. Todos los principios arquitectónicos establecidos en V2.0 se respetan.

**Referencia completa:** `FUENTE_UNICA_VERDAD_V2.0_REFERENCIA.md`

### Principios Arquitectónicos (No Negociables)

1. **Fuente Única de Verdad**: LocationProvider centralizado
2. **Separación Estricta de Capas**: Sistema → Preparación → UI
3. **Componentes Visuales Son "Tontos"**: Solo renderizan datos preparados
4. **Skeleton = Visual, Sin Lógica**: Componentes puramente visuales
5. **Preparación de Datos Fuera de Componentes**: Funciones puras, memoizadas

---

## ENTIDADES DEL SISTEMA

### SPOT

Un Spot es un lugar físico específico que alguien notó.

No es un listing.
No es contenido cerrado.
Es un punto de atención.

Un Spot puede existir incompleto.
Puede ser creado por cualquier usuario.
Puede evolucionar con el tiempo.

**Características en V1.2:**
- Spot es una entidad **pública**, compartida por todos los usuarios
- Se crea con "Add Spot" (solo desde Mapa o Search)
- **NO se crea desde Cards ni Flow Detail** (solo se puede marcar Pin)

**Atributos posibles:**
- nombre (opcional)
- ubicación en mapa (ajustable)
- fotos
- descripción breve (opcional)
- horarios (si aplica)
- costos (si aplica)
- tipo de lugar

#### CREACIÓN DE SPOT

**Dónde se puede crear:**
- Desde Mapa (long press o botón "Add Spot")
- Desde Search (botón "+" o crear si no existe)
- **NO desde Cards**: Cards solo permiten Pin (marcar lugar existente)
- **NO desde Spot Detail**: Detail solo permite Pin (marcar lugar existente)
- **NO desde Flow**: Flow solo permite Pin (marcar lugares del flow)

El usuario no entra a un formulario para crear un Spot.
Un Spot nace cuando el usuario camina o explora el mapa y decide señalar algo.

**Acciones posibles:**
- Mark this place
- Add Spot

**El usuario puede:**
- tomar una foto
- colocar o ajustar el pin
- escribir texto si quiere
- dejar campos vacíos

Un Spot no necesita estar completo para existir.

### PIN (NUEVO EN V1.2)

Un Pin es una relación personal entre usuario y un Spot existente.

**Características:**
- Se crea con "Pin" (acción explícita del usuario)
- Vive en espacio personal del usuario (`@flowya_saved`)
- Tiene estados: `to_visit` | `visited`
- **Reemplaza "Save" y "Like"**: Si está Pin, entonces le gusta al usuario

**Dónde se puede crear:**
- Desde Card de Spot (SpotMediaCard, SpotInlineCard)
- Desde Detalle de Spot (SpotDetail)
- Desde Flow (Flow Detail, Flow Screen)
- **NO desde Mapa**: Mapa es para exploración, Pin se hace desde Card/Detail
- **NO desde Search**: Search es para búsqueda, Pin se hace desde Card/Detail

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

**Flujo de creación:**
1. Usuario presiona botón "Pin" (icono pin diferenciado)
2. Aparece modal/dropdown con dos opciones:
   - "To Visit" → Crea Pin con estado `to_visit`
   - "Visited" → Crea Pin con estado `visited`
3. Pin se crea con el estado seleccionado
4. Pin aparece en "Pinned" (anteriormente "Saved")
5. Pin aparece en mapa personal con marker correspondiente

#### Estados del Pin

**To Visit (`to_visit`):**
- Estado inicial cuando usuario selecciona "To Visit" al crear Pin
- Significa: "Quiero visitar este lugar"
- Aparece en mapa personal con marker "pin to visit" (azul)
- Aparece en "Pinned" filtrado por "To Visit"

**Visited (`visited`):**
- Estado cuando usuario selecciona "Visited" al crear Pin o cambia estado
- Significa: "Ya visité este lugar"
- Aparece en mapa personal con marker "pin visited" (verde)
- Aparece en "Pinned" filtrado por "Visited"
- Puede tener fecha de visita (`visitedAt`)
- Puede tener notas personales y fotos personales (diario de viaje)

**Edición de Estado:**
- Disponible desde: Card de Spot, Spot Detail, Map Marker, Flow
- Cambia entre: `to_visit` ↔ `visited`
- Sin formulario: Acción directa (botón o toggle)
- Actualiza inmediatamente: Estado, marker en mapa, visualización en Pinned

### PATH

Un Path es una sugerencia de recorrido.

No es una instrucción.
No es una obligación.

Un Path agrupa Spots y propone un orden y un ritmo.
Nunca exige completarse.

(Definición completa se mantiene igual que V2.0)

### FLOW

Flow es el estado activo de movimiento.
Es el momento en que un Path está vivo.

(Definición completa se mantiene igual que V2.0)

---

## ARQUITECTURA GENERAL DE PANTALLAS

**Navegación principal (Tab Bar):**
- Home
- Map
- Pinned (anteriormente "Saved")
- Search

**Estados y overlays:**
- Flow

**Secciones de navegación:**
- Spot Detail (pantalla completa)
- Path Detail (pantalla completa)
- Flow Full Player (pantalla completa)

**Acceso secundario:**
- Profile (icono arriba a la derecha en Home y Pinned)

---

### HOME

(Definición completa se mantiene igual que V2.0)

---

### MAP

Map es una sección independiente en el Tab Bar principal.

Exploración libre y planeación.
Muestra Spots incluso lejanos.
Permite crear y ajustar Spots.

**Cambios en V1.2:**

**Tres Tipos de Markers:**
1. **Normal (sin Pin)**: Marker estándar del Spot (público)
2. **Pin To Visit**: Marker que reemplaza el marker normal del usuario (azul, icono de pin)
3. **Pin Visited**: Marker que reemplaza el marker normal del usuario (verde, icono de check/pin con check)

**Regla de visualización:**
- Si usuario tiene Pin, ve SU marker (to visit o visited) en lugar del marker normal
- No hay superposición: Un Spot solo muestra UN marker por usuario

**Menú de filtro en Map:**
- Agregar menú en parte superior del mapa (junto a controles de zoom)
- Opciones: "All" | "To Visit" | "Visited" | "None" (sin pin)
- Al seleccionar filtro, muestra solo markers correspondientes

---

### PINNED (ANTERIORMENTE "SAVED")

Pinned es la memoria personal del usuario.

**Cambios en V1.2:**

**Naming:** "Saved" se renombra conceptualmente a "Pinned" (o se mantiene "Saved" en UI pero conceptualmente es Pinned)

**Estructura:**
- Header: SavedFilterHeader (Spots | Flows | All) - se mantiene
- Sub-header o tabs: PinStateFilter (To Visit | Visited | All) - nuevo
- Contenido filtrado según ambos filtros (dos niveles de filtrado)

**Funcionalidades:**
- Cambiar estado: `to_visit` ↔ `visited` desde cualquier punto (Card, Detail, Map)
- Agregar notas personales (diario de viaje) - botón opcional
- Agregar fotos personales - botón opcional
- Exportar/compartir diario (feature premium, futuro)
- Filtrar por tipo de Spot (selector actual)
- Filtrar por estado de Pin (nuevo selector)

**Incluye:**
- Spots con Pin (filtrados por estado)
- Paths guardados (Flows)
- **NOTA:** Flows se mantienen en Pinned para V1.2 (Opción A: dos niveles de filtrado)

---

### SEARCH

(Definición completa se mantiene igual que V2.0)

---

### PROFILE

(Definición completa se mantiene igual que V2.0)

**Cambios en V1.2:**
- **"Liked Spots" se elimina**: Pin reemplaza Like completamente
- Profile ya no incluye sección de "Liked Spots"

---

### SPOT DETAIL

Spot Detail es una sección completa (pantalla completa) que muestra información detallada de un Spot.

**Cambios en V1.2:**

**Botón "Save" → Botón "Pin":**
- Si no está pinned: Botón "Pin" (icono de pin)
- Si está pinned: Indicador de estado (badge "To Visit" o "Visited")
- Click en botón "Pin" abre modal con opciones "To Visit" | "Visited"
- Botón "Mark as visited" / "Mark as to visit" (si está pinned)

**Sección "Personal Notes" (si hay Pin con estado `visited`):**
- Muestra notas existentes (si hay)
- Botón "Add Notes" o "Edit Notes" (siempre visible)
- Editor simple (no modal bloqueante)
- Sin límite de caracteres

**Botón "Add Photos" (si hay Pin con estado `visited`):**
- Permite agregar fotos personales
- Muestra galería de fotos personales

**Botones "Export" / "Share" (si hay notas/fotos, feature premium):**
- Feature premium (futuro)
- Permite exportar/compartir entrada de diario

**Eliminado:**
- Botón "Like" (ya no existe, reemplazado por Pin)

---

### FLOW

(Definición completa se mantiene igual que V2.0)

**Cambios en V1.2:**

**Botón "Pin" en cada Spot del Flow:**
- Acción: Pin spot individual del Flow
- Modal con opciones "To Visit" | "Visited" al presionar Pin

**Eliminado:**
- Botón "Like" en FlowScreen (ya no existe, reemplazado por Pin)

---

## SISTEMA DE ICONOS

### Iconos Diferenciables (REQUERIMIENTO CRÍTICO)

**Regla:** Todos los iconos deben ser fácilmente diferenciables, NO usar el mismo icono para diferentes acciones.

**Iconos en V1.2:**

1. **Add Spot** (`add-location` o `plus-circle`):
   - Significado: Crear lugar público
   - Dónde: Mapa, Search
   - Diferencia: Icono de "agregar ubicación" o "plus"

2. **Pin** (`location-on` o `push-pin` o nuevo icono):
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

---

## DIARIO DE VIAJE (NUEVO EN V1.2)

### Definición y Estructura

**Nivel de detalle:** General, memorias generales (según benchmark de apps de viaje)

**Estructura:**
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

### Exportar y Compartir Diario

**Funcionalidad (Posible Feature Premium):**
- Exportar: Notas y fotos personales en formato JSON, PDF, o formato estándar de diario
- Compartir: Compartir entrada de diario (notas + fotos) con otros usuarios o fuera de app
- Premium: Identificar como feature monetizable (freemium o suscripción)

**Nota:** Esta funcionalidad se define pero NO se implementa en primera versión. Se marca como feature premium para monetización.

---

## COMPARTIR (NUEVO EN V1.2)

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

### Compartir Flows

**Funcionalidad:**
- Compartir Flows guardados (ya existe conceptualmente)
- Agregar a menú de compartir en Pinned Screen (si Flows quedan ahí)

---

## CAMBIOS DE V1.1 A V1.2

### Modelo de Datos

**Eliminado:**
- `savedSpots: string[]` (se reemplaza por `pins`)
- `likedSpots: string[]` (se elimina, Pin reemplaza Like)
- Funciones: `toggleLikeSpot()`, `isSpotLiked()`

**Nuevo:**
- `pins: Record<string, PinData>` (nuevo modelo de Pin)
- Funciones: `pinSpot()`, `unpinSpot()`, `changePinState()`, `isSpotPinned()`, `getPinState()`, `getPinnedSpots()`, `updatePinNotes()`, `addPinPhoto()`, etc.

**Mantenido:**
- `notMyVibeSpots: string[]` (se mantiene, afinidad negativa independiente)
- `savedFlows: string[]` (se mantiene)
- `timeline: TimelineEntry[]` (se mantiene para compatibilidad pero no se usa)

### UI

**Renombrado:**
- "Save" → "Pin" (en todas las pantallas)
- "Saved" → "Pinned" (conceptual, puede mantenerse "Saved" en UI)

**Eliminado:**
- Botones de "Like" (en todas las pantallas)
- Sección "Liked Spots" en Profile

**Nuevo:**
- Modal de selección de estado al crear Pin (To Visit / Visited)
- Indicadores visuales de estado de Pin (badges "To Visit" / "Visited")
- Tres tipos de markers en Map (Normal, Pin To Visit, Pin Visited)
- Menú de filtro de estado en Map
- Sub-filtro de estado de Pin en Pinned Screen
- Sección "Personal Notes" en Spot Detail (si hay Pin visited)
- Botón "Add Photos" en Spot Detail (si hay Pin visited)

### Flujos

**Nuevo flujo de creación de Pin:**
1. Usuario presiona "Pin"
2. Aparece modal con opciones "To Visit" | "Visited"
3. Pin se crea con estado seleccionado

**Nuevo flujo de cambio de estado:**
- Disponible desde Card, Detail, Map, Flow
- Cambia entre `to_visit` ↔ `visited`

**Nuevo flujo de diario de viaje:**
1. Usuario tiene Pin con estado `visited`
2. Usuario abre Spot Detail
3. Ve botones "Add Notes" y "Add Photos"
4. Agrega notas/fotos (opcional)

---

## REFERENCIAS

**Documentación de Definición:**
- `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md` - Definición completa y validada del sistema

**Documentación de Referencia:**
- `FUENTE_UNICA_VERDAD_V2.0_REFERENCIA.md` - Arquitectura canónica V2.0
- `FLOWYA — BACKLOG V1.1_REFERENCIA.md` - Backlog V1.1
- `DECISIONES_TECNICAS_V1.1_REFERENCIA.md` - Decisiones técnicas V1.1
- `definitions/FLOWYA V1.1/BITACORA_V1_1.md` - Bitácora de cambios V1.1

---

**Documento generado:** 2026-01-11  
**Versión del Proyecto:** FLOWYA V1.2  
**Estado:** Definición conceptual completada, listo para implementación