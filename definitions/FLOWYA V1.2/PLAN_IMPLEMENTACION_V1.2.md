# PLAN DE IMPLEMENTACIÓN - FLOWYA V1.2
## Sistema de Pins, Visited y Diario de Viaje

**Versión:** 1.0  
**Fecha de creación:** 2026-01-11  
**Estado:** Plan detallado - Listo para implementación

---

## PROPÓSITO

Este documento detalla el plan de implementación completo para FLOWYA V1.2, incluyendo todas las fases, archivos a modificar, decisiones técnicas, y criterios de validación.

**Referencias:**
- Definición del sistema: `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`
- Product Definition: `FLOWYA Product Definition V1.2.md`
- Bitácora: `BITACORA_V1_2.md`

---

## ESTRATEGIA GENERAL

### Principios de Implementación

1. **Migración Incremental**: Mantener compatibilidad temporal durante la transición
2. **Testing Continuo**: Validar cada fase antes de continuar
3. **Backup de Datos**: Script de migración seguro con rollback
4. **Documentación**: Actualizar bitácora en cada fase
5. **Reversibilidad**: Posibilidad de rollback en cada fase

### Orden de Implementación

1. **Fase 1**: Modelo de Datos (fundación)
2. **Fase 2**: UI - Botones y Acciones (funcionalidad básica)
3. **Fase 3**: Pinned Screen (visualización)
4. **Fase 4**: Diario de Viaje (funcionalidad avanzada)
5. **Fase 5**: Compartir (features adicionales)

---

## FASE 1: MODELO DE DATOS

### Objetivo

Actualizar `SavedContext` con el nuevo modelo de Pin, mantener compatibilidad temporal, e implementar migración de datos.

### Archivos a Modificar

1. **`contexts/SavedContext.tsx`**
   - Agregar interfaces `PinData`, `PinState`
   - Agregar campo `pins` a `SavedData` (mantener campos antiguos temporalmente)
   - Implementar funciones nuevas de Pin
   - Implementar script de migración
   - Deprecar funciones antiguas (mantener por compatibilidad temporal)

### Pasos Detallados

#### 1.1 Definir Tipos e Interfaces

**Archivo:** `contexts/SavedContext.tsx`

**Cambios:**
```typescript
// Nuevas interfaces (agregar antes de SavedData)
export type PinState = 'to_visit' | 'visited';

export interface PinData {
  spotId: string;
  state: PinState;
  pinnedAt: Date;
  visitedAt?: Date;
  notes?: string;
  personalPhotos?: string[];
}
```

**Riesgos:** Ninguno (solo tipos)

**Validación:** TypeScript compila sin errores

---

#### 1.2 Agregar Campo `pins` a SavedData

**Archivo:** `contexts/SavedContext.tsx`

**Cambios:**
```typescript
interface SavedData {
  // NUEVO (V1.2)
  pins: Record<string, PinData>; // spotId -> PinData
  
  // TEMPORAL (mantener para migración)
  savedSpots: string[];
  likedSpots: string[];
  likedSpotsFromPlayer: string[];
  
  // MANTENER
  notMyVibeSpots: string[];
  savedFlows: string[];
  savedFlowNames: Record<string, string>;
  timeline: TimelineEntry[];
  spotTypeAffinity: Record<string, SpotTypeAffinity>;
  savedPaths: string[]; // Alias
}
```

**Default:**
```typescript
const defaultData: SavedData = {
  pins: {}, // NUEVO
  // ... resto de campos
};
```

**Riesgos:** Bajo (campo nuevo, no rompe funcionalidad existente)

**Validación:** App inicia correctamente, datos existentes se cargan

---

#### 1.3 Implementar Funciones de Pin

**Archivo:** `contexts/SavedContext.tsx`

**Funciones a implementar:**

1. `pinSpot(spotId: string, state: PinState): void`
   - Crea Pin con estado especificado
   - Actualiza `pins` Record
   - Guarda `pinnedAt` como Date actual
   - Si `state === 'visited'`, guarda `visitedAt`

2. `unpinSpot(spotId: string): void`
   - Elimina Pin del Record
   - No elimina de `savedSpots`/`likedSpots` (compatibilidad)

3. `changePinState(spotId: string, newState: PinState): void`
   - Cambia estado del Pin existente
   - Si cambia a `visited`, actualiza `visitedAt`
   - Si cambia a `to_visit`, elimina `visitedAt`

4. `isSpotPinned(spotId: string): boolean`
   - Verifica si existe Pin para el spotId

5. `getPinState(spotId: string): PinState | null`
   - Retorna estado del Pin o null

6. `getPinnedSpots(state?: PinState): string[]`
   - Retorna array de spotIds
   - Si `state` es especificado, filtra por estado
   - Si no, retorna todos los pinned spots

**Lógica de serialización:**
- `pinnedAt` y `visitedAt` deben convertirse a ISO string en AsyncStorage
- Al cargar, convertir strings a Date objects

**Riesgos:** Medio (lógica nueva, requiere testing)

**Validación:**
- Funciones compilan sin errores
- Testing manual: crear Pin, cambiar estado, eliminar Pin
- Verificar persistencia en AsyncStorage

---

#### 1.4 Implementar Script de Migración

**Archivo:** `contexts/SavedContext.tsx`

**Función:** `migrateToPins(data: SavedData): SavedData`

**Lógica:**

1. Migrar `savedSpots` → `pins`:
   ```typescript
   for each spotId in savedSpots:
     if (!pins[spotId]): // No sobrescribir si ya existe
       pins[spotId] = {
         spotId,
         state: 'to_visit',
         pinnedAt: new Date(), // Usar fecha actual
         visitedAt: undefined,
         notes: undefined,
         personalPhotos: undefined
       }
   ```

2. Migrar `likedSpots` → `pins`:
   ```typescript
   for each spotId in likedSpots:
     if (!pins[spotId]): // No sobrescribir si ya existe (savedSpots tiene prioridad)
       pins[spotId] = {
         spotId,
         state: 'to_visit',
         pinnedAt: new Date(),
         visitedAt: undefined,
         notes: undefined,
         personalPhotos: undefined
       }
   ```

3. Migrar `likedSpotsFromPlayer` → `pins` (igual que likedSpots)

**Cuándo ejecutar:**
- En `loadData()`, después de cargar datos de AsyncStorage
- Solo si `pins` está vacío o no existe
- Solo si hay `savedSpots` o `likedSpots` para migrar

**Flag de migración:**
- Agregar campo `_migrationV1_2Completed: boolean` a SavedData
- Verificar flag antes de migrar
- Marcar como completada después de migración

**Riesgos:** Alto (migración de datos, pérdida potencial)

**Mitigación:**
- Backup antes de migrar (log en consola)
- Migración idempotente (puede ejecutarse múltiples veces)
- No eliminar campos antiguos hasta validar migración

**Validación:**
- Verificar que datos migrados aparecen en `pins`
- Verificar que datos antiguos se mantienen (temporalmente)
- Testing con datos reales de usuario

---

#### 1.5 Agregar Funciones a SavedContextType

**Archivo:** `contexts/SavedContext.tsx`

**Cambios en interface:**
```typescript
interface SavedContextType {
  // NUEVO (V1.2)
  pins: Record<string, PinData>;
  pinSpot: (spotId: string, state: PinState) => void;
  unpinSpot: (spotId: string) => void;
  changePinState: (spotId: string, newState: PinState) => void;
  isSpotPinned: (spotId: string) => boolean;
  getPinState: (spotId: string) => PinState | null;
  getPinnedSpots: (state?: PinState) => string[];
  
  // TEMPORAL (mantener para compatibilidad)
  savedSpots: string[];
  likedSpots: string[];
  toggleLikeSpot: (spotId: string) => void;
  isSpotLiked: (spotId: string) => boolean;
  toggleSaveSpot: (spotId: string) => void;
  isSpotSaved: (spotId: string) => boolean;
  
  // ... resto de funciones
}
```

**Exportar en value:**
- Agregar todas las funciones nuevas al objeto `value`

**Riesgos:** Bajo (interfaces y exports)

**Validación:** TypeScript compila, componentes pueden usar nuevas funciones

---

#### 1.6 Testing de Fase 1

**Criterios de validación:**

1. ✅ App inicia sin errores
2. ✅ Datos existentes se cargan correctamente
3. ✅ Migración se ejecuta automáticamente (si aplica)
4. ✅ Funciones de Pin funcionan correctamente:
   - Crear Pin con estado `to_visit`
   - Crear Pin con estado `visited`
   - Cambiar estado entre `to_visit` y `visited`
   - Eliminar Pin
   - Verificar si está pinned
   - Obtener estado de Pin
   - Filtrar Pins por estado
5. ✅ Datos persisten en AsyncStorage
6. ✅ Datos se cargan correctamente después de reiniciar app

**Archivos de Testing:**
- Crear archivo de prueba manual (no requiere test unitarios por ahora)

---

### Entregables Fase 1

- [ ] Interfaces `PinData` y `PinState` definidas
- [ ] Campo `pins` agregado a `SavedData`
- [ ] Funciones de Pin implementadas y funcionando
- [ ] Script de migración implementado y probado
- [ ] Funciones agregadas a `SavedContextType`
- [ ] Testing completado
- [ ] Bitácora actualizada

---

## FASE 2: UI - BOTONES Y ACCIONES

### Objetivo

Actualizar componentes UI para usar nuevas funciones de Pin, reemplazar botones "Save"/"Like" por "Pin", y agregar modal de selección de estado.

### Archivos a Modificar

1. **`components/ui/Icon.tsx`**
   - Agregar icono 'location-on' o 'push-pin' para Pin

2. **`components/SpotMediaCard.tsx`**
   - Reemplazar botón "Save" por "Pin"
   - Agregar indicador visual de estado
   - Agregar modal de selección de estado
   - Implementar long press para toggle rápido

3. **`components/SpotInlineCard.tsx`**
   - Reemplazar botón "Save" por "Pin" (si existe)
   - Similar a SpotMediaCard

4. **`app/spot-detail.tsx`**
   - Reemplazar botón "Save" por "Pin"
   - Agregar indicador de estado
   - Agregar botón "Mark as visited/to visit"
   - Preparar estructura para sección de notas (Fase 4)

5. **`app/flow-screen.tsx`** (si aplica)
   - Reemplazar botón "Like" por "Pin" (si existe)

6. **`components/MapView.tsx`** / **`components/MapboxViewWeb.tsx`**
   - Preparar para tres tipos de markers (implementación en Fase 3)

### Pasos Detallados

#### 2.1 Agregar Icono de Pin

**Archivo:** `components/ui/Icon.tsx`

**Cambios:**
```typescript
iconMap = {
  // ... iconos existentes
  'pin': 'location-on', // o 'push-pin'
  // ...
}
```

**Riesgos:** Bajo (solo agregar icono)

**Validación:** Icono se muestra correctamente

---

#### 2.2 Actualizar SpotMediaCard

**Archivo:** `components/SpotMediaCard.tsx`

**Cambios:**

1. **Reemplazar botón Save:**
   - Cambiar de `toggleSaveSpot` a `pinSpot` / `unpinSpot`
   - Cambiar icono de `bookmark` a `pin`
   - Cambiar texto de "Save" a "Pin" (o sin texto, solo icono)

2. **Agregar indicador de estado:**
   - Si está pinned, mostrar badge/indicador visual:
     - Azul "To Visit" si `state === 'to_visit'`
     - Verde "Visited" si `state === 'visited'`

3. **Implementar comportamiento híbrido (V1.2 - Ajuste UX):**
   - **Primer Pin (comportamiento default):**
     - Al presionar "Pin" (si no está pinned): Pin directamente con estado `to_visit` (sin modal)
     - Mostrar micro-feedback: "Pinned · To visit" (toast o feedback visual)
     - **Ventaja:** Reduce fricción, evita modales repetitivos
   
   - **Cambiar estado (acción secundaria):**
     - Long press en botón "Pin" (si está pinned): Cambiar estado (`to_visit` ↔ `visited`)
     - Llamar `changePinState(spotId, newState)`
     - Mostrar feedback: "Changed to Visited" o "Changed to To Visit"
     - **Ventaja:** Mantiene control, acceso rápido sin modales

4. **Eliminar modal de selección:**
   - `PinStateModal` ya no se usa en flujo normal
   - Eliminar `showPinModal` state
   - Eliminar `handlePinStateSelect` (ya no necesario)

**Lógica:**
```typescript
const handlePinPress = () => {
  if (isPinned) {
    // Ya está pinned, eliminar pin
    unpinSpot(spot.id);
  } else {
    // No está pinned, pin directamente con to_visit (sin modal)
    pinSpot(spot.id, 'to_visit');
    // Mostrar feedback: "Pinned · To visit"
  }
};

const handlePinLongPress = () => {
  if (isPinned && pinState) {
    // Cambiar estado: to_visit ↔ visited
    const newState: PinState = pinState === 'to_visit' ? 'visited' : 'to_visit';
    changePinState(spot.id, newState);
    // Mostrar feedback: "Changed to Visited" / "Changed to To Visit"
  }
};
```

**Riesgos:** Medio (cambios en UI, requiere testing)

**Validación:**
- Botón "Pin" funciona correctamente
- Modal se muestra y permite seleccionar estado
- Indicador de estado se muestra correctamente
- Long press funciona

---

#### 2.3 Actualizar SpotDetail

**Archivo:** `app/spot-detail.tsx`

**Cambios:**

1. **Reemplazar botón Save:**
   - Similar a SpotMediaCard
   - Cambiar icono y función

2. **Agregar indicador de estado:**
   - Badge "To Visit" o "Visited" si está pinned

3. **Agregar botón "Mark as visited/to visit":**
   - Si está pinned, mostrar botón para cambiar estado
   - Texto: "Mark as visited" (si `to_visit`) o "Mark as to visit" (si `visited`)
   - Llamar `changePinState(spotId, newState)`

4. **Preparar estructura para notas (Fase 4):**
   - Comentar/placeholder para sección de notas
   - No implementar aún

**Riesgos:** Medio (cambios en pantalla principal)

**Validación:**
- Botón "Pin" funciona
- Indicador de estado se muestra
- Botón de cambio de estado funciona

---

#### 2.4 Actualizar SpotInlineCard (si existe)

**Archivo:** `components/SpotInlineCard.tsx`

**Cambios:**
- Similar a SpotMediaCard (versión simplificada)
- Reemplazar botón Save por Pin
- Indicador de estado (opcional, más discreto)

**Riesgos:** Bajo (componente secundario)

---

#### 2.5 Eliminar Referencias a Like (donde aplica)

**Archivos a revisar:**
- `app/flow-screen.tsx`
- `app/flow-full-player.tsx`
- `app/profile.tsx` (sección Liked Spots)
- Cualquier otro componente que use `toggleLikeSpot`

**Cambios:**
- Comentar o eliminar botones de "Like"
- Documentar en bitácora

**Riesgos:** Bajo (eliminar código)

**Nota:** Profile screen ya no debería tener sección "Liked Spots" según definición

---

#### 2.6 Validación de Autenticación para Pins (V1.2 - Regla de Negocio)

**Archivos:** `components/SpotMediaCard.tsx`, `app/spot-detail.tsx`

**Regla:** El usuario solo puede guardar pines cuando tiene una cuenta.

**Cambios:**

1. **Agregar validación en handlers de Pin:**
   - En `handlePinPress` de `SpotMediaCard.tsx`: Verificar `isAuthenticated` antes de permitir pin
   - En `handlePinPress` de `spot-detail.tsx`: Verificar `isAuthenticated` antes de permitir pin
   - Si no está autenticado: Mostrar `Alert` con opción de ir a login

2. **Implementar alerta de autenticación:**
   - Mensaje: "Debes iniciar sesión para guardar pines"
   - Opciones:
     - "Cancelar" (cerrar alerta)
     - "Iniciar sesión" (navegar a `/(tabs)/login`)

3. **Opcional - Deshabilitar visualmente:**
   - Botón de pin puede mostrarse deshabilitado cuando no está autenticado (opcional)
   - O simplemente mostrar alerta al intentar pin (recomendado)

**Lógica:**
```typescript
const handlePinPress = () => {
  // Validar autenticación
  if (!isAuthenticated) {
    Alert.alert(
      'Iniciar sesión requerido',
      'Debes iniciar sesión para guardar pines.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Iniciar sesión', 
          onPress: () => router.push('/(tabs)/login') 
        },
      ]
    );
    return;
  }

  // Lógica normal de pin
  if (isPinned) {
    unpinSpot(spot.id);
  } else {
    pinSpot(spot.id, 'to_visit');
  }
};
```

**Riesgos:** Bajo (validación simple)

**Validación:**
- Usuario no autenticado no puede pin
- Alerta se muestra correctamente
- Navegación a login funciona
- Usuario autenticado puede pin normalmente

---

### Testing de Fase 2

**Criterios de validación:**

1. ✅ Icono de Pin se muestra correctamente
2. ✅ Botón "Pin" funciona en SpotMediaCard
3. ✅ Primer pin = to_visit directamente (sin modal)
4. ✅ Micro-feedback se muestra ("Pinned · To visit")
5. ✅ Indicador de estado se muestra correctamente
6. ✅ Long press funciona (cambiar estado: to_visit ↔ visited)
7. ✅ SpotDetail muestra botón "Pin" correctamente
8. ✅ Botón "Mark as visited/to visit" funciona (si aplica)
9. ✅ SpotInlineCard actualizado (si aplica)
10. ✅ Validación de autenticación funciona (no autenticado no puede pin)
11. ✅ Alerta de login se muestra correctamente
12. ✅ Referencias a "Like" eliminadas

---

### Entregables Fase 2

- [ ] Icono de Pin agregado
- [ ] SpotMediaCard actualizado con Pin (comportamiento híbrido)
- [ ] SpotDetail actualizado con Pin (comportamiento híbrido)
- [ ] SpotInlineCard actualizado (si aplica)
- [ ] Validación de autenticación implementada
- [ ] Referencias a Like eliminadas
- [ ] Testing completado
- [ ] Bitácora actualizada

**Nota sobre ajustes UX (2026-01-11):**
- **Comportamiento híbrido:** Primer pin = `to_visit` directamente (sin modal), tap largo para cambiar estado
- **Validación de autenticación:** Usuario debe tener cuenta para guardar pines

---

## FASE 3: PINNED SCREEN

### Objetivo

Actualizar Saved Screen para mostrar Pins con filtrado por estado, implementar dos niveles de filtrado (tipo × estado).

### Archivos a Modificar

1. **`app/(tabs)/saved.tsx`**
   - Renombrar conceptualmente a "Pinned" (o mantener "Saved")
   - Agregar sub-filtro de estado de Pin
   - Actualizar lógica de filtrado
   - Actualizar visualización de Pins

2. **`components/ui/SavedFilterHeader.tsx`**
   - Mantener filtros actuales (Spots | Flows | All)
   - No modificar (solo mantener)

3. **Nuevo componente:** `components/ui/PinStateFilter.tsx` (o similar)
   - Componente para filtro de estado de Pin
   - Opciones: "All" | "To Visit" | "Visited"

### Pasos Detallados

#### 3.1 Crear Componente PinStateFilter

**Archivo:** `components/ui/PinStateFilter.tsx` (nuevo)

**Funcionalidad:**
- Tabs o selector para estado de Pin
- Opciones: "All" | "To Visit" | "Visited"
- Similar a SavedFilterHeader pero para estados

**Props:**
```typescript
interface PinStateFilterProps {
  currentFilter: 'all' | 'to_visit' | 'visited';
  onFilterChange: (filter: 'all' | 'to_visit' | 'visited') => void;
}
```

**Riesgos:** Bajo (componente nuevo)

**Validación:** Componente se renderiza y funciona correctamente

---

#### 3.2 Actualizar Saved Screen

**Archivo:** `app/(tabs)/saved.tsx`

**Cambios:**

1. **Agregar estado de filtro de Pin:**
   ```typescript
   const [pinStateFilter, setPinStateFilter] = useState<'all' | 'to_visit' | 'visited'>('all');
   ```

2. **Actualizar lógica de filtrado:**
   - Combinar filtro de tipo (Spots/Flows/All) con filtro de estado (All/To Visit/Visited)
   - Para Spots: Filtrar por `getPinnedSpots(pinStateFilter)`
   - Para Flows: Mantener lógica actual (no afectado por estado de Pin)

3. **Actualizar visualización:**
   - Mostrar PinStateFilter debajo de SavedFilterHeader
   - Mostrar Pins filtrados según ambos filtros

4. **Agregar acción de cambio de estado:**
   - En cards, permitir cambio rápido de estado
   - Botón pequeño o acción contextual

**Lógica de filtrado:**
```typescript
// Obtener Pins según filtro de estado
const pinnedSpots = getPinnedSpots(pinStateFilter === 'all' ? undefined : pinStateFilter);

// Filtrar por tipo
const filteredSpots = currentFilter === 'all' || currentFilter === 'spots'
  ? spots.filter(spot => pinnedSpots.includes(spot.id))
  : [];

const filteredFlows = currentFilter === 'all' || currentFilter === 'flows'
  ? savedFlowsData
  : [];
```

**Riesgos:** Medio (lógica de filtrado compleja)

**Validación:**
- Filtros funcionan correctamente
- Combinación de filtros funciona
- Visualización muestra datos correctos

---

#### 3.3 Actualizar Header (Opcional)

**Archivo:** `app/(tabs)/saved.tsx`

**Cambios:**
- Título: Mantener "Saved" en UI (pero conceptualmente es "Pinned")
- O cambiar a "Pinned" si se decide

**Decisión pendiente:** Mantener "Saved" o cambiar a "Pinned" en UI

**Riesgos:** Bajo (solo texto)

---

### Testing de Fase 3

**Criterios de validación:**

1. ✅ PinStateFilter se muestra correctamente
2. ✅ Filtrado por estado funciona
3. ✅ Combinación de filtros (tipo × estado) funciona
4. ✅ Visualización muestra Pins correctos
5. ✅ Cambio de estado desde cards funciona
6. ✅ Flows no se ven afectados por filtro de estado

---

### Entregables Fase 3

- [ ] Componente PinStateFilter creado
- [ ] Saved Screen actualizado con filtrado
- [ ] Lógica de filtrado implementada y funcionando
- [ ] Testing completado
- [ ] Bitácora actualizada

---

## FASE 4: DIARIO DE VIAJE

### Objetivo

Implementar funcionalidad de notas y fotos personales para Pins con estado `visited`.

### Archivos a Modificar

1. **`contexts/SavedContext.tsx`**
   - Agregar funciones: `updatePinNotes`, `addPinPhoto`, `removePinPhoto`

2. **`app/spot-detail.tsx`**
   - Agregar sección "Personal Notes"
   - Agregar botón "Add Notes" / "Edit Notes"
   - Agregar editor de notas
   - Agregar botón "Add Photos"
   - Agregar galería de fotos personales

3. **Utils de imágenes** (si necesario)
   - Funciones para manejar fotos personales

### Pasos Detallados

#### 4.1 Agregar Funciones de Diario en SavedContext

**Archivo:** `contexts/SavedContext.tsx`

**Funciones:**

1. `updatePinNotes(spotId: string, notes: string): void`
   - Actualiza campo `notes` del Pin
   - Solo si Pin existe y `state === 'visited'`

2. `addPinPhoto(spotId: string, photoUrl: string): void`
   - Agrega foto a `personalPhotos` array
   - Solo si Pin existe y `state === 'visited'`

3. `removePinPhoto(spotId: string, photoUrl: string): void`
   - Elimina foto de `personalPhotos` array

**Riesgos:** Bajo (funciones simples)

**Validación:** Funciones funcionan correctamente

---

#### 4.2 Implementar Editor de Notas

**Archivo:** `app/spot-detail.tsx`

**Cambios:**

1. **Agregar sección "Personal Notes":**
   - Solo mostrar si Pin existe y `state === 'visited'`
   - Mostrar notas existentes (si hay)
   - Botón "Add Notes" (si no hay notas) o "Edit Notes" (si hay)

2. **Implementar editor:**
   - Componente TextInput multilínea
   - No modal bloqueante (inline o drawer)
   - Sin límite de caracteres
   - Guardar automáticamente o con botón "Save"

**Riesgos:** Medio (UI nueva)

**Validación:**
- Editor funciona correctamente
- Notas se guardan y cargan
- Sin límite de caracteres funciona

---

#### 4.3 Implementar Galería de Fotos

**Archivo:** `app/spot-detail.tsx`

**Cambios:**

1. **Agregar botón "Add Photos":**
   - Solo mostrar si Pin existe y `state === 'visited'`
   - Usar ImagePicker de Expo

2. **Galería de fotos:**
   - Mostrar fotos personales en grid
   - Permitir eliminar fotos
   - Scroll horizontal o grid

**Nota:** Implementación de almacenamiento de fotos (local o cloud) a definir

**Riesgos:** Alto (manejo de imágenes, almacenamiento)

**Mitigación:**
- Usar AsyncStorage para URLs/paths temporalmente
- Implementación simple primero, mejoras después

**Validación:**
- Agregar fotos funciona
- Galería muestra fotos
- Eliminar fotos funciona

---

#### 4.4 Exportar/Compartir (Feature Premium - Futuro)

**Archivo:** `app/spot-detail.tsx`

**Nota:** Esta funcionalidad se define pero NO se implementa en V1.2. Se marca como feature premium para futuro.

**Placeholder:**
- Comentar código para futuro
- Documentar en bitácora

---

### Testing de Fase 4

**Criterios de validación:**

1. ✅ Funciones de diario funcionan
2. ✅ Editor de notas funciona
3. ✅ Galería de fotos funciona
4. ✅ Notas y fotos persisten
5. ✅ Solo se muestra si Pin tiene estado `visited`

---

### Entregables Fase 4

- [ ] Funciones de diario implementadas
- [ ] Editor de notas implementado
- [ ] Galería de fotos implementada
- [ ] Testing completado
- [ ] Bitácora actualizada

---

## FASE 5: COMPARTIR Y MAPA

### Objetivo

Implementar funcionalidad de compartir mapas de Pins y actualizar Map Screen con tres tipos de markers.

### Archivos a Modificar

1. **`components/MapView.tsx`** / **`components/MapboxViewWeb.tsx`**
   - Implementar tres tipos de markers
   - Implementar filtro de estado en mapa
   - Implementar lógica de reemplazo de markers

2. **`app/(tabs)/map.tsx`**
   - Agregar menú de filtro de estado
   - Agregar botón de compartir

3. **Utils de compartir** (nuevo)
   - Funciones para compartir mapa (imagen, JSON, etc.)

### Pasos Detallados

#### 5.1 Implementar Tres Tipos de Markers

**Archivo:** `components/MapView.tsx` / `components/MapboxViewWeb.tsx`

**Cambios:**

1. **Lógica de tipo de marker:**
   - Si usuario tiene Pin: Mostrar marker de Pin (azul o verde)
   - Si no tiene Pin: Mostrar marker normal

2. **Estilos de markers:**
   - Normal: Estilo actual
   - Pin To Visit: Azul, icono de pin
   - Pin Visited: Verde, icono de check/pin con check

3. **Reemplazo de markers:**
   - Un Spot solo muestra UN marker
   - Prioridad: Pin marker > Normal marker

**Riesgos:** Medio (cambios en mapa)

**Validación:**
- Tres tipos de markers se muestran correctamente
- Reemplazo funciona correctamente

---

#### 5.2 Implementar Filtro en Mapa

**Archivo:** `app/(tabs)/map.tsx`

**Cambios:**

1. **Agregar menú de filtro:**
   - Opciones: "All" | "To Visit" | "Visited" | "None"
   - Ubicación: Parte superior del mapa

2. **Lógica de filtrado:**
   - Filtrar markers visibles según estado seleccionado
   - "None": Solo markers normales (sin Pin)
   - "To Visit": Solo markers azules
   - "Visited": Solo markers verdes
   - "All": Todos los markers

**Riesgos:** Medio (filtrado en mapa)

**Validación:**
- Filtro funciona correctamente
- Markers se ocultan/muestran según filtro

---

#### 5.3 Implementar Compartir

**Archivos:** `app/(tabs)/map.tsx`, `app/(tabs)/saved.tsx`

**Funcionalidad:**

1. **Compartir mapa de Pins:**
   - Botón "Share" en header
   - Opciones: Imagen, JSON, etc.
   - Usar React Native Share API

2. **Compartir Flows:**
   - Similar, desde Saved/Pinned screen

**Riesgos:** Bajo (compartir es simple)

**Validación:**
- Compartir funciona correctamente

---

### Testing de Fase 5

**Criterios de validación:**

1. ✅ Tres tipos de markers funcionan
2. ✅ Filtro en mapa funciona
3. ✅ Compartir funciona
4. ✅ Reemplazo de markers funciona

---

### Entregables Fase 5

- [ ] Tres tipos de markers implementados
- [ ] Filtro en mapa implementado
- [ ] Funcionalidad de compartir implementada
- [ ] Testing completado
- [ ] Bitácora actualizada

---

## FASE 6: LIMPIEZA Y ELIMINACIÓN

### Objetivo

Eliminar código antiguo, funciones deprecadas, y campos obsoletos después de validar migración completa.

### Archivos a Modificar

1. **`contexts/SavedContext.tsx`**
   - Eliminar campos `savedSpots`, `likedSpots`, `likedSpotsFromPlayer`
   - Eliminar funciones `toggleLikeSpot`, `toggleSaveSpot`, `isSpotLiked`, `isSpotSaved`
   - Limpiar código de migración (opcional)

2. **Cualquier otro archivo**
   - Eliminar imports no usados
   - Limpiar código comentado

### Pasos Detallados

#### 6.1 Validar Migración Completa

**Criterio:**
- Todos los usuarios han migrado (o tiempo suficiente ha pasado)
- No hay referencias a funciones antiguas en código

**Validación:**
- Buscar todas las referencias a funciones deprecadas
- Verificar que no se usan

---

#### 6.2 Eliminar Código Obsoleto

**Archivo:** `contexts/SavedContext.tsx`

**Cambios:**
- Eliminar campos de `SavedData`
- Eliminar funciones de `SavedContextType`
- Eliminar implementaciones
- Eliminar código de migración (opcional)

**Riesgos:** Alto (eliminación de código)

**Mitigación:**
- Solo después de validación completa
- Hacer commit separado
- Mantener backup

---

#### 6.3 Limpieza General

**Archivos:**
- Buscar imports no usados
- Eliminar código comentado
- Actualizar documentación

---

### Entregables Fase 6

- [ ] Código obsoleto eliminado
- [ ] Limpieza completada
- [ ] Testing final completado
- [ ] Bitácora actualizada

---

## RESUMEN DE ARCHIVOS A MODIFICAR

### Fase 1: Modelo de Datos
- `contexts/SavedContext.tsx` (principal)

### Fase 2: UI - Botones y Acciones
- `components/ui/Icon.tsx`
- `components/SpotMediaCard.tsx`
- `components/SpotInlineCard.tsx`
- `app/spot-detail.tsx`
- `app/flow-screen.tsx` (si aplica)
- `app/profile.tsx` (eliminar Liked Spots)

### Fase 3: Pinned Screen
- `app/(tabs)/saved.tsx`
- `components/ui/PinStateFilter.tsx` (nuevo)

### Fase 4: Diario de Viaje
- `contexts/SavedContext.tsx` (funciones adicionales)
- `app/spot-detail.tsx` (sección de notas)

### Fase 5: Compartir y Mapa
- `components/MapView.tsx` / `components/MapboxViewWeb.tsx`
- `app/(tabs)/map.tsx`
- Utils de compartir (nuevo)

### Fase 6: Limpieza
- `contexts/SavedContext.tsx`
- Varios archivos (limpieza)

---

## DECISIONES TÉCNICAS

### Serialización de Fechas

**Decisión:** Usar ISO strings en AsyncStorage, convertir a Date objects al cargar.

**Razón:** AsyncStorage no soporta Date objects directamente.

**Implementación:**
```typescript
// Al guardar
JSON.stringify(data, (key, value) => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
});

// Al cargar
parsed.pins = Object.values(parsed.pins).map(pin => ({
  ...pin,
  pinnedAt: new Date(pin.pinnedAt),
  visitedAt: pin.visitedAt ? new Date(pin.visitedAt) : undefined,
}));
```

---

### Migración de Datos

**Decisión:** Migración automática en `loadData()`, con flag para evitar múltiples ejecuciones.

**Razón:** Transición suave, sin pérdida de datos.

**Flag:** `_migrationV1_2Completed: boolean`

---

### Almacenamiento de Fotos

**Decisión:** Implementación inicial simple (URLs en AsyncStorage), mejoras futuras.

**Razón:** Completar funcionalidad básica primero, optimizar después.

**Futuro:** Almacenamiento en cloud (Firebase, S3, etc.)

---

## RIESGOS Y MITIGACIÓN

### Riesgos Altos

1. **Migración de datos:**
   - Riesgo: Pérdida de datos
   - Mitigación: Backup, migración idempotente, testing exhaustivo

2. **Almacenamiento de fotos:**
   - Riesgo: Implementación compleja
   - Mitigación: Implementación simple primero, mejoras después

### Riesgos Medianos

1. **Cambios en UI:**
   - Riesgo: Confusión de usuarios
   - Mitigación: Testing UX, transición gradual

2. **Filtrado complejo:**
   - Riesgo: Bugs en lógica
   - Mitigación: Testing exhaustivo, casos edge

### Riesgos Bajos

1. **Cambios en componentes:**
   - Riesgo: Bugs menores
   - Mitigación: Testing, revisión de código

---

## CRITERIOS DE VALIDACIÓN GENERALES

### Por Fase

- ✅ Código compila sin errores
- ✅ Funcionalidad funciona correctamente
- ✅ Datos persisten correctamente
- ✅ Testing manual completado
- ✅ Bitácora actualizada

### Final

- ✅ Todas las fases completadas
- ✅ Migración de datos exitosa
- ✅ UI actualizada completamente
- ✅ Funcionalidad completa funcionando
- ✅ Código obsoleto eliminado
- ✅ Documentación completa

---

## NOTAS IMPORTANTES

1. **Comentarios en código:** Documentar decisiones importantes
2. **Commits incrementales:** Hacer commits después de cada paso importante
3. **Testing continuo:** Validar cada cambio antes de continuar
4. **Bitácora:** Actualizar después de cada fase
5. **Reversibilidad:** Mantener posibilidad de rollback en cada fase

---

**Última actualización:** 2026-01-11  
**Estado:** Plan completo, listo para implementación