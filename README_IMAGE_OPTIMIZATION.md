# Pipeline de Optimización de Imágenes

## Instalación

Este proyecto requiere `expo-image-manipulator` para el pipeline de optimización de imágenes.

```bash
npx expo install expo-image-manipulator
```

## Uso

### Hook `useImageUpload`

El hook `useImageUpload` centraliza la optimización de imágenes subidas por el usuario.

**Características:**
- Redimensiona imágenes (max width 1200px mobile, 1600px desktop)
- Comprime imágenes (calidad 70-80)
- Remueve metadata pesada (automático con JPEG)
- Genera preview optimizado

**Ejemplo de uso:**

```typescript
import { useImageUpload } from '@/hooks/useImageUpload';

const {
  uri: photo,
  isOptimizing,
  pickFromGallery,
  takePhoto,
  reset,
} = useImageUpload({
  allowsEditing: true,
  aspect: [4, 3],
  quality: 75,
  onOptimized: (optimizedUri) => {
    console.log('Imagen optimizada:', optimizedUri);
  },
});

// Seleccionar imagen desde galería
const handlePickImage = async () => {
  const optimizedUri = await pickFromGallery();
  // La imagen ya está optimizada y lista para usar
};
```

### Componente `OptimizedImage`

El componente `OptimizedImage` asume que **TODAS las imágenes ya están optimizadas**.

**IMPORTANTE:** Las imágenes subidas por el usuario deben pasar por el pipeline de optimización (`useImageUpload`) ANTES de mostrarse en UI.

**Ejemplo de uso:**

```typescript
import { OptimizedImage } from '@/components/ui/OptimizedImage';

<OptimizedImage
  source={{ uri: photo }}
  width="100%"
  height={200}
  placeholderType="skeleton"
  showFallback={true}
  resizeMode="cover"
/>
```

## Flujos Integrados

### Create Spot (`app/create-spot.tsx`)
- Usa `useImageUpload` para optimizar imágenes antes de crear el spot
- Muestra indicador de carga durante optimización

### Edit Spot (`app/spot-detail.tsx`)
- Usa `useImageUpload` para optimizar nuevas imágenes en modo edición
- Inicializa con imagen existente del spot (no necesita re-optimización)

## Pipeline de Optimización

1. **Selección**: Usuario selecciona imagen (galería o cámara)
2. **Optimización**: 
   - Redimensionar si es necesario (max width según plataforma)
   - Comprimir (calidad 70-80)
   - Remover metadata (automático con JPEG)
3. **Preview**: Retorna URI optimizada lista para usar
4. **Renderizado**: `OptimizedImage` muestra la imagen optimizada con placeholder mientras carga

## Notas Técnicas

- Las imágenes optimizadas se guardan en formato JPEG para remover metadata
- El cache nativo de React Native maneja el cache de imágenes remotas
- No se suben ni renderizan imágenes originales sin optimizar
- El pipeline es transparente para el usuario (solo ve indicador de carga)
