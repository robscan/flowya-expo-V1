# FLOWYA
## Product Definition V2.0 · Antecedente Oficial para Desarrollo

**Versión canónica**  
**Última actualización:** 2024-12-20  
**Estado:** Arquitectura V2.0 completada

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

- **Spot**: un lugar señalado.
- **Path**: un camino posible, una sugerencia.
- **Flow**: el estado activo de consulta o reproducción de un Path.
- **Map**: exploración libre y planeación.
- **Explore**: exploración contextual sin compromiso.
- **Gems**: lugares y Paths que brillan ahora.
- **Saved**: memoria personal del usuario.
- **Like**: señal de afinidad positiva.
- **Not my vibe**: señal de afinidad negativa (sin juicio).
- **Narration**: acompañamiento emocional y contextual.
- **Search**: búsqueda contextual de Spots y Paths.

Este lenguaje no se explica: se descubre usándolo.

---

## ARQUITECTURA V2.0

### Principios Arquitectónicos (No Negociables)

FLOWYA V2.0 implementa una arquitectura canónica basada en separación estricta de capas y fuente única de verdad.

#### Principio 1: Fuente Única de Verdad

**Ubicación del Usuario:**
- `LocationProvider` (Context centralizado en `contexts/LocationContext.tsx`)
- Hook canónico: `useBaseLocation()`
- Ubicación se carga UNA SOLA VEZ al montar el provider
- Ubicación congelada durante la sesión de la app
- Solo se actualiza cuando el usuario explícitamente refresca

**Regla:** NUNCA llamar `Location.getCurrentPositionAsync()` directamente en componentes. SIEMPRE usar `useBaseLocation()`.

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
- Transición suave skeleton → contenido

#### Principio 5: Preparación de Datos Fuera de Componentes

- Funciones puras en `utils/dataPreparation.ts`
- Memoizadas con `useMemo` dentro de componentes
- Dependencias claras y mínimas
- NO side-effects en preparación

### Reglas Arquitectónicas Establecidas

#### Regla 1: Ubicación es Fuente Única de Verdad
- ✅ `LocationProvider` en `_layout.tsx`
- ✅ `useBaseLocation()` hook canónico
- ❌ NUNCA llamadas directas a Location API

#### Regla 2: Distancia es Dato Derivado
- ✅ Calculada en `prepareHomeData()` o funciones de preparación
- ✅ Pasada como prop a cards
- ❌ NUNCA calculada dentro de cards

#### Regla 3: Skeleton = Visual, Sin Lógica
- ✅ Skeletons a nivel de lista/container
- ✅ Mostrados mientras `isLoading === true`
- ✅ Transición suave

#### Regla 4: Componentes Visuales Son "Tontos"
- ✅ Cards reciben datos preparados
- ✅ Cards reciben distancia como prop
- ✅ Cards solo renderizan

#### Regla 5: Preparación de Datos Fuera de Componentes
- ✅ Funciones puras en `utils/dataPreparation.ts`
- ✅ Memoizadas con `useMemo`
- ✅ Dependencias claras

### Componentes Canónicos

**InfoMeta:**
- Props: `chip`, `distance`, `rating`, `size`
- NO incluye `duration` (eliminado en V2.0)
- Responsabilidad: Renderizar información secundaria debajo de títulos

**Cards:**
- `SpotMediaCard`: Recibe `distance` como prop (no calcula)
- `SpotInlineCard`: Recibe `distance` como prop (no calcula)
- `FlowCard`: Recibe `distance` como prop (no calcula)

### Sistema de Ubicación

**LocationProvider:**
- Ubicación centralizada y congelada
- Disponible para toda la app
- Hook: `useBaseLocation()` retorna `{ baseLocation, isLoading, refreshLocation }`

**Preparación de Datos:**
- `utils/dataPreparation.ts`: Funciones puras de preparación
- `prepareHomeData()`: Prepara datos para Home Screen
- Tipos centralizados: `SpotWithDistance`, `FlowWithDistance`, `HomeData`

### Estados de Carga

**Skeleton Loaders:**
- Componentes: `SkeletonCard`, `SkeletonList`, `SkeletonBlock`, etc.
- Helpers: `shouldShowSkeleton()`, `anyLoading()`, `renderContentSkeletonOrEmpty()`
- Uso: Mostrar skeleton mientras `isLoading === true`

**Patrón de Carga:**
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

## ENTIDADES DEL SISTEMA

### SPOT

Un Spot es un lugar físico específico que alguien notó.

No es un listing.
No es contenido cerrado.
Es un punto de atención.

Un Spot puede existir incompleto.
Puede ser creado por cualquier usuario.
Puede evolucionar con el tiempo.

**Atributos posibles:**
- nombre (opcional)
- ubicación en mapa (ajustable)
- fotos
- descripción breve (opcional)
- horarios (si aplica)
- costos (si aplica)
- tipo de lugar

#### CREACIÓN DE SPOT

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

#### ENRIQUECIMIENTO ASISTIDO

Cuando un Spot está incompleto, el sistema puede:
- investigar el lugar
- proponer nombre y descripción
- sugerir horarios y costos
- generar contenido visual (whyItMatters, culturalContext, howToVisit)
- generar narrativas emocionales para audio (anticipation, presence, transition)

El sistema utiliza inteligencia artificial (AI) para curar y redactar contenido.
El contenido generado es emocional, contemplativo, con frases cortas y respirables.
No explica todo - acompaña.

**Reglas del sistema de enriquecimiento:**
- El sistema no duplica contenido existente: si un Spot ya tiene información, la usa y no la regenera
- El contenido generado se cachea en el Spot (no se regenera a menos que se solicite explícitamente)
- La generación es bajo demanda: solo se genera cuando el usuario lo solicita o cuando falta contenido crítico
- El sistema funciona incluso si la AI falla: usa contenido existente o genérico como fallback

El usuario puede aceptar, corregir o ignorar.
El usuario no es responsable editorial total.

#### AJUSTES Y CORRECCIONES

Los usuarios pueden:
- ajustar la ubicación
- subir mejores fotos
- proponer correcciones

Los cambios no se publican automáticamente.
El sistema consolida y valida.

---

### PATH

Un Path es una sugerencia de recorrido.

No es una instrucción.
No es una obligación.

Un Path agrupa Spots y propone un orden y un ritmo.
Nunca exige completarse.

#### CREACIÓN DE PATH

Un Path surge cuando:
- un usuario guarda varios Spots
- un usuario recorre Spots en cierto orden
- el sistema detecta un patrón útil
- el usuario acepta la sugerencia

#### DATOS DE PATH

Todo Path puede incluir:
- título sugerido (editable)
- descripción breve generada
- duración estimada (parte del modelo, no se muestra en InfoMeta)
- modo de movimiento (walking, bike, car)
- lista de Spots

**Nota V2.0:** La duración estimada (`estimatedDuration`) es parte del modelo de datos Path/Flow, pero NO se muestra en el componente `InfoMeta`. InfoMeta solo muestra `chip`, `distance` y `rating`.

#### PERSONALIZACIÓN DE PATH

El usuario puede:
- reordenar Spots
- quitar o saltar Spots
- renombrar el Path
- guardar una versión propia

Editar un Path es ajustar la experiencia, no administrar contenido.

---

### FLOW

Flow es el estado activo de movimiento.
Es el momento en que un Path está vivo.

Flow no es un objeto.
No se guarda.
No se crea manualmente.

Flow existe solo mientras el usuario está presente, consultando o recorriendo un Path.

Cuando Flow está activo:
- la interfaz baja el volumen
- el mundo sube
- el sistema acompaña, no dirige

El usuario puede:
- entrar a un Flow
- pausar
- reanudar un Flow existente

---

## ARQUITECTURA GENERAL DE PANTALLAS

**Navegación principal (Tab Bar):**
- Home
- Map
- Saved
- Search

**Estados y overlays:**
- Flow

**Secciones de navegación:**
- Spot Detail (pantalla completa)
- Path Detail (pantalla completa)
- Flow Full Player (pantalla completa)

**Acceso secundario:**
- Profile (icono arriba a la derecha en Home y Saved)

---

### HOME

Home muestra contenido contextual e inmediato.

#### HOME · EXPLORE

Uso inmediato y contextual.
Muestra Spots cercanos y Paths sugeridos de forma secundaria.
Responde a: ¿Qué puedo hacer aquí y ahora?

**Estructura de contenido:**
- Sliders horizontales de Spots con diferentes jerarquías:
  - **Jerarquía alta (card completa)**: "Cercanos", "Para ti - Spots", "Recomendados - Spots"
  - **Jerarquía menor (card compacta)**: "Vistos recientemente", "Maybe You Like - Spots" (información Global), "New - Spots" (información Global)
- Listados verticales de Paths con títulos claros: "Paths cercanos"

**Tipos de cards:**
- **SpotCard (jerarquía alta)**: Card completa con imagen, título, descripción, distancia y acciones
- **SpotCardCompact (jerarquía menor)**: Card compacta con imagen cuadrada de 160px, título debajo de la imagen (sin envolvente), distancia + "View on map", sin descripción

**Nota sobre información Global:**
- "Maybe You Like - Spots" y "New - Spots" se distinguen como información Global (no basada en ubicación del usuario).
- "Maybe You Like" contiene spots destacados globalmente (curaduría global, antes "Featured" de Gems).
  - No depende de región activa
  - Siempre visible, incluso si no hay spots cercanos
  - Usa TODOS los spots (no filtrados por región)
- "New - Spots" contiene spots recientes globalmente (ordenados por `createdAt` DESC, antes "Recent" de Gems).
  - No filtrados por región activa
  - Siempre visible
  - Usa TODOS los spots (no filtrados por región)

**Arquitectura V2.0:**
- Usa `useBaseLocation()` para obtener ubicación
- Usa `RegionContext` para gestión de región activa
- Usa `prepareHomeData()` para preparar datos (incluye `getAvailableRegionsFromSpots()` y `getSpotsByRegion()` desde `core/region`)
- Secciones globales (`maybeYouLikeSpots`, `newSpots`) usan TODOS los spots (no `filteredSpots`)
- Muestra skeleton mientras `isLoading === true`
- Cards reciben `distance` como prop (pre-calculada)

#### HOME · REGIONES Y DROPDOWN

Home incluye un dropdown de regiones para filtrar contenido por ubicación geográfica.

**Nivel de Región:**
- Preferir capital/ciudad principal (`place` tipo Mapbox)
- Fallback a nivel administrativo inferior consistente (`region` tipo Mapbox)
- NO mostrar `country` ni `locality`
- NO mezclar niveles en el dropdown

**Deduplicación Canónica:**
- Deduplicación canónica por `regionId` (nunca por label o strings libres)
- Un `regionId` = una opción en el dropdown
- Regiones se preparan en capa de preparación (`core/region/getAvailableRegionsFromSpots`)
- UI solo renderiza listas ya normalizadas
- NO hay lógica de deduplicación en componentes visuales

**Dropdown de Regiones:**
- Incluye siempre: "Current location" (primera opción), "All regions", regiones disponibles
- Regiones ordenadas alfabéticamente por label
- Hace scroll interno cuando el contenido excede altura máxima (65% del viewport)
- Nunca desborda el contenedor
- Nunca renderiza duplicados

**"Current location":**
- Opción en el dropdown que restaura la ubicación real del usuario
- Usa `LocationProvider` (`baseLocation`)
- Resuelve región vía `RegionResolver` (Mapbox) desde `RegionContext`
- NO guarda `regionId` fijo, siempre representa ubicación actual
- Región dinámica, siempre actualizada cuando cambia `baseLocation`
- Diferencia con región manual: Región manual (ej. "Barcelona") es fija y no se actualiza automáticamente

---

### MAP

Map es una sección independiente en el Tab Bar principal.

Exploración libre y planeación.
Muestra Spots incluso lejanos.
Permite crear y ajustar Spots.

**Estructura:**
- Header scrollable (igual que otras secciones)
- Vista de mapa completa con FlowyaMapView
- Marcadores interactivos para spots
- Long press para crear nuevo spot
- Mantiene comportamiento de ocultar labels al desplazar

**Nota:** El contenido de Gems (spots destacados y recientes) se ha integrado a Home como información Global en las secciones "Maybe You Like - Spots" y "New - Spots".

**Arquitectura V2.0:**
- Usa `useBaseLocation()` para obtener ubicación
- Ubicación se pasa como prop a componentes de mapa

---

### SAVED

Saved es la memoria personal del usuario.

Incluye:
- Spots guardados
- Spots con Like
- Paths guardados
- Paths recorridos
- historial ligero

Saved representa:
*Esto es lo que noté, recorrí y me llevé conmigo.*

**Estructura de contenido:**
- Header scrollable (igual que Home)
- Dos tabs internos:
  - **"Saved"**: Spots y paths guardados
    - Slider horizontal de Spots guardados (SpotCard completa)
    - Slider horizontal de Paths guardados (PathCard en slider)
  - **"History"**: Spots/paths navegados sin guardar
    - Lista vertical de entradas del timeline con `action="visited"` que no están guardadas
    - Muestra tanto spots como paths visitados sin guardar

**Arquitectura V2.0:**
- Usa `useBaseLocation()` para obtener ubicación
- Usa `useSpotsWithDistance()` para calcular distancias
- Muestra skeleton mientras `isLoading === true`
- Cards reciben `distance` como prop (pre-calculada)

---

### SEARCH

Search permite encontrar Spots y Paths de forma contextual y adaptativa.

Prioriza cercanía
Sugiere mientras se escribe
Permite crear un Spot si no existe

La creación sigue el flujo natural de creación de Spot.
Nunca rompe el contexto.

#### HEADER Y LAYOUT

El header de Search sigue el mismo layout consistente que las demás secciones:
- Título "Search" a la izquierda
- Icono "+" a la derecha (abre el flujo de crear spot)
- SearchBar debajo del headerContent

El layout del header es consistente entre todas las secciones (Home, Map, Saved, Search):
- Título a la izquierda (`textStyles.heading3`)
- Icono accionable a la derecha (perfil en Home/Map/Saved, "+" en Search)
- Mismo tamaño de icono (24px) y contenedor táctil (`iconTouchableContainer.base`)

#### COMPORTAMIENTO DE BÚSQUEDA

La búsqueda prioriza lugares cercanos.
Primero muestra resultados cercanos al usuario.
Luego expande a lugares más lejanos si no hay suficientes resultados.

El sistema muestra sugerencias mientras el usuario escribe.
Las sugerencias incluyen:
- Spots con nombres similares
- Paths que contienen Spots relacionados
- Lugares cercanos que coinciden con la búsqueda

#### RESULTADOS Y SUGERENCIAS

Los resultados se organizan por relevancia y cercanía.
Se muestran sugerencias de:
- Spots similares
- Paths que incluyen Spots relacionados
- Lugares cercanos que pueden interesar

Si no se encuentra lo que busca, el usuario puede crear un nuevo Spot desde la búsqueda.
La creación sigue el flujo definido en CREACIÓN DE SPOT.
No requiere salir del contexto de búsqueda.

#### UBICACIÓN Y ACCESO

Search está disponible en el Tab Bar principal.
Ocupa una posición accesible para búsqueda rápida.
El icono de búsqueda es claro y reconocible.

**Arquitectura V2.0:**
- Usa `useBaseLocation()` para obtener ubicación
- Muestra skeleton mientras `isLoading === true`
- Calcula distancias en preparación de datos

---

### PROFILE

Profile está fuera del Tab Bar.
Contiene:
- preferencias
- idioma
- privacidad
- ajustes de audio
- opciones de cuenta
- estado de permisos
- **Liked Spots**: Spots a los que el usuario les dio like desde el player (durante navegación en un flow)

**Liked Spots:**
- Solo incluye spots a los que se les dio like desde el player (mientras navega en un flow)
- No incluye likes hechos desde otros lugares (como Spot Detail)
- Se muestra en slider horizontal (igual que Saved)
- Header scrollable (igual que otras pantallas)

No duplica contenido de Saved.

---

### SPOT DETAIL

Spot Detail es una sección completa (pantalla completa) que muestra información detallada de un Spot.

#### ESTRUCTURA VISUAL

**1. Header Sticky con Controles:**
- Header sticky que permanece fijo mientras el contenido hace scroll
- Controles flotantes en la parte superior con envolvente circular:
  - Botón "Back" (izquierda) - envolvente circular
  - Botón "Save" (centro-derecha) - envolvente circular
  - Botón "Share" (derecha) - envolvente circular
  - Botón "Menu" (tres puntos, derecha) - envolvente circular
- Estilo de controles:
  - Dark mode: fondo negro, icono blanco
  - Light mode: fondo blanco semi-transparente, icono del color del texto
  - Estado activo: icono en color tint (magenta #E91E63)

**2. Imagen Grande (scrollable con contenido):**
- Imagen panorámica del spot que hace scroll con el contenido
- No es sticky, se desplaza con el scroll

**3. Sección de Contenido:**
- **Grabber/Handle**: Línea horizontal gris en la parte superior (indica que el contenido es scrollable)
- **Tag de Taxonomía**: Chip con el tipo de spot (ej: "BEACH", "CAFÉ", "MUSEUM") usando el mismo estilo que SpotCard
  - Estilo: fondo negro en dark mode, blanco en light mode
  - Texto: blanco en dark mode, color del texto en light mode
  - Tamaño: `fontSize.xs`, `fontFamilyMedium`, `textTransform: 'uppercase'`
- **Rating**: Icono de estrella amarilla + texto con calificación y número de reviews (ej: "4.8 (128)") alineado a la derecha del tag
- **Título**: Nombre del spot en tipografía grande y bold (`textStyles.heading` - 32px)
- **Subtítulo**: Categoría • Distancia (ej: "Historical landmark • 0.2 mi away")
- **Botón Primario**: "Start from here" con icono de play, fondo tint (magenta), texto blanco
  - Descripción debajo: "We'll build the path as you move."
  - **Nota**: Al presionar este botón, se inicia un Flow desde este Spot. El sistema formará más spots por recomendación mientras el usuario navega, y al terminar se le preguntará si quiere guardar el Path creado.

**4. Secciones Scrollables:**
- **"Why it matters"**: Título bold + párrafo descriptivo explicando la importancia del lugar
- **"Cultural context"**: Título bold + párrafo descriptivo (expandible con flecha)
- **"Location"**: Título bold + mapa mostrando la ubicación del spot (SimpleMapView)
- **"How to visit"**: Título bold + cards con iconos:
  - "Best time" card: Icono sol + texto con recomendaciones de horario
  - "Photography" card: Icono cámara + texto con información sobre fotografía
- **"Plan info"**: Título bold + cards con información práctica:
  - "HOURS" card: Icono reloj + horarios + estado "Open now" (si aplica)
  - "COST" card: Icono dinero + precio y detalles de costo
  - "RESTRICTIONS" card: Icono pata + restricciones (ej: "No pets")
  - "ACCESSIBILITY" card: Icono silla de ruedas + información de accesibilidad
- **"Suggest an edit"**: Botón con borde punteado, icono lápiz + texto

**5. Menú de Opciones (tres puntos):**
- Al presionar el botón de menú (tres puntos) se muestra un menú con opciones:
  - "Suggest an edit" - Permite al usuario sugerir cambios al spot
  - "Reportar" - Permite reportar problemas con el spot
  - "Este lugar ya no existe" - Permite indicar que el lugar ya no está disponible
- El menú se muestra como un overlay o modal discreto

#### CARACTERÍSTICAS TÉCNICAS

- Pantalla completa (no modal ni drawer)
- Navegación mediante botón "Back" o gesto de navegación nativo
- Scroll vertical para todo el contenido (incluyendo la imagen)
- Header sticky con controles que permanecen fijos
- Secciones con espaciado consistente según sistema de espaciado
- Cards internas con estilo glass sutil
- Acciones integradas con SavedContext (save)
- Integración con FlowContext para iniciar un path desde el spot
- **Nota importante**: 
  - El botón "Like" NO está disponible en Spot Detail. Los likes solo se pueden otorgar desde el Flow Player durante la navegación.
  - Los Paths se crean iniciando un Flow desde un Spot. El sistema formará más spots por recomendación mientras el usuario navega, y al terminar se le preguntará si quiere guardar el Path creado. No hay opción de "guardar a un path" manualmente.

**Arquitectura V2.0:**
- Usa `useBaseLocation()` para obtener ubicación
- Calcula distancia usando `getSpotDistance()`
- InfoMeta muestra solo `chip`, `distance` y `rating` (sin duration)

---

### FLOW

Flow es el estado activo de movimiento.
Cuando Flow está activo, la interfaz baja el volumen y el mundo sube.
El Flow acompaña, no dirige.

Flow incluye:
- **FlowScreen**: Pantalla completa cuando Flow está activo (Modal overlay)
- **FlowMiniPlayer**: Player minimizado que flota sobre el tab bar cuando Flow está activo
- **Flow Full Player**: Pantalla completa expandida que muestra información detallada del Flow actual

#### FLOW MINI PLAYER

FlowMiniPlayer es el player minimizado que aparece sobre el tab bar cuando Flow está activo y minimizado.

**Diseño:**
- Fullwidth: Ocupa todo el ancho del viewport (sin márgenes laterales)
- Sin bordes redondeados: Se fusiona con los bordes del viewport (borderRadius: 0)
- Efecto glass con blur y transparencia
- Posicionado justo sobre el tab bar (con efecto glass también)

**Contenido:**
- Imagen del spot actual (pequeña, 32px)
- Nombre del spot actual
- Distancia al spot (conversión métrico/imperial al tocar)

**Controles:**
- Botón "Atrás" (icon.previous) - Navega al spot anterior
- Botón "Play/Pause" (icon.play/pause) - Pausa/reanuda el Flow según estado
- Botón "Adelante" (icon.next) - Navega al spot siguiente

**Comportamiento:**
- Tap en el área general del player: Expande y abre FlowScreen completo (expandFlow)
- Tap en distancia: Alterna entre sistema métrico e imperial (no expande)
- Tap en controles (atrás, play/pause, adelante): Ejecuta su acción específica (no expande)

#### FLOW SCREEN

FlowScreen es la pantalla principal cuando Flow está activo.

**Header:**
- Nombre del spot actual (textStyles.heading3) a la izquierda
- Badge "Live" a la derecha del nombre
- Metadata debajo del nombre (en línea horizontal):
  - Distancia al spot actual (icono mapa + distancia en m/km)
  - Tiempo estimado al siguiente spot (icono reloj + minutos)
- Botones de afinidad a la derecha del badge Live:
  - Botón "Like" (icon.like) - Da like al spot actual (solo disponible desde el player)
  - Botón "Not My Vibe" (icon.notMyVibe) - Marca el spot como no de mi interés
  - Feedback visual: Color tint cuando está activo, color icon cuando inactivo
  - Área táctil mínima: 48px x 48px
- Controles a la derecha:
  - Botón "Minimizar" (icon.minimize) - Minimiza Flow y muestra FlowMiniPlayer sobre el tab bar
  - Botón "Cerrar" (icon.close) - Cierra Flow y regresa a la pantalla de origen

**Stepper compacto:**
- Barra de progreso ultra reducida (2-3px de altura) arriba de los tabs List/Map
- Formato de progreso: "1/5" (spot actual / total de spots) en lugar de porcentaje
- Estilo minimalista, casi invisible, solo indicador visual sutil
- Color tint para la barra de progreso, fondo con opacidad baja
- Ubicación: Entre el header y el segmented control

**Vista List (por defecto):**
- Segmented control: "List" y "Map"
- Progreso del Path (barra visual y porcentaje)
- Listado de spots del Path con formato drag and drop (debajo del spot actual):
  - PathSpotCard para cada spot
  - Indicador visual del spot actual (isActive)
  - Funcionalidad de reordenamiento mediante drag and drop
  - Spots futuros se muestran en listado

**Controles inferiores:**
- Pausar/Reanudar (icon.pause/play)
- Siguiente (icon.next)
- Botones de afinidad (Like / Not My Vibe) - Integrados en FlowPlayerControls
- Más opciones (icon.more) - Navega a Flow Full Player

**Comportamiento de Minimizar:**
- Al presionar "Minimizar" en el header:
  - FlowScreen se oculta
  - FlowMiniPlayer aparece sobre el tab bar (justo encima)
  - El Flow permanece activo en segundo plano
  - El usuario puede continuar navegando la app

**Comportamiento de Cerrar:**
- Al presionar "Cerrar" en el header:
  - Se muestra un diálogo/opción para guardar el Path creado:
    - Opción "Guardar Path"
    - Opción "Cerrar sin guardar"
  - Si el usuario selecciona "Guardar Path":
    - El Path se guarda en SavedContext
    - Se cierra FlowScreen
    - Se regresa a la pantalla de origen (de donde vino el usuario)
  - Si el usuario selecciona "Cerrar sin guardar":
    - Se cierra FlowScreen sin guardar
    - Se regresa a la pantalla de origen

#### FLOW FULL PLAYER

Flow Full Player es una sección completa (pantalla completa) que muestra información expandida del Flow activo.

**Estructura visual:**

**1. Header:**
- Título del Path actual
- Descripción del Path (si está disponible)
- Botón "Close" para regresar

**2. Progreso:**
- Barra de progreso visual mostrando el porcentaje completado del Path
- Texto con porcentaje completado

**3. Current Spot:**
- Sección destacada mostrando el Spot actual
- Botones de afinidad:
  - Botón "Like" para dar like al spot actual (solo disponible desde el player)
  - Botón "Not My Vibe" para marcar el spot como no de mi interés
- SpotCard completa del spot actual

**4. Full Route:**
- Lista completa de todos los Spots del Path
- PathSpotCard para cada spot
- Indicador visual del spot actual (isActive)

**5. Controles:**
- Botón de mute/unmute para la narración
- Información del estado de la narración (activa o silenciada)
- Texto de la narración actual (si está disponible)

**Navegación:**
- Accesible desde FlowScreen presionando el botón "more" (tres puntos)
- Accesible desde FlowMiniPlayer presionando el botón de navegación o tocando el player
- Solo accesible cuando un Flow está activo
- Navegación de regreso usando botón "Close" o gesto de back

**Características técnicas:**
- Pantalla completa (no modal ni drawer)
- Usa expo-router para navegación
- Accede al estado del Flow mediante FlowContext
- Contenido scrollable
- Mantiene funcionalidad de like, mute y visualización de progreso

---

## NARRACIÓN EN FLOW

La narración no es un audio-tour.
Es un sistema narrativo reactivo al movimiento.

Su función es generar emoción, contexto y presencia.
No explicar todo.

### ACTIVACIÓN

La narración se activa por eventos del Flow:
- aproximación a un Spot
- llegada a un Spot
- salida de un Spot
- trayectos entre Spots dentro de un Path

### TIPOS

**Anticipación**: prepara la mirada.

**Presencia**: ancla al usuario en el momento.

**Transición**: cierra sin romper el Flow.

**Contexto de Path**: da coherencia emocional.

### REGLAS

- Nunca se superponen audios.
- Nunca se repite la misma narración.
- Nunca obliga a escuchar.
- Siempre se puede silenciar.
- El silencio también es diseño.

Las señales de afinidad influyen en la narración:
- Likes refuerzan tonos.
- Not my vibe reduce narraciones similares.

---

## SISTEMA DE AFINIDAD EN FLOW

### COMPORTAMIENTO

**Durante un Flow activo:**
- Los likes y "Not My Vibe" se registran inmediatamente en SavedContext
- "Not My Vibe" filtra automáticamente spots similares de las sugerencias del flow
- El sistema no sugiere más spots del mismo tipo si el usuario marcó uno como "Not My Vibe"
- Los likes refuerzan la aparición de spots similares en sugerencias futuras

**Persistencia:**
- Los likes desde el player se guardan en "likedSpotsFromPlayer"
- Los "Not My Vibe" se guardan en "notMyVibeSpots"
- Ambas listas persisten en SavedContext y se sincronizan con el timeline

**Feedback visual:**
- Botones de afinidad muestran estado activo con color tint
- Estado inactivo usa color icon (gris)
- Transición suave al cambiar de estado
- Área táctil mínima: 48px x 48px

**Reglas de exclusión mutua:**
- Like y Not My Vibe son mutuamente excluyentes
- Al dar Like, se quita Not My Vibe si estaba marcado
- Al dar Not My Vibe, se quita Like si estaba marcado

**Influencia en narración:**
- Likes refuerzan tonos similares y aumentan frecuencia de narrations relacionadas
- Not my vibe reduce narraciones similares y filtra contenido relacionado
- El sistema aprende de las preferencias del usuario durante el flow
- Las narrations futuras se adaptan basándose en las señales de afinidad acumuladas

**Ubicación de controles:**
- FlowScreen: Botones de afinidad en el header (junto al badge Live) y en controles inferiores (FlowPlayerControls)
- Flow Full Player: Botones de afinidad en la sección Current Spot y en controles inferiores (FlowPlayerControls)
- Flow Mini Player: No incluye botones de afinidad (mantiene diseño minimalista)

---

## FASES DE DESARROLLO

FLOWYA se desarrolla en fases claramente diferenciadas.
La primera fase es para pruebas internas.
La segunda fase es para usuarios reales.

---

### FASE 1: PRUEBAS INTERNAS

Durante las pruebas internas, el foco está en funcionalidad y estabilidad.
No se requiere onboarding completo.
Los permisos se manejan de forma directa.

#### GESTIÓN BÁSICA DE PERMISOS (PRUEBAS)

**Permisos de ubicación:**
- Solicitud directa sin explicación extensa.
- Manejo básico de denegación.
- Modo manual como fallback.
- Estado visible en logs para debugging.

**Permisos de notificaciones:**
- Opcional para testing.
- Manejo básico de denegación.
- App funcional sin notificaciones.

#### DETECCIÓN AUTOMÁTICA DE UBICACIÓN

**Arquitectura V2.0:**
- La ubicación se detecta automáticamente al montar `LocationProvider` en `_layout.tsx`
- Se carga UNA SOLA VEZ al iniciar la app
- Disponible para toda la app mediante `useBaseLocation()`
- Si hay permisos, el contenido se reorganiza por cercanía
- Spots y Paths cercanos aparecen primero
- Si no hay permisos, funciona en modo manual
- El estado de ubicación es visible pero discreto

#### CREACIÓN DE CUENTA Y AUTENTICACIÓN (VERSIÓN BÁSICA)

- Registro con validación de email.
- Login funcional.
- Recuperación de contraseña (puede ser básica en pruebas).
- Opción de uso sin cuenta (modo guest limitado).
- Manejo de sesión persistente.

#### CONSULTA OFFLINE BÁSICA

- Acceso a Spots guardados sin conexión.
- Paths guardados disponibles offline.
- Narrativas descargadas previamente funcionan offline.
- Sincronización automática cuando vuelve la conexión.
- Indicador claro de estado offline.

---

### FASE 2: USUARIOS REALES

Cuando FLOWYA está listo para usuarios reales, se agregan capas de experiencia.
El onboarding guía la primera experiencia.
Los permisos se explican con claridad.

#### ONBOARDING PARA USUARIOS NUEVOS

El onboarding es la primera experiencia guiada.
Explica el concepto de forma ligera: Spot, Path, Flow.
Solicita permisos con explicación clara de beneficios.
Permisos opcionales con contexto.
Sin tutorial extenso.
Tono conversacional y respetuoso.

#### GESTIÓN COMPLETA DE PERMISOS (PRODUCCIÓN)

**Permisos de ubicación:**
- Explicación: "Para mostrarte lugares cercanos y activar Flow".
- Manejo de denegación: modo manual de ubicación.
- Permisos en tiempo de ejecución (iOS/Android).
- Opción de solicitar nuevamente desde Profile.

**Permisos de notificaciones:**
- Explicación: "Para avisarte cuando estés cerca de lugares guardados".
- Manejo de denegación: app funcional sin notificaciones.
- Configuración en Profile para activar/desactivar.

Estado de permisos visible en Profile.
Flujo: Onboarding · Primera interacción relevante · Profile.

---

## FUNCIONALIDADES ADICIONALES (POST-MVP)

Estas funcionalidades se desarrollan después del MVP inicial.
No son críticas para el lanzamiento.
Se integran progresivamente.

### CLIMA CON LENGUAJE CONVERSACIONAL

El clima no es un widget.
Es consejo contextual en lenguaje humano.

**Ejemplos:**
- "Lleva un paraguas, lloverá un poco".
- "No olvides tu bloqueador".
- "Mejor visitar por la tarde, mejor visibilidad por la humedad".
- "Trae un rompe vientos".

Se integra en Flow y preparación de Paths.
Requiere conexión a internet.
No es crítico si falla.

### RECOMENDACIONES DE FLOWS PERSONALIZADAS

"Flows hechos para ti" basados en preferencias.

El sistema aprende de:
- Spots guardados.
- Paths recorridos.
- Afinidades (likes/not my vibe).
- Ubicación actual.

Las sugerencias son discretas.
No intrusivas.
El usuario siempre puede ignorar.

### NOTIFICACIONES CONTEXTUALES

Requiere permisos de notificaciones.

Avisos discretos cuando estás cerca de un Spot guardado.
Recordatorios de Paths guardados según ubicación.
Sin interrupciones agresivas.

**Configurables en Profile:**
- Activar/desactivar por tipo.
- Horarios de notificaciones.

Si los permisos se deniegan, la funcionalidad se deshabilita sin errores.

### SINCRONIZACIÓN ENTRE DISPOSITIVOS

Requiere cuenta de usuario.

Spots, Paths y Saved se sincronizan.
Continuidad entre dispositivos.
El usuario puede continuar en otro dispositivo.

### EXPORTAR/IMPORTAR DATOS

El usuario tiene control sobre sus datos.

Puede exportar:
- Backup de Saved.
- Paths personalizados.

Formato JSON simple.
Puede importar datos exportados.

### FILTROS Y BÚSQUEDA AVANZADA

Filtros integrados en Search y Explore.

- Por tipo de lugar.
- Por distancia.
- Por tiempo estimado.

Sin complejidad innecesaria.
Los filtros son herramientas, no protagonistas.

### COMPARTIR SPOTS Y PATHS

Compartir vía link o exportar.

Mantiene el tono conversacional.
"Comparte este lugar" / "Comparte este camino".

### HISTORIAL DE MOVIMIENTO

Registro ligero de lugares visitados.

Visualización opcional en Saved.
"Lugares que visitaste".

Sin tracking invasivo.
Requiere permisos de ubicación (opcional).
Puede funcionar sin historial.

### MODO ACCESIBILIDAD

- Texto a voz para narrativas.
- Contraste alto opcional.
- Áreas táctiles ampliadas.

Configuración en Profile.
No requiere permisos adicionales.

### ESTADÍSTICAS PERSONALES (OPCIONAL)

- Lugares visitados.
- Tiempo en Flow.

Sin gamificación.
Solo para el usuario.
Opcional y discreto.

---

## FLOWYA
### Design Rules & UI Constraints (para Cursor)

### ESPACIADO

Sistema base 8px.
Solo se permiten múltiplos definidos.
El espacio es parte del tono emocional.

### LAYOUT

- Mobile-first.
- Columna única.
- Scroll natural.
- No layouts densos.
- No tablas.
- No múltiples columnas simultáneas.

### BLUR Y MATERIALES

Uso de blur tipo Apple.
Permitido en:
- top bars
- bottom bars
- overlays
- drawers

No usar blur decorativo.
El blur reduce ruido, no llama la atención.

### CAPAS Y JERARQUÍA

La profundidad se comunica con:
- blur
- movimiento
- elevación suave

No usar bordes visibles.
No usar sombras duras.

### TIPOGRAFÍA

- Usar Inter como única tipografía.
- Priorizar legibilidad.
- Frases cortas.
- No justificar texto.
- Pocos tamaños bien definidos.

### ICONOGRAFÍA

- Usar Lucide Icons como única librería.
- Iconos lineales y minimalistas.
- No mezclar librerías.
- Usar nombres semánticos.
- Los iconos nunca son protagonistas.

### ÁREAS TÁCTILES

- Todos los elementos accionables deben tener áreas cómodas.
- Área mínima tocable: 48px x 48px.
- Evitar interacciones de precisión.
- La interfaz debe poder usarse caminando.

### MOVIMIENTO

- Animaciones suaves y cortas.
- Sin rebotes.
- El movimiento acompaña, no presume.

### ESTADOS

Toda pantalla debe contemplar:
- estado vacío
- estado cargando (con skeleton)
- estado activo

Evitar loaders agresivos.
Preferir silencios o skeletons.

**Arquitectura V2.0:**
- Skeletons se muestran mientras `isLoading === true`
- Transición suave skeleton → contenido
- Empty states solo cuando `!isLoading && !hasData`

### PRINCIPIO VISUAL FINAL

FLOWYA nunca debe competir con el lugar.
La interfaz debe sentirse calma, presente y casi invisible.

El sistema acompaña.
El usuario decide.

---

## CAMBIOS DE V1.0 A V2.0

### Arquitectura

**Nuevo en V2.0:**
- `LocationProvider`: Fuente única de verdad para ubicación
- `utils/dataPreparation.ts`: Funciones puras de preparación de datos
- Separación estricta de capas (Sistema → Preparación → UI)
- Skeleton loaders consistentes en todas las pantallas
- Componentes visuales "tontos" (solo reciben datos preparados)

**Eliminado en V2.0:**
- `duration` de `InfoMeta` (eliminado completamente)
- Lógica de ubicación duplicada en componentes
- Cálculo de distancias dentro de cards
- Preparación de datos dentro de componentes

### Componentes

**InfoMeta:**
- V1.0: Props: `chip`, `distance`, `duration`, `rating`
- V2.0: Props: `chip`, `distance`, `rating` (duration eliminado)

**Cards:**
- V1.0: Algunas cards calculaban distancia internamente
- V2.0: Todas las cards reciben `distance` como prop (pre-calculada)

### Sistema de Ubicación

**V1.0:**
- Hook `useBaseLocation` con lógica propia
- Cada pantalla podía tener su propia lógica de ubicación

**V2.0:**
- `LocationProvider` centralizado en `_layout.tsx`
- `useBaseLocation()` hook canónico que consume el provider
- Ubicación se carga UNA SOLA VEZ al montar
- Ubicación congelada durante sesión

### Preparación de Datos

**V1.0:**
- Lógica de preparación mezclada en componentes
- Funciones dentro de componentes

**V2.0:**
- `utils/dataPreparation.ts`: Funciones puras fuera de componentes
- `prepareHomeData()`: Función centralizada para Home Screen
- Tipos centralizados: `SpotWithDistance`, `FlowWithDistance`, `HomeData`

### Estados de Carga

**V1.0:**
- Skeletons no se usaban consistentemente
- Parpadeo en carga inicial
- Empty states aparecían durante carga

**V2.0:**
- Skeletons consistentes en todas las pantallas
- Sin parpadeo en carga inicial
- Empty states solo cuando `!isLoading && !hasData`
- Helpers: `shouldShowSkeleton()`, `anyLoading()`, `renderContentSkeletonOrEmpty()`

### Sistema de Regiones

**V1.0:**
- Sistema de regiones inconsistente o ausente
- Regiones podían duplicarse
- Nivel de región inconsistente

**V2.0:**
- Sistema de regiones Mapbox-driven
- Deduplicación canónica por `regionId` (nunca por label o strings libres)
- Nivel de región: Preferir capital/ciudad principal (`place`), fallback a nivel administrativo (`region`)
- Opción "Current location" en dropdown (región dinámica basada en ubicación real del usuario)
- Regiones se preparan en capa de preparación (`core/region/getAvailableRegionsFromSpots`)
- UI solo renderiza listas ya normalizadas
- Spots inconsistentes se eliminan automáticamente (no se intentan arreglar)
- Secciones globales ("Maybe You Like", "New Spots") independientes de región activa

---

## DOCUMENTACIÓN TÉCNICA V2.0

### Fuentes Únicas de Verdad

**Ubicación:**
- `contexts/LocationContext.tsx` - LocationProvider
- Hook: `useBaseLocation()`
- Tipo: `BaseLocation`

**Preparación de Datos:**
- `utils/dataPreparation.ts` - Funciones puras
- Tipos: `SpotWithDistance`, `FlowWithDistance`, `HomeData`, `BaseLocation`

**Distancias:**
- `hooks/useSpotDistance.ts` - Selector puro `getSpotDistance()`
- NO se calcula dentro de cards
- Se pasa como prop

### Hooks Canónicos

- `useBaseLocation()` - Ubicación del usuario (fuente única)
- `getSpotDistance()` - Selector puro para calcular distancia
- `useSpotsWithDistance()` - Hook para calcular distancias de múltiples spots

### Helpers de Carga

- `shouldShowSkeleton(isLoading, hasData)` - Determina si mostrar skeleton
- `shouldShowEmpty(isLoading, hasData)` - Determina si mostrar empty state
- `shouldShowContent(isLoading, hasData)` - Determina si mostrar contenido
- `anyLoading(...loadingStates)` - Combina múltiples estados de carga
- `renderContentSkeletonOrEmpty()` - Renderiza condicionalmente

### Componentes Canónicos

**InfoMeta:**
- Props: `chip`, `distance`, `rating`, `size`
- NO incluye `duration`
- Responsabilidad: Renderizar información secundaria

**Cards:**
- Todas reciben `distance` como prop
- NO calculan distancia internamente
- Solo renderizan datos preparados

---

**Documento generado:** 2024-12-20  
**Versión del Proyecto:** FLOWYA V2.0  
**Estado:** Arquitectura V2.0 completada y documentada
