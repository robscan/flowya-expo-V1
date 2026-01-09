# RECONSTRUCCIÓN ARQUITECTÓNICA FLOWYA V2
## Diagnóstico, Arquitectura Canónica y Plan de Reconstrucción

**Fecha:** 2024-12-20  
**Versión:** 2.0  
**Objetivo:** Diagnóstico arquitectónico completo, definición de arquitectura canónica y plan progresivo de reconstrucción sin romper el proyecto.

---

## 1. DIAGNÓSTICO ARQUITECTÓNICO

### 1.1. Estado Actual: Lo que Está Bien ✅

#### Sistema de Ubicación (Parcialmente Correcto)
- ✅ **`useBaseLocation` hook existe** (`hooks/useBaseLocation.ts`)
  - Carga ubicación UNA SOLA VEZ al montar
  - Estabiliza como `baseLocation`
  - NO se actualiza automáticamente
  - Retorna función `refreshLocation` para actualización manual

- ✅ **`getSpotDistance` función pura** (`hooks/useSpotDistance.ts`)
  - Calcula distancia como dato derivado
  - NO es estado reactivo
  - Memoizada correctamente

- ✅ **Pantallas principales ya usan hooks canónicos**
  - `home.tsx`: Usa `useBaseLocation` + `getSpotDistance`
  - `map.tsx`: Usa `useBaseLocation` + `useSpotDistance`
  - `saved.tsx`: Usa `useBaseLocation` + `getSpotDistance`
  - `search.tsx`: Usa `useBaseLocation` + `getSpotDistance`

- ✅ **Cards reciben distancia como prop**
  - `SpotMediaCard`: Recibe `distance?: number`
  - `SpotInlineCard`: Recibe `distance?: number`
  - NO calculan distancia internamente

#### Sistema de Skeletons (Bien Diseñado, Mal Implementado)
- ✅ **Componentes de skeleton bien estructurados**
  - `SkeletonBlock`, `SkeletonImage`, `SkeletonText`, `SkeletonCard`, `SkeletonList`
  - Usan tokens del Design System
  - Están bien aislados

- ✅ **Helpers de loading existen** (`utils/loadingHelpers.ts`)
  - `shouldShowSkeleton()`, `shouldShowContent()`, `anyLoading()`
  - Funciones canónicas para manejo de estados

### 1.2. Problemas Estructurales Críticos ❌

#### Problema 1: Ubicación NO es Fuente Única de Verdad
**Evidencia:**
- `useBaseLocation` existe pero NO se usa en TODAS las pantallas
- Algunos componentes pueden estar calculando ubicación directamente
- No hay un Provider centralizado que garantice una sola fuente

**Impacto:**
- Múltiples llamadas a `Location.getCurrentPositionAsync()`
- Inconsistencias entre pantallas
- Re-renders innecesarios

#### Problema 2: Skeleton Loaders NO se Usan Consistentemente
**Evidencia:**
- `home.tsx`: Tiene `SkeletonCard` importado pero NO verifica `isLoading` antes de renderizar
- `saved.tsx`: Usa skeletons pero con lógica inconsistente
- `search.tsx`: Usa `SkeletonList` pero solo en algunos casos
- Las pantallas renderizan contenido con datos vacíos durante carga inicial

**Impacto:**
- Parpadeo visible en carga inicial
- Empty states aparecen antes de que datos carguen
- UX caótica

#### Problema 3: Preparación de Datos Dentro de Componentes
**Evidencia:**
- `home.tsx`: Función `prepareHomeData()` está fuera del componente (✅) pero se llama dentro del render
- `saved.tsx`: `useSpotsWithDistance` hook existe pero la lógica está mezclada
- Cálculos de distancia se hacen en múltiples lugares

**Impacto:**
- Re-renders innecesarios
- Lógica duplicada
- Difícil de mantener

#### Problema 4: Contextos NO Exponen Estados de Carga Correctamente
**Evidencia:**
- `SpotContext`, `PathContext`, `SavedContext` tienen `isLoading`
- Pero las pantallas NO siempre verifican `isLoading` antes de renderizar
- No hay diferenciación entre carga inicial vs refresh

**Impacto:**
- Parpadeo en carga inicial
- Contenido aparece de repente
- No hay feedback visual consistente

#### Problema 5: Side-Effects en Componentes Visuales
**Evidencia:**
- `SpotMediaCard`: Tiene `useEffect` que marca spot como "seen" (aceptable)
- Pero algunos componentes pueden tener lógica de sistema mezclada

**Impacto:**
- Componentes no son puramente visuales
- Difícil de testear
- Acoplamiento indebido

### 1.3. Acoplamientos Indebidos Detectados

#### Acoplamiento 1: Cards con Lógica de Sistema
- `SpotMediaCard` marca spots como "seen" automáticamente
- Esto es aceptable pero debe estar documentado como responsabilidad

#### Acoplamiento 2: Pantallas con Lógica de Preparación
- Pantallas preparan datos dentro de `useMemo`
- Debería estar en una capa de "preparación de datos" separada

#### Acoplamiento 3: Contextos con Persistencia Mezclada
- Contextos cargan Y guardan automáticamente
- Esto está bien pero debe ser explícito

### 1.4. Responsabilidades Mal Ubicadas

| Responsabilidad | Ubicación Actual | Debería Estar |
|----------------|------------------|---------------|
| Cálculo de distancia | Múltiples lugares | Capa de preparación de datos |
| Verificación de `isLoading` | Inconsistente | Todas las pantallas |
| Skeleton loaders | Parcialmente usado | Todas las pantallas durante carga |
| Preparación de datos | Dentro de componentes | Hook o función pura fuera |
| Ubicación del usuario | `useBaseLocation` (correcto) | Provider centralizado |

---

## 2. ARQUITECTURA CANÓNICA PROPUESTA

### 2.1. Principios Arquitectónicos (No Negociables)

#### Principio 1: Fuente Única de Verdad
```
Ubicación del usuario:
  → LocationProvider (Context)
    → useBaseLocation (Hook canónico)
      → baseLocation: Location | null (congelado)
      → isLoading: boolean
      → refreshLocation: () => Promise<void>
```

**Regla:** La ubicación se obtiene UNA SOLA VEZ por sesión de pantalla. Solo se actualiza cuando el usuario explícitamente refresca.

#### Principio 2: Separación Estricta de Capas

```
┌─────────────────────────────────────┐
│ CAPA DE SISTEMA                     │
│ - LocationProvider                  │
│ - SpotContext, PathContext, etc.   │
│ - Estados globales                  │
└─────────────────────────────────────┘
           ↓ (datos congelados)
┌─────────────────────────────────────┐
│ CAPA DE PREPARACIÓN DE DATOS        │
│ - prepareHomeData()                 │
│ - prepareSearchResults()            │
│ - getSpotDistance()                 │
│ - Funciones puras, memoizadas       │
└─────────────────────────────────────┘
           ↓ (datos preparados)
┌─────────────────────────────────────┐
│ CAPA DE UI                          │
│ - Pantallas                         │
│ - Componentes visuales              │
│ - Sin side-effects                  │
│ - Sin lógica de sistema             │
└─────────────────────────────────────┘
```

#### Principio 3: Componentes Visuales Son "Tontos"
- Reciben datos ya preparados
- NO calculan distancias
- NO obtienen ubicación
- NO tienen side-effects de sistema
- Solo renderizan

#### Principio 4: Skeleton = Visual, Sin Lógica
- Skeletons son componentes puramente visuales
- NO tienen dependencias de datos
- Se muestran a nivel de lista/container, no card individual
- Se muestran mientras `isLoading === true`

### 2.2. Arquitectura de Capas Detallada

#### Capa 1: Sistema (Providers y Contextos)
```typescript
// LocationProvider.tsx
export function LocationProvider({ children }) {
  const [baseLocation, setBaseLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar UNA SOLA VEZ
  useEffect(() => {
    loadLocation();
  }, []);
  
  return (
    <LocationContext.Provider value={{ baseLocation, isLoading, refreshLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

// useBaseLocation.ts (Hook canónico)
export function useBaseLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useBaseLocation must be used within LocationProvider');
  }
  return context;
}
```

#### Capa 2: Preparación de Datos (Funciones Puras)
```typescript
// utils/dataPreparation.ts
export function prepareHomeData(
  spots: Spot[],
  flows: Flow[],
  baseLocation: Location | null,
  likedSpots: string[],
  savedSpots: string[]
): HomeData {
  // Función pura, fuera de componentes
  // Calcula distancias, filtra, ordena
  // Retorna datos preparados
}

// hooks/useSpotDistance.ts (Selector puro)
export function getSpotDistance(
  spot: Spot,
  baseLocation: Location | null
): number | undefined {
  // Función pura, memoizada
  // NO es hook, es selector
}
```

#### Capa 3: UI (Pantallas y Componentes)
```typescript
// app/(tabs)/home.tsx
export default function HomeScreen() {
  const { baseLocation, isLoading: locationLoading } = useBaseLocation();
  const { spots, isLoading: spotsLoading } = useSpot();
  const { paths, isLoading: pathsLoading } = usePath();
  
  const isLoading = anyLoading(locationLoading, spotsLoading, pathsLoading);
  
  // Preparar datos (memoizado)
  const homeData = useMemo(() => {
    if (isLoading) return emptyHomeData;
    return prepareHomeData(spots, paths, baseLocation, likedSpots, savedSpots);
  }, [spots, paths, baseLocation, likedSpots, savedSpots, isLoading]);
  
  // Render condicional
  if (shouldShowSkeleton(isLoading, homeData.hasData)) {
    return <SkeletonList count={10} />;
  }
  
  if (shouldShowEmpty(isLoading, homeData.hasData)) {
    return <EmptyState />;
  }
  
  return <HomeContent data={homeData} />;
}
```

### 2.3. Flujo de Datos Canónico

```
1. App inicia
   ↓
2. LocationProvider monta
   → Carga ubicación UNA SOLA VEZ
   → Establece baseLocation (congelado)
   ↓
3. Pantalla monta
   → useBaseLocation() → baseLocation
   → useSpot() → spots, isLoading
   → usePath() → paths, isLoading
   ↓
4. Preparación de datos (useMemo)
   → prepareHomeData(spots, paths, baseLocation, ...)
   → Calcula distancias (getSpotDistance)
   → Filtra, ordena, agrupa
   → Retorna datos preparados
   ↓
5. Render condicional
   → isLoading? → Skeleton
   → !hasData? → EmptyState
   → hasData? → Content
   ↓
6. Componentes visuales
   → Reciben datos preparados
   → Reciben distancia ya calculada
   → Solo renderizan
```

### 2.4. Reglas de Implementación

#### Regla 1: Ubicación
- ✅ Usar `useBaseLocation()` en TODAS las pantallas que necesiten ubicación
- ✅ NUNCA llamar `Location.getCurrentPositionAsync()` directamente
- ✅ NUNCA calcular ubicación dentro de cards o componentes visuales
- ✅ La ubicación es un dato congelado durante la sesión de pantalla

#### Regla 2: Distancia
- ✅ Calcular distancia en capa de preparación de datos
- ✅ Pasar distancia como prop a cards
- ✅ NUNCA calcular distancia dentro de cards
- ✅ Usar `getSpotDistance()` como selector puro

#### Regla 3: Skeleton Loaders
- ✅ Mostrar skeleton mientras `isLoading === true`
- ✅ Skeleton a nivel de lista/container, NO card individual
- ✅ Usar `shouldShowSkeleton()` helper
- ✅ Transición suave skeleton → contenido

#### Regla 4: Preparación de Datos
- ✅ Funciones puras fuera de componentes
- ✅ Memoizar con `useMemo` dentro de componentes
- ✅ Dependencias claras y mínimas
- ✅ NO side-effects en preparación

#### Regla 5: Componentes Visuales
- ✅ Reciben datos ya preparados
- ✅ NO calculan distancias
- ✅ NO obtienen ubicación
- ✅ Side-effects mínimos (solo para tracking visual)

---

## 3. PLAN DE RECONSTRUCCIÓN POR SCOPES

### SCOPE 0: Preparación y Fundación
**Objetivo:** Crear infraestructura base sin romper nada

**Qué se crea:**
1. `LocationProvider` (Context centralizado)
2. Migrar `useBaseLocation` para usar `LocationProvider`
3. Tests de regresión para verificar que nada se rompe

**Qué NO se toca:**
- Pantallas existentes
- Cards existentes
- Contextos existentes (excepto integración con LocationProvider)

**Riesgos:**
- Bajo: Solo se agrega infraestructura
- Verificar que `useBaseLocation` sigue funcionando igual

**Criterios de éxito:**
- ✅ `LocationProvider` funciona
- ✅ `useBaseLocation` sigue funcionando igual
- ✅ Todas las pantallas siguen funcionando
- ✅ No hay regresiones

---

### SCOPE 1: Sistema de Ubicación Canónico
**Objetivo:** Garantizar fuente única de verdad para ubicación

**Qué se crea:**
1. Integrar `LocationProvider` en `_layout.tsx`
2. Actualizar `useBaseLocation` para usar context
3. Verificar que todas las pantallas usan `useBaseLocation`

**Qué se reemplaza:**
- Cualquier llamada directa a `Location.getCurrentPositionAsync()` → `useBaseLocation()`

**Qué NO se toca:**
- Lógica de preparación de datos
- Componentes visuales
- Cards

**Riesgos:**
- Medio: Cambios en infraestructura pueden afectar pantallas
- Mitigación: Tests exhaustivos, migración gradual

**Criterios de éxito:**
- ✅ Todas las pantallas usan `useBaseLocation`
- ✅ No hay llamadas directas a Location API
- ✅ Ubicación se carga UNA SOLA VEZ por pantalla
- ✅ No hay regresiones

---

### SCOPE 2: Skeleton Loaders Consistentes
**Objetivo:** Eliminar parpadeo en carga inicial

**Qué se crea:**
1. Verificar `isLoading` en TODAS las pantallas
2. Mostrar skeleton mientras `isLoading === true`
3. Transición suave skeleton → contenido

**Qué se reemplaza:**
- Renderizar contenido con datos vacíos → Mostrar skeleton
- Empty states durante carga → Skeleton

**Qué NO se toca:**
- Lógica de preparación de datos
- Cards (ya reciben datos preparados)

**Riesgos:**
- Bajo: Solo cambios visuales
- Verificar que skeletons tienen dimensiones correctas

**Criterios de éxito:**
- ✅ No hay parpadeo en carga inicial
- ✅ Skeletons aparecen inmediatamente
- ✅ Transición suave a contenido
- ✅ Empty states solo cuando `!isLoading && !hasData`

---

### SCOPE 3: Preparación de Datos Canónica
**Objetivo:** Centralizar preparación de datos fuera de componentes

**Qué se crea:**
1. Mover `prepareHomeData` a `utils/dataPreparation.ts`
2. Crear `prepareSearchResults` si no existe
3. Crear `prepareSavedData` si no existe
4. Memoizar correctamente en pantallas

**Qué se reemplaza:**
- Lógica de preparación dentro de componentes → Funciones puras fuera
- Cálculos duplicados → Funciones reutilizables

**Qué NO se toca:**
- Cards (ya reciben datos preparados)
- Contextos (solo se usan sus datos)

**Riesgos:**
- Medio: Cambios en lógica pueden afectar resultados
- Mitigación: Tests de igualdad de resultados

**Criterios de éxito:**
- ✅ Preparación de datos fuera de componentes
- ✅ Funciones puras, testeables
- ✅ Memoización correcta
- ✅ Mismos resultados que antes
- ✅ Mejor rendimiento (menos re-renders)

---

### SCOPE 4: Componentes v2 (Opcional, Futuro)
**Objetivo:** Crear versiones v2 de componentes si es necesario

**Qué se crea:**
- Solo si es necesario después de scopes anteriores
- Componentes v2 con arquitectura canónica
- Reemplazo gradual

**Qué NO se toca:**
- Componentes existentes (hasta que v2 esté probado)

**Riesgos:**
- Bajo: Solo si se decide hacerlo
- Mitigación: Reemplazo gradual, mantener ambos

---

### SCOPE 5: Limpieza y Optimización
**Objetivo:** Eliminar código legacy y optimizar

**Qué se elimina:**
- Código duplicado
- Funciones no usadas
- Hooks legacy (si existen)
- Lógica obsoleta

**Qué se optimiza:**
- Memoización
- Re-renders innecesarios
- Performance

**Riesgos:**
- Medio: Eliminar código puede romper cosas
- Mitigación: Tests exhaustivos, eliminación gradual

**Criterios de éxito:**
- ✅ Código más limpio
- ✅ Menos duplicación
- ✅ Mejor rendimiento
- ✅ No hay regresiones

---

## 4. REGLAS QUE NO DEBEN ROMPERSE EN EL FUTURO

### Regla 1: Ubicación es Fuente Única de Verdad
❌ **NUNCA:**
- Llamar `Location.getCurrentPositionAsync()` directamente en componentes
- Calcular ubicación dentro de cards
- Tener múltiples fuentes de ubicación

✅ **SIEMPRE:**
- Usar `useBaseLocation()` hook
- Ubicación se carga UNA SOLA VEZ por pantalla
- Ubicación es dato congelado durante sesión

### Regla 2: Distancia es Dato Derivado
❌ **NUNCA:**
- Calcular distancia dentro de cards
- Tener distancia como estado reactivo
- Recalcular distancia en cada render

✅ **SIEMPRE:**
- Calcular distancia en capa de preparación
- Pasar distancia como prop a cards
- Usar `getSpotDistance()` como selector puro

### Regla 3: Skeleton = Visual, Sin Lógica
❌ **NUNCA:**
- Skeleton con dependencias de datos
- Skeleton dentro de cards individuales
- Mostrar contenido durante `isLoading === true`

✅ **SIEMPRE:**
- Skeleton a nivel de lista/container
- Mostrar skeleton mientras `isLoading === true`
- Transición suave skeleton → contenido

### Regla 4: Componentes Visuales Son "Tontos"
❌ **NUNCA:**
- Cards calculan distancias
- Cards obtienen ubicación
- Cards tienen side-effects de sistema
- Cards esperan datos asíncronos

✅ **SIEMPRE:**
- Cards reciben datos ya preparados
- Cards reciben distancia como prop
- Cards solo renderizan
- Side-effects mínimos (solo tracking visual)

### Regla 5: Preparación de Datos Fuera de Componentes
❌ **NUNCA:**
- Preparar datos dentro de componentes
- Lógica de filtrado/ordenamiento en render
- Cálculos pesados en render

✅ **SIEMPRE:**
- Funciones puras fuera de componentes
- Memoizar con `useMemo`
- Dependencias claras y mínimas

---

## 5. MÉTRICAS DE ÉXITO

### Métricas Técnicas
- ✅ Ubicación se carga UNA SOLA VEZ por pantalla
- ✅ No hay llamadas directas a Location API
- ✅ Skeletons aparecen en carga inicial (0 parpadeo)
- ✅ Preparación de datos fuera de componentes
- ✅ Cards reciben distancia como prop (no calculan)

### Métricas de UX
- ✅ No hay parpadeo en carga inicial
- ✅ Transición suave skeleton → contenido
- ✅ Empty states solo cuando realmente no hay datos
- ✅ Feedback visual consistente

### Métricas de Mantenibilidad
- ✅ Código más limpio y organizado
- ✅ Menos duplicación
- ✅ Funciones puras, testeables
- ✅ Separación clara de responsabilidades

---

## 6. CONCLUSIÓN

### Estado Actual
El proyecto tiene **fundamentos correctos** pero **implementación inconsistente**:
- ✅ Hooks canónicos existen (`useBaseLocation`, `getSpotDistance`)
- ✅ Componentes de skeleton bien diseñados
- ❌ Pero no se usan consistentemente
- ❌ Parpadeo en carga inicial
- ❌ Preparación de datos mezclada con UI

### Arquitectura Canónica Propuesta
- **Capa de Sistema:** LocationProvider, Contextos
- **Capa de Preparación:** Funciones puras, memoizadas
- **Capa de UI:** Pantallas y componentes "tontos"

### Plan de Reconstrucción
- **Scope 0:** Preparación (LocationProvider)
- **Scope 1:** Sistema de ubicación canónico
- **Scope 2:** Skeleton loaders consistentes
- **Scope 3:** Preparación de datos canónica
- **Scope 4:** Componentes v2 (opcional)
- **Scope 5:** Limpieza y optimización

### Reglas No Negociables
1. Ubicación es fuente única de verdad
2. Distancia es dato derivado
3. Skeleton = visual, sin lógica
4. Componentes visuales son "tontos"
5. Preparación de datos fuera de componentes

---

**Documento generado:** 2024-12-20  
**Versión del Proyecto:** FLOWYA V2.0  
**Última actualización:** Diagnóstico arquitectónico completo y plan de reconstrucción progresiva
