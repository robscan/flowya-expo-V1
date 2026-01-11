# BITÁCORA DE CAMBIOS — FLOWYA V1.1

**Fecha de inicio:** 2024-12-21  
**Versión:** FLOWYA V1.1  
**Estado:** En progreso

---

## PROPÓSITO DE ESTE DOCUMENTO

Esta bitácora registra todos los cambios realizados durante la implementación de FLOWYA V1.1, siguiendo el plan arquitectónico definido en `PLAN_ARQUITECTONICO_V1_1.md`.

**Referencias:**
- Backlog fuente de verdad: `FLOWYA — BACKLOG V1.1.md`
- Arquitectura canónica: `FUENTE_UNICA_VERDAD_V2.0.md`
- Plan arquitectónico: `PLAN_ARQUITECTONICO_V1_1.md`

---

## FORMATO DE REGISTRO (OBLIGATORIO)

**Cada entrada debe incluir:**
- **[ID de Backlog]** (ej. P0-07, P1-01)
- **Fecha**
- **Contexto del cambio** (qué problema resuelve)
- **Descripción del ajuste realizado**
- **Archivos tocados** (lista completa)
- **Archivos NO tocados** (decisiones explícitas de no modificar)
- **Riesgos considerados**
- **Estado** (propuesto / aplicado / pendiente revisión)

**Objetivo:** Trazabilidad completa backlog ↔ decisiones ↔ código sin ambigüedad.

---

## ESTADO INICIAL DEL SISTEMA (2024-12-21)

### Arquitectura Actual
- ✅ Arquitectura V2.0 completada (según SCOPE_0-5_COMPLETADO.md)
- ✅ LocationProvider como fuente única de verdad
- ✅ Sistema de narración existente con audio (NarrationContext, audioManager)
- ✅ FlowContext con estados: idle, active, paused
- ✅ FlowPlayerControls renderiza subtítulos cuando `status === 'playing'`
- ✅ NarrationController orquesta narrations basándose en triggers

### Problemas Identificados (del Backlog)
- ❌ Subtítulos solo aparecen cuando audio está "playing" (P0-06)
- ❌ No existe schema explícito para subtítulos del Flow (P0-07)
- ❌ Eventos del Flow no están alineados con momentos narrativos (P0-08)
- ❌ Audio genera errores e inconsistencias (P0-05)
- ❌ Uso inconsistente de "path"/"route" vs "Flow" en UI (P0-04)
- ❌ Duplicación visual de Spots (P0-03)
- ❌ Caché de imágenes no se invalida correctamente (P0-02) ✅ COMPLETADO
- ❌ FormLocationSelector tiene problemas de UX (P0-01) ✅ COMPLETADO

### Estado de Documentación
- ✅ Backlog V1.1 definido
- ✅ Plan arquitectónico creado y cerrado
- ⏳ Análisis funcionales pendientes (Fase 0)
- ⏳ BITACORA_V1_1.md (este documento - en progreso)

---

## FASE 0: PREPARACIÓN Y ANÁLISIS

### [P0-00] Tarea 0.1: Crear BITACORA_V1_1.md
**Fecha:** 2024-12-21  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Preparación para implementación de V1.1
- Necesidad de trazabilidad completa de cambios

**Descripción del ajuste realizado:**
- Creado `definitions/FLOWYA V1.1/BITACORA_V1_1.md`
- Definido formato obligatorio de registro con trazabilidad
- Documentado estado inicial del sistema

**Archivos tocados:**
- `definitions/FLOWYA V1.1/BITACORA_V1_1.md` (NUEVO)

**Archivos NO tocados:**
- Ningún código de la aplicación

**Riesgos considerados:**
- Ninguno (solo documentación inicial)

---

## FASE 0: PREPARACIÓN Y ANÁLISIS

### [P0-00] Tarea 0.2: Auditoría del estado actual
**Fecha:** 2024-12-21  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Preparación para implementación de V1.1
- Necesidad de entender estado actual de subtítulos y eventos

**Descripción del ajuste realizado:**
- Creado `ANALISIS_FUNCIONAL_FLOW_SUBTITLES.md`
- Documentado estado actual del sistema de subtítulos
- Identificados problemas específicos (acoplamiento a audio, falta de schema, etc.)
- Propuesta de solución documentada

**Archivos tocados:**
- `definitions/FLOWYA V1.1/Analisis Funcional/ANALISIS_FUNCIONAL_FLOW_SUBTITLES.md` (NUEVO)

**Archivos NO tocados:**
- Ningún código de la aplicación

**Riesgos considerados:**
- Ninguno (solo documentación de análisis)

---

### [P0-00] Tarea 0.3: Mapeo de eventos existentes
**Fecha:** 2024-12-21  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Preparación para P0-08 (alinear triggers del Flow)
- Necesidad de mapeo explícito antes de tocar UI

**Descripción del ajuste realizado:**
- Creado `ANALISIS_FUNCIONAL_FLOW_EVENTS.md`
- Documentado estado actual de eventos (geofencing, FlowContext)
- Mapeo explícito completo: Evento → Momento → UI → Texto (tabla completa)
- Diferenciación transition vs end documentada (condiciones explícitas)
- Regla de prioridad de eventos declarada
- Eventos one-shot documentados (FLOW_STARTED, SPOT_PROXIMITY_ENTER, FLOW_COMPLETED)
- Eventos nuevos necesarios identificados

**Archivos tocados:**
- `definitions/FLOWYA V1.1/Analisis Funcional/ANALISIS_FUNCIONAL_FLOW_EVENTS.md` (NUEVO)

**Archivos NO tocados:**
- Ningún código de la aplicación

**Riesgos considerados:**
- Ninguno (solo documentación de análisis)

---

### [P0-00] Tarea 0.4: Documentar decisiones de naming
**Fecha:** 2024-12-21  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- Preparación para P0-04 (normalizar naming)
- Necesidad de documentar qué se reemplaza y qué NO se toca

**Descripción del ajuste realizado:**
- Creado `DECISIONES_TECNICAS.md`
- Documentado qué términos se reemplazan en UI ("Path" → "Flow", "Route" → "Flow")
- Documentado qué NO se toca (nombres de archivos, variables internas, funciones, tipos, comentarios)
- Lista de archivos priorizados para auditar
- Razonamiento técnico documentado

**Archivos tocados:**
- `definitions/FLOWYA V1.1/DECISIONES_TECNICAS.md` (NUEVO)

**Archivos NO tocados:**
- Ningún código de la aplicación

**Riesgos considerados:**
- Ninguno (solo documentación de decisiones)

---

## BLOQUE P0 — CRÍTICO

### [P0-05] Auditoría y deprecación de audio
**Fecha:** 2024-12-21  
**Estado:** ✅ Aplicado (auditoría completada)

**Contexto del cambio:**
- P0-05: Eliminar Audio del Flow y limpiar dependencias
- Primera tarea del bloque P0 según orden recomendado
- Necesidad de identificar todos los usos de audio antes de eliminarlos

**Descripción del ajuste realizado:**
- Auditados todos los usos de `audioManager`, `Expo.Speech`, `TTS` en código relacionado con Flow
- Identificados archivos que usan audio:
  - `contexts/NarrationContext.tsx` - Usa audioManager extensivamente
  - `components/FlowPlayerControls.tsx` - Muestra control de mute (showMute prop)
  - `app/flow-screen.tsx` - Tiene botón mute en header, código de test temporal de Web Speech API
  - `design-system/FlowPlayer.tsx` - Llama a `narration.playNarration()` y `narration.stopNarration()`
  - `utils/audioManager.ts` - Archivo principal de audio
- Identificados usos específicos:
  - `audioManager.play()` - En NarrationContext.playNarration()
  - `audioManager.stop()` - En NarrationContext.stopNarration()
  - `audioManager.pause()` - En NarrationContext.pauseNarration()
  - `audioManager.resume()` - En NarrationContext.resumeNarration()
  - `audioManager.setMuted()` - En NarrationContext.toggleMute()
  - `audioManager.setCallbacks()` - En NarrationContext (useEffect)
  - `narration.isMuted` - En FlowPlayerControls (variant='full')
  - `narration.toggleMute()` - En FlowPlayerControls y flow-screen.tsx header
  - Código de test temporal de Web Speech API en flow-screen.tsx (líneas 118-141)
- Documentado qué se eliminará en implementación:
  - Llamadas a `audioManager.play()` en NarrationContext
  - Estados relacionados con audio (`status: 'playing'` cambiará a lógica basada en eventos)
  - Controles de mute (showMute prop, toggleMute function, isMuted state)
  - Código de test temporal de Web Speech API
  - Imports de audioManager, Expo.Speech, TTS en código de Flow

**Archivos tocados:**
- `definitions/FLOWYA V1.1/BITACORA_V1_1.md` (actualizado con esta entrada)

**Archivos NO tocados:**
- Código de la aplicación (solo auditoría, no eliminación todavía)

**Riesgos considerados:**
- Ninguno (solo auditoría, no cambios funcionales)
- La eliminación real se hará después de que subtítulos funcionen (P0-06, P0-09)

**Nota:** Esta es solo la auditoría. La eliminación real de audio se hará después de que los subtítulos funcionen correctamente (según orden recomendado: P0-06, P0-09 antes de P0-05 eliminación).

---

### [P0-07] Schema básico de FlowSubtitle (parcial)
**Fecha:** 2024-12-21  
**Estado:** ✅ Aplicado (schema básico creado)

**Contexto del cambio:**
- P0-07: Definir contrato de datos de Subtítulos (Schema)
- Necesario para P0-08 (sistema de eventos)
- Schema básico suficiente para continuar con eventos

**Descripción del ajuste realizado:**
- Creado `types/flowSubtitle.ts` con tipos básicos:
  - `FlowMoment` - Momentos del Flow (start, in_flow, near_spot, transition, end)
  - `FlowEvent` - Eventos del sistema (FLOW_STARTED, FLOW_ACTIVE, SPOT_PROXIMITY_ENTER, SPOT_COMPLETED, FLOW_COMPLETED)
  - `FlowSubtitleTrigger` - Trigger para subtítulo
  - `FlowSubtitle` - Schema canónico para subtítulos
- Documentado congelamiento del schema (no modificable durante V1.1)
- Schema básico suficiente para continuar con P0-08

**Archivos tocados:**
- `types/flowSubtitle.ts` (NUEVO)

**Archivos NO tocados:**
- `data/flowSubtitles.ts` (pendiente para P0-07 completo)

**Riesgos considerados:**
- Ninguno (solo tipos TypeScript básicos, no lógica)

**Nota:** Schema completo (con `data/flowSubtitles.ts`) se completará en P0-07 completo después de P0-08. Sin embargo, según el análisis funcional, los subtítulos se generan dinámicamente desde `Spot.narration`, no desde un archivo estático.

---

### [P0-08] Sistema de eventos explícitos del Flow
**Fecha:** 2024-12-21  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- P0-08: Alinear triggers del Flow a estructura de narración
- Necesario para sistema de subtítulos basado en eventos
- Permite mapeo explícito: Evento → Momento → UI → Texto

**Descripción del ajuste realizado:**
- Creado `utils/flowEventEmitter.ts` (NUEVO):
  - Sistema centralizado de eventos (singleton)
  - Listeners para eventos (`on`, `off`)
  - Lógica de prioridad de eventos (EVENT_PRIORITY)
  - Manejo de eventos one-shot (FLOW_STARTED, FLOW_COMPLETED, SPOT_PROXIMITY_ENTER por spotId)
  - Funciones: `emit()`, `clearCurrentEvent()`, `resetOneShots()`, `getCurrentEvent()`, `getCurrentPriority()`
- Modificado `contexts/FlowContext.tsx`:
  - Agregado import de `flowEventEmitter` y `FlowEvent`
  - Agregado `useRef` para imports
  - Agregados refs para eventos one-shot: `flowStartedEmittedRef`, `flowCompletedEmittedRef`
  - `startFlow()`: Emite `FLOW_STARTED` (one-shot) y resetea eventos one-shot
  - `closeFlow()`: Emite `FLOW_COMPLETED` (one-shot) antes de limpiar estado
  - `nextNarrationBlock()`: Emite `SPOT_COMPLETED` cuando completa todos los bloques de un spot (con datos: spotId, spotIndex, totalSpots)
- Modificado `app/flow-screen.tsx`:
  - Agregado import de `flowEventEmitter` y `FlowEvent`
  - Modificado useEffect de geofencing:
    - `onArriving`: Emite `SPOT_PROXIMITY_ENTER` (one-shot por spotId)
    - `onApproaching`: Emite `SPOT_PROXIMITY_ENTER` (si no se emitió ya para este spotId)
    - Mantiene compatibilidad temporal con `narrationTriggers.triggerArriving()`
- Implementada regla de prioridad de eventos:
  1. FLOW_COMPLETED (máxima - 5)
  2. SPOT_PROXIMITY_ENTER (alta - 4)
  3. SPOT_COMPLETED (media-alta - 3)
  4. FLOW_STARTED (media - 2)
  5. FLOW_ACTIVE (baja - 1)
- Eventos one-shot implementados:
  - FLOW_STARTED (one-shot global)
  - FLOW_COMPLETED (one-shot global)
  - SPOT_PROXIMITY_ENTER (one-shot por spotId)
- SPOT_COMPLETED puede emitirse múltiples veces (una por spot)

**Archivos tocados:**
- `utils/flowEventEmitter.ts` (NUEVO)
- `contexts/FlowContext.tsx` (MODIFICADO)
- `app/flow-screen.tsx` (MODIFICADO)

**Archivos NO tocados:**
- `components/FlowPlayerControls.tsx` (se modificará en P0-06, P0-09)
- `hooks/useFlowSubtitle.ts` (se creará en P0-09)
- `data/flowSubtitles.ts` (se creará en P0-07 completo)

**Riesgos considerados:**
- Compatibilidad temporal: Se mantiene `narrationTriggers.triggerArriving()` para no romper funcionalidad existente
- Eventos one-shot: Usar refs en lugar de estado para evitar re-renders innecesarios
- Regla de prioridad: Eventos de menor prioridad no se emiten si hay evento de mayor prioridad activo

**Estado:**
- ✅ Sistema de eventos creado
- ✅ Eventos explícitos emitidos en FlowContext
- ✅ Geofencing mapeado a eventos explícitos
- ✅ Regla de prioridad implementada
- ✅ Eventos one-shot implementados
- ✅ FLOW_ACTIVE: Evento pasivo implementado (se determina en hook useFlowSubtitle cuando no hay otros eventos activos, no se emite desde FlowContext - comportamiento correcto según análisis funcional)
- ✅ Integración con subtítulos completada (P0-06, P0-09)

---

### [P0-06] Fix de rendering de subtítulos
**Fecha:** 2024-12-21  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- P0-06: BUG - Subtítulos del Flow no aparecen
- Depende de P0-07 (schema) y P0-08 (eventos) - ambos completados
- Necesario reemplazar lógica basada en audio por lógica basada en eventos

**Descripción del ajuste realizado:**
- Modificado `components/FlowPlayerControls.tsx`:
  - Agregado import de `useFlowSubtitle`
  - Agregado `const subtitle = useFlowSubtitle()` en componente
  - Modificado `renderInfoSection()`:
    - Reemplazado lógica basada en `narration.status === 'playing'` por `subtitle?.text`
    - Eliminada dependencia de `isAudioPlaying`, `hasActiveNarration`, `narrationText` (del contexto de audio)
    - Mantiene fallback UX: muestra "NOW MOVING" y "X spots added" si no hay subtítulo
- Modificado `components/FlowMiniBar.tsx`:
  - Agregado import de `useFlowSubtitle`
  - Agregado `const subtitle = useFlowSubtitle()` en componente
  - Modificado texto de estado:
    - Muestra `subtitle?.shortText` si existe
    - Fallback a "Now moving" si no hay subtítulo
    - Mantiene diseño compacto con `numberOfLines={1}`

**Archivos tocados:**
- `components/FlowPlayerControls.tsx` (MODIFICADO)
- `components/FlowMiniBar.tsx` (MODIFICADO)

**Archivos NO tocados:**
- `contexts/NarrationContext.tsx` (se mantiene para compatibilidad temporal)

**Riesgos considerados:**
- Compatibilidad temporal: Se mantiene `useNarration()` en FlowPlayerControls para no romper código existente (se eliminará en P0-05)
- Fallback UX: Si no hay subtítulo, se muestra "NOW MOVING" / "Now moving" para evitar estados vacíos
- Sincronización: Player y Mini Player usan el mismo hook, por lo que están sincronizados

**Estado:**
- ✅ FlowPlayerControls usa useFlowSubtitle
- ✅ FlowMiniBar usa useFlowSubtitle
- ✅ Subtítulos basados en eventos, no en audio
- ✅ Fallback UX implementado
- ⏳ Eliminación de audio pendiente (P0-05)

---

### [P0-09] Hook useFlowSubtitle y renderizado de subtítulos
**Fecha:** 2024-12-21  
**Estado:** ✅ Aplicado

**Contexto del cambio:**
- P0-09: Renderizar subtítulos correctamente en Player y Mini Player
- Depende de P0-06 (debe estar resuelto primero) - completado junto con P0-06
- Necesario crear hook que genere subtítulos dinámicamente desde Spot.narration

**Descripción del ajuste realizado:**
- Creado `hooks/useFlowSubtitle.ts` (NUEVO):
  - Hook que obtiene subtítulo actual basado en eventos del Flow
  - Escucha eventos del `flowEventEmitter` (FLOW_STARTED, FLOW_COMPLETED, SPOT_PROXIMITY_ENTER, SPOT_COMPLETED)
  - Genera subtítulos dinámicamente desde `Spot.narration`:
    - FLOW_STARTED → texto canónico: "Your flow begins."
    - FLOW_ACTIVE → texto canónico: "Continue moving." (estado pasivo)
    - SPOT_PROXIMITY_ENTER → `Spot.narration.anticipation` o `Spot.narration.presence` (según `currentNarrationBlock`)
    - SPOT_COMPLETED → `Spot.narration.transition` (momento: `transition` si hay más spots, `end` si es último spot)
    - FLOW_COMPLETED → texto canónico: "You've completed your flow."
  - Implementa fallback UX: retorna último subtítulo válido si no hay subtítulo actual
  - Genera `shortText` automáticamente (primeros 60 caracteres de `text`)
  - Determina momento correcto (transition vs end) basado en `spotIndex >= totalSpots - 1`
- Integrado en FlowPlayerControls y FlowMiniBar (ver P0-06)

**Archivos tocados:**
- `hooks/useFlowSubtitle.ts` (NUEVO)

**Archivos NO tocados:**
- `data/flowSubtitles.ts` (no necesario - subtítulos se generan dinámicamente desde Spot.narration)

**Riesgos considerados:**
- Eventos one-shot: El hook escucha eventos pero usa estado interno para mantener el evento actual
- Fallback UX: Retorna último subtítulo válido para evitar estados vacíos
- Generación de shortText: Automática (primeros 60 caracteres), no necesita archivo estático

**Estado:**
- ✅ Hook useFlowSubtitle creado
- ✅ Generación dinámica desde Spot.narration
- ✅ Diferenciación transition vs end implementada
- ✅ Fallback UX implementado
- ✅ shortText generado automáticamente
- ✅ Integrado en FlowPlayerControls y FlowMiniBar
- ✅ FLOW_ACTIVE implementado como estado pasivo (se muestra cuando no hay otros eventos activos y Flow está activo)

**Nota sobre FLOW_ACTIVE:**
- FLOW_ACTIVE es un estado pasivo, no un evento que se emite
- Se determina en `useFlowSubtitle` cuando Flow está activo y no hay otros eventos específicos
- No requiere emisión explícita desde FlowContext (ya que es estado, no evento one-shot)

---

## CIERRE DE P0-08 y P0-09

**Fecha de cierre:** 2024-12-21  
**Estado:** ✅ Cerrado oficialmente

**Tareas completadas:**
- ✅ P0-08: Sistema de eventos explícitos del Flow
- ✅ P0-09: Hook useFlowSubtitle y renderizado de subtítulos

**Validación realizada:**
- ✅ FlowPlayerControls.tsx y FlowMiniBar.tsx alineados con Plan Arquitectónico V1.1
- ✅ Sistema de eventos explícitos funcionando
- ✅ Subtítulos generados dinámicamente desde Spot.narration
- ✅ Sin inconsistencias ni riesgos de ruptura detectados

---

## [QA/P0-08-FIX] Corrección de FLOW_ACTIVE como pulso temporal

**Fecha:** 2024-12-21  
**Estado:** ✅ Completado  
**Contexto:** QA del Flow completo previo a P0-05

**Bug detectado:**
- `FLOW_ACTIVE` podía opacar eventos narrativos explícitos
- Era persistente en lugar de ser un pulso temporal
- No devolvía control a la UI base después del pulso
- Provocaba inconsistencias entre FlowPlayerControls y FlowMiniBar

**Descripción del ajuste realizado:**
- Modificado `hooks/useFlowSubtitle.ts`:
  - Agregados refs y estado para controlar pulso temporal de FLOW_ACTIVE:
    - `flowActivePulseStartRef`: timestamp de inicio del pulso
    - `flowActivePulseActive`: estado para forzar re-render cuando expira
    - `previousEventRef`: para detectar transición no-null → null
  - Implementado useEffect para detectar cuando `currentEvent` pasa de no-null a null (trigger de actividad)
  - Implementado useEffect para limpiar pulso después de 2.5 segundos
  - Modificada lógica en useMemo:
    - PRIORIDAD ABSOLUTA: eventos explícitos (`currentEvent`) SIEMPRE ganan sobre `FLOW_ACTIVE`
    - `FLOW_ACTIVE` solo se muestra si:
      1. No hay evento explícito activo
      2. El pulso está activo (no expiró, dentro de 2.5 segundos)
      3. Flow está activo
    - Retorna `null` cuando no hay evento activo (permite que UI base tome control)
  - Removido fallback de `lastValidSubtitleRef.current` cuando no hay evento activo (ahora retorna `null`)

**Comportamiento esperado:**
1. Inicio de Flow: Player y MiniBar muestran "Your flow begins."
2. Breve pulso: Ambos muestran "Continue moving." por ~2.5 segundos (cuando `FLOW_STARTED` se limpia)
3. Luego: UI vuelve a "NOW MOVING / X spots added" (hook retorna `null`)
4. Al llegar evento de geofencing: texto del spot se muestra
5. Cuando evento de geofencing se limpia: "Continue moving." reaparece brevemente por 2.5s, luego vuelve a UI base
6. Nunca hay inconsistencia Player vs MiniBar
7. Eventos explícitos SIEMPRE tienen prioridad sobre FLOW_ACTIVE

**Archivos tocados:**
- `hooks/useFlowSubtitle.ts` (MODIFICADO)

**Archivos NO tocados:**
- `utils/flowEventEmitter.ts` (no se modificó)
- `contexts/FlowContext.tsx` (no se modificó)
- `components/FlowPlayerControls.tsx` (ya maneja `null` correctamente)
- `components/FlowMiniBar.tsx` (ya maneja `null` correctamente)

**Riesgos considerados:**
- ✅ Prioridad absoluta de eventos explícitos garantizada
- ✅ Pulso temporal evita secuestro permanente de UI
- ✅ Retorno de `null` permite que UI base tome control
- ✅ Detección de transición no-null → null evita pulsos repetidos innecesarios

**Criterios de aceptación validados:**
- ✅ FLOW_ACTIVE nunca opaca eventos explícitos
- ✅ FLOW_ACTIVE es pulso temporal (2.5s), no persistente
- ✅ UI base toma control después del pulso
- ✅ Pulso puede reaparecer con triggers de actividad (transición no-null → null)
- ✅ Sin inconsistencias entre Player y MiniBar

**Estado:**
- ✅ Pulso temporal implementado
- ✅ Prioridad absoluta de eventos explícitos garantizada
- ✅ Retorno de `null` para UI base implementado
- ✅ Triggers de actividad funcionando (solo cuando currentEvent pasa de no-null a null)
- ✅ QA del Flow completado

---

## [QA/P0-FIX-SYNC] Corrección de desincronización FlowPlayer vs FlowMiniBar

**Fecha:** 2024-12-21  
**Estado:** ✅ Completado  
**Contexto:** QA del Flow completo - desfase detectado entre FlowPlayer (pantalla principal) y FlowMiniBar

**Problema detectado:**
- Al iniciar Flow: MiniBar muestra "Your flow begins." correctamente, pero FlowPlayer muestra directamente UI base ("Now moving / X spots added")
- Cuando subtítulo debería desaparecer (retorno a `null`): MiniBar vuelve inmediatamente a UI base, pero FlowPlayer permanece con el último estado hasta que ocurre navegación (minimizar/volver)
- `useFlowSubtitle()` sí está cambiando correctamente, pero FlowPlayer no reacciona al cambio cuando `subtitle === null`

**Causa raíz identificada:**
- `renderInfoSection()` en `FlowPlayerControls.tsx` era una función que se llamaba dentro del JSX: `{renderInfoSection()}`
- Aunque el componente `FlowPlayerControls` usa hooks (`useFlowSubtitle()`) que deberían disparar re-render, el patrón imperativo de llamar una función dentro del JSX puede hacer que React no detecte correctamente los cambios de `subtitle` de objeto a `null`
- FlowMiniBar ya usaba patrón declarativo (`{subtitle?.shortText ? ... : ...}`), por lo que reaccionaba correctamente
- No había memoización (`React.memo()`) bloqueando re-renders, el problema era el patrón imperativo vs declarativo

**Descripción del ajuste realizado:**
- Modificado `components/FlowPlayerControls.tsx`:
  - **Removida función `renderInfoSection()`**: Ya no es una función que se llama dentro del JSX
  - **Implementado patrón declarativo**: Extraído directamente al JSX del return del componente
  - **Lógica condicional declarativa**: 
    - Extraída variable `hasSubtitleText` antes del return (línea 146)
    - JSX condicional directamente en el return: `{hasSubtitleText ? ... : ...}` (líneas 177-223)
  - **Mismo patrón que FlowMiniBar**: Ambos componentes ahora usan patrón declarativo consistente

**Archivos tocados:**
- `components/FlowPlayerControls.tsx` (MODIFICADO)

**Archivos NO tocados:**
- `hooks/useFlowSubtitle.ts` (no se modificó - funcionaba correctamente)
- `components/FlowMiniBar.tsx` (no se modificó - ya usaba patrón declarativo correcto)
- `design-system/FlowPlayer.tsx` (no se modificó)
- `app/flow-screen.tsx` (no se modificó)

**Riesgos considerados:**
- ✅ Patrón declarativo asegura que React detecte cambios correctamente
- ✅ Sin memoización que bloquee re-renders
- ✅ Consistencia entre FlowPlayer y FlowMiniBar (ambos usan patrón declarativo)
- ✅ No se introduce nuevo estado global
- ✅ No se modifica `useFlowSubtitle` (funcionaba correctamente)

**Criterios de aceptación validados:**
- ✅ `subtitle !== null` → FlowPlayer muestra subtítulo inmediatamente
- ✅ `subtitle === null` → FlowPlayer vuelve a UI base inmediatamente (sin navegación)
- ✅ FlowPlayer y FlowMiniBar reaccionan en el mismo ciclo de render
- ✅ No se introduce nuevo estado global
- ✅ No se modifica `useFlowSubtitle` (solo se ajustó cómo se usa su resultado)
- ✅ La solución es declarativa y reactiva, no imperativa

**Estado:**
- ✅ Causa raíz identificada (patrón imperativo vs declarativo)
- ✅ Corrección implementada (renderizado declarativo)
- ✅ FlowPlayer y FlowMiniBar sincronizados
- ✅ QA del Flow completado definitivamente

---

*(Las entradas de P0-05, P0-04, P0-03, P0-02, P0-01 se agregarán a medida que se implementen)*

---

## 2026-01-10 — BUG FIX: Text Node Error en React Native Web con Mapbox

**Contexto del cambio:**
Error persistente e intermitente en web: `Unexpected text node: . A text node cannot be a child of a <View>`. El problema NO era whitespace JSX (ya corregido previamente), sino una incompatibilidad arquitectónica entre React Native Web y Mapbox GL JS.

**Diagnóstico:**
- MapboxViewWeb.tsx estaba renderizando un `<style>` tag dentro del JSX de un `<View>` (líneas 633-636)
- React Native Web NO permite elementos HTML nativos (`<style>`, `<script>`, text nodes) como hijos directos de `<View>`
- Mapbox GL JS inyecta dinámicamente nodos DOM dentro del contenedor, pero el problema principal era el `<style>` tag explícito en el JSX

**Descripción del ajuste realizado:**
- Eliminado el `<style>` tag del JSX en `MapboxViewWeb.tsx` (líneas 633-636)
- Movidos los estilos para ocultar controles de Mapbox a `document.head` usando un `useEffect` separado
- Los estilos ahora se inyectan correctamente en `document.head` (líneas 248-267)
- Cleanup adecuado del estilo cuando el componente se desmonta

**Archivos tocados:**
- `components/MapboxViewWeb.tsx`
  - Líneas 248-267: Nuevo `useEffect` para inyectar estilos en `document.head`
  - Líneas 630-638: Eliminado `<style>` tag del JSX, simplificado el return a `<View ref={containerRef} style={styles.container} />`

**Archivos NO tocados:**
- `app/flow-screen.tsx`: No requiere cambios, el problema estaba en la implementación de MapboxViewWeb
- `components/FlowPlayerControls.tsx`: No relacionado con este bug
- Otros componentes: No afectados

**Riesgos considerados:**
- Bajo riesgo: La solución es estándar para estilos globales en aplicaciones web
- Los estilos se inyectan con un ID único para evitar duplicados
- Cleanup correcto previene memory leaks

**Estado:** Aplicado

**Notas técnicas:**
- Esta es la solución arquitectónica correcta: estilos globales deben ir en `document.head`, no como hijos de componentes React
- React Native Web tiene reglas estrictas: `<View>` solo acepta componentes React Native, nunca elementos HTML nativos
- Mapbox GL JS puede inyectar nodos DOM dinámicamente dentro del contenedor, pero esto es aceptable porque ocurre dentro del nodo nativo del View, no en el árbol JSX de React

---

## 2026-01-10 — [P0-05] Eliminación completa de Audio del Flow

**Contexto del cambio:**
P0-05: Eliminar Audio del Flow y limpiar dependencias. La auditoría fue completada el 2024-12-21, pero la eliminación real estaba pendiente hasta que los subtítulos funcionaran correctamente (P0-06, P0-09 completados).

**Estado previo:**
- ✅ Subtítulos funcionan correctamente usando `useFlowSubtitle()` hook
- ✅ Sistema de eventos explícitos funcionando (P0-08 completado)
- ✅ FlowPlayerControls y FlowMiniBar renderizan subtítulos correctamente
- ⏳ Audio aún presente pero ya no necesario (genera errores e inconsistencias)

**Descripción del ajuste realizado:**

**1. design-system/FlowPlayer.tsx:**
- Eliminado `useEffect` que reproducía narración inicial al activar Flow (líneas 52-96)
- Eliminados imports de `useNarration`, `useEffect`, `useRef`, `Platform`
- Simplificado componente: solo renderiza FlowPlayerControls, sin lógica de audio
- Comentario agregado: "P0-05: Audio eliminado - los subtítulos se muestran automáticamente mediante useFlowSubtitle"

**2. components/FlowPlayerControls.tsx:**
- Eliminado `showMute` prop de interface (línea 36)
- Eliminado `showMute = true` del destructuring (línea 55)
- Eliminado `renderNarrationInfo()` que mostraba estado de mute (líneas 148-164)
- Eliminada llamada a `{renderNarrationInfo()}` (línea 360)
- Eliminadas llamadas a `narration.pauseNarration()` y `narration.resumeNarration()` en `handlePause` (líneas 93, 96)
- Eliminado import de `useNarration`
- Simplificado `handlePause`: solo maneja pause/resume del Flow, sin sincronización con audio

**3. app/flow-screen.tsx:**
- Eliminado código de test temporal de Web Speech API (líneas 117-140)
- Eliminado botón mute de `leftActions` (líneas 789-791)
- Cambiados todos los `closeFlow(narration.stopNarration)` a `closeFlow()` (líneas 389, 421, 445, 459)
- Eliminados imports de `useNarration`, `useNarrationTriggers`, `Platform`
- Eliminado `narrationTriggers.triggerArriving(spotId)` (código legacy, línea 238)
- Eliminada dependencia `narrationTriggers` de useEffect (línea 271)

**4. contexts/NarrationContext.tsx:**
- Eliminado import de `audioManager` y `AudioSource`
- Eliminada función `narrationToAudioSource` (líneas 50-73)
- Simplificado `playNarration`: convertido en no-op, solo actualiza estado (líneas 84-115)
- Simplificado `stopNarration`: convertido en no-op, solo resetea estado (líneas 176-199)
- Simplificado `pauseNarration`: convertido en no-op (líneas 204-207)
- Simplificado `resumeNarration`: convertido en no-op (líneas 212-215)
- Simplificado `toggleMute`: convertido en no-op (líneas 220-224)
- Simplificado `triggerNarration`: convertido en no-op, retorna false (líneas 229-241)
- Simplificado `processQueue`: convertido en no-op (líneas 120-125)
- Eliminado `useEffect` que configuraba callbacks de audioManager (líneas 131-169)
- Eliminado estado `isMuted` (ahora constante `false`)
- Eliminado `processQueueRef`
- Eliminado import de `narrationEngine` (ya no se usa)
- Mantenidas interfaces públicas para compatibilidad
- Agregado comentario: "P0-05: Audio eliminado - funciones de audio convertidas en no-ops para compatibilidad"

**5. components/NarrationController.tsx:**
- Eliminado `useEffect` que llamaba `narration.stopNarration()` cuando Flow se desactiva (líneas 36-47)
- Simplificado componente: ya no hace nada, solo retorna `null`
- Comentario agregado: "P0-05: Audio eliminado - este componente ya no necesita hacer nada"
- `useNarrationTriggers` hook mantenido por compatibilidad, pero funciones de audio son no-ops

**6. utils/audioManager.ts:**
- Agregado `@deprecated` al inicio del archivo
- Documentado que está deprecado y no debe usarse en nuevo código
- Verificado: solo se importa en NarrationContext (ya no se usa)

**Archivos tocados:**
- `design-system/FlowPlayer.tsx` - Audio eliminado completamente
- `components/FlowPlayerControls.tsx` - Controles de mute eliminados
- `app/flow-screen.tsx` - Código de test y controles de audio eliminados
- `contexts/NarrationContext.tsx` - Simplificado, funciones de audio son no-ops
- `components/NarrationController.tsx` - Simplificado, ya no hace nada
- `utils/audioManager.ts` - Marcado como @deprecated

**Archivos NO tocados:**
- `contexts/FlowContext.tsx` - closeFlow ya acepta parámetro opcional, funciona sin stopNarration
- `hooks/useFlowSubtitle.ts` - No relacionado con audio
- Otros componentes: No afectados

**Riesgos considerados:**
- Bajo: Interfaces públicas se mantienen (compatibilidad)
- Bajo: Funciones de audio son no-ops (no rompen código existente)
- Bajo: closeFlow ya maneja parámetro opcional
- Bajo: Subtítulos funcionan correctamente (ya no dependen de audio)

**Estado:** ✅ Aplicado

**Notas técnicas:**
- Las funciones de audio se mantienen como no-ops para mantener compatibilidad de interfaces
- `stopNarration` mantiene firma `() => Promise<void>` porque se pasa a `closeFlow()` (aunque ya no se usa)
- `useNarrationTriggers` hook se mantiene por compatibilidad, pero funciones de audio son no-ops
- NarrationContext simplificado significativamente, pero mantiene interfaces públicas
- audioManager marcado como @deprecated pero no eliminado (solo se importa en NarrationContext que ya no lo usa realmente)

---

## 2026-01-10 — [P0-04] Normalización de naming: "Path"/"Route" → "Flow" en UI visible

**Contexto del cambio:**
P0-04: Normalizar naming — usar exclusivamente "Flow" en UI visible. El usuario NUNCA debe ver "path" o "route" en la interfaz.

**Reglas aplicadas:**
- ✅ Reemplazar "Path"/"Route" por "Flow" solo en strings visibles al usuario
- ✅ NO tocar: nombres de archivos, variables internas, funciones internas, comentarios de código
- ✅ Seguir principio de mínima intervención

**Descripción del ajuste realizado:**

**1. components/SaveFlowModal.tsx:**
- 'Save route' → 'Save Flow' (línea 171, 176)
- 'Close route' → 'Close Flow' (línea 175)
- 'Do you want to save this route before leaving?' → 'Do you want to save this Flow before leaving?' (línea 198)
- 'Save changes to this route?' → 'Save changes to this Flow?' (línea 202)
- 'Route saved' → 'Flow saved' (línea 206)
- 'Give your route a name so you can find it later.' → 'Give your Flow a name so you can find it later.' (línea 313)
- 'Route name' → 'Flow name' (línea 319)
- 'Save Route' → 'Save Flow' (línea 356)

**2. app/flow-screen.tsx:**
- 'Route updated' → 'Flow updated' (línea 387)
- 'Route saved' → 'Flow saved' (línea 387)

**Archivos tocados:**
- `components/SaveFlowModal.tsx` - 8 strings reemplazados
- `app/flow-screen.tsx` - 2 strings reemplazados

**Archivos NO tocados (según reglas):**
- `app/(tabs)/home.tsx` - Solo contiene variables internas (`paths`, `pathsList`, `usePath`, `router`) - NO tocado
- `app/(tabs)/saved.tsx` - Solo contiene variables internas (`paths`, `renderPathSlider`, `pathsList`) - NO tocado
- `app/flow-detail.tsx` - Solo contiene comentarios de código y funciones internas (`calculatePathDistance`, `router`) - NO tocado
- `components/FlowCard.tsx` - Solo contiene funciones internas (`calculatePathDistance`) - NO tocado
- Nombres de archivos - NO tocados (PathContext.tsx, etc.)
- Variables internas - NO tocadas (`paths`, `pathId`, `getPathById`, etc.)
- Funciones internas - NO tocadas (`usePath`, `calculatePathDistance`, etc.)
- Comentarios de código - NO tocados (explican lógica interna)

**Riesgos considerados:**
- Bajo: Solo se modificaron strings visibles al usuario
- Bajo: No se tocaron nombres de variables/funciones (no hay riesgo de romper código)
- Bajo: Cambios son puramente de UI, sin impacto en lógica

**Estado:** ✅ Aplicado

**Notas técnicas:**
- Se siguieron estrictamente las reglas de DECISIONES_TECNICAS.md
- Solo se modificaron strings dentro de componentes `<Text>` que son visibles al usuario
- Variables internas como `paths`, `pathsList`, `renderPathSlider` se mantuvieron sin cambios (correcto según reglas)
- Funciones internas como `calculatePathDistance`, `usePath` se mantuvieron sin cambios (correcto según reglas)
- Comentarios de código se mantuvieron sin cambios (correcto según reglas)

---

## 2026-01-10 — [P0-03] Evitar duplicación visual de Spots

**Contexto del cambio:**
P0-03: Evitar duplicación visual de Spots. El sistema detectaba spots existentes y cargaba su contenido, pero al guardar creaba un nuevo spot duplicado en lugar de reutilizar el existente.

**Estado previo:**
- ✅ Detección de spots existentes funcionando (findExistingSpot)
- ✅ Carga automática de contenido del spot existente en el formulario
- ✅ Badge visual mostrando que se detectó un spot existente
- ❌ Al guardar, se creaba un nuevo spot duplicado en lugar de reutilizar el existente

**Descripción del ajuste realizado:**

**1. app/create-spot.tsx:**
- Creado handler local `handleSave` que verifica `form.existingSpot` antes de guardar
- Si `form.existingSpot` existe, redirige directamente al spot existente (NO crea nuevo spot)
- Si NO hay spot existente, procede con guardado normal llamando `form.handleSave`
- Reemplazado `onPress={form.handleSave}` por `onPress={handleSave}` en botón Save (línea 436)
- Actualizado mensaje del badge: "Existing spot detected. Content loaded automatically." → "Este spot ya existe. Se ha cargado la información existente." (línea 277)
- Actualizado comentario del badge: "SCOPE 2" → "P0-03" (línea 272)

**Archivos tocados:**
- `app/create-spot.tsx` - Handler handleSave agregado, mensaje del badge actualizado

**Archivos NO tocados:**
- `hooks/useSpotForm.ts` - La detección y carga de contenido ya funcionaban correctamente
- `contexts/SpotContext.tsx` - No requiere cambios, createSpot funciona correctamente para spots nuevos
- `utils/spotDetection.ts` - La detección funciona correctamente

**Riesgos considerados:**
- Bajo: Solo se agregó verificación antes de crear spot
- Bajo: Si hay spot existente, se redirige directamente (no se crea duplicado)
- Bajo: Si NO hay spot existente, el flujo normal sigue funcionando igual

**Estado:** ✅ Aplicado

**Notas técnicas:**
- La solución verifica `form.existingSpot` en un handler local antes de proceder con el guardado
- Si existe un spot, se redirige al spot existente (no se llama a `form.handleSave`, que crearía un duplicado)
- Si NO existe un spot, se procede con el flujo normal (llama a `form.handleSave` que ejecuta `onSave` y crea el spot)
- El mensaje del badge está en español según las reglas del producto
- No se requiere modificar `useSpotForm` ni `SpotContext` porque la detección ya funcionaba correctamente

---

## 2026-01-10 — [P0-02] Corregir caché de imágenes al crear o editar Spot

**Contexto del cambio:**
P0-02: Corregir caché de imágenes al crear o editar Spot. Cuando se creaba o editaba un spot, las imágenes podían seguir cacheadas y no actualizarse en las cards que mostraban el spot.

**Estado previo:**
- ✅ Sistema de caché de imágenes funcionando (`imageCache.ts`, `useImageLoadState`)
- ✅ `OptimizedImage` usando caché correctamente
- ✅ `SpotMediaCard` usando `OptimizedImage` con `spot.photos[0]`
- ❌ Al crear o editar un spot, el caché de imágenes no se invalidaba, causando que las cards mostraran imágenes antiguas

**Descripción del ajuste realizado:**

**1. utils/imageCache.ts:**
- Agregada función `removeImageState(uri: string)` para invalidar una URI específica del caché en memoria (línea 57-60)
- Esta función elimina la entrada del `Map` de caché, forzando que la imagen se recargue la próxima vez que se use

**2. contexts/SpotContext.tsx:**
- Importada función `removeImageState` desde `@/utils/imageCache` (línea 21)
- Modificada función `createSpot` para invalidar caché de imágenes del nuevo spot:
  - Si el spot tiene fotos, se invalida el caché de cada URI antes de agregar el spot (líneas 339-343)
- Modificada función `updateSpot` para invalidar caché cuando se actualizan las fotos:
  - Si `updates.photos` existe, se invalidan tanto las URIs antiguas como las nuevas (líneas 351-363)
  - Esto asegura que las imágenes se recarguen correctamente cuando cambian

**Archivos tocados:**
- `utils/imageCache.ts` - Función `removeImageState` agregada
- `contexts/SpotContext.tsx` - Invalidación de caché en `createSpot` y `updateSpot`

**Archivos NO tocados:**
- `components/SpotMediaCard.tsx` - No requiere cambios, ya usa `spot.photos?.[0]` como dependencia en `useMemo`, lo que causa re-render cuando cambia
- `components/ui/OptimizedImage.tsx` - No requiere cambios, ya maneja correctamente cambios de URI con su `key={sourceUri || 'static'}`
- `hooks/useImageLoadState.ts` - No requiere cambios, el hook ya maneja correctamente el caché

**Riesgos considerados:**
- Bajo: Solo se agrega invalidación de caché, no se modifica lógica existente
- Bajo: La invalidación es específica por URI, no afecta otras imágenes
- Bajo: React Native Image ya maneja correctamente la recarga cuando cambia la URI o se invalida el caché en memoria

**Estado:** ✅ Aplicado

**Notas técnicas:**
- La solución invalida el caché en memoria (`imageCache`) cuando se crea o edita un spot
- Esto fuerza que `useImageLoadState` retorne `'not_requested'` para esas URIs, lo que hace que `OptimizedImage` recargue la imagen
- React Native Image también tiene su propio caché (nativo/navegador), pero al invalidar el caché en memoria, se fuerza un nuevo ciclo de carga que respeta las URIs actualizadas
- No se requiere agregar keys adicionales a `SpotMediaCard` o `OptimizedImage` porque ya dependen correctamente de `spot.photos?.[0]` y `sourceUri` respectivamente
- La invalidación se hace tanto para URIs antiguas como nuevas en `updateSpot` para cubrir todos los casos (cambio completo de fotos, reordenamiento, etc.)

---

## 2026-01-10 — [P0-01] Reemplazar componente Location por Mapbox Search oficial

**Contexto del cambio:**
P0-01: Mejorar FormLocationSelector para usar Mapbox Search/Geocoding API de manera más efectiva. El componente ya usaba Mapbox, pero tenía problemas de UX: campo difícil de borrar, reverse geocoding incompleto (solo municipio), y direcciones no completas al seleccionar en mapa.

**Estado previo:**
- ✅ FormLocationSelector ya usa Mapbox Geocoding API (no Google)
- ✅ Funciona básicamente correctamente
- ❌ Reverse geocoding solo devolvía municipio/ciudad (no direcciones completas con calle)
- ❌ Campo de texto difícil de borrar (no tenía botón clear)
- ❌ Resultados pobres para direcciones precisas

**Descripción del ajuste realizado:**

**1. utils/mapboxGeocoding.ts:**
- Modificada función `reverseGeocodeMapbox` para incluir `address` y `street` en los tipos (línea 88)
- Cambiado `types=place,locality,neighborhood,region&limit=1` a `types=address,street,place,locality,neighborhood,region&limit=5`
- Priorizado resultados con `address` o `street` sobre `place/locality` (líneas 104-107)
- Esto permite obtener direcciones completas (calle + referencia) en lugar de solo municipio/ciudad
- Mantenido fallback a `place/locality` cuando no hay dirección precisa disponible

**2. components/ui/FormLocationSelector.tsx:**
- Agregado botón clear (icono 'close') cuando hay texto en el campo de búsqueda (líneas 345-358)
- El botón clear resetea el campo de búsqueda pero mantiene la ubicación seleccionada
- Si hay ubicación seleccionada, actualiza el campo con la dirección formateada después de limpiar
- El icono cambia dinámicamente: 'close' cuando hay texto, 'search' cuando está vacío, undefined cuando está buscando

**Archivos tocados:**
- `utils/mapboxGeocoding.ts` - Modificado reverseGeocodeMapbox para incluir address/street en types y priorizar resultados
- `components/ui/FormLocationSelector.tsx` - Agregado botón clear al campo de búsqueda

**Archivos NO tocados:**
- `components/ui/FormTextInput.tsx` - No requiere cambios, ya soporta rightIcon y onRightIconPress
- `app/create-spot.tsx` - No requiere cambios, FormLocationSelector mantiene la misma interfaz

**Riesgos considerados:**
- Bajo: Solo se mejoró la búsqueda de direcciones, no se cambió la interfaz pública
- Bajo: El fallback a place/locality mantiene compatibilidad cuando no hay dirección precisa
- Bajo: El botón clear mejora UX sin cambiar funcionalidad core

**Estado:** ✅ Aplicado

**Notas técnicas:**
- Mapbox Geocoding API ahora incluye `address` y `street` en los tipos, permitiendo obtener direcciones completas
- Se priorizan resultados con `address` o `street` sobre `place/locality` para direcciones más precisas
- El botón clear mejora la UX permitiendo resetear el campo fácilmente
- El componente mantiene la misma interfaz pública, por lo que no requiere cambios en los consumidores
- Se mantiene el fallback a place/locality cuando no hay dirección precisa disponible (cumple requerimiento de P0-01)

---

## 2026-01-10 — RECONSTRUCCIÓN COMPLETA [P0-01] FormLocationSelector: Arquitectura Limpia desde Cero

**Contexto de la reconstrucción:**
Reconstrucción completa del componente `FormLocationSelector` desde cero, descartando el enfoque anterior que tenía acoplamiento conceptual entre input y coordenadas. El objetivo es lograr el comportamiento correcto usando Mapbox de forma canónica, no "arreglar el código actual".

**Objetivo funcional (no negociable):**
El selector de ubicación debe comportarse como un search real:
- **Input**: Solo muestra texto humano (búsqueda o dirección seleccionada), NUNCA coordenadas
- **Selección de resultado**: Muestra `place_name` en input, almacena coordenadas internamente
- **Click en mapa**: Actualiza coordenadas, NO actualiza input
- **Botón clear**: Limpia input únicamente, sin reverse geocode ni inyección de texto
- **Desacoplamiento total**: Input controla búsqueda, mapa controla coordenadas (no bidireccional)

**Por qué se descartó el enfoque anterior:**
El enfoque anterior tenía errores conceptuales fundamentales:
- **Acoplamiento input ↔ coordenadas**: El input estaba sincronizado con coordenadas mediante reverse geocoding
- **Inyección de texto desde coordenadas**: Click en mapa o cambios externos actualizaban el input con reverse geocode
- **Violación del principio de search real**: El input se comportaba como un campo técnico acoplado a coordenadas, no como un search independiente
- **Complejidad innecesaria**: Múltiples `useEffect` y funciones de sincronización creaban bucles y estados inconsistentes
- **Fallback a coordenadas**: Cuando no había dirección, el input mostraba coordenadas (violación del objetivo funcional)

**Decisión arquitectónica:**
Reconstruir desde cero con arquitectura limpia que separa completamente:
- **Input**: Estado independiente (`searchText`, `selectedAddress`) - solo texto humano
- **Coordenadas**: Estado independiente (`coordinates`) - solo números
- **Flujos independientes**: Búsqueda (input), Mapa (coordenadas), Clear (input) - sin interacción entre sí

**Descripción de la reconstrucción:**

**Arquitectura nueva:**

**Estados completamente separados (sin acoplamiento):**
- `searchText`: Texto que el usuario escribe (estado del input)
- `selectedAddress`: place_name del resultado seleccionado (estado del input)
- `coordinates`: Coordenadas actuales (estado independiente, nunca afecta input)
- `searchResults`, `isSearching`, `showResults`: Estado de búsqueda

**Flujos independientes:**

**Flujo 1: Búsqueda (Input → Resultados → Selección)**
1. Usuario escribe → `searchText` se actualiza
2. Debounce (300ms) → Llama `forwardGeocodeMapbox`
3. Muestra resultados en dropdown (place_name de Mapbox)
4. Usuario selecciona → Guarda `place_name` en `selectedAddress`, guarda coordenadas en `coordinates`, limpia `searchText`
5. Llama `onLocationChange(coordinates)`

**Flujo 2: Mapa (Click → Coordenadas)**
1. Usuario hace click en mapa → Actualiza `coordinates`
2. Llama `onLocationChange(coordinates)`
3. NO toca el input (queda como está)

**Flujo 3: Clear (Limpieza)**
1. Usuario presiona clear → Limpia `searchText` y `selectedAddress`
2. NO toca coordenadas
3. NO hace reverse geocode

**Cambios específicos:**

**1. Eliminación completa de lógica de sincronización:**
- Eliminada función `updateAddressFromLocation`
- Eliminado `useEffect` que sincronizaba `locationProp` → input
- Eliminado `useEffect` que inicializaba dirección desde ubicación
- Eliminado import de `reverseGeocodeMapbox`
- Eliminado estado `address` (ya no necesario)
- Eliminado display de coordenadas debajo del mapa

**2. Estados nuevos (arquitectura limpia):**
- `searchText`: Texto que el usuario escribe (independiente)
- `selectedAddress`: place_name del resultado seleccionado (independiente)
- `coordinates`: Coordenadas actuales (independiente del input)

**3. Handler `handleSearch` (solo input):**
- Limpia `selectedAddress` cuando el usuario busca de nuevo
- Llama `forwardGeocodeMapbox` con debounce
- Mapea resultados (description = place_name de Mapbox)
- NO toca coordenadas

**4. Handler `handleSelectResult`:**
- Actualiza `coordinates` (estado independiente)
- Guarda `place_name` en `selectedAddress`
- Limpia `searchText`
- Llama `onLocationChange(coordinates)`
- NO hace reverse geocode

**5. Handler `handleMapPress`:**
- Actualiza `coordinates` (estado independiente)
- Llama `onLocationChange(coordinates)`
- Cierra resultados si están abiertos
- NO toca el input (queda como está)

**6. Handler `handleClear`:**
- Limpia `searchText` y `selectedAddress`
- NO toca coordenadas
- NO hace reverse geocode

**7. Sincronización con props externos (solo coordenadas):**
- Solo sincroniza `coordinates` con `locationProp`
- NO toca el input (queda como está)

**8. Value del input:**
- `selectedAddress || searchText` (muestra place_name si hay selección, sino texto de búsqueda)
- NUNCA muestra coordenadas

**Archivos modificados:**
- `components/ui/FormLocationSelector.tsx` - Reconstrucción completa desde cero

**Archivos NO modificados:**
- `utils/mapboxGeocoding.ts` - Ya funciona correctamente, no requiere cambios
- `app/create-spot.tsx` - Mantiene la misma interfaz pública
- Otros consumidores - No requieren cambios

**Riesgos considerados:**
- Bajo: Cambios son internos al componente, interfaz pública intacta
- Bajo: Arquitectura más simple y predecible (flujos independientes)
- Bajo: Se mantiene compatibilidad con consumidores existentes

**Estado:** ✅ Aplicado (Reconstrucción completa)

**Notas técnicas:**
- El componente fue reconstruido desde cero, no se reutilizó lógica existente salvo lo estrictamente necesario (helpers, tipos)
- Input y coordenadas son estados completamente independientes
- No hay sincronización bidireccional input ↔ coordenadas
- Input solo muestra texto humano (place_name o texto escrito), NUNCA coordenadas
- Click en mapa NO actualiza el input (queda como está)
- Botón clear solo limpia input, sin reverse geocode ni inyección de texto
- Se usa Mapbox Forward Geocoding API para búsqueda (correcto)
- Reverse geocoding eliminado completamente del componente (ya no se usa)

**Razón de la reconstrucción:**
El enfoque anterior tenía acoplamiento conceptual fundamental entre input y coordenadas que violaba el principio de que el input debe comportarse como un search real (como Mapbox Search Box). La reconstrucción desde cero permite arquitectura limpia con flujos independientes y comportamiento predecible.

---

## 2026-01-10 — CORRECCIÓN [P0-01] FormLocationSelector: Desacoplamiento Input ↔ Coordenadas

**NOTA:** Esta corrección fue reemplazada por la reconstrucción completa del componente (ver entrada anterior). Se mantiene esta entrada por referencia histórica.

**Contexto de la corrección:**
Corrección conceptual del P0-01 ya ejecutado. El componente `FormLocationSelector` tenía errores de diseño que violaban el principio de que el input debe comportarse como un search real, no como un input técnico acoplado a coordenadas.

**Problemas identificados en la implementación anterior:**
- ❌ El input mostraba coordenadas (`lat, lng`) cuando no había dirección disponible (fallback)
- ❌ El input estaba acoplado a coordenadas mediante sincronización bidireccional
- ❌ Click en mapa actualizaba el input con reverse geocode (inyectaba texto en el input)
- ❌ Botón clear reinyectaba coordenadas al input (llamaba `updateAddressFromLocation` después de limpiar)
- ❌ Error conceptual: el input no se comportaba como un search real, sino como un input técnico

**Decisión canónica (NO negociable):**
El input de Location debe comportarse como Mapbox Search Box: texto humano únicamente, nunca coordenadas. El input y las coordenadas deben estar completamente desacoplados.

**Descripción de la corrección aplicada:**

**1. Separación de estados:**
- Separado `searchText` (texto que el usuario escribe) de `selectedLabel` (label del resultado seleccionado)
- Eliminado estado `address` (ya no necesario)
- `internalLocation` (coordenadas) es estado independiente, nunca afecta el input

**2. Eliminación de sincronización input ↔ coordenadas:**
- Eliminada función `updateAddressFromLocation` del flujo del input
- Eliminado `useEffect` que sincronizaba `locationProp` → `searchQuery` (líneas 244-272 eliminadas)
- Eliminado `useEffect` que inicializaba dirección desde ubicación (líneas 274-279 eliminadas)
- Eliminado import de `reverseGeocodeMapbox` (ya no se usa)

**3. Modificación de `handleSelectResult`:**
- Guarda `selectedLabel` con `result.description` (place_name de Mapbox - texto humano)
- Limpia `searchText`
- Actualiza `internalLocation` (coordenadas) independientemente
- NO llama a `updateAddressFromLocation`

**4. Modificación de `handleMapPress`:**
- Actualiza `internalLocation` (coordenadas)
- Limpia `searchText` y `selectedLabel` (input queda vacío)
- NO actualiza el input con reverse geocode
- NO inyecta texto en el input

**5. Modificación del botón clear:**
- Solo limpia `searchText` y `selectedLabel`
- NO inyecta coordenadas
- NO llama a `updateAddressFromLocation`
- El input queda vacío después de limpiar

**6. Value del input:**
- Cambiado a `selectedLabel || searchText`
- Muestra label seleccionado si existe, sino texto de búsqueda
- NUNCA muestra coordenadas

**7. Sincronización con props externos:**
- Solo sincroniza `internalLocation` (coordenadas)
- Limpia `searchText` y `selectedLabel` cuando cambia `locationProp` externamente
- NO inyecta texto en el input

**8. Eliminación de display de coordenadas:**
- Eliminado texto que mostraba coordenadas debajo del mapa (líneas 414-419)
- Las coordenadas son estado interno únicamente, no se muestran al usuario

**Archivos modificados:**
- `components/ui/FormLocationSelector.tsx` - Refactor completo del manejo de estado para desacoplar input de coordenadas

**Archivos NO modificados:**
- `utils/mapboxGeocoding.ts` - No requiere cambios
- `app/create-spot.tsx` - Mantiene la misma interfaz pública
- Otros consumidores - No requieren cambios

**Riesgos considerados:**
- Bajo: Cambios son internos al componente, interfaz pública intacta
- Bajo: El comportamiento es más predecible (input como search real)
- Bajo: Se mantiene compatibilidad con consumidores existentes

**Estado:** ✅ Aplicado (Corrección)

**Notas técnicas:**
- El input ahora se comporta como un search real: solo muestra texto humano (place_name o texto escrito)
- Las coordenadas son estado interno únicamente, nunca se muestran en el input
- Click en mapa no actualiza el input (selección manual)
- Botón clear limpia sin inyectar coordenadas
- No hay sincronización bidireccional problemática entre input y coordenadas
- El componente sigue usando Mapbox Forward Geocoding API para búsqueda (correcto)
- Reverse geocoding eliminado del flujo del input (ya no se usa)

**Razón de la corrección:**
La implementación anterior violaba el principio de que el input debe comportarse como un search real (como Mapbox Search Box), no como un input técnico acoplado a coordenadas. El desacoplamiento completo es necesario para UX correcta y comportamiento predecible.

---

## 2026-01-10 — ANÁLISIS ARQUITECTÓNICO: Error "Unexpected text node" persistente en React Native Web

**Contexto del cambio:**
Análisis estructural profundo del error intermitente `Unexpected text node: . A text node cannot be a child of a <View>` que persiste en FlowScreen y SpotDetail (web), incluso después de múltiples fixes locales (eliminación de whitespace JSX, strings vacíos, render declarativo, corrección de `<style>` tag en MapboxViewWeb).

**Problema identificado:**
El error NO es causado por JSX mal escrito, sino por una **incompatibilidad arquitectónica fundamental** entre:
- React Native Web (árbol de `<View>` componentes React)
- DOM web real inyectado por Mapbox GL JS (canvas, div, nodos de texto)
- Overlays absolutos con `pointerEvents="box-none"`
- Reconciliación de React con DOM nativo fuera de su control

**Análisis detallado:**

**Árbol de render crítico identificado:**
- FlowScreenPage: MapboxViewWeb dentro de ScrollView + ContentHeader sticky + FlowPlayer overlay
- SpotDetail: Estructura similar con Mapbox embebido

**Componentes problemáticos:**
1. **MapboxViewWeb** (`components/MapboxViewWeb.tsx` líneas 293-300):
   - Mapbox GL JS monta DOM real (`<canvas>`, `<div>`, text nodes) directamente en el nodo nativo del `<View>`
   - React Native Web no puede reconciliar cambios DOM hechos fuera del control de React
   - Text nodes "fantasma" aparecen cuando Mapbox manipula el DOM

2. **ContentHeader sticky** (`components/ui/ContentHeader.tsx` línea 191):
   - Overlay con `pointerEvents="box-none"` sobre contenido scrollable
   - Puede causar problemas de reconciliación en web

3. **FlowPlayerControls** (`components/FlowPlayerControls.tsx` líneas 171-172):
   - `accessibilityElementsHidden` con condicionales
   - Advertencia: "Blocked aria-hidden on an element because its descendant retained focus"
   - Conflicto con elementos que retienen focus (posiblemente Mapbox)

**Evidencia:**
- Error es **intermitente** (depende de timing de inicialización de Mapbox)
- Ocurre en **ambas pantallas** que usan Mapbox (FlowScreen, SpotDetail)
- Advertencias de `aria-hidden` confirman conflictos con elementos que retienen focus
- Fixes locales previos (whitespace, strings, `<style>` tag) no resuelven el problema estructural

**Conclusión:**
El problema es **estructural** y requiere **refactor arquitectónico** significativo para resolverse correctamente. No es un bug de código que pueda solucionarse con parches locales.

**Solución arquitectónica requerida (NO IMPLEMENTADA):**
- Separar claramente árbol React Native (layout, UI) de DOM web real (Mapbox)
- Mapbox debe montarse en contenedor web nativo (`<div>`) fuera del árbol React, usando `react-dom` portals
- Separar lógica de pointer events para web vs native
- Testing exhaustivo en todas las pantallas

**Razones para NO implementar ahora:**
1. Requiere refactor arquitectónico significativo
2. Implica cambios en múltiples componentes (MapboxViewWeb, overlays, ContentHeader)
3. Alto riesgo de introducir regresiones si se hace apresuradamente
4. No está bloqueando funcionalidad crítica (error intermitente, no crash)
5. El problema es conocido y documentado, puede abordarse en V1.2 o V2.0

**Acciones tomadas:**
- ✅ Análisis estructural completo documentado
- ✅ Item de backlog técnico creado (ver BACKLOG V1.1)
- ✅ Fixes locales previos se mantienen (status quo) - no empeoran el problema

**Archivos tocados:**
- Ninguno (solo documentación)

**Archivos NO tocados:**
- `components/MapboxViewWeb.tsx`: Fix del `<style>` tag se mantiene (correcto)
- `app/flow-screen.tsx`: Sin cambios (status quo)
- `components/FlowPlayerControls.tsx`: Sin cambios (status quo)
- Otros componentes: Sin cambios (status quo)

**Riesgos considerados:**
- N/A (solo documentación, sin cambios de código)

**Estado:** Documentado - Backlog Técnico

**Notas técnicas:**
- El fix del `<style>` tag en MapboxViewWeb (2026-01-10 anterior) era correcto y necesario, pero no resuelve la incompatibilidad arquitectónica fundamental
- Los fixes locales existentes (whitespace, strings, render declarativo) se mantienen - no empeoran el problema
- El error intermitente es aceptable temporalmente mientras se planifica el refactor arquitectónico correcto
- Se requiere decisión arquitectónica para V1.2 o V2.0 sobre cómo manejar integración de librerías web (Mapbox GL JS) con React Native Web

---

## NOTAS Y OBSERVACIONES

- Se mantendrá compatibilidad con arquitectura V2.0
- Todos los cambios deben seguir principios no negociables del backlog
- Cada bloque (P0, P1, P2) requiere pausa para revisión antes de continuar
- Schema `FlowSubtitle` queda CONGELADO una vez aprobado en P0-07
- Se aplica principio de mínima intervención (solo código relacionado con backlog V1.1)
- **Item técnico pendiente:** Refactor de integración Mapbox con React Native Web (ver BACKLOG V1.1)

---

## 2026-01-10 — [P1-01] Integración Mapbox Search Box Oficial (Web-first) — EN PROGRESO (APROBADO)

**Contexto del cambio:**
P1-01: Mejorar la UX de búsqueda de ubicación en web usando el componente oficial de Mapbox Search Box (`@mapbox/search-box-web`), mientras se mantiene la implementación actual estable en mobile.

**Objetivo:**
Integrar el componente oficial de Mapbox Search Box en `FormLocationSelector` SOLO para web, mejorando la experiencia de búsqueda con el componente nativo de Mapbox, sin afectar la implementación actual que funciona correctamente en mobile (iOS/Android).

**Alcance:**
- **Web**: Usar Mapbox Search Box oficial (custom element `<mapbox-search-box>`)
- **Native (iOS/Android)**: Mantener implementación actual SIN CAMBIOS (ya estable)
- `FormLocationSelector` actúa como wrapper que bifurca implementación según plataforma
- Interfaz pública del componente se mantiene intacta (mismas props, mismo comportamiento para consumidores)

**Decisiones técnicas:**

**1. Feature flag implícito por plataforma:**
- Usar `Platform.OS === 'web'` para bifurcar implementación
- Web → Mapbox Search Box oficial (componente web nativo)
- Native → Implementación actual (sin cambios)

**2. Integración del componente oficial:**
- El Mapbox Search Box es un custom element HTML (`<mapbox-search-box>`)
- Requiere cargar script: `https://api.mapbox.com/search-js/v1.5.0/web.js`
- Se integra con React Native Web usando refs y DOM API nativa
- Event handling mediante eventos nativos del DOM (evento `retrieve`)

**3. Arquitectura del wrapper:**
- `FormLocationSelector` mantiene la misma interfaz pública
- Bifurcación interna: renderizado diferente según `Platform.OS`
- En web: renderiza y controla el custom element
- En native: mantiene código actual (sin modificaciones)

**4. Mantenimiento de principios:**
- Input solo muestra texto humano (nunca coordenadas)
- Input y coordenadas siguen desacoplados (no reintroducir sincronización bidireccional)
- `onLocationChange` funciona igual en ambas plataformas
- Click en mapa sigue funcionando (en ambas implementaciones)

**5. Fallback y error handling:**
- Si el script del Search Box no carga → fallback a implementación actual
- Si hay error en el Search Box → fallback a implementación actual
- No romper funcionalidad si Mapbox Search Box falla

**Riesgos considerados:**

**Bajo riesgo:**
- Cambios son internos al componente (interfaz pública intacta)
- Native no se toca (implementación estable se mantiene)
- Fallback disponible si Search Box falla

**Medio riesgo:**
- Integración DOM real con React Native Web puede tener edge cases
- Estilos del Search Box pueden necesitar ajustes para consistencia visual
- Event handling puede requerir debugging inicial

**Mitigación:**
- Testing exhaustivo en web antes de considerar completo
- Fallback a implementación actual si hay problemas
- No romper native bajo ninguna circunstancia
- Documentar cualquier limitación técnica encontrada

**Motivo de la decisión:**
El componente oficial de Mapbox Search Box proporciona una mejor UX en web con autocompletado nativo, mejor rendimiento y integración oficial con Mapbox. Al mantenerlo solo en web y preservar la implementación actual en mobile, se mejora la experiencia donde es más beneficioso sin introducir riesgos en plataformas que ya funcionan correctamente.

**Archivos a modificar (planificado):**
- `components/ui/FormLocationSelector.tsx` - Agregar bifurcación web/native, implementación web con Search Box
- `hooks/useMapboxSearchBoxScript.ts` (NUEVO) - Hook para cargar script del Search Box

**Archivos NO modificados:**
- `utils/mapboxGeocoding.ts` - Se mantiene para native
- `app/create-spot.tsx` - Interfaz pública no cambia
- `components/MapView.tsx` - No requiere cambios
- `components/MapboxViewWeb.tsx` - No requiere cambios directos
- Cualquier otro consumidor de `FormLocationSelector`

**Estado:** ⏳ EN PROGRESO (IMPLEMENTACIÓN INICIAL COMPLETADA)

**Implementación realizada:**

**1. Hook para cargar script (`hooks/useMapboxSearchBoxScript.ts`):**
- Hook que carga el script de Mapbox Search Box solo en web
- Maneja estado global para evitar cargar el script múltiples veces
- Retorna estado: `isLoaded`, `isLoading`, `error`
- En native, retorna estado inmediato (no carga nada)

**2. Modificación de `FormLocationSelector.tsx`:**
- Bifurcación web vs native usando `Platform.OS === 'web'`
- **Web**: Usa Mapbox Search Box oficial (custom element `<mapbox-search-box>`)
  - Monta el custom element vía `useEffect` usando `nativeID` para encontrar el contenedor DOM
  - Escucha evento `retrieve` para obtener coordenadas cuando se selecciona un resultado
  - Actualiza coordenadas y `selectedAddress` (place_name) independientemente
  - Fallback a implementación actual si Search Box no está disponible o hay error
- **Native**: Implementación actual intacta (sin cambios)

**3. Tipos TypeScript (`types/global.d.ts`):**
- Agregados tipos para `window.mapboxsearch`
- Agregados tipos para custom element `mapbox-search-box`

**Archivos modificados:**
- `hooks/useMapboxSearchBoxScript.ts` (NUEVO)
- `components/ui/FormLocationSelector.tsx` - Bifurcación web/native, integración Search Box
- `types/global.d.ts` - Tipos para Mapbox Search Box

**Archivos NO modificados:**
- `utils/mapboxGeocoding.ts` - Se mantiene para native
- `app/create-spot.tsx` - Interfaz pública no cambia
- `components/MapView.tsx` - No requiere cambios
- `components/MapboxViewWeb.tsx` - No requiere cambios directos

**Validación:**
- ✅ Código compila sin errores
- ✅ Linting pasa (warnings menores no críticos)
- ✅ Search Box se carga y funciona correctamente en web
- ✅ Fallback a implementación actual funciona cuando Search Box no está disponible
- ✅ Native no modificado (implementación actual intacta)

**Sincronización Search Box → Mapa (implementada):**

**Problema identificado:**
El Search Box y el mapa estaban desacoplados. Al seleccionar un lugar en el Search Box, el mapa no se centraba ni mostraba el punto seleccionado.

**Solución implementada:**
1. Agregado método `flyToCoordinates` a `MapboxViewWebRef` y `FlowyaMapViewRef`
2. Implementación en `MapboxViewWeb` usa `map.flyTo` de Mapbox GL JS
3. En `FormLocationSelector`, agregado ref al mapa (`mapViewRef`)
4. En el evento `retrieve` del Search Box, se llama `mapViewRef.current.flyToCoordinates(newCoordinates, 15)`
5. El mapa se centra con zoom 15 (contexto urbano) cuando se selecciona un resultado

**Archivos modificados adicionales:**
- `components/MapboxViewWeb.tsx` - Agregado método `flyToCoordinates` al ref
- `components/MapView.tsx` - Agregado método `flyToCoordinates` al ref (solo web, native no implementado)
- `components/ui/FormLocationSelector.tsx` - Integración del ref y llamada a `flyToCoordinates`

**Notas técnicas:**
- El custom element se monta usando `nativeID` para encontrar el contenedor en el DOM
- Se usa `document.getElementById` para acceder al contenedor (React Native Web expone elementos vía nativeID)
- Event handling mediante eventos nativos del DOM (`retrieve`)
- Sincronización Search → Map implementada vía ref del mapa
- NO se sincroniza Map → Search (no requerido en esta fase)
- Principios mantenidos: input solo muestra texto humano, coordenadas desacopladas
- Native no afectado (método `flyToCoordinates` no implementado en native, solo pasa sin hacer nada)
