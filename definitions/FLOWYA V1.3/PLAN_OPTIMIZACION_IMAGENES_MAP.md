# Plan de Optimización: Imágenes Locales y Lazy Loading del Map

## Objetivo
1. Migrar imágenes externas a assets locales para eliminar dependencias de URLs externas
2. Implementar lazy loading en el Map: solo renderizar pines visibles en viewport
3. Optimizar carga de información de cards: cargar datos completos solo cuando el usuario lo solicita

---

## FASE 1: Migración de Imágenes a Local

### 1.1 Estructura de Carpetas
```
assets/
  images/
    spots/
      {spotId}.jpg  (o .png según formato)
```

### 1.2 Estrategia de Migración
- **Opción A (Recomendada)**: Descargar imágenes y guardarlas localmente
  - Crear script de migración que descargue imágenes de URLs
  - Renombrar según `spotId`
  - Actualizar `seedSpots.v1.2.json` para usar rutas locales: `require('@/assets/images/spots/{spotId}.jpg')`
  
- **Opción B**: Usar imágenes placeholder locales y reemplazar gradualmente
  - Crear imágenes placeholder genéricas por tipo de spot
  - Migrar a imágenes reales cuando estén disponibles

### 1.3 Actualización de Código
- Modificar `OptimizedImage.tsx` para detectar rutas locales vs URLs
- Actualizar `imageHelpers.ts` para manejar rutas locales
- Asegurar que `SpotImage.url` pueda ser string (URL) o require() (local)

---

## FASE 2: Lazy Loading del Map

### 2.1 Implementación de Viewport Filtering
- **Problema actual**: El Map renderiza todos los pines (hasta 200 cuando filtro es 'all')
- **Solución**: Filtrar pines basado en viewport visible del mapa

### 2.2 Estrategia
1. **Obtener bounds del viewport** del mapa (norte, sur, este, oeste)
2. **Filtrar spots** que están dentro del viewport + buffer (ej: 20% más allá del viewport)
3. **Actualizar filtro** cuando el usuario hace pan/zoom
4. **Renderizar solo pines visibles** en `FlowyaMapView`

### 2.3 Implementación Técnica
- Usar eventos `onRegionChange` o `onRegionChangeComplete` del MapView
- Calcular bounds del viewport
- Filtrar `filteredSpots` basado en bounds
- Mantener buffer para precarga (cargar pines cercanos antes de que sean visibles)

### 2.4 Optimización Adicional
- **Clustering**: Agrupar pines cercanos cuando hay muchos en un área pequeña
- **Niveles de detalle**: Mostrar solo nombre en zoom lejano, más info en zoom cercano

---

## FASE 3: Carga Lazy de Información de Cards

### 3.1 Estado Actual
- `SpotInlineCard` se muestra cuando el usuario selecciona un spot
- El spot completo ya está cargado en memoria

### 3.2 Optimización
- **Cargar solo datos mínimos** para pines (id, name, location, type)
- **Cargar datos completos** (description, image, etc.) solo cuando:
  - El usuario selecciona el spot (tap en pin)
  - El spot entra en viewport visible
  - El usuario hace hover (web) o long press (móvil)

### 3.3 Implementación
- Crear tipo `SpotMinimal` con solo campos esenciales para pines
- Mantener `Spot` completo para cards y detalles
- Lazy load de `Spot` completo desde `SpotContext` cuando se necesita

---

## Prioridades

1. **ALTA**: FASE 2 (Lazy Loading del Map) - Impacto inmediato en rendimiento
2. **MEDIA**: FASE 1 (Migración de Imágenes) - Mejora estabilidad y velocidad de carga
3. **BAJA**: FASE 3 (Carga Lazy de Cards) - Ya está parcialmente implementado

---

## Notas Técnicas

- **Mapbox**: Usar `getBounds()` o eventos de región para obtener viewport
- **React Native**: `onRegionChangeComplete` se dispara cuando el usuario termina de mover/zoom
- **Performance**: Limitar re-renders usando `useMemo` y `useCallback`
- **Buffer**: Cargar pines 20% más allá del viewport para transición suave
