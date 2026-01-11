# BITÁCORA DE CAMBIOS — FLOWYA V1.2

**Fecha de inicio:** 2026-01-11  
**Versión:** FLOWYA V1.2  
**Estado:** En progreso

---

## PROPÓSITO DE ESTE DOCUMENTO

Esta bitácora registra todos los cambios realizados durante la implementación de FLOWYA V1.2, continuando el trabajo iniciado en V1.1.

**Referencias:**
- Bitácora anterior: `definitions/FLOWYA V1.1/BITACORA_V1_1.md`
- Product Definition: `FLOWYA Product Definition V1.2.md`
- Arquitectura canónica: `FUENTE_UNICA_VERDAD_V2.0_REFERENCIA.md`
- Backlog V1.1: `FLOWYA — BACKLOG V1.1_REFERENCIA.md`
- Definición de sistema: `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`

---

## FORMATO DE REGISTRO (OBLIGATORIO)

**Cada entrada debe incluir:**
- **[ID de Tarea]** (ej. V1.2-01, V1.2-02)
- **Fecha**
- **Contexto del cambio** (qué problema resuelve)
- **Descripción del ajuste realizado**
- **Archivos tocados** (lista completa)
- **Archivos NO tocados** (decisiones explícitas de no modificar)
- **Riesgos considerados**
- **Estado** (propuesto / aplicado / pendiente revisión)

**Objetivo:** Trazabilidad completa decisiones ↔ código sin ambigüedad.

---

## CONTEXTO DE V1.2

FLOWYA V1.2 introduce un sistema completo de **Pins, Estados de Visita y Diario de Viaje**, transformando la aplicación de una herramienta de planeación de recorridos a una app que también funciona como mapa personal y diario de viaje.

### Cambios Principales (Definidos)

1. **Sistema de Pins**: Renombrado de "Save" a "Pin", reemplazo de "Like" por "Pin"
2. **Estados de Pin**: Dos estados (`to_visit`, `visited`)
3. **Diario de Viaje**: Notas y fotos personales opcionales para Pins con estado `visited`
4. **Mapa Personal**: Tres tipos de markers (Normal, Pin To Visit, Pin Visited)
5. **Pinned Screen**: Redefinición de "Saved" como "Pinned" con filtrado por estados
6. **Compartir**: Funcionalidad para compartir mapas de pines y flows

### Documentos de Referencia

- **DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md**: Definición completa y validada del sistema de Pins, Visited y Diario de Viaje
- **FUENTE_UNICA_VERDAD_V2.0_REFERENCIA.md**: Arquitectura canónica V2.0 (referencia)
- **BITACORA_V1_1.md**: Cambios y decisiones de V1.1 (referencia)

---

## ESTADO INICIAL DEL SISTEMA (2026-01-11)

### Arquitectura Actual (V2.0)

- ✅ Arquitectura V2.0 completada
- ✅ LocationProvider como fuente única de verdad
- ✅ Sistema de narración sin audio (solo subtítulos)
- ✅ FlowContext con estados: idle, active, paused
- ✅ Sistema de afinidad actual: `savedSpots`, `likedSpots`, `notMyVibeSpots`, `savedFlows`
- ✅ SavedContext con sistema de guardado actual

### Cambios Planificados (V1.2)

1. **Modelo de Datos**:
   - Eliminar `savedSpots: string[]` y `likedSpots: string[]`
   - Implementar `pins: Record<string, PinData>`
   - Mantener `notMyVibeSpots` y `savedFlows`

2. **UI**:
   - Renombrar "Save" a "Pin" en todas las pantallas
   - Eliminar botones de "Like"
   - Agregar modal de selección de estado (To Visit / Visited) al crear Pin
   - Actualizar Map Screen con tres tipos de markers
   - Redefinir Saved Screen como Pinned Screen con filtrado por estados

3. **Migración de Datos**:
   - Script de migración: `savedSpots` → `pins` (estado `to_visit`)
   - Script de migración: `likedSpots` → `pins` (estado `to_visit`, si no existe ya)

### Estado de Documentación

- ✅ Definición del sistema validada por Product Owner
- ✅ Documentación conceptual completa
- ⏳ Bitácora V1.2 (este documento - en progreso)
- ⏳ Plan de implementación detallado (pendiente)

---

## PRÓXIMAS ENTRADAS

Las entradas de esta bitácora se registrarán conforme se implementen los cambios definidos en `DEFINICION_SISTEMA_PINS_VISITED_DIARIO_V1.2.md`.

---

**Última actualización:** 2026-01-11  
**Estado:** Estructura inicial creada, pendiente de implementación