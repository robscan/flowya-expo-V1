# FLOWYA V1.1 — Plan Arquitectónico de Implementación

**Fecha de creación:** 2024-12-21  
**Fecha de cierre:** 2024-12-21  
**Versión:** FLOWYA V1.1  
**Estado:** Cerrado, aprobado y listo para ejecución

---

## 📋 CONTEXTO Y OBJETIVO

Este plan implementa las mejoras de V1.1 respetando estrictamente:
- Arquitectura canónica establecida en V2.0
- Principios no negociables del backlog
- Fuente única de verdad (documentos V1.1)
- No romper funcionalidad existente

**Decisiones clave V1.1:**
- Eliminar completamente audio del Flow
- Narrativa exclusivamente por texto (subtítulos)
- Sistema basado en eventos explícitos (no pantallas)
- Preparar base para notificaciones (sin activar)

---

## ⚠️ AJUSTES CRÍTICOS ANTES DE EJECUTAR P0

### 1. Diferenciación Explícita: transition vs end

**Regla explícita:**

- **`transition`** ocurre cuando un spot se completa y aún hay spots pendientes.
  - Evento: `SPOT_COMPLETED`
  - Momento: `transition`
  - Condición: `currentSpotIndex < totalSpots - 1` (aún hay más spots)

- **`end`** ocurre solo cuando el Flow completo termina (último spot).
  - Evento: `FLOW_COMPLETED`
  - Momento: `end`
  - Condición: `currentSpotIndex === totalSpots - 1` (último spot) Y Flow se cierra

**Mapeo:**
- `SPOT_COMPLETED` → `transition` (si hay más spots) o `end` (si es último spot)
- `FLOW_COMPLETED` → `end` (siempre)

**Documentación requerida:** `ANALISIS_FUNCIONAL_FLOW_EVENTS.md` debe incluir esta diferenciación explícita.

---

### 2. Mapeo Explícito de Eventos (ANTES de tocar UI)

**Requisito:** Antes de arreglar rendering de subtítulos, documentar mapeo completo:

```
Evento → Momento → UI impactada → Texto esperado
```

**Ejemplo de formato:**

| Evento | Momento | UI Impactada | Texto Esperado | Condición |
|--------|---------|--------------|----------------|-----------|
| `FLOW_STARTED` | `start` | FlowPlayerControls, FlowMiniBar | "We're starting your flow" | Al iniciar Flow |
| `FLOW_ACTIVE` | `in_flow` | FlowPlayerControls | "Continue moving" | Flow activo, entre spots |
| `SPOT_PROXIMITY_ENTER` | `near_spot` | FlowPlayerControls, FlowMiniBar | Spot.anticipation o Spot.presence | Usuario se acerca a spot |
| `SPOT_COMPLETED` | `transition` | FlowPlayerControls | Spot.transition | Spot completado, hay más spots |
| `SPOT_COMPLETED` | `end` | FlowPlayerControls | "Flow completed" | Spot completado, es último spot |
| `FLOW_COMPLETED` | `end` | FlowPlayerControls, FlowMiniBar | "You've completed the flow" | Flow cerrado |

**Documentación requerida:** `ANALISIS_FUNCIONAL_FLOW_EVENTS.md` debe incluir esta tabla completa.

---

### 3. Uso Transversal del Naming "Flow"

**Regla estricta:**
- Usuario NUNCA ve "path" o "route"
- Internamente puede haber `PathContext`, `pathId`, etc. (OK)
- UI siempre muestra "Flow" o "Flows"

**Términos a reemplazar en UI:**
- `"Path"` → `"Flow"`
- `"Route"` → `"Flow"`
- `"paths"` → `"flows"`
- `"routes"` → `"flows"`

**Qué NO se toca:**
- Nombres de archivos (`PathContext.tsx`, `flows.ts` - OK)
- Nombres de variables internas (`pathId`, `currentPathId` - OK)
- Nombres de funciones internas (`getPathById`, `createPath` - OK)
- Tipos TypeScript (`Path`, `Flow` como tipo - revisar caso por caso)
- Comentarios de código (pueden mantener "path" si explica lógica interna)

**Archivos priorizados para auditar:**
- `app/(tabs)/home.tsx` - Secciones, labels
- `app/(tabs)/saved.tsx` - Filtros, labels
- `app/flow-detail.tsx` - Labels visibles
- `components/FlowCard.tsx` - Texto de cards
- `components/ui/Chip.tsx` - Clasificaciones (si aplica)
- `components/SaveFlowModal.tsx` - Texto del modal

**Documentación requerida:** `DECISIONES_TECNICAS.md` debe incluir lista completa de archivos modificados y razonamiento de qué NO se toca.

---

### 4. Documentación Obligatoria (en FLOWYA V1.1)

**Archivos a crear en `definitions/FLOWYA V1.1/`:**

1. **`BITACORA_V1_1.md`** ✅ CREAR PRIMERO
   - Entrada por tarea completada
   - Formato obligatorio (trazabilidad completa):
     - **[ID de Backlog]** (ej. P0-07)
     - **Fecha**
     - **Contexto del cambio**
     - **Descripción del ajuste realizado**
     - **Archivos tocados**
     - **Archivos NO tocados** (decisiones explícitas)
     - **Riesgos considerados**
     - **Estado** (propuesto / aplicado / pendiente revisión)
   - Objetivo: poder cruzar backlog ↔ decisiones ↔ código sin ambigüedad

2. **`ANALISIS_FUNCIONAL_FLOW_SUBTITLES.md`** ✅ CREAR EN FASE 0
   - Estado actual
   - Problemas identificados
   - Solución implementada

3. **`ANALISIS_FUNCIONAL_FLOW_EVENTS.md`** ✅ CREAR EN FASE 0
   - Eventos actuales
   - Mapeo a momentos (incluir diferenciación transition vs end)
   - Mapeo explícito: Evento → Momento → UI → Texto
   - Eventos nuevos necesarios

4. **`DECISIONES_TECNICAS.md`** ✅ CREAR EN FASE 0
   - Decisiones sobre naming (qué se reemplaza, qué NO)
   - Decisiones sobre arquitectura
   - Alternativas descartadas
   - Impacto técnico

5. **`ANALISIS_FUNCIONAL_MINI_PLAYER.md`** ✅ CREAR DURANTE P0-09
   - Estado actual del Mini Player
   - Mejoras implementadas
   - Sincronización con Player

6. **`ANALISIS_FUNCIONAL_NOTIFICATIONS_FUTURE.md`** ✅ CREAR EN P2-05 (exploratorio)
   - Análisis de viabilidad
   - Reutilización de shortText
   - Eventos clave para notificaciones

---

## 🚫 FUERA DE ALCANCE — V1.1 (EXPLÍCITO)

**Las siguientes funcionalidades NO se implementan ni prueban en V1.1:**

- ❌ **Push notifications reales**
  - Se prepara schema de subtítulos para futuras notificaciones (P2-05)
  - NO se implementa sistema de notificaciones push
  - NO se integra con servicios de notificaciones

- ❌ **Tracking en background fuera de navegador**
  - Flow funciona solo cuando navegador está activo
  - NO se implementa tracking en background
  - NO se implementa geofencing en background

- ❌ **Precisión GPS tipo app nativa**
  - Se usa geofencing simulado existente
  - NO se implementa precisión GPS avanzada
  - NO se optimiza para tracking continuo

- ❌ **UX offline**
  - Flow requiere conexión para funcionar correctamente
  - NO se implementa caché offline avanzado
  - NO se implementa modo offline

- ❌ **Optimización avanzada de polling/batería**
  - Se mantiene intervalo de actualización básico
  - NO se optimiza polling avanzado
  - NO se optimiza consumo de batería

**Razón:** V1.1 se enfoca en estabilizar y pulir la experiencia core en web, sin introducir features fuera de scope.

---

## 🏗️ ESTRUCTURA DE TRABAJO

### Fase 0: Preparación y Análisis (ANTES de tocar código)

#### Tarea 0.1: Crear BITACORA_V1_1.md
**Ubicación:** `definitions/FLOWYA V1.1/BITACORA_V1_1.md`

#### Tarea 0.2: Auditoría del estado actual
**Entregable:** `ANALISIS_FUNCIONAL_FLOW_SUBTITLES.md`

#### Tarea 0.3: Mapeo de eventos existentes
**Entregable:** `ANALISIS_FUNCIONAL_FLOW_EVENTS.md` (con mapeo explícito y diferenciación transition vs end)

#### Tarea 0.4: Documentar decisiones de naming
**Entregable:** `DECISIONES_TECNICAS.md` (con lista de qué se reemplaza y qué NO)

---

## 🔴 BLOQUE P0 — CRÍTICO (Implementar en orden)

### P0-07: Definir contrato de datos de Subtítulos (Schema) ⚠️ PRIMERO

**Razón:** Es la base de todo el sistema de subtítulos. Debe estar antes de implementar P0-06, P0-08, P0-09.

**⚠️ CONGELAMIENTO DEL CONTRATO:**
- Una vez definido y aprobado el schema `FlowSubtitle`, se considera **CONGELADO para V1.1**
- NO se puede modificar durante V1.1
- Cualquier ajuste debe documentarse como propuesta para V1.2, sin implementación inmediata
- Objetivo: estabilidad, consistencia y evitar refactors silenciosos

**Archivos a crear/modificar:**

1. **`types/flowSubtitle.ts`** (NUEVO)
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
   **⚠️ Este schema queda CONGELADO una vez aprobado en P0-07**

2. **Crear `data/flowSubtitles.ts`** (NUEVO)
   - Definir subtítulos canónicos por evento
   - Incluir condiciones para transition vs end
   - Mantener compatibilidad temporal con sistema anterior

**Documentación:** Actualizar `ANALISIS_FUNCIONAL_FLOW_SUBTITLES.md`

**Validación requerida:** Schema debe ser aprobado explícitamente antes de continuar con P0-08

---

### P0-08: Alinear triggers del Flow a estructura de narración

**Depende de:** P0-07 (schema definido)

**Reglas críticas:**

1. **`FLOW_STARTED`** se emite en `startFlow()` cuando Flow pasa de 'idle' a 'active'
   - **One-shot:** Se emite solo una vez al iniciar Flow
   - **Prioridad:** Media (ver regla de prioridad de eventos)

2. **`FLOW_ACTIVE`** se emite cuando Flow está activo y no hay eventos específicos
   - **Estado pasivo:** No emisor constante, solo cuando no hay otros eventos
   - **Prioridad:** Baja (ver regla de prioridad de eventos)

3. **`SPOT_PROXIMITY_ENTER`** se emite cuando usuario se acerca a un spot (geofencing simulado)
   - **One-shot:** Se emite una vez por spot
   - **Prioridad:** Alta (ver regla de prioridad de eventos)

4. **`SPOT_COMPLETED`** se emite cuando se completa un spot:
   - Si hay más spots: momento = `transition`
   - Si es último spot: momento = `end` (preparar para `FLOW_COMPLETED`)
   - **Prioridad:** Media-Alta (ver regla de prioridad de eventos)

5. **`FLOW_COMPLETED`** se emite en `closeFlow()` cuando Flow termina completamente (siempre momento = `end`)
   - **One-shot:** Se emite solo una vez al cerrar Flow
   - **Prioridad:** Máxima (ver regla de prioridad de eventos)

**Regla de prioridad de eventos (jerarquía para evitar conflictos visuales):**

```
1. FLOW_COMPLETED (máxima prioridad - siempre muestra "end")
2. SPOT_PROXIMITY_ENTER (alta prioridad - muestra "near_spot")
3. SPOT_COMPLETED (media-alta prioridad - muestra "transition" o "end")
4. FLOW_STARTED (media prioridad - muestra "start")
5. FLOW_ACTIVE (baja prioridad - muestra "in_flow" solo si no hay otros eventos)
```

**Regla:** Solo un evento puede renderizar texto a la vez. Eventos de mayor prioridad sobrescriben eventos de menor prioridad.

**Archivos a modificar:**

1. **`contexts/FlowContext.tsx`**
   - Agregar emisión de eventos explícitos
   - Emitir `FLOW_STARTED` en `startFlow()`
   - Emitir `SPOT_COMPLETED` en `nextNarrationBlock()` cuando completa todos los bloques de un spot
   - Emitir `FLOW_COMPLETED` en `closeFlow()`

2. **Crear `utils/flowEventEmitter.ts`** (NUEVO)
   - Sistema centralizado de eventos
   - Listeners para eventos
   - Implementar lógica de prioridad
   - Integración con FlowContext

**Documentación:** Actualizar `ANALISIS_FUNCIONAL_FLOW_EVENTS.md` con mapeo completo, regla de prioridad, y eventos one-shot

---

### P0-06: BUG — Subtítulos del Flow no aparecen

**Depende de:** P0-07, P0-08 (necesitamos schema y eventos funcionando)

**Archivos a auditar y corregir:**

1. **`components/FlowPlayerControls.tsx`**
   - Verificar función `renderInfoSection()` (línea ~144)
   - Reemplazar lógica basada en `narration.status === 'playing'` por lógica basada en eventos
   - Usar hook `useFlowSubtitle()` cuando esté disponible

2. **`components/FlowMiniBar.tsx`**
   - Implementar renderizado de subtítulos usando `useFlowSubtitle()`
   - Mostrar `shortText` si existe

3. **`contexts/NarrationContext.tsx`**
   - Mantener por ahora para compatibilidad
   - Migrar gradualmente a sistema de eventos

**Documentación:** Actualizar `ANALISIS_FUNCIONAL_FLOW_SUBTITLES.md` con diagnóstico y solución

---

### P0-09: Renderizar subtítulos correctamente en Player y Mini Player

**Depende de:** P0-06 (debe estar resuelto primero)

**Archivos a modificar:**

1. **Crear hook `hooks/useFlowSubtitle.ts`** (NUEVO)
   ```typescript
   export function useFlowSubtitle(): FlowSubtitle | null {
     // Obtener subtítulo actual basado en:
     // - Evento activo del FlowContext
     // - Schema de flowSubtitles
     // - Estado del Flow (currentSpotIndex, totalSpots)
     // - Condiciones (transition vs end)
     // - Regla de prioridad de eventos
     // - Implementar fallback UX (ver sección siguiente)
   }
   ```

2. **`components/FlowPlayerControls.tsx`**
   - Usar `useFlowSubtitle()` en `renderInfoSection()`
   - Mostrar `text` (completo) con jerarquía clara
   - Implementar fallback UX si no hay subtítulo disponible

3. **`components/FlowMiniBar.tsx`**
   - Usar `useFlowSubtitle()` para obtener subtítulo actual
   - Mostrar `shortText` si existe, sino primeros 60 caracteres de `text`
   - Implementar fallback UX si no hay subtítulo disponible

**Reglas de renderizado:**
- Player muestra `text` completo con jerarquía clara
- Mini Player muestra `shortText` si existe, sino primeros 60 caracteres de `text`
- Ambos deben estar sincronizados (mismo momento del Flow)
- Fallback UX: mostrar último texto válido del Flow para evitar estados vacíos

**Fallback UX para subtítulos:**
- Si no hay texto disponible (clima, shortText, etc.), mostrar último texto válido del Flow
- Evitar estados vacíos o mensajes genéricos
- Priorizar continuidad de experiencia sobre exactitud temporal
- Si nunca hubo texto válido, mostrar mensaje por defecto mínimo: "Now moving"

**Documentación:** Actualizar `ANALISIS_FUNCIONAL_MINI_PLAYER.md` con fallback UX documentado

---

### P0-05: Eliminar Audio del Flow y limpiar dependencias

**⚠️ IMPORTANTE:** Hacer DESPUÉS de que subtítulos funcionen (P0-06, P0-09)

**Archivos a modificar:**

1. **`contexts/NarrationContext.tsx`**
   - Eliminar llamadas a `audioManager.play()`
   - Cambiar `status: 'playing'` a lógica basada en eventos (mantener compatibilidad temporal)
   - Mantener solo lógica de subtítulos

2. **`utils/audioManager.ts`**
   - Marcar como `@deprecated`
   - Verificar si se usa fuera del Flow

3. **`components/NarrationController.tsx`**
   - Eliminar triggers de audio
   - Mantener solo triggers de eventos para subtítulos

4. **`components/FlowPlayerControls.tsx`**
   - Eliminar controles de audio (mute) si existen
   - Mantener controles de navegación

5. **`app/flow-screen.tsx`**
   - Eliminar lógica de reproducción de audio
   - Eliminar importaciones de audioManager

**Documentación:** Actualizar `BITACORA_V1_1.md` con lista de archivos modificados

---

### P0-04: Normalizar naming — usar exclusivamente "Flow"

**Regla estricta:**
- Usuario NUNCA ve "path" o "route"
- Internamente puede haber `PathContext`, `pathId`, etc. (OK)
- UI siempre muestra "Flow" o "Flows"

**Términos a reemplazar en UI:**
- `"Path"` → `"Flow"`
- `"Route"` → `"Flow"`
- `"paths"` → `"flows"`
- `"routes"` → `"flows"`

**Qué NO se toca:**
- Nombres de archivos (`PathContext.tsx`, `flows.ts` - OK)
- Nombres de variables internas (`pathId`, `currentPathId` - OK)
- Nombres de funciones internas (`getPathById`, `createPath` - OK)
- Tipos TypeScript (revisar caso por caso)
- Comentarios de código (pueden mantener "path" si explica lógica interna)

**Archivos a auditar y modificar:**

1. **Búsqueda global:**
   ```bash
   grep -r "Path\|Route" app/ components/ --include="*.tsx" -i
   ```

2. **Archivos priorizados:**
   - `app/(tabs)/home.tsx` - Secciones, labels
   - `app/(tabs)/saved.tsx` - Filtros, labels
   - `app/flow-detail.tsx` - Labels visibles
   - `components/FlowCard.tsx` - Texto de cards
   - `components/ui/Chip.tsx` - Clasificaciones (si aplica)
   - `components/SaveFlowModal.tsx` - Texto del modal

**Documentación:** Actualizar `DECISIONES_TECNICAS.md` con lista completa de archivos modificados

---

### P0-03: Evitar duplicación visual de Spots

**Archivos a analizar:**

1. **`hooks/useSpotForm.ts`**
   - Verificar lógica de detección de duplicados
   - Verificar qué hace cuando detecta duplicado

2. **`app/create-spot.tsx`**
   - Verificar qué sucede cuando `form.existingSpot` es true
   - Verificar si se crea nueva entidad visual o se reutiliza

3. **`contexts/SpotContext.tsx`**
   - Verificar función de creación/guardado
   - Asegurar que no se crea spot nuevo si existe

**Solución propuesta:**
- Si se detecta spot existente, NO crear nuevo spot
- Asociar usuario al spot existente (si aplica)
- Mostrar mensaje claro: "Este spot ya existe. Se ha cargado la información existente."

**Documentación:** Actualizar análisis funcional correspondiente

---

### P0-02: Corregir caché de imágenes al crear o editar Spot

**Archivos a analizar:**
- `contexts/SpotContext.tsx` - Función de guardado
- `components/SpotMediaCard.tsx` - Verificar si usa caché
- `components/ui/OptimizedImage.tsx` - Verificar lógica de caché

**Solución:**
1. Invalidar caché de imagen al guardar spot
2. Forzar re-render de cards que muestran el spot
3. Posiblemente agregar key único con timestamp a imágenes

**Documentación:** Actualizar `BITACORA_V1_1.md`

---

### P0-01: Reemplazar componente Location por Mapbox Search oficial

**Archivos a crear/modificar:**

1. **`utils/mapboxSearch.ts`** (NUEVO o ACTUALIZAR)
   - Integración con Mapbox Search API oficial
   - Función de forward geocoding (búsqueda por texto)
   - Función de reverse geocoding (coordenadas → dirección completa)

2. **`components/ui/FormLocationSelector.tsx`** (REFACTORIZAR)
   - Usar Mapbox Search oficial
   - Campo completamente editable y reseteable
   - Retornar dirección completa (calle + referencia)
   - Mantener fallback cuando no hay dirección precisa

**Documentación:** Actualizar análisis funcional correspondiente

---

## 🟠 BLOQUE P1 — ALTA (Implementar después de P0 completo)

*(Ver backlog completo para detalles)*

---

## 🟡 BLOQUE P2 — MEDIA (Implementar después de P1 completo)

*(Ver backlog completo para detalles)*

---

## ✅ DEFINITION OF DONE POR PRIORIDAD

### P0 — Definition of Done

**P0 se considera completo cuando:**

- ✅ **Audio eliminado sin imports residuales**
  - No hay imports de `audioManager`, `Expo.Speech`, `TTS` en código de Flow
  - `audioManager.ts` marcado como `@deprecated` o eliminado
  - No hay errores de audio en consola
  - Verificado con búsqueda global de términos relacionados

- ✅ **Subtítulos visibles en Player y Mini Player en todos los eventos**
  - Player muestra subtítulos en: start, in_flow, near_spot, transition, end
  - Mini Player muestra subtítulos en todos los eventos (usando shortText)
  - Ambos componentes sincronizados (mismo momento del Flow)
  - Texto siempre visible durante Flow activo (nunca estado vacío)

- ✅ **transition y end funcionando correctamente en flows multi-spot**
  - `SPOT_COMPLETED` emite `transition` cuando hay más spots pendientes
  - `SPOT_COMPLETED` emite `end` cuando es el último spot y Flow se cierra
  - `FLOW_COMPLETED` siempre emite `end`
  - Probado con flows de 1 spot, 2 spots, 3+ spots

- ✅ **Documentación P0 actualizada**
  - `BITACORA_V1_1.md` con todas las tareas P0 registradas
  - `ANALISIS_FUNCIONAL_FLOW_EVENTS.md` con mapeo completo
  - `ANALISIS_FUNCIONAL_FLOW_SUBTITLES.md` con solución documentada
  - `DECISIONES_TECNICAS.md` con decisiones de naming documentadas

- ✅ **Sin regresiones visibles o funcionales**
  - Checklist de validación mínima completado (ver sección "VALIDACIÓN MÍNIMA DE NO REGRESIÓN")
  - Flow funciona sin audio
  - No se rompió funcionalidad existente
  - UI consistente y sin errores visuales
  - **No-regresión es criterio de cierre obligatorio: NO se cierra bloque si hay regresiones**

### P1 — Definition of Done

**P1 se considera completo cuando:**

- ✅ Todas las mejoras de UX implementadas según backlog
- ✅ Mini Player mejorado y sincronizado con Player principal
- ✅ Microcopy canónico definido y aplicado
- ✅ Flujos de creación mejorados (steppers, feedback, etc.)
- ✅ Documentación P1 actualizada en `BITACORA_V1_1.md`
- ✅ Sin regresiones respecto a P0

### P2 — Definition of Done

**P2 se considera completo cuando:**

- ✅ Auditorías completadas
- ✅ Decisiones tomadas sobre features exploratorias
- ✅ Documentación P2 actualizada
- ✅ Estado futuro documentado (notificaciones, etc.)
- ✅ Sin regresiones respecto a P1

---

## ⚠️ REGLAS CRÍTICAS DE EJECUCIÓN

1. **NO avanzar a siguiente prioridad hasta cerrar la actual**
2. **Pausas obligatorias después de cada bloque (P0, P1, P2)**
   - Cursor NO debe avanzar al siguiente bloque sin confirmación explícita del Product Owner
   - La pausa implica: revisión funcional, revisión de documentación, validación de no regresión
   - Detenerse explícitamente y esperar aprobación antes de continuar

3. **Documentar cada cambio en BITACORA_V1_1.md con trazabilidad completa**
   - Cada entrada debe incluir: [ID de Backlog] (ej. P0-07), Fecha, Contexto, Descripción, Archivos tocados, Riesgos, Estado
   - Permite cruzar backlog ↔ decisiones ↔ código sin ambigüedad

4. **Congelamiento del contrato de subtítulos**
   - Una vez definido y aprobado el schema `FlowSubtitle` en P0-07, se considera CONGELADO para V1.1
   - NO se puede modificar durante V1.1
   - Cualquier ajuste debe documentarse como propuesta para V1.2, sin implementación inmediata
   - Objetivo: estabilidad, consistencia y evitar refactors silenciosos

5. **Principio de mínima intervención**
   - Durante V1.1 se aplica el principio de mínima intervención
   - NO se renombra, reestructura ni refactoriza código no relacionado directamente con items del Backlog V1.1
   - Aunque se detecten oportunidades de mejora, se documentan para V1.2, NO se implementan ahora
   - Solo se toca código necesario para cumplir items del backlog

6. **No-regresión como criterio de cierre**
   - Ningún bloque se considera cerrado si introduce regresiones visibles o funcionales
   - Antes de cerrar cada prioridad, validar: Flow 1 spot, Flow múltiples spots, Mini Player activo, Navegación libre, Salida/reentrada navegador
   - Verificar que no se rompió nada existente después de cada tarea

7. **Mantener compatibilidad con arquitectura V2.0**
8. **No re-arquitectar, solo ajustar lo necesario**
9. **Mapear eventos explícitamente ANTES de tocar UI**
10. **Diferenciar claramente transition vs end en toda la implementación**

---

## 🎯 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

**Fase 0: Preparación** (1-2 días)
- Crear documentación base (BITACORA, análisis funcionales, decisiones técnicas)
- Auditorías y análisis

**Bloque P0** (5-7 días) — **Orden interno recomendado:**

1. **P0-05 (Auditoría y deprecación de audio)** → PRIMERO
   - Identificar todos los usos de audio en Flow
   - Marcar como deprecated
   - Documentar qué se eliminará

2. **P0-08 (Declaración final de eventos y mapeo)** → SEGUNDO
   - Diferenciación transition vs end (condiciones explícitas)
   - Mapeo Evento → Momento → UI → Texto (tabla completa)
   - Regla de prioridad de eventos
   - Eventos one-shot documentados

3. **P0-07 (Schema de subtítulos)** → TERCERO
   - Crear `types/flowSubtitle.ts`
   - Crear `data/flowSubtitles.ts`
   - Definir subtítulos canónicos por evento
   - Incluir condiciones para transition vs end

4. **P0-06 (Fix de rendering de subtítulos)** → CUARTO
   - Auditar y corregir FlowPlayerControls
   - Implementar lógica basada en eventos (no audio)
   - Verificar sincronización con FlowContext

5. **P0-09 (Mini Player)** → QUINTO
   - Implementar renderizado de subtítulos en FlowMiniBar
   - Sincronizar con Player principal
   - Implementar fallback UX

6. **P0-04 (Naming "Flow")** → SEXTO
   - Independiente de subtítulos/audio
   - Búsqueda y reemplazo en UI visible

7. **P0-03 (Duplicación visual)** → SÉPTIMO
   - Independiente
   - Corregir lógica en useSpotForm y SpotContext

8. **P0-02 (Caché imágenes)** → OCTAVO
   - Independiente
   - Invalidar caché correctamente

9. **P0-01 (Mapbox Search)** → NOVENO (más complejo)
   - Dejar para el final de P0
   - Refactorizar FormLocationSelector

**Bloque P1** (3-5 días) - Solo después de P0 completo y revisado

**Bloque P2** (2-3 días) - Solo después de P1 completo y revisado

---

## ✅ VALIDACIÓN MÍNIMA DE NO REGRESIÓN

**⚠️ CRITERIO DE CIERRE OBLIGATORIO:**

- **Ningún bloque se considera cerrado si introduce regresiones visibles o funcionales**
- Este checklist es **obligatorio** antes de cerrar cada prioridad (P0, P1, P2)
- No avanzar al siguiente bloque sin completar y aprobar esta validación

**Checklist de sanity check (obligatorio antes de cerrar cada bloque):**

- [ ] **Flow con 1 spot**
  - Flow inicia correctamente
  - Subtítulos aparecen en start, near_spot, end
  - Flow se cierra correctamente
  - No hay errores en consola

- [ ] **Flow con 3+ spots**
  - Flow inicia correctamente
  - Subtítulos aparecen en: start, near_spot (spot 1), transition, near_spot (spot 2), transition, near_spot (spot 3), end
  - Navegación entre spots funciona (next/previous)
  - Flow se cierra correctamente
  - No hay errores en consola

- [ ] **Navegación libre con Mini Player activo**
  - Mini Player visible cuando Flow está activo
  - Mini Player muestra subtítulos correctos
  - Usuario puede navegar a otras pantallas
  - Mini Player sigue mostrando estado correcto
  - Usuario puede expandir Flow desde Mini Player

- [ ] **Salir y volver al navegador**
  - Flow continúa funcionando después de cambiar de tab
  - Estado del Flow se mantiene (si aplica)
  - No hay pérdida de estado
  - No hay errores en consola

- [ ] **Agregar un spot durante Flow**
  - Usuario puede agregar spot al Flow activo
  - Subtítulos se actualizan correctamente
  - Progreso visual se actualiza
  - No hay errores en consola

**Estado:** ⏳ Pendiente (se completará antes de cerrar cada bloque: P0, P1, P2)

**Regla:** Este checklist debe completarse y aprobarse antes de declarar cualquier bloque como cerrado.

---

## 📋 EVENTOS ONE-SHOT (EXPLÍCITO)

**Eventos que se disparan solo una vez:**

- ✅ **`FLOW_STARTED`** → one-shot
  - Se emite solo cuando Flow pasa de 'idle' a 'active'
  - No se repite durante el mismo Flow

- ✅ **`SPOT_PROXIMITY_ENTER`** → one-shot por spot
  - Se emite una vez por spot cuando usuario se acerca
  - No se repite para el mismo spot durante el mismo Flow

- ✅ **`FLOW_COMPLETED`** → one-shot
  - Se emite solo cuando Flow se cierra completamente
  - No se repite

**Eventos que NO son one-shot:**

- ⚠️ **`FLOW_ACTIVE`** → estado pasivo, no emisor constante
  - Se mantiene mientras Flow está activo
  - No se emite constantemente, solo cuando no hay otros eventos

- ⚠️ **`SPOT_COMPLETED`** → se puede emitir múltiples veces (una por spot)
  - Se emite cuando se completa cada spot
  - Puede emitirse múltiples veces en un Flow con múltiples spots

**Regla:** Eventos one-shot deben tener guardas para evitar emisión múltiple.

---

**Estado del plan:** ✅ Blindado al 100% y listo para ejecución

**Confirmación de ajustes finales:**
- ✅ Definition of Done por prioridad (P0/P1/P2) documentado
- ✅ Fuera de alcance explícito para V1.1 declarado (push notifications, tracking background, GPS avanzado, UX offline, optimización batería)
- ✅ Orden interno recomendado dentro de P0 confirmado (P0-05 primero, luego P0-08, P0-07, P0-06, P0-09, etc.)
- ✅ Regla de prioridad de eventos declarada (jerarquía clara: FLOW_COMPLETED > SPOT_PROXIMITY_ENTER > SPOT_COMPLETED > FLOW_STARTED > FLOW_ACTIVE)
- ✅ Eventos one-shot explícitos documentados (FLOW_STARTED, SPOT_PROXIMITY_ENTER, FLOW_COMPLETED) con guardas requeridas
- ✅ Fallback UX para subtítulos definido (mostrar último texto válido del Flow para evitar estados vacíos)
- ✅ Validación mínima de no regresión (checklist) agregada (Flow 1 spot, 3+ spots, navegación libre, salir/volver, agregar spot)
- ✅ Diferenciación transition vs end documentada (condiciones explícitas)
- ✅ Mapeo explícito de eventos requerido antes de UI (Evento → Momento → UI → Texto)
- ✅ Uso transversal del naming "Flow" documentado (qué se reemplaza, qué NO se toca)
- ✅ Documentación obligatoria confirmada (en FLOWYA V1.1: BITACORA_V1_1.md, análisis funcionales, decisiones técnicas)

**Decisión arquitectónica adicional (2026-01-10):**
- ✅ **LocationSelectorWeb se redefine como flujo secuencial:** Search → Confirmación en mapa → Current location
  - Modelo anterior (descartado): sincronización bidireccional Search ↔ Map, mapMode explícito
  - Modelo nuevo (implementado): flujo secuencial simple y robusto
  - Motivo: inestabilidad de sincronización bidireccional
  - Flujo: Paso 1 (Search) → Paso 2 (Map aparece solo con coordinates) → Paso 3 (Current location siempre visible)
  - Ver BITACORA_V1_1.md entrada P1-Location-Reconstruction para detalles completos

**Confirmación de addendum final:**
- ✅ **A1. Pausas obligatorias:** Regla explícita agregada - NO avanzar sin confirmación del Product Owner
- ✅ **A2. Congelamiento del contrato:** Regla agregada en P0-07 - Schema FlowSubtitle congelado una vez aprobado
- ✅ **A3. Bitácora con trazabilidad:** Formato obligatorio actualizado - cada entrada incluye [ID de Backlog], contexto, descripción, archivos, riesgos, estado
- ✅ **A4. No-regresión como criterio de cierre:** Reforzado - checklist obligatorio antes de cerrar cada bloque
- ✅ **A5. Principio de mínima intervención:** Regla agregada - NO refactorizar código no relacionado con backlog V1.1

---

**ESTADO FINAL DEL PLAN:**

✅ **CERCADO, APROBADO Y LISTO PARA EJECUCIÓN**

Con este addendum, el Plan Arquitectónico V1.1 se considera:
- **Cerrado** (no se agregan más ajustes)
- **Aprobado** (todos los puntos críticos integrados)
- **Listo para ejecución** (documentación base primero, luego P0)

**Próximo paso:** Crear documentación base (BITACORA_V1_1.md, análisis funcionales, decisiones técnicas) y comenzar Fase 0
