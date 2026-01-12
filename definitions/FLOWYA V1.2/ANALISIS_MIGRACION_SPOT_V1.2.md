# ANÁLISIS DE IMPACTO Y PLAN DE MIGRACIÓN
## Modelo de Spot FLOWYA V1.2

**Fecha:** 2026-01-11  
**Versión:** FLOWYA V1.2  
**Tipo:** Análisis técnico y plan de migración  
**Estado:** Pendiente de ejecución

---

## RESUMEN EJECUTIVO

Este documento analiza el impacto de la migración del modelo de Spot actual a un modelo simplificado según decisiones de producto de FLOWYA V1.2.

### Decisiones de Producto Aprobadas
1. **Eliminar completamente** cualquier forma de flow narrative
2. **Simplificar** el modelo de Spot a un set mínimo de campos
3. **Usar IA solo bajo demanda**, cuando el usuario abre un Spot sin contenido
4. **Poblar la base** con un dataset inicial liviano (seed)

### Nuevo Modelo Aprobado de Spot

```typescript
interface Spot {
  id: string;
  name: string;
  type: SpotType; // enum cerrado
  location: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
  shortDescription?: string; // 1-2 líneas, evocativo
  image: {
    url: string;
    source?: string;
    license?: string;
  };
  hasGeneratedContent: boolean;
}
```

---

## COMPARACIÓN DE MODELOS

### Modelo Actual (V1.1/V2.0)

```typescript
interface Spot {
  // Campos básicos
  id: string;
  name?: string;
  location: {
    latitude: number;
    longitude: number;
    adjustable?: boolean;
  };
  photos: string[]; // Array de URLs
  description?: string;
  type: SpotType;
  
  // Campos opcionales avanzados
  hours?: SpotHours;
  cost?: SpotCost;
  restrictions?: string;
  accessibility?: string;
  
  // Campos de contenido generado por IA
  whyItMatters?: string;
  culturalContext?: string;
  planInfo?: string;
  howToVisit?: SpotHowToVisit;
  narration?: SpotNarration; // ⚠️ PARA ELIMINAR (flow narrative)
  aiGenerated?: AIGeneratedMetadata;
  
  // Campos de metadata
  isLegacySpot?: boolean;
  createdBy?: string;
  locationRegion?: LocationRegion; // Región canónica de Mapbox
  createdAt: Date;
  updatedAt: Date;
}
```

### Modelo Nuevo (V1.2)

```typescript
interface Spot {
  id: string;
  name: string;
  type: SpotType; // enum cerrado (se mantiene)
  location: {
    lat: number;        // Cambio: latitude → lat
    lng: number;        // Cambio: longitude → lng
    city?: string;      // Nuevo: extraído de locationRegion
    country?: string;   // Nuevo: extraído de locationRegion
  };
  shortDescription?: string; // Nuevo: reemplaza description/whyItMatters
  image: {              // Cambio: photos[] → image{}
    url: string;        // Primera foto del array photos
    source?: string;    // Nuevo
    license?: string;   // Nuevo
  };
  hasGeneratedContent: boolean; // Nuevo: reemplaza aiGenerated
}
```

---

## ANÁLISIS DE IMPACTO POR ÁREA

### 1. CAMPOS A ELIMINAR

#### 1.1 Campos Eliminados (Sin Migración)

| Campo | Uso Actual | Impacto |
|-------|------------|---------|
| `location.adjustable` | Flag para indicar si pin es ajustable | **Bajo**: Solo usado en lógica de UI, no en persistencia |
| `photos[]` (array) | Array de URLs de fotos | **Alto**: Reemplazado por `image.url` (solo primera foto) |
| `description` | Descripción breve | **Medio**: Reemplazado por `shortDescription` |
| `hours` | Horarios por día (SpotHours) | **Alto**: Usado en spot-detail.tsx para mostrar horarios |
| `cost` | Costo (SpotCost) | **Alto**: Usado en spot-detail.tsx para mostrar precios |
| `restrictions` | Restricciones | **Medio**: Usado en UI de edición |
| `accessibility` | Accesibilidad | **Medio**: Usado en UI de edición |
| `whyItMatters` | Campo de contenido generado | **Alto**: Usado en spot-detail.tsx, useSpotForm.ts |
| `culturalContext` | Contexto cultural | **Alto**: Usado en spot-detail.tsx, useSpotForm.ts |
| `planInfo` | Información experiencial | **Alto**: Usado en spot-detail.tsx, useSpotForm.ts |
| `howToVisit` | Tips de visita | **Alto**: Usado en spot-detail.tsx, useSpotForm.ts |
| `narration` | **⚠️ FLOW NARRATIVE - ELIMINAR COMPLETAMENTE** | **Crítico**: Usado en múltiples lugares |
| `aiGenerated` | Metadatos de generación AI | **Medio**: Reemplazado por `hasGeneratedContent` |
| `isLegacySpot` | Flag interno | **Bajo**: Solo usado en migraciones internas |
| `createdBy` | ID del usuario creador | **Medio**: Usado para ownership (¿mantener?) |
| `locationRegion` | Región canónica de Mapbox | **Medio**: Usado para normalización (¿mantener city/country?) |
| `createdAt` | Fecha de creación | **Alto**: Usado para ordenamiento, filtrado |
| `updatedAt` | Fecha de actualización | **Alto**: Usado para ordenamiento, filtrado |

#### 1.2 Campos Críticos: Flow Narrative (Narration)

**⚠️ ELIMINACIÓN COMPLETA REQUERIDA**

| Archivo | Uso de Narration | Impacto |
|---------|------------------|---------|
| `data/spots.ts` | Tipo `SpotNarration`, campo `narration` en Spot | **Crítico** |
| `contexts/SpotContext.tsx` | Campo en persistencia | **Alto** |
| `hooks/useSpotForm.ts` | Estado y manejo de `narration` | **Alto** |
| `app/spot-detail.tsx` | Campo en formulario (aunque no se muestra en UI) | **Alto** |
| `app/create-spot.tsx` | Campo en formulario | **Alto** |
| `utils/aiContentGenerator.ts` | Generación de `narration` | **Alto** |
| `utils/spotNormalizer.ts` | Normalización de `narration` | **Medio** |
| `utils/spotEditorialAudit.ts` | Auditoría de `narration` | **Medio** |
| `data/narrations.ts` | **NO AFECTADO**: Este archivo maneja narrativas de Flow (NarrationContext), no de Spot | **Sin impacto** |
| `contexts/NarrationContext.tsx` | **NO AFECTADO**: Este contexto maneja narrativas de Flow, no de Spot | **Sin impacto** |
| `components/NarrationController.tsx` | **NO AFECTADO**: Maneja narrativas de Flow | **Sin impacto** |

**Nota importante**: El campo `narration` en Spot es diferente del sistema de narrativas de Flow. El campo Spot.narration se usa para generar contenido de audio/texto para el spot individual, mientras que NarrationContext maneja las narrativas del flujo completo (Flow).

### 2. CAMPOS A MIGRAR/MAPEAR

#### 2.1 Mapeo de Campos

| Campo Actual | Campo Nuevo | Lógica de Migración |
|--------------|-------------|---------------------|
| `location.latitude` | `location.lat` | Directo |
| `location.longitude` | `location.lng` | Directo |
| `locationRegion.city` | `location.city` | Extraer de `locationRegion` si existe |
| `locationRegion.country` | `location.country` | Extraer de `locationRegion` si existe |
| `photos[0]` | `image.url` | Tomar primera foto del array |
| `photos.length > 0 ? photos[0] : ''` | `image.url` | Fallback a string vacío si no hay fotos |
| `description` o `whyItMatters` | `shortDescription` | Priorizar `whyItMatters`, luego `description` |
| `aiGenerated !== undefined` | `hasGeneratedContent` | Si `aiGenerated` existe → `true`, sino `false` |
| `name` (opcional) | `name` (requerido) | Usar `name` o string vacío si no existe |

#### 2.2 Campos a Mantener (No Documentados en Nuevo Modelo)

| Campo | Justificación | Decisión |
|-------|---------------|----------|
| `id` | Identificador único | **MANTENER** (obvio) |
| `type` | Tipo de spot (enum) | **MANTENER** (en nuevo modelo) |
| `createdAt` | Ordenamiento, filtrado | **¿MANTENER?** (no está en nuevo modelo) |
| `updatedAt` | Ordenamiento, filtrado | **¿MANTENER?** (no está en nuevo modelo) |
| `createdBy` | Ownership, permisos | **¿MANTENER?** (no está en nuevo modelo, pero podría ser necesario) |

**Recomendación**: Mantener `createdAt` y `updatedAt` para compatibilidad con lógica existente de ordenamiento y filtrado. `createdBy` podría eliminarse si no se necesita ownership.

### 3. COMPONENTES UI AFECTADOS

#### 3.1 Pantallas Principales

| Componente | Campos Usados | Acción Requerida |
|------------|---------------|------------------|
| `app/spot-detail.tsx` | `hours`, `cost`, `whyItMatters`, `culturalContext`, `planInfo`, `howToVisit`, `description` | **REFACTORIZAR**: Eliminar secciones de horarios, costos, contexto cultural, planInfo, howToVisit. Mostrar solo `shortDescription` e `image` |
| `app/create-spot.tsx` | Todos los campos avanzados | **SIMPLIFICAR**: Mostrar solo campos del nuevo modelo |
| `app/liked-spots.tsx` | Campos básicos (probablemente no afectado) | **VERIFICAR**: Asegurar que use solo campos del nuevo modelo |

#### 3.2 Componentes de Cards

| Componente | Campos Usados | Acción Requerida |
|------------|---------------|------------------|
| `components/SpotMediaCard.tsx` | `photos[0]`, `name`, `description` | **AJUSTAR**: Usar `image.url` en lugar de `photos[0]`, `shortDescription` en lugar de `description` |
| `components/SpotInlineCard.tsx` | Similar a SpotMediaCard | **AJUSTAR**: Mismo tratamiento |
| Componentes de cards en general | `photos` array | **AJUSTAR**: Todos deben usar `image.url` |

#### 3.3 Formularios y Hooks

| Componente | Campos Usados | Acción Requerida |
|------------|---------------|------------------|
| `hooks/useSpotForm.ts` | Todos los campos actuales | **REFACTORIZAR COMPLETO**: Eliminar estados de `hours`, `cost`, `whyItMatters`, `culturalContext`, `planInfo`, `howToVisit`, `narration`. Agregar `shortDescription`, `image`, `hasGeneratedContent` |
| `hooks/useImageUpload.ts` | Maneja múltiples imágenes | **AJUSTAR**: Cambiar a manejo de imagen única |

#### 3.4 Utilidades

| Utilidad | Función | Acción Requerida |
|----------|---------|------------------|
| `utils/spotNormalizer.ts` | Normaliza spots | **ACTUALIZAR**: Ajustar lógica de normalización al nuevo modelo |
| `utils/spotFormHelpers.ts` | Helpers de formulario | **ACTUALIZAR**: Eliminar funciones relacionadas con campos eliminados (`formatHours`, `formatCost`, etc.) |
| `utils/spotEditorialAudit.ts` | Auditoría de contenido | **SIMPLIFICAR**: Eliminar validaciones de campos eliminados |
| `utils/spotTextValidator.ts` | Validación de texto | **AJUSTAR**: Validar solo `shortDescription` |
| `utils/aiContentGenerator.ts` | Generación de contenido IA | **REFACTORIZAR**: Generar solo `shortDescription`, NO generar `narration`, `whyItMatters`, `culturalContext`, etc. |

### 4. CONTEXTOS Y ESTADO GLOBAL

#### 4.1 SpotContext

| Función | Impacto | Acción Requerida |
|---------|---------|------------------|
| `createSpot()` | Alto | **ACTUALIZAR**: Aceptar solo campos del nuevo modelo |
| `updateSpot()` | Alto | **ACTUALIZAR**: Validar que updates sean del nuevo modelo |
| `generateSpotContent()` | Alto | **REFACTORIZAR**: Generar solo `shortDescription` cuando `hasGeneratedContent === false` |
| Persistencia (AsyncStorage) | Alto | **MIGRAR**: Script de migración para convertir spots existentes |

#### 4.2 Otros Contextos

| Contexto | Impacto | Notas |
|----------|---------|-------|
| `FlowContext` | **BAJO**: Usa spots, pero solo campos básicos | Verificar que use solo `id`, `name`, `location`, `type` |
| `SavedContext` / `PinContext` | **BAJO**: Referencia solo `spotId` | Sin cambios necesarios |
| `PathContext` | **BAJO**: Referencia solo `spotId` | Sin cambios necesarios |
| `NarrationContext` | **SIN IMPACTO**: Maneja narrativas de Flow, no de Spot | Sin cambios necesarios |

### 5. LÓGICA DE GENERACIÓN DE IA

#### 5.1 Cambios en Generación de Contenido

**Estado Actual:**
- `generateSpotContent()` genera: `whyItMatters`, `culturalContext`, `planInfo`, `howToVisit`, `narration`
- Se ejecuta automáticamente o bajo demanda

**Estado Nuevo:**
- `generateSpotContent()` genera **SOLO**: `shortDescription`
- Se ejecuta **SOLO bajo demanda** cuando usuario abre Spot sin contenido (`hasGeneratedContent === false`)

#### 5.2 Archivos Afectados

| Archivo | Cambios Requeridos |
|---------|-------------------|
| `utils/aiContentGenerator.ts` | **REFACTORIZAR**: Simplificar prompt, generar solo `shortDescription`, actualizar interfaz `GeneratedContent` |
| `contexts/SpotContext.tsx` | **ACTUALIZAR**: `generateSpotContent()` solo se llama bajo demanda |
| `hooks/useSpotForm.ts` | **SIMPLIFICAR**: Eliminar lógica de generación múltiple, solo generar `shortDescription` |
| `app/spot-detail.tsx` | **AJUSTAR**: Botón de generación IA solo genera `shortDescription` |

---

## PLAN DE MIGRACIÓN POR FASES

### FASE 0: PREPARACIÓN (Sin Cambios)

**Objetivo**: Documentar y validar el plan sin ejecutar cambios.

- [x] Análisis de impacto completado (este documento)
- [ ] Revisar y aprobar plan con equipo
- [ ] Crear branch de migración: `feature/v1.2-spot-model-migration`
- [ ] Backup de datos de desarrollo
- [ ] Definir estrategia de testing

### FASE 1: PREPARACIÓN DEL NUEVO MODELO

**Objetivo**: Definir tipos TypeScript del nuevo modelo sin romper código existente.

#### 1.1 Crear Tipos del Nuevo Modelo (Backward Compatible)

**Archivo**: `data/spots.ts`

```typescript
// Nuevo tipo (temporalmente paralelo)
export interface SpotV1_2 {
  id: string;
  name: string;
  type: SpotType;
  location: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
  shortDescription?: string;
  image: {
    url: string;
    source?: string;
    license?: string;
  };
  hasGeneratedContent: boolean;
  // Campos opcionales para compatibilidad temporal
  createdAt?: Date;
  updatedAt?: Date;
}

// Mantener Spot actual por ahora
export interface Spot { ... }
```

**Tareas:**
- [ ] Definir `SpotV1_2` interface
- [ ] Crear función `migrateSpotToV1_2(spot: Spot): SpotV1_2`
- [ ] Crear función `migrateSpotFromV1_2(spot: SpotV1_2): Spot` (para backward compatibility)

#### 1.2 Crear Utilidades de Migración

**Archivo**: `utils/spotMigration.ts` (nuevo)

```typescript
import { Spot } from '@/data/spots';
import { SpotV1_2 } from '@/data/spots';

/**
 * Migrar Spot V1.1 → V1.2
 */
export function migrateSpotToV1_2(spot: Spot): SpotV1_2 {
  // Lógica de migración
}

/**
 * Validar que un Spot cumple con modelo V1.2
 */
export function isValidSpotV1_2(spot: Spot): boolean {
  // Validaciones
}
```

**Tareas:**
- [ ] Crear `utils/spotMigration.ts`
- [ ] Implementar `migrateSpotToV1_2()`
- [ ] Implementar validaciones
- [ ] Tests unitarios de migración

### FASE 2: REFACTORIZACIÓN DE IA (Generación Bajo Demanda)

**Objetivo**: Simplificar generación de IA a solo `shortDescription` y ejecución bajo demanda.

#### 2.1 Refactorizar `aiContentGenerator.ts`

**Archivo**: `utils/aiContentGenerator.ts`

**Cambios:**
- [ ] Simplificar `GeneratedContent` interface (solo `shortDescription`)
- [ ] Simplificar prompt de GPT (solo generar descripción corta)
- [ ] Actualizar función `generateSpotContent()` para generar solo `shortDescription`
- [ ] Actualizar lógica de guardado (solo actualizar `shortDescription` y `hasGeneratedContent`)

#### 2.2 Actualizar `SpotContext.generateSpotContent()`

**Archivo**: `contexts/SpotContext.tsx`

**Cambios:**
- [ ] Actualizar `generateSpotContent()` para usar nuevo generador simplificado
- [ ] Actualizar `hasGeneratedContent` cuando se genera contenido
- [ ] Eliminar lógica de generación automática (solo bajo demanda)

#### 2.3 Actualizar UI de Generación IA

**Archivos**: `app/spot-detail.tsx`, `app/create-spot.tsx`

**Cambios:**
- [ ] Actualizar botón de generación IA para generar solo `shortDescription`
- [ ] Mostrar preview solo de `shortDescription`
- [ ] Eliminar opciones de generar campos específicos

**Tareas:**
- [ ] Refactorizar `utils/aiContentGenerator.ts`
- [ ] Actualizar `contexts/SpotContext.tsx`
- [ ] Actualizar UI de generación IA
- [ ] Tests de generación simplificada

### FASE 3: ELIMINACIÓN DE FLOW NARRATIVE (Spot.narration)

**Objetivo**: Eliminar completamente el campo `narration` del modelo Spot.

**⚠️ IMPORTANTE**: Este campo es diferente del sistema de narrativas de Flow (NarrationContext). Solo eliminamos el campo `narration` de Spot.

#### 3.1 Eliminar Campo de Tipo

**Archivo**: `data/spots.ts`

**Cambios:**
- [ ] Eliminar tipo `SpotNarration`
- [ ] Eliminar campo `narration?: SpotNarration` de interface `Spot`

#### 3.2 Eliminar Usos del Campo

**Archivos afectados:**
- [ ] `hooks/useSpotForm.ts`: Eliminar estado `narration`, setter `setNarration`
- [ ] `app/spot-detail.tsx`: Eliminar referencias a `narration`
- [ ] `app/create-spot.tsx`: Eliminar referencias a `narration`
- [ ] `utils/spotNormalizer.ts`: Eliminar normalización de `narration`
- [ ] `utils/spotEditorialAudit.ts`: Eliminar validación de `narration`
- [ ] `utils/aiContentGenerator.ts`: Eliminar generación de `narration`
- [ ] `contexts/SpotContext.tsx`: Eliminar persistencia de `narration`

**Tareas:**
- [ ] Buscar todos los usos de `spot.narration` o `narration` relacionado con Spot
- [ ] Eliminar cada uso encontrado
- [ ] Verificar que no haya referencias rotas

### FASE 4: SIMPLIFICACIÓN DE CAMPOS DE CONTENIDO

**Objetivo**: Eliminar campos avanzados (`whyItMatters`, `culturalContext`, `planInfo`, `howToVisit`, `hours`, `cost`, etc.) y consolidar en `shortDescription`.

#### 4.1 Eliminar Tipos Relacionados

**Archivo**: `data/spots.ts`

**Cambios:**
- [ ] Eliminar tipo `SpotHours`
- [ ] Eliminar tipo `SpotCost`
- [ ] Eliminar tipo `SpotHowToVisit`
- [ ] Eliminar tipo `AIGeneratedMetadata` (o mantenerlo renombrado si se necesita para metadata)

#### 4.2 Actualizar Interface Spot

**Archivo**: `data/spots.ts`

**Cambios:**
- [ ] Eliminar campos: `hours`, `cost`, `restrictions`, `accessibility`, `whyItMatters`, `culturalContext`, `planInfo`, `howToVisit`
- [ ] Agregar campos: `shortDescription`, `image`, `hasGeneratedContent`
- [ ] Actualizar `location`: `latitude/longitude` → `lat/lng`, agregar `city/country`

#### 4.3 Actualizar `useSpotForm.ts`

**Archivo**: `hooks/useSpotForm.ts`

**Cambios:**
- [ ] Eliminar estados: `hours`, `cost`, `restrictions`, `accessibility`, `whyItMatters`, `culturalContext`, `planInfo`, `howToVisit`
- [ ] Agregar estados: `shortDescription`, `image`, `hasGeneratedContent`
- [ ] Actualizar `handleSave()` para usar nuevos campos
- [ ] Actualizar validaciones

#### 4.4 Actualizar `spot-detail.tsx`

**Archivo**: `app/spot-detail.tsx`

**Cambios:**
- [ ] Eliminar secciones de UI: horarios, costos, contexto cultural, planInfo, howToVisit
- [ ] Mostrar solo: `name`, `type`, `location`, `shortDescription`, `image`
- [ ] Simplificar modo edición (solo campos del nuevo modelo)
- [ ] Eliminar funciones helper: `formatHours()`, `formatCost()`, `getHowToVisitBestTime()`, etc.

**Tareas:**
- [ ] Actualizar tipos en `data/spots.ts`
- [ ] Refactorizar `hooks/useSpotForm.ts`
- [ ] Simplificar `app/spot-detail.tsx`
- [ ] Actualizar `app/create-spot.tsx`
- [ ] Eliminar utilidades obsoletas (`formatHours`, `formatCost`, etc.)

### FASE 5: ACTUALIZACIÓN DE IMÁGENES (Array → Objeto)

**Objetivo**: Cambiar de array de fotos (`photos[]`) a objeto imagen único (`image{}`).

#### 5.1 Actualizar Interface Spot

**Archivo**: `data/spots.ts`

**Cambios:**
- [ ] Eliminar campo `photos: string[]`
- [ ] Agregar campo `image: { url: string, source?: string, license?: string }`

#### 5.2 Actualizar Lógica de Imágenes

**Archivos afectados:**
- [ ] `hooks/useSpotForm.ts`: Cambiar de array a objeto único
- [ ] `hooks/useImageUpload.ts`: Ajustar para manejar imagen única (o mantener array pero tomar primera)
- [ ] `app/spot-detail.tsx`: Usar `image.url` en lugar de `photos[0]`
- [ ] `app/create-spot.tsx`: Usar `image` en lugar de `photos`
- [ ] Componentes de cards: Actualizar para usar `image.url`

#### 5.3 Actualizar Componentes Visuales

**Archivos:**
- [ ] `components/SpotMediaCard.tsx`
- [ ] `components/SpotInlineCard.tsx`
- [ ] Otros componentes que usen `spot.photos`

**Tareas:**
- [ ] Actualizar interface Spot
- [ ] Refactorizar hooks de imágenes
- [ ] Actualizar componentes visuales
- [ ] Actualizar lógica de carga de imágenes

### FASE 6: MIGRACIÓN DE DATOS EXISTENTES

**Objetivo**: Migrar spots existentes en AsyncStorage al nuevo modelo.

#### 6.1 Crear Script de Migración

**Archivo**: `utils/spotMigration.ts` (extender)

**Funcionalidad:**
- [ ] Leer todos los spots de AsyncStorage
- [ ] Convertir cada spot al nuevo modelo usando `migrateSpotToV1_2()`
- [ ] Guardar spots migrados de vuelta a AsyncStorage
- [ ] Marcar migración como completada

#### 6.2 Integrar Migración en SpotContext

**Archivo**: `contexts/SpotContext.tsx`

**Cambios:**
- [ ] Agregar check de versión de modelo al cargar spots
- [ ] Ejecutar migración automáticamente si se detectan spots en formato antiguo
- [ ] Guardar flag de migración completada

**Tareas:**
- [ ] Implementar script de migración
- [ ] Integrar en SpotContext
- [ ] Testing de migración con datos reales
- [ ] Rollback plan en caso de error

### FASE 7: ACTUALIZACIÓN DE UBICACIÓN (location)

**Objetivo**: Cambiar `location.latitude/longitude` → `location.lat/lng` y agregar `city/country`.

#### 7.1 Actualizar Interface Spot

**Archivo**: `data/spots.ts`

**Cambios:**
- [ ] Cambiar `location.latitude` → `location.lat`
- [ ] Cambiar `location.longitude` → `location.lng`
- [ ] Agregar `location.city?: string`
- [ ] Agregar `location.country?: string`
- [ ] Eliminar `location.adjustable`

#### 7.2 Actualizar Usos de Location

**Búsqueda**: Buscar todos los usos de `spot.location.latitude` y `spot.location.longitude`

**Archivos afectados:**
- [ ] Todos los componentes que acceden a `location.latitude/longitude`
- [ ] Utilidades de distancia (`utils/distance.ts`)
- [ ] Utilidades de geocoding
- [ ] Mapbox integration

**Tareas:**
- [ ] Buscar y reemplazar `latitude` → `lat`
- [ ] Buscar y reemplazar `longitude` → `lng`
- [ ] Actualizar lógica de extracción de `city/country` desde `locationRegion` (si existe)
- [ ] Verificar integración con Mapbox

### FASE 8: LIMPIEZA Y OPTIMIZACIÓN

**Objetivo**: Eliminar código obsoleto y optimizar.

#### 8.1 Eliminar Utilidades Obsoletas

**Archivos a eliminar o limpiar:**
- [ ] `utils/spotFormHelpers.ts`: Eliminar `formatHours()`, `formatCost()`
- [ ] Funciones relacionadas con campos eliminados

#### 8.2 Actualizar Tests

**Archivos:**
- [ ] Tests unitarios de spots
- [ ] Tests de migración
- [ ] Tests de generación IA

#### 8.3 Documentación

**Tareas:**
- [ ] Actualizar documentación de API/modelos
- [ ] Actualizar comentarios en código
- [ ] Actualizar README si es necesario

**Tareas:**
- [ ] Limpiar código obsoleto
- [ ] Actualizar tests
- [ ] Actualizar documentación

### FASE 9: VALIDACIÓN Y TESTING

**Objetivo**: Validar que todo funciona correctamente.

#### 9.1 Testing Manual

**Checklist:**
- [ ] Crear nuevo spot (campos del nuevo modelo)
- [ ] Editar spot existente
- [ ] Ver detalle de spot
- [ ] Generar contenido IA (solo `shortDescription`)
- [ ] Migración de spots existentes
- [ ] Verificar que no haya referencias rotas a campos eliminados

#### 9.2 Testing Automatizado

- [ ] Tests de migración
- [ ] Tests de validación de modelo
- [ ] Tests de generación IA simplificada
- [ ] Tests de componentes UI

**Tareas:**
- [ ] Ejecutar testing manual completo
- [ ] Ejecutar suite de tests automatizados
- [ ] Corregir bugs encontrados
- [ ] Validar rendimiento

---

## CHECKLIST PREVIO A EJECUCIÓN

### Preparación Técnica

- [ ] **Backup completo de datos**: Crear backup de AsyncStorage y datos de desarrollo
- [ ] **Branch aislado**: Crear branch `feature/v1.2-spot-model-migration`
- [ ] **Documentación actualizada**: Este documento completo y aprobado
- [ ] **Plan de rollback**: Estrategia clara para revertir cambios si es necesario

### Validación de Entendimiento

- [ ] **Modelo nuevo validado**: Confirmar que el modelo nuevo está correctamente entendido
- [ ] **Decisiones de producto claras**: Confirmar que todas las decisiones están aprobadas
- [ ] **Alcance definido**: Confirmar qué se elimina y qué se mantiene

### Preparación del Equipo

- [ ] **Comunicación**: Equipo informado sobre la migración
- [ ] **Testing plan**: Plan de testing definido
- [ ] **Timeline**: Fechas estimadas de cada fase

---

## RIESGOS IDENTIFICADOS Y MITIGACIONES

### Riesgo 1: Pérdida de Datos en Migración

**Severidad**: **ALTA**

**Descripción**: Al migrar spots existentes, podría perderse información si la lógica de migración no es correcta.

**Mitigación**:
- Backup completo antes de migración
- Script de migración reversible
- Testing exhaustivo con datos reales
- Validación de integridad después de migración

### Riesgo 2: Referencias Rotas a Campos Eliminados

**Severidad**: **ALTA**

**Descripción**: Si no se eliminan todas las referencias a campos eliminados, la app podría romperse.

**Mitigación**:
- Búsqueda exhaustiva de usos de campos (`grep`, búsqueda semántica)
- TypeScript ayudará a detectar referencias rotas (cambiar tipos)
- Testing completo de todas las pantallas
- Code review cuidadoso

### Riesgo 3: Breaking Changes en Componentes Compartidos

**Severidad**: **MEDIA**

**Descripción**: Componentes que usan Spot podrían romperse si otros desarrolladores no están al tanto.

**Mitigación**:
- Comunicación clara del cambio
- Actualizar todos los componentes en la misma migración
- Documentar cambios en tipos
- Versionado si es posible

### Riesgo 4: Performance en Migración Masiva

**Severidad**: **BAJA**

**Descripción**: Si hay muchos spots, la migración podría ser lenta.

**Mitigación**:
- Migración incremental si es necesario
- Progress indicator si toma mucho tiempo
- Optimizar lógica de migración

### Riesgo 5: Confusión entre Narration (Spot) y Narration (Flow)

**Severidad**: **MEDIA**

**Descripción**: Podría haber confusión entre `Spot.narration` (que se elimina) y `NarrationContext` (que se mantiene).

**Mitigación**:
- Documentación clara de qué se elimina y qué se mantiene
- Comentarios en código explicando diferencia
- Naming claro en código

---

## NOTAS ADICIONALES

### Campos No Documentados en Nuevo Modelo

Algunos campos que están en el modelo actual pero no están explícitamente documentados en el nuevo modelo:

1. **`createdAt` / `updatedAt`**: Recomendación: **MANTENER** para ordenamiento y filtrado
2. **`createdBy`**: Recomendación: **ELIMINAR** si no se necesita ownership, o **MANTENER** si es necesario
3. **`locationRegion`**: Recomendación: **ELIMINAR** estructura completa, pero **EXTRAER** `city` y `country` a `location`

### Compatibilidad con NarrationContext

**IMPORTANTE**: El sistema de narrativas de Flow (`NarrationContext`, `data/narrations.ts`) **NO se elimina**. Solo se elimina el campo `narration` de Spot que se usaba para contenido individual del spot.

### Generación de IA Bajo Demanda

La generación de contenido IA debe ejecutarse **SOLO cuando**:
1. Usuario abre un Spot sin contenido (`hasGeneratedContent === false`)
2. Usuario explícitamente presiona botón "Generate content"

**NO debe ejecutarse**:
- Automáticamente al crear spot
- En background
- Sin consentimiento del usuario

---

## CONCLUSIÓN

Esta migración es significativa y requiere cuidado. El modelo simplificado mejorará la mantenibilidad y claridad del código, pero requiere refactorización extensa.

**Próximos pasos**:
1. Revisar y aprobar este plan
2. Crear branch de migración
3. Ejecutar fase por fase con testing exhaustivo
4. Validar migración con datos reales
5. Deploy gradual si es posible

**Estimación de tiempo**: 3-5 días de desarrollo + 2-3 días de testing y corrección de bugs.

---

**Documento generado**: 2026-01-11  
**Última actualización**: 2026-01-11  
**Estado**: Pendiente de ejecución
