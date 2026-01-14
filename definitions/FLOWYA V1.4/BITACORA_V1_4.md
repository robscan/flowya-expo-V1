# BITÁCORA DE CAMBIOS — FLOWYA V1.4

**Fecha de inicio:** 2026-01-11  
**Versión:** FLOWYA V1.4  
**Estado:** En progreso

---

## PROPÓSITO DE ESTE DOCUMENTO

Esta bitácora registra todos los cambios realizados durante la arquitectura y documentación de FLOWYA V1.4, continuando el trabajo estable de V1.3.

**Referencias:**
- Bitácora anterior: `definitions/FLOWYA V1.3/BITACORA_V1_3.md`
- Cierre de V1.3: `definitions/FLOWYA V1.3/CIERRE_VERSION_V1_3.md`
- Product Definition: `definitions/FLOWYA V1.2/FLOWYA Product Definition V1.2.md`
- Modelo conceptual canónico: `definitions/FLOWYA V1.2/DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`
- Decisiones canónicas V1.4: `definitions/FLOWYA V1.4/DECISIONES_CANONICAS_V1_4.md`

---

## FORMATO DE REGISTRO (OBLIGATORIO)

**Cada entrada debe incluir:**
- **[ID de Tarea]** (ej. V1.4-01, V1.4-02)
- **Fecha**
- **Contexto del cambio** (qué problema resuelve)
- **Descripción del ajuste realizado**
- **Archivos tocados** (lista completa)
- **Archivos NO tocados** (decisiones explícitas de no modificar)
- **Riesgos considerados**
- **Referencias a decisiones canónicas** (enlace a DECISIONES_CANONICAS_V1_4.md)
- **Estado** (propuesto / aplicado / pendiente revisión)

**Objetivo:** Trazabilidad completa decisiones ↔ documentación sin ambigüedad.

---

## CONTEXTO DE V1.4

FLOWYA V1.4 continúa el desarrollo de V1.3, implementando las fases pendientes:
- **Sistema de Compartir**: Sistema completo para compartir mapas entre usuarios
- **Internacionalización**: Soporte multi-idioma (Español e Inglés)
- **Seguridad y Permisos**: Análisis y mitigaciones avanzadas

### Herencia de V1.3 (NO MODIFICABLE)

V1.4 hereda completamente de V1.3:
- ✅ Arquitectura de persistencia multi-usuario (Supabase)
- ✅ Sistema de ownership y aislamiento de datos
- ✅ Estrategia offline-first con sincronización
- ✅ Comportamiento del Diario en Spot Detail
- ✅ Todas las decisiones canónicas de V1.3

**Referencia:** `definitions/FLOWYA V1.3/CIERRE_VERSION_V1_3.md`

### Extensiones en V1.4 (NUEVO)

1. **Sistema de Compartir Completo**
   - Tabla `shared_maps` en Supabase
   - Modal de selección de usuarios
   - Diferenciación visual de pines propios vs compartidos
   - Botón "Add to my map" en vista compartida
   - Sistema de permisos y revocación

2. **Internacionalización (i18n)**
   - Arquitectura de traducción
   - Soporte para Español e Inglés
   - Traducción de UI y world content

3. **Seguridad y Permisos Avanzados**
   - Análisis completo de riesgos
   - Mitigaciones avanzadas
   - Auditoría de seguridad

---

## ESTADO INICIAL DEL SISTEMA (2026-01-11)

### Arquitectura Actual (V1.3)

- ✅ Sistema de persistencia multi-usuario implementado
- ✅ Esquema Supabase funcionando
- ✅ Migración de datos completada
- ✅ Estrategia offline-first operativa
- ✅ Comportamiento del Diario implementado
- ✅ Compartir mapas básico (URLs compartidas)

### Cambios Planificados (V1.4)

1. **Sistema de Compartir (Fase 3)**:
   - Tabla `shared_maps` en Supabase
   - UI completa de compartir
   - Sistema de permisos y revocación

2. **Internacionalización (Fase 4)**:
   - Arquitectura de traducción
   - Español e Inglés iniciales
   - Traducción de UI y world content

3. **Seguridad y Permisos (Fase 5)**:
   - Análisis completo de riesgos
   - Mitigaciones avanzadas
   - Auditoría de seguridad

---

## PRÓXIMAS ENTRADAS

Las entradas de esta bitácora se registrarán conforme se implementen las fases de V1.4.

---

## V1.4-00: Inicio de V1.4 - Continuidad desde V1.3

**Fecha:** 2026-01-11  
**Contexto:** Cierre formal de V1.3 y inicio de V1.4  
**Descripción:** V1.4 inicia con las fases pendientes de V1.3 (Fases 3, 4, 5) trasladadas desde el cierre de V1.3.

**Archivos tocados:**
- `definitions/FLOWYA V1.4/BITACORA_V1_4.md` - Este documento
- `definitions/FLOWYA V1.4/ROADMAP_TECNICO_V1_4.md` - Roadmap con fases trasladadas
- `definitions/FLOWYA V1.4/PLAN_ARQUITECTURA_V1_4.md` - Plan de arquitectura
- `definitions/FLOWYA V1.4/DECISIONES_CANONICAS_V1_4.md` - Decisiones canónicas

**Archivos NO tocados:**
- Documentación de V1.3 (congelada)
- Código de V1.3 (estable)

**Riesgos considerados:**
- Ninguno. V1.4 es una continuación natural de V1.3.

**Referencias a decisiones canónicas:**
- Decisiones heredadas de V1.3 (referencia, no duplicación)
- Nuevas decisiones se documentarán en `DECISIONES_CANONICAS_V1_4.md`

**Estado:** Aplicado

---

**Última actualización:** 2026-01-11  
**Estado:** Documentación inicial creada, V1.4 iniciada
