# DECISIONES CANÓNICAS — FLOWYA V1.4

**Versión:** FLOWYA V1.4  
**Fecha de inicio:** 2026-01-11  
**Estado:** En progreso

---

## PROPÓSITO DE ESTE DOCUMENTO

Este documento es la **ÚNICA FUENTE DE VERDAD** para todas las decisiones de producto y técnicas de FLOWYA V1.4.

**IMPORTANTE:**
- Otros documentos de V1.4 **referencian** este documento, no duplican decisiones
- Todas las decisiones deben tener trazabilidad a V1.3 cuando aplique
- Trade-offs y alternativas evaluadas deben documentarse explícitamente

---

## FORMATO DE DECISIÓN

Cada decisión debe incluir:
- **ID de Decisión** (ej. D-V1.4-01)
- **Fecha**
- **Tipo**: Producto / Técnica / Arquitectura
- **Contexto**: Qué problema resuelve
- **Decisión**: Qué se decide hacer
- **Justificación**: Por qué se toma esta decisión
- **Alternativas evaluadas**: Qué otras opciones se consideraron
- **Trade-offs**: Qué se gana y qué se pierde
- **Trazabilidad V1.3**: Referencia a decisiones de V1.3 si aplica
- **Impacto**: Qué documentos/código afecta

---

## DECISIONES HEREDADAS DE V1.3 (NO MODIFICABLES)

Todas las decisiones de V1.3 están congeladas y se heredan completamente.

**Referencia:** `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md`

### Decisiones Heredadas (Resumen)

**D-V1.3-01: Persistencia Server-Side con Supabase**
- Heredada de V1.3, NO modificable
- Estrategia offline-first con Supabase
- Referencia: `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-01

**D-V1.3-02: Estrategia de Sincronización (Last-Write-Wins)**
- Heredada de V1.3, NO modificable
- Resolución de conflictos por timestamp
- Referencia: `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-02

**D-V1.3-03: Home como "Estado del Viaje"**
- Heredada de V1.3, diferida a V1.4
- Fuera de alcance de Fase 2 de V1.3
- Referencia: `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-03

**D-V1.3-04: Diario siempre visible en Spot Detail**
- Heredada de V1.3, implementada en Fase 2
- NO modificable
- Referencia: `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-04

**D-V1.3-05: Sistema de Compartir**
- Heredada de V1.3, pendiente de implementación en V1.4
- Referencia: `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-05

**D-V1.3-06: Internacionalización**
- Heredada de V1.3, pendiente de implementación en V1.4
- Referencia: `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-06

---

## DECISIONES HEREDADAS DE V1.2 (NO MODIFICABLES)

Todas las decisiones de V1.2 están congeladas y se heredan completamente.

**Referencia:** `definitions/FLOWYA V1.2/BITACORA_V1_2.md`

### Decisiones Heredadas (Resumen)

**D-V1.2-01: Modelo Conceptual de Pin**
- Heredada de V1.2, NO modificable
- Pin es relación personal User ↔ Spot
- Estados: `to_visit` | `visited`
- Referencia: `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

**D-V1.2-02: Comportamiento de Nearby Places**
- Heredada de V1.2, NO modificable
- Nearby Places SIEMPRE visible cuando hay spots cercanos
- NO filtra por estado de Pin
- Referencia: `BITACORA_V1_2.md` - Ajuste 07

**D-V1.2-03: Cambio de Pin NO mueve cards inmediatamente**
- Heredada de V1.2, NO modificable
- Cards mantienen posición durante sesión actual
- Referencia: `BITACORA_V1_2.md` - Ajuste 06

---

## DECISIONES NUEVAS DE V1.4

Las decisiones nuevas de V1.4 se documentarán aquí conforme se implementen las fases.

### Por Definir

Las siguientes decisiones están pendientes de definición en V1.4:

1. **Sistema de Compartir:**
   - Detalles de implementación de tabla `shared_maps`
   - Políticas de permisos y revocación
   - UI de selección de usuarios

2. **Internacionalización:**
   - Arquitectura específica de i18n
   - Estrategia de traducción de world content
   - Manejo de strings faltantes

3. **Seguridad y Permisos:**
   - Mitigaciones específicas de riesgos identificados
   - Políticas de auditoría
   - Validación de control de accesos

---

## NOTAS IMPORTANTES

- ✅ Todas las decisiones de V1.3 están congeladas y se heredan
- ✅ Todas las decisiones de V1.2 están congeladas y se heredan
- ⏳ Nuevas decisiones se documentarán conforme se implementen las fases
- 📝 Referencias a V1.3 y V1.2 deben mantenerse explícitas

---

**Última actualización:** 2026-01-11  
**Estado:** Documentación inicial creada, decisiones heredadas referenciadas
