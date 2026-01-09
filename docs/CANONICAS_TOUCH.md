# Canónicas de Arquitectura Touch FLOWYA

Este documento define las reglas canónicas para interacciones touch en FLOWYA. Estas canónicas son válidas para Web y App nativa futura.

## 1. Canónica de Eventos de Interacción

### Reglas Principales

- **Usar `onPress` (React Native)**, nunca `onClick` en componentes React Native
  - `onClick` tiene delay de 300ms en web mobile
  - `onPress` maneja correctamente touch en web y mobile
  - Todos los componentes interactivos deben usar `Pressable` o `TouchableOpacity` con `onPress`

- **`onPress`** para acciones principales
  - Navegación, acciones primarias, selección
  - Usar en `Pressable`, `TouchableOpacity`, `TouchableHighlight`

- **`onLongPress`** para acciones secundarias
  - Menús contextuales, acciones destructivas
  - Confirmaciones o acciones que requieren intención explícita

- **`e.stopPropagation()`** cuando sea necesario
  - Prevenir que eventos se propaguen a elementos padre
  - Útil en botones dentro de cards o listas

### Ejemplo

```typescript
// ✅ CORRECTO
<Pressable onPress={handlePress} style={styles.button}>
  <Text>Button</Text>
</Pressable>

// ❌ INCORRECTO
<div onClick={handleClick}>Button</div>
```

## 2. Canónica de Pointer Events

### Reglas

- **Elementos NO interactivos**: `pointerEvents="none"`
  - Skeletons, loaders, overlays visuales
  - Elementos con `opacity: 0` que no deben interceptar eventos
  - Animaciones y transiciones que no son interactivas

- **Solo elementos accionables**: `pointerEvents="auto"` (default)
  - Botones, cards, controles
  - Elementos que responden a interacciones

### Implementación

```typescript
// Skeleton - NO interactivo
<View pointerEvents="none" style={styles.skeleton}>
  {/* Contenido del skeleton */}
</View>

// Card - Interactivo (default: pointerEvents="auto")
<Pressable onPress={handlePress} style={styles.card}>
  {/* Contenido del card */}
</Pressable>
```

### Componentes que DEBEN tener `pointerEvents="none"`

- `components/ui/SkeletonBlock.tsx`
- `components/ui/SkeletonCard.tsx`
- `components/ui/SkeletonList.tsx`
- `components/ui/SkeletonImage.tsx` (hereda de SkeletonBlock)
- `components/ui/SkeletonText.tsx` (hereda de SkeletonBlock)
- Elementos visuales de `components/ui/GlassView.tsx` (glowTop, glowContour)

## 3. Canónica de Touch Action

### Reglas

- **Botones y cards**: `touch-action: manipulation`
  - Evita double-tap zoom en mobile
  - Mejora la respuesta táctil
  - Aplicar solo en web (`Platform.OS === 'web'`)

- **Evitar**:
  - `touch-action: pan-y` en elementos clicables
  - `overflow: scroll` envolviendo elementos clicables sin necesidad

### Implementación

```typescript
const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.xs,
    // @ts-ignore - touch-action es válido en web
    ...(Platform.OS === 'web' && { touchAction: 'manipulation' }),
  },
});
```

### Componentes que DEBEN tener `touch-action: manipulation`

- `components/SpotMediaCard.tsx` - `cardContainer` y `smallCardContainer`
- `components/FlowCard.tsx` - `cardContainer`
- `components/ui/MapControls.tsx` - `controlButton`
- Todos los botones y elementos accionables

## 4. Canónica de Overlays y Wrappers

### Reglas

- **Overlays visuales**: `pointerEvents="none"`
  - Elementos con `position: absolute` que son solo visuales
  - Efectos de glow, blur, sombras
  - Capas decorativas

- **Wrappers de layout**: Verificar que no bloqueen eventos
  - Contenedores con `position: absolute` o `fixed`
  - Elementos con `opacity: 0` que no deben interceptar

- **Overlays interactivos**: Mantener `pointerEvents="auto"` (default)
  - Modales, tooltips, dropdowns
  - Elementos que deben responder a interacciones

### Ejemplo

```typescript
// Overlay visual - NO interactivo
<View 
  style={[styles.overlay, { position: 'absolute' }]}
  pointerEvents="none"
>
  {/* Efecto visual */}
</View>

// Overlay interactivo - Interactivo
<Pressable 
  style={[styles.modal, { position: 'absolute' }]}
  onPress={handleClose}
>
  {/* Contenido interactivo */}
</Pressable>
```

## 5. Canónica de Compatibilidad Web + App

### Principios

- **Usar APIs de React Native** (no APIs web específicas)
  - `Pressable`, `TouchableOpacity` en lugar de `div` con `onClick`
  - `StyleSheet` en lugar de CSS directo
  - Mantener compatibilidad con Expo/RN futuro

- **`Platform.OS === 'web'`** para estilos web específicos
  - `touch-action: manipulation` solo en web
  - Otros estilos web específicos cuando sea necesario

- **No depender de APIs del navegador**
  - Evitar `window`, `document`, APIs DOM directas
  - Usar abstracciones de React Native

### Ejemplo

```typescript
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  button: {
    padding: spacing.md,
    // Estilo web específico
    ...(Platform.OS === 'web' && { touchAction: 'manipulation' }),
  },
});
```

## 6. Checklist de Validación

### Touch
- [ ] Primer TAP ejecuta acción en mobile (producción)
- [ ] No hay overlays interceptando eventos
- [ ] Skeletons tienen `pointerEvents="none"`
- [ ] Botones y cards tienen `touch-action: manipulation`

### Eventos
- [ ] No se usa `onClick` en componentes React Native
- [ ] Todos los componentes usan `onPress` correctamente
- [ ] `e.stopPropagation()` se usa cuando es necesario

### Compatibilidad
- [ ] No hay regresiones en desktop
- [ ] Código es compatible con Expo/RN
- [ ] No se depende de APIs web específicas

## 7. Problemas Comunes y Soluciones

### Problema: Primer tap no funciona

**Causas comunes**:
1. Skeletons sin `pointerEvents="none"` interceptando eventos
2. Overlays visuales bloqueando eventos
3. Falta de `touch-action: manipulation` en elementos interactivos

**Solución**:
- Agregar `pointerEvents="none"` a skeletons y overlays visuales
- Agregar `touch-action: manipulation` a botones y cards

### Problema: Double-tap zoom en mobile

**Causa**: Falta de `touch-action: manipulation`

**Solución**: Agregar `touch-action: manipulation` a elementos interactivos

### Problema: Eventos no se propagan correctamente

**Causa**: `pointerEvents="none"` en elementos que deberían ser interactivos

**Solución**: Verificar que solo elementos no interactivos tengan `pointerEvents="none"`

## Notas Importantes

- **NO introducir delays artificiales**: El problema debe resolverse correctamente
- **NO romper desktop**: Verificar que cambios no afecten desktop
- **NO romper futura app nativa**: Usar APIs de React Native
- **Pensar como arquitecto**: Soluciones escalables y mantenibles
