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

