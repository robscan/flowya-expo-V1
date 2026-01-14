# REFERENCIAS Y MAPEO V1.2 → V1.3

**Versión:** FLOWYA V1.3  
**Fecha:** 2026-01-11  
**Estado:** En progreso

---

## PROPÓSITO

Este documento mapea la relación entre documentación de V1.2 y V1.3, indicando qué se hereda, qué se extiende y qué es nuevo.

---

## CLASIFICACIÓN DE DOCUMENTOS

### Heredados de V1.2 (Fuente de Verdad)

Documentos que siguen siendo fuente de verdad y NO se modifican en V1.3:

1. **`definitions/FLOWYA V1.2/DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`**
   - **Estado:** Heredado, fuente de verdad
   - **Razón:** Modelo conceptual canónico de Pin, Estados y Diario
   - **Uso en V1.3:** Referencia para diseño de modelo de datos y UX

2. **`definitions/FLOWYA V1.2/FLOWYA Product Definition V1.2.md`**
   - **Estado:** Heredado, fuente de verdad
   - **Razón:** Definición de producto canónica
   - **Uso en V1.3:** Referencia para decisiones de producto

3. **`definitions/FLOWYA V1.2/FUENTE_UNICA_VERDAD_V2.0_REFERENCIA.md`**
   - **Estado:** Heredado, fuente de verdad
   - **Razón:** Arquitectura canónica V2.0
   - **Uso en V1.3:** Referencia para principios arquitectónicos

### Extendidos en V1.3

Documentos de V1.2 que se extienden con nueva información en V1.3:

1. **`definitions/FLOWYA V1.2/BITACORA_V1_2.md`**
   - **Estado:** Extendido en V1.3
   - **Extensión:** `definitions/FLOWYA V1.3/BITACORA_V1_3.md`
   - **Razón:** Continuación del registro de cambios
   - **Relación:** V1.3 referencia explícitamente decisiones de V1.2

2. **Persistencia y Storage**
   - **V1.2:** AsyncStorage local (implícito en código)
   - **V1.3:** `MODELO_DATOS_V1_3.md` y `ARQUITECTURA_V1_3.md` extienden con Supabase
   - **Razón:** Migración de local a server-side

### Nuevos en V1.3

Documentos completamente nuevos en V1.3:

1. **`definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md`**
   - **Estado:** Nuevo
   - **Razón:** Única fuente de verdad para decisiones V1.3
   - **Relación:** Referencia decisiones heredadas de V1.2

2. **`definitions/FLOWYA V1.3/ARQUITECTURA_V1_3.md`**
   - **Estado:** Nuevo
   - **Razón:** Arquitectura de persistencia server-side y offline-first
   - **Relación:** Extiende principios de `FUENTE_UNICA_VERDAD_V2.0_REFERENCIA.md`

3. **`definitions/FLOWYA V1.3/MODELO_DATOS_V1_3.md`**
   - **Estado:** Nuevo
   - **Razón:** Modelo de datos conceptual y esquemas Supabase
   - **Relación:** Implementa modelo conceptual de `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

4. **`definitions/FLOWYA V1.3/ROADMAP_TECNICO_V1_3.md`**
   - **Estado:** Nuevo
   - **Razón:** Plan de implementación por fases
   - **Relación:** Basado en estructura de `PLAN_IMPLEMENTACION_V1.2.md`

5. **`definitions/FLOWYA V1.3/UX_HOME_V1_3.md`**
   - **Estado:** Nuevo (referencia futura)
   - **Razón:** Rediseño de Home como "estado del viaje" (fuera de alcance Fase 2)
   - **Relación:** Respeta reglas canónicas de `BITACORA_V1_2.md`
   - **Nota:** Solo la sección "Comportamiento del Diario" está en alcance de Fase 2

6. **`definitions/FLOWYA V1.3/SISTEMA_COMPARTIR_V1_3.md`**
   - **Estado:** Nuevo
   - **Razón:** Sistema completo de compartir mapas
   - **Relación:** Extiende funcionalidad básica de compartir de V1.2

7. **`definitions/FLOWYA V1.3/INTERNACIONALIZACION_V1_3.md`**
   - **Estado:** Nuevo
   - **Razón:** Arquitectura de traducción
   - **Relación:** Nueva funcionalidad (V1.2 solo Español)

8. **`definitions/FLOWYA V1.3/SEGURIDAD_V1_3.md`**
   - **Estado:** Nuevo
   - **Razón:** Análisis de riesgos y mitigaciones
   - **Relación:** Nueva necesidad (V1.2 solo local)

9. **`definitions/FLOWYA V1.3/REFERENCIAS_V1_2.md`** (este documento)
   - **Estado:** Nuevo
   - **Razón:** Mapeo de documentación entre versiones

10. **`definitions/FLOWYA V1.3/PRIVACIDAD_TERMINOS_V1_3.md`**
    - **Estado:** Nuevo
    - **Razón:** Políticas de privacidad, manejo de datos personales y términos de uso
    - **Relación:** Nueva necesidad (V1.3 persiste datos en servidor)

---

## MAPEO DE DECISIONES V1.2 → V1.3

### Decisiones Heredadas (NO Modificables)

| Decisión V1.2 | Referencia V1.2 | Estado V1.3 | Referencia V1.3 |
|---------------|-----------------|-------------|-----------------|
| Pin reemplaza Save y Like | DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md | Heredada | D-V1.2-01 |
| Estados to_visit / visited | DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md | Heredada | D-V1.2-01 |
| Nearby siempre visible | BITACORA_V1_2.md - Ajuste 07 | Heredada | D-V1.2-02 |
| Cambio Pin no mueve cards | BITACORA_V1_2.md - Ajuste 06 | Heredada | D-V1.2-03 |
| Diario solo si visited | DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md | Extendida | D-V1.3-04 |

### Decisiones Nuevas V1.3

| Decisión V1.3 | Tipo | Referencia V1.3 | Relación V1.2 |
|---------------|------|-----------------|---------------|
| Persistencia Supabase | Arquitectura | D-V1.3-01 | Extiende AsyncStorage |
| Offline-first | Arquitectura | D-V1.3-02 | Extiende persistencia local |
| Home como "estado del viaje" | Producto | D-V1.3-03 | Respeta reglas V1.2 |
| Diario siempre visible | Producto | D-V1.3-04 | Extiende funcionalidad |
| Sistema de compartir | Producto | D-V1.3-05 | Extiende compartir básico |
| Internacionalización | Arquitectura | D-V1.3-06 | Nueva funcionalidad |

---

## ÍNDICE DE REFERENCIAS CRUZADAS

### Documentos V1.3 que Referencian V1.2

1. **BITACORA_V1_3.md**
   - Referencia: BITACORA_V1_2.md
   - Referencia: DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md
   - Referencia: FLOWYA Product Definition V1.2.md
   - Referencia: PLAN_CIERRE_V1_2_QA_FIXES.md

2. **DECISIONES_CANONICAS_V1_3.md**
   - Referencia: Decisiones heredadas de V1.2
   - Referencia: DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md
   - Referencia: BITACORA_V1_2.md

3. **MODELO_DATOS_V1_3.md**
   - Referencia: DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md (modelo conceptual)
   - Referencia: DECISIONES_CANONICAS_V1_3.md (decisiones)

4. **ARQUITECTURA_V1_3.md**
   - Referencia: FUENTE_UNICA_VERDAD_V2.0_REFERENCIA.md (principios)
   - Referencia: DECISIONES_CANONICAS_V1_3.md (decisiones)

5. **UX_HOME_V1_3.md**
   - Referencia: BITACORA_V1_2.md (reglas canónicas)
   - Referencia: DECISIONES_CANONICAS_V1_3.md (decisiones)

6. **SISTEMA_COMPARTIR_V1_3.md**
   - Referencia: DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md (modelo)
   - Referencia: DECISIONES_CANONICAS_V1_3.md (decisiones)

---

## ESTRUCTURA DE DOCUMENTACIÓN V1.3

```
definitions/FLOWYA V1.3/
├── PLAN_ARQUITECTURA_V1_3.md          (Plan de trabajo)
├── BITACORA_V1_3.md                  (Registro de cambios)
├── DECISIONES_CANONICAS_V1_3.md      (Única fuente de verdad)
├── REFERENCIAS_V1_2.md               (Este documento)
├── ARQUITECTURA_V1_3.md              (Arquitectura general)
├── MODELO_DATOS_V1_3.md              (Modelo conceptual + Supabase)
├── ROADMAP_TECNICO_V1_3.md           (Plan por fases)
├── UX_HOME_V1_3.md                   (Rediseño de Home - referencia futura, Fase 2 solo Diario)
├── SISTEMA_COMPARTIR_V1_3.md         (Sistema de compartir)
├── INTERNACIONALIZACION_V1_3.md      (Arquitectura i18n)
├── SEGURIDAD_V1_3.md                 (Análisis de riesgos)
├── PRIVACIDAD_TERMINOS_V1_3.md       (Políticas de privacidad y términos)
└── REPORTE_FASE_1_IMPLEMENTACION.md  (Reporte de implementación Fase 1)
```

---

## NOTAS IMPORTANTES

1. **NO modificar documentación de V1.2**: V1.2 está congelada
2. **Referencias explícitas**: Todos los documentos V1.3 deben referenciar explícitamente documentos V1.2 cuando aplique
3. **Trazabilidad**: Decisiones V1.3 deben tener trazabilidad a V1.2 cuando extienden o heredan
4. **Única fuente de verdad**: DECISIONES_CANONICAS_V1_3.md es la única fuente de decisiones V1.3

---

**Última actualización:** 2026-01-11  
**Estado:** Mapeo inicial completado
