# UX HOME — FLOWYA V1.3

**Versión:** FLOWYA V1.3  
**Fecha:** 2026-01-11  
**Estado:** En progreso

---

## PROPÓSITO

Este documento define el comportamiento y estructura del Home rediseñado en V1.3, enfocándose en **comportamiento y estructura, NO diseño visual final**.

**Referencias:**
- Decisiones canónicas: `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md` - D-V1.3-03, D-V1.3-04
- Reglas canónicas V1.2: `definitions/FLOWYA V1.2/BITACORA_V1_2.md` - Ajuste 06, Ajuste 07

---

## CONCEPTO: HOME COMO "ESTADO DEL VIAJE"

### Principio Fundamental

Home en V1.3 se rediseña como **"estado del viaje"** del usuario, mostrando:
- Dónde está (Nearby)
- Qué quiere visitar (To Visit)
- Qué ya visitó (Visited)
- Qué puede descubrir (Discover/Gems)

**Referencia:** `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-03

---

## ESTRUCTURA DE SECCIONES

### Orden de Secciones (Top to Bottom)

1. **Nearby** (siempre primera si hay spots cercanos)
2. **To Visit** (slider horizontal)
3. **Visited** (slider horizontal)
4. **Discover / Gems** (solo spots no pineados)

### Comportamiento General

- **Scroll vertical:** Todas las secciones en un scroll continuo
- **Carga progresiva:** Secciones cargan bajo demanda al hacer scroll
- **Pull-to-refresh:** Actualiza todas las secciones
- **Estados vacíos:** Mensajes claros cuando no hay contenido

---

## SECCIÓN 1: NEARBY

### Comportamiento (Heredado de V1.2)

**Regla Canónica V1.2:** Nearby SIEMPRE visible cuando hay spots cercanos, NO filtra por estado de Pin.

**Referencia V1.2:** `BITACORA_V1_2.md` - Ajuste 07

### Estructura

- **Título:** "Nearby" (o equivalente traducido)
- **Tipo:** Grid o lista vertical (depende de diseño visual)
- **Contenido:** Spots cercanos a ubicación actual del usuario
- **Filtrado:** NINGUNO (muestra todos los spots cercanos, independiente de Pin)

### Lógica de Datos

```typescript
// Pseudocódigo
const nearbySpots = spots.filter(spot => {
  const distance = calculateDistance(userLocation, spot.location);
  return distance <= MAX_NEARBY_DISTANCE; // ej: 5km
});

// NO filtrar por estado de Pin
// NO filtrar por si está pinned o no
```

### Estados

- **Con spots cercanos:** Muestra sección con spots
- **Sin spots cercanos:** Oculta sección completamente
- **Sin ubicación:** Oculta sección completamente

### Interacciones

- **Tap en spot:** Navega a Spot Detail
- **Pin desde card:** Crea Pin (comportamiento híbrido V1.2)
- **Cambio de ubicación:** Recalcula spots cercanos

---

## SECCIÓN 2: TO VISIT

### Comportamiento

**Nuevo en V1.3:** Slider horizontal con pins de estado `to_visit`, ordenados por más reciente → más antiguo.

### Estructura

- **Título:** "To Visit" (o equivalente traducido)
- **Tipo:** Slider horizontal (scroll horizontal)
- **Contenido:** Spots con Pin estado `to_visit` del usuario actual
- **Ordenamiento:** `pinnedAt` DESC (más reciente primero)

### Lógica de Datos

```typescript
// Pseudocódigo
const toVisitSpots = userPins
  .filter(pin => pin.state === 'to_visit')
  .sort((a, b) => b.pinnedAt - a.pinnedAt) // Más reciente primero
  .map(pin => getSpotById(pin.spotId));
```

### Estados

- **Con pins to_visit:** Muestra slider con spots
- **Sin pins to_visit:** Muestra mensaje "No places to visit yet"
- **Cargando:** Skeleton loader

### Interacciones

- **Scroll horizontal:** Navega entre spots
- **Tap en spot:** Navega a Spot Detail
- **Long press en card:** Cambiar estado a `visited` (comportamiento V1.2)
- **Cambio de estado:** NO mueve card inmediatamente (regla V1.2)

**Referencia V1.2:** `BITACORA_V1_2.md` - Ajuste 06

### Comportamiento de Cambio de Estado

- **Al cambiar Pin a `visited`:**
  - Card NO desaparece inmediatamente
  - Card mantiene posición en slider durante sesión
  - Cambio se refleja visualmente (badge/indicador)
  - Reclasificación ocurre solo tras refresh o al reentrar a la vista

---

## SECCIÓN 3: VISITED

### Comportamiento

**Nuevo en V1.3:** Slider horizontal con pins de estado `visited`, ordenados por más reciente → más antiguo.

### Estructura

- **Título:** "Visited" (o equivalente traducido)
- **Tipo:** Slider horizontal (scroll horizontal)
- **Contenido:** Spots con Pin estado `visited` del usuario actual
- **Ordenamiento:** `visitedAt` DESC (más reciente primero), si no tiene `visitedAt`, usar `pinnedAt` DESC

### Lógica de Datos

```typescript
// Pseudocódigo
const visitedSpots = userPins
  .filter(pin => pin.state === 'visited')
  .sort((a, b) => {
    // Priorizar visitedAt, luego pinnedAt
    const aDate = a.visitedAt || a.pinnedAt;
    const bDate = b.visitedAt || b.pinnedAt;
    return bDate - aDate; // Más reciente primero
  })
  .map(pin => getSpotById(pin.spotId));
```

### Estados

- **Con pins visited:** Muestra slider con spots
- **Sin pins visited:** Muestra mensaje "No places visited yet"
- **Cargando:** Skeleton loader

### Interacciones

- **Scroll horizontal:** Navega entre spots
- **Tap en spot:** Navega a Spot Detail
- **Long press en card:** Cambiar estado a `to_visit` (comportamiento V1.2)
- **Cambio de estado:** NO mueve card inmediatamente (regla V1.2)

### Comportamiento de Cambio de Estado

- **Al cambiar Pin a `to_visit`:**
  - Card NO desaparece inmediatamente
  - Card mantiene posición en slider durante sesión
  - Cambio se refleja visualmente (badge/indicador)
  - Reclasificación ocurre solo tras refresh o al reentrar a la vista

---

## SECCIÓN 4: DISCOVER / GEMS

### Comportamiento

**Nuevo en V1.3:** Sección de descubrimiento que muestra solo spots NO pineados (cualquier estado).

### Estructura

- **Título:** "Discover" o "Gems" (o equivalente traducido)
- **Tipo:** Grid o lista vertical (depende de diseño visual)
- **Contenido:** Spots que NO tienen Pin del usuario actual
- **Algoritmo:** Similar a Gems actual, pero excluyendo spots con Pin

### Lógica de Datos

```typescript
// Pseudocódigo
const discoverSpots = getAllGems()
  .filter(spot => !isSpotPinned(spot.id)) // Excluir spots con Pin
  .slice(0, MAX_DISCOVER_SPOTS); // Limitar cantidad
```

### Estados

- **Con spots no pineados:** Muestra grid/lista con spots
- **Sin spots no pineados:** Muestra mensaje "All places discovered" o similar
- **Cargando:** Skeleton loader

### Interacciones

- **Tap en spot:** Navega a Spot Detail
- **Pin desde card:** Crea Pin (comportamiento híbrido V1.2)
- **Al crear Pin:** Spot desaparece de esta sección (tras refresh)

---

## COMPORTAMIENTO DEL DIARIO

### Principio (Nuevo en V1.3)

**Decisión V1.3:** Diario siempre visible en Spot Detail, al escribir activa automáticamente estado `visited`.

**Referencia:** `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-04

### Estructura en Spot Detail

1. **Sección Diario:**
   - Siempre visible (no solo si `visited`)
   - Título: "Diary" o "Personal Notes" (o equivalente)
   - Indicador visual si Pin no está en estado `visited`

2. **Editor de Notas:**
   - Botón "Add Notes" / "Edit Notes" siempre visible
   - Al escribir primera vez:
     - Si Pin no existe: Crea Pin con estado `visited`
     - Si Pin existe con estado `to_visit`: Cambia a `visited`
     - Si Pin existe con estado `visited`: Solo actualiza notas

3. **Fotos Personales:**
   - Botón "Add Photo" siempre visible
   - Solo funcional si Pin tiene estado `visited`
   - Si no está `visited`: Muestra mensaje "Mark as visited to add photos"

4. **Metadata Temporal:**
   - `visitedAt` visible como metadata
   - Formato: "Visited on [fecha]" o similar
   - Solo visible si Pin tiene estado `visited`

### Flujo de Usuario

```
Usuario abre Spot Detail
  │
  ▼
Ve sección Diario (siempre visible)
  │
  ▼
Presiona "Add Notes"
  │
  ▼
Escribe notas
  │
  ▼
Presiona "Save"
  │
  ├─ Si Pin no existe → Crea Pin con estado 'visited'
  ├─ Si Pin es 'to_visit' → Cambia a 'visited'
  └─ Si Pin es 'visited' → Solo actualiza notas
```

### Lógica de Activación Automática

```typescript
// Pseudocódigo
function saveNotes(spotId: string, notes: string) {
  const pin = getPin(spotId);
  
  if (!pin) {
    // Crear Pin con estado 'visited'
    createPin(spotId, 'visited', { notes });
  } else if (pin.state === 'to_visit') {
    // Cambiar a 'visited' y actualizar notas
    changePinState(spotId, 'visited');
    updatePinNotes(spotId, notes);
  } else {
    // Solo actualizar notas
    updatePinNotes(spotId, notes);
  }
}
```

---

## ORDENAMIENTO Y FILTRADO

### Reglas de Ordenamiento

1. **To Visit:** `pinnedAt` DESC (más reciente primero)
2. **Visited:** `visitedAt` DESC (más reciente primero), fallback a `pinnedAt` DESC
3. **Nearby:** Distancia ASC (más cercano primero)
4. **Discover:** Algoritmo de Gems (popularidad, relevancia, etc.)

### Reglas de Filtrado

1. **Nearby:** NO filtra por Pin (muestra todos los spots cercanos)
2. **To Visit:** Solo spots con Pin estado `to_visit`
3. **Visited:** Solo spots con Pin estado `visited`
4. **Discover:** Solo spots SIN Pin (cualquier estado)

### Comportamiento de Re-Filtrado

- **Cambio de estado Pin:** NO re-filtra inmediatamente
- **Refresh manual:** Re-filtra todas las secciones
- **Reentrar a vista:** Re-filtra todas las secciones

**Referencia V1.2:** `BITACORA_V1_2.md` - Ajuste 06

---

## TRANSICIONES Y ESTADOS

### Estados de Carga

1. **Initial Load:**
   - Skeleton loaders para cada sección
   - Carga progresiva (Nearby primero, luego To Visit, etc.)

2. **Refresh:**
   - Pull-to-refresh en toda la vista
   - Actualiza todas las secciones simultáneamente

3. **Background Update:**
   - Sincronización en background
   - Actualización silenciosa de datos
   - NO causa re-render si datos no cambian

### Transiciones

1. **Al cambiar estado Pin:**
   - Transición suave de badge/indicador
   - NO animación de movimiento de card
   - Feedback visual inmediato

2. **Al crear Pin:**
   - Card desaparece de Discover (tras refresh)
   - Aparece en To Visit o Visited (según estado)
   - Transición suave

3. **Al navegar a Spot Detail:**
   - Transición estándar de navegación
   - Mantiene contexto de Home

---

## FLUJOS DE USUARIO PRINCIPALES

### Flujo 1: Descubrir y Planear

```
Home → Discover
  │
  ▼
Ve spot interesante
  │
  ▼
Tap en spot → Spot Detail
  │
  ▼
Pin → "To Visit"
  │
  ▼
Regresa a Home
  │
  ▼
Ve spot en sección "To Visit"
```

### Flujo 2: Visitar y Documentar

```
Home → To Visit
  │
  ▼
Ve spot que quiere visitar
  │
  ▼
Tap en spot → Spot Detail
  │
  ▼
Visita el lugar (físicamente)
  │
  ▼
Abre Spot Detail
  │
  ▼
Escribe en Diario → Auto-activa 'visited'
  │
  ▼
Agrega fotos
  │
  ▼
Regresa a Home
  │
  ▼
Ve spot en sección "Visited"
```

### Flujo 3: Explorar Cercanías

```
Home → Nearby
  │
  ▼
Ve spots cercanos (independiente de Pin)
  │
  ▼
Explora spots
  │
  ▼
Puede pin o no pin
  │
  ▼
Nearby siempre muestra spots cercanos
```

---

## NOTAS IMPORTANTES

1. **NO diseño visual:** Este documento se enfoca en comportamiento y estructura
2. **Respeta reglas V1.2:** Nearby siempre visible, cambio Pin no mueve cards
3. **Ordenamiento temporal:** Más reciente primero en To Visit y Visited
4. **Diario siempre visible:** Nueva funcionalidad V1.3

---

**Última actualización:** 2026-01-11  
**Estado:** Comportamiento y estructura definidos
