---
name: FLOWYA v1.3 - Arquitectura y Documentación
overview: Crear estructura completa de documentación para FLOWYA v1.3, estableciendo arquitectura de persistencia multi-usuario, UX mejorada, sistema de compartir, i18n y seguridad, manteniendo el modelo conceptual canónico de v1.2.
todos:
  - id: create-branch
    content: Crear rama v1.3-docs desde estado final de v1.2
    status: pending
  - id: create-folder
    content: Crear carpeta definitions/FLOWYA V1.3/
    status: pending
  - id: bitacora
    content: Crear BITACORA_V1_3.md con referencias a v1.2
    status: pending
  - id: arquitectura
    content: Crear ARQUITECTURA_V1_3.md con diagramas y estrategias
    status: pending
  - id: modelo-datos
    content: Crear MODELO_DATOS_V1_3.md con esquemas Supabase
    status: pending
  - id: roadmap
    content: Crear ROADMAP_TECNICO_V1_3.md por fases
    status: pending
  - id: decisiones
    content: Crear DECISIONES_CANONICAS_V1_3.md con trazabilidad
    status: pending
  - id: ux-home
    content: Crear UX_HOME_V1_3.md con rediseño completo
    status: pending
  - id: compartir
    content: Crear SISTEMA_COMPARTIR_V1_3.md con diseño completo
    status: pending
  - id: i18n
    content: Crear INTERNACIONALIZACION_V1_3.md con arquitectura
    status: pending
  - id: seguridad
    content: Crear SEGURIDAD_V1_3.md con análisis de riesgos
    status: pending
  - id: privacidad-terminos
    content: Crear PRIVACIDAD_TERMINOS_V1_3.md con políticas de privacidad y términos de uso
    status: pending
  - id: referencias
    content: Crear REFERENCIAS_V1_2.md con mapeo de documentos
    status: pending
---

# Plan de Arquitectura y Documentación FLOWYA v1.3

## Contexto y Restricciones

### Estado de v1.2 (Congelada)
- v1.2 está cerrada como versión local estable tras testing manual
- Documentación canónica en `definitions/FLOWYA V1.2/`
- Modelo conceptual heredado NO debe modificarse:
  - Spot (World content, público)
  - Pin (relación User ↔ Spot)
  - Estados: to_visit / visited
  - Diario como extensión de visited
  - Nearby Places siempre visible cuando hay spots cercanos
  - El cambio de Pin NO mueve cards inmediatamente (UX estable)

### Control de Versión
- Crear nueva rama: `v1.3-docs` o `v1.3-architecture`
- Documentación EXCLUSIVAMENTE en esta rama
- NO realizar cambios de código productivo
- v1.2 debe permanecer congelada

## Objetivo v1.3

Convertir FLOWYA en un producto:
- Multi-usuario
- Persistente (server-side)
- Compartible
- Offline-ready

Manteniendo claridad de modelo y UX lograda en v1.2.

## Estructura de Documentación a Crear

### 1. Carpeta Base
- `definitions/FLOWYA V1.3/` (nueva carpeta)

### 2. Documentos Principales

#### 2.1 BITACORA_V1_3.md
- Referenciar explícitamente decisiones heredadas de v1.2
- Indicar qué se mantiene, qué se extiende y qué es nuevo
- Referencias cruzadas a documentos clave de v1.2
- Formato similar a BITACORA_V1_2.md

#### 2.2 ARQUITECTURA_V1_3.md
- Arquitectura general del sistema v1.3
- Diagramas de flujo de datos
- Arquitectura de persistencia (Supabase)
- Estrategia offline-first
- Sincronización local ↔ servidor
- Resolución de conflictos

#### 2.3 MODELO_DATOS_V1_3.md
- **Separación explícita:**
  - Modelo conceptual (entidades, relaciones, conceptos)
  - Implementación Supabase (tablas, esquemas, SQL)
- Ownership y permisos
- Relaciones entre entidades
- Migración desde v1.2 (local) a v1.3 (server)

#### 2.4 ROADMAP_TECNICO_V1_3.md
- Roadmap por fases
- Fase 1: Arquitectura de persistencia
- Fase 2: Comportamiento del Diario (rediseño de Home fuera de alcance)
- Fase 3: Sistema de compartir
- Fase 4: Internacionalización
- Fase 5: Seguridad y permisos
- **Dependencias entre fases marcadas explícitamente**
- **Fases bloqueantes identificadas**
- Estimaciones de tiempo

#### 2.5 DECISIONES_CANONICAS_V1_3.md
- **ÚNICA FUENTE DE VERDAD para decisiones**
- Decisiones de producto explícitas
- Decisiones técnicas
- Trazabilidad a v1.2
- Trade-offs considerados
- Alternativas evaluadas y descartadas
- Justificaciones técnicas y de producto
- **Otros documentos solo referencian este documento**

#### 2.6 UX_HOME_V1_3.md
- **Enfoque en comportamiento y estructura, NO diseño visual final**
- Rediseño de Home como "estado del viaje" (fuera de alcance Fase 2, referencia futura)
- Secciones: Nearby, To Visit, Visited, Discover/Gems (futuro)
- Comportamiento del Diario completo (en alcance Fase 2)
- Ordenamiento y filtrado
- Transiciones y estados
- Flujos de usuario y lógica de interacción

#### 2.7 SISTEMA_COMPARTIR_V1_3.md
- Diseño completo del sistema de compartir
- Vista de pines de otro usuario
- Modo lectura
- Diferenciación pines propios vs compartidos
- Agregar pines compartidos a cuenta propia
- Reglas de seguridad y permisos

#### 2.8 INTERNACIONALIZACION_V1_3.md
- Arquitectura de traducción
- Español e Inglés
- Preparación para escalar idiomas
- Qué se traduce (UI, world content) y qué NO (diario usuario)
- Estructura de archivos de traducción

#### 2.9 SEGURIDAD_V1_3.md
- Riesgos identificados
- Mitigaciones propuestas
- Control de accesos
- Revocación de compartidos
- Protección de datos de usuario
- Aislamiento entre cuentas

#### 2.10 PRIVACIDAD_TERMINOS_V1_3.md
- Políticas de privacidad
- Datos personales recopilados
- Manejo de datos personales
- Términos de uso (datos persistentes en servidor)
- Cumplimiento legal (GDPR, CCPA, etc.)
- Derechos del usuario
- Compartir y terceros

#### 2.11 REFERENCIAS_V1_2.md
- Documentos heredados de v1.2
- Documentos extendidos en v1.3
- Documentos nuevos en v1.3
- Mapeo de decisiones v1.2 → v1.3

## Archivos Clave de Referencia v1.2

### Documentos Canónicos a Referenciar
- `definitions/FLOWYA V1.2/BITACORA_V1_2.md` - Decisiones y cambios
- `definitions/FLOWYA V1.2/DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md` - Modelo conceptual
- `definitions/FLOWYA V1.2/FLOWYA Product Definition V1.2.md` - Definición de producto
- `definitions/FLOWYA V1.2/PLAN_CIERRE_V1_2_QA_FIXES.md` - Estado final

### Código de Referencia
- `contexts/SavedContext.tsx` - Sistema de Pins actual
- `contexts/AuthContext.tsx` - Autenticación actual (Supabase)
- `contexts/SpotContext.tsx` - Gestión de Spots
- `data/spots.ts` - Modelo de Spot

## Tareas de Implementación

### Tarea 1: Crear Rama y Estructura
1. Crear rama `v1.3-docs` desde estado final de v1.2
2. Crear carpeta `definitions/FLOWYA V1.3/`
3. Verificar que v1.2 no se modifica

### Tarea 2: BITACORA_V1_3.md
1. Inicializar bitácora con formato similar a v1.2
2. Sección de contexto heredado de v1.2
3. Referencias cruzadas explícitas
4. Template para futuras entradas

### Tarea 3: ARQUITECTURA_V1_3.md
1. Diagrama de arquitectura general
2. Arquitectura de persistencia (Supabase)
3. Estrategia offline-first
4. Flujo de sincronización
5. Resolución de conflictos

### Tarea 4: MODELO_DATOS_V1_3.md
1. **Sección 1: Modelo Conceptual** (entidades, relaciones, conceptos)
2. **Sección 2: Implementación Supabase** (tablas, esquemas, SQL)
3. Ownership y permisos
4. Relaciones y foreign keys
5. Plan de migración desde AsyncStorage

### Tarea 5: ROADMAP_TECNICO_V1_3.md
1. Desglose por fases
2. **Dependencias entre fases marcadas explícitamente**
3. **Fases bloqueantes identificadas claramente**
4. Estimaciones
5. Criterios de completitud por fase

### Tarea 6: DECISIONES_CANONICAS_V1_3.md
1. **Establecer como ÚNICA FUENTE DE VERDAD**
2. Decisiones de producto
3. Decisiones técnicas
4. Trazabilidad a v1.2
5. Trade-offs documentados
6. **Otros documentos referencian este documento, no duplican decisiones**

### Tarea 7: UX_HOME_V1_3.md
1. **Enfoque en comportamiento y estructura, NO diseño visual**
2. Rediseño de Home (fuera de alcance Fase 2, referencia futura)
3. Comportamiento de secciones (futuro)
4. Diario completo (en alcance Fase 2)
5. Flujos de usuario y lógica de interacción

### Tarea 8: SISTEMA_COMPARTIR_V1_3.md
1. Diseño completo del feature
2. Flujos de usuario
3. Reglas de seguridad
4. Permisos y revocación

### Tarea 9: INTERNACIONALIZACION_V1_3.md
1. Arquitectura i18n
2. Estructura de archivos
3. Alcance de traducción
4. Preparación para escalar

### Tarea 10: SEGURIDAD_V1_3.md
1. Análisis de riesgos
2. Mitigaciones
3. Control de accesos
4. Protección de datos

### Tarea 11: PRIVACIDAD_TERMINOS_V1_3.md
1. Políticas de privacidad
2. Datos personales recopilados
3. Manejo de datos personales
4. Términos de uso (persistencia en servidor)
5. Cumplimiento legal (GDPR, CCPA)

### Tarea 12: REFERENCIAS_V1_2.md
1. Mapeo de documentos
2. Herencia vs extensión vs nuevo
3. Índice de referencias cruzadas

## Criterios de Completitud

### Documentación Completa
- ✅ Todos los documentos principales creados
- ✅ Referencias cruzadas funcionando
- ✅ Trazabilidad a v1.2 establecida
- ✅ Decisiones canónicas documentadas

### Calidad
- ✅ Claridad y precisión
- ✅ Diagramas donde sea útil
- ✅ Ejemplos concretos
- ✅ Sin ambigüedades

### Organización
- ✅ Estructura clara de carpetas
- ✅ Naming consistente
- ✅ Índices y referencias
- ✅ Fácil navegación

## Restricciones Importantes

1. NO modificar código productivo
2. NO modificar documentación de v1.2
3. NO hacer refactors
4. NO mezclar documentación entre versiones
5. Priorizar claridad, trazabilidad y escalabilidad

## Próximos Pasos Después del Plan

1. Usuario revisa y aprueba plan
2. Crear rama `v1.3-docs`
3. Crear estructura de carpetas
4. Generar documentos uno por uno
5. Validar referencias cruzadas
6. Revisión final de completitud

---

## Estado Final de la Versión

**Fecha de cierre:** 2026-01-11  
**Versión:** FLOWYA V1.3  
**Estado:** ✅ COMPLETA

### Confirmación de Estabilización

- ✅ **Arquitectura estabilizada:** No se esperan cambios estructurales adicionales en V1.3
- ✅ **Fase 1 completada:** Arquitectura de Persistencia implementada y validada
- ✅ **Fase 2 completada:** Comportamiento del Diario implementado y validado
- ✅ **Documentación completa:** Todos los documentos principales actualizados y cerrados

### Referencia a V1.4

Las expansiones y fases pendientes (Fases 3, 4, 5) han sido trasladadas a V1.4:
- Ver `definitions/FLOWYA V1.4/PLAN_ARQUITECTURA_V1_4.md` para continuidad
- Ver `definitions/FLOWYA V1.4/ROADMAP_TECNICO_V1_4.md` para roadmap de V1.4

### Notas Finales

- Arquitectura base de V1.3 queda como fundamento estable para V1.4
- Todas las decisiones arquitectónicas están documentadas y congeladas
- No se aceptan cambios estructurales adicionales en esta versión
