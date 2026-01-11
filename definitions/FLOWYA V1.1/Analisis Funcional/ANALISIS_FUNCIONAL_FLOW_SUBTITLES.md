# Análisis Funcional — Flow Subtitles

**Fecha:** 2024-12-21  
**Versión:** FLOWYA V1.1  
**Prioridad:** P0-06, P0-07, P0-09

---

## PROBLEMA IDENTIFICADO

### P0-06: Subtítulos del Flow no aparecen

**Síntoma:**
- El player (`FlowPlayerControls`) no muestra los textos de narración
- El mini player (`FlowMiniBar`) no muestra subtítulos
- Los usuarios no ven información contextual durante el Flow

**Causa raíz:**
1. `FlowPlayerControls.renderInfoSection()` (línea 149) verifica `narration.status === 'playing'`
2. Solo muestra subtítulos cuando el audio está reproduciéndose
3. En V1.1 se elimina el audio, por lo que el status nunca será 'playing'
4. No existe un sistema explícito de eventos que dispare subtítulos independientemente del audio

---

## ESTADO ACTUAL DEL SISTEMA

### Flujo Actual de Subtítulos

```
FlowContext (status: 'active')
  ↓
NarrationController (orquesta narrations)
  ↓
NarrationContext.playNarration()
  ↓
audioManager.play() → status = 'playing'
  ↓
FlowPlayerControls (verifica status === 'playing')
  ↓
renderInfoSection() muestra narration.currentNarration.text
```

### Fuente de Datos Actual

**Estructura de Spot (`data/spots.ts`):**
```typescript
export type SpotNarration = {
  anticipation?: string;
  presence?: string;
  transition?: string;
};

export interface Spot {
  // ...
  narration?: SpotNarration; // Narrativas para audio (NO visibles en UI)
  // ...
}
```

**Nota importante:** El comentario dice "NO visibles en UI", pero en V1.1 estos textos DEBEN ser visibles como subtítulos.

**Estructura de Narration (`contexts/NarrationContext.tsx`):**
```typescript
export interface Narration {
  id: string;
  spotId?: string;
  pathId?: string;
  type: NarrationType; // 'anticipation' | 'presence' | 'transition' | 'context'
  text: string;
  audioUrl?: string;
  duration?: number;
}
```

### Archivos Involucrados

1. **`components/FlowPlayerControls.tsx`** (líneas 143-205)
   - Función `renderInfoSection()`: Renderiza subtítulos solo si `status === 'playing'`
   - Usa `narration.currentNarration?.text` como fuente de texto
   - Si no hay audio playing, muestra labels estáticos ("NOW MOVING", "X spots added")
   - Línea 149: `const isAudioPlaying = narration.status === 'playing';`
   - Línea 150: `const hasActiveNarration = narration.currentNarration && isAudioPlaying;`

2. **`components/FlowMiniBar.tsx`**
   - NO muestra subtítulos actualmente
   - Solo muestra estado "Now moving" y progreso visual
   - No consume `narration.currentNarration`

3. **`contexts/NarrationContext.tsx`**
   - Mantiene `currentNarration: Narration | null`
   - `Narration` tiene campo `text: string`
   - Estado `status: 'idle' | 'playing' | 'paused' | 'stopped' | 'error'`
   - Solo cambia a 'playing' cuando se reproduce audio

4. **`contexts/FlowContext.tsx`**
   - Mantiene `flowState.status: 'idle' | 'active' | 'paused'`
   - Mantiene `currentNarrationBlock: NarrationBlock | null` donde `NarrationBlock = 'anticipation' | 'presence' | 'transition'`
   - NO emite eventos explícitos (FLOW_STARTED, SPOT_PROXIMITY_ENTER, etc.)

---

## PROBLEMAS ESPECÍFICOS

### 1. Acoplamiento a Audio
**Problema:** Subtítulos están acoplados al estado de audio  
**Evidencia:** `isAudioPlaying = narration.status === 'playing'` (línea 149 de FlowPlayerControls)  
**Impacto:** Sin audio, no hay subtítulos

### 2. Falta de Schema Explícito
**Problema:** No existe contrato claro para subtítulos del Flow  
**Evidencia:** Se usa `Narration` que es genérico (anticipation, presence, transition, context)  
**Impacto:** No hay diferenciación clara entre momentos del Flow (start, in_flow, near_spot, transition, end)

### 3. Eventos No Explícitos
**Problema:** El sistema no emite eventos explícitos para momentos del Flow  
**Evidencia:** No hay `FLOW_STARTED`, `SPOT_PROXIMITY_ENTER`, `SPOT_COMPLETED`, `FLOW_COMPLETED`  
**Impacto:** No se sabe cuándo mostrar qué texto

### 4. Mini Player Sin Subtítulos
**Problema:** FlowMiniBar no muestra subtítulos  
**Evidencia:** Solo muestra "Now moving" y progreso  
**Impacto:** Usuario pierde contexto cuando el Flow está minimizado

### 5. Falta de shortText
**Problema:** No existe versión corta para Mini Player  
**Evidencia:** Solo hay `text` en `Narration`  
**Impacto:** No se puede mostrar versión compacta en Mini Player

### 6. Textos de Spot Narration No Se Usan
**Problema:** `Spot.narration.anticipation`, `Spot.narration.presence`, `Spot.narration.transition` existen pero no se muestran como subtítulos  
**Evidencia:** Comentario dice "NO visibles en UI" pero en V1.1 deben ser visibles  
**Impacto:** Textos generados por IA no se usan

---

## SOLUCIÓN PROPUESTA

### 1. Crear Schema de FlowSubtitle (P0-07)
**Archivo:** `types/flowSubtitle.ts` (NUEVO)

```typescript
export type FlowMoment = "start" | "in_flow" | "near_spot" | "transition" | "end";
export type FlowEvent = 
  | "FLOW_STARTED"
  | "FLOW_ACTIVE"
  | "SPOT_PROXIMITY_ENTER"
  | "SPOT_COMPLETED"
  | "FLOW_COMPLETED";

export interface FlowSubtitleTrigger {
  event: FlowEvent;
  condition?: string; // Ej: "currentSpotIndex < totalSpots - 1" para transition
}

export interface FlowSubtitle {
  id: string;
  moment: FlowMoment;
  text: string;
  shortText?: string;
  priority: "primary" | "secondary";
  trigger: FlowSubtitleTrigger;
}
```

**⚠️ CONGELAMIENTO:** Este schema queda CONGELADO una vez aprobado en P0-07. No se puede modificar durante V1.1.

### 2. Mapeo de Spot.narration a FlowSubtitle

**Mapeo propuesto:**

| Spot.narration | FlowMoment | FlowEvent | Condición |
|----------------|------------|-----------|-----------|
| `anticipation` | `near_spot` | `SPOT_PROXIMITY_ENTER` | Usuario se acerca a spot |
| `presence` | `near_spot` (continuación) | `SPOT_PROXIMITY_ENTER` | Usuario se acerca a spot (mostrar después de anticipation) |
| `transition` | `transition` | `SPOT_COMPLETED` | Spot completado, hay más spots |
| `transition` | `end` | `SPOT_COMPLETED` | Spot completado, es último spot |

**Regla:** Un spot puede tener múltiples momentos `near_spot` (anticipation + presence), pero ambos se disparan con `SPOT_PROXIMITY_ENTER`. El orden depende de la navegación del usuario (next/previous).

### 3. Sistema de Eventos (P0-08)
**Modificar:** `contexts/FlowContext.tsx`
- Asegurar que emite eventos explícitos:
  - `FLOW_STARTED` al iniciar Flow
  - `FLOW_ACTIVE` cuando Flow está activo
  - `SPOT_PROXIMITY_ENTER` cuando se acerca a un spot (usar geofencing simulado existente)
  - `SPOT_COMPLETED` cuando completa visita a spot
  - `FLOW_COMPLETED` cuando Flow termina completamente

**Crear:** `utils/flowEventEmitter.ts` (NUEVO)
- Sistema centralizado de eventos
- Mapear eventos a momentos del Flow
- Integrar con FlowContext sin romper flujos actuales

### 4. Hook para Obtener Subtítulo Actual (P0-09)
**Crear:** `hooks/useFlowSubtitle.ts` (NUEVO)
- Obtiene subtítulo actual basado en:
  - Evento activo del FlowContext
  - Schema de flowSubtitles
  - Estado del Flow (currentSpotIndex, totalSpots)
  - Regla de prioridad de eventos
  - Implementar fallback UX (mostrar último texto válido del Flow)

### 5. Modificar FlowPlayerControls (P0-09)
**Modificar:** `components/FlowPlayerControls.tsx`
- Reemplazar lógica basada en `narration.status === 'playing'` por `useFlowSubtitle()`
- Mostrar `text` (completo) con jerarquía clara
- Usar subtítulos basados en eventos, no en audio
- Implementar fallback UX si no hay subtítulo disponible

### 6. Modificar FlowMiniBar (P0-09, P1-11)
**Modificar:** `components/FlowMiniBar.tsx`
- Usar `useFlowSubtitle()` para obtener subtítulo actual
- Mostrar `shortText` si existe, sino primeros 60 caracteres de `text`
- Mantener diseño compacto
- Sincronizar con Player principal

---

## MIGRACIÓN DESDE SISTEMA ACTUAL

### Mapeo de Narration Types a FlowMoments

| Narration Type (Actual) | Flow Moment (Nuevo) | Flow Event | Fuente de Texto |
|------------------------|---------------------|------------|-----------------|
| `context` (FLOW_STARTED) | `start` | `FLOW_STARTED` | Texto canónico o generado |
| `context` (FLOW_ACTIVE) | `in_flow` | `FLOW_ACTIVE` | Texto canónico o generado |
| `anticipation` | `near_spot` | `SPOT_PROXIMITY_ENTER` | `Spot.narration.anticipation` |
| `presence` | `near_spot` (continuación) | `SPOT_PROXIMITY_ENTER` | `Spot.narration.presence` |
| `transition` | `transition` | `SPOT_COMPLETED` | `Spot.narration.transition` |
| `transition` | `end` | `SPOT_COMPLETED` (último) o `FLOW_COMPLETED` | `Spot.narration.transition` o texto canónico |

**Nota:** Un spot puede tener múltiples momentos `near_spot` (anticipation + presence), pero ambos se disparan con `SPOT_PROXIMITY_ENTER`.

---

## DECISIONES TÉCNICAS

### Compatibilidad Temporal
- Mantener `NarrationContext` funcionando durante transición
- Crear `FlowSubtitle` como sistema paralelo
- Migrar gradualmente
- Objetivo: eliminar dependencia de audio sin romper funcionalidad

### Generación de shortText
- **Opción 1:** Generar automáticamente (primeros 60 caracteres de `text`)
- **Opción 2:** Definir explícitamente en `data/flowSubtitles.ts`
- **Decisión:** Opción 1 para V1.1 (automático), Opción 2 puede explorarse en V1.2

### Sincronización
- Player y Mini Player deben mostrar el mismo momento del Flow
- Ambos usan `useFlowSubtitle()` que lee del mismo estado
- Fallback UX: mostrar último texto válido del Flow para evitar estados vacíos

### Fallback UX
- Si no hay texto disponible, mostrar último texto válido del Flow
- Evitar estados vacíos o mensajes genéricos
- Priorizar continuidad de experiencia sobre exactitud temporal
- Si nunca hubo texto válido, mostrar mensaje por defecto mínimo: "Now moving"

---

## RIESGOS Y MITIGACIÓN

### Riesgo 1: Romper funcionalidad existente
**Mitigación:** Mantener compatibilidad temporal, migrar gradualmente

### Riesgo 2: Eventos no se disparan en el momento correcto
**Mitigación:** Auditar cuidadosamente FlowContext y mapear estados correctamente

### Riesgo 3: Performance por demasiados eventos
**Mitigación:** Eventos deben ser mínimos y solo los necesarios

### Riesgo 4: Textos de Spot.narration no existen
**Mitigación:** Usar fallback UX (último texto válido) si `Spot.narration` no tiene texto

---

## ESTADO

- ✅ Análisis completado
- ✅ Problemas identificados documentados
- ✅ Solución propuesta documentada
- ⏳ Esperando implementación de P0-07 (Schema)
- ⏳ Esperando implementación de P0-08 (Eventos)
- ⏳ Esperando implementación de P0-09 (Renderizado)
