# Análisis Funcional — Flow Events

**Fecha:** 2024-12-21  
**Versión:** FLOWYA V1.1  
**Prioridad:** P0-08

---

## PROBLEMA IDENTIFICADO

### P0-08: Alinear triggers del Flow a estructura de narración

**Síntoma:**
- El sistema no sabe cuándo mostrar textos
- Los momentos no están declarados explícitamente
- No hay eventos explícitos (FLOW_STARTED, SPOT_PROXIMITY_ENTER, SPOT_COMPLETED, FLOW_COMPLETED)
- El sistema actual usa triggers de geofencing (approaching, arriving, leaving) pero no eventos de Flow explícitos

---

## ESTADO ACTUAL DEL SISTEMA

### Eventos Actuales (Antes de V1.1)

**FlowContext (`contexts/FlowContext.tsx`):**
- `startFlow(pathId)` - Inicia Flow, cambia estado de 'idle' a 'active'
- `closeFlow()` - Cierra Flow completamente
- `nextNarrationBlock()` - Avanza entre bloques narrativos (anticipation → presence → transition → siguiente spot)
- `previousNarrationBlock()` - Retrocede entre bloques
- `nextSpot()` - Avanza al siguiente spot
- `previousSpot()` - Retrocede al spot anterior

**Geofencing Simulator (`utils/geofencingSimulator.ts`):**
- `approaching` - Usuario se acerca a spot (≤100m)
- `arriving` - Usuario llega a spot (≤20m)
- `leaving` - Usuario sale del spot (>50m)

**NarrationController (`components/NarrationController.tsx`):**
- `useNarrationTriggers()` hook:
  - `triggerApproaching(spotId)` - Dispara narration de tipo 'anticipation'
  - `triggerArriving(spotId)` - Dispara narration de tipo 'presence'
  - `triggerLeaving(spotId)` - Dispara narration de tipo 'transition'
  - `triggerBetween(pathId)` - Dispara narration de tipo 'context'

**Flujo Actual:**
```
Geofencing Simulator (approaching/arriving) 
  → NarrationController.useNarrationTriggers()
  → NarrationContext.triggerNarration()
  → NarrationEngine.queueNarration()
  → audioManager.play() (se eliminará en V1.1)
  → FlowPlayerControls (verifica status === 'playing')
```

---

## MAPEO EXPLÍCITO: EVENTO → MOMENTO → UI → TEXTO

### Tabla Completa de Mapeo

| Evento | Momento | UI Impactada | Texto Esperado | Condición | Prioridad |
|--------|---------|--------------|----------------|-----------|-----------|
| `FLOW_STARTED` | `start` | FlowPlayerControls, FlowMiniBar | "We're starting your flow" o texto de bienvenida | Al iniciar Flow (`startFlow()` llamado) | Media |
| `FLOW_ACTIVE` | `in_flow` | FlowPlayerControls | "Continue moving" o texto de progreso | Flow activo, entre spots, sin eventos específicos | Baja |
| `SPOT_PROXIMITY_ENTER` | `near_spot` | FlowPlayerControls, FlowMiniBar | Spot.narration.anticipation o Spot.narration.presence | Usuario se acerca a spot (geofencing: ≤100m o ≤20m) | Alta |
| `SPOT_COMPLETED` (hay más spots) | `transition` | FlowPlayerControls | Spot.narration.transition | Spot completado (todos los bloques), `currentSpotIndex < totalSpots - 1` | Media-Alta |
| `SPOT_COMPLETED` (último spot) | `end` | FlowPlayerControls | "Flow completed" o Spot.narration.transition | Spot completado (todos los bloques), `currentSpotIndex === totalSpots - 1` | Media-Alta |
| `FLOW_COMPLETED` | `end` | FlowPlayerControls, FlowMiniBar | "You've completed the flow" o mensaje de cierre | Flow cerrado (`closeFlow()` llamado) | Máxima |

---

## DIFERENCIACIÓN TRANSITION VS END

### Regla Explícita

**`transition` ocurre cuando:**
- Evento: `SPOT_COMPLETED`
- Condición: `currentSpotIndex < totalSpots - 1` (aún hay más spots pendientes)
- Momento: `transition`
- Texto: `Spot.narration.transition` del spot que se completó
- Propósito: Preparar al usuario para moverse al siguiente spot

**`end` ocurre cuando:**
- Evento: `SPOT_COMPLETED` (si es último spot)
  - Condición: `currentSpotIndex === totalSpots - 1` (último spot)
  - Momento: `end`
  - Texto: `Spot.narration.transition` del último spot (o mensaje de cierre)
- Evento: `FLOW_COMPLETED` (siempre)
  - Condición: Flow se cierra (`closeFlow()` llamado)
  - Momento: `end`
  - Texto: Mensaje de cierre ("You've completed the flow")
  - Propósito: Cerrar la experiencia del Flow

**Regla crítica:**
- `SPOT_COMPLETED` puede resultar en `transition` O `end` dependiendo de si hay más spots
- `FLOW_COMPLETED` SIEMPRE resulta en `end`
- `end` solo se dispara con `FLOW_COMPLETED` o cuando `SPOT_COMPLETED` ocurre en el último spot

---

## REGLA DE PRIORIDAD DE EVENTOS

**Jerarquía para evitar conflictos visuales:**

```
1. FLOW_COMPLETED (máxima prioridad - siempre muestra "end")
2. SPOT_PROXIMITY_ENTER (alta prioridad - muestra "near_spot")
3. SPOT_COMPLETED (media-alta prioridad - muestra "transition" o "end")
4. FLOW_STARTED (media prioridad - muestra "start")
5. FLOW_ACTIVE (baja prioridad - muestra "in_flow" solo si no hay otros eventos)
```

**Regla:** Solo un evento puede renderizar texto a la vez. Eventos de mayor prioridad sobrescriben eventos de menor prioridad.

**Implementación:**
- `utils/flowEventEmitter.ts` debe implementar lógica de prioridad
- Hook `useFlowSubtitle()` debe considerar prioridad al seleccionar subtítulo actual

---

## EVENTOS ONE-SHOT (EXPLÍCITO)

**Eventos que se disparan solo una vez:**

- ✅ **`FLOW_STARTED`** → one-shot
  - Se emite solo cuando Flow pasa de 'idle' a 'active'
  - No se repite durante el mismo Flow
  - Debe tener guarda (ref o flag) para evitar emisión múltiple

- ✅ **`SPOT_PROXIMITY_ENTER`** → one-shot por spot
  - Se emite una vez por spot cuando usuario se acerca
  - No se repite para el mismo spot durante el mismo Flow
  - Debe tener guarda por spotId para evitar emisión múltiple

- ✅ **`FLOW_COMPLETED`** → one-shot
  - Se emite solo cuando Flow se cierra completamente
  - No se repite
  - Debe tener guarda para evitar emisión múltiple

**Eventos que NO son one-shot:**

- ⚠️ **`FLOW_ACTIVE`** → estado pasivo, no emisor constante
  - Se mantiene mientras Flow está activo
  - No se emite constantemente, solo cuando no hay otros eventos
  - Es un estado, no un evento one-shot

- ⚠️ **`SPOT_COMPLETED`** → se puede emitir múltiples veces (una por spot)
  - Se emite cuando se completa cada spot
  - Puede emitirse múltiples veces en un Flow con múltiples spots
  - No es one-shot porque puede ocurrir varias veces (una por spot)

**Implementación:**
- Usar refs en FlowContext para rastrear eventos one-shot emitidos
- Guardas: `flowStartedEmittedRef`, `spotProximityEnteredRefs` (Map<spotId>), `flowCompletedEmittedRef`

---

## EVENTOS NUEVOS NECESARIOS (MÍNIMOS)

**Eventos que deben crearse explícitamente:**

1. **`FLOW_STARTED`** (NUEVO)
   - Emitir en `FlowContext.startFlow()` cuando Flow pasa de 'idle' a 'active'
   - One-shot: solo una vez al iniciar Flow
   - Prioridad: Media

2. **`FLOW_ACTIVE`** (NUEVO - estado pasivo)
   - Emitir cuando Flow está activo y no hay otros eventos
   - No es one-shot, es estado continuo
   - Prioridad: Baja (solo si no hay otros eventos)

3. **`SPOT_PROXIMITY_ENTER`** (NUEVO - mapear desde geofencing)
   - Mapear desde `geofencingSimulator.onApproaching()` o `onArriving()`
   - One-shot: una vez por spot
   - Prioridad: Alta

4. **`SPOT_COMPLETED`** (NUEVO)
   - Emitir en `FlowContext.nextNarrationBlock()` cuando completa todos los bloques de un spot
   - Condición: cuando avanza de 'transition' a siguiente spot
   - No es one-shot (puede ocurrir múltiples veces)
   - Prioridad: Media-Alta
   - Resultado: `transition` (si hay más spots) o `end` (si es último spot)

5. **`FLOW_COMPLETED`** (NUEVO)
   - Emitir en `FlowContext.closeFlow()` cuando Flow se cierra
   - One-shot: solo una vez al cerrar Flow
   - Prioridad: Máxima
   - Resultado: siempre `end`

---

## IMPLEMENTACIÓN PROPUESTA

### Archivos a Crear/Modificar

1. **`types/flowSubtitle.ts`** (NUEVO - P0-07)
   - Definir tipos: `FlowMoment`, `FlowEvent`, `FlowSubtitleTrigger`, `FlowSubtitle`

2. **`utils/flowEventEmitter.ts`** (NUEVO - P0-08)
   - Sistema centralizado de eventos
   - Listeners para eventos
   - Lógica de prioridad
   - Integración con FlowContext

3. **`contexts/FlowContext.tsx`** (MODIFICAR - P0-08)
   - Agregar emisión de eventos explícitos:
     - `FLOW_STARTED` en `startFlow()`
     - `SPOT_COMPLETED` en `nextNarrationBlock()` cuando completa todos los bloques
     - `FLOW_COMPLETED` en `closeFlow()`
   - Agregar refs para eventos one-shot (guardas)

4. **`app/flow-screen.tsx`** (MODIFICAR - P0-08)
   - Integrar `flowEventEmitter` para escuchar eventos
   - Mapear `geofencingSimulator.onApproaching/onArriving` a `SPOT_PROXIMITY_ENTER`
   - Emitir eventos explícitos en lugar de solo triggers de narration

### Integración con Geofencing Existente

**Mapeo desde geofencing actual:**
- `geofencingSimulator.onApproaching(spotId)` → Emitir `SPOT_PROXIMITY_ENTER` (one-shot por spotId)
- `geofencingSimulator.onArriving(spotId)` → Emitir `SPOT_PROXIMITY_ENTER` (si no se emitió ya para este spotId)

**Nota:** En V1.1, solo `SPOT_PROXIMITY_ENTER` se mapea desde geofencing. `SPOT_COMPLETED` se emite cuando se completan todos los bloques narrativos, no cuando se llega físicamente.

---

## RIESGOS Y MITIGACIÓN

### Riesgo 1: Eventos one-shot se emiten múltiples veces
**Mitigación:** Usar refs en FlowContext para rastrear si ya se emitió cada evento one-shot

### Riesgo 2: Conflictos entre eventos (múltiples eventos activos)
**Mitigación:** Implementar regla de prioridad en `flowEventEmitter` y `useFlowSubtitle()`

### Riesgo 3: Romper flujos existentes
**Mitigación:** Agregar eventos sin modificar lógica existente, mantener compatibilidad temporal

### Riesgo 4: Performance por demasiados eventos
**Mitigación:** Eventos deben ser mínimos y solo los necesarios. FLOW_ACTIVE es estado pasivo, no emisor constante

---

## DECISIONES TÉCNICAS

1. **Eventos explícitos vs triggers implícitos:**
   - Decisión: Crear eventos explícitos en lugar de depender solo de triggers de geofencing
   - Razón: Mayor control, claridad, y separación entre eventos del Flow vs eventos de geofencing

2. **Integración con geofencing:**
   - Decisión: Mapear geofencing a eventos explícitos, no reemplazar geofencing
   - Razón: Mantener sistema existente funcionando, solo agregar capa de eventos

3. **Prioridad de eventos:**
   - Decisión: Implementar jerarquía de prioridad explícita
   - Razón: Evitar conflictos visuales cuando múltiples eventos podrían estar activos

4. **Eventos one-shot:**
   - Decisión: Usar refs para guardas en lugar de flags en estado
   - Razón: Evitar re-renders innecesarios

---

## ESTADO

- ✅ Análisis completado
- ✅ Mapeo explícito documentado (Evento → Momento → UI → Texto)
- ✅ Diferenciación transition vs end documentada
- ✅ Regla de prioridad declarada
- ✅ Eventos one-shot documentados
- ⏳ Esperando implementación de P0-07 (Schema)
- ⏳ Esperando implementación de P0-08 (Eventos)
