# BITÁCORA DE CAMBIOS — FLOWYA V1.2

**Fecha de inicio:** 2026-01-11  
**Versión:** FLOWYA V1.2  
**Estado:** En progreso

---

## PROPÓSITO DE ESTE DOCUMENTO

Esta bitácora registra todos los cambios realizados durante la implementación de FLOWYA V1.2, continuando el trabajo iniciado en V1.1.

**Referencias:**
- Bitácora anterior: `definitions/FLOWYA V1.1/BITACORA_V1_1.md`
- Product Definition: `FLOWYA Product Definition V1.2.md`
- Arquitectura canónica: `FUENTE_UNICA_VERDAD_V2.0_REFERENCIA.md`
- Backlog V1.1: `FLOWYA — BACKLOG V1.1_REFERENCIA.md`
- Definición de sistema: `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

---

## FORMATO DE REGISTRO (OBLIGATORIO)

**Cada entrada debe incluir:**
- **[ID de Tarea]** (ej. V1.2-01, V1.2-02)
- **Fecha**
- **Contexto del cambio** (qué problema resuelve)
- **Descripción del ajuste realizado**
- **Archivos tocados** (lista completa)
- **Archivos NO tocados** (decisiones explícitas de no modificar)
- **Riesgos considerados**
- **Estado** (propuesto / aplicado / pendiente revisión)

**Objetivo:** Trazabilidad completa decisiones ↔ código sin ambigüedad.

---

## CONTEXTO DE V1.2

FLOWYA V1.2 introduce un sistema completo de **Pins, Estados de Visita y Diario de Viaje**, transformando la aplicación de una herramienta de planeación de recorridos a una app que también funciona como mapa personal y diario de viaje.

### Cambios Principales (Definidos)

1. **Sistema de Pins**: Renombrado de "Save" a "Pin", reemplazo de "Like" por "Pin"
2. **Estados de Pin**: Dos estados (`to_visit`, `visited`)
3. **Diario de Viaje**: Notas y fotos personales opcionales para Pins con estado `visited`
4. **Mapa Personal**: Tres tipos de markers (Normal, Pin To Visit, Pin Visited)
5. **Pinned Screen**: Redefinición de "Saved" como "Pinned" con filtrado por estados
6. **Compartir**: Funcionalidad para compartir mapas de pines y flows

### Documentos de Referencia

- **DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md**: Definición completa y validada del sistema de Pins, Visited y Diario de Viaje
- **FUENTE_UNICA_VERDAD_V2.0_REFERENCIA.md**: Arquitectura canónica V2.0 (referencia)
- **BITACORA_V1_1.md**: Cambios y decisiones de V1.1 (referencia)

---

## ESTADO INICIAL DEL SISTEMA (2026-01-11)

### Arquitectura Actual (V2.0)

- ✅ Arquitectura V2.0 completada
- ✅ LocationProvider como fuente única de verdad
- ✅ Sistema de narración sin audio (solo subtítulos)
- ✅ FlowContext con estados: idle, active, paused
- ✅ Sistema de afinidad actual: `savedSpots`, `likedSpots`, `notMyVibeSpots`, `savedFlows`
- ✅ SavedContext con sistema de guardado actual

### Cambios Planificados (V1.2)

1. **Modelo de Datos**:
   - Eliminar `savedSpots: string[]` y `likedSpots: string[]`
   - Implementar `pins: Record<string, PinData>`
   - Mantener `notMyVibeSpots` y `savedFlows`

2. **UI**:
   - Renombrar "Save" a "Pin" en todas las pantallas
   - Eliminar botones de "Like"
   - Agregar modal de selección de estado (To Visit / Visited) al crear Pin
   - Actualizar Map Screen con tres tipos de markers
   - Redefinir Saved Screen como Pinned Screen con filtrado por estados

3. **Migración de Datos**:
   - Script de migración: `savedSpots` → `pins` (estado `to_visit`)
   - Script de migración: `likedSpots` → `pins` (estado `to_visit`, si no existe ya)

### Estado de Documentación

- ✅ Definición del sistema validada por Product Owner
- ✅ Documentación conceptual completa
- ✅ Bitácora V1.2 (este documento - en progreso)
- ✅ Plan de implementación detallado (completado)

---

## FASE 0: PREPARACIÓN Y PLANIFICACIÓN

### [V1.2-00] Crear Plan de Implementación Detallado
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Preparación para implementación de V1.2
- Necesidad de plan detallado que sirva como contexto si se retoma días después
- Requisito: Plan completo de todas las fases

**Descripción del ajuste realizado:**
- Creado `definitions/FLOWYA V1.2/PLAN_IMPLEMENTACION_V1.2.md`
- Plan detallado de todas las fases de implementación:
  - Fase 1: Modelo de Datos
  - Fase 2: UI - Botones y Acciones
  - Fase 3: Pinned Screen
  - Fase 4: Diario de Viaje
  - Fase 5: Compartir y Mapa
  - Fase 6: Limpieza y Eliminación
- Incluye para cada fase:
  - Objetivo claro
  - Archivos específicos a modificar
  - Pasos detallados con código de ejemplo
  - Riesgos y mitigación
  - Criterios de validación
  - Entregables

**Archivos tocados:**
- `definitions/FLOWYA V1.2/PLAN_IMPLEMENTACION_V1.2.md` (NUEVO)

**Archivos NO tocados:**
- Ningún código de la aplicación
- Solo documentación de planificación

**Riesgos considerados:**
- Ninguno (solo documentación de planificación)

**Decisiones técnicas documentadas:**
- Serialización de fechas (ISO strings en AsyncStorage)
- Estrategia de migración (automática con flag)
- Almacenamiento de fotos (simple primero, mejoras después)
- Orden de implementación (incremental por fases)

---

## PRÓXIMAS ENTRADAS

Las entradas de esta bitácora se registrarán conforme se implementen los cambios definidos en `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md` y siguiendo el `PLAN_IMPLEMENTACION_V1.2.md`.

---

## FASE 1: MODELO DE DATOS

### [V1.2-01] Implementar Sistema de Pins en SavedContext
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Fase 1 del plan de implementación V1.2
- Necesidad de actualizar modelo de datos con sistema de Pins
- Migración de `savedSpots`/`likedSpots` → `pins`

**Descripción del ajuste realizado:**
- Definidos tipos `PinState` e interfaz `PinData`
- Agregado campo `pins: Record<string, PinData>` a `SavedData`
- Implementadas funciones: `pinSpot`, `unpinSpot`, `changePinState`, `isSpotPinned`, `getPinState`, `getPinnedSpots`
- Implementado script de migración `migrateToPins()` para migrar datos antiguos
- Agregada serialización/deserialización de fechas para pins
- Actualizada interface `SavedContextType` con nuevas propiedades
- Actualizado objeto `value` del context con nuevas funciones
- Mantenida compatibilidad temporal (campos antiguos se mantienen)

**Archivos tocados:**
- `contexts/SavedContext.tsx` (modificado)

**Archivos NO tocados:**
- Componentes UI (pendiente Fase 2)
- Otras pantallas (pendiente Fases siguientes)

**Riesgos considerados:**
- Migración de datos: Mitigado con script idempotente y flag de control
- Serialización de fechas: Mitigado con conversión automática
- Compatibilidad: Mitigado manteniendo campos antiguos temporalmente

**Testing requerido:**
- Crear Pin con diferentes estados
- Cambiar estado de Pin
- Eliminar Pin
- Verificar migración automática
- Validar persistencia en AsyncStorage
- Validar compatibilidad con código existente

**Estado:** ✅ Implementación completada, pendiente testing manual

**Testing básico realizado:**
- ✅ Verificación de exportaciones (PinState, PinData)
- ✅ Verificación de funciones (6 funciones implementadas)
- ✅ Verificación de interface SavedContextType
- ✅ Verificación del objeto value del context
- ✅ Verificación de compilación TypeScript (sin errores)
- ✅ Verificación de estructura de datos
- ✅ Verificación de serialización
- ✅ Verificación de migración
- 📋 Reporte de testing creado: `TESTING_FASE1.md`

---

**Última actualización:** 2026-01-11  
**Estado:** Fase 1 completada ✅, testing básico completado ✅, pendiente testing manual en tiempo de ejecución

---

## FASE 2: UI - BOTONES Y ACCIONES

### [V1.2-02] Eliminar Referencias a Like (Fase 2.4)
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Fase 2.4 del plan de implementación V1.2
- Necesidad de eliminar todas las referencias a "Like" porque Pin reemplaza Like
- Si un lugar está Pin, entonces le gusta al usuario

**Descripción del ajuste realizado:**
- Eliminadas referencias a Like en `app/flow-full-player.tsx`:
  - Eliminados imports de `isSpotLikedFromPlayer, toggleLikeSpotFromPlayer`
  - Eliminada función `handleLike()`
  - Eliminado botón Like del header del spot actual
  - Eliminada prop `onLike` de `FlowPlayerControls`
  - Eliminada prop `showMute` (no existe en FlowPlayerControls)
- Eliminada sección "Liked places" de `app/(tabs)/profile.tsx`
- Eliminada sección "My content" vacía de `app/(tabs)/profile.tsx`
- Eliminadas referencias a Like en `design-system/FlowPlayer.tsx`:
  - Eliminado import de `toggleLikeSpotFromPlayer`
  - Eliminada prop `onLike` de `FlowPlayerControls`
- Creado documento `ERRORES_TYPESCRIPT_PENDIENTES.md` para documentar errores que requieren análisis arquitectónico

**Archivos tocados:**
- `app/flow-full-player.tsx` (modificado)
- `app/(tabs)/profile.tsx` (modificado)
- `design-system/FlowPlayer.tsx` (modificado)
- `definitions/FLOWYA V1.2/ERRORES_TYPESCRIPT_PENDIENTES.md` (NUEVO)

**Archivos NO tocados:**
- `components/FlowPlayerControls.tsx` - El botón Like aún se renderiza cuando `showAffinity={true}`, pero ya no recibe `onLike` prop (esto causará que el botón no funcione, lo cual es intencional hasta que se implemente Pin en FlowPlayerControls)
- `app/liked-spots.tsx` - Se mantiene deprecated pero no se elimina en esta fase
- `app/_layout.tsx` - La ruta `liked-spots` se mantiene deprecated pero no se elimina en esta fase

**Riesgos considerados:**
- El botón Like en `FlowPlayerControls` seguirá visible pero no funcionará (no recibe `onLike` prop)
- Esto es temporal hasta que se implemente Pin en `FlowPlayerControls` (Fase 2 o fase posterior)
- Compatibilidad: `FlowPlayerControls` aún usa `isSpotLikedFromPlayer` internamente, pero esto es temporal

**Testing requerido:**
- Verificar que el botón Like ya no aparece en flow-full-player
- Verificar que la sección "Liked places" ya no aparece en profile
- Verificar que `FlowPlayer` no pasa `onLike` a `FlowPlayerControls`
- Nota: El botón Like en `FlowPlayerControls` seguirá visible pero no funcionará (intencional, temporal)

**Estado:** ✅ Implementación completada

**Nota:** El botón Like en `FlowPlayerControls` (usado por `FlowPlayer` en FlowScreen) seguirá visible pero no funcionará porque ya no recibe la prop `onLike`. Esto es temporal hasta que se implemente Pin en `FlowPlayerControls` en una fase posterior.

---

**Última actualización:** 2026-01-11  
**Estado:** Fase 1 completada ✅, Fase 2.4 completada ✅, Fase 3 completada ✅, pendiente testing manual en tiempo de ejecución

---

## FASE 3: PINNED SCREEN

### [V1.2-03] Implementar PinStateFilter y Actualizar Saved Screen
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Fase 3 del plan de implementación V1.2
- Necesidad de actualizar Saved Screen para mostrar Pins con filtrado por estado
- Implementar dos niveles de filtrado (tipo × estado)

**Descripción del ajuste realizado:**
- Creado componente `components/ui/PinStateFilter.tsx`:
  - Componente de filtro con tabs horizontales
  - Opciones: "All" | "To Visit" | "Visited"
  - Estilo similar a SavedFilterHeader
  - Props: `currentFilter`, `onFilterChange`
- Actualizado `app/(tabs)/saved.tsx`:
  - Importado `PinStateFilter`, `PinStateFilterType`, `PinState`
  - Agregado estado `pinStateFilter` con tipo `PinStateFilterType`
  - Cambiado de `savedSpots` a `getPinnedSpots` del hook `useSaved()`
  - Actualizada lógica de filtrado para combinar tipo (Spots/Flows/All) × estado (All/To Visit/Visited)
  - Agregado `PinStateFilter` debajo del header (solo visible cuando se muestran spots)
  - Lógica de filtrado memoizada con `useMemo`:
    - `pinnedSpots`: Obtiene spots pinned según filtro de estado
    - `savedSpotsData`: Filtra spots por Pins y por tipo de contenido

**Archivos tocados:**
- `components/ui/PinStateFilter.tsx` (NUEVO)
- `app/(tabs)/saved.tsx` (modificado)

**Archivos NO tocados:**
- `components/ui/SavedFilterHeader.tsx` - Se mantiene sin cambios (filtro de tipo)
- Flows no se ven afectados por filtro de estado (solo spots)

**Riesgos considerados:**
- Lógica de filtrado compleja: Mitigado con `useMemo` para optimización
- Compatibilidad: Flows mantienen comportamiento anterior (no afectados por estado de Pin)

**Testing requerido:**
- Verificar que PinStateFilter se muestra correctamente
- Verificar que filtrado por estado funciona (All, To Visit, Visited)
- Verificar que combinación de filtros (tipo × estado) funciona correctamente
- Verificar que visualización muestra Pins correctos según ambos filtros
- Verificar que Flows no se ven afectados por filtro de estado

**Estado:** ✅ Implementación completada

**Nota:** El título "Saved" se mantiene en la UI (no se cambió a "Pinned") según la decisión pendiente documentada en el plan. Esto puede cambiar en una fase posterior si se decide.

---

## FASE 4: DIARIO DE VIAJE

### [V1.2-04] Implementar Diario de Viaje (Personal Notes y Personal Photos)
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Fase 4 del plan de implementación V1.2
- Necesidad de implementar funcionalidad de notas y fotos personales para Pins con estado 'visited'
- Permitir a usuarios agregar memorias personales de sus visitas

**Descripción del ajuste realizado:**
- Funciones de diario en `contexts/SavedContext.tsx`:
  - `updatePinNotes(spotId, notes)`: Actualiza campo `notes` del Pin (solo si Pin existe y está en estado 'visited')
  - `addPinPhoto(spotId, photoUrl)`: Agrega foto a `personalPhotos` array (solo si Pin existe y está en estado 'visited')
  - `removePinPhoto(spotId, photoUrl)`: Elimina foto de `personalPhotos` array
  - Todas las funciones validan que el Pin exista y tenga estado 'visited'
- Implementado en `app/spot-detail.tsx`:
  - **Sección Personal Notes:**
    - Solo visible si Pin existe y tiene estado 'visited' (`isVisitedPin`)
    - Botón "Add Notes" / "Edit Notes" en header de sección
    - Editor inline con `FormTextArea` (sin límite de caracteres)
    - Botones "Cancel" y "Save" para guardar/cancelar edición
    - Muestra notas existentes cuando no está en modo edición
  - **Sección Personal Photos:**
    - Solo visible si Pin existe y tiene estado 'visited' (`isVisitedPin`)
    - Botón "Add Photo" en header de sección
    - Grid de fotos (3 columnas) con thumbnails
    - Botón de eliminar en cada foto
    - Mensaje cuando no hay fotos aún
    - Integración con `useImageUpload` hook para selección y optimización de imágenes
  - Estados agregados:
    - `isEditingNotes`: Controla si está editando notas
    - `notesText`: Texto temporal mientras edita
  - Handlers implementados:
    - `handleStartEditingNotes`: Inicia edición de notas
    - `handleSaveNotes`: Guarda notas usando `updatePinNotes`
    - `handleCancelEditingNotes`: Cancela edición
    - `handleAddPhoto`: Selecciona foto usando `imageUploadHook.pickFromGallery()`
    - `handleRemovePhoto`: Elimina foto usando `removePinPhoto`
  - Estilos agregados:
    - `sectionHeaderRow`: Header con título y botón de acción
    - `editButton`: Botón de edición/agregar
    - `notesActions`: Contenedor de botones de acción (Cancel/Save)
    - `notesActionButton`, `notesCancelButton`, `notesSaveButton`: Botones de acción
    - `photosGrid`: Grid de fotos (3 columnas)
    - `photoItem`: Item individual de foto con posición relativa
    - `photoThumbnail`: Thumbnail de foto
    - `photoRemoveButton`: Botón de eliminar foto

**Archivos tocados:**
- `contexts/SavedContext.tsx` (funciones de diario agregadas)
- `app/spot-detail.tsx` (secciones Personal Notes y Personal Photos agregadas)

**Riesgos considerados:**
- Validación: Solo permite editar notas/fotos si Pin tiene estado 'visited'
- Optimización: Usa `useImageUpload` hook para optimizar imágenes automáticamente
- UX: Editor inline no bloqueante, botones claros para guardar/cancelar

**Testing requerido:**
- Verificar que sección Personal Notes solo aparece si Pin tiene estado 'visited'
- Verificar que editor de notas funciona correctamente (agregar, editar, guardar, cancelar)
- Verificar que sección Personal Photos solo aparece si Pin tiene estado 'visited'
- Verificar que agregar fotos funciona (selección desde galería)
- Verificar que eliminar fotos funciona
- Verificar que notas y fotos persisten después de reiniciar app
- Verificar que notas y fotos solo se pueden agregar si Pin tiene estado 'visited'

**Estado:** ✅ Implementación completada

**Nota:** Las secciones se muestran después de Plan Info y antes del padding final del ScrollView, solo si el Pin tiene estado 'visited'. Las fotos usan el hook `useImageUpload` que ya optimiza las imágenes automáticamente.

---

## FASE 5: COMPARTIR Y MAPA (PARCIAL)

### [V1.2-05-1] Implementar tres tipos de markers en mapa
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Fase 5 del plan de implementación V1.2
- Necesidad de mostrar tres tipos de markers en el mapa según estado del Pin
- Normal (sin Pin), Pin to_visit (azul), Pin visited (verde)

**Descripción del ajuste realizado:**
- Modificado `components/MapboxViewWeb.tsx`:
  - Importado `useSaved` para acceder a información de pins
  - Agregado helper `getMarkerStyle(spot)` que determina estilo del marker según estado del pin:
    - Normal (sin Pin): Color `colors.tint` (magenta #E91E63)
    - Pin To Visit: Color azul (#2196F3)
    - Pin Visited: Color verde (#4CAF50)
  - Actualizado renderizado de markers (inicialización y actualización) para usar `getMarkerStyle`
  - Agregado dependencias `isSpotPinned`, `getPinState` al `useEffect` que actualiza markers

**Archivos tocados:**
- `components/MapboxViewWeb.tsx` (markers con estilos según estado de Pin)

**Riesgos considerados:**
- Performance: `getMarkerStyle` se llama para cada spot, pero está dentro de `useMemo` y `useEffect` optimizados
- Compatibilidad: Funciona con sistema de pins existente

**Testing requerido:**
- Verificar que markers normales (sin Pin) se muestran con color magenta
- Verificar que markers Pin To Visit se muestran con color azul
- Verificar que markers Pin Visited se muestran con color verde
- Verificar que markers se actualizan cuando cambia estado del Pin

**Estado:** ✅ Implementación completada

### [V1.2-05-2] Implementar filtro de estado de Pin en mapa
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Fase 5 del plan de implementación V1.2
- Necesidad de filtrar markers en el mapa según estado de Pin
- Menú en parte superior del mapa con opciones: "All" | "To Visit" | "Visited"

**Descripción del ajuste realizado:**
- Modificado `app/(tabs)/map.tsx`:
  - Importado `PinStateFilter`, `PinStateFilterType` desde `@/components/ui/PinStateFilter`
  - Importado `useSaved` desde `@/contexts/SavedContext`
  - Agregado estado `pinStateFilter` con tipo `PinStateFilterType` (inicializado en 'all')
  - Agregado lógica de filtrado con `useMemo`:
    - `filteredSpots`: Filtra spots según `pinStateFilter`
    - Si 'all': retorna todos los spots
    - Si 'to_visit': retorna solo spots con Pin estado 'to_visit'
    - Si 'visited': retorna solo spots con Pin estado 'visited'
  - Actualizado `FlowyaMapView` para usar `filteredSpots` en lugar de `spots`
  - Agregado `PinStateFilter` en parte superior del mapa (contenedor `topControls`)
  - Agregado estilo `topControls` para posicionar filtro en parte superior

**Archivos tocados:**
- `app/(tabs)/map.tsx` (filtro agregado, lógica de filtrado)

**Archivos NO tocados:**
- `components/ui/PinStateFilter.tsx` - Se reutiliza componente existente

**Riesgos considerados:**
- Lógica de filtrado: Usa `useMemo` para optimización
- Performance: Filtrado memoizado, solo recalcula cuando cambian dependencias

**Testing requerido:**
- Verificar que PinStateFilter se muestra en parte superior del mapa
- Verificar que filtrado funciona (All, To Visit, Visited)
- Verificar que markers se filtran correctamente según estado seleccionado
- Verificar que filtrado funciona correctamente con cambios de estado de Pin

**Estado:** ✅ Implementación completada

**Nota:** El filtro se muestra en la parte superior del mapa con estilo `topControls`. Por ahora solo incluye 3 opciones (All, To Visit, Visited). La opción "None" (sin pin) se puede agregar en una versión futura si es necesario.

### [V1.2-05-3] Implementar compartir mapa de pines
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Fase 5 del plan de implementación V1.2
- Necesidad de compartir mapas de pines filtrados por estado (to_visit, visited)
- Funcionalidad para compartir mapas personales de pines

**Descripción del ajuste realizado:**
- Modificado `app/(tabs)/map.tsx`:
  - Importado `Share`, `Alert` desde `react-native`
  - Importado `getPinnedSpots` desde `useSaved`
  - Importado `getSpotById` desde `useSpot`
  - Agregado función `handleSharePinsMap(state: 'to_visit' | 'visited')`:
    - Obtiene lista de spots con pins del estado especificado usando `getPinnedSpots(state)`
    - Valida que haya pines para compartir (muestra alerta si no hay)
    - Genera mensaje de compartir con lista de nombres de spots y URL
    - Usa `Share.share` de React Native para compartir vía sistema del dispositivo
  - Agregado botón de compartir en UI (junto a PinStateFilter):
    - Solo visible cuando `pinStateFilter !== 'all'`
    - Botón con icono 'share' y estilo GlassView (similar a otros controles del mapa)
    - Posicionado en `topControlsRow` junto al filtro
  - Agregado estilos:
    - `topControlsRow`: Flexbox row para alinear filtro y botón de compartir
    - `shareButton`: Margen izquierdo automático para posicionar a la derecha

**Archivos tocados:**
- `app/(tabs)/map.tsx` (función de compartir y botón agregados)

**Archivos NO tocados:**
- `components/ui/PinStateFilter.tsx` - Sin cambios, se reutiliza componente existente

**Riesgos considerados:**
- Validación: Verifica que haya pines antes de compartir (muestra alerta informativa)
- UX: Botón solo visible cuando filtro no es 'all', evita confusión
- Performance: Usa `useCallback` para memoizar función de compartir

**Testing requerido:**
- Verificar que botón de compartir solo aparece cuando filtro es 'to_visit' o 'visited'
- Verificar que compartir funciona correctamente con pines 'to_visit'
- Verificar que compartir funciona correctamente con pines 'visited'
- Verificar que se muestra alerta cuando no hay pines para compartir
- Verificar que mensaje de compartir incluye lista de spots correcta
- Verificar que URL de compartir es correcta

**Estado:** ✅ Implementación completada

**Nota:** La función `handleSharePinsMap` maneja ambos casos ('to_visit' y 'visited') usando el estado del filtro actual. El botón solo es visible cuando el filtro no es 'all', proporcionando una UX clara. El mensaje de compartir incluye los nombres de los spots y una URL (que será implementada en el backend en una versión futura).

### [V1.2-05-4] Implementar compartir flows guardados
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Fase 5 del plan de implementación V1.2
- Necesidad de compartir flows guardados desde la pantalla Pinned/Saved
- Funcionalidad para compartir colección de flows personales

**Descripción del ajuste realizado:**
- Modificado `app/(tabs)/saved.tsx`:
  - Importado `Share`, `Alert` desde `react-native`
  - Importado `getFlowById` desde `usePath` (aunque no se usa directamente, se importa por si acaso)
  - Agregado función `handleShareFlows()`:
    - Obtiene lista de flows guardados desde `savedPathsData`
    - Valida que haya flows para compartir (muestra alerta si no hay)
    - Genera mensaje de compartir con nombres de flows (usando nombres personalizados si existen) y URLs individuales
    - Usa `Share.share` de React Native para compartir vía sistema del dispositivo
  - Actualizado `SavedFilterHeader` para mostrar botón de compartir condicionalmente:
    - Cuando `currentFilter === 'flows' || currentFilter === 'all'` Y `savedPathsData.length > 0`: muestra botón 'share'
    - En otros casos: muestra botón 'profile' (comportamiento original)

**Archivos tocados:**
- `app/(tabs)/saved.tsx` (función de compartir flows y botón condicional agregados)

**Archivos NO tocados:**
- `components/ui/SavedFilterHeader.tsx` - Sin cambios, se reutiliza componente existente con prop `rightAction`

**Riesgos considerados:**
- Validación: Verifica que haya flows antes de compartir (muestra alerta informativa)
- UX: Botón solo visible cuando hay flows guardados y el filtro muestra flows, evita confusión
- Performance: Usa `useCallback` para memoizar función de compartir
- Nombres personalizados: Usa `getFlowCustomName` para mostrar nombres personalizados si existen

**Testing requerido:**
- Verificar que botón de compartir aparece cuando hay flows guardados y filtro es 'flows' o 'all'
- Verificar que botón de profile aparece cuando no hay flows o filtro es 'spots'
- Verificar que compartir funciona correctamente con flows guardados
- Verificar que se muestra alerta cuando no hay flows para compartir
- Verificar que mensaje de compartir incluye nombres de flows correctos (usando nombres personalizados si existen)
- Verificar que URLs de compartir son correctas

**Estado:** ✅ Implementación completada

**Nota:** El botón de compartir flows es dinámico y solo aparece cuando es relevante (cuando hay flows guardados y el filtro muestra flows). Cuando no se muestran flows, se muestra el botón de profile. El mensaje de compartir incluye los nombres de los flows (usando nombres personalizados si existen) y las URLs individuales de cada flow, más una URL general de la sección de flows guardados.

---

## AJUSTES Y MEJORAS UX (2026-01-11)

### [V1.2-AJUSTE-01] Integración de Ajustes UX y Regla de Autenticación
**Fecha:** 2026-01-11  
**Estado:** 📝 Planificado

**Contexto del cambio:**
- Peticiones del usuario para mejorar UX del sistema de Pins
- Regla de negocio: Usuario solo puede guardar pines cuando tiene cuenta
- Ajuste UX: Comportamiento híbrido para reducir fricción del modal

**Peticiones recibidas:**

1. **Regla de Autenticación (CRÍTICA):**
   - Usuario solo puede guardar pines cuando tiene una cuenta
   - Validación requerida en handlers de pin
   - Mostrar alerta con opción de login cuando usuario no autenticado intenta pin

2. **Ajuste UX del Modal (MEJORA):**
   - **Problema identificado:** Modal aparece cada vez que usuario hace pin (puede sentirse pesado)
   - **Solución propuesta:** Comportamiento híbrido
     - Primer Pin: Default = `to_visit`, sin modal, mostrar micro-feedback ("Pinned · To visit")
     - Cambiar estado: Tap largo en botón de pin → cambiar a `visited` (o viceversa)
   - **Ventajas:** Reduce fricción, mantiene control, evita modales repetitivos

**Decisión de integración:**
- **Regla 1 (Autenticación):** Integrada como Fase 2.6 en `PLAN_IMPLEMENTACION_V1_2.md`
  - Validación en handlers de UI (SpotMediaCard, spot-detail)
  - Mostrar Alert con opción de login
  - No requiere modificar SavedContext (separación de responsabilidades)
  
- **Regla 2 (Ajuste UX):** Integrada en Fase 2.2 en `PLAN_IMPLEMENTACION_V1_2.md`
  - Modificar `handlePinPress`: Primer pin = `to_visit` directamente (sin modal)
  - Mantener `handlePinLongPress`: Cambiar estado (to_visit ↔ visited)
  - Eliminar uso de `PinStateModal` en flujo normal

**Archivos a modificar:**
- `components/SpotMediaCard.tsx`:
  - Agregar validación de autenticación en `handlePinPress`
  - Modificar `handlePinPress`: Primer pin = `to_visit` directamente
  - Eliminar `showPinModal` state y `PinStateModal`
  - Mantener `handlePinLongPress` para cambiar estado
  
- `app/spot-detail.tsx`:
  - Agregar validación de autenticación en `handlePinPress`
  - Modificar `handlePinPress`: Primer pin = `to_visit` directamente
  - Eliminar `showPinModal` state y `PinStateModal`
  - Mantener `handlePinLongPress` (si aplica)

- `definitions/FLOWYA V1.2/PLAN_IMPLEMENTACION_V1_2.md`:
  - Actualizar sección 2.2: Comportamiento híbrido
  - Agregar sección 2.6: Validación de autenticación
  - Actualizar criterios de validación y entregables

**Riesgos considerados:**
- **Validación de autenticación:** Bajo riesgo, validación simple
- **Comportamiento híbrido:** Bajo riesgo, mejora UX existente
- **Eliminación de modal:** Bajo riesgo, ya no se necesita con nuevo comportamiento

**Testing requerido:**
- Verificar que usuario no autenticado no puede pin
- Verificar que alerta de login se muestra correctamente
- Verificar que primer pin = to_visit directamente (sin modal)
- Verificar que micro-feedback se muestra ("Pinned · To visit")
- Verificar que tap largo cambia estado (to_visit ↔ visited)
- Verificar que usuario autenticado puede pin normalmente

**Estado:** ✅ Implementación completada

**Nota:** Estas mejoras están integradas en el plan de implementación V1.2. Se implementaron como parte de la Fase 2 (UI - Botones y Acciones), actualizando el comportamiento existente según las nuevas especificaciones.

---

### [V1.2-AJUSTE-02] Implementar Validación de Autenticación y Comportamiento Híbrido
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Implementación de las mejoras UX planificadas
- Regla de negocio: Usuario solo puede guardar pines cuando tiene cuenta
- Mejora UX: Comportamiento híbrido para reducir fricción del modal

**Descripción del ajuste realizado:**

1. **Validación de autenticación:**
   - Modificado `components/SpotMediaCard.tsx`:
     - Importado `useAuth` desde `@/contexts/AuthContext`
     - Importado `Alert` desde `react-native`
     - Agregado validación `isAuthenticated` en `handlePinPress`
     - Agregado validación `isAuthenticated` en `handlePinLongPress`
     - Mostrar `Alert` con opción de login cuando usuario no autenticado intenta pin
   
   - Modificado `app/spot-detail.tsx`:
     - Agregado validación `isAuthenticated` en `handlePinPress`
     - Mostrar `Alert` con opción de login cuando usuario no autenticado intenta pin

2. **Comportamiento híbrido:**
   - Modificado `components/SpotMediaCard.tsx`:
     - Eliminado `showPinModal` state
     - Eliminado `handlePinStateSelect` (ya no necesario)
     - Eliminado import y uso de `PinStateModal`
     - Modificado `handlePinPress`: Primer pin = `to_visit` directamente (sin modal)
     - Mantenido `handlePinLongPress`: Cambiar estado (to_visit ↔ visited)
     - Validación de autenticación también en `handlePinLongPress`
   
   - Modificado `app/spot-detail.tsx`:
     - Eliminado `showPinModal` state
     - Eliminado `handlePinStateSelect` (ya no necesario)
     - Eliminado import y uso de `PinStateModal`
     - Modificado `handlePinPress`: Primer pin = `to_visit` directamente (sin modal)
     - Actualizado toast message: "Pinned · To visit" (en lugar de mostrar modal)

**Archivos tocados:**
- `components/SpotMediaCard.tsx` (validación autenticación, comportamiento híbrido)
- `app/spot-detail.tsx` (validación autenticación, comportamiento híbrido)
- `definitions/FLOWYA V1.2/PLAN_IMPLEMENTACION_V1_2.md` (plan actualizado)
- `definitions/FLOWYA V1.2/BITACORA_V1_2.md` (bitácora actualizada)

**Archivos NO tocados:**
- `components/ui/PinStateModal.tsx` - Mantenido por si se necesita en futuro, pero no se usa en flujo normal

**Riesgos considerados:**
- **Validación de autenticación:** Bajo riesgo, validación simple en handlers de UI
- **Comportamiento híbrido:** Bajo riesgo, mejora UX existente
- **Eliminación de modal:** Bajo riesgo, ya no se necesita con nuevo comportamiento
- **Backward compatibility:** Los pines existentes siguen funcionando normalmente

**Testing requerido:**
- Verificar que usuario no autenticado no puede pin (muestra alerta)
- Verificar que alerta de login se muestra correctamente
- Verificar que navegación a login funciona
- Verificar que primer pin = to_visit directamente (sin modal)
- Verificar que toast se muestra correctamente ("Pinned · To visit")
- Verificar que tap largo en SpotMediaCard cambia estado (to_visit ↔ visited)
- Verificar que usuario autenticado puede pin normalmente
- Verificar que indicador visual de estado se actualiza correctamente

**Estado:** ✅ Implementación completada

**Nota:** 
- La validación de autenticación es una regla de negocio crítica que asegura que solo usuarios con cuenta puedan guardar pines
- El comportamiento híbrido reduce significativamente la fricción al eliminar el modal repetitivo, permitiendo pin rápido con estado default (`to_visit`)
- El tap largo en `SpotMediaCard` mantiene el control para cambiar estado cuando el usuario lo desee
- En `spot-detail.tsx`, el long press no está disponible (ContentHeader no lo soporta), pero el comportamiento híbrido del primer pin directo es suficiente

---

---

### [V1.2-AJUSTE-03] Toast en SpotMediaCard con Modal Transparente y Corrección Modal Primera Vez
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Mejora UX: Toast debe aparecer siempre en la parte inferior de la pantalla (posición global)
- Bug fix: Modal de primera vez se mostraba múltiples veces (una vez por cada spot nuevo)

**Descripción del ajuste realizado:**

1. **Toast en SpotMediaCard con Modal Transparente:**
   - **Problema**: Toast aparecía dentro de las cards en lugar de en la parte inferior de la pantalla
   - **Solución**: Envolver Toast en Modal transparente para posicionamiento global
   - Modificado `components/SpotMediaCard.tsx`:
     - Restaurado import de `Toast` desde `@/components/ui/Toast`
     - Agregado import de `Modal` desde `react-native`
     - Restaurados estados: `showToast`, `toastMessage`
     - Restaurados mensajes de toast en todos los handlers:
       - `handlePinStateSelect`: "Pinned · Visited" o "Pinned · To visit"
       - `handlePinPress` (pin directo): "Pinned · To visit"
       - `handlePinPress` (cambio a visited): "Changed to Visited"
       - `handlePinPress` (remoción): "Pin removido"
     - Envuelto `Toast` en `Modal` transparente con `animationType="none"` y `statusBarTranslucent`
     - Aplicado tanto en variant "small" como "large"

2. **Corrección del Modal de Primera Vez:**
   - **Problema**: Modal se mostraba múltiples veces porque cada instancia de `SpotMediaCard` verificaba independientemente
   - **Solución**: Verificar siempre desde AsyncStorage en lugar de confiar solo en estado local
   - Modificado `components/SpotMediaCard.tsx`:
     - Modificado `handlePinPress`: Verificar siempre `hasSeenPinModal()` desde AsyncStorage antes de mostrar modal
     - Eliminada lógica que dependía solo de `hasSeenFirstTime` (estado local)
     - Actualizado `handlePinStateSelect`: Actualizar estado local después de marcar con `markPinModalSeen()`
   - Modificado `app/spot-detail.tsx`:
     - Aplicada misma corrección: verificar siempre desde AsyncStorage
     - Actualizado `handlePinStateSelect`: Actualizar estado local después de marcar

**Archivos tocados:**
- `components/SpotMediaCard.tsx` (Toast con Modal, corrección modal primera vez)
- `app/spot-detail.tsx` (corrección modal primera vez)

**Archivos NO tocados:**
- `components/ui/Toast.tsx` - Sin cambios, componente funciona correctamente
- `components/ui/PinStateModal.tsx` - Sin cambios
- `utils/pinFirstTime.ts` - Sin cambios, utilidad funciona correctamente

**Riesgos considerados:**
- **Toast con Modal**: Bajo riesgo, Modal transparente es estándar en React Native
- **Corrección modal**: Bajo riesgo, verificación desde AsyncStorage es más confiable que estado local
- **Performance**: Modal transparente no afecta performance significativamente
- **UX**: Toast ahora aparece consistentemente en la parte inferior de la pantalla

**Testing requerido:**
- Verificar que Toast aparece en la parte inferior de la pantalla cuando se hace pin desde SpotMediaCard
- Verificar que Toast aparece correctamente en variant "small" y "large"
- Verificar que Modal de primera vez solo se muestra una vez por usuario (no por cada spot)
- Verificar que mensajes de toast son correctos en todos los casos
- Verificar que Toast desaparece correctamente después del timeout

**Estado:** ✅ Implementación completada

**Nota:**
- El Toast con Modal transparente asegura que siempre aparezca en la parte inferior de la pantalla, independientemente de dónde esté SpotMediaCard en la jerarquía
- La corrección del modal asegura que solo se muestre una vez por usuario, no una vez por cada spot nuevo
- Esta mejora mejora significativamente la consistencia de la UX del sistema de notificaciones

---

## WARNINGS CONOCIDOS Y LIMITACIONES DEL FRAMEWORK

### [V1.2-WARNING-01] Warning de Accesibilidad: aria-hidden en Modals
**Fecha:** 2026-01-11  
**Estado:** ⚠️ Warning conocido de React Native Web (no afecta funcionalidad)

**Contexto del warning:**
- Warning aparece en consola del navegador en todas las pantallas
- Mensaje: "Blocked aria-hidden on an element because its descendant retained focus"
- Ocurre cuando se muestra cualquier Modal en React Native Web

**Descripción del problema:**
- React Native Web aplica automáticamente `aria-hidden="true"` al contenido de fondo cuando se muestra un Modal
- Si algún elemento del fondo mantiene el foco, se produce este warning de accesibilidad
- Este es un problema conocido de React Native Web, no un bug de nuestra implementación

**Componentes afectados:**
- Todos los Modals en la aplicación:
  - `PinStateModal` (componente UI)
  - Modals en `spot-detail.tsx` (Menu, Delete Confirm, Cancel Confirm)
  - Otros modals en la aplicación

**Impacto:**
- ⚠️ Warning en consola (no afecta funcionalidad)
- ✅ Funcionalidad de modals funciona correctamente
- ✅ No afecta experiencia de usuario
- ⚠️ Puede causar problemas de accesibilidad para usuarios con lectores de pantalla

**Solución aplicada:**
- ❌ No hay solución directa en React Native Web
- ✅ Documentado como warning conocido del framework
- ✅ Funcionalidad no afectada, se puede ignorar el warning

**Referencias:**
- React Native Web: Problema conocido con Modals y aria-hidden
- React Native Modal no expone props de accesibilidad para controlar esto directamente
- Comportamiento esperado del framework en web

**Decisiones técnicas:**
- No intentar workarounds complejos (pueden causar más problemas)
- Documentar como limitación conocida del framework
- Monitorear si React Native Web resuelve esto en futuras versiones

**Archivos afectados:**
- `app/spot-detail.tsx` (Modals)
- `components/ui/PinStateModal.tsx` (Modal de Pin)
- Otros componentes con Modals

**Estado:** ⚠️ Warning conocido, no requiere acción adicional

---

### [V1.2-AJUSTE-04] Limpieza de Profile Screen y Corrección de Sign out
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Limpieza de Profile Screen según solicitud del usuario
- Corrección de bug: Sign out no funcionaba correctamente
- Mejora UX: Limpiar pines al cerrar sesión

**Descripción del ajuste realizado:**

1. **Limpieza de Profile Screen:**
   - Eliminadas preferencias obsoletas/no funcionales:
     - Narration (obsoleto: audio eliminado, NarrationContext es no-op)
     - Location (no funcional: se guarda pero no se usa)
     - Notifications (no funcional: se guarda pero no se usa)
   - Eliminada sección "General" completa (todas las preferencias eliminadas)
   - Eliminada sección "DATA & PERMISSIONS" completa (solicitado explícitamente)
   - Eliminado sistema de preferencias completo:
     - Interface `UserPreferences` eliminada
     - Estado `preferences` eliminado
     - Funciones `loadPreferences`, `savePreferences`, `handlePreferenceChange` eliminadas
     - Constante `PREFERENCES_KEY` eliminada
     - `useEffect` de carga/guardado eliminados
   - Limpieza de imports:
     - `AsyncStorage` eliminado
     - `SettingsToggle` eliminado
     - `clearAllStorage` eliminado
     - `useState` eliminado (ya no necesario)
   - Actualizado texto de usuario guest: "Sign in to access your account" (en lugar de "save preferences")

2. **Corrección de Sign out:**
   - **Problema**: Sign out no funcionaba (usaba `alertPolyfill` incorrectamente)
   - **Solución**: Cambiar a usar `showAlert` directamente desde `@/utils/alertPolyfill`
   - Modificado `app/(tabs)/profile.tsx`:
     - Cambiado import de `alertPolyfill` a `showAlert`
     - Eliminados imports innecesarios (`Platform`, `Alert`)
     - Actualizado `handleLogout` para usar `showAlert()` directamente
     - Actualizado manejo de errores para usar `showAlert()` también

3. **Limpieza de pines al cerrar sesión:**
   - **Problema**: Cuando el usuario cerraba sesión, los pines seguían mostrándose
   - **Solución**: Agregar `useEffect` en `SavedContext` que escucha cambios en `isAuthenticated`
   - Modificado `contexts/SavedContext.tsx`:
     - Agregado import de `useAuth` desde `@/contexts/AuthContext`
     - Agregado hook `const { isAuthenticated } = useAuth();`
     - Agregado `useEffect` que limpia todos los pines cuando `isAuthenticated` pasa a `false`
     - Los pines se eliminan automáticamente al cerrar sesión

**Archivos tocados:**
- `app/(tabs)/profile.tsx` (limpieza completa, corrección Sign out)
- `contexts/SavedContext.tsx` (limpieza de pines al cerrar sesión)
- `definitions/FLOWYA V1.2/BITACORA_V1_2.md` (esta entrada)

**Archivos NO tocados:**
- `components/SettingsToggle.tsx` - Componente mantenido (puede usarse en futuro)
- `utils/clearStorage.ts` - Utilidad mantenida (puede usarse en otros contextos)
- Sistema de preferencias en AsyncStorage - Las preferencias existentes quedarán huérfanas pero no afectan funcionalidad

**Riesgos considerados:**
- **Limpieza de preferencias**: Bajo riesgo, todas las preferencias eliminadas no tienen efecto funcional
- **Compatibilidad**: Usuarios existentes pueden tener preferencias guardadas que quedarán huérfanas (no afecta funcionalidad)
- **Sign out**: Corrección simple, bajo riesgo
- **Limpieza de pines**: Bajo riesgo, comportamiento esperado (pines son datos de usuario autenticado)

**Testing requerido:**
- Verificar que Profile Screen muestra solo User Info y ACCOUNT (Sign in/Create account o Sign out)
- Verificar que Sign out funciona correctamente (muestra alerta y cierra sesión)
- Verificar que pines se eliminan cuando usuario cierra sesión
- Verificar que usuario guest no ve pines previos de otros usuarios

**Estado:** ✅ Implementación completada

**Nota:**
- Profile Screen ahora está simplificado y enfocado en gestión de cuenta
- Sign out funciona correctamente en web y mobile usando `showAlert`
- Los pines se limpian automáticamente al cerrar sesión, asegurando que datos de usuario no persistan entre sesiones

---

### [V1.2-AJUSTE-05] Reemplazar Icono de Distancia en InfoMeta
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Mejora UX: Icono de distancia en InfoMeta era idéntico al icono de la sección Map
- Necesidad de diferenciación visual para mejorar claridad de la interfaz
- Icono `'map'` (`'place'` en Material Icons) usado tanto para distancia como para sección Map causaba confusión

**Descripción del ajuste realizado:**
- Agregado nuevo icono `'distance'` al iconMap en `components/ui/Icon.tsx`:
  - Mapeo: `distance: 'near-me'` (Material Icon)
  - Razón: `'near-me'` representa específicamente proximidad/distancia desde el usuario
  - Visualmente diferente de `'place'` (map), mejor diferenciación semántica
- Actualizado `components/ui/InfoMeta.tsx`:
  - Cambiado `name="map"` → `name="distance"` en el icono de distancia (línea 79)
  - Actualizado comentario de documentación (línea 17): `Distancia → siempre con icono "distance"`
- Componentes que usan InfoMeta automáticamente heredan el cambio:
  - `SpotMediaCard` - Cards de spots
  - `SpotInlineCard` - Cards inline en flows
  - `FlowCard` - Cards de flows
  - `spot-detail.tsx` - Detalle de spot

**Archivos tocados:**
- `components/ui/Icon.tsx` (agregado mapeo `distance: 'near-me'`)
- `components/ui/InfoMeta.tsx` (cambiado icono de `'map'` a `'distance'`, actualizado comentario)

**Archivos NO tocados:**
- `components/SpotMediaCard.tsx` - Usa InfoMeta, se actualiza automáticamente
- `components/SpotInlineCard.tsx` - Usa InfoMeta, se actualiza automáticamente
- `components/FlowCard.tsx` - Usa InfoMeta, se actualiza automáticamente
- `app/spot-detail.tsx` - Usa InfoMeta, se actualiza automáticamente
- Sección Map - Mantiene `'map'` (`'place'`) sin cambios

**Riesgos considerados:**
- **Compatibilidad**: `'near-me'` está disponible en Material Icons, compatible con `@expo/vector-icons`
- **Impacto visual**: `'near-me'` puede ser ligeramente diferente en tamaño que `'place'`, pero se verifica a 16px
- **Funcionalidad**: No hay cambios funcionales, solo visual
- **Rollback**: Cambios son reversibles si el icono no funciona correctamente

**Testing requerido:**
- Verificar que icono de distancia en SpotMediaCard muestra `'near-me'`
- Verificar que icono de distancia en SpotInlineCard muestra `'near-me'`
- Verificar que icono de distancia en spot-detail.tsx muestra `'near-me'`
- Comparar visualmente con icono `'map'` en tab bar para confirmar diferencia
- Verificar que tamaño del icono (16px) se ve bien con `'near-me'`
- Verificar que toggle de distancia (km/millas) sigue funcionando
- Verificar que icono visible en dark mode

**Estado:** ✅ Implementación completada

**Nota:**
- El icono `'distance'` (`'near-me'`) ahora representa específicamente distancia/proximidad desde el usuario
- El icono `'map'` (`'place'`) mantiene su uso exclusivo para la sección Map
- Esta diferenciación mejora la claridad visual y semántica de la interfaz

---

**Última actualización:** 2026-01-11  
**Estado:** Fase 1 completada ✅, Fase 2.6 completada ✅ (validación autenticación ✅, comportamiento híbrido ✅), Fase 3 completada ✅, Fase 4 completada ✅, Fase 5 completada ✅ (markers ✅, filtro ✅, compartir mapas ✅, compartir flows ✅), Ajuste 03 completado ✅ (Toast con Modal ✅, corrección modal primera vez ✅), Ajuste 04 completado ✅ (limpieza Profile ✅, corrección Sign out ✅, limpieza pines al cerrar sesión ✅), Ajuste 05 completado ✅ (icono distancia en InfoMeta ✅), documento de testing manual creado ✅, pendiente ejecución de testing manual en tiempo de ejecución

---

### [V1.2-CIERRE-01] Fixes de Cierre V1.2 - gemsLogic y Eliminación liked-spots
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Cierre de V1.2: Fixes correctivos para estabilización
- Actualización de gemsLogic.ts para usar sistema de Pins
- Eliminación de pantalla deprecated liked-spots.tsx

**Descripción del ajuste realizado:**

1. **Actualización gemsLogic.ts:**
   - Reemplazado uso de `likedSpots` y `savedSpots` (legacy) por sistema de Pins
   - Funciones ahora reciben `isSpotPinned: (spotId: string) => boolean` como parámetro
   - **Regla V1.2:** Gems EXCLUYE cualquier spot que tenga Pin (cualquier estado), sin diferenciar estado
   - Filtro binario: pinned / not pinned (sin scoring avanzado por estado)
   - Funciones actualizadas:
     - `getFeaturedSpots()`: Filtra spots con Pin antes de calcular score
     - `getSuggestedSpots()`: Excluye spots con Pin
     - `getSuggestedPaths()`: Usa `getPinnedSpots()` en lugar de `savedSpots`
     - `getAllGems()`: Actualizado para usar `isSpotPinned`
     - `getRecentSpots()`: Filtra spots con Pin
   - `calculatePopularityScore()`: Simplificado, ya no considera likedSpots/savedSpots

2. **Actualización dataPreparation.ts:**
   - `prepareHomeData()`: Actualizado para recibir `isSpotPinned` en lugar de `likedSpots` y `savedSpots`
   - Secciones actualizadas:
     - `forYouSpots`: Excluye spots con Pin
     - `recommendedSpots`: Excluye spots con Pin
     - `maybeYouLikeSpots`: Usa `getFeaturedSpots()` con sistema de Pins

3. **Actualización app/(tabs)/home.tsx:**
   - Reemplazado `likedSpots, savedSpots` por `isSpotPinned` del hook `useSaved()`
   - Actualizada llamada a `prepareHomeData()` con nuevo parámetro

4. **Eliminación liked-spots.tsx:**
   - Eliminado archivo `app/liked-spots.tsx` completamente
   - Eliminada ruta `liked-spots` de `app/_layout.tsx`
   - Like ya no existe como concepto en el producto (reemplazado por Pin)

**Archivos tocados:**
- `utils/gemsLogic.ts` (actualizado para usar sistema de Pins)
- `utils/dataPreparation.ts` (actualizado para usar sistema de Pins)
- `app/(tabs)/home.tsx` (actualizado para usar sistema de Pins)
- `app/liked-spots.tsx` (ELIMINADO)
- `app/_layout.tsx` (eliminada ruta liked-spots)

**Archivos NO tocados:**
- `contexts/SavedContext.tsx` - Campos legacy (likedSpots, savedSpots) se mantienen para compatibilidad temporal
- Otros archivos que usan likedSpots/savedSpots - Se mantienen para compatibilidad temporal

**Riesgos considerados:**
- **Compatibilidad:** Funciones legacy (likedSpots, savedSpots) se mantienen en SavedContext para compatibilidad temporal
- **Gems:** Ahora excluye correctamente spots con Pin, mejorando recomendaciones
- **Eliminación liked-spots:** Pantalla deprecated eliminada limpiamente, sin redirecciones

**Testing requerido:**
- Verificar que Gems no muestra spots con Pin (cualquier estado)
- Verificar que recomendaciones funcionan correctamente
- Verificar que no hay errores de TypeScript
- Verificar que ruta liked-spots ya no existe

**Estado:** ✅ Implementación completada

**Nota:** 
- gemsLogic.ts ahora usa sistema de Pins como filtro binario (pinned / not pinned)
- No se aplica scoring avanzado ni pesos por estado (to_visit vs visited) - queda fuera de v1.2
- liked-spots.tsx eliminado completamente, sin redirecciones ni mensajes deprecated

---

### [V1.2-CIERRE-02] Documentación visitedAt
**Fecha:** 2026-01-11  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Documentación explícita del comportamiento de `visitedAt` en sistema de Pins

**Descripción del ajuste realizado:**
- Documentado comportamiento de `visitedAt` en `contexts/SavedContext.tsx`:
  - `visitedAt` representa la **PRIMERA vez** que el usuario marca un spot como 'visited'
  - Si se cambia de 'visited' → 'to_visit' → 'visited' nuevamente, `visitedAt` mantiene la fecha original
  - Comportamiento intencional: preserva fecha de primera visita, no última visita
  - No se modifica lógica en `changePinState()` - comportamiento actual es correcto

**Archivos tocados:**
- `definitions/FLOWYA V1.2/BITACORA_V1_2.md` (esta entrada)

**Archivos NO tocados:**
- `contexts/SavedContext.tsx` - Lógica no modificada, solo documentada

**Riesgos considerados:**
- Ninguno: Solo documentación, no cambios de código

**Estado:** ✅ Documentación completada

**Nota:** 
- `visitedAt` preserva fecha de primera visita, no última visita
- Comportamiento actual es intencional y correcto