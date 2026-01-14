# ROADMAP TÉCNICO — FLOWYA V1.4

**Versión:** FLOWYA V1.4  
**Fecha:** 2026-01-11  
**Estado:** En progreso

---

## PROPÓSITO

Este documento define el roadmap técnico de implementación de FLOWYA V1.4 por fases, continuando el trabajo de V1.3.

**Referencias:**
- Cierre de V1.3: `definitions/FLOWYA V1.3/CIERRE_VERSION_V1_3.md`
- Decisiones canónicas: `definitions/FLOWYA V1.4/DECISIONES_CANONICAS_V1_4.md`
- Arquitectura: `definitions/FLOWYA V1.4/ARQUITECTURA_V1_4.md`
- Modelo de datos: `definitions/FLOWYA V1.4/MODELO_DATOS_V1_4.md`

---

## VISIÓN GENERAL

### Objetivo V1.4

V1.4 implementa las fases pendientes de V1.3:
- Sistema de Compartir completo
- Internacionalización (i18n)
- Seguridad y Permisos avanzados

### Herencia de V1.3

V1.4 hereda completamente:
- ✅ Fase 1: Arquitectura de Persistencia (completada en V1.3)
- ✅ Fase 2: Comportamiento del Diario (completada en V1.3)
- ✅ Arquitectura base estable
- ✅ Todas las decisiones canónicas de V1.3

**Referencia:** `definitions/FLOWYA V1.3/CIERRE_VERSION_V1_3.md`

### Fases Principales

1. **Fase 3: Sistema de Compartir** (trasladada desde V1.3)
2. **Fase 4: Internacionalización** (trasladada desde V1.3)
3. **Fase 5: Seguridad y Permisos** (trasladada desde V1.3)

---

## FASE 3: SISTEMA DE COMPARTIR

**Estado:** Pendiente  
**Duración estimada:** 1-2 semanas  
**Bloqueante:** ❌ NO  
**Origen:** Trasladada desde V1.3

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
- **Dependencias:** Fase 1 de V1.3 (esquema y RLS ya implementados)
- **Referencia:** `MODELO_DATOS_V1_4.md`, `SISTEMA_COMPARTIR_V1_4.md`

#### 3.2 UI de Compartir
- [ ] Botón de compartir en Map/Pinned screens
- [ ] Modal de selección de usuarios
- [ ] Vista de mapa compartido (modo lectura)
- [ ] Diferenciación visual pines propios vs compartidos
- **Dependencias:** 3.1 (backend funcionando)
- **Referencia:** `SISTEMA_COMPARTIR_V1_4.md`, `DECISIONES_CANONICAS_V1_4.md` - D-V1.3-05 (heredada)

#### 3.3 Agregar Pines Compartidos
- [ ] Botón "Add to my map" en vista compartida
- [ ] Lógica de copia de pins
- [ ] Manejo de conflictos (pin ya existe)
- [ ] Testing de flujos completos
- **Dependencias:** 3.1, 3.2
- **Referencia:** `SISTEMA_COMPARTIR_V1_4.md`

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
**Origen:** Trasladada desde V1.3

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
- **Referencia:** `INTERNACIONALIZACION_V1_4.md`, `DECISIONES_CANONICAS_V1_4.md` - D-V1.3-06 (heredada)

#### 4.2 Traducciones Iniciales
- [ ] Español (completo)
- [ ] Inglés (completo)
- [ ] UI strings
- [ ] World content (Spots, Flows)
- **Dependencias:** 4.1 (arquitectura)
- **Referencia:** `INTERNACIONALIZACION_V1_4.md`

#### 4.3 Integración en UI
- [ ] Reemplazar strings hardcodeados
- [ ] Testing de traducciones
- [ ] Manejo de strings faltantes
- [ ] Testing en ambos idiomas
- **Dependencias:** 4.1, 4.2
- **Referencia:** `INTERNACIONALIZACION_V1_4.md`

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
**Origen:** Trasladada desde V1.3

### Objetivos

1. Análisis completo de riesgos
2. Implementar mitigaciones
3. Validar control de accesos
4. Auditoría de seguridad

### Tareas

#### 5.1 Análisis de Riesgos
- [ ] Identificar vulnerabilidades
- [ ] Evaluar riesgos de datos
- [ ] Evaluar riesgos de autenticación
- [ ] Documentar mitigaciones propuestas
- **Dependencias:** Ninguna
- **Referencia:** `SEGURIDAD_V1_4.md`

#### 5.2 Implementación de Mitigaciones
- [ ] Implementar mitigaciones críticas
- [ ] Validar RLS existente
- [ ] Testing de seguridad
- [ ] Documentar cambios
- **Dependencias:** 5.1 (análisis)
- **Referencia:** `SEGURIDAD_V1_4.md`

#### 5.3 Auditoría de Seguridad
- [ ] Revisión completa de permisos
- [ ] Validación de aislamiento de datos
- [ ] Testing de penetración básico
- [ ] Documentación de hallazgos
- **Dependencias:** 5.1, 5.2
- **Referencia:** `SEGURIDAD_V1_4.md`

### Criterios de Completitud

- ✅ Análisis de riesgos completado
- ✅ Mitigaciones implementadas
- ✅ Control de accesos validado
- ✅ Auditoría de seguridad completada
- ✅ Documentación de seguridad actualizada

### Dependencias de Otras Fases

- **Fase 3:** Requiere validación de seguridad del sistema de compartir

---

## ORDEN DE EJECUCIÓN

### Fases Independientes

- **Fase 4** puede desarrollarse en paralelo con Fase 3
- **Fase 5** debe ejecutarse después de Fase 3 (valida seguridad de compartir)

### Recomendación

1. **Fase 3** primero (Sistema de Compartir)
2. **Fase 4** en paralelo o después (Internacionalización)
3. **Fase 5** al final (Seguridad y Permisos)

---

## ESTIMACIONES

| Fase | Duración | Dependencias |
|------|----------|--------------|
| Fase 3 | 1-2 semanas | Fase 1 (V1.3) |
| Fase 4 | 1 semana | Ninguna |
| Fase 5 | 1 semana | Fase 3 |

**Total estimado:** 3-4 semanas

---

## CRITERIOS DE COMPLETITUD GENERAL

Al finalizar V1.4, se debe cumplir:

- ✅ Todas las fases implementadas
- ✅ Testing completo de todas las funcionalidades
- ✅ Documentación actualizada
- ✅ Seguridad validada (Fase 5)
- ✅ Internacionalización funcionando (Fase 4)
- ✅ Sistema de compartir completo (Fase 3)

---

**Última actualización:** 2026-01-11  
**Estado:** Roadmap inicial definido, fases trasladadas desde V1.3
