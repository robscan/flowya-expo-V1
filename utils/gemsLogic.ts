/**
 * Gems Logic - Algoritmo de recomendaci?n para Gems
 * Scope 9: Gems Screen - L?gica de recomendaci?n
 * 
 * Funcionalidades:
 * - Algoritmo simple de recomendaci?n
 * - Basado en interacciones (views, saves, likes)
 * - Spots recientes
 * - Paths sugeridos basados en Spots guardados
 * 
 * V1.2: Actualizado para usar sistema de Pins
 * - Excluye spots con Pin (cualquier estado) de recomendaciones
 * - Usa isSpotPinned como filtro binario
 */

import { Spot } from '@/data/spots';
import { Path } from '@/data/paths';
import { SpotTypeAffinity } from '@/contexts/SavedContext'; // SCOPE 5: Afinidad por tipo de spot

export interface GemSpot {
  spot: Spot;
  reason: 'recent' | 'popular' | 'suggested';
  score: number;
}

export interface GemPath {
  path: Path;
  reason: 'suggested';
  score: number;
}

/**
 * SCOPE 5: Aplicar penalizaci?n de Dislike (reducir score ligeramente, nunca eliminarlo)
 */
function applyDislikePenalty(spot: Spot, notMyVibeSpots: string[]): number {
  if (notMyVibeSpots.includes(spot.id)) {
    // Penalizar ligeramente (-1) pero no eliminar completamente
    return -1;
  }
  return 0;
}

/**
 * Calcular score de popularidad basado en interacciones (SCOPE 5: mejorado con afinidad)
 * V1.2: No considera likedSpots/savedSpots (legacy), solo afinidad y caracter?sticas del spot
 */
function calculatePopularityScore(
  spot: Spot,
  notMyVibeSpots: string[] = [], // SCOPE 5: Considerar dislikes
  spotTypeAffinity?: Record<string, SpotTypeAffinity> // SCOPE 5: Afinidad por tipo
): number {
  let score = 0;
  
  // SCOPE 5: Afinidad por tipo de spot (aumentar score si tipo tiene afinidad positiva)
  if (spotTypeAffinity && spotTypeAffinity[spot.type]) {
    const affinity = spotTypeAffinity[spot.type];
    // Agregar boost basado en afinidad (score puede ser -10 a 10, normalizar a -3 a 3)
    score += Math.round((affinity.score / 10) * 3);
  }
  
  // SCOPE 5: Aplicar penalizaci?n de dislike (ligera, no elimina)
  score += applyDislikePenalty(spot, notMyVibeSpots);
  
  // Spots con nombre tienen m?s peso
  if (spot.name) {
    score += 1;
  }
  
  // Spots con fotos tienen m?s peso
  if (spot.photos && spot.photos.length > 0) {
    score += 1;
  }
  
  return score;
}

/**
 * Obtener Spots destacados (populares) - SCOPE 5: mejorado con afinidad y dislike
 * V1.2: Excluye spots con Pin (cualquier estado) - filtro binario
 */
export function getFeaturedSpots(
  spots: Spot[],
  isSpotPinned: (spotId: string) => boolean, // V1.2: Funci?n para verificar si spot tiene Pin
  limit: number = 5,
  notMyVibeSpots: string[] = [], // SCOPE 5: Considerar dislikes
  spotTypeAffinity?: Record<string, SpotTypeAffinity> // SCOPE 5: Afinidad por tipo
): GemSpot[] {
  const scored = spots
    .filter((spot) => !isSpotPinned(spot.id)) // V1.2: Excluir spots con Pin (cualquier estado)
    .map((spot) => ({
      spot,
      score: calculatePopularityScore(spot, notMyVibeSpots, spotTypeAffinity),
      reason: 'popular' as const,
    }))
    .filter((item) => item.score > 0) // SCOPE 5: No eliminar spots con dislike, solo reducir score
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return scored;
}

/**
 * Obtener Spots recientes
 */
export function getRecentSpots(
  spots: Spot[],
  limit: number = 5
): GemSpot[] {
  return spots
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit)
    .map((spot) => ({
      spot,
      reason: 'recent' as const,
      score: 1,
    }));
}

/**
 * Obtener Spots sugeridos (basados en interacciones pero no guardados) - SCOPE 5: mejorado con afinidad
 * V1.2: Excluye spots con Pin (cualquier estado) - filtro binario
 */
export function getSuggestedSpots(
  spots: Spot[],
  isSpotPinned: (spotId: string) => boolean, // V1.2: Funci?n para verificar si spot tiene Pin
  limit: number = 5,
  notMyVibeSpots: string[] = [], // SCOPE 5: Considerar dislikes
  spotTypeAffinity?: Record<string, SpotTypeAffinity> // SCOPE 5: Afinidad por tipo
): GemSpot[] {
  // V1.2: Excluir spots con Pin (cualquier estado)
  // SCOPE 5: Basado en afinidad por tipo de spot (refuerza recomendaciones similares)
  // Nota: Sin likedSpots/savedSpots, la l?gica de tipos se simplifica
  // Se mantiene la estructura para compatibilidad pero sin filtrar por tipos de spots liked
  
  return spots
    .filter((spot) => !isSpotPinned(spot.id)) // V1.2: Excluir spots con Pin
    .filter((spot) => !notMyVibeSpots.includes(spot.id)) // SCOPE 5: Excluir dislikes
    .slice(0, limit)
    .map((spot) => ({
      spot,
      reason: 'suggested' as const,
      score: 1,
    }));
}

/**
 * Obtener Paths sugeridos basados en Spots con Pin
 * V1.2: Usa sistema de Pins en lugar de savedSpots legacy
 */
export function getSuggestedPaths(
  paths: Path[],
  getPinnedSpots: () => string[], // V1.2: Funci?n para obtener IDs de spots con Pin
  allSpots: Spot[],
  limit: number = 3
): GemPath[] {
  const pinnedSpots = getPinnedSpots();
  
  if (pinnedSpots.length === 0) {
    return [];
  }
  
  // Score paths basado en cu?ntos spots con Pin contiene
  const scored = paths
    .map((path) => {
      const pathSpots = path.spots;
      const matchingSpots = pathSpots.filter((spotId) => pinnedSpots.includes(spotId));
      const score = matchingSpots.length;
      
      return {
        path,
        score,
        reason: 'suggested' as const,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  return scored;
}

/**
 * Obtener todos los Gems (Spots destacados, recientes, sugeridos)
 * V1.2: Actualizado para usar sistema de Pins
 */
export function getAllGems(
  spots: Spot[],
  isSpotPinned: (spotId: string) => boolean, // V1.2: Función para verificar si spot tiene Pin
  options: {
    featuredLimit?: number;
    recentLimit?: number;
    suggestedLimit?: number;
  } = {},
  notMyVibeSpots: string[] = [],
  spotTypeAffinity?: Record<string, SpotTypeAffinity>
): {
  featured: GemSpot[];
  recent: GemSpot[];
  suggested: GemSpot[];
} {
  const { featuredLimit = 5, recentLimit = 5, suggestedLimit = 5 } = options;
  
  return {
    featured: getFeaturedSpots(spots, isSpotPinned, featuredLimit, notMyVibeSpots, spotTypeAffinity),
    recent: getRecentSpots(spots, recentLimit), // V1.2: New NO filtra por Pin - muestra todos los spots recientes
    suggested: getSuggestedSpots(spots, isSpotPinned, suggestedLimit, notMyVibeSpots, spotTypeAffinity),
  };
}

