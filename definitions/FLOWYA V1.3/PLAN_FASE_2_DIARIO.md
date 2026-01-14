# Fase 2: Comportamiento del Diario - Plan de Implementación

**Versión:** FLOWYA V1.3 - Fase 2  
**Fecha:** 2026-01-11  
**Estado:** ✅ Implementación completada

---

## Objetivo

Completar el comportamiento del Diario en Spot Detail según D-V1.3-04, implementando:
- Diario siempre visible en Spot Detail
- Activación automática de estado `visited` al escribir notas
- Metadata temporal (`visitedAt`) visible

**Nota:** El rediseño de Home (D-V1.3-03) está fuera del alcance de Fase 2. Home permanece con su estructura actual.

## Referencias

- **UX Home V1.3:** `definitions/FLOWYA V1.3/UX_HOME_V1_3.md` - Sección "Comportamiento del Diario"
- **Decisiones Canónicas:** `definitions/FLOWYA V1.3/DECISIONES_CANONICAS_V1_3.md` - D-V1.3-04
- **Roadmap:** `definitions/FLOWYA V1.3/ROADMAP_TECNICO_V1_3.md` - Fase 2

---

## Estado Actual

**Archivo:** `app/spot-detail.tsx`

**Implementación Actual:**
- Sección Personal Notes solo visible si Pin existe
- Sección Personal Photos solo visible si Pin existe
- No hay activación automática de `visited` al escribir
- No hay metadata temporal visible

**Lo que falta:**
- Diario siempre visible (incluso sin Pin)
- Activación automática de `visited` al escribir notas
- Indicador visual si Pin no está en estado `visited`
- Fotos personales solo disponibles si Pin está `visited`
- Metadata temporal `visitedAt` visible

---

## Tareas de Implementación

### Tarea 2.1: Implementar Comportamiento del Diario en Spot Detail

**Archivo:** `app/spot-detail.tsx`

**Objetivo:** Implementar el comportamiento completo del Diario según D-V1.3-04.

**Cambios requeridos:**

1. **Sección Diario siempre visible:**
   - Mover sección Diario fuera de condicionales (no solo si Pin existe)
   - Siempre mostrar título "Diary" o "Personal Notes"
   - Mostrar indicador visual si Pin no está en estado `visited` (ej: badge "Mark as visited")

2. **Editor de Notas:**
   - Botón "Add Notes" / "Edit Notes" siempre visible
   - Al guardar notas, implementar lógica de activación automática:
     ```typescript
     async function handleSaveNotes(spotId: string, notes: string) {
       const pin = getPinData(spotId);
       
       if (!pin) {
         // Crear Pin con estado 'visited'
         await pinSpot(spotId, 'visited');
         await updatePinNotes(spotId, notes);
       } else if (pin.state === 'to_visit') {
         // Cambiar a 'visited' y actualizar notas
         await changePinState(spotId, 'visited');
         await updatePinNotes(spotId, notes);
       } else {
         // Solo actualizar notas
         await updatePinNotes(spotId, notes);
       }
     }
     ```

3. **Fotos Personales:**
   - Botón "Add Photo" siempre visible
   - Si Pin no está `visited`: mostrar mensaje "Mark as visited to add photos" (deshabilitado)
   - Si Pin está `visited`: permitir agregar fotos normalmente

4. **Metadata Temporal:**
   - Mostrar `visitedAt` como metadata: "Visited on [fecha]"
   - Solo visible si Pin tiene estado `visited`
   - Formatear fecha de manera legible (ej: "Visited on January 11, 2026")

**Referencias:**
- `UX_HOME_V1_3.md` - Comportamiento del Diario
- `DECISIONES_CANONICAS_V1_3.md` - D-V1.3-04

---

## Archivos a Modificar

1. **`app/spot-detail.tsx`**
   - Implementar comportamiento completo del Diario
   - Lógica de activación automática de `visited`
   - Metadata temporal visible

---

## Criterios de Completitud

- ✅ Diario completo funcionando en Spot Detail
- ✅ Sección Diario siempre visible (incluso sin Pin)
- ✅ Comportamiento de activación automática de `visited` implementado
- ✅ Indicador visual si Pin no está en estado `visited`
- ✅ Fotos personales solo disponibles si Pin está `visited`
- ✅ Metadata temporal `visitedAt` visible correctamente
- ✅ Testing manual de UX completado

---

## Notas Importantes

1. **Home permanece como está:** No se modifica la estructura actual de Home
2. **Solo Diario:** Fase 2 se enfoca únicamente en el comportamiento del Diario
3. **Activación automática:** Al escribir notas, se activa automáticamente el estado `visited`
4. **Metadata temporal:** `visitedAt` representa la primera vez que se marca como `visited`, no cambia al editar notas

---

## Dependencias

- **Fase 1:** ✅ Completada (persistencia de Pins con Supabase)
- **SavedContext:** Ya integrado con Supabase
- **Funciones disponibles:** `pinSpot`, `changePinState`, `updatePinNotes`, `getPinData`

---

## Estimación

**Duración:** 3-5 días

**Desglose:**
- Tarea 2.1: 3-5 días (implementación completa del Diario)

---

**Última actualización:** 2026-01-11  
**Estado:** Plan actualizado, rediseño de Home excluido del alcance
