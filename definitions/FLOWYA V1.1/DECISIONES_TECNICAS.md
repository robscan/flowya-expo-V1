# Decisiones Técnicas — FLOWYA V1.1

**Fecha de creación:** 2024-12-21  
**Versión:** FLOWYA V1.1  
**Estado:** En progreso

---

## PROPÓSITO DE ESTE DOCUMENTO

Este documento registra decisiones técnicas tomadas durante la implementación de FLOWYA V1.1, incluyendo:
- Qué se reemplaza y qué NO se toca (naming, arquitectura, etc.)
- Alternativas descartadas
- Razonamiento técnico
- Impacto en código

---

## DECISIONES DE NAMING

### P0-04: Normalizar naming — usar exclusivamente "Flow"

**Decisión:** Usuario NUNCA ve "path" o "route" en UI. Siempre "Flow" o "Flows".

**Regla estricta:**
- Usuario NUNCA ve "path" o "route"
- Internamente puede haber `PathContext`, `pathId`, etc. (OK)
- UI siempre muestra "Flow" o "Flows"

---

#### Términos a Reemplazar en UI

**Reemplazos obligatorios (solo en strings visibles al usuario):**

- `"Path"` → `"Flow"`
- `"Route"` → `"Flow"`
- `"paths"` → `"flows"`
- `"routes"` → `"flows"`

**Ejemplos:**
- "Nearby Paths" → "Nearby Flows"
- "Saved Routes" → "Saved Flows"
- "Start path" → "Start Flow"
- Etiquetas, chips, mensajes, placeholders

---

#### Qué NO Se Toca

**NO se modifica (decisiones explícitas):**

1. **Nombres de archivos** ✅
   - `PathContext.tsx` → NO renombrar
   - `flows.ts` → NO renombrar (ya es correcto)
   - `data/paths.ts` → NO renombrar

2. **Nombres de variables internas** ✅
   - `pathId`, `currentPathId` → NO cambiar
   - `getPathById`, `createPath` → NO cambiar
   - Variables en código TypeScript/JavaScript

3. **Nombres de funciones internas** ✅
   - `usePath()`, `PathContext` → NO cambiar
   - Funciones que usan "path" internamente → NO cambiar

4. **Tipos TypeScript** ✅
   - `Path`, `Flow` como tipos → Revisar caso por caso
   - Si el tipo es usado internamente → NO cambiar
   - Si el tipo es usado en UI → Considerar cambio

5. **Comentarios de código** ✅
   - Comentarios que explican lógica interna → Pueden mantener "path"
   - Comentarios que explican UI → Cambiar a "Flow"

---

#### Archivos Priorizados para Auditar (UI Visible)

**Archivos donde buscar y reemplazar términos:**

1. **`app/(tabs)/home.tsx`**
   - Secciones, labels, placeholders
   - Ejemplo: "Nearby Paths" → "Nearby Flows"

2. **`app/(tabs)/saved.tsx`**
   - Filtros, labels, mensajes
   - Ejemplo: "Saved Routes" → "Saved Flows"

3. **`app/flow-detail.tsx`**
   - Labels visibles, títulos, mensajes
   - Verificar todos los strings visibles

4. **`components/FlowCard.tsx`**
   - Texto de cards, labels
   - Verificar si muestra "Path" o "Route"

5. **`components/ui/Chip.tsx`** (si aplica)
   - Clasificaciones visibles
   - Verificar si tiene "Path" o "Route"

6. **`components/SaveFlowModal.tsx`**
   - Texto del modal, labels
   - Verificar todos los strings visibles

---

#### Archivos Modificados (P0-04 Completado - 2026-01-10)

**Strings reemplazados en UI visible:**

1. **`components/SaveFlowModal.tsx`** (8 strings):
   - 'Save route' → 'Save Flow'
   - 'Close route' → 'Close Flow'
   - 'Do you want to save this route before leaving?' → 'Do you want to save this Flow before leaving?'
   - 'Save changes to this route?' → 'Save changes to this Flow?'
   - 'Route saved' → 'Flow saved'
   - 'Give your route a name so you can find it later.' → 'Give your Flow a name so you can find it later.'
   - 'Route name' → 'Flow name'
   - 'Save Route' → 'Save Flow'

2. **`app/flow-screen.tsx`** (2 strings):
   - 'Route updated' → 'Flow updated'
   - 'Route saved' → 'Flow saved'

**Archivos auditados pero NO modificados (correcto según reglas):**
- `app/(tabs)/home.tsx` - Solo variables internas (`paths`, `pathsList`, `usePath`, `router`)
- `app/(tabs)/saved.tsx` - Solo variables internas (`paths`, `renderPathSlider`, `pathsList`)
- `app/flow-detail.tsx` - Solo comentarios y funciones internas (`calculatePathDistance`, `router`)
- `components/FlowCard.tsx` - Solo funciones internas (`calculatePathDistance`)

---

#### Razonamiento

**Por qué NO cambiar nombres internos:**
- Cambiar nombres internos requeriría refactor masivo
- No aporta valor al usuario
- Aumenta riesgo de bugs
- Violaría principio de mínima intervención (P0-05)

**Por qué SÍ cambiar UI:**
- Usuario ve consistencia ("Flow" en todas partes)
- Mejora claridad y coherencia
- Impacto mínimo (solo strings)
- Cumple con backlog V1.1

---

## DECISIONES DE ARQUITECTURA

### P0-05: Eliminar Audio del Flow

**Decisión:** Eliminar completamente audio del Flow, mantener solo narrativa por texto.

**Qué se elimina:**
- `audioManager.play()` llamadas en NarrationContext
- Estados relacionados con audio (`status: 'playing'`)
- Controles de audio (mute) si existen en FlowPlayerControls
- Imports de `audioManager`, `Expo.Speech`, `TTS` en código de Flow

**Qué NO se elimina:**
- `audioManager.ts` (se marca como `@deprecated`, pero no se elimina si se usa en otros contextos)
- `narrationEngine.ts` (se puede mantener para reglas de cola si es útil, o eliminarse si no se usa)

**Razonamiento:**
- Audio genera errores e inconsistencias en web
- Subtítulos son suficientes para experiencia narrativa
- Simplifica código y reduce bugs

---

### P0-07: Schema de Subtítulos (Congelamiento)

**Decisión:** Schema `FlowSubtitle` queda CONGELADO una vez aprobado en P0-07.

**Regla:**
- NO se puede modificar durante V1.1
- Cualquier ajuste debe documentarse como propuesta para V1.2
- Objetivo: estabilidad, consistencia y evitar refactors silenciosos

**Razonamiento:**
- Schema es base de todo el sistema de subtítulos
- Cambios requieren refactor masivo
- Estabilidad es prioritaria en V1.1

---

### P0-08: Sistema de Eventos Explícitos

**Decisión:** Crear eventos explícitos en lugar de depender solo de triggers de geofencing.

**Alternativa descartada:**
- Usar solo triggers de geofencing (approaching, arriving, leaving)
- **Razón de descarte:** No proporciona suficiente control y claridad

**Decisión tomada:**
- Crear eventos explícitos: FLOW_STARTED, FLOW_ACTIVE, SPOT_PROXIMITY_ENTER, SPOT_COMPLETED, FLOW_COMPLETED
- Mapear geofencing a eventos explícitos
- Implementar regla de prioridad de eventos

**Razonamiento:**
- Mayor control sobre cuándo mostrar qué texto
- Separación clara entre eventos del Flow vs eventos de geofencing
- Permite preparar base para notificaciones (sin activar)

---

### P0-09: Fallback UX para Subtítulos

**Decisión:** Mostrar último texto válido del Flow para evitar estados vacíos.

**Alternativa descartada:**
- Mostrar mensaje genérico ("Now moving") cuando no hay texto
- **Razón de descarte:** Pérdida de contexto narrativo

**Decisión tomada:**
- Priorizar continuidad de experiencia sobre exactitud temporal
- Mostrar último texto válido si no hay texto disponible
- Si nunca hubo texto válido, mostrar "Now moving"

**Razonamiento:**
- Mejor experiencia narrativa (contexto continuo)
- Evita estados vacíos confusos
- Prioriza claridad y continuidad

---

## PRINCIPIO DE MÍNIMA INTERVENCIÓN

**Decisión:** Durante V1.1 se aplica el principio de mínima intervención.

**Regla:**
- NO se renombra, reestructura ni refactoriza código no relacionado directamente con items del Backlog V1.1
- Aunque se detecten oportunidades de mejora, se documentan para V1.2, NO se implementan ahora
- Solo se toca código necesario para cumplir items del backlog

**Ejemplos de qué NO se toca:**
- Renombrar funciones que funcionan correctamente
- Refactorizar componentes no relacionados con subtítulos/audio/naming
- Optimizar código que no está en el backlog
- Cambiar estructura de carpetas

**Razonamiento:**
- Reduce riesgo de bugs
- Mantiene foco en objetivos de V1.1
- Permite estabilidad y confiabilidad

---

## ESTADO

- ✅ Decisiones de naming documentadas
- ✅ Decisiones de arquitectura documentadas
- ✅ Principio de mínima intervención documentado
- ⏳ Se actualizará durante implementación de P0

---

## PROPUESTAS PARA V1.2 (NO IMPLEMENTAR EN V1.1)

**Estas propuestas se documentan para futura consideración, sin implementación en V1.1:**

- Generación explícita de `shortText` (en lugar de automática)
- Optimización de eventos (reducir emisiones)
- Refactor de nombres internos (PathContext → FlowContext interno)
- Sistema de notificaciones push (usando schema de subtítulos)
