---
name: Cierre FLOWYA V1.2 - QA y Fixes
overview: Revisión arquitectónica y QA técnico de FLOWYA V1.2 para detectar bugs, inconsistencias y edge cases antes del cierre de la fase de estabilización local.
todos:
  - id: fix-gems-logic
    content: Actualizar utils/gemsLogic.ts para usar sistema de Pins (getPinnedSpots, isSpotPinned) en lugar de likedSpots/savedSpots legacy
    status: pending
  - id: decide-liked-spots
    content: "Decidir destino de app/liked-spots.tsx: eliminar, migrar a Pins, o marcar como deprecated"
    status: pending
  - id: testing-manual
    content: Ejecutar testing manual completo según checklist (Pins, Diario, Sign in/out, Migraciones, UI)
    status: pending
  - id: documentar-testing
    content: Documentar resultados de testing en BITACORA_V1_2.md
    status: pending
  - id: confirmar-cierre
    content: Confirmar que V1.2 está estable y lista para branching
    status: pending
---

# Plan de Cierre FLOWYA V1.2 - QA Técnico y Fixes

## Estado de Implementación (Según Bitácora)

### ✅ Implementado Correctamente

1. **Fase 1: Modelo de Datos**
   - Sistema de Pins en SavedContext ✅
   - Migración automática savedSpots/likedSpots → pins ✅
   - Funciones: pinSpot, unpinSpot, changePinState, isSpotPinned, getPinState, getPinnedSpots ✅

2. **Fase 2: UI - Botones y Acciones**
   - Comportamiento híbrido (primer pin = to_visit directo) ✅
   - Validación de autenticación ✅
   - Eliminación de referencias a Like ✅
   - Toast con Modal transparente ✅

3. **Fase 3: Pinned Screen**
   - PinStateFilter implementado ✅
   - Filtrado por tipo × estado ✅

4. **Fase 4: Diario de Viaje**
   - Personal Notes (editor inline) ✅
   - Personal Photos (grid 3 columnas) ✅
   - Validación: solo si Pin tiene estado 'visited' ✅

5. **Fase 5: Compartir y Mapa**
   - Tres tipos de markers (Normal, To Visit, Visited) ✅
   - Filtro de estado en mapa ✅
   - Compartir mapas de pines ✅
   - Compartir flows guardados ✅

6. **Ajustes UX**
   - Limpieza de Profile Screen ✅
   - Corrección Sign out ✅
   - Limpieza de pines al cerrar sesión ✅
   - Icono de distancia diferenciado ✅

## Problemas Detectados

### 🔴 CRÍTICO: Código Legacy en gemsLogic.ts

**Archivo:** `utils/gemsLogic.ts`

**Problema:**
- Funciones `getFeaturedSpots`, `getSuggestedSpots`, `getSuggestedPaths` usan directamente `likedSpots` y `savedSpots` (campos legacy)
- No usan el sistema de Pins (`getPinnedSpots`, `isSpotPinned`, `getPinState`)
- Esto causa inconsistencia: Gems no refleja el estado real de Pins del usuario

**Impacto:**
- Gems muestra recomendaciones basadas en datos legacy
- No considera estados de Pin (to_visit vs visited)
- Puede mostrar spots como "sugeridos" que ya están pinned

**Fix Requerido:**
- Actualizar `gemsLogic.ts` para usar sistema de Pins
- Reemplazar `likedSpots` y `savedSpots` por `getPinnedSpots()` y `isSpotPinned()`
- Considerar estado de Pin en algoritmos de recomendación

### 🟡 MEDIO: Pantalla Deprecated liked-spots.tsx

**Archivo:** `app/liked-spots.tsx`

**Problema:**
- Pantalla existe y funciona pero está deprecated según V1.2
- Usa `likedSpotsFromPlayer` (campo legacy)
- Ruta registrada en `app/_layout.tsx` línea 76

**Impacto:**
- Funcionalidad legacy aún accesible
- Puede confundir usuarios (Like fue eliminado, reemplazado por Pin)

**Opciones:**
1. **Eliminar completamente** (recomendado si no se usa)
2. **Migrar a usar Pins** (si se quiere mantener funcionalidad)
3. **Marcar explícitamente como deprecated** con mensaje de redirección

### 🟡 MEDIO: Validación de visitedAt en changePinState

**Archivo:** `contexts/SavedContext.tsx` línea 695

**Problema:**
- Cuando se cambia estado a 'visited', `visitedAt` se establece solo si no existe
- Si se cambia de 'visited' → 'to_visit' → 'visited' nuevamente, `visitedAt` mantiene fecha original
- Puede ser comportamiento deseado, pero no está documentado

**Impacto:**
- Bajo: Funcionalidad funciona, pero fecha puede no reflejar última visita

**Fix Opcional:**
- Documentar comportamiento o actualizar para usar fecha más reciente

### 🟢 BAJO: Edge Case - Pin sin estado válido

**Archivo:** `contexts/SavedContext.tsx`

**Problema:**
- Si un Pin tiene estado inválido (no 'to_visit' ni 'visited'), funciones pueden fallar silenciosamente
- No hay validación de estado en `getPinState()`

**Impacto:**
- Muy bajo: Solo si hay corrupción de datos

**Fix Opcional:**
- Agregar validación y fallback en `getPinState()`

### 🟢 BAJO: Migración de likedSpotsFromPlayer

**Archivo:** `contexts/SavedContext.tsx` línea 291-305

**Problema:**
- `likedSpotsFromPlayer` se migra a pins, pero el campo legacy se mantiene
- Pantalla `liked-spots.tsx` aún usa este campo
- Puede causar confusión si usuario ve spots en liked-spots que ya están en pins

**Impacto:**
- Bajo: Solo afecta si se usa pantalla deprecated

## Plan de Fixes

### Fix 1: Actualizar gemsLogic.ts para usar Sistema de Pins

**Archivo:** `utils/gemsLogic.ts`

**Cambios:**
1. Actualizar `getFeaturedSpots()`:
   - Reemplazar `likedSpots` y `savedSpots` por `getPinnedSpots()`
   - Considerar estado de Pin en score (visited = más peso que to_visit)

2. Actualizar `getSuggestedSpots()`:
   - Filtrar spots que ya están pinned usando `isSpotPinned()`
   - Usar `getPinnedSpots()` en lugar de `savedSpots`

3. Actualizar `getSuggestedPaths()`:
   - Usar `getPinnedSpots()` en lugar de `savedSpots`

4. Actualizar `getAllGems()`:
   - Pasar funciones de Pins en lugar de arrays legacy

**Archivos afectados:**
- `utils/gemsLogic.ts`
- `app/(tabs)/gems.tsx` (si existe y usa estas funciones)

### Fix 2: Decidir destino de liked-spots.tsx

**Opciones:**
- **Opción A (Recomendada):** Eliminar pantalla y ruta
- **Opción B:** Migrar a usar Pins con estado 'visited'
- **Opción C:** Mantener como deprecated con mensaje

**Archivos afectados:**
- `app/liked-spots.tsx` (eliminar o modificar)
- `app/_layout.tsx` línea 76 (eliminar ruta)

### Fix 3: Documentar o corregir visitedAt

**Archivo:** `contexts/SavedContext.tsx` línea 695

**Decisión requerida:**
- ¿`visitedAt` debe ser fecha de primera visita o última visita?

**Si última visita:**
- Actualizar `changePinState()` para siempre actualizar `visitedAt` cuando cambia a 'visited'

**Si primera visita:**
- Documentar comportamiento actual

## Testing Manual Requerido

### Checklist de Testing

1. **Pins:**
   - [ ] Crear Pin con estado 'to_visit' (primer pin sin modal)
   - [ ] Crear Pin con estado 'visited' (modal primera vez)
   - [ ] Cambiar estado to_visit → visited
   - [ ] Cambiar estado visited → to_visit
   - [ ] Eliminar Pin
   - [ ] Verificar persistencia después de reiniciar app

2. **Diario:**
   - [ ] Agregar notas a Pin visited
   - [ ] Editar notas existentes
   - [ ] Cancelar edición de notas
   - [ ] Agregar foto a Pin visited
   - [ ] Eliminar foto
   - [ ] Verificar que notas/fotos no aparecen si Pin es to_visit

3. **Sign in / Sign out:**
   - [ ] Intentar pin sin autenticación (debe mostrar alerta)
   - [ ] Sign in y crear pins
   - [ ] Sign out (pins deben eliminarse)
   - [ ] Sign in nuevamente (pins no deben reaparecer)

4. **Migraciones:**
   - [ ] Verificar migración automática de savedSpots → pins
   - [ ] Verificar migración automática de likedSpots → pins
   - [ ] Verificar que migración solo se ejecuta una vez

5. **UI Map / Saved / Spot Detail:**
   - [ ] Verificar markers en mapa (Normal, To Visit, Visited)
   - [ ] Verificar filtro de estado en mapa
   - [ ] Verificar filtro de estado en Saved Screen
   - [ ] Verificar compartir mapas de pines
   - [ ] Verificar compartir flows

6. **Edge Cases:**
   - [ ] Pin mismo spot múltiples veces (no debe duplicar)
   - [ ] Cambiar estado rápidamente múltiples veces
   - [ ] Agregar muchas fotos (verificar performance)
   - [ ] Notas muy largas (verificar que se guardan correctamente)

## Criterios de Cierre V1.2

### ✅ Requisitos Mínimos

1. **Funcionalidad Core:**
   - ✅ Sistema de Pins funciona correctamente
   - ✅ Diario de Viaje funciona correctamente
   - ✅ Migraciones ejecutan correctamente
   - ✅ Validación de autenticación funciona

2. **Código Limpio:**
   - ⚠️ gemsLogic.ts actualizado para usar Pins (FIX REQUERIDO)
   - ⚠️ liked-spots.tsx decidido (FIX REQUERIDO)
   - ✅ No hay referencias a Like en código activo
   - ✅ savedSpots/likedSpots solo para compatibilidad temporal

3. **Testing:**
   - ⚠️ Testing manual completado (PENDIENTE)
   - ✅ No hay errores de TypeScript
   - ✅ No hay warnings críticos (solo warning conocido de aria-hidden)

### 🎯 Estado Actual

**Listo para cierre:** ⚠️ **PARCIALMENTE**

**Fixes requeridos antes de cierre:**
1. Fix gemsLogic.ts (CRÍTICO)
2. Decisión sobre liked-spots.tsx (MEDIO)

**Testing requerido:**
- Testing manual completo (checklist arriba)

## Próximos Pasos

1. **Aplicar Fix 1:** Actualizar gemsLogic.ts
2. **Aplicar Fix 2:** Decidir y ejecutar acción sobre liked-spots.tsx
3. **Ejecutar Testing Manual:** Completar checklist
4. **Documentar resultados:** Actualizar BITACORA_V1_2.md con resultados de testing
5. **Confirmar cierre:** Marcar V1.2 como estable y lista para branching
