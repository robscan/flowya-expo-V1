/**
 * Image Migration Utility
 * V1.3: Reemplaza imágenes de otras fuentes por imágenes de Unsplash
 * 
 * Mapea tipos de spots a URLs de Unsplash apropiadas
 */

import { Spot, SpotType } from '@/data/spots';

/**
 * URLs de Unsplash por tipo de spot
 * Cada tipo tiene múltiples opciones para diversidad
 */
const UNSPLASH_IMAGES_BY_TYPE: Record<SpotType, string[]> = {
  beach: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
  ],
  cafe: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
  ],
  viewpoint: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
  ],
  museum: [
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80',
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
  ],
  park: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80',
  ],
  monument: [
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
  ],
  market: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
  ],
  other: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80',
  ],
};

/**
 * Verifica si una URL es de Unsplash
 */
export function isUnsplashUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('unsplash.com') || url.includes('images.unsplash.com');
}

/**
 * Obtiene una URL de Unsplash para un tipo de spot
 * Usa el ID del spot para seleccionar de forma determinística
 */
function getUnsplashUrlForSpot(spot: Spot): string {
  const options = UNSPLASH_IMAGES_BY_TYPE[spot.type] || UNSPLASH_IMAGES_BY_TYPE.other;
  
  // Usar el ID del spot para seleccionar de forma determinística
  // Esto asegura que el mismo spot siempre obtenga la misma imagen
  const hash = spot.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % options.length;
  
  return options[index];
}

/**
 * Reemplaza la URL de imagen de un spot si no es de Unsplash
 */
export function migrateSpotImageToUnsplash(spot: Spot): Spot {
  const currentUrl = spot.image?.url;
  
  // Si ya es Unsplash, no hacer nada
  if (isUnsplashUrl(currentUrl)) {
    return spot;
  }
  
  // Reemplazar con URL de Unsplash
  const unsplashUrl = getUnsplashUrlForSpot(spot);
  
  return {
    ...spot,
    image: {
      url: unsplashUrl,
      source: 'Unsplash',
      license: 'Unsplash License',
    },
  };
}

/**
 * Migra un array de spots, reemplazando imágenes no-Unsplash
 */
export function migrateSpotsImagesToUnsplash(spots: Spot[]): Spot[] {
  return spots.map(migrateSpotImageToUnsplash);
}

/**
 * Migra spots en seedSpots.v1.2.json
 * Esta función actualiza el archivo JSON directamente
 */
export async function migrateSeedSpotsFile(): Promise<void> {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const filePath = path.join(process.cwd(), 'data', 'seedSpots.v1.2.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const spots: Spot[] = JSON.parse(fileContent);
    
    // Migrar imágenes
    const migratedSpots = migrateSpotsImagesToUnsplash(spots);
    
    // Guardar archivo actualizado
    await fs.writeFile(filePath, JSON.stringify(migratedSpots, null, 2), 'utf-8');
    
    console.log(`✅ Migradas ${migratedSpots.length} imágenes a Unsplash`);
  } catch (error) {
    console.error('Error migrando seedSpots:', error);
    throw error;
  }
}
