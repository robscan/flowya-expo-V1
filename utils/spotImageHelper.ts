/**
 * Spot Image Helper
 * 
 * Funciones helper para manejar prioridad de imágenes en spots:
 * 1. spot_media aprobadas (contribuciones de usuarios)
 * 2. spot.image.url (imagen stock)
 * 3. Placeholder
 */

import { Spot } from '@/data/spots';
import { SpotMedia } from '@/contexts/SpotMediaContext';

export interface SpotImageResult {
  url: string | null;
  source: 'user_contribution' | 'stock' | 'placeholder';
  mediaId?: string; // ID de spot_media si es contribución
}

/**
 * Obtener la mejor imagen disponible para un spot según prioridad
 * 
 * Prioridad:
 * 1. Primera imagen aprobada de spot_media (si existe)
 * 2. spot.image.url (imagen stock actual)
 * 3. null (placeholder se maneja en el componente)
 * 
 * @param spot - El spot del cual obtener la imagen
 * @param spotMedia - Array de media aprobada para el spot (opcional)
 * @returns Objeto con la URL y el origen de la imagen
 */
export function getSpotDisplayImage(
  spot: Spot,
  spotMedia?: SpotMedia[]
): SpotImageResult {
  // Prioridad 1: Primera imagen aprobada de spot_media
  if (spotMedia && spotMedia.length > 0) {
    const approvedImage = spotMedia.find(
      media => media.status === 'approved' && media.media_type === 'image'
    );
    
    if (approvedImage && approvedImage.media_url) {
      return {
        url: approvedImage.media_url,
        source: 'user_contribution',
        mediaId: approvedImage.id,
      };
    }
  }

  // Prioridad 2: Imagen stock del spot
  if (spot.image?.url) {
    return {
      url: spot.image.url,
      source: 'stock',
    };
  }

  // Prioridad 3: Placeholder (retornar null, el componente manejará el placeholder)
  return {
    url: null,
    source: 'placeholder',
  };
}

/**
 * Obtener todas las imágenes disponibles para un spot (para galería)
 * 
 * @param spot - El spot del cual obtener las imágenes
 * @param spotMedia - Array de media aprobada para el spot (opcional)
 * @returns Array de URLs de imágenes ordenadas por prioridad
 */
export function getSpotAllImages(
  spot: Spot,
  spotMedia?: SpotMedia[]
): string[] {
  const images: string[] = [];

  // Agregar imágenes aprobadas de spot_media primero
  if (spotMedia && spotMedia.length > 0) {
    const approvedImages = spotMedia
      .filter(media => media.status === 'approved' && media.media_type === 'image')
      .map(media => media.media_url)
      .filter((url): url is string => !!url);
    
    images.push(...approvedImages);
  }

  // Agregar imagen stock si existe y no está duplicada
  if (spot.image?.url && !images.includes(spot.image.url)) {
    images.push(spot.image.url);
  }

  return images;
}
