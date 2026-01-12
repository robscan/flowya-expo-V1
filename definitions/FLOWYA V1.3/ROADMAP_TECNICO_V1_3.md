# ROADMAP TÉCNICO — FLOWYA V1.3

**Versión:** FLOWYA V1.3  
**Fecha:** 2026-01-11  
**Estado:** En progreso

---

## PROPÓSITO

Este documento define el roadmap técnico de implementación de FLOWYA V1.3 por fases, marcando explícitamente dependencias y fases bloqueantes.

**Referencias:**
- Decisiones canónicas: `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md`
- Arquitectura: `definitions/FLOWYA V1.3/ARQUITECTURA_V1_3.md`
- Modelo de datos: `definitions/FLOWYA V1.3/MODELO_DATOS_V1_3.md`

---

## VISIÓN GENERAL

### Objetivo V1.3

Convertir FLOWYA de producto local (V1.2) a producto:
- Multi-usuario
- Persistente (server-side)
- Compartible
- Offline-ready

### Fases Principales

1. **Fase 1: Arquitectura de Persistencia** (BLOQUEANTE)
2. **Fase 2: UX y Home Rediseñado**
3. **Fase 3: Sistema de Compartir**
4. **Fase 4: Internacionalización**
5. **Fase 5: Seguridad y Permisos**

---

## FASE 1: ARQUITECTURA DE PERSISTENCIA

**Estado:** Pendiente  
**Duración estimada:** 2-3 semanas  
**Bloqueante:** ✅ SÍ (Fases 2, 3, 5 dependen de esta)

### Objetivos

1. Diseñar y implementar esquema Supabase
2. Migrar datos desde AsyncStorage local
3. Implementar estrategia offline-first
4. Sincronización local ↔ servidor

### Tareas

#### 1.1 Esquema de Base de Datos
- [ ] Crear tablas: `spots`, `pins`, `shared_maps`
- [ ] Definir índices y constraints
- [ ] Implementar Row Level Security (RLS)
- [ ] Crear triggers y funciones necesarias
- **Dependencias:** Ninguna
- **Referencia:** `MODELO_DATOS_V1_3.md` - Parte 2

#### 1.2 Migración desde AsyncStorage
- [ ] Script de migración de pins locales → Supabase
- [ ] Validación de integridad de datos
- [ ] Manejo de errores y rollback
- [ ] Testing con datos reales
- **Dependencias:** 1.1 (esquema debe existir)
- **Referencia:** `MODELO_DATOS_V1_3.md` - Parte 3

#### 1.3 Estrategia Offline-First
- [ ] Cache local en AsyncStorage
- [ ] Queue de operaciones pendientes
- [ ] Sincronización en background
- [ ] Resolución de conflictos (Last-Write-Wins)
- **Dependencias:** 1.1, 1.2
- **Referencia:** `ARQUITECTURA_V1_3.md`, `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-02

#### 1.4 Integración con Contextos
- [ ] Actualizar `SavedContext` para usar Supabase
- [ ] Mantener compatibilidad con código existente
- [ ] Implementar cache local
- [ ] Testing de sincronización
- **Dependencias:** 1.1, 1.2, 1.3
- **Referencia:** `ARQUITECTURA_V1_3.md`

### Criterios de Completitud

- ✅ Esquema Supabase creado y validado
- ✅ Migración de datos funcionando
- ✅ Cache local funcionando
- ✅ Sincronización básica funcionando
- ✅ Testing manual completado

### Dependencias de Otras Fases

- **Fase 2:** Requiere persistencia funcionando
- **Fase 3:** Requiere persistencia y RLS funcionando
- **Fase 5:** Requiere RLS y permisos funcionando

---

## FASE 2: UX Y HOME REDISEÑADO

**Estado:** Pendiente  
**Duración estimada:** 1-2 semanas  
**Bloqueante:** ❌ NO (puede desarrollarse en paralelo con Fase 3)

### Objetivos

1. Rediseñar Home como "estado del viaje"
2. Implementar secciones: Nearby, To Visit, Visited, Discover/Gems
3. Completar comportamiento del Diario
4. Ordenamiento temporal (más reciente → más antiguo)

### Tareas

#### 2.1 Rediseño de Home
- [ ] Estructura de secciones: Nearby, To Visit, Visited, Discover/Gems
- [ ] Comportamiento de cada sección
- [ ] Ordenamiento temporal
- [ ] Transiciones y estados
- **Dependencias:** Fase 1 (para datos de pins)
- **Referencia:** `UX_HOME_V1_3.md`, `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-03

#### 2.2 Comportamiento del Diario
- [ ] Diario siempre visible en Spot Detail
- [ ] Activación automática de estado `visited` al escribir
- [ ] Metadata temporal (`visitedAt`) visible
- [ ] Flujos de usuario completos
- **Dependencias:** Fase 1 (para persistencia)
- **Referencia:** `UX_HOME_V1_3.md`, `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-04

#### 2.3 Integración con Datos
- [ ] Conectar Home con Supabase (pins, spots)
- [ ] Implementar cache local para performance
- [ ] Manejo de estados de carga
- [ ] Testing de UX completa
- **Dependencias:** Fase 1
- **Referencia:** `ARQUITECTURA_V1_3.md`

### Criterios de Completitud

- ✅ Home rediseñado funcionando
- ✅ Todas las secciones implementadas
- ✅ Diario completo funcionando
- ✅ Ordenamiento temporal correcto
- ✅ Testing manual de UX completado

### Dependencias de Otras Fases

- Ninguna (Fase 2 es independiente después de Fase 1)

---

## FASE 3: SISTEMA DE COMPARTIR

**Estado:** Pendiente  
**Duración estimada:** 1-2 semanas  
**Bloqueante:** ❌ NO

### Objetivos

1. Sistema completo para compartir mapas entre usuarios
2. Vista de pines de otro usuario (modo lectura)
3. Diferenciación pines propios vs compartidos
4. Agregar pines compartidos a cuenta propia

### Tareas

#### 3.1 Backend de Compartir
- [ ] Tabla `shared_maps` en Supabase
- [ ] RLS para permisos de compartir
- [ ] API endpoints para compartir/revocar
- [ ] Testing de seguridad
- **Dependencias:** Fase 1 (esquema y RLS)
- **Referencia:** `MODELO_DATOS_V1_3.md`, `SISTEMA_COMPARTIR_V1_3.md`

#### 3.2 UI de Compartir
- [ ] Botón de compartir en Map/Pinned screens
- [ ] Modal de selección de usuarios
- [ ] Vista de mapa compartido (modo lectura)
- [ ] Diferenciación visual pines propios vs compartidos
- **Dependencias:** 3.1 (backend funcionando)
- **Referencia:** `SISTEMA_COMPARTIR_V1_3.md`, `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-05

#### 3.3 Agregar Pines Compartidos
- [ ] Botón "Add to my map" en vista compartida
- [ ] Lógica de copia de pins
- [ ] Manejo de conflictos (pin ya existe)
- [ ] Testing de flujos completos
- **Dependencias:** 3.1, 3.2
- **Referencia:** `SISTEMA_COMPARTIR_V1_3.md`

### Criterios de Completitud

- ✅ Backend de compartir funcionando
- ✅ UI de compartir implementada
- ✅ Vista de mapa compartido funcionando
- ✅ Agregar pines compartidos funcionando
- ✅ Testing de seguridad completado

### Dependencias de Otras Fases

- **Fase 5:** Requiere validación de seguridad

---

## FASE 4: INTERNACIONALIZACIÓN

**Estado:** Pendiente  
**Duración estimada:** 1 semana  
**Bloqueante:** ❌ NO

### Objetivos

1. Arquitectura de traducción (Español e Inglés)
2. Preparación para escalar a más idiomas
3. Traducir UI y world content
4. NO traducir diario del usuario

### Tareas

#### 4.1 Arquitectura i18n
- [ ] Estructura de archivos de traducción
- [ ] Sistema de keys y namespaces
- [ ] Hook de traducción (`useTranslation`)
- [ ] Detección de idioma del dispositivo
- **Dependencias:** Ninguna
- **Referencia:** `INTERNACIONALIZACION_V1_3.md`, `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-06

#### 4.2 Traducciones Iniciales
- [ ] Español (completo)
- [ ] Inglés (completo)
- [ ] UI strings
- [ ] World content (Spots, Flows)
- **Dependencias:** 4.1 (arquitectura)
- **Referencia:** `INTERNACIONALIZACION_V1_3.md`

#### 4.3 Integración en UI
- [ ] Reemplazar strings hardcodeados
- [ ] Testing de traducciones
- [ ] Manejo de strings faltantes
- [ ] Testing en ambos idiomas
- **Dependencias:** 4.1, 4.2
- **Referencia:** `INTERNACIONALIZACION_V1_3.md`

### Criterios de Completitud

- ✅ Arquitectura i18n implementada
- ✅ Español e Inglés completos
- ✅ UI traducida
- ✅ World content traducido
- ✅ Testing en ambos idiomas completado

### Dependencias de Otras Fases

- Ninguna (Fase 4 es independiente)

---

## FASE 5: SEGURIDAD Y PERMISOS

**Estado:** Pendiente  
**Duración estimada:** 1 semana  
**Bloqueante:** ❌ NO (pero recomendado antes de producción)

### Objetivos

1. Análisis completo de riesgos
2. Implementar mitigaciones
3. Validar control de accesos
4. Testing de seguridad

### Tareas

#### 5.1 Análisis de Riesgos
- [ ] Identificar riesgos de seguridad
- [ ] Documentar mitigaciones propuestas
- [ ] Priorizar riesgos (crítico, alto, medio, bajo)
- [ ] Plan de acción para cada riesgo
- **Dependencias:** Ninguna
- **Referencia:** `SEGURIDAD_V1_3.md`

#### 5.2 Implementación de Mitigaciones
- [ ] Validar RLS en Supabase
- [ ] Implementar control de accesos en aplicación
- [ ] Revocación de compartidos
- [ ] Protección de datos de usuario
- **Dependencias:** Fase 1 (RLS), Fase 3 (compartir)
- **Referencia:** `SEGURIDAD_V1_3.md`

#### 5.3 Testing de Seguridad
- [ ] Testing de aislamiento entre cuentas
- [ ] Testing de permisos de compartir
- [ ] Testing de revocación
- [ ] Penetration testing básico
- **Dependencias:** 5.1, 5.2
- **Referencia:** `SEGURIDAD_V1_3.md`

### Criterios de Completitud

- ✅ Análisis de riesgos completado
- ✅ Mitigaciones implementadas
- ✅ Testing de seguridad completado
- ✅ Documentación de seguridad actualizada

### Dependencias de Otras Fases

- Ninguna (Fase 5 es validación final)

---

## DIAGRAMA DE DEPENDENCIAS

```
Fase 1: Arquitectura de Persistencia (BLOQUEANTE)
  │
  ├──> Fase 2: UX y Home Rediseñado
  │
  ├──> Fase 3: Sistema de Compartir
  │     │
  │     └──> Fase 5: Seguridad y Permisos
  │
  └──> Fase 5: Seguridad y Permisos

Fase 4: Internacionalización (INDEPENDIENTE)
```

### Fases Bloqueantes

- **Fase 1:** ✅ BLOQUEANTE (Fases 2, 3, 5 dependen de esta)
- **Fase 2:** ❌ NO bloqueante
- **Fase 3:** ❌ NO bloqueante (pero Fase 5 recomienda validar seguridad)
- **Fase 4:** ❌ NO bloqueante (independiente)
- **Fase 5:** ❌ NO bloqueante (pero recomendado antes de producción)

---

## ORDEN DE EJECUCIÓN RECOMENDADO

1. **Fase 1** (BLOQUEANTE) - Debe completarse primero
2. **Fase 2 y Fase 3** (en paralelo) - Pueden desarrollarse simultáneamente
3. **Fase 4** (independiente) - Puede desarrollarse en cualquier momento
4. **Fase 5** (validación) - Debe completarse antes de producción

---

## ESTIMACIONES DE TIEMPO

| Fase | Duración | Dependencias |
|------|----------|--------------|
| Fase 1 | 2-3 semanas | Ninguna |
| Fase 2 | 1-2 semanas | Fase 1 |
| Fase 3 | 1-2 semanas | Fase 1 |
| Fase 4 | 1 semana | Ninguna |
| Fase 5 | 1 semana | Fase 1, Fase 3 |
| **Total** | **6-9 semanas** | |

**Nota:** Estimaciones asumen desarrollo a tiempo completo. Ajustar según disponibilidad del equipo.

---

## CRITERIOS DE COMPLETITUD GENERAL

### V1.3 Lista para Producción

- ✅ Todas las fases completadas
- ✅ Testing manual completado
- ✅ Documentación actualizada
- ✅ Migración de datos validada
- ✅ Seguridad validada (Fase 5)
- ✅ Performance aceptable
- ✅ Offline-first funcionando correctamente

---

**Última actualización:** 2026-01-11  
**Estado:** Roadmap inicial definido
