# FLOWYA V2.0 - Fuente Única de Verdad

**Versión:** 2.0  
**Fecha:** 2024-12-20  
**Estado:** ✅ Arquitectura V2.0 completada

---

## PROPÓSITO DE ESTE DOCUMENTO

Este documento es la **fuente única de verdad** para FLOWYA V2.0. Consolida:
- Definición de producto
- Arquitectura canónica
- Reglas no negociables
- Decisiones técnicas
- Estado actual del sistema

**Uso:** Referencia definitiva para desarrollo, decisiones arquitectónicas y mantenimiento.

---

## DOCUMENTOS CANÓNICOS

### Product Definition
- **`FLOWYA Product Definition V2.0.md`** - Definición completa del producto, entidades, pantallas, reglas de diseño

### Arquitectura
- **`RECONSTRUCCION_ARQUITECTONICA_V2.md`** - Diagnóstico, arquitectura canónica propuesta, plan de reconstrucción
- **`SCOPE_0-5_COMPLETADO.md`** - Estado de implementación de la reconstrucción arquitectónica

### Análisis Funcional
- **`ANALISIS_ESTADO_ACTUAL_SPOTS_SISTEM.md`** - Estado actual del sistema de spots
- **`ANALISIS_FUNCIONAL_CARGA_Y_RENDER.md`** - Manejo de carga, skeletons, renderizado
- **`ANALISIS_FUNCIONAL_CREACION_EDICION_SPOTS.md`** - Flujos de creación y edición

---

## PRINCIPIOS NO NEGOCIABLES

### Principio Rector del Producto

> En FLOWYA no se empieza creando contenido.  
> Se empieza moviéndose y señalando el mundo.

**Implicaciones:**
- FLOWYA NO es un CMS
- FLOWYA NO es un editor tradicional
- FLOWYA NO es un CRUD
- FLOWYA es un sistema basado en movimiento, contexto y descubrimimiento

### Principios Arquitectónicos V2.0

1. **Fuente Única de Verdad**
   - Ubicación: `LocationProvider` centralizado
   - Preparación de datos: Funciones puras en `utils/dataPreparation.ts`
   - Tipos: Centralizados y reutilizables

2. **Separación Estricta de Capas**
   - Sistema → Preparación → UI
   - Cada capa tiene responsabilidades claras
   - Sin acoplamiento indebido

3. **Componentes Visuales Son "Tontos"**
   - Reciben datos preparados
   - NO calculan distancias
   - NO obtienen ubicación
   - Solo renderizan

4. **Skeleton = Visual, Sin Lógica**
   - Componentes puramente visuales
   - Se muestran mientras `isLoading === true`
   - Transición suave skeleton → contenido

5. **Preparación de Datos Fuera de Componentes**
   - Funciones puras
   - Memoizadas correctamente
   - Testeables

---

## ARQUITECTURA CANÓNICA

### Capa de Sistema

**LocationProvider** (`contexts/LocationContext.tsx`)
- Fuente única de verdad para ubicación del usuario
- Carga ubicación UNA SOLA VEZ al montar
- Ubicación congelada durante sesión
- Hook canónico: `useBaseLocation()`

**Contextos de Datos:**
- `SpotContext` - Gestión de spots
- `PathContext` - Gestión de flows/paths
- `SavedContext` - Memoria personal del usuario
- `FlowContext` - Estado activo de flow
- `NarrationContext` - Sistema de narraciones
- `AuthContext` - Autenticación
- `OverlayContext` - Control de overlays
- `RegionContext` - Gestión de región activa en Home

### Capa de Preparación

**Funciones Puras** (`utils/dataPreparation.ts`)
- `prepareHomeData()` - Prepara datos para Home Screen
  - Usa `getAvailableRegionsFromSpots()` y `getSpotsByRegion()` desde `core/region`
  - Secciones globales (`maybeYouLikeSpots`, `newSpots`) usan TODOS los spots (no `filteredSpots`)
- Tipos: `SpotWithDistance`, `FlowWithDistance`, `HomeData`, `BaseLocation`
- Funciones memoizables y testeables

**Funciones de Regiones** (`core/region/`)
- `getAvailableRegionsFromSpots()` - Obtiene regiones disponibles desde spots (deduplicación canónica por `regionId`)
- `getSpotsByRegion()` - Filtra spots por región usando `regionId` canónico
- `resolveRegion()` - Resuelve región desde coordenadas usando Mapbox

**Selectores:**
- `getSpotDistance()` - Selector puro para calcular distancia
- `useSpotsWithDistance()` - Hook para múltiples spots

### Capa de UI

**Pantallas:**
- `app/(tabs)/home.tsx` - Home Screen
- `app/(tabs)/map.tsx` - Map Screen
- `app/(tabs)/saved.tsx` - Saved Screen
- `app/(tabs)/search.tsx` - Search Screen
- `app/spot-detail.tsx` - Spot Detail
- `app/flow-detail.tsx` - Flow Detail
- `app/flow-screen.tsx` - Flow Screen

**Componentes Canónicos:**
- `components/ui/InfoMeta.tsx` - InfoMeta (chip, distance, rating)
- `components/SpotMediaCard.tsx` - Card con imagen
- `components/SpotInlineCard.tsx` - Card sin imagen
- `components/FlowCard.tsx` - Card de flow

---

## REGLAS ARQUITECTÓNICAS ESTABLECIDAS

### Regla 1: Ubicación es Fuente Única de Verdad

**✅ CORRECTO:**
```typescript
const { baseLocation, isLoading } = useBaseLocation();
```

**❌ INCORRECTO:**
```typescript
const location = await Location.getCurrentPositionAsync(); // NO HACER ESTO
```

**Implementación:**
- `LocationProvider` en `_layout.tsx`
- Hook `useBaseLocation()` consume el provider
- Todas las pantallas usan el mismo hook

### Regla 2: Distancia es Dato Derivado

**✅ CORRECTO:**
```typescript
// En preparación de datos
const distance = getSpotDistance(spot, baseLocation);

// En componente
<SpotMediaCard spot={spot} distance={distance} />
```

**❌ INCORRECTO:**
```typescript
// Dentro de una card
const distance = calculateDistance(spot, userLocation); // NO HACER ESTO
```

**Implementación:**
- Distancia calculada en `prepareHomeData()` o funciones de preparación
- Pasada como prop a cards
- Cards NO calculan distancia

### Regla 3: Skeleton = Visual, Sin Lógica

**✅ CORRECTO:**
```typescript
if (shouldShowSkeleton(isLoading, hasData)) {
  return <SkeletonList count={10} />;
}
```

**❌ INCORRECTO:**
```typescript
// Skeleton con dependencias de datos
<SkeletonCard data={spots} /> // NO HACER ESTO
```

**Implementación:**
- Skeletons a nivel de lista/container
- Mostrados mientras `isLoading === true`
- Transición suave skeleton → contenido

### Regla 4: Componentes Visuales Son "Tontos"

**✅ CORRECTO:**
```typescript
function SpotMediaCard({ spot, distance, onPress }) {
  // Solo renderiza, no calcula, no obtiene ubicación
  return <View>...</View>;
}
```

**❌ INCORRECTO:**
```typescript
function SpotMediaCard({ spot }) {
  const location = useBaseLocation(); // NO HACER ESTO
  const distance = calculateDistance(spot, location); // NO HACER ESTO
  return <View>...</View>;
}
```

**Implementación:**
- Cards reciben datos preparados
- Cards reciben distancia como prop
- Cards solo renderizan

### Regla 5: Preparación de Datos Fuera de Componentes

**✅ CORRECTO:**
```typescript
// utils/dataPreparation.ts
export function prepareHomeData(...) {
  // Función pura, fuera de componente
}

// En componente
const homeData = useMemo(() => {
  return prepareHomeData(spots, flows, baseLocation, ...);
}, [spots, flows, baseLocation, ...]);
```

**❌ INCORRECTO:**
```typescript
// Dentro de componente
function HomeScreen() {
  const preparedData = spots.map(spot => {
    // Lógica de preparación dentro del componente
  });
}
```

**Implementación:**
- Funciones puras en `utils/dataPreparation.ts`
- Memoizadas con `useMemo`
- Dependencias claras

### Regla 6: Regiones Canónicas

**✅ CORRECTO:**
```typescript
// En capa de preparación
const availableRegions = getAvailableRegionsFromSpots(spots);
const filteredSpots = getSpotsByRegion(spots, selectedRegionId);

// En UI
<RegionHeader availableRegions={availableRegions} />
```

**❌ INCORRECTO:**
```typescript
// Lógica de deduplicación en componente visual
const uniqueRegions = regions.filter((r, i) => 
  regions.findIndex(r2 => r2.label === r.label) === i
); // NO HACER ESTO

// Intentar arreglar spots inconsistentes
if (!spot.locationRegion) {
  spot.locationRegion = { label: 'Unknown' }; // NO HACER ESTO
}
```

**Implementación:**
- Regiones se preparan en capa de preparación (`core/region/getAvailableRegionsFromSpots`)
- UI solo renderiza listas ya normalizadas
- NO hay lógica de deduplicación en componentes visuales
- Spots fallidos o inconsistentes: Se eliminan automáticamente (no se intentan arreglar, no generan fallback ni warnings visuales)
- Deduplicación canónica por `regionId` (nunca por label o strings libres)

---

## COMPONENTES CANÓNICOS

### InfoMeta

**Props:**
```typescript
interface InfoMetaProps {
  chip?: { label: string };
  distance?: number; // En metros
  rating?: { value: number; count?: number };
  size?: 'large' | 'small';
}
```

**NO incluye:**
- ❌ `duration` (eliminado en V2.0)

**Responsabilidad:**
- Renderizar información secundaria debajo de títulos
- Mantener jerarquía clara y consistente

**Uso:**
```typescript
<InfoMeta
  chip={{ label: 'Beach' }}
  distance={1250}
  rating={{ value: 4.8, count: 128 }}
  size="large"
/>
```

### SpotMediaCard

**Props:**
```typescript
interface SpotMediaCardProps {
  spot: Spot;
  onPress?: () => void;
  distance?: number; // Pre-calculada, NO calcula internamente
  rating?: { value: number; count?: number };
  size?: 'large' | 'small';
}
```

**Responsabilidad:**
- Renderizar card con imagen
- Mostrar información del spot
- NO calcular distancia
- NO obtener ubicación

### SpotInlineCard

**Props:**
```typescript
interface SpotInlineCardProps {
  spot: Spot;
  onPress?: () => void;
  distance?: number; // Pre-calculada, NO calcula internamente
  state?: 'active' | 'next' | 'add' | 'default';
  // ... otros props
}
```

**Responsabilidad:**
- Renderizar card sin imagen
- Mostrar información del spot
- NO calcular distancia
- NO obtener ubicación

### FlowCard

**Props:**
```typescript
interface FlowCardDisplayProps {
  flow: Flow;
  spots: Spot[];
  onPress?: () => void;
  distance?: number; // Pre-calculada
  customName?: string;
}
```

**Responsabilidad:**
- Renderizar card de flow
- Mostrar información del flow
- NO calcular distancia
- NO obtener ubicación

**InfoMeta en FlowCard:**
```typescript
<InfoMeta
  chip={{ label: movementModeLabel }}
  distance={calculatedDistance}
  size="large"
/>
```

**Nota:** NO pasa `duration` a InfoMeta (eliminado en V2.0)

---

## HOME CANÓNICO

Home está funcionalmente correcto y validado. Este estado debe considerarse **canónico** para FLOWYA V2.0.

### Reglas de Regiones

**Deduplicación Canónica:**
- Regiones NO se duplican (deduplicación por `regionId` canónico)
- Se muestran regiones únicas
- Un `regionId` = una opción en el dropdown (nunca por label o strings libres)

**Nivel de Región:**
- Preferir capital/ciudad principal (`place` tipo Mapbox)
- Fallback a nivel administrativo inferior consistente (`region` tipo Mapbox)
- NO mezclar niveles (no mostrar `country` ni `locality`)

**Dropdown de Regiones:**
- Incluye siempre: "Current location" (primera opción), "All regions", regiones disponibles
- Hace scroll interno cuando el contenido excede altura máxima (65% del viewport)
- Nunca desborda el contenedor
- Nunca renderiza duplicados

### Comportamiento de "Current location"

**¿Qué es?**
- Opción en el dropdown que restaura la ubicación real del usuario
- Región dinámica, dependiente del movimiento del usuario

**¿Qué hace?**
- Restaura `baseLocation` del `LocationProvider`
- Resuelve región vía `RegionResolver` (Mapbox) desde `RegionContext`
- NO recalcula regiones manualmente
- NO dispara migraciones
- NO usa Google Maps internamente (solo externamente cuando usuario selecciona "Get directions")

**¿Qué NO hace?**
- NO guarda `regionId` fijo
- NO persiste como región manual
- Siempre representa "donde está el usuario ahora"

**Diferencia con región manual:**
- **Current location**: Región dinámica, siempre actualizada cuando cambia `baseLocation`
- **Región manual** (ej. "Barcelona"): Región fija, no se actualiza automáticamente

### Secciones Globales (No dependientes de región)

**Maybe You Like:**
- Spots estrella a nivel mundial
- No dependen de ubicación ni región
- Curaduría global
- Usa TODOS los spots (no filtrados por región)

**New Spots:**
- Spots recién agregados
- Ordenados por fecha (`createdAt` DESC)
- Globales, no filtrados por región
- Usa TODOS los spots (no filtrados por región)

**Reglas de secciones globales:**
- Siempre se muestran
- No desaparecen por filtros regionales
- No se recalculan por ubicación
- Independientes del `selectedRegionId`

### Reglas de Datos

**Preparación de Regiones:**
- Regiones se preparan en capa de preparación (`core/region/getAvailableRegionsFromSpots`)
- `prepareHomeData()` usa `getAvailableRegionsFromSpots()` y `getSpotsByRegion()` desde `core/region`
- UI solo renderiza listas ya normalizadas

**Spots Inconsistentes:**
- Spots fallidos o inconsistentes: Se eliminan automáticamente
- NO se intentan "arreglar"
- NO generan fallback ni warnings visuales
- El sistema prioriza consistencia sobre preservación de datos corruptos

---

## SISTEMA DE UBICACIÓN

### LocationProvider

**Ubicación:** `contexts/LocationContext.tsx`

**Responsabilidad:**
- Cargar ubicación UNA SOLA VEZ al montar
- Mantener ubicación congelada durante sesión
- Proporcionar función de refresh manual

**API:**
```typescript
interface LocationContextType {
  baseLocation: BaseLocation | null;
  isLoading: boolean;
  refreshLocation: () => Promise<void>;
}
```

**Uso:**
```typescript
const { baseLocation, isLoading, refreshLocation } = useBaseLocation();
```

### Hook Canónico

**Ubicación:** `hooks/useBaseLocation.ts`

**Implementación:**
- Consume `LocationProvider`
- Re-exporta tipos desde context
- API compatible con versión anterior

**Regla:** TODAS las pantallas deben usar `useBaseLocation()`, nunca llamar Location API directamente.

### RegionContext

**Ubicación:** `contexts/RegionContext.tsx`

**Responsabilidad:**
- Gestión de región activa en Home usando `regionId` canónico
- Mantiene `selectedRegionId` (string | null)
- Gestiona estado "Current location" (`isCurrentLocation`)
- Resuelve región desde `baseLocation` usando `RegionResolver` (Mapbox)

**API:**
```typescript
interface RegionContextType {
  selectedRegionId: string | null;
  currentRegionLabel: string | null;
  setSelectedRegionId: (regionId: string | null) => Promise<void>;
  setCurrentLocation: () => Promise<void>;
  isCurrentLocation: boolean;
  isLoading: boolean;
}
```

**Uso:**
```typescript
const { 
  selectedRegionId, 
  currentRegionLabel, 
  setSelectedRegionId, 
  setCurrentLocation, 
  isCurrentLocation 
} = useRegion();
```

---

## PREPARACIÓN DE DATOS

### Funciones Puras

**Ubicación:** `utils/dataPreparation.ts`

**Funciones:**
- `prepareHomeData()` - Prepara datos para Home Screen
- Tipos: `SpotWithDistance`, `FlowWithDistance`, `HomeData`, `BaseLocation`
- `emptyHomeData` - Datos vacíos para carga inicial

**Características:**
- Funciones puras (sin side-effects)
- Memoizables
- Testeables
- Fuera de componentes

**Uso:**
```typescript
const homeData = useMemo(() => {
  if (isLoading) return emptyHomeData;
  return prepareHomeData(
    spots, 
    flows, 
    baseLocation, 
    likedSpots, 
    savedSpots, 
    selectedRegionId
  );
}, [spots, flows, baseLocation, likedSpots, savedSpots, selectedRegionId, isLoading]);
```

**Nota importante:**
- `prepareHomeData()` usa `getAvailableRegionsFromSpots()` y `getSpotsByRegion()` desde `core/region`
- Secciones globales (`maybeYouLikeSpots`, `newSpots`) usan TODOS los spots (no `filteredSpots`)
- Solo secciones regionales usan `filteredSpots` (Nearby, For You, Recommended, Nearby Flows)

### Selectores

**getSpotDistance** (`hooks/useSpotDistance.ts`)
- Selector puro para calcular distancia
- NO es hook, es función pura
- Memoizada correctamente

**useSpotsWithDistance** (`hooks/useSpotsWithDistance.ts`)
- Hook para calcular distancias de múltiples spots
- Retorna array memoizado de `SpotWithDistance`

---

## ESTADOS DE CARGA

### Skeleton Loaders

**Componentes:**
- `SkeletonBlock` - Base genérico
- `SkeletonImage` - Para imágenes
- `SkeletonText` - Para texto
- `SkeletonCard` - Para cards
- `SkeletonList` - Para listas

**Características:**
- Componentes puramente visuales
- Sin dependencias de datos
- Usan tokens del Design System

### Helpers de Carga

**Ubicación:** `utils/loadingHelpers.ts`

**Funciones:**
- `shouldShowSkeleton(isLoading, hasData)` - Determina si mostrar skeleton
- `shouldShowEmpty(isLoading, hasData)` - Determina si mostrar empty state
- `shouldShowContent(isLoading, hasData)` - Determina si mostrar contenido
- `anyLoading(...loadingStates)` - Combina múltiples estados
- `renderContentSkeletonOrEmpty()` - Renderiza condicionalmente

**Patrón de Uso:**
```typescript
const isLoading = anyLoading(locationLoading, spotsLoading, pathsLoading);

if (shouldShowSkeleton(isLoading, hasData)) {
  return <SkeletonList count={10} />;
}

if (shouldShowEmpty(isLoading, hasData)) {
  return <EmptyState />;
}

return <Content data={preparedData} />;
```

---

## TIPOS CENTRALIZADOS

### BaseLocation

**Ubicación:** `contexts/LocationContext.tsx`

```typescript
export interface BaseLocation {
  latitude: number;
  longitude: number;
}
```

**Uso:** Fuente única de verdad para tipo de ubicación. Todos los archivos importan desde aquí.

### SpotWithDistance

**Ubicación:** `utils/dataPreparation.ts`

```typescript
export interface SpotWithDistance {
  spot: Spot;
  distance?: number; // Pre-calculada, estable
}
```

**Uso:** Tipo canónico para spots con distancia pre-calculada.

### FlowWithDistance

**Ubicación:** `utils/dataPreparation.ts`

```typescript
export interface FlowWithDistance {
  flow: Flow;
  distance?: number; // Pre-calculada, estable
}
```

**Uso:** Tipo canónico para flows con distancia pre-calculada.

### HomeData

**Ubicación:** `utils/dataPreparation.ts`

```typescript
export interface HomeData {
  nearbySpots: SpotWithDistance[];
  forYouSpots: SpotWithDistance[];
  recommendedSpots: SpotWithDistance[];
  maybeYouLikeSpots: SpotWithDistance[];
  newSpots: SpotWithDistance[];
  nearbyFlows: FlowWithDistance[];
}
```

**Uso:** Tipo canónico para datos preparados de Home Screen.

---

## DECISIONES ARQUITECTÓNICAS V2.0

### Eliminación de Duration de InfoMeta

**Decisión:** Eliminar completamente `duration` del componente `InfoMeta`.

**Razón:** Simplificación arquitectónica y alineación con principios de diseño.

**Cambios:**
- `InfoMeta` ahora solo maneja `chip`, `distance`, `rating`
- `FlowCard` no pasa `duration` a `InfoMeta`
- `flow-detail` no pasa `duration` a `InfoMeta`
- Documentación actualizada

**Estado:** ✅ Completado

### LocationProvider Centralizado

**Decisión:** Crear `LocationProvider` como fuente única de verdad para ubicación.

**Razón:** Evitar múltiples llamadas a Location API, garantizar consistencia.

**Implementación:**
- Provider en `_layout.tsx`
- Hook `useBaseLocation()` consume el provider
- Todas las pantallas usan el mismo hook

**Estado:** ✅ Completado

### Preparación de Datos Centralizada

**Decisión:** Mover lógica de preparación a `utils/dataPreparation.ts`.

**Razón:** Separar lógica de negocio de UI, facilitar testing, mejorar mantenibilidad.

**Implementación:**
- `prepareHomeData()` movida a `dataPreparation.ts`
- Funciones puras, memoizables
- Tipos centralizados

**Estado:** ✅ Completado

### Skeleton Loaders Consistentes

**Decisión:** Implementar skeleton loaders en todas las pantallas durante carga inicial.

**Razón:** Eliminar parpadeo, mejorar UX, feedback visual consistente.

**Implementación:**
- Helpers de carga creados
- Pantallas verifican `isLoading` antes de renderizar
- Skeletons se muestran mientras `isLoading === true`

**Estado:** ✅ Completado

---

## VERIFICACIÓN DE CUMPLIMIENTO

### Checklist Arquitectónico

**Ubicación:**
- ✅ Todas las pantallas usan `useBaseLocation()`
- ✅ No hay llamadas directas a Location API
- ✅ `LocationProvider` en `_layout.tsx`

**Distancias:**
- ✅ Distancias calculadas en preparación de datos
- ✅ Cards reciben `distance` como prop
- ✅ Cards NO calculan distancia internamente

**Skeletons:**
- ✅ Skeletons se muestran durante carga inicial
- ✅ Transición suave skeleton → contenido
- ✅ Empty states solo cuando `!isLoading && !hasData`

**Preparación de Datos:**
- ✅ Funciones puras en `utils/dataPreparation.ts`
- ✅ Memoizadas correctamente
- ✅ Dependencias claras

**Componentes:**
- ✅ InfoMeta NO incluye `duration`
- ✅ Cards reciben datos preparados
- ✅ Cards solo renderizan

---

## REFERENCIAS CRUZADAS

### Documentos Relacionados

**Product Definition:**
- `FLOWYA Product Definition V2.0.md` - Definición completa del producto

**Arquitectura:**
- `RECONSTRUCCION_ARQUITECTONICA_V2.md` - Plan y diagnóstico
- `SCOPE_0-5_COMPLETADO.md` - Estado de implementación

**Análisis Funcional:**
- `ANALISIS_ESTADO_ACTUAL_SPOTS_SISTEM.md` - Sistema de spots
- `ANALISIS_FUNCIONAL_CARGA_Y_RENDER.md` - Carga y renderizado
- `ANALISIS_FUNCIONAL_CREACION_EDICION_SPOTS.md` - Creación y edición

### Archivos Canónicos

**Contextos:**
- `contexts/LocationContext.tsx` - LocationProvider
- `contexts/SpotContext.tsx` - Gestión de spots
- `contexts/PathContext.tsx` - Gestión de flows

**Hooks:**
- `hooks/useBaseLocation.ts` - Hook canónico de ubicación
- `hooks/useSpotDistance.ts` - Selector de distancia
- `hooks/useSpotsWithDistance.ts` - Hook para múltiples spots

**Utilidades:**
- `utils/dataPreparation.ts` - Funciones de preparación
- `utils/loadingHelpers.ts` - Helpers de carga

**Componentes:**
- `components/ui/InfoMeta.tsx` - InfoMeta (chip, distance, rating)
- `components/SpotMediaCard.tsx` - Card con imagen
- `components/FlowCard.tsx` - Card de flow

---

## MANTENIMIENTO Y EVOLUCIÓN

### Reglas para Futuras Modificaciones

1. **NUNCA** llamar Location API directamente
2. **NUNCA** calcular distancia dentro de cards
3. **NUNCA** agregar lógica de sistema a componentes visuales
4. **SIEMPRE** usar `useBaseLocation()` para ubicación
5. **SIEMPRE** preparar datos fuera de componentes
6. **SIEMPRE** mostrar skeleton durante carga inicial
7. **SIEMPRE** pasar distancia como prop a cards

### Proceso de Actualización

Cuando se agreguen nuevas funcionalidades:
1. Verificar que cumplen con principios arquitectónicos
2. Usar tipos centralizados
3. Preparar datos fuera de componentes
4. Actualizar este documento si hay cambios arquitectónicos
5. Actualizar `FLOWYA Product Definition V2.0.md` si hay cambios de producto

---

**Documento generado:** 2024-12-20  
**Versión del Proyecto:** FLOWYA V2.0  
**Estado:** ✅ Fuente única de verdad establecida
