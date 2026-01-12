# Errores de TypeScript Pendientes

**Fecha de creación:** 2026-01-11  
**Estado:** Pendiente de resolución (requieren análisis arquitectónico senior)

---

## Propósito

Este documento registra errores de TypeScript que requieren análisis profundo y solución arquitectónica antes de poder ser resueltos. Estos errores no bloquean el desarrollo actual pero deben abordarse en una fase dedicada de refactorización.

---

## Errores Identificados

### 1. `components/FlowMiniBar.tsx`

**Líneas:** 96, 100  
**Error:** `Property 'heading5' does not exist on type...`  
**Descripción:** El componente intenta usar `textStyles.heading5` que no existe en el sistema de tipografía.  
**Análisis requerido:**
- ¿Debe agregarse `heading5` al sistema de tipografía?
- ¿O debe usar otro estilo existente (`heading`, `heading2`, `heading3`, `heading4`)?

**Impacto:** Bajo (componente secundario)  
**Prioridad:** Media

---

### 2. `components/FlowMiniBar.tsx`

**Línea:** 104  
**Error:** `Property 'bodySmall' does not exist on type...`  
**Descripción:** El componente intenta usar `textStyles.bodySmall` que no existe en el sistema de tipografía.  
**Análisis requerido:**
- ¿Debe agregarse `bodySmall` al sistema de tipografía?
- ¿O debe usar otro estilo existente (`body`, `bodyMedium`, `caption`)?

**Impacto:** Bajo (componente secundario)  
**Prioridad:** Media

---

### 3. `components/FlowMiniPlayer.tsx`

**Línea:** 212  
**Error:** `Property 'showMute' does not exist on type 'FlowPlayerControlsProps'`  
**Descripción:** El componente FlowMiniPlayer intenta pasar la prop `showMute` a `FlowPlayerControls`, pero esta prop no existe en la interfaz.  
**Análisis requerido:**
- ¿Debe agregarse `showMute` a `FlowPlayerControlsProps`?
- ¿O el componente FlowMiniPlayer está deprecated y no debería usarse?
- Nota: El archivo tiene un comentario `@deprecated` indicando que fue reemplazado por FlowMiniBar.

**Impacto:** Bajo (componente deprecated)  
**Prioridad:** Baja (considerar eliminar componente deprecated)

---

### 4. `components/SearchSuggestion.tsx`

**Línea:** 38  
**Error:** `Type '"place" | "explore"' is not assignable to type IconName`  
**Descripción:** El componente intenta usar el icono `"place"` que no existe en `iconMap`.  
**Análisis requerido:**
- ¿Debe agregarse `"place"` al `iconMap` (probablemente como alias de `"map"`)?
- ¿O debe usar otro icono existente (`"map"`, `"explore"`)?

**Impacto:** Bajo (componente de búsqueda)  
**Prioridad:** Media

---

### 5. `components/SpotInlineCard.tsx`

**Línea:** 114  
**Error:** `Property 'error' does not exist on type Colors`  
**Descripción:** El componente intenta acceder a `colors.error` que no existe en el sistema de colores.  
**Análisis requerido:**
- ¿Debe agregarse `error` al sistema de colores?
- ¿O debe usar otro color existente (`tint`, `icon`, etc.)?

**Impacto:** Bajo (componente de card)  
**Prioridad:** Media

---

### 6. `components/SaveFlowModal.tsx`

**Línea:** 158  
**Error:** `Type '({} | { maxHeight: number; })[]' is not assignable to type 'ViewStyle'`  
**Descripción:** Problema con tipos de estilos en array condicional.  
**Análisis requerido:**
- Revisar cómo se están combinando estilos condicionales
- Probablemente requiere usar `StyleSheet.flatten` o ajustar la estructura

**Impacto:** Bajo (modal de guardado)  
**Prioridad:** Media

---

### 7. `components/SearchBar.tsx`

**Línea:** 93  
**Error:** `'fontSize' is specified more than once`  
**Descripción:** La propiedad `fontSize` está siendo especificada múltiples veces en el estilo.  
**Análisis requerido:**
- Revisar el objeto de estilo y eliminar duplicados
- Asegurar que solo se especifica una vez

**Impacto:** Bajo (barra de búsqueda)  
**Prioridad:** Baja

---

### 8. `components/MapboxViewWeb.tsx`

**Líneas:** 488, 517  
**Error:** `Parameter 'e' implicitly has an 'any' type`  
**Descripción:** Parámetros de evento sin tipo explícito.  
**Análisis requerido:**
- Agregar tipos explícitos a los parámetros de evento
- Usar tipos de React Native (`GestureResponderEvent`, `NativeSyntheticEvent`, etc.)

**Impacto:** Bajo (componente de mapa web)  
**Prioridad:** Baja

---

### 9. `components/MapboxViewWeb.tsx`

**Línea:** 519  
**Error:** `Type 'number' is not assignable to type 'Timeout'`  
**Descripción:** Problema con tipos de `setTimeout` en web.  
**Análisis requerido:**
- Revisar cómo se maneja `setTimeout` en web vs native
- Posiblemente requiere usar `window.setTimeout` o tipado específico para web

**Impacto:** Bajo (componente de mapa web)  
**Prioridad:** Baja

---

### 10. `app/design-system.tsx`

**Línea:** 103  
**Error:** `Argument of type 'RefObject<View | null>' is not assignable to parameter of type 'RefObject<View>'`  
**Descripción:** Problema con tipos de refs en React Native.  
**Análisis requerido:**
- Revisar cómo se están usando las refs
- Probablemente requiere ajustar tipos o usar `as` para casting

**Impacto:** Bajo (pantalla de design system)  
**Prioridad:** Baja

---

## Notas

- Todos estos errores son de tipo TypeScript (tipado estricto), no errores de runtime.
- El código puede funcionar correctamente en runtime a pesar de estos errores.
- Se recomienda abordar estos errores en una fase dedicada de refactorización y mejora de tipos.
- Algunos errores pueden requerir cambios en el sistema de diseño (tipografía, colores, iconos).

---

**Última actualización:** 2026-01-11
