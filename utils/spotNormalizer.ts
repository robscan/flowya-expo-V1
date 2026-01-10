/**
 * Spot Normalizer
 * SCOPE 6.2: Normalización técnica de datos sin modificar contenido textual
 * 
 * Acciones permitidas:
 * - Trim de strings vacíos
 * - Eliminar null → ""
 * - Asegurar que todos los campos existen (aunque estén vacíos)
 * - Garantizar tipos consistentes
 * 
 * PROHIBIDO:
 * - Cambiar redacción
 * - Acortar textos
 * - Reescribir frases
 * - Traducir contenido
 */

import { Spot } from '@/data/spots';

/**
 * Normalizar spot sin modificar contenido textual
 * SCOPE 6.2: Solo normalización técnica (trim, null → "", asegurar tipos)
 */
export function normalizeSpot(spot: Spot): Spot {
  return {
    ...spot,
    // Normalizar description/whyItMatters
    description: spot.description?.trim() || undefined,
    whyItMatters: spot.whyItMatters?.trim() || undefined,
    culturalContext: spot.culturalContext?.trim() || undefined,
    planInfo: spot.planInfo?.trim() || undefined,
    
    // Normalizar narration (asegurar que existe aunque esté vacío)
    narration: spot.narration ? {
      anticipation: spot.narration.anticipation?.trim() || '',
      presence: spot.narration.presence?.trim() || '',
      transition: spot.narration.transition?.trim() || '',
    } : {
      anticipation: '',
      presence: '',
      transition: '',
    },
    
    // Asegurar que howToVisit existe (puede estar vacío)
    howToVisit: spot.howToVisit || undefined,
    
    // Asegurar que photos es array
    photos: Array.isArray(spot.photos) ? spot.photos : [],
    
    // Asegurar que todos los campos opcionales existen
    restrictions: spot.restrictions?.trim() || undefined,
    accessibility: spot.accessibility?.trim() || undefined,
    
    // SCOPE 6.2: Asegurar que name existe (aunque sea opcional)
    name: spot.name?.trim() || undefined,
  };
}

/**
 * Normalizar todos los spots existentes
 */
export function normalizeAllSpots(spots: Spot[]): Spot[] {
  return spots.map(normalizeSpot);
}
