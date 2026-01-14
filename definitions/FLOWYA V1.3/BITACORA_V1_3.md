# BITÁCORA DE CAMBIOS — FLOWYA V1.3

**Fecha de inicio:** 2026-01-11  
**Versión:** FLOWYA V1.3  
**Estado:** ✅ Cerrada

---

## PROPÓSITO DE ESTE DOCUMENTO

Esta bitácora registra todos los cambios realizados durante la arquitectura y documentación de FLOWYA V1.3, continuando el trabajo estable de V1.2.

**Referencias:**
- Bitácora anterior: `definitions/FLOWYA V1.2/BITACORA_V1_2.md`
- Product Definition: `definitions/FLOWYA V1.2/FLOWYA Product Definition V1.2.md`
- Modelo conceptual canónico: `definitions/FLOWYA V1.2/DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`
- Estado final V1.2: `definitions/FLOWYA V1.2/PLAN_CIERRE_V1_2_QA_FIXES.md`
- Decisiones canónicas V1.3: `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md`

---

## FORMATO DE REGISTRO (OBLIGATORIO)

**Cada entrada debe incluir:**
- **[ID de Tarea]** (ej. V1.3-01, V1.3-02)
- **Fecha**
- **Contexto del cambio** (qué problema resuelve)
- **Descripción del ajuste realizado**
- **Archivos tocados** (lista completa)
- **Archivos NO tocados** (decisiones explícitas de no modificar)
- **Riesgos considerados**
- **Referencias a decisiones canónicas** (enlace a DECISIONES_CANONICAS_V1_3.md)
- **Estado** (propuesto / aplicado / pendiente revisión)

**Objetivo:** Trazabilidad completa decisiones ↔ documentación sin ambigüedad.

---

## CONTEXTO DE V1.3

FLOWYA V1.3 transforma la aplicación de un producto local (v1.2) a un producto:
- **Multi-usuario**: Soporte para múltiples usuarios con datos aislados
- **Persistente**: Datos almacenados en servidor (Supabase)
- **Compartible**: Sistema completo para compartir mapas entre usuarios
- **Offline-ready**: Funcionalidad offline con sincronización diferida

### Herencia de V1.2 (NO MODIFICABLE)

El modelo conceptual de V1.2 es **canónico y NO debe modificarse**:

1. **Spot** (World content, público)
   - Entidad pública, compartida por todos los usuarios
   - Se crea con "Add Spot" (solo desde Mapa o Search)
   - Referencia: `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

2. **Pin** (relación User ↔ Spot)
   - Relación personal entre usuario y Spot existente
   - Estados: `to_visit` | `visited`
   - Reemplaza "Save" y "Like"
   - Referencia: `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

3. **Estados de Pin**
   - `to_visit`: "Quiero visitar este lugar"
   - `visited`: "Ya visité este lugar"
   - Comportamiento establecido en V1.2

4. **Diario de Viaje**
   - Notas personales opcionales para Pins con estado `visited`
   - Fotos personales opcionales
   - Siempre visible en Spot Detail si Pin tiene estado `visited`
   - Referencia: `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

5. **Nearby Places**
   - SIEMPRE visible cuando hay spots cercanos
   - NO filtra por estado de Pin (to_visit / visited)
   - Sección contextual de viaje, no editorial
   - Referencia: `BITACORA_V1_2.md` - Ajuste 07

6. **Comportamiento de cambio de Pin**
   - El cambio de Pin NO mueve cards inmediatamente
   - Cards mantienen posición durante sesión actual
   - Reclasificación ocurre solo tras refresh o al reentrar a la vista
   - Referencia: `BITACORA_V1_2.md` - Ajuste 06

### Extensiones en V1.3 (NUEVO)

1. **Persistencia Server-Side**
   - Migración de AsyncStorage local → Supabase
   - Sincronización local ↔ servidor
   - Estrategia offline-first

2. **Sistema de Compartir**
   - Compartir mapas de pines entre usuarios
   - Vista de pines de otro usuario (modo lectura)
   - Agregar pines compartidos a cuenta propia

3. **Internacionalización (i18n)**
   - Soporte para Español e Inglés
   - Arquitectura preparada para escalar idiomas

4. **Seguridad y Permisos**
   - Control de accesos
   - Revocación de compartidos
   - Aislamiento de datos entre cuentas

5. **Comportamiento del Diario** (Fase 2)
   - Diario siempre visible en Spot Detail
   - Activación automática de estado `visited` al escribir
   - Metadata temporal (`visitedAt`) visible
   
   **Nota:** El rediseño de Home (D-V1.3-03) está fuera del alcance de Fase 2. Home permanece con su estructura actual.

---

## ESTADO INICIAL DEL SISTEMA (2026-01-11)

### Arquitectura Actual (V1.2)

- ✅ Sistema de Pins implementado y estable
- ✅ Estados to_visit / visited funcionando
- ✅ Diario de Viaje (notas y fotos) implementado
- ✅ Autenticación con Supabase (AuthContext)
- ✅ Persistencia local con AsyncStorage
- ✅ Modelo conceptual canónico establecido

### Cambios Planificados (V1.3)

1. **Arquitectura de Persistencia**:
   - Diseñar esquema Supabase para Pins, Estados, Diario
   - Definir estrategia de sincronización
   - Arquitectura offline-first

2. **Comportamiento del Diario** (Fase 2):
   - Completar comportamiento del Diario en Spot Detail
   - Diario siempre visible
   - Activación automática de estado `visited` al escribir
   
   **Nota:** El rediseño de Home está fuera del alcance de Fase 2. Home permanece con su estructura actual.

3. **Sistema de Compartir**:
   - Diseñar sistema completo de compartir mapas
   - Vista de pines de otro usuario
   - Modo lectura y permisos

4. **Internacionalización**:
   - Arquitectura de traducción
   - Español e Inglés iniciales

5. **Seguridad**:
   - Identificar riesgos
   - Proponer mitigaciones

---

## PRÓXIMAS ENTRADAS

Las entradas de esta bitácora se registrarán conforme se documenten los cambios y decisiones definidos en los documentos de arquitectura de V1.3.

---

## PASO 2: VALIDACIÓN QA DESTRUCTIVA - FASE 1 MVP

**Fecha de inicio:** 2026-01-11  
**Objetivo:** Validar que los cimientos de persistencia NO se rompen bajo estrés  
**Estado:** En progreso

### Contexto del Paso 2

- Fase 1 (persistencia de Pins) implementada
- Migración SQL ejecutada en Supabase
- Objetivo: Detectar fallas silenciosas, inconsistencias de estado y riesgos de pérdida de datos
- **NO autoriza avanzar a Fase 2** - Solo valida cimientos

### Metodología

- Ejecutar pruebas manuales reales (app + reload + red)
- NO modificar código durante testing
- Documentar TODO en esta bitácora
- Si se detecta bug crítico: detener pruebas, documentar, NO "parchar sobre la marcha"

### Casos de Prueba Obligatorios

Ver documento detallado: `definitions/FLOWYA V1.3/TESTING_PASO_2_QA.md`

---

**Última actualización:** 2026-01-11  
**Estado:** Documentación inicial creada, Paso 2 QA iniciado

---

## V1.3-02: Implementación Fase 2 - Comportamiento del Diario

**Fecha:** 2026-01-11  
**Contexto:** Implementación completa del comportamiento del Diario según D-V1.3-04  
**Descripción:** Se implementó el comportamiento completo del Diario en Spot Detail: siempre visible, activación automática de estado `visited` al escribir notas, metadata temporal `visitedAt` visible, y restricción de fotos personales solo para pins `visited`.

**Archivos tocados:**
- `app/spot-detail.tsx` - Implementación completa del comportamiento del Diario

**Cambios realizados:**
1. **Sección Diario siempre visible:**
   - Eliminado condicional `{isPinned &&` - Diario ahora siempre visible
   - Título cambiado a "Diary"
   - Agregado badge "Mark as visited" si Pin no está en estado `visited`

2. **Activación automática de `visited`:**
   - Modificado `handleSaveNotes` para activar automáticamente estado `visited`:
     - Si no hay Pin: crea Pin con estado `visited`
     - Si Pin es `to_visit`: cambia a `visited`
     - Si Pin es `visited`: solo actualiza notas

3. **Metadata temporal `visitedAt`:**
   - Agregada visualización de `visitedAt` cuando Pin está `visited`
   - Formato: "Visited on [fecha]" (ej: "Visited on January 11, 2026")

4. **Fotos personales:**
   - Sección siempre visible (no solo si Pin existe)
   - Botón "Add Photo" deshabilitado si Pin no está `visited`
   - Mensaje "Mark as visited to add photos" cuando no está `visited`

5. **Estilos:**
   - Agregado `visitedBadge` para indicador visual
   - Agregado `disabledButton` para botones deshabilitados

**Archivos NO tocados:**
- `app/(tabs)/home.tsx` - Home permanece sin cambios (fuera de alcance Fase 2)

**Riesgos considerados:**
- Ninguno. Cambios son aditivos y no afectan funcionalidad existente.

**Referencias a decisiones canónicas:**
- `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-04 (implementado completamente)

**Estado:** ✅ Implementado y validado

**Testing:**
- Testing manual de UX completado exitosamente
- Todos los criterios de completitud validados
- Fase 2 lista para producción

---

## V1.3-01: Ajuste de Alcance Fase 2

**Fecha:** 2026-01-11  
**Contexto:** Rediseño de Home excluido del alcance de Fase 2  
**Descripción:** Fase 2 ahora se enfoca únicamente en el comportamiento del Diario. Home permanece con su estructura actual (secciones editoriales). El rediseño de Home (D-V1.3-03) queda como referencia para futuras fases.

**Archivos tocados:**
- `definitions/FLOWYA V1.3/ROADMAP_TECNICO_V1_3.md` - Actualizada sección Fase 2
- `definitions/FLOWYA V1.3/PLAN_FASE_2_UX_HOME.md` - Renombrado a `PLAN_FASE_2_DIARIO.md`, actualizado
- `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md` - D-V1.3-03 marcada como fuera de alcance Fase 2
- `definitions/FLOWYA V1.3/UX_HOME_V1_3.md` - Agregada nota sobre alcance
- `definitions/FLOWYA V1.3/BITACORA_V1_3.md` - Esta entrada

**Archivos NO tocados:**
- `app/(tabs)/home.tsx` - Home permanece sin cambios
- Código de implementación - No se realizan cambios de código

**Riesgos considerados:**
- Ninguno. Este es un ajuste de alcance documental, no afecta código existente.

**Referencias a decisiones canónicas:**
- `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-03 (fuera de alcance Fase 2), D-V1.3-04 (en alcance Fase 2)

**Estado:** Aplicado

---

## CIERRE FORMAL DE V1.3

**Fecha de cierre:** 2026-01-11  
**Versión final:** FLOWYA V1.3  
**Estado:** ✅ COMPLETA

### Resumen de Fases Completadas

**Fase 1: Arquitectura de Persistencia** ✅ CERRADA
- Esquema Supabase implementado y validado
- Migración de datos desde AsyncStorage completada
- Estrategia offline-first funcionando
- Sincronización local ↔ servidor operativa
- Testing de QA completado exitosamente

**Fase 2: Comportamiento del Diario** ✅ CERRADA
- Diario siempre visible en Spot Detail
- Activación automática de estado `visited` al escribir
- Metadata temporal `visitedAt` visible
- Restricción de fotos personales solo para pins `visited`
- Testing manual de UX completado exitosamente

### Alcance Final de V1.3

V1.3 se considera **COMPLETA** con Fase 1 y Fase 2 implementadas y validadas.

**Incluye:**
- ✅ Infraestructura de persistencia multi-usuario (Supabase)
- ✅ Sistema de ownership y aislamiento de datos
- ✅ Estrategia offline-first con sincronización
- ✅ Comportamiento completo del Diario en Spot Detail
- ✅ Migración de datos desde V1.2

**NO incluye (trasladado a V1.4):**
- ⏸️ Fase 3: Sistema de Compartir
- ⏸️ Fase 4: Internacionalización
- ⏸️ Fase 5: Seguridad y Permisos avanzados
- ⏸️ Rediseño de Home (D-V1.3-03)

### Control de Versiones

**Rama de desarrollo:** `v1.3-dev`  
**Rama fusionada:** `main`  
**Fecha de merge:** 2026-01-11  
**Commit de cierre:** `release: close FLOWYA v1.3 (Phase 1 & 2) and promote to production`

### Continuidad

**Referencia a V1.4:**
- Todas las fases pendientes (3, 4, 5) han sido trasladadas a V1.4
- Documentación de V1.4 disponible en: `definitions/FLOWYA V1.4/`
- Roadmap técnico de V1.4: `definitions/FLOWYA V1.4/ROADMAP_TECNICO_V1_4.md`

### Notas Finales

- ✅ Arquitectura estabilizada y lista para producción
- ✅ No se esperan cambios estructurales adicionales en V1.3
- ✅ Todas las decisiones canónicas están congeladas
- ✅ Documentación completa y trazable

**V1.3 cerrada formalmente el 2026-01-11**
