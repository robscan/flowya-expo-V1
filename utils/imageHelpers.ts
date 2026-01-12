/**
 * Image Helpers
 * Utilities for handling spot images, detecting stock images, and providing fallbacks
 */

/**
 * Detecta si una URL de imagen es de un servicio de stock
 */
export function isStockImage(url: string | null | undefined): boolean {
  if (!url) return true; // Sin URL = tratar como stock
  
  const stockImageDomains = [
    'unsplash.com',
    'images.unsplash.com',
    'placeholder.com',
    'via.placeholder.com',
    'placehold.it',
    'placehold.co',
    'loremflickr.com',
    'picsum.photos',
    'source.unsplash.com',
  ];

  try {
    const urlObj = new URL(url);
    return stockImageDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    // Si la URL no es válida, tratarla como stock
    return true;
  }
}

/**
 * FASE 5: Verifica si un spot tiene una imagen válida (no stock)
 * Compatible con ambos formatos: image.url y photos[]
 */
export function hasValidImage(photos: string[] | undefined | null, imageUrl?: string): boolean {
  // FASE 5: Priorizar image.url si existe (formato nuevo)
  if (imageUrl && imageUrl.trim().length > 0) {
    return !isStockImage(imageUrl);
  }
  
  // Formato antiguo (photos[])
  if (!photos || photos.length === 0) return false;
  
  // Verificar si todas las imágenes son de stock
  return photos.some(photo => !isStockImage(photo));
}

/**
 * FASE 5: Obtiene la imagen válida (no stock)
 * Compatible con ambos formatos: image.url y photos[]
 */
export function getValidImage(photos: string[] | undefined | null, imageUrl?: string): string | null {
  // FASE 5: Priorizar image.url si existe (formato nuevo)
  if (imageUrl && imageUrl.trim().length > 0 && !isStockImage(imageUrl)) {
    return imageUrl;
  }
  
  // Formato antiguo (photos[])
  if (!photos || photos.length === 0) return null;
  
  // Buscar la primera imagen que no sea de stock
  const validImage = photos.find(photo => !isStockImage(photo));
  return validImage || null;
}

/**
 * V1.3: Optimiza URLs de Unsplash agregando parámetros de calidad y compresión
 * Reduce el tamaño de las imágenes sin perder calidad visual significativa
 */
export function optimizeUnsplashUrl(url: string): string {
  if (!url || !url.includes('unsplash.com')) {
    return url; // No es Unsplash, retornar sin cambios
  }
  
  try {
    const urlObj = new URL(url);
    
    // Si ya tiene parámetros, agregar/actualizar calidad
    if (urlObj.searchParams.has('q')) {
      // Ya tiene calidad, solo asegurar que sea óptima
      const currentQ = parseInt(urlObj.searchParams.get('q') || '80');
      if (currentQ > 80) {
        urlObj.searchParams.set('q', '80'); // Reducir si es muy alta
      }
    } else {
      // Agregar calidad óptima (80 es buen balance calidad/tamaño)
      urlObj.searchParams.set('q', '80');
    }
    
    // Asegurar que tenga parámetros de tamaño si no los tiene
    if (!urlObj.searchParams.has('w') && !urlObj.searchParams.has('h')) {
      urlObj.searchParams.set('w', '800');
      urlObj.searchParams.set('h', '600');
      urlObj.searchParams.set('fit', 'crop');
    }
    
    // Agregar formato WebP si el navegador lo soporta (Unsplash lo maneja automáticamente)
    // No necesitamos hacer nada, Unsplash detecta automáticamente
    
    return urlObj.toString();
  } catch (error) {
    // Si hay error al parsear URL, retornar original
    console.warn('Error optimizing Unsplash URL:', error);
    return url;
  }
}

/**
 * V1.3: Obtiene la URL optimizada de una imagen
 * Aplica optimizaciones según el origen de la imagen
 */
export function getOptimizedImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  
  // Optimizar URLs de Unsplash
  if (imageUrl.includes('unsplash.com')) {
    return optimizeUnsplashUrl(imageUrl);
  }
  
  // Para otras URLs, retornar sin cambios (pueden agregarse más optimizaciones aquí)
  return imageUrl;
}

