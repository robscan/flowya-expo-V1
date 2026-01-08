# Análisis Funcional: Manejo de Carga, Skeleton Loaders y Renderizado

**Fecha:** 2024  
**Objetivo:** Documentar el estado actual del sistema de carga, skeleton loaders, estados asíncronos y renderizado de imágenes para identificar problemas (especialmente parpadeo) y evaluar prácticas modernas.

---

## 1. Estado Actual del Sistema

### 1.1 Arquitectura de Carga

#### Contextos y Estados Asíncronos
El proyecto utiliza **6 contextos principales** que gestionan estados de carga:

1. **SpotContext** (`contexts/SpotContext.tsx`)
   - `isLoading: boolean` - Estado inicial en `true`
   - Carga desde AsyncStorage al montar
   - Fallback a mockSpots si no hay datos
   - Guardado automático en AsyncStorage cuando cambia `spots`

2. **PathContext** (`contexts/PathContext.tsx`)
   - `isLoading: boolean` - Estado inicial en `true`
   - Carga desde AsyncStorage al montar
   - Fallback a mockFlows si no hay datos
   - Guardado automático en AsyncStorage cuando cambia `flows`

3. **AuthContext** (`contexts/AuthContext.tsx`)
   - `isLoading: boolean` - Estado inicial en `true`
   - Carga sesión desde Supabase o AsyncStorage
   - Manejo de errores con fallback a AsyncStorage

4. **SavedContext** (`contexts/SavedContext.tsx`)
   - `isLoading: boolean` - Estado inicial en `true`
   - Carga datos guardados desde AsyncStorage
   - Guardado automático cuando cambia `data`

5. **FlowContext** (`contexts/FlowContext.tsx`)
   - **NO tiene `isLoading`** - Solo gestiona estado del flow activo
   - Estado síncrono (idle/active/paused)

6. **NarrationContext** (`contexts/NarrationContext.tsx`)
   - **NO tiene `isLoading`** - Solo gestiona estado de narración

#### Patrón de Carga Identificado
```typescript
// Patrón estándar en todos los contextos
const [data, setData] = useState<Type[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadData(); // Carga asíncrona
}, []);

useEffect(() => {
  if (!isLoading) {
    saveData(data); // Guardado automático cuando cambian los datos
  }
}, [data, isLoading]);
```

### 1.2 Componentes de Skeleton Loaders

El proyecto tiene un **sistema de skeleton loaders** bien estructurado:

#### Componentes Base
- **SkeletonBlock** (`components/ui/SkeletonBlock.tsx`)
  - Componente base genérico
  - Animación shimmer con LinearGradient
  - Usa tokens del Design System (spacing, colors)
  - Soporta tamaños predefinidos (xs, sm, md, lg, xl)

- **SkeletonLoader** (`components/ui/SkeletonLoader.tsx`) - **LEGACY**
  - Componente antiguo con animación de pulso + shimmer
  - Incluye `SpotCardSkeleton` predefinido
  - Mantenido para compatibilidad

#### Componentes Especializados
- **SkeletonImage** (`components/ui/SkeletonImage.tsx`)
  - Wrapper de SkeletonBlock con aspect ratio
  - Soporta ratios comunes (16:9, 4:3, 1:1)
  - Tamaños predefinidos (small, medium, large, xlarge)

- **SkeletonText** (`components/ui/SkeletonText.tsx`)
  - Skeleton para texto con variantes tipográficas
  - Soporta múltiples líneas

- **SkeletonCard** (`components/ui/SkeletonCard.tsx`)
  - Skeleton completo para cards
  - Estructura: Imagen + Título + Descripción + Metadata
  - Variantes de tamaño (small, medium, large)

- **SkeletonList** (`components/ui/SkeletonList.tsx`)
  - Skeleton para listas de items

#### Exportación Centralizada
- `components/ui/Skeleton.tsx` - Barrel export que exporta todos los skeletons
- Mantiene compatibilidad con `SkeletonLoader` (legacy)

### 1.3 Manejo de Imágenes

#### OptimizedImage (`components/ui/OptimizedImage.tsx`)
**Características actuales:**
- ✅ **Renderizado inmediato sin estados de carga**
- ✅ **Placeholder estático sólido** si no hay imagen
- ✅ **Requiere width/height** explícitos (evita layout shift)
- ✅ **Fallback icon** cuando no hay imagen
- ✅ **Memoización de source** para evitar re-renders
- ✅ **Fondo sólido mientras carga** (`backgroundColor: colors.icon + '20'`)
- ❌ **NO tiene estados de carga** (no muestra skeleton durante carga)
- ❌ **NO tiene transición fade-in** (`fadeDuration={0}`)
- ❌ **NO tiene error state** visual (solo fallback estático)

**Flujo de renderizado:**
```
1. Si no hay source → Mostrar fallback estático (icono)
2. Si hay source → Renderizar Image directamente
3. Image carga asíncronamente en background (sin feedback visual)
4. Si falla → No hay manejo explícito de error
```

#### useImageUpload (`hooks/useImageUpload.ts`)
**Pipeline de optimización:**
1. Selección de imagen (galería/cámara)
2. Redimensionar (max width: 1200px mobile, 1600px web)
3. Comprimir (calidad 70-80)
4. Remover metadata (automático con ImageManipulator)
5. Retornar URI optimizada

**Características:**
- ✅ Optimización antes de mostrar en UI
- ✅ Estado `isOptimizing` para feedback
- ✅ Manejo de errores con callbacks
- ⚠️ **Optimización bloqueante** (usuario espera)

### 1.4 Uso de Skeleton Loaders en Pantallas

#### Análisis de Pantallas Principales

**Home Screen** (`app/(tabs)/home.tsx`):
- ❌ **NO usa skeleton loaders**
- ❌ **NO verifica `isLoading`** de contextos
- ⚠️ Renderiza contenido directamente con datos vacíos si aún están cargando
- ✅ Usa `RefreshControl` para pull-to-refresh
- ✅ Optimizaciones de FlatList (windowSize, initialNumToRender, removeClippedSubviews)

**Saved Screen** (`app/(tabs)/saved.tsx`):
- ❌ **NO usa skeleton loaders**
- ❌ **NO verifica `isLoading`** de contextos
- ⚠️ Renderiza contenido directamente
- ✅ Usa `RefreshControl` para pull-to-refresh
- ✅ Muestra empty state si no hay contenido

**Search Screen** (`app/(tabs)/search.tsx`):
- ❌ **NO usa skeleton loaders**
- ❌ **NO verifica `isLoading`** de contextos
- ⚠️ Renderiza sugerencias directamente
- ✅ Búsqueda instantánea sin estados de carga intermedios

### 1.5 Splash Screen y Carga Inicial

**Root Layout** (`app/_layout.tsx`):
- ✅ Usa `expo-splash-screen` para splash screen nativa
- ✅ Espera carga de fuentes (Inter)
- ✅ Oculta splash cuando fuentes están cargadas
- ⚠️ **NO espera a que contextos terminen de cargar** (spots, flows, auth)
- ⚠️ **NO muestra loading global** durante carga inicial de datos

**Flujo de carga inicial:**
```
1. App inicia → Splash screen visible
2. Fuentes cargan → Splash screen oculta
3. Contextos inician carga (paralelo)
4. Pantallas renderizan con datos vacíos (isLoading=true pero no se muestra skeleton)
5. Contextos completan → Datos aparecen (parpadeo potencial)
```

---

## 2. Problemas Detectados

### 2.1 Parpadeo (Flicker) - **CRÍTICO**

#### 2.1.1 Parpadeo en Carga Inicial
**Problema:** Las pantallas renderizan antes de que los contextos terminen de cargar datos.

**Flujo problemático:**
1. App monta → Contextos inician carga (isLoading=true)
2. Pantallas renderizan → No verifican isLoading
3. Renderizan con arrays vacíos → Muestra empty state o nada
4. Contextos completan → setData() → Re-render
5. **Parpadeo visible:** Empty state → Contenido lleno

**Ubicaciones afectadas:**
- `app/(tabs)/home.tsx` - Listas vacías al inicio
- `app/(tabs)/saved.tsx` - Listas vacías al inicio
- `app/(tabs)/search.tsx` - Sugerencias vacías al inicio

#### 2.1.2 Parpadeo en Imágenes
**Problema:** `OptimizedImage` no tiene feedback visual durante carga.

**Flujo problemático:**
1. Componente renderiza → Image con source
2. Image carga asíncronamente → Sin feedback
3. Image completa → Aparece de repente (sin fade-in)
4. **Parpadeo potencial** si la imagen tarda en cargar

**Mitigaciones actuales:**
- ✅ Fondo sólido mientras carga (reduce parpadeo)
- ✅ Tamaños explícitos (evita layout shift)
- ❌ No hay skeleton durante carga
- ❌ No hay fade-in (aparece de repente)

#### 2.1.3 Parpadeo en Refresh
**Problema:** Pull-to-refresh no usa skeleton, solo spinner.

**Flujo problemático:**
1. Usuario hace pull-to-refresh
2. `RefreshControl` muestra spinner
3. Datos se recargan → setData([]) temporalmente
4. Re-render con datos vacíos → Contenido desaparece
5. Datos cargan → Re-render con datos → **Parpadeo**

### 2.2 Falta de Feedback Visual

#### 2.2.1 Contextos Cargando
**Problema:** Las pantallas no muestran skeleton cuando `isLoading === true`.

**Evidencia:**
- Ninguna pantalla verifica `const { isLoading } = useSpot()`
- Ninguna pantalla verifica `const { isLoading } = usePath()`
- Ninguna pantalla muestra skeleton durante carga inicial

#### 2.2.2 Imágenes Cargando
**Problema:** `OptimizedImage` no muestra skeleton durante carga.

**Evidencia:**
- `OptimizedImage` renderiza Image directamente
- No hay estado de carga (`isLoading` o `onLoadStart`)
- Solo muestra fallback estático si no hay source

### 2.3 Layout Shift

#### 2.3.1 Imágenes sin Dimensiones
**Mitigación actual:** ✅ `OptimizedImage` requiere width/height explícitos
**Riesgo:** Si algún componente usa Image directamente (no OptimizedImage), puede causar layout shift.

#### 2.3.2 Contenido Dinámico
**Problema potencial:** Si skeleton tiene dimensiones diferentes al contenido real, puede causar layout shift.

**Mitigación:** Los skeletons están diseñados con tokens del Design System (mismas dimensiones que contenido real).

### 2.4 Estados de Carga Inconsistentes

#### 2.4.1 No todos los contextos tienen isLoading
- ✅ SpotContext: `isLoading`
- ✅ PathContext: `isLoading`
- ✅ AuthContext: `isLoading`
- ✅ SavedContext: `isLoading`
- ❌ FlowContext: NO tiene `isLoading`
- ❌ NarrationContext: NO tiene `isLoading`

#### 2.4.2 isLoading no se usa
**Problema:** Aunque los contextos exponen `isLoading`, las pantallas no lo usan.

**Evidencia:**
```typescript
// En home.tsx, saved.tsx, search.tsx
const { spots } = useSpot(); // ❌ No se desestructura isLoading
const { paths } = usePath(); // ❌ No se desestructura isLoading
```

### 2.5 Carga Bloqueante

#### 2.5.1 Carga Inicial Síncrona
**Problema:** Todos los contextos cargan en paralelo al montar, bloqueando renderizado inicial.

**Flujo actual:**
```
App monta
  → SpotProvider monta → loadSpots() (async)
  → PathProvider monta → loadFlows() (async)
  → AuthProvider monta → loadSession() (async)
  → SavedProvider monta → loadData() (async)
  → Pantallas renderizan (sin esperar)
```

**Impacto:** Pantallas renderizan con datos vacíos.

#### 2.5.2 Optimización de Imágenes Bloqueante
**Problema:** `useImageUpload` optimiza imágenes antes de mostrarlas (usuario espera).

**Mitigación:** ✅ Muestra estado `isOptimizing` para feedback
**Mejora potencial:** Optimización en background con preview inmediato.

---

## 3. Flujo de Carga Real

### 3.1 Flujo de Carga Inicial Completo

```
1. App inicia (_layout.tsx)
   ├─ Splash screen visible
   ├─ useFonts() carga Inter (async)
   │  └─ Cuando completa → SplashScreen.hideAsync()
   │
   ├─ Contextos montan (en orden):
   │  ├─ AuthProvider
   │  │  └─ loadSession() [async]
   │  │     ├─ Intenta Supabase
   │  │     └─ Fallback AsyncStorage
   │  │     └─ setIsLoading(false) cuando completa
   │  │
   │  ├─ SpotProvider
   │  │  └─ loadSpots() [async]
   │  │     ├─ AsyncStorage.getItem()
   │  │     ├─ Parse JSON
   │  │     ├─ Merge con mockSpots (nuevos spots)
   │  │     └─ setIsLoading(false) cuando completa
   │  │
   │  ├─ PathProvider
   │  │  └─ loadFlows() [async]
   │  │     ├─ AsyncStorage.getItem()
   │  │     ├─ Parse JSON + convertir fechas
   │  │     └─ setIsLoading(false) cuando completa
   │  │
   │  └─ SavedProvider
   │     └─ loadData() [async]
   │        ├─ AsyncStorage.getItem()
   │        ├─ Parse JSON + convertir timestamps
   │        └─ setIsLoading(false) cuando completa
   │
   └─ Pantallas montan (home, saved, search)
      ├─ NO verifican isLoading
      ├─ Renderizan con datos vacíos (arrays iniciales)
      ├─ Contextos completan carga
      ├─ setData() → Re-render
      └─ [PARPADEO] Datos aparecen de repente
```

### 3.2 Flujo de Renderizado de Imágenes

```
1. Componente renderiza (SpotMediaCard, FlowCard, etc.)
   ├─ OptimizedImage con source={uri}
   │
   ├─ Si no hay source:
   │  └─ Renderiza fallback estático (icono + fondo)
   │
   └─ Si hay source:
      ├─ Renderiza contenedor con dimensiones fijas
      ├─ Renderiza Image con source
      │  ├─ Image inicia carga (async, background)
      │  ├─ NO hay feedback visual durante carga
      │  ├─ Image completa → onLoad() (no se usa)
      │  └─ Image falla → onError() (no se maneja)
      │
      └─ [POTENCIAL PARPADEO] Imagen aparece de repente
```

### 3.3 Flujo de Pull-to-Refresh

```
1. Usuario hace pull-to-refresh
   ├─ RefreshControl activa (spinner visible)
   ├─ onRefresh() ejecuta:
   │  ├─ refreshSpots() [async]
   │  └─ refreshFlows() [async]
   │
   ├─ Durante refresh:
   │  ├─ Datos pueden estar vacíos temporalmente
   │  ├─ NO se muestra skeleton
   │  └─ Contenido puede desaparecer
   │
   └─ Cuando completa:
      ├─ setData() → Re-render
      └─ [POTENCIAL PARPADEO] Contenido reaparece
```

---

## 4. Evaluación Frente a Mejores Prácticas Actuales

### 4.1 Skeleton Loaders

#### Práctica Moderna
- ✅ Mostrar skeleton inmediatamente mientras cargan datos
- ✅ Skeleton debe tener mismas dimensiones que contenido real
- ✅ Skeleton debe usar mismos tokens de diseño (spacing, colors)
- ✅ Transición suave de skeleton → contenido

#### Estado Actual
- ✅ Sistema de skeletons bien estructurado (SkeletonBlock, SkeletonCard, etc.)
- ✅ Skeletons usan tokens del Design System
- ❌ **NO se usan en pantallas** (componentes existen pero no se usan)
- ❌ **NO hay transición** skeleton → contenido (aparecen de repente)

**Veredicto:** ✅ Sistema bien diseñado, ❌ **No implementado en pantallas**

### 4.2 Estados de Carga

#### Práctica Moderna
- ✅ Estados claros: `idle | loading | success | error`
- ✅ Feedback visual en cada estado
- ✅ Manejo de errores con retry
- ✅ Loading states granulares (inicial vs refresh vs paginación)

#### Estado Actual
- ⚠️ Solo hay `isLoading: boolean` (binario)
- ❌ **NO hay estados de error** en contextos
- ❌ **NO hay retry** automático
- ❌ **NO se diferencia** carga inicial vs refresh
- ❌ **NO se usa isLoading** en pantallas

**Veredicto:** ❌ **Estados de carga básicos e incompletos**

### 4.3 Renderizado de Imágenes

#### Práctica Moderna
- ✅ Placeholder durante carga (skeleton o blur)
- ✅ Fade-in cuando carga completa
- ✅ Lazy loading (cargar solo cuando está visible)
- ✅ Optimización automática (formato WebP, tamaños responsivos)
- ✅ Error handling con retry

#### Estado Actual
- ✅ Placeholder estático si no hay imagen (fallback icon)
- ❌ **NO hay skeleton durante carga** de imagen
- ❌ **NO hay fade-in** (fadeDuration={0})
- ❌ **NO hay lazy loading** (todas las imágenes cargan al renderizar)
- ✅ Optimización manual con useImageUpload (solo para imágenes subidas)
- ❌ **NO hay error handling** visual

**Veredicto:** ⚠️ **Básico pero mejorable** (falta skeleton y fade-in)

### 4.4 Carga Asíncrona

#### Práctica Moderna
- ✅ Suspense boundaries para carga asíncrona
- ✅ React Query / SWR para caching y estados
- ✅ Optimistic updates
- ✅ Paginación y virtualización

#### Estado Actual
- ❌ **NO usa Suspense** (contextos tradicionales)
- ❌ **NO usa React Query / SWR** (useState + useEffect)
- ❌ **NO hay optimistic updates**
- ✅ Virtualización en FlatList (windowSize, removeClippedSubviews)
- ⚠️ Paginación no implementada (carga todo de una vez)

**Veredicto:** ⚠️ **Enfoque tradicional** (funciona pero no es moderno)

### 4.5 Layout Shift (CLS)

#### Práctica Moderna
- ✅ Dimensiones explícitas para imágenes
- ✅ Aspect ratio containers
- ✅ Skeleton con mismas dimensiones que contenido

#### Estado Actual
- ✅ **OptimizedImage requiere width/height** (evita layout shift)
- ✅ **Skeletons usan tokens del Design System** (mismas dimensiones)
- ⚠️ Riesgo si se usa Image directamente (sin OptimizedImage)

**Veredicto:** ✅ **Bien mitigado** (con OptimizedImage)

---

## 5. Riesgos y Dependencias

### 5.1 Riesgos de Tocar

#### Contextos de Carga
**Alto Riesgo:**
- Modificar lógica de carga en contextos puede romper:
  - Persistencia de datos (AsyncStorage)
  - Sincronización entre contextos
  - Flujo de carga inicial

**Recomendación:** Cambios incrementales con testing exhaustivo.

#### OptimizedImage
**Medio Riesgo:**
- Componente CANONICAL usado en múltiples lugares
- Cambios pueden afectar:
  - SpotMediaCard
  - FlowCard
  - Cualquier componente que use imágenes

**Recomendación:** Mantener API actual, agregar features sin breaking changes.

#### Sistema de Skeletons
**Bajo Riesgo:**
- Componentes bien aislados
- No tienen dependencias externas
- Solo necesitan ser usados (no modificados)

**Recomendación:** Usar tal como están, sin modificaciones.

### 5.2 Dependencias Críticas

#### AsyncStorage
**Dependencia:** `@react-native-async-storage/async-storage`
**Uso:** Todos los contextos cargan desde AsyncStorage
**Riesgo:** Si AsyncStorage falla, app no carga datos

#### Supabase (Auth)
**Dependencia:** `@supabase/supabase-js`
**Uso:** AuthContext carga sesión
**Riesgo:** Si Supabase no está configurado, auth falla silenciosamente (tiene fallback)

#### ImageManipulator
**Dependencia:** `expo-image-manipulator`
**Uso:** useImageUpload optimiza imágenes
**Riesgo:** Si falla, imágenes no se optimizan (pero se pueden mostrar sin optimizar)

### 5.3 Patrones Repetidos (Candidatos a Canonización)

#### Patrón de Contexto con Carga
```typescript
// Patrón repetido en SpotContext, PathContext, SavedContext
const [data, setData] = useState<Type[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  loadData();
}, []);

useEffect(() => {
  if (!isLoading) {
    saveData(data);
  }
}, [data, isLoading]);
```

**Oportunidad:** Crear hook genérico `useAsyncStorage` o `usePersistedState`.

#### Patrón de Carga de Ubicación
```typescript
// Patrón repetido en home.tsx, saved.tsx, search.tsx
useEffect(() => {
  (async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({ latitude, longitude });
  })();
}, []);
```

**Oportunidad:** Crear hook `useUserLocation` centralizado.

#### Patrón de Renderizado de Sliders
```typescript
// Patrón repetido en home.tsx, saved.tsx
const renderSpotSlider = (title: string, spots: Spot[]) => {
  return (
    <View>
      <SectionHeader title={title} />
      <FlatList
        data={spots}
        horizontal
        renderItem={({ item }) => <SpotMediaCard spot={item} />}
      />
    </View>
  );
};
```

**Oportunidad:** Crear componente genérico `SpotSlider` o `HorizontalList`.

---

## 6. Recomendaciones Conceptuales (Sin Código)

### 6.1 Implementar Skeleton Loaders en Pantallas

**Recomendación:** Usar skeleton loaders mientras `isLoading === true` en contextos.

**Ubicaciones prioritarias:**
1. **Home Screen:** Mostrar SkeletonCard mientras cargan spots/flows
2. **Saved Screen:** Mostrar SkeletonCard mientras cargan datos guardados
3. **Search Screen:** Mostrar skeleton para sugerencias mientras cargan

**Beneficio:** Elimina parpadeo inicial al mostrar placeholder inmediato.

### 6.2 Agregar Estados de Carga a OptimizedImage

**Recomendación:** Agregar estados de carga a `OptimizedImage`:
- Mostrar SkeletonImage mientras carga
- Fade-in cuando carga completa (fadeDuration > 0)
- Error state visual si falla la carga

**Beneficio:** Feedback visual durante carga de imágenes, reduce parpadeo.

### 6.3 Mejorar Estados de Carga en Contextos

**Recomendación:** Expandir estados más allá de `isLoading: boolean`:
- `idle | loading | success | error`
- Manejo de errores con retry
- Diferenciar carga inicial vs refresh

**Beneficio:** Mejor UX y debugging.

### 6.4 Implementar Loading Global

**Recomendación:** Mostrar loading global durante carga inicial de contextos.

**Opciones:**
1. Overlay de carga mientras contextos cargan
2. Skeleton global en lugar de empty states
3. Delay en ocultar splash screen hasta que contextos carguen

**Beneficio:** Evita parpadeo al cambiar de splash a contenido vacío.

### 6.5 Optimizar Pull-to-Refresh

**Recomendación:** Mostrar skeleton durante refresh en lugar de solo spinner.

**Beneficio:** Evita que contenido desaparezca durante refresh.

### 6.6 Lazy Loading de Imágenes

**Recomendación:** Implementar lazy loading para imágenes fuera de viewport.

**Opciones:**
1. Usar `react-native-fast-image` con lazy loading
2. Intersection Observer en web
3. Virtualización existente en FlatList puede ayudar

**Beneficio:** Mejor rendimiento, carga más rápida inicial.

### 6.7 Canonizar Patrones Repetidos

**Recomendación:** Crear hooks/componentes canónicos para patrones repetidos:
1. `useAsyncStorage<T>(key)` - Hook genérico para AsyncStorage
2. `useUserLocation()` - Hook centralizado para ubicación
3. `HorizontalSpotList` - Componente genérico para sliders

**Beneficio:** Consistencia, mantenibilidad, DRY.

---

## 7. Conclusiones

### 7.1 Fortalezas

1. ✅ **Sistema de skeletons bien diseñado** (componentes existen y son sólidos)
2. ✅ **OptimizedImage evita layout shift** (requiere dimensiones explícitas)
3. ✅ **Contextos tienen isLoading** (aunque no se usa)
4. ✅ **Tokens del Design System** (skeletons usan mismos tokens)
5. ✅ **Optimización de imágenes** (useImageUpload pipeline)

### 7.2 Debilidades Críticas

1. ❌ **Skeleton loaders NO se usan** en pantallas (existen pero no se implementan)
2. ❌ **Parpadeo en carga inicial** (datos aparecen de repente)
3. ❌ **NO se verifica isLoading** en pantallas
4. ❌ **Imágenes NO tienen skeleton** durante carga (solo fallback estático)
5. ❌ **NO hay fade-in** en imágenes (aparecen de repente)

### 7.3 Prioridades

#### Alta Prioridad
1. **Implementar skeleton loaders en pantallas** (home, saved, search)
2. **Verificar isLoading** de contextos antes de renderizar contenido
3. **Agregar skeleton a OptimizedImage** durante carga

#### Media Prioridad
1. **Agregar fade-in** a OptimizedImage
2. **Loading global** durante carga inicial
3. **Mejorar pull-to-refresh** con skeleton

#### Baja Prioridad
1. **Canonizar patrones repetidos** (hooks genéricos)
2. **Lazy loading de imágenes**
3. **Estados de error** en contextos

---

## 8. Notas Técnicas

### 8.1 Flujo de Carga Actual (Simplificado)

```
App Start
  → Splash Screen
  → Fonts Load
  → Splash Hide
  → Contexts Mount (parallel)
    ├─ Auth: loadSession()
    ├─ Spot: loadSpots()
    ├─ Path: loadFlows()
    └─ Saved: loadData()
  → Screens Render
    ├─ NO check isLoading
    ├─ Render empty arrays
    └─ [PARPADEO] Data appears when contexts complete
```

### 8.2 Flujo Ideal (Propuesto)

```
App Start
  → Splash Screen
  → Fonts Load
  → Contexts Mount (parallel)
    ├─ Auth: loadSession()
    ├─ Spot: loadSpots()
    ├─ Path: loadFlows()
    └─ Saved: loadData()
  → Screens Render
    ├─ Check isLoading
    ├─ Show Skeleton while loading
    └─ Smooth transition to content
```

### 8.3 Arquitectura de Componentes Actual

```
Skeleton System (components/ui/)
  ├─ SkeletonBlock (base)
  ├─ SkeletonImage (wrapper)
  ├─ SkeletonText (wrapper)
  ├─ SkeletonCard (composite)
  ├─ SkeletonList (composite)
  └─ SkeletonLoader (legacy)

Image System
  ├─ OptimizedImage (CANONICAL)
  │  └─ No skeleton during load
  │  └─ Static fallback only
  └─ useImageUpload (optimization hook)

Contexts
  ├─ SpotContext (has isLoading)
  ├─ PathContext (has isLoading)
  ├─ AuthContext (has isLoading)
  ├─ SavedContext (has isLoading)
  ├─ FlowContext (NO isLoading)
  └─ NarrationContext (NO isLoading)

Screens
  ├─ home.tsx (NO uses isLoading, NO skeleton)
  ├─ saved.tsx (NO uses isLoading, NO skeleton)
  └─ search.tsx (NO uses isLoading, NO skeleton)
```

---

**Fin del Análisis**
