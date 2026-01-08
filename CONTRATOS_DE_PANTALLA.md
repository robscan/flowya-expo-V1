# Contratos de Pantalla - FLOWYA

Este documento define los contratos canónicos para cada pantalla del proyecto, estableciendo qué componentes del Design System pueden y no pueden usarse en cada contexto.

## Metodología

Para cada pantalla se documenta:
- **Propósito principal**: Función y contexto de uso
- **Tipo de interacción**: exploración / edición / control
- **Componentes PERMITIDOS**: Del Design System que pueden usarse
- **Componentes PROHIBIDOS**: Del Design System que NO deben usarse
- **Tipo de header**: ContentHeader (image/map/none) o custom
- **Tipo de cards permitidas**: SpotCard (estados), FlowSpotCard, FlowCard, SpotCardCompact

---

## 1. Home (`app/(tabs)/home.tsx`)

### Propósito principal
Exploración de spots y flows cercanos organizados por proximidad y relevancia. Pantalla principal de descubrimiento.

### Tipo de interacción
**Exploración** - Navegación pasiva, scroll horizontal y vertical, sin edición.

### Header
- **Tipo**: Custom header (NO ContentHeader)
- **Componentes**: `LocationWeatherHeader` (componente especializado)
- **Estructura**: Header scrollable dentro de ScrollView con título "FLOWYA - Home" y botón de perfil

### Cards permitidas
- ✅ **SpotCard** con `state="default"` (sliders principales: Nearby, For You, Recommended)
- ✅ **SpotCardCompact** (sliders secundarios: Recently Viewed, Maybe You Like, New)
- ✅ **FlowCard** (listas verticales de flows cercanos)

### Componentes Design System permitidos
- ✅ `SpotCard` (state="default")
- ✅ `SpotCardCompact`
- ✅ `FlowCard`
- ✅ `Icon` (botones de header)
- ✅ `SkeletonCard`, `SkeletonList` (estados de carga)

### Componentes Design System prohibidos
- ❌ `ContentHeader` (usa header custom)
- ❌ `InfoMeta` (no aplica en exploración)
- ❌ `SpotCard` con estados `active`, `next`, `add` (solo exploración)
- ❌ `FlowSpotCard` (no es contexto de flow)
- ❌ `FlowMiniPlayer` (no es pantalla de flow activo)

### Notas
- Sliders horizontales con `SpotCard` para contenido principal
- Sliders horizontales con `SpotCardCompact` para contenido secundario
- Listas verticales con `FlowCard` para flows

---

## 2. Search (`app/(tabs)/search.tsx`)

### Propósito principal
Búsqueda contextual de spots y flows por texto, categoría o ubicación. Resultados organizados por relevancia.

### Tipo de interacción
**Exploración** - Búsqueda activa con resultados filtrados, sin edición.

### Header
- **Tipo**: Custom header (NO ContentHeader)
- **Componentes**: `SearchBar` (componente especializado)
- **Estructura**: Header con barra de búsqueda prominente, categorías, tabs Results/Map

### Cards permitidas
- ✅ **SpotCard** con `state="default"` (resultados de búsqueda)
- ✅ **FlowCard** (resultados de flows)
- ✅ `SearchSuggestion` (sugerencias mientras escribe)
- ✅ `SearchCategoryCard` (filtros por categoría)

### Componentes Design System permitidos
- ✅ `SpotCard` (state="default")
- ✅ `FlowCard`
- ✅ `Icon` (botones de header)
- ✅ `SkeletonCard`, `SkeletonList` (estados de carga)
- ✅ `Chip` (filtros de categoría, si se usa)

### Componentes Design System prohibidos
- ❌ `ContentHeader` (usa header custom con SearchBar)
- ❌ `InfoMeta` (no aplica en resultados de búsqueda)
- ❌ `SpotCard` con estados `active`, `next`, `add` (solo exploración)
- ❌ `FlowSpotCard` (no es contexto de flow)
- ❌ `SpotCardCompact` (no se usa en search)

### Notas
- Tabs internos: Results / Map
- Mapa embebido con `FlowyaMapView` en tab Map
- Resultados ordenados por relevancia + distancia

---

## 3. Saved (`app/(tabs)/saved.tsx`)

### Propósito principal
Memoria personal del usuario: spots y flows guardados, e historial de visitas.

### Tipo de interacción
**Exploración** - Visualización de contenido guardado, sin edición directa.

### Header
- **Tipo**: Custom header (NO ContentHeader)
- **Componentes**: Header simple con título y botón de perfil
- **Estructura**: Header scrollable dentro de ScrollView

### Cards permitidas
- ✅ **SpotCard** con `state="default"` (spots guardados)
- ✅ **FlowCard** (flows guardados)
- ✅ **SpotCard** con `state="default"` (historial de spots visitados)
- ✅ **FlowCard** (historial de flows visitados)

### Componentes Design System permitidos
- ✅ `SpotCard` (state="default")
- ✅ `FlowCard`
- ✅ `Icon` (botones de header)

### Componentes Design System prohibidos
- ❌ `ContentHeader` (usa header custom)
- ❌ `InfoMeta` (no aplica en listas guardadas)
- ❌ `SpotCard` con estados `active`, `next`, `add` (solo exploración)
- ❌ `FlowSpotCard` (no es contexto de flow)
- ❌ `SpotCardCompact` (no se usa en saved)

### Notas
- Tabs internos: Saved / History
- Tab Saved: sliders horizontales de spots y flows guardados
- Tab History: lista vertical de items visitados sin guardar

---

## 4. Map (`app/(tabs)/map.tsx`)

### Propósito principal
Exploración libre y planeación en mapa. Visualización de todos los spots, creación de nuevos spots.

### Tipo de interacción
**Exploración + Creación** - Navegación en mapa, long press para crear spot, sin edición de spots existentes.

### Header
- **Tipo**: Custom header (NO ContentHeader)
- **Componentes**: Header absoluto con título "Map", botón Add, botón Profile
- **Estructura**: Header sticky en top, mapa ocupa 100% del espacio

### Cards permitidas
- ❌ **Ninguna card** - El mapa es el contenido principal
- Los spots se muestran como marcadores (`MapSpotMarker`, `FlowSpotNumberedMarker`)

### Componentes Design System permitidos
- ✅ `Icon` (botones de header y controles de mapa)
- ✅ `MapSpotMarker` (marcadores de spots)
- ✅ `FlowSpotNumberedMarker` (si hay flow activo, aunque no es común en Map tab)

### Componentes Design System prohibidos
- ❌ `ContentHeader` (usa header custom absoluto)
- ❌ `InfoMeta` (no aplica en mapa)
- ❌ `SpotCard` (spots se muestran como marcadores, no cards)
- ❌ `FlowCard` (no se muestran flows como cards en mapa)
- ❌ `FlowSpotCard` (no es contexto de flow)
- ❌ `SpotCardCompact` (no se usa en mapa)

### Notas
- Mapa ocupa 100% del viewport
- Long press en mapa para crear spot
- Botón flotante para centrar en ubicación del usuario
- Marcadores interactivos que navegan a SpotDetail

---

## 5. SpotDetail (`app/spot-detail.tsx`)

### Propósito principal
Visualización detallada de un spot individual con toda su información, opción de edición.

### Tipo de interacción
**Exploración + Edición** - Visualización de detalles, modo edición opcional para modificar spot.

### Header
- **Tipo**: `ContentHeader` con `heroType="image"`
- **Estructura**: 
  - Hero: Imagen del spot (hace scroll con contenido, `sticky={false}`)
  - Left actions: `back` (normal) / `close` (edición)
  - Right actions: `bookmark` (con estado activo), `share`, `menu` (solo en modo normal)

### Cards permitidas
- ❌ **Ninguna card** - La información se muestra directamente, no en cards

### Componentes Design System permitidos
- ✅ `ContentHeader` (heroType="image")
- ✅ `InfoMeta` (debajo del título, con chip, distancia, rating)
- ✅ `IconButton` (usado por ContentHeader)
- ✅ `Icon` (botones y acciones)
- ✅ `Toast` (feedback de acciones)
- ✅ `Tooltip` (ayuda contextual)

### Componentes Design System prohibidos
- ❌ `SpotCard` (no se usa card, se muestra información directa)
- ❌ `FlowCard` (no aplica en detalle de spot)
- ❌ `FlowSpotCard` (no es contexto de flow)
- ❌ `SpotCardCompact` (no se usa en detalle)

### Notas
- Modo edición: permite editar nombre, descripción, tipo, foto
- InfoMeta muestra: chip (tipo), distancia, rating
- Mapa embebido opcional para mostrar ubicación

---

## 6. FlowScreen (`app/flow-screen.tsx`)

### Propósito principal
Control y navegación de un flow activo. Muestra spot actual, siguiente, sugerencias, y controles de reproducción.

### Tipo de interacción
**Control** - Gestión activa del flow en progreso, edición de orden de spots.

### Header
- **Tipo**: `ContentHeader` con `heroType="map"`
- **Estructura**:
  - Hero: Mapa embebido (sticky, `sticky={true}`)
  - Left actions: `minimize`, `audio`/`mute` (toggle), `close`
  - Right actions: Ninguna (o controles de mapa si aplica)

### Cards permitidas
- ✅ **SpotCard** con `state="active"` (spot actual, arriba de "Up Next")
- ✅ **SpotCard** con `state="next"` (spots en "Up Next", con modo edición)
- ✅ **SpotCard** con `state="add"` (spots en "More Suggestions")

### Componentes Design System permitidos
- ✅ `ContentHeader` (heroType="map")
- ✅ `SpotCard` (states: "active", "next", "add")
- ✅ `IconButton` (usado por ContentHeader)
- ✅ `Icon` (botones y acciones)
- ✅ `Toast` (feedback de acciones)
- ✅ `Tooltip` (ayuda contextual)
- ✅ `FlowPlayerControls` (controles de reproducción)

### Componentes Design System prohibidos
- ❌ `InfoMeta` (la información del spot está en SpotCard, no se duplica)
- ❌ `FlowCard` (no se muestra flow como card, está activo)
- ❌ `FlowSpotCard` (se usa SpotCard en su lugar)
- ❌ `SpotCard` con `state="default"` (solo estados de flow)
- ❌ `SpotCardCompact` (no se usa en flow screen)

### Notas
- Modo edición en "Up Next": permite reordenar y eliminar spots
- Mapa siempre visible en top (sticky)
- Player controls fijo en bottom
- Modo fullscreen: mapa ocupa 100% del viewport

---

## 7. FlowDetail (`app/flow-detail.tsx`)

### Propósito principal
Visualización detallada de un flow antes de iniciarlo. Información del flow, spots incluidos, opción de iniciar.

### Tipo de interacción
**Exploración** - Visualización de información, sin edición (solo iniciar flow).

### Header
- **Tipo**: `ContentHeader` con `heroType="image"`
- **Estructura**:
  - Hero: Imagen del flow (hace scroll con contenido, `sticky={false}`)
  - Left actions: `back`
  - Right actions: `like`, `share`, `bookmark` (con estado activo)

### Cards permitidas
- ✅ **FlowSpotCard** (lista de spots del flow, estados: normal, activo)

### Componentes Design System permitidos
- ✅ `ContentHeader` (heroType="image")
- ✅ `InfoMeta` (debajo del título, con duración, distancia)
- ✅ `FlowSpotCard` (lista de spots del flow)
- ✅ `IconButton` (usado por ContentHeader)
- ✅ `Icon` (botones y acciones)
- ✅ `Chip` (movement mode tag)

### Componentes Design System prohibidos
- ❌ `SpotCard` (se usa FlowSpotCard para spots del flow)
- ❌ `FlowCard` (no se muestra flow como card, es el detalle)
- ❌ `SpotCardCompact` (no se usa en flow detail)
- ❌ `SpotCard` con estados `active`, `next`, `add` (solo FlowSpotCard)

### Notas
- InfoMeta muestra: duración, distancia total
- Lista de spots con FlowSpotCard (no SpotCard)
- Botón "Start Flow" para iniciar el flow

---

## 8. CreateSpot (`app/create-spot.tsx`)

### Propósito principal
Creación de un nuevo spot. Formulario con foto, ubicación, nombre, descripción, tipo.

### Tipo de interacción
**Edición** - Formulario de creación, sin exploración.

### Header
- **Tipo**: Custom header (NO ContentHeader)
- **Componentes**: Header simple con título "Create Spot" y botón `close`
- **Estructura**: Header sticky en top

### Cards permitidas
- ❌ **Ninguna card** - Formulario directo, no cards

### Componentes Design System permitidos
- ✅ `Icon` (botones de header)
- ✅ `GlassView` (contenedores de formulario)
- ✅ `FlowyaMapView` (selector de ubicación)

### Componentes Design System prohibidos
- ❌ `ContentHeader` (usa header custom simple)
- ❌ `InfoMeta` (no aplica en formulario)
- ❌ `SpotCard` (no se muestra información en cards)
- ❌ `FlowCard` (no aplica en creación de spot)
- ❌ `FlowSpotCard` (no aplica)
- ❌ `SpotCardCompact` (no aplica)

### Notas
- Formulario con validación: foto y ubicación requeridos
- Mapa embebido para seleccionar/ajustar ubicación
- Búsqueda de dirección opcional

---

## 9. FlowFullPlayer (`app/flow-full-player.tsx`)

### Propósito principal
Player expandido de flow activo. Vista detallada del progreso, spot actual, ruta completa.

### Tipo de interacción
**Control** - Visualización expandida del flow activo, controles de reproducción.

### Header
- **Tipo**: Custom header (NO ContentHeader)
- **Componentes**: Header simple con título del flow y botón `close`
- **Estructura**: Header dentro de ScrollView (hace scroll)

### Cards permitidas
- ✅ **SpotCard** con `state="active"` (spot actual destacado)
- ✅ **FlowSpotCard** (lista completa de spots del flow, con estado activo)

### Componentes Design System permitidos
- ✅ `SpotCard` (state="active")
- ✅ `FlowSpotCard` (lista de spots)
- ✅ `FlowPlayerControls` (controles de reproducción)
- ✅ `Icon` (botones de header y acciones)

### Componentes Design System prohibidos
- ❌ `ContentHeader` (usa header custom simple)
- ❌ `InfoMeta` (la información está en las cards)
- ❌ `SpotCard` con estados `next`, `add`, `default` (solo "active" para spot actual)
- ❌ `FlowCard` (no se muestra flow como card, está activo)
- ❌ `SpotCardCompact` (no se usa en player)

### Notas
- Barra de progreso visual del flow
- Spot actual destacado con SpotCard "active"
- Lista completa de spots con FlowSpotCard
- Controles de reproducción en bottom

---

## Resumen de Reglas Generales

### Headers
- **ContentHeader con image**: SpotDetail, FlowDetail
- **ContentHeader con map**: FlowScreen
- **Custom header**: Home, Search, Saved, Map, CreateSpot, FlowFullPlayer

### Cards por Contexto
- **Exploración (Home, Search, Saved)**: `SpotCard` (default), `FlowCard`, `SpotCardCompact` (solo Home)
- **Flow activo (FlowScreen)**: `SpotCard` (active, next, add)
- **Flow detalle (FlowDetail)**: `FlowSpotCard`
- **Player expandido (FlowFullPlayer)**: `SpotCard` (active), `FlowSpotCard`

### InfoMeta
- **Permitido**: SpotDetail, FlowDetail (debajo de títulos)
- **Prohibido**: Home, Search, Saved, Map, CreateSpot, FlowScreen, FlowFullPlayer

### Componentes Prohibidos Globalmente
- Ningún componente debe usarse fuera de su contexto definido
- No mezclar cards de exploración con cards de flow
- No usar ContentHeader donde no corresponde (exploración usa headers custom)

