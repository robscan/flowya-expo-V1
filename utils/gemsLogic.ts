/**
 * Gems Logic - Algoritmo de recomendación para Gems
 * Scope 9: Gems Screen - Lógica de recomendación
 * 
 * Funcionalidades:
 * - Algoritmo simple de recomendación
 * - Basado en interacciones (views, saves, likes)
 * - Spots recientes
 * - Paths sugeridos basados en Spots guardados
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
 * SCOPE 5: Aplicar penalización de Dislike (reducir score ligeramente, nunca eliminarlo)
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
 */
function calculatePopularityScore(
  spot: Spot,
  likedSpots: string[],
  savedSpots: string[],
  notMyVibeSpots: string[] = [], // SCOPE 5: Considerar dislikes
  spotTypeAffinity?: Record<string, SpotTypeAffinity> // SCOPE 5: Afinidad por tipo
): number {
  let score = 0;
  
  // Likes dan más peso
  if (likedSpots.includes(spot.id)) {
    score += 3;
  }
  
  // Saves dan peso medio
  if (savedSpots.includes(spot.id)) {
    score += 2;
  }
  
  // SCOPE 5: Afinidad por tipo de spot (aumentar score si tipo tiene afinidad positiva)
  if (spotTypeAffinity && spotTypeAffinity[spot.type]) {
    const affinity = spotTypeAffinity[spot.type];
    // Agregar boost basado en afinidad (score puede ser -10 a 10, normalizar a -3 a 3)
    score += Math.round((affinity.score / 10) * 3);
  }
  
  // SCOPE 5: Aplicar penalización de dislike (ligera, no elimina)
  score += applyDislikePenalty(spot, notMyVibeSpots);
  
  // Spots con nombre tienen más peso
  if (spot.name) {
    score += 1;
  }
  
  // Spots con fotos tienen más peso
  if (spot.photos && spot.photos.length > 0) {
    score += 1;
  }
  
  return score;
}

/**
 * Obtener Spots destacados (populares) - SCOPE 5: mejorado con afinidad y dislike
 */
export function getFeaturedSpots(
  spots: Spot[],
  likedSpots: string[],
  savedSpots: string[],
  limit: number = 5,
  notMyVibeSpots: string[] = [], // SCOPE 5: Considerar dislikes
  spotTypeAffinity?: Record<string, SpotTypeAffinity> // SCOPE 5: Afinidad por tipo
): GemSpot[] {
  const scored = spots
    .map((spot) => ({
      spot,
      score: calculatePopularityScore(spot, likedSpots, savedSpots, notMyVibeSpots, spotTypeAffinity),
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
 */
export function getSuggestedSpots(
  spots: Spot[],
  likedSpots: string[],
  savedSpots: string[],
  limit: number = 5,
  notMyVibeSpots: string[] = [], // SCOPE 5: Considerar dislikes
  spotTypeAffinity?: Record<string, SpotTypeAffinity> // SCOPE 5: Afinidad por tipo
): GemSpot[] {
  // Spots que no están guardados pero podrían interesar
  // SCOPE 5: Basado en afinidad por tipo de spot (refuerza recomendaciones similares)
  const userLikedTypes = new Set(
    spots
      .filter((spot) => likedSpots.includes(spot.id))
      .map((spot) => spot.type)
  );
  
  return spots
    .filter((spot) => !savedSpots.includes(spot.id) && !likedSpots.includes(spot.id))
    .filter((spot) => userLikedTypes.has(spot.type))
    .slice(0, limit)
    .map((spot) => ({
      spot,
      reason: 'suggested' as const,
      score: 1,
    }));
}

/**
 * Obtener Paths sugeridos basados en Spots guardados
 */
export function getSuggestedPaths(
  paths: Path[],
  savedSpots: string[],
  allSpots: Spot[],
  limit: number = 3
): GemPath[] {
  if (savedSpots.length === 0) {
    return [];
  }
  
  // Score paths basado en cuántos spots guardados contiene
  const scored = paths
    .map((path) => {
      const pathSpots = path.spots;
      const matchingSpots = pathSpots.filter((spotId) => savedSpots.includes(spotId));
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
 */
export function getAllGems(
  spots: Spot[],
  likedSpots: string[],
  savedSpots: string[],
  options: {
    featuredLimit?: number;
    recentLimit?: number;
    suggestedLimit?: number;
  } = {}
): {
  featured: GemSpot[];
  recent: GemSpot[];
  suggested: GemSpot[];
} {
  const { featuredLimit = 5, recentLimit = 5, suggestedLimit = 5 } = options;
  
  return {
    featured: getFeaturedSpots(spots, likedSpots, savedSpots, featuredLimit),
    recent: getRecentSpots(spots, recentLimit),
    suggested: getSuggestedSpots(spots, likedSpots, savedSpots, suggestedLimit),
  };
}

