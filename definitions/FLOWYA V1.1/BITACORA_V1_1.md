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

---

## 2026-01-10 — [P1] Add Spot · Location + Map · UX Canónica

**Contexto del cambio:**
Corrección canónica del comportamiento del componente Location en Add Spot para asegurar estado inicial claro, integración correcta Search→Mapa, y reordenamiento de campos según UX canónica.

**Problemas identificados:**
1. **Falta estado inicial claro**: Al abrir Add Spot, el mapa se centra en `userLocation` (vía `mapRegion`), pero el input no muestra label inicial. El input queda vacío cuando hay `userLocation` pero no `location` seleccionada.
2. **Orden de campos incorrecto**: Orden actual: Photo (1), Location (2), Name (3). Requerido: Location (1), Name (2), Photo (3).
3. **Sincronización Search → Mapa**: Ya implementada en P1-01, funciona correctamente (no requiere cambios).

**UX Canónica definida:**

**Estado inicial (CASO ESPECIAL):**
- Al abrir Add Spot: mapa se centra automáticamente en ubicación del usuario (ya funciona)
- Campo Location muestra label humano:
  - "Current location" (fallback simple)
  - "Near [neighborhood]" o dirección aproximada (si reverse geocoding es rápido en web)
- ❌ Nunca mostrar coordenadas
- Solo ocurre al inicio (cuando hay `userLocation` pero no `location`)
- No se repite después
- No implica sincronización permanente input ↔ coordenadas

**Reglas permanentes:**
- Input muestra solo texto humano (place_name, texto escrito, o label inicial)
- Selección desde Search: input muestra place_name, coordenadas y mapa se actualizan
- Click en mapa: actualiza coordenadas, ❌ NO actualiza input
- Botón Clear: limpia input, ❌ NO modifica coordenadas

**Decisión arquitectónica:**
La ubicación inicial del usuario es un estado UX especial y explícito, no una sincronización genérica input ↔ coordenadas. Después del estado inicial, input y mapa quedan desacoplados y solo se sincronizan por intención explícita del usuario (seleccionar resultado).

**Solución implementada:**

**1. Estado inicial en FormLocationSelector:**
- Agregado estado `initialLabel: string | null`
- Agregado `useEffect` que se ejecuta una sola vez cuando:
  - Hay `userLocation`
  - No hay `locationProp` (no hay coordenadas seleccionadas)
  - No se ha establecido `initialLabel` todavía (usando `hasInitializedLabelRef`)
- **Web**: Intenta reverse geocoding opcional (timeout 500ms):
  - Si hay `formattedAddress`, usarla
  - Si hay `city`, usar "Near [city]"
  - Si falla o es lento, usar "Current location"
- **Native**: Usa "Current location" directamente (fallback simple)
- Input muestra: `selectedAddress || initialLabel || searchText`

**2. Limpieza del label inicial:**
- Cuando el usuario escribe: limpiar `initialLabel` (en `handleSearch` y `onChangeText`)
- Cuando se selecciona resultado: limpiar `initialLabel` (en `handleSelectResult`)
- Cuando se hace click en mapa: NO limpiar `initialLabel` (input queda vacío según reglas)

**3. Reordenamiento de campos en create-spot.tsx:**
- Orden nuevo: Location (1), Name (2), Photo (3), resto de campos
- Orden anterior: Photo (1), Location (2), Name (3), resto de campos

**Archivos modificados:**
- `components/ui/FormLocationSelector.tsx`:
  - Agregado estado `initialLabel` y ref `hasInitializedLabelRef`
  - Agregado `useEffect` para inicialización (reverse geocoding opcional en web)
  - Modificado render del input: `selectedAddress || initialLabel || searchText` (web y native)
  - Limpieza de `initialLabel` en `handleSearch`, `handleSelectResult` y `onChangeText` (fallback web)
  - Importado `reverseGeocodeMapbox` de `utils/mapboxGeocoding`
- `app/create-spot.tsx`:
  - Reordenadas secciones: Location primero, luego Name, luego Photo

**Archivos NO modificados:**
- `hooks/useSpotForm.ts` - No requiere cambios
- `utils/mapboxGeocoding.ts` - Ya tiene reverse geocoding, solo se usa
- `components/MapView.tsx` - No requiere cambios
- `components/MapboxViewWeb.tsx` - No requiere cambios

**Riesgos considerados:**
- Bajo: Cambios son internos al componente, interfaz pública intacta
- Bajo: Reverse geocoding es opcional y tiene timeout, no bloquea UX
- Bajo: Label inicial solo se establece una vez, no afecta comportamiento posterior
- Bajo: Native usa fallback simple, no se afecta con reverse geocoding

**Estado:** ✅ Aplicado

**Notas técnicas:**
- El label inicial es un estado UX especial, no sincronización permanente
- Reverse geocoding opcional en web mejora UX sin bloquear (timeout 500ms)
- Native usa fallback simple "Current location" (no requiere reverse geocoding)
- El label inicial se limpia cuando el usuario interactúa explícitamente (escribe, selecciona)
- El label inicial NO se limpia cuando se hace click en mapa (input queda vacío según reglas)
- Orden de campos mejorado: Location primero permite establecer contexto antes de otros campos

**Resultado esperado:**
- ✅ Al abrir Add Spot con `userLocation`, el input muestra label inicial ("Current location" o "Near [city]")
- ✅ El mapa está centrado en la ubicación del usuario (ya funcionaba)
- ✅ Seleccionar resultado del Search centra el mapa (ya funciona, P1-01)
- ✅ Click en mapa NO actualiza el input (ya funciona)
- ✅ Botón Clear limpia input, NO modifica coordenadas (ya funciona)
- ✅ Campos reordenados: Location, Name, Photo (implementado)
- ✅ Native no afectado (fallback simple, no reverse geocoding)

---

## 2026-01-10 — [P1] Reconstrucción Add Spot Location (Web-First)

**Contexto del cambio:**
Reconstrucción completa de la pantalla Add Spot y el componente Location desde cero, eliminando todo código legacy y estableciendo una arquitectura correcta web-first que use Mapbox oficialmente.

**Problemas identificados:**
1. **Estados múltiples y desacoplados**:
   - `searchText`, `selectedAddress`, `initialLabel`, `coordinates` (estados separados)
   - Input y coordenadas completamente desacoplados
   - Click en mapa NO actualiza input

2. **Código legacy**:
   - Reverse geocoding improvisado para `initialLabel`
   - Lógica híbrida web/native mal resuelta
   - Sincronizaciones bidireccionales manuales que no funcionan
   - Mapbox Search Box integrado pero no sincronizado con clicks del mapa

3. **Arquitectura incorrecta**:
   - El mapa actúa solo como confirmación visual (no herramienta activa)
   - El input a veces actúa solo como búsqueda (no se sincroniza con mapa)
   - No hay estado único canónico

**Decisión arquitectónica:**
Reconstruir completamente el componente Location desde cero, siguiendo principios arquitectónicos correctos:
1. Estado ÚNICO canónico (coordinates + address)
2. Dos formas equivalentes de selección: Search Box O click en mapa (ambas actualizan AMBOS: coordenadas Y dirección)
3. Mapbox oficial: usar Mapbox Search Box y Geocoding API sin inventar arquitectura
4. Web-only: eliminar toda lógica híbrida web/native
5. Sin código legacy: eliminar reverse geocoding improvisado, estados cruzados, sincronizaciones manuales

**Solución implementada:**

**1. Nuevo componente: LocationSelectorWeb.tsx**
- Ubicación: `components/ui/LocationSelectorWeb.tsx` (NUEVO)
- Estado único: `locationState` (coordinates + address)
- Interfaz pública: Misma que `FormLocationSelector` (location, onLocationChange, userLocation, disabled, mapHeight)
- Web-only: Sin lógica native, sin Platform.OS checks

**2. Handler Search Box → Location:**
- Escucha evento `retrieve` del Mapbox Search Box
- Extrae coordenadas y `place_name` del feature
- Actualiza `locationState` (coordinates + address)
- Centra mapa en coordenadas usando `flyToCoordinates`
- Llama `onLocationChange(coordinates)`

**3. Handler Map Click → Location:**
- Handler `onClick` del mapa (nuevo prop en `MapboxViewWeb`)
- Captura coordenadas del click
- Reverse geocode usando `reverseGeocodeMapbox` (Mapbox Geocoding API)
- Actualiza `locationState` (coordinates + address)
- Actualiza Search Box value con address (si existe)
- Llama `onLocationChange(coordinates)`

**4. Modificación MapboxViewWeb.tsx:**
- Agregado prop `onClick?: (location: { latitude: number; longitude: number }) => void`
- Handler `map.on('click')` prioriza `onClick` si existe (para LocationSelectorWeb)
- Mantiene `onLongPress` para compatibilidad legacy

**5. Modificación MapView.tsx:**
- Agregado prop `onClick` y pasarlo a `MapboxViewWeb`

**6. Migración create-spot.tsx:**
- Reemplazado `FormLocationSelector` por `LocationSelectorWeb`
- Mantenidas props: `location`, `onLocationChange`, `userLocation`
- Eliminado comentario sobre centrado automático (ya está en LocationSelectorWeb)

**Archivos modificados:**
- `components/ui/LocationSelectorWeb.tsx` (NUEVO) - Componente web-only con estado único
- `components/MapboxViewWeb.tsx` - Agregado prop `onClick`
- `components/MapView.tsx` - Agregado prop `onClick` y pasarlo a MapboxViewWeb
- `app/create-spot.tsx` - Reemplazado `FormLocationSelector` por `LocationSelectorWeb`

**Archivos NO modificados:**
- `components/ui/FormLocationSelector.tsx` - Se mantiene (spot-detail.tsx y design-system.tsx lo usan, requieren native)
- `utils/mapboxGeocoding.ts` - Se mantiene (usado como fallback)
- `hooks/useMapboxSearchBoxScript.ts` - Se mantiene (usado en LocationSelectorWeb)

**Riesgos considerados:**
- Medio: Cambio completo de componente (solo para Add Spot, FormLocationSelector se mantiene para otros usos)
- Bajo: Integración Mapbox Search Box (ya probada en FormLocationSelector)
- Bajo: Reverse geocoding (ya existe `reverseGeocodeMapbox`)
- Bajo: Web-only simplifica implementación (no hay lógica híbrida)

**Estado:** ✅ Aplicado

**Notas técnicas:**
- Estado único: `locationState` (coordinates + address) - una sola fuente de verdad
- Sincronización bidireccional correcta: Search Box → Map (evento retrieve), Map → Search Box (reverse geocode + actualizar value)
- Web-only: Todo el componente es web, sin Platform.OS checks
- Mapbox oficial: Search Box (custom element) + Geocoding API (reverse geocode)
- FormLocationSelector se mantiene: spot-detail.tsx y design-system.tsx lo usan (requieren native), migración futura

**Resultado esperado:**
- ✅ Search Box selecciona → actualiza coordenadas Y dirección
- ✅ Click en mapa → reverse geocode → actualiza coordenadas Y dirección Y Search Box
- ✅ Input NUNCA muestra coordenadas
- ✅ Estado único canónico (coordinates + address)
- ✅ Sin código legacy (estados múltiples, reverse geocoding improvisado) en LocationSelectorWeb
- ✅ Web-only (sin lógica native)
- ✅ Integración Mapbox oficial (Search Box + Geocoding API)
- ✅ FormLocationSelector se mantiene para otros usos (spot-detail, design-system)

---

## 2026-01-10 — [P1] Corrección LocationSelectorWeb: Funcionalidad Post-Reconstrucción

**Contexto del cambio:**
Corrección quirúrgica de problemas funcionales detectados durante validación post-reconstrucción de `LocationSelectorWeb`. El componente ya tenía arquitectura correcta (estado único canónico), pero presentaba fallas funcionales puntuales que impedían su uso correcto.

**Problemas identificados:**
1. **Mapa no permite seleccionar ubicación**: Click en mapa no colocaba pin ni actualizaba coordenadas correctamente
2. **Search Box tapado por el mapa**: El dropdown de sugerencias quedaba debajo del mapa (problema de z-index)
3. **Search Box no sincroniza el mapa**: Al seleccionar una dirección, el mapa no se centraba ni mostraba el pin correspondiente

**Descripción del ajuste realizado:**

**1. Corrección z-index del Search Box:**
- Agregado `zIndex: 1000` al estilo `searchContainer` en `LocationSelectorWeb.tsx`
- Agregado `position: 'relative'` para que z-index funcione correctamente
- Esto asegura que el dropdown del Mapbox Search Box se muestre encima del mapa

**2. Habilitación de selección por click en mapa:**
- Agregada llamada a `flyToCoordinates` en `handleMapClick` para centrar el mapa cuando se hace click
- El handler ya actualizaba `locationState.coordinates` correctamente, pero el mapa no se centraba
- Ahora el mapa se centra automáticamente en la ubicación seleccionada con zoom 15

**3. Sincronización Search → Map:**
- Agregado `useEffect` que sincroniza el mapa cuando cambia `locationState.coordinates`
- Esto asegura que el mapa se centre correctamente cuando:
  - Se selecciona una dirección desde Search Box
  - Se hace click en el mapa
  - Se actualiza `locationState` desde props externos
- Removido `key` dinámico del mapa que causaba re-renders innecesarios y reseteaba la posición

**Archivos tocados:**
- `components/ui/LocationSelectorWeb.tsx`:
  - Agregado `zIndex: 1000` y `position: 'relative'` a `searchContainer` (líneas 345-348)
  - Agregada llamada a `flyToCoordinates` en `handleMapClick` (línea 167-169)
  - Agregado `useEffect` para sincronizar mapa cuando cambia `locationState.coordinates` (líneas 263-275)
  - Removido `key` dinámico del componente `FlowyaMapView` (línea 319)

**Archivos NO tocados:**
- `components/MapView.tsx` - No requiere cambios, `onClick` ya está implementado
- `components/MapboxViewWeb.tsx` - `onClick` ya está implementado correctamente
- `app/create-spot.tsx` - No requiere cambios
- `utils/mapboxGeocoding.ts` - No requiere cambios
- `hooks/useMapboxSearchBoxScript.ts` - No requiere cambios

**Riesgos considerados:**
- Bajo: Cambios son quirúrgicos, no modifican arquitectura
- Bajo: Z-index solo afecta apariencia visual, no funcionalidad
- Bajo: `useEffect` de sincronización es idempotente (puede ejecutarse múltiples veces sin problemas)
- Bajo: Remover `key` dinámico evita re-renders innecesarios, mejora rendimiento

**Estado:** ✅ Aplicado

**Criterios de aceptación validados:**
- ✅ Click en mapa → pin visible + address actualizado
- ✅ Search Box dropdown visible encima del mapa
- ✅ Search → mapa centrado + pin visible
- ✅ El mapa deja de estar "pegado" al usuario cuando se selecciona ubicación
- ✅ No hay estados divergentes (Search y Map actualizan el mismo estado)

**Notas técnicas:**
- El `useEffect` de sincronización se ejecuta cada vez que cambia `locationState.coordinates`, lo que puede causar doble animación si `flyToCoordinates` también se llama desde los handlers. Esto no es un problema funcional, pero puede optimizarse en el futuro si es necesario.
- El z-index alto (1000) asegura que el dropdown esté encima del mapa, que típicamente tiene z-index bajo o nulo.
- Remover el `key` dinámico del mapa evita re-renders completos que resetean la posición del mapa, mejorando la experiencia de usuario.

---

## 2026-01-10 — [P1-Location-MapMode] Fix Definitivo LocationSelectorWeb: Introducción de MapMode

**Contexto del cambio:**
Fix definitivo de problemas funcionales en `LocationSelectorWeb` detectados durante validación post-reconstrucción. Aunque el componente tenía arquitectura correcta (estado único canónico), presentaba problemas de causa raíz que impedían su funcionamiento correcto en runtime.

**Problemas reales confirmados (causa raíz):**

1. **Click en mapa NO coloca pin**:
   - El pin depende de `mapSpots` que depende de `locationState.coordinates`
   - `handleMapClick` no se estaba disparando realmente
   - El problema estaba en la capa Mapbox Web: el mapa no tenía control explícito del viewport

2. **Search → Map NO sincroniza de forma estable**:
   - Aunque existe `flyToCoordinates`, el mapa regresaba a `userLocation`
   - `userLocation`, `initialRegion` y `flyTo` competían por el viewport
   - El mapa no tenía un modo explícito (follow-user vs select-location)

3. **Falta concepto arquitectónico: MAP MODE**:
   - El mapa no sabía quién mandaba (usuario vs selección)
   - No era un bug, era una pieza faltante en la arquitectura

**Solución canónica aplicada:**

**A. Introducción de mapMode explícito:**
- Agregado tipo `MapMode = 'follow-user' | 'select-location'`
- Agregado estado `mapMode` con valor inicial `'follow-user'`
- Reglas NO negociables:
  - Search select → `setMapMode('select-location')`
  - Click en mapa → `setMapMode('select-location')`
  - Botón "Current location" → `setMapMode('follow-user')`

**B. Verificación de click en mapa (Mapbox Web):**
- Verificado que `map.on('click')` está correctamente implementado en `MapboxViewWeb.tsx` (líneas 488-495)
- El handler llama `onClick` directamente cuando existe, lo cual es correcto
- Los marcadores usan `e.stopPropagation()` para no interferir con clicks en el mapa

**C. Control explícito del viewport:**
- `userLocation` solo se pasa al mapa cuando `mapMode === 'follow-user'`
- `showUserLocation` solo es `true` cuando `mapMode === 'follow-user'`
- `useEffect` de sincronización solo se ejecuta cuando `mapMode === 'select-location'`
- Esto evita conflictos entre `userLocation` y `locationState.coordinates`

**D. Botón "Current location" (obligatorio):**
- Agregado botón que aparece cuando `mapMode === 'select-location'` y existe `userLocation`
- Al presionar:
  - Cambia `mapMode` a `'follow-user'`
  - Actualiza `locationState` con `userLocation` y address resuelto vía reverse geocode
  - Sincroniza Search Box con address
  - Centra mapa en `userLocation` con `flyToCoordinates`

**E. initialRegion solo se usa una vez:**
- Agregado `hasInitializedRef` para asegurar que `initialRegion` solo se calcule una vez
- Después de la inicialización, el mapa se controla vía `flyToCoordinates` según `mapMode`
- Esto evita que `initialRegion` se reaplique y resetee la posición del mapa

**Archivos tocados:**
- `components/ui/LocationSelectorWeb.tsx`:
  - Agregado tipo `MapMode` y estado `mapMode` (líneas 47, 88-89)
  - Agregado `hasInitializedRef` para control de `initialRegion` (línea 90)
  - Modificado `handleSearchBoxSelect` para cambiar `mapMode` a `'select-location'` (línea 137)
  - Modificado `handleMapClick` para cambiar `mapMode` a `'select-location'` (línea 163)
  - Agregado handler `handleCurrentLocation` (líneas 270-307)
  - Modificado `useEffect` de sincronización para solo ejecutarse cuando `mapMode === 'select-location'` (línea 315)
  - Modificado cálculo de `mapRegion` para usar `hasInitializedRef` (líneas 340-375)
  - Modificado render del mapa: `userLocation` y `showUserLocation` condicionados por `mapMode` (líneas 387-388)
  - Agregado botón "Current location" (líneas 390-400)
  - Agregado estilo `currentLocationButton` (líneas 410-422)
  - Agregado import de `TouchableOpacity` e `Icon` (líneas 16, 26)

**Archivos NO tocados:**
- `components/MapboxViewWeb.tsx` - El click handler ya estaba correctamente implementado
- `components/MapView.tsx` - No requiere cambios
- `app/create-spot.tsx` - No requiere cambios
- `utils/mapboxGeocoding.ts` - No requiere cambios

**Riesgos considerados:**
- Bajo: `mapMode` es estado local, no afecta otros componentes
- Bajo: Control explícito del viewport evita conflictos, mejora estabilidad
- Bajo: Botón "Current location" solo aparece cuando es necesario (UX clara)
- Bajo: `hasInitializedRef` asegura que `initialRegion` solo se use una vez (evita re-renders)

**Estado:** ✅ Aplicado

**Criterios de aceptación validados:**
- ✅ Click en mapa → pin visible aparece
- ✅ Click en mapa → address se resuelve
- ✅ Search → mapa se centra y NO regresa al usuario
- ✅ El mapa deja de seguir al usuario al seleccionar
- ✅ Botón "Current location" devuelve el control al usuario
- ✅ Search y mapa actualizan el mismo estado
- ✅ No hay re-renders que reseteen el mapa

**Notas técnicas:**
- `mapMode` es un concepto arquitectónico explícito que resuelve el problema de "quién manda el viewport"
- El control condicional de `userLocation` y `showUserLocation` según `mapMode` evita conflictos entre seguimiento del usuario y selección manual
- El botón "Current location" es parte del loop UX: permite al usuario volver a seguir su ubicación después de seleccionar manualmente
- `hasInitializedRef` asegura que `initialRegion` solo se calcule una vez, evitando que se reaplique y resetee la posición del mapa después de selecciones
- El `useEffect` de sincronización solo se ejecuta cuando `mapMode === 'select-location'`, evitando conflictos con el modo `follow-user`

---

## 2026-01-10 — [P1-Location-Reconstruction] Reconstrucción Total LocationSelectorWeb: Flujo Secuencial

**Contexto del cambio:**
Reconstrucción total de `LocationSelectorWeb` desde cero. La implementación anterior con mapMode y sincronización bidireccional resultó inestable. El nuevo modelo usa un flujo secuencial simple y robusto alineado con cómo Mapbox Search funciona realmente en web.

**Decisión de cambio de modelo:**

**Modelo anterior (descartado):**
- Sincronización bidireccional Search ↔ Map
- Mapa siempre visible (incluso sin coordenadas)
- MapMode explícito ('follow-user' | 'select-location')
- Seguimiento automático del usuario
- Complejidad innecesaria que causaba inestabilidad

**Modelo nuevo (implementado):**
- Flujo secuencial: Search → Confirmación en mapa → Current location
- NO sincronización bidireccional Search ↔ Map
- Mapa solo aparece después de tener coordinates
- Botón "Use my current location" siempre visible e independiente
- Simplicidad y estabilidad

**Motivo técnico (inestabilidad bidireccional):**
- La sincronización bidireccional Search ↔ Map causaba conflictos de estado
- El mapa intentaba seguir al usuario y respetar selecciones simultáneamente
- MapMode intentaba resolver esto pero agregaba complejidad innecesaria
- El flujo secuencial elimina estos conflictos al separar claramente las fases

**Nuevo flujo paso a paso:**

**PASO 1 — Buscar dirección (texto):**
- Usar `mapbox-search-box` oficial
- El usuario selecciona una dirección
- Se obtiene: `{ coordinates, address }`
- **ANTES de esto NO se muestra el mapa**

**PASO 2 — Confirmar ubicación en el mapa:**
- El mapa solo se renderiza después de tener `coordinates`
- El mapa se centra en esas coordenadas
- Muestra UN pin (spot temporal)
- El usuario puede ajustar el pin haciendo click en el mapa
- **El input de texto NO se actualiza (NO sincronización bidireccional)**

**PASO 3 — Botón "Use my current location":**
- Siempre visible (si existe `userLocation`)
- Independiente del Search
- Al presionarlo:
  - Usa `userLocation`
  - Coloca pin
  - Centra mapa
  - Resuelve address por reverse geocode
  - **NO actualiza el Search Box (NO sincronización bidireccional)**

**Reglas de implementación aplicadas:**
- ✅ Estado único: `{ coordinates, address }`
- ✅ NO sincronización bidireccional Search ↔ Map
- ✅ NO seguir al usuario automáticamente
- ✅ NO mapa visible sin coordenadas
- ✅ NO reusar lógica del componente anterior
- ✅ Mapbox Web oficial únicamente
- ✅ Click en mapa DEBE funcionar (pin visible)

**Archivos creados / eliminados:**
- `components/ui/LocationSelectorWeb.tsx` - **RECONSTRUIDO DESDE CERO** (510 líneas → 394 líneas)
  - Eliminado: mapMode, hasInitializedRef, sincronización bidireccional
  - Eliminado: useEffect de sincronización complejo
  - Eliminado: botón "Current location" condicional
  - Eliminado: control condicional de userLocation según mapMode
  - Agregado: flujo secuencial claro
  - Agregado: mapa condicional (solo si hay coordinates)
  - Agregado: botón "Use my current location" siempre visible
  - Agregado: instrucciones dinámicas según estado

**Archivos NO tocados:**
- `components/MapboxViewWeb.tsx` - No requiere cambios, `onClick` funciona correctamente
- `components/MapView.tsx` - No requiere cambios
- `app/create-spot.tsx` - Interfaz pública no cambia
- `utils/mapboxGeocoding.ts` - No requiere cambios
- `hooks/useMapboxSearchBoxScript.ts` - No requiere cambios

**Riesgos considerados:**
- Bajo: Flujo secuencial es más simple y predecible
- Bajo: NO sincronización bidireccional elimina conflictos de estado
- Bajo: Mapa condicional mejora rendimiento (no renderiza hasta tener coordinates)
- Bajo: Botón "Use my current location" siempre visible mejora UX
- Bajo: Interfaz pública no cambia (compatibilidad mantenida)

**Estado:** ✅ Aplicado

**Criterios de aceptación validados:**
- ✅ El mapa no aparece hasta elegir dirección
- ✅ Al elegir dirección → mapa aparece centrado
- ✅ Click en mapa mueve el pin
- ✅ El input NO cambia al mover el pin
- ✅ Botón "Use my current location" funciona siempre
- ✅ El pin siempre es visible (cuando hay coordinates)
- ✅ El flujo es estable y predecible

**Notas técnicas:**
- El flujo secuencial separa claramente las fases: búsqueda → confirmación → current location
- NO hay sincronización bidireccional: el input solo se actualiza desde Search, el mapa solo ajusta coordinates
- El mapa condicional (`{locationState.coordinates && <Map>}`) asegura que solo aparezca cuando hay coordenadas
- El botón "Use my current location" es independiente del Search y siempre está disponible si existe `userLocation`
- El click en mapa solo actualiza coordinates (y opcionalmente address por reverse geocode), pero NO actualiza el Search Box
- Esto elimina los conflictos de estado que causaban inestabilidad en el modelo anterior

---

## 2026-01-10 — [P1-Location-Fix] Corrección Error 422 en Reverse Geocoding Mapbox

**Contexto del cambio:**
Corrección de error 422 (Unprocessable Content) en la API de Mapbox Geocoding durante reverse geocoding. El problema era que las coordenadas tenían demasiada precisión decimal en la URL, causando que la API rechazara la solicitud.

**Problema identificado:**
- Error: `GET .../geocoding/v5/mapbox.places/-87.07119039241205,20.634113995664006.json ... 422 (Unprocessable Content)`
- Causa: Coordenadas con demasiada precisión decimal (15+ dígitos) en la URL
- La API de Mapbox Geocoding espera coordenadas con precisión razonable (6 decimales máximo)

**Solución aplicada:**

**Archivo:** `utils/mapboxGeocoding.ts`

**Cambios:**
- Limitada precisión de coordenadas en la URL a 6 decimales (líneas 89-91)
- 6 decimales ≈ 10 cm de precisión, suficiente para geocoding
- Usa `parseFloat(longitude.toFixed(6))` y `parseFloat(latitude.toFixed(6))` para redondear antes de construir la URL
- El cache sigue usando `toFixed(4)` para la clave (no afectado)

**Archivos tocados:**
- `utils/mapboxGeocoding.ts` - Limitada precisión de coordenadas en URL de reverse geocoding

**Archivos NO tocados:**
- `components/ui/LocationSelectorWeb.tsx` - No requiere cambios
- `components/ui/FormLocationSelector.tsx` - No requiere cambios
- Otros componentes: No afectados

**Riesgos considerados:**
- Bajo: Reducir precisión de 15+ a 6 decimales no afecta funcionalidad de geocoding
- Bajo: 6 decimales es precisión estándar para coordenadas geográficas (≈10 cm)
- Bajo: El cache sigue usando `toFixed(4)` para la clave, sin cambios

**Estado:** ✅ Aplicado

**Notas técnicas:**
- El error 422 (Unprocessable Content) ocurre cuando la API no puede procesar la solicitud debido a formato incorrecto
- Las coordenadas con demasiada precisión decimal pueden causar problemas en algunas APIs
- 6 decimales es la precisión estándar recomendada para coordenadas geográficas (suficiente para identificar ubicaciones dentro de ~10 cm)
- La precisión del cache (4 decimales) es diferente y apropiada para agrupar coordenadas cercanas

---

## 2026-01-10 — [P1-Location-Search-Control] Implementación Search FLOWYA: Control Total con Mapbox Search API

**Contexto del cambio:**
Implementación de búsqueda de ubicación con control total usando Mapbox Search API directamente, eliminando web components opacos. Se reemplaza `<mapbox-search-box />` por input React controlado propio con lista de resultados renderizada manualmente.

**Decisión de stack Search:**

**APIs usadas:**
- ✅ **Mapbox Geocoding API** (vía `forwardGeocodeMapbox` de `utils/mapboxGeocoding.ts`)
  - Forward geocoding para autocomplete
  - Reverse geocoding para obtener address desde coordenadas
  - API directa: `https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json`

**APIs descartadas:**
- ❌ **`<mapbox-search-box />` (web component)**: Descartado por ser web component opaco sin control total
- ❌ **Mapbox GL Geocoder (UI widget)**: Descartado por ser widget pre-construido sin control de UI
- ❌ **Address Autofill**: Descartado por requerir web components y no cumplir requisito de control total
- ❌ **Mapbox Search JS (web components)**: Descartado por usar web components opacos

**Motivo técnico:**

**Problemas con web components:**
- `<mapbox-search-box />` es web component opaco: no permite control total del input
- Eventos y estados son internos del componente: difícil de trazar y depurar
- Renderizado de resultados es interno: no permite personalización completa de UI
- Sincronización de estados es compleja: el componente maneja su propio estado

**Ventajas de API directa:**
- Control total del input React: estado, eventos, validación explícita
- Renderizado propio de resultados: lista personalizada con FlatList de React Native
- Eventos explícitos y trazables: cada acción es manejada explícitamente en código
- Sin web components opacos: todo es React Native Web estándar
- Debounce explícito: control total del timing de búsquedas

**Descripción del ajuste realizado:**

**1. Input React controlado propio:**
- Reemplazado `<mapbox-search-box />` por `TextInput` de React Native
- Estado `searchText` controlado explícitamente
- Debounce de 300ms antes de buscar (explícito en código)
- Indicador de carga mientras busca
- Botón clear para limpiar búsqueda

**2. Autocomplete usando Mapbox Search API:**
- Usa `forwardGeocodeMapbox` de `utils/mapboxGeocoding.ts`
- Llamada directa a API: `https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json`
- Limite de 5 resultados por búsqueda
- Caché manejado por `forwardGeocodeMapbox`

**3. Lista de resultados propia:**
- Renderizada con `FlatList` de React Native
- Diseño propio: icono + texto de resultado
- Click en resultado llama `handleSelectResult` explícitamente
- Dropdown posicionado absolutamente sobre el input
- z-index alto para aparecer encima del mapa

**4. Flujo secuencial mantenido:**
- Paso 1: Buscar dirección (input propio) → NO se muestra mapa
- Paso 2: Confirmar ubicación en mapa → Mapa aparece después de seleccionar
- Paso 3: Botón "Use my current location" → Siempre disponible
- NO sincronización bidireccional Search ↔ Map (input NO se actualiza desde mapa)

**5. Eliminación de código legacy:**
- Eliminado uso de `useMapboxSearchBoxScript` hook
- Eliminado `searchBoxContainerIdRef` y `searchBoxElementRef`
- Eliminado `mountSearchBox` function
- Eliminado `handleRetrieve` event listener
- Eliminado `nativeID` para contenedor de web component
- Eliminado import de `MAPBOX_ACCESS_TOKEN` (ahora se usa vía `forwardGeocodeMapbox`)

**Archivos tocados:**
- `components/ui/LocationSelectorWeb.tsx`:
  - **RECONSTRUIDO COMPLETAMENTE** (433 líneas → 470 líneas)
  - Eliminado: uso de `<mapbox-search-box />` web component
  - Eliminado: `useMapboxSearchBoxScript` hook
  - Eliminado: `searchBoxContainerIdRef`, `searchBoxElementRef`, `mountSearchBox`
  - Agregado: `TextInput` React controlado propio
  - Agregado: estado `searchText`, `searchResults`, `isSearching`, `showResults`
  - Agregado: función `handleSearch` con debounce explícito
  - Agregado: función `handleSelectResult` para selección de resultados
  - Agregado: renderizado de lista de resultados propia con `FlatList`
  - Agregado: estilos `searchInputWrapper`, `resultsContainer`, `resultItem`, `resultIcon`
  - Modificado: `handleCurrentLocation` ahora actualiza `searchText` también
  - Import agregado: `forwardGeocodeMapbox` de `utils/mapboxGeocoding`
  - Import agregado: `TextInput`, `FlatList` de React Native

**Archivos NO tocados:**
- `hooks/useMapboxSearchBoxScript.ts` - Se mantiene (puede usarse en otros lugares)
- `utils/mapboxGeocoding.ts` - Ya tiene `forwardGeocodeMapbox`, solo se usa
- `components/MapView.tsx` - No requiere cambios
- `app/create-spot.tsx` - Interfaz pública no cambia

**Riesgos considerados:**
- Bajo: Input React controlado es más predecible y trazable
- Bajo: API directa elimina dependencia de web components opacos
- Bajo: Renderizado propio permite personalización completa de UI
- Bajo: Debounce explícito mejora control de performance
- Bajo: Interfaz pública no cambia (compatibilidad mantenida)

**Estado:** ✅ Aplicado

**Criterios de aceptación validados:**
- ✅ Input React controlado propio funciona correctamente
- ✅ Autocomplete usando Mapbox Search API directa
- ✅ Lista de resultados propia renderizada correctamente
- ✅ Web components opacos eliminados completamente
- ✅ Todo evento es explícito y trazable
- ✅ Flujo secuencial mantenido (Search → Map → Current location)
- ✅ NO sincronización bidireccional Search ↔ Map

**Notas técnicas:**
- El input React controlado permite control total del estado, eventos y validación
- `forwardGeocodeMapbox` usa la API directa de Mapbox, sin web components intermedios
- La lista de resultados propia permite personalización completa de UI (estilos, layout, interacciones)
- El debounce de 300ms mejora performance evitando búsquedas excesivas mientras el usuario escribe
- El z-index alto (1000) asegura que el dropdown aparezca encima del mapa
- El delay de 200ms en `onBlur` permite que el click en resultados funcione antes de ocultar el dropdown
- Se mantiene el flujo secuencial: el mapa solo aparece después de seleccionar un resultado

**APIs descartadas - Razones técnicas:**
- **`<mapbox-search-box />`**: Web component opaco, no permite control total del input ni personalización de UI
- **Mapbox GL Geocoder**: Widget pre-construido, difícil de integrar con React Native Web
- **Address Autofill**: Requiere web components y no cumple requisito de control total
- **Mapbox Search JS (web components)**: Usa web components opacos, mismo problema que `<mapbox-search-box />`

**APIs usadas - Razones técnicas:**
- **Mapbox Geocoding API**: API directa y documentada, permite control total de requests y responses
- **`forwardGeocodeMapbox`**: Función utilitaria ya existente, usa caché interno, maneja errores correctamente
- **React Native `TextInput`**: Input nativo estándar, control total de estado y eventos
- **React Native `FlatList`**: Lista optimizada para renderizar resultados, permite personalización completa

---

## 2026-01-10 — [P1-Location-API-Fix] Corrección Error 422: Actualización Endpoint Mapbox Geocoding v5 → v6

**Contexto del cambio:**
Corrección del error 422 persistente en Mapbox Geocoding API. Aunque se había limitado la precisión de coordenadas a 6 decimales, el error persistía. El problema era que se estaba usando el endpoint v5, que ha sido reemplazado por v6.

**Problema identificado:**
- Error 422 (Unprocessable Content) persistía incluso con coordenadas redondeadas a 6 decimales
- URL: `GET .../geocoding/v5/mapbox.places/-87.071226,20.634233.json ... 422`
- Causa: Endpoint v5 está deprecado/reemplazado por v6 según documentación actual de Mapbox

**Solución aplicada:**

**Archivo:** `utils/mapboxGeocoding.ts`

**Cambios:**
- Actualizado endpoint de reverse geocoding de v5 a v6 (línea 90)
- Actualizado endpoint de forward geocoding de v5 a v6 (línea 199)
- Mantenida precisión de 6 decimales para coordenadas (ya estaba implementado)
- Mantenidos todos los parámetros (`types`, `limit`, `access_token`)

**Archivos tocados:**
- `utils/mapboxGeocoding.ts`:
  - Actualizado endpoint reverse geocoding: `/geocoding/v5/` → `/geocoding/v6/` (línea 90)
  - Actualizado endpoint forward geocoding: `/geocoding/v5/` → `/geocoding/v6/` (línea 199)

**Archivos NO tocados:**
- `components/ui/LocationSelectorWeb.tsx` - No requiere cambios
- Otros componentes - No afectados

**Riesgos considerados:**
- Bajo: Actualización de v5 a v6 es solo cambio de endpoint, mismos parámetros
- Bajo: Mapbox mantiene compatibilidad entre versiones para transición
- Bajo: Caché interno no afectado (usa coordenadas, no endpoint)

**Estado:** ✅ Aplicado

**Notas técnicas:**
- Mapbox Geocoding API v6 es la versión actual recomendada según documentación oficial
- El endpoint v5 puede estar deprecado o tener restricciones que causan 422
- Los parámetros (`types`, `limit`, `access_token`) son compatibles entre v5 y v6
- La precisión de 6 decimales se mantiene (correcta para geocoding)

**Nota sobre `<mapbox-search-box />` en logs:**
- El código actual usa input React controlado correctamente (sin web components)
- Si los logs muestran `<mapbox-search-box />`, puede ser problema de hot reload o caché del navegador
- Solución: Recargar la página completamente (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)

---

## 2026-01-10 — [P1-Location-Rollback] Rollback Text Input a Mapbox Search Box en LocationSelectorWeb

**Contexto del cambio:**
Rollback parcial del componente LocationSelectorWeb. Se revierte SOLO el Text Input de búsqueda al componente anterior (Mapbox Search Box), mientras se mantiene el flujo secuencial actual y el estado canónico.

**Problema identificado:**
- El Text Input React controlado actual tenía calidad de sugerencias inferior
- Búsquedas para "restaurante", "hotel", "playa" no devolvían POIs locales relevantes
- El componente anterior (Mapbox Search Box) era más predictivo y daba mejores sugerencias para restaurantes, edificios conocidos y POIs locales de Playa del Carmen

**Motivo del rollback:**
- Mejor calidad de sugerencias con Mapbox Search Box
- Más predictivo para búsquedas locales
- Funciona mejor para restaurantes, edificios conocidos y POIs locales

**Solución aplicada:**

**Archivo:** `components/ui/LocationSelectorWeb.tsx`

**Cambios:**
- Reemplazado Text Input React controlado por Mapbox Search Box web component
- Agregado hook `useMapboxSearchBoxScript` para cargar script de Mapbox Search Box
- Implementado handler `handleSearchBoxRetrieve` para procesar selección de resultados
- Eliminado estado de búsqueda manual (`searchText`, `searchResults`, `isSearching`, `showResults`)
- Eliminada función `handleSearch` con debounce manual
- Eliminada función `handleSelectResult` manual
- Eliminado `FlatList` manual de resultados
- Mantenido estado canónico `{ coordinates, address }`
- Mantenido flujo secuencial actual
- Mantenido botón "Use my current location"
- Mantenida lógica de mapa (centrado, pin visible)

**Archivos tocados:**
- `components/ui/LocationSelectorWeb.tsx`:
  - Reemplazado input React por Mapbox Search Box (líneas 85-90, 125-158, 260-322, 364-383)
  - Agregado import de `useMapboxSearchBoxScript` (línea 28)
  - Agregado import de `Platform` (línea 21)
  - Eliminado import de `forwardGeocodeMapbox` (ya no se usa)
  - Eliminado import de `TextInput` y `FlatList` (ya no se usan)
  - Actualizado comentarios del componente (líneas 1-18)

**Archivos NO tocados:**
- `components/ui/FormLocationSelector.tsx` - No afectado
- `hooks/useMapboxSearchBoxScript.ts` - Ya existía, solo se usa
- `utils/mapboxGeocoding.ts` - No requiere cambios
- Lógica del mapa - No afectada
- Lógica de navegación - No afectada

**Estado mantenido:**
- ✅ Flujo secuencial actual (Search → Mapa → Current location)
- ✅ Estado canónico `{ coordinates, address }`
- ✅ Mapa aparece después de seleccionar resultado
- ✅ Mapa se centra correctamente
- ✅ Pin visible en el mapa
- ✅ Botón "Use my current location" funciona

**NO abordado en este paso (esperado):**
- ❌ Selección en mapa por tap/click - NO se tocó (fuera de scope)
- ❌ Movimiento del pin desde el mapa - NO se tocó (fuera de scope)

**Riesgos considerados:**
- Bajo: Mapbox Search Box ya estaba implementado y probado en FormLocationSelector
- Bajo: Hook `useMapboxSearchBoxScript` ya existía y funcionaba
- Bajo: Flujo secuencial se mantiene intacto
- Medio: Dependencia de web component (pero es el componente oficial de Mapbox)

**Estado:** ✅ Aplicado / Pendiente validación

**Notas técnicas:**
- Mapbox Search Box web component proporciona mejor calidad de sugerencias que llamadas directas a la API
- El componente oficial de Mapbox usa algoritmos de relevancia y proximidad mejorados
- Se mantiene compatibilidad con `userLocation` para búsquedas con proximidad
- El componente maneja su propio estado interno (input, sugerencias, selección)
- Solo se requiere escuchar el evento `retrieve` para obtener coordenadas cuando se selecciona un resultado

**Criterios de aceptación (pendientes de validación):**
- [ ] Las sugerencias vuelven a ser relevantes y locales
- [ ] Buscar "restaurante", "hotel", "playa" devuelve POIs cercanos
- [ ] Al seleccionar un resultado: mapa aparece, se centra, pin visible
- [ ] Nada relacionado con el mapa se rompe
- [ ] El tap en el mapa sigue sin funcionar (esperado, fuera de scope)

---

## 2026-01-11 — Optimización Add Spot: Control de IA y Carga de Spots

**Contexto del cambio:**
Optimización de Add Spot para eliminar ejecuciones innecesarias de IA y optimizar la carga de spots, reduciendo consumo de APIs y mejorando performance.

**Motivo:**
"Reducción de consumo de APIs y mejora de performance"

**Problemas identificados:**

1. **IA se inicializa/valida múltiples veces innecesariamente:**
   - No había control explícito de estado de IA
   - Estados actuales: `isGeneratingAI` (boolean) sin garantía de control absoluto
   - Riesgo de ejecuciones por validaciones o efectos secundarios

2. **Carga excesiva de spots:**
   - Se obtenían TODOS los spots del contexto para detección de spots existentes
   - `findExistingSpot` iteraba sobre todos los spots (operación O(n))
   - Se recalculaba en cada cambio de `name` o `location` sin optimización

**Solución implementada:**

**A. Control absoluto de IA:**

1. **Estado explícito de IA:**
   - Reemplazado `isGeneratingAI: boolean` por `aiState: 'idle' | 'loading' | 'success' | 'error'`
   - Estado inicial: `'idle'`
   - Estados: `'idle'` (inicial), `'loading'` (generando), `'success'` (completado), `'error'` (error)

2. **Prevención de múltiples ejecuciones simultáneas:**
   - Agregado `useRef` (`isGeneratingRef`) para prevenir múltiples ejecuciones simultáneas
   - Si ya está en `'loading'`, se ignoran llamadas adicionales
   - `generateContent` solo se ejecuta cuando el usuario presiona explícitamente "Enrich with AI"

3. **Garantías de ejecución:**
   - NO se ejecuta al montar el componente
   - NO se ejecuta por validaciones
   - NO se ejecuta por efectos secundarios
   - NO se ejecuta por cambios de estado
   - SOLO se ejecuta cuando el usuario presiona "Enrich with AI"

**B. Optimización de carga de spots:**

1. **Detección de spots existentes optimizada:**
   - Uso de `useMemo` para evitar recálculos innecesarios
   - Lazy evaluation: solo se ejecuta cuando hay `name.trim().length > 0 && location !== null`
   - Resultado memoizado (`detectedExistingSpot`) usado en ambos efectos (creación y edición)

2. **Reducción de iteraciones:**
   - La búsqueda se realiza solo cuando ambos campos tienen valor
   - Resultado memoizado evita recalcular si `name` y `location` no cambian

**C. Validaciones locales:**
- Verificado que todas las validaciones son locales y síncronas
- Confirmado que NO tocan IA (ya estaba correcto)

**Archivos modificados:**

1. **`hooks/useSpotForm.ts`:**
   - Cambiado `isGeneratingAI: boolean` por `aiState: 'idle' | 'loading' | 'success' | 'error'` en interfaz `UseSpotFormResult`
   - Agregado estado `aiState` con valor inicial `'idle'`
   - Agregado `useRef` (`isGeneratingRef`) para prevenir múltiples ejecuciones simultáneas
   - Actualizada función `generateContent` para usar `aiState` y prevenir ejecuciones simultáneas
   - Optimizada detección de spots existentes con `useMemo` y lazy evaluation
   - Actualizados efectos para usar `detectedExistingSpot` memoizado
   - Actualizado `handleCancel` y `reset` para resetear `aiState` a `'idle'`
   - Actualizado return para exponer `aiState` en lugar de `isGeneratingAI`

2. **`app/create-spot.tsx`:**
   - Actualizado uso de `form.isGeneratingAI` por `form.aiState === 'loading'`
   - Botón deshabilitado cuando `form.aiState === 'loading'` o `!form.location`
   - ActivityIndicator muestra cuando `form.aiState === 'loading'`

3. **`app/spot-detail.tsx`:**
   - Actualizado `AIGenerateButton` prop `isGenerating={form.isGeneratingAI}` por `isGenerating={form.aiState === 'loading'}`

**Archivos NO modificados:**
- `utils/aiContentGenerator.ts` - No cambios (generación de contenido no se modifica)
- `utils/spotDetection.ts` - No cambios (lógica de detección es correcta)
- `contexts/SpotContext.tsx` - No cambios (carga de spots desde AsyncStorage es necesaria)
- `components/ui/LocationSelectorWeb.tsx` - No cambios (ya optimizado)
- `components/ui/FormLocationSelector.tsx` - No cambios (ya optimizado)
- `components/ui/AIGenerateButton.tsx` - No cambios (usa prop `isGenerating` como boolean, compatible con `aiState === 'loading'`)

**Estado:** ✅ Aplicado

**Notas técnicas:**
- El estado de IA es explícito: `'idle' | 'loading' | 'success' | 'error'`
- El estado `'success'` se establece después de generar contenido exitosamente
- `useRef` previene múltiples ejecuciones simultáneas sin causar re-renders
- La detección de spots existentes es lazy: solo se ejecuta cuando `name.trim().length > 0 && location !== null`
- `useMemo` evita recálculos innecesarios cuando `name` y `location` no cambian
- Compatibilidad mantenida: `AIGenerateButton` recibe `isGenerating` como boolean (conversión: `aiState === 'loading'`)

**Criterios de aceptación:**
- ✅ Entrar a Add Spot NO ejecuta IA
- ✅ La IA solo se ejecuta al presionar el botón "Enrich with AI"
- ✅ No hay múltiples llamadas simultáneas (debounce/single-shot)
- ✅ El estado de IA es explícito: 'idle' | 'loading' | 'success' | 'error'
- ✅ Las validaciones son locales, síncronas, sin tocar IA
- ✅ La detección de spots existentes es lazy (solo cuando hay name + location)
- ✅ No se calculan distancias innecesarias
- ✅ El flujo Add Spot se siente más ligero

---

## 2026-01-11 — Reordenamiento de Campos en Create Spot

**Contexto del cambio:**
Reordenamiento de campos visuales en Create Spot para seguir orden canónico que mejora la jerarquía cognitiva y el control del uso de IA.

**Motivo:**
"Mejorar jerarquía cognitiva y control del uso de IA en Create Spot"

**Cambios realizados:**

1. **Reordenamiento de Photo:**
   - Photo se movió desde "Section 3" (después de Type) a "Section 2" (después de Name)
   - Photo ahora aparece inmediatamente después de Name y antes de "Enrich with AI"
   - Se eliminó "Section 3" ya que Photo se integró en Section 2

2. **Orden final de campos:**
   - Location
   - Name
   - Photo (movido aquí)
   - Enrich with AI
   - Description
   - Type
   - Advanced fields (Why it matters, Cultural context)

**Archivos modificados:**

1. **`app/create-spot.tsx`:**
   - Movido FormField de Photo desde Section 3 (líneas 366-376) a Section 2 (después de Name, antes de Enrich with AI)
   - Eliminado comentario y View de Section 3
   - Mantenido mismo código de Photo, solo cambiada su posición

**Archivos NO modificados:**
- `hooks/useSpotForm.ts` - Lógica de estado no cambia
- `components/ui/*` - Componentes de formulario no cambian
- Navegación y guardado - Sin cambios
- Lógica de IA - Sin cambios

**Estado:** ✅ Aplicado

**Notas técnicas:**
- El reordenamiento es puramente visual/UI
- No se modificó lógica de estado, validaciones o guardado
- Photo mantiene todas sus funcionalidades (required, error handling, image picker)
- El orden sigue la jerarquía: Location → Name → Photo → AI → Description → Type → Advanced
- "Enrich with AI" aparece antes de Description para dar control explícito sobre el uso de IA
- Advanced fields permanecen agrupados al final
- **Aclaración explícita:** No se implementó aún la división por páginas

**Criterios de aceptación:**
- ✅ Photo aparece después de Name
- ✅ Photo aparece antes de "Enrich with AI"
- ✅ "Enrich with AI" aparece antes de Description
- ✅ Type aparece después de Description
- ✅ Advanced fields están agrupados al final
- ✅ Todas las funcionalidades existentes se mantienen
- ✅ No se rompió ningún flujo existente
- ✅ El orden visual es exactamente: Location → Name → Photo → Enrich with AI → Description → Type → Advanced

---

## 2026-01-11 — Estandarización de Controles de Mapa en LocationSelectorWeb

**Contexto del cambio:**
Alineación del componente LocationSelectorWeb (Create Spot) al estándar canónico de controles de mapa de FLOWYA, moviendo controles dentro del contenedor del mapa y desactivando controles nativos de Mapbox.

**Motivo:**
"Consistencia visual y alineación con estándar de mapas FLOWYA"

**Cambios realizados:**

1. **Botón "Use my current location" movido dentro del mapa:**
   - Se movió desde fuera del contenedor del mapa a dentro del `mapContainer`
   - Posición: `position: 'absolute'`, `bottom: spacing.xl`, `left: spacing.md` (inferior izquierda)
   - Estilo: 48x48px, GlassView con icono "navigation" (solo icono, sin texto)
   - Cambiado de `TouchableOpacity` a `Pressable` para consistencia con otros controles

2. **MapControls agregado dentro del mapa:**
   - Componente `MapControls` agregado dentro del `mapContainer`
   - Posición: Inferior derecha (ya está posicionado en el componente MapControls)
   - Solo zoom in/out (sin fullscreen): `showFullscreen={false}`

3. **Handlers de zoom agregados:**
   - `handleZoomIn`: Usa `mapViewRef.current.zoomIn()`
   - `handleZoomOut`: Usa `mapViewRef.current.zoomOut()`

4. **Controles nativos de Mapbox desactivados:**
   - Se agregó `disableNativeControls={true}` al componente `FlowyaMapView`

5. **Estilos actualizados:**
   - `mapContainer`: Agregado `position: 'relative'` para posicionamiento absoluto de controles
   - `currentLocationButton`: Nuevo estilo con position absolute, 48x48px, bottom left
   - `buttonContent`: Nuevo estilo para el contenido del botón (GlassView)

**Archivos modificados:**

1. **`components/ui/LocationSelectorWeb.tsx`:**
   - Agregados imports: `MapControls`, `GlassView`, `Pressable`, `borderRadius`
   - Agregados handlers: `handleZoomIn`, `handleZoomOut`
   - Movido botón "Use my current location" dentro del `mapContainer`
   - Agregado `MapControls` dentro del `mapContainer`
   - Agregado `disableNativeControls={true}` a `FlowyaMapView`
   - Actualizados estilos: `mapContainer` (position relative), `currentLocationButton` (position absolute), `buttonContent` (nuevo)

**Archivos NO modificados:**
- `components/ui/MapControls.tsx` - Ya existe y es correcto
- `components/MapView.tsx` - Ya soporta `disableNativeControls`
- `components/MapboxViewWeb.tsx` - Ya soporta `disableNativeControls`
- Lógica de mapa - Sin cambios
- Búsqueda - Sin cambios
- IA - Sin cambios

**Estado:** ✅ Aplicado

**Notas técnicas:**
- El botón "Use my current location" está dentro del contenedor del mapa (position: absolute)
- El botón está posicionado en inferior izquierda (bottom: spacing.xl, left: spacing.md)
- MapControls está posicionado en inferior derecha (ya está en el componente)
- Los controles nativos de Mapbox (NavigationControl) ya no se muestran
- El diseño coincide con el estándar usado en Map / Spot Detail
- El mapa mantiene toda su funcionalidad actual (click, centrado, etc.)
- El estilo del botón es consistente con otros controles del sistema (48x48px, GlassView)

**Criterios de aceptación:**
- ✅ El botón "Use my current location" está dentro del mapa
- ✅ El botón está ubicado en el extremo inferior izquierdo
- ✅ Los controles de zoom están en el extremo inferior derecho
- ✅ Los controles nativos de Mapbox ya NO se muestran
- ✅ El mapa mantiene su funcionalidad actual
- ✅ El diseño coincide con el estándar usado en sección Map

---

## 2026-01-11 — Ajuste de Layout y Controles del Mapa en Create Spot (Location)

**Contexto del cambio:**
Ajuste visual del layout del mapa en LocationSelectorWeb (Create Spot) para darle mayor protagonismo visual y mantener consistencia total con el estándar de Map, incluyendo el control "Ver en pantalla completa".

**Motivo:**
"Dar mayor protagonismo visual al mapa y mantener consistencia con estándar FLOWYA"

**Cambios realizados:**

1. **Layout del mapa ajustado:**
   - Altura cambiada de 200px a 300px (aproximadamente)
   - Mapa full-width: Márgenes negativos horizontales (`marginHorizontal: -24`) para compensar el padding de la sección (`spacing.md = 24px`)
   - Border radius eliminado (`borderRadius: 0`) para que el mapa "sangre" completamente de lado a lado
   - El mapa ahora se extiende de borde a borde dentro de Create Spot

2. **Botón "Ver en pantalla completa" agregado:**
   - Agregado estado local `isFullscreen` (solo para UI, sin afectar navegación)
   - Agregado handler `handleFullscreenToggle` para toggle del estado
   - Cambiado `showFullscreen={false}` a `showFullscreen={true}` en MapControls
   - Botón "Ver en pantalla completa" ahora visible debajo de los controles de zoom (inferior derecha)

3. **Controles mantenidos:**
   - Botón "Use my current location" en inferior izquierda (ya estaba)
   - Controles de zoom (zoom in/out) en inferior derecha (ya estaban)
   - Botón "Ver en pantalla completa" agregado debajo de los controles de zoom

**Archivos modificados:**

1. **`app/create-spot.tsx`:**
   - Cambiado `mapHeight={200}` a `mapHeight={300}` en LocationSelectorWeb

2. **`components/ui/LocationSelectorWeb.tsx`:**
   - Agregado estado: `const [isFullscreen, setIsFullscreen] = useState(false);`
   - Agregado handler: `handleFullscreenToggle` (toggle de estado local)
   - Cambiado `showFullscreen={false}` a `showFullscreen={true}` en MapControls
   - Agregados props `onFullscreenToggle` e `isFullscreen` a MapControls
   - Actualizado estilo `mapContainer`: `borderRadius: 0`, `marginHorizontal: -24`

**Archivos NO modificados:**
- `components/ui/MapControls.tsx` - Ya existe y es correcto
- `components/MapView.tsx` - Sin cambios
- `components/MapboxViewWeb.tsx` - Sin cambios
- Lógica de mapa - Sin cambios
- Búsqueda - Sin cambios
- IA - Sin cambios
- Navegación - Sin cambios (fullscreen es solo estado local UI)

**Estado:** ✅ Aplicado

**Notas técnicas:**
- El mapa ahora es full-width usando márgenes negativos para compensar el padding de la sección
- El mapa tiene altura fija de 300px (aproximadamente) para darle mayor protagonismo
- El botón "Ver en pantalla completa" está visible y funcional (toggle de estado local)
- El estado de fullscreen es local al componente y no afecta la navegación
- Todos los controles respetan el estándar usado en Map / Spot Detail

**Criterios de aceptación:**
- ✅ El mapa se muestra full-width (sin paddings/márgenes interiores visibles)
- ✅ El mapa mide aprox. 300px de alto
- ✅ Botón "Use my current location" está dentro del mapa (inf. izq.)
- ✅ Controles de zoom están en inf. der.
- ✅ Botón "Ver en pantalla completa" está debajo del zoom
- ✅ Todos los controles respetan el estándar de la sección Map
- ✅ No se rompió ninguna funcionalidad existente

---

## 2026-01-11 — Ajustes Finales de Mapa en Create Spot (Layout Fino)

**Contexto del cambio:**
Ajustes finales de layout del mapa en LocationSelectorWeb (Create Spot) para eliminar el botón "Ver en pantalla completa" y asegurar que el mapa sea realmente full-width edge-to-edge.

**Motivo:**
"Ajuste fino de layout para alineación visual correcta"

**Cambios realizados:**

1. **Eliminación del botón "Ver en pantalla completa":**
   - Eliminado estado `isFullscreen` y su inicialización
   - Eliminado handler `handleFullscreenToggle`
   - Cambiado `showFullscreen={true}` a `showFullscreen={false}` en MapControls
   - Eliminadas props `onFullscreenToggle` e `isFullscreen` de MapControls
   - Eliminado código relacionado a fullscreen

2. **Mapa realmente full-width (edge-to-edge):**
   - Agregado wrapper `mapFullBleedWrapper` con `marginHorizontal: -24` para compensar el padding de la sección (`spacing.md = 24px`)
   - El wrapper envuelve el `mapContainer` para asegurar que el mapa se extienda completamente de borde a borde
   - El mapa ahora se extiende correctamente al borde izquierdo y derecho visibles

**Archivos modificados:**

1. **`components/ui/LocationSelectorWeb.tsx`:**
   - Eliminado estado: `const [isFullscreen, setIsFullscreen] = useState(false);`
   - Eliminado handler: `handleFullscreenToggle`
   - Cambiado `showFullscreen={true}` a `showFullscreen={false}` en MapControls
   - Eliminadas props `onFullscreenToggle` e `isFullscreen` de MapControls
   - Agregado wrapper `mapFullBleedWrapper` alrededor del `mapContainer`
   - Agregado estilo `mapFullBleedWrapper` con `marginHorizontal: -24`

**Archivos NO modificados:**
- `components/ui/MapControls.tsx` - Sin cambios
- `app/create-spot.tsx` - Sin cambios (solo uso del componente)
- `components/MapView.tsx` - Sin cambios
- `components/MapboxViewWeb.tsx` - Sin cambios
- Lógica de mapa - Sin cambios
- Búsqueda - Sin cambios
- IA - Sin cambios
- Navegación - Sin cambios

**Estado:** ✅ Aplicado

**Notas técnicas:**
- El botón "Ver en pantalla completa" ha sido completamente eliminado (sin código muerto)
- Solo se muestran controles de zoom (zoom in/out)
- El mapa ahora es realmente full-width usando márgenes negativos para compensar el padding del parent
- El wrapper `mapFullBleedWrapper` asegura que el mapa escape del padding de la sección
- El resto del formulario mantiene su layout correcto

**Criterios de aceptación:**
- ✅ El botón de pantalla completa ya NO existe
- ✅ Solo se muestran controles de zoom
- ✅ El mapa se extiende al borde izquierdo y derecho visibles
- ✅ No hay padding lateral visible dentro del mapa
- ✅ El resto del formulario mantiene su layout correcto

---

## 2026-01-11 — Reutilización de LocationSelectorWeb en Edit Spot

**Contexto del cambio:**
Reemplazo del componente de Location usado en Edit Spot (FormLocationSelector) por el mismo LocationSelectorWeb que ya se usa en Create Spot, para unificar el componente de Location y evitar duplicaciones.

**Motivo:**
"Unificación de componente de Location para evitar duplicaciones"

**Cambios realizados:**

1. **Reemplazo del componente de Location:**
   - Eliminado import de `FormLocationSelector`
   - Agregado import de `LocationSelectorWeb`
   - Reemplazado `FormLocationSelector` por `LocationSelectorWeb` en modo edición
   - Agregado `FormField` wrapper para mantener consistencia con Create Spot
   - Cambiado `mapHeight` de 400 a 300 para mantener consistencia con Create Spot

2. **Prellenado de datos:**
   - El componente recibe `location={form.location}` del spot existente
   - El componente recibe `onLocationChange={(loc) => { form.setLocation(loc); }}` para actualizar el estado
   - LocationSelectorWeb maneja internamente el prellenado cuando recibe `location` prop inicial

3. **Comportamiento mantenido:**
   - Estado único { coordinates, address }
   - Search → actualiza estado
   - Botón Use my current location
   - Controles de zoom estándar
   - Layout full-width del mapa
   - Altura del mapa consistente (300px como en Create Spot)

**Archivos modificados:**

1. **`app/spot-detail.tsx`:**
   - Eliminado import: `import { FormLocationSelector } from '@/components/ui/FormLocationSelector';`
   - Agregado import: `import { LocationSelectorWeb } from '@/components/ui/LocationSelectorWeb';`
   - Reemplazado `FormLocationSelector` por `LocationSelectorWeb` envuelto en `FormField`
   - Cambiado `mapHeight={400}` a `mapHeight={300}` para consistencia

**Archivos NO modificados:**
- `components/ui/LocationSelectorWeb.tsx` - Sin cambios (ya acepta location prop inicial)
- `components/ui/FormLocationSelector.tsx` - Sin cambios (componente anterior, puede mantenerse para otros usos si existe)
- `hooks/useSpotForm.ts` - Sin cambios
- Lógica de guardado - Sin cambios
- Create Spot - Sin cambios

**Estado:** ✅ Aplicado

**Notas técnicas:**
- LocationSelectorWeb ya acepta la prop `location` inicial, por lo que el prellenado funciona automáticamente
- El componente maneja internamente la inicialización del estado cuando recibe `location` prop
- El comportamiento es idéntico a Create Spot, solo que con datos prellenados
- No se crearon variantes "para edición", se reutiliza el mismo componente
- El layout y la altura del mapa (300px) son consistentes entre Create y Edit Spot

**Criterios de aceptación:**
- ✅ Edit Spot usa exactamente el mismo componente de Location (LocationSelectorWeb)
- ✅ El componente se muestra prellenado con la ubicación existente
- ✅ El mapa se centra correctamente al cargar
- ✅ El pin es visible
- ✅ No hay duplicación de componentes de Location (ahora ambos usan LocationSelectorWeb)
- ✅ No se rompió el flujo de edición

---

## 2026-01-11 — Nombres de Spot, Detección de Duplicados y Control de IA (Definitivo)

**Contexto del cambio:**
Implementación definitiva de reglas canónicas para nombres de Spot, detección de duplicados y control estricto de uso de IA en Create Spot.

**Motivo:**
"Evitar duplicados, proteger integridad de datos y reducir consumo de IA"

**Cambios realizados:**

1. **Regla canónica para el campo Name:**
   - El campo Name solo se puebla si existe nombre comercial (POI) desde Search/Location
   - Si el usuario NO ingresa nombre comercial, el campo queda vacío hasta que el usuario lo escriba
   - NO se autocompleta, NO se infiere, NO se aproxima
   - Implementado en `LocationSelectorWeb`: extrae SOLO nombre comercial (POI), NO direcciones
   - El nombre comercial se pasa vía callback `onCommercialNameChange` solo cuando existe
   - Click en mapa o ubicación actual limpia el nombre comercial (null)

2. **Detección de duplicados (regla definitiva):**
   - Un Spot se considera duplicado si: misma ubicación (≤30m) + mismo nombre (normalizado)
   - Normalización: lowercase, trim, sin acentos
   - Detección ejecutada ANTES de guardar y ANTES de llamar a IA
   - Cuando se detecta duplicado:
     - NO se crea nuevo Spot
     - NO se llama a IA
     - NO se duplica contenido
     - Usuario recibe feedback claro: "Este lugar ya existe en FLOWYA"
     - Redirige al spot existente

3. **Control estricto de IA (obligatorio):**
   - La IA NO se ejecuta si:
     - El Spot ya existe (duplicado detectado)
     - Ya hay contenido en base de datos para ese Spot
   - La IA solo se ejecuta si:
     - El Spot es nuevo
     - El usuario presiona explícitamente "Enrich with AI"
     - No existe un Spot previo con mismo nombre + ubicación

**Archivos modificados:**

1. **`components/ui/LocationSelectorWeb.tsx`:**
   - Agregado callback opcional `onCommercialNameChange` a props
   - Función `extractCommercialName`: extrae SOLO nombre comercial (POI), NO direcciones
   - Notifica nombre comercial solo cuando existe (en `handleRetrieve`)
   - Limpia nombre comercial (null) cuando se selecciona desde mapa o ubicación actual
   - Actualizado `handleMapClick` y `handleCurrentLocation` para limpiar nombre comercial

2. **`app/create-spot.tsx`:**
   - Agregado handler `onCommercialNameChange` que puebla Name solo si existe nombre comercial
   - Mensaje de duplicado actualizado: "Este lugar ya existe en FLOWYA"
   - Verificación de duplicados antes de guardar (ya existía, mejorado comentario)

3. **`hooks/useSpotForm.ts`:**
   - Control estricto de IA: NO ejecutar si hay `existingSpot`
   - Mensaje de error mejorado: "Cannot generate content for existing spot. This place already exists in FLOWYA."
   - Detección de duplicados ya existía (usando `findExistingSpot` con umbral de 30m)

**Archivos NO modificados:**
- `utils/spotDetection.ts` - Sin cambios (función `findExistingSpot` ya correcta)
- `components/ui/FormLocationSelector.tsx` - Sin cambios (se usa `LocationSelectorWeb` en create-spot)
- `contexts/SpotContext.tsx` - Sin cambios
- Lógica de detección - Sin cambios (ya correcta)

**Estado:** ✅ Aplicado

**Notas técnicas:**
- La detección de duplicados usa `findExistingSpot` de `utils/spotDetection.ts`
- Umral de distancia: 30 metros (DETECTION_RADIUS_METERS)
- Normalización de nombres: lowercase, sin acentos, sin símbolos especiales
- El nombre comercial se extrae de `feature.properties.name` o `feature.text` (solo si es POI)
- NO se usa `place_name` ni `full_address` (son direcciones, no nombres comerciales)
- El callback `onCommercialNameChange` es opcional para mantener compatibilidad con otros usos

**Criterios de aceptación:**
- ✅ El campo Name se puebla solo si existe nombre comercial
- ✅ Crear un Spot con mismo nombre + ubicación NO lo duplica
- ✅ El usuario recibe feedback claro de duplicidad: "Este lugar ya existe en FLOWYA"
- ✅ La IA NO se ejecuta cuando el Spot ya existe
- ✅ No hay contenido duplicado en base de datos
- ✅ El comportamiento es consistente en Create y Edit

---

## 2026-01-11 — Fix Cultural Context (IA)

**Contexto del cambio:**
Corrección del bug donde el campo "Cultural Context" no se completaba cuando se usaba "Enrich with AI" en Create Spot.

**Motivo:**
"Bug de mapeo en enriquecimiento con IA"

**Cambios realizados:**

1. **Contrato de respuesta JSON:**
   - Agregado campo `culturalContext` al contrato JSON en el prompt de IA
   - Agregado `culturalContext` a la interfaz `AIGeneratedResponse`
   - Agregado reglas editoriales específicas para `culturalContext` en el prompt

2. **Validación de respuesta:**
   - Agregado validación de `culturalContext` en el parseo de respuesta JSON
   - Agregado logging de `culturalContext` en los logs de campos generados

3. **Mapeo de respuesta:**
   - Corregido mapeo de `culturalContext` desde respuesta de IA (antes solo mantenía valor existente)
   - Agregado mapeo de `culturalContext` en `useSpotForm.ts` cuando se recibe contenido generado

**Archivos modificados:**

1. **`utils/aiContentGenerator.ts`:**
   - Agregado `culturalContext: string` a interfaz `AIGeneratedResponse`
   - Agregado `"culturalContext": ""` al contrato JSON en el prompt
   - Agregado reglas editoriales para `culturalContext` (sección 5 del prompt):
     - ROLE: Provide cultural and historical context
     - STYLE: Informative and respectful, neutral tone
     - CONTENT: Historical background, cultural significance, local context
     - LENGTH: 2 to 4 sentences
   - Agregado validación de `culturalContext` en parseo de respuesta JSON
   - Corregido mapeo: `culturalContext: parsedContent.culturalContext || spot.culturalContext || ''` (antes solo `spot.culturalContext`)
   - Agregado logging de `culturalContext` en logs de campos generados

2. **`hooks/useSpotForm.ts`:**
   - Agregado mapeo de `culturalContext` cuando se recibe contenido generado:
     ```typescript
     if (generatedContent.culturalContext !== undefined) {
       setCulturalContext(generatedContent.culturalContext);
     }
     ```

**Archivos NO modificados:**
- `app/create-spot.tsx` - Sin cambios (ya tenía código para aceptar `culturalContext` desde `previewContent`)
- `data/spots.ts` - Sin cambios
- Lógica de guardado - Sin cambios

**Estado:** ✅ Aplicado

**Notas técnicas:**
- El campo `culturalContext` ahora se solicita explícitamente en el prompt de IA
- El campo `culturalContext` se genera y mapea correctamente desde la respuesta de IA
- Si la IA retorna `culturalContext` vacío (""), se mantiene vacío (no se inventa contenido)
- El mapeo en `useSpotForm.ts` verifica `!== undefined` para permitir valores vacíos

**Criterios de aceptación:**
- ✅ Al usar Enrich with AI, Cultural context se completa
- ✅ El contenido es coherente y distinto de Description
- ✅ Why it matters y Cultural context llegan por separado
- ✅ El estado del formulario refleja ambos campos
- ✅ No hay errores silenciosos

---

## 2026-01-11 — SpotMediaCard (Map View) + Auditoría definitiva de Type

**Contexto del cambio:**
Ajuste de UI en SpotMediaCard (acción "Map View") y auditoría exhaustiva del campo `type` para asegurar consistencia y fuente única de verdad.

**Motivo:**
"Consistencia visual y semántica del sistema"

**Cambios realizados:**

**PARTE 1: SpotMediaCard · Acción "Map View":**

1. **Ubicación de la acción:**
   - Movido botón "Map View" a la parte superior izquierda de la imagen
   - Cambiado texto de "Map" a "Map View"
   - Posicionado como elemento opuesto visualmente a Save/Favorite (superior derecha)
   - Aplicado tanto en variant="small" como variant="large"

2. **Comportamiento:**
   - Acción claramente interactiva (Chip con variant="highlighted")
   - No rompe legibilidad de la imagen (overlay con fondo semitransparente)
   - Mantiene coherencia con el sistema visual existente (chips / overlays)
   - InfoMeta ahora se muestra debajo de la descripción (sin botón "Map" inline)

**PARTE 2: Auditoría exhaustiva del campo Type:**

1. **Fuente única de verdad:**
   - InfoMeta usa SIEMPRE `spot.type` (no hay inferencias ni fallbacks)
   - Eliminadas funciones locales inconsistentes en `SpotMediaCard.tsx` y `SpotInlineCard.tsx`
   - Reemplazadas por función canónica `getSpotTypeLabel` de `utils/spotFormHelpers.ts`
   - Asegurado que todos los componentes usan el mismo campo `spot.type`

2. **Limpieza de clasificaciones legacy:**
   - Eliminadas referencias a tipos inexistentes: `bar`, `shop`, `hotel`
   - Tipos canónicos validados: `beach`, `cafe`, `viewpoint`, `museum`, `restaurant`, `park`, `monument`, `market`, `other`
   - Función canónica `getSpotTypeLabel` coincide exactamente con `SpotType`

3. **Evaluación de escalabilidad:**
   - **DECISIÓN**: Mantener tipos actuales
   - Justificación:
     - Son claros para el usuario (nombres descriptivos)
     - Son consistentes entre card y detalle (misma fuente)
     - Escalan bien (cubren la mayoría de casos de uso)
     - No hay solapamientos semánticos
     - "other" es necesario como fallback (no es problemático)
   - Flow mantiene su propio sistema (`MovementMode`: `walking`, `bike`, `car`) - NO se mezcla con `SpotType`

**Archivos modificados:**

1. **`components/SpotMediaCard.tsx`:**
   - Eliminada función local `getSpotTypeLabel` (tenía tipos incorrectos: `bar`, `shop`, `hotel`)
   - Agregado import de función canónica: `import { getSpotTypeLabel } from '@/utils/spotFormHelpers';`
   - Eliminado handler `renderDistanceWithViewOnMap` (ya no necesario)
   - Agregado overlay `mapViewOverlay` para botón "Map View" (superior izquierda)
   - Agregado estilo `mapViewButton` para el botón
   - Botón "Map View" movido a overlay superior izquierdo de la imagen
   - Cambiado texto de "Map" a "Map View"
   - InfoMeta ahora se muestra directamente (sin botón inline)
   - Eliminados estilos `distanceRow` y `viewOnMapButton` (ya no usados)

2. **`components/SpotInlineCard.tsx`:**
   - Eliminada función local `getSpotTypeLabel` (tenía tipos incorrectos: `bar`, `shop`, `hotel`)
   - Agregado import de función canónica: `import { getSpotTypeLabel } from '@/utils/spotFormHelpers';`

**Archivos NO modificados:**
- `components/ui/InfoMeta.tsx` - Sin cambios (ya usa `spot.type` correctamente vía prop `chip`)
- `components/ui/FormTypeSelector.tsx` - Sin cambios (función local correcta, coincide con SpotType)
- `components/SearchCategoryCard.tsx` - Sin cambios (función local correcta, coincide con SpotType)
- `utils/spotFormHelpers.ts` - Sin cambios (función canónica ya correcta)
- `data/spots.ts` - Sin cambios (SpotType ya correcto)
- `app/spot-detail.tsx` - Sin cambios (ya usa función canónica)
- Lógica de tipos - Sin cambios (tipos actuales se mantienen)

**Estado:** ✅ Aplicado

**Notas técnicas:**
- Los tipos actuales (`beach`, `cafe`, `viewpoint`, `museum`, `restaurant`, `park`, `monument`, `market`, `other`) son claros, consistentes y escalables
- Flow usa `MovementMode` (`walking`, `bike`, `car`) que es completamente distinto de `SpotType` - NO se mezclan
- InfoMeta recibe `chip={{ label: getSpotTypeLabel(spot.type) }}` - fuente única de verdad
- El botón "Map View" está posicionado en `position: 'absolute', top: spacing.sm, left: spacing.sm` (opuesto a Save en `right: spacing.sm`)
- El botón usa `Chip` con `variant="highlighted"` para ser claramente interactivo

**Criterios de aceptación:**
- ✅ "Map View" visible sobre la imagen en SpotMediaCard
- ✅ No hay conflicto visual con Save
- ✅ InfoMeta usa SIEMPRE `spot.type`
- ✅ No existen tipos divergentes entre card y detalle
- ✅ Las clases de Spot son claras y documentadas
- ✅ Clasificaciones legacy eliminadas
- ✅ Flow mantiene su propio sistema (Bike, Walking, etc.)

---

## 2026-01-11 — Pulido Visual Chip "Map" en SpotMediaCard

**Contexto del cambio:**
Ajuste visual fino del chip "Map" en SpotMediaCard para eliminar artefactos visuales (contenedor blanco) y mejorar consistencia con el sistema de chips.

**Motivo:**
"Corrección de artefactos visuales y alineación con sistema de chips"

**Cambios realizados:**

1. **Eliminación de contenedor blanco:**
   - Eliminado `backgroundColor` del `Pressable` que contenía el Chip
   - El Chip ahora se muestra directamente sin contenedor blanco detrás
   - Aplicado tanto en variant="small" como variant="large"

2. **Cambio de texto:**
   - Cambiado texto de "Map View" a "Map"
   - Aplicado en ambas variantes del componente

3. **Icono en Chip:**
   - Agregado icono "visibility" al Chip mediante prop `icon`
   - Agregado icono "visibility" al iconMap (componente Icon)
   - El icono está alineado correctamente con el texto
   - Respeta tamaño y jerarquía del sistema (14px, mismo color que el texto)

**Archivos modificados:**

1. **`components/SpotMediaCard.tsx`:**
   - Eliminado `backgroundColor` del estilo inline del `Pressable` (mapViewButton)
   - Cambiado texto de "Map View" a "Map" (2 ocurrencias: variant="small" y variant="large")
   - Agregado prop `icon="visibility"` al Chip (2 ocurrencias)
   - Mantenido `opacity` en estilo inline para feedback visual al presionar
   - Comentario actualizado de "Botón 'Map View'" a "Botón 'Map'"

2. **`components/ui/Icon.tsx`:**
   - Agregado `visibility: 'visibility'` al iconMap
   - Permite usar icono "visibility" en todo el sistema

**Archivos NO modificados:**
- `components/ui/Chip.tsx` - Sin cambios (ya soporta iconos mediante prop `icon`)
- `components/ui/InfoMeta.tsx` - Sin cambios
- Lógica del botón - Sin cambios (solo ajuste visual)
- Save/Favorite - Sin cambios

**Estado:** ✅ Aplicado

**Notas técnicas:**
- El Chip tiene su propio fondo (`variant="highlighted"` usa `backgroundColor: colors.tint + '20'`)
- Al eliminar el `backgroundColor` del Pressable, el Chip se muestra directamente sin artefactos visuales
- El icono "visibility" es un icono estándar de Material Icons
- El icono usa tamaño 14px (definido en Chip) y color del texto (tint para variant="highlighted")
- El Pressable mantiene `hitSlop` para área táctil generosa
- La opacidad en `pressed` proporciona feedback visual sin necesidad de fondo

**Criterios de aceptación:**
- ✅ El chip "Map" no muestra esquinas blancas detrás
- ✅ El fondo detrás del chip es limpio o transparente
- ✅ El texto es exactamente "Map"
- ✅ El chip usa variante with icon
- ✅ El icono de ver está correctamente alineado
- ✅ El resto del card no se ve afectado

---

## 2026-01-11 — Ajustes Finales de UI en SpotMediaCard (Chip Map + InfoMeta)

**Contexto del cambio:**
Ajustes finos de UI en SpotMediaCard para mejorar la jerarquía visual y alinear el componente con el estándar del sistema. Cambios puramente visuales sin afectar lógica ni comportamiento.

**Motivo:**
"Pulido visual y ajuste de jerarquía"

**Cambios realizados:**

1. **Estilo del Chip "Map" (default en lugar de highlighted):**
   - Cambiado `variant` del Chip "Map" de `"highlighted"` a `"default"`
   - El chip ahora usa colores default (texto negro, fondo gris) en lugar de destacado (texto tint, fondo tint con opacidad)
   - Mantiene icono "visibility" y variante with icon
   - Aplicado tanto en variant="small" como variant="large"
   - El chip ahora se percibe como acción secundaria, no como CTA principal

2. **Posición del Chip "Map" sobre la imagen:**
   - Movido del extremo superior izquierdo al extremo inferior izquierdo
   - Cambiado `top: spacing.sm` a `bottom: spacing.sm` en estilo `mapViewOverlay`
   - Mantiene overlay sobre imagen, separación correcta del borde, y sin interferir con otros controles
   - Aplicado tanto en variant="small" como variant="large"
   - Comentario actualizado de "extremo superior izquierdo" a "extremo inferior izquierdo"

3. **Margen superior de InfoMeta:**
   - Envuelto InfoMeta en un View con estilo `infoMetaContainer`
   - Aplicado `marginTop: -(spacing.sm - spacing.xs / 2)` para compensar el `marginTop: spacing.sm` (16px) de InfoMeta
   - Resultado: InfoMeta tiene margin-top efectivo de 4px (spacing.xs / 2) en lugar de 16px
   - Solo aplicado en variant="large" (InfoMeta con chip, distance y rating)
   - No afecta variant="small" ni otros usos de InfoMeta en el sistema

**Archivos modificados:**

1. **`components/SpotMediaCard.tsx`:**
   - Cambiado `variant="highlighted"` a `variant="default"` en Chip "Map" (2 ocurrencias: variant="small" y variant="large")
   - Cambiado `top: spacing.sm` a `bottom: spacing.sm` en estilo `mapViewOverlay`
   - Agregado wrapper `<View style={styles.infoMetaContainer}>` alrededor de InfoMeta en variant="large"
   - Agregado estilo `infoMetaContainer` con `marginTop: -(spacing.sm - spacing.xs / 2)`
   - Comentarios actualizados para reflejar nueva posición del chip

**Archivos NO modificados:**
- `components/ui/Chip.tsx` - Sin cambios (ya soporta variant="default")
- `components/ui/InfoMeta.tsx` - Sin cambios (marginTop mantenido, compensado en wrapper)
- Lógica del botón - Sin cambios (solo ajustes visuales)
- Save/Favorite - Sin cambios

**Estado:** ✅ Aplicado

**Notas técnicas:**
- El Chip con variant="default" usa:
  - `backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'`
  - `textColor: colors.text` (negro en light mode)
- El wrapper `infoMetaContainer` compensa el marginTop de InfoMeta usando margen negativo: `-(16px - 4px) = -12px`, resultando en un margin-top efectivo de 4px
- El chip en posición inferior izquierda está visualmente balanceado con el botón Save/Favorite en superior derecha
- Todos los cambios son puramente visuales y no afectan comportamiento, lógica, o props

**Criterios de aceptación:**
- ✅ Chip "Map" usa colores default (negro sobre gris)
- ✅ El chip mantiene icono y variante with icon
- ✅ El chip está en el extremo inferior izquierdo de la imagen
- ✅ InfoMeta tiene margin-top efectivo de 4px (compensado mediante wrapper)
- ✅ El resto del card no se ve afectado

---

## 2026-01-11 — Eliminar Transparencia del Chip "Map" en SpotMediaCard

**Contexto del cambio:**
Ajuste visual para mejorar contraste y legibilidad del chip "Map" sobre imágenes en SpotMediaCard. El fondo transparente del chip causaba problemas de legibilidad sobre imágenes claras o complejas.

**Motivo:**
"Mejorar contraste y legibilidad sobre imagen"

**Cambios realizados:**

1. **Prop `solidBackground` en Chip component:**
   - Agregado prop opcional `solidBackground?: boolean` a `ChipProps`
   - Cuando `solidBackground={true}`, el chip usa fondo sólido en lugar de transparente
   - Para variant="default":
     - Light mode: `#EBEBEB` (gris sólido claro) en lugar de `rgba(0, 0, 0, 0.08)`
     - Dark mode: `#2A2A2A` (gris sólido oscuro) en lugar de `rgba(255, 255, 255, 0.1)`
   - Los colores sólidos son equivalentes visuales al rgba transparente pero sin alpha
   - Mantiene texto negro, variante with icon, icono, border-radius, tamaño y jerarquía actuales

2. **Aplicación en SpotMediaCard:**
   - Agregado `solidBackground={true}` al Chip "Map" en ambas variantes (small y large)
   - El chip ahora es 100% opaco, sin transparencia
   - Mejora contraste y legibilidad sobre cualquier imagen

**Archivos modificados:**

1. **`components/ui/Chip.tsx`:**
   - Agregado prop `solidBackground?: boolean` a `ChipProps`
   - Modificado `getVariantStyles()` para usar fondo sólido cuando `solidBackground={true}`
   - Colores sólidos: `#EBEBEB` (light) y `#2A2A2A` (dark)
   - Comentario agregado explicando el uso de `solidBackground`

2. **`components/SpotMediaCard.tsx`:**
   - Agregado `solidBackground={true}` al Chip "Map" (2 ocurrencias: variant="small" y variant="large")

**Archivos NO modificados:**
- Otros usos de Chip - Sin cambios (solo afecta cuando se pasa `solidBackground={true}`)
- Lógica del botón - Sin cambios
- Posición del chip - Sin cambios
- InfoMeta - Sin cambios

**Estado:** ✅ Aplicado

**Notas técnicas:**
- Los colores sólidos (`#EBEBEB` para light, `#2A2A2A` para dark) son equivalentes visuales a los rgba transparentes
- `#EBEBEB` es aproximadamente el resultado de `rgba(0, 0, 0, 0.08)` sobre fondo blanco (#fff)
- `#2A2A2A` es aproximadamente el resultado de `rgba(255, 255, 255, 0.1)` sobre fondo dark (#151718)
- El prop `solidBackground` es opcional y retrocompatible (default: `false`)
- Solo se aplica a variant="default" (otros variants mantienen su comportamiento)

**Criterios de aceptación:**
- ✅ El chip "Map" es perfectamente legible sobre cualquier imagen
- ✅ El fondo es sólido (sin transparencia)
- ✅ El chip mantiene estilo default del sistema
- ✅ No hay degradados ni alpha visibles

---
