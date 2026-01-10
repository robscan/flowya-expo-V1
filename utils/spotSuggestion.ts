/**
 * Spot Suggestion System
 * Sistema de sugerencia de spots para enriquecer flows durante la navegación
 * 
 * Algoritmo de scoring:
 * - Proximidad (30%): spots cercanos al starting spot
 * - Tipo similar (20%): mismo tipo o tipos complementarios
 * - Afinidad del usuario (25%): spots guardados/liked cercanos
 * - Popularidad (15%): spots en flows guardados por otros usuarios
 * - Diversidad (10%): evitar repetir tipos ya en el flow
 */

import { Flow, getFlowSpots } from '@/data/flows';
import { Spot, SpotType } from '@/data/spots';
import { calculateDistanceToSpot } from '@/utils/distance';

import { SpotTypeAffinity } from '@/contexts/SavedContext'; // SCOPE 5: Afinidad por tipo de spot

export interface SuggestionContext {
  savedSpots: string[];
  likedSpots: string[];
  notMyVibeSpots?: string[]; // SCOPE 5: Considerar dislikes
  savedFlows: string[];
  allFlows: Flow[];
  spotTypeAffinity?: Record<string, SpotTypeAffinity>; // SCOPE 5: Afinidad por tipo
}

/**
 * Tipos complementarios (spots que van bien juntos)
 */
const COMPLEMENTARY_TYPES: Record<SpotType, SpotType[]> = {
  beach: ['viewpoint', 'park', 'cafe'],
  cafe: ['restaurant', 'market', 'viewpoint'],
  viewpoint: ['park', 'monument', 'beach'],
  museum: ['monument', 'park', 'restaurant'],
  restaurant: ['cafe', 'market', 'park'],
  park: ['viewpoint', 'monument', 'beach'],
  monument: ['museum', 'park', 'viewpoint'],
  market: ['restaurant', 'cafe', 'park'],
  other: ['viewpoint', 'park', 'cafe'],
};

/**
 * Calcular score de proximidad (0-100)
 */
function calculateProximityScore(
  spot: Spot,
  startingSpot: Spot,
  maxDistance: number = 5000 // 5km máximo
): number {
  const distance = calculateDistanceToSpot(startingSpot.location, spot.location);
  if (!distance || distance > maxDistance) {
    return 0;
  }
  
  // Score inverso: más cerca = mayor score
  // 0m = 100 puntos, 5km = 0 puntos
  return Math.max(0, 100 - (distance / maxDistance) * 100);
}

/**
 * Calcular score de tipo similar (0-100)
 */
function calculateTypeScore(spot: Spot, startingSpot: Spot): number {
  // Mismo tipo: 100 puntos
  if (spot.type === startingSpot.type) {
    return 100;
  }
  
  // Tipo complementario: 60 puntos
  const complementaryTypes = COMPLEMENTARY_TYPES[startingSpot.type] || [];
  if (complementaryTypes.includes(spot.type)) {
    return 60;
  }
  
  // Otro tipo: 20 puntos (diversidad)
  return 20;
}

/**
 * Calcular score de afinidad del usuario (0-100) - SCOPE 5: mejorado con afinidad por tipo y dislike
 */
function calculateAffinityScore(
  spot: Spot,
  context: SuggestionContext,
  userLocation: { latitude: number; longitude: number } | null
): number {
  let score = 0;
  
  // Spots guardados: 80 puntos
  if (context.savedSpots.includes(spot.id)) {
    score += 80;
  }
  
  // Spots liked: 60 puntos
  if (context.likedSpots.includes(spot.id)) {
    score += 60;
  }
  
  // SCOPE 5: Afinidad por tipo de spot (refuerza spots similares)
  if (context.spotTypeAffinity && context.spotTypeAffinity[spot.type]) {
    const affinity = context.spotTypeAffinity[spot.type];
    // Agregar boost basado en afinidad (score puede ser -10 a 10, normalizar a -30 a 30 puntos)
    score += Math.round((affinity.score / 10) * 30);
  }
  
  // SCOPE 5: Reducir score si está en notMyVibe (no eliminar, solo reducir)
  if (context.notMyVibeSpots && context.notMyVibeSpots.includes(spot.id)) {
    score = Math.max(0, score - 20); // Reducir 20 puntos pero no eliminar
  }
  
  // Spots en flows guardados: 40 puntos
  const isInSavedFlow = context.allFlows.some(
    (flow) => context.savedFlows.includes(flow.id) && flow.spots.includes(spot.id)
  );
  if (isInSavedFlow) {
    score += 40;
  }
  
  // Bonus por cercanía si el usuario tiene ubicación
  if (userLocation) {
    const distance = calculateDistanceToSpot(userLocation, spot.location);
    if (distance && distance < 2000) {
      // Bonus de 20 puntos si está a menos de 2km
      score += 20;
    }
  }
  
  return Math.min(score, 100);
}

/**
 * Calcular score de popularidad (0-100)
 * Basado en cuántos flows guardados contienen este spot
 */
function calculatePopularityScore(
  spot: Spot,
  context: SuggestionContext
): number {
  const flowsContainingSpot = context.allFlows.filter((flow) =>
    flow.spots.includes(spot.id)
  );
  
  if (flowsContainingSpot.length === 0) {
    return 0;
  }
  
  // Normalizar: 1 flow = 20 puntos, 5+ flows = 100 puntos
  return Math.min(100, flowsContainingSpot.length * 20);
}

/**
 * Calcular score de diversidad (0-100)
 * Penalizar spots del mismo tipo que ya están en el flow
 */
function calculateDiversityScore(
  spot: Spot,
  currentFlowSpots: Spot[]
): number {
  if (currentFlowSpots.length === 0) {
    return 100; // Sin spots previos, máxima diversidad
  }
  
  // Contar cuántos spots del mismo tipo ya están en el flow
  const sameTypeCount = currentFlowSpots.filter((s) => s.type === spot.type).length;
  
  // Si no hay del mismo tipo: 100 puntos
  if (sameTypeCount === 0) {
    return 100;
  }
  
  // Si hay 1 del mismo tipo: 70 puntos
  if (sameTypeCount === 1) {
    return 70;
  }
  
  // Si hay 2+ del mismo tipo: 30 puntos (penalización)
  return 30;
}

/**
 * Sugerir spots para un flow basado en el spot inicial
 */
export function suggestSpotsForFlow(
  startingSpot: Spot,
  userLocation: { latitude: number; longitude: number } | null,
  allSpots: Spot[],
  context: SuggestionContext,
  currentFlow?: Flow,
  limit: number = 5
): Spot[] {
  // Obtener spots del flow actual si existe
  const currentFlowSpots = currentFlow
    ? getFlowSpots(currentFlow, allSpots)
    : [];
  
  // Filtrar spots que ya están en el flow
  const availableSpots = allSpots.filter(
    (spot) =>
      spot.id !== startingSpot.id &&
      (!currentFlow || !currentFlow.spots.includes(spot.id))
  );
  
  // Calcular scores para cada spot
  const scoredSpots = availableSpots.map((spot) => {
    const proximityScore = calculateProximityScore(spot, startingSpot) * 0.3;
    const typeScore = calculateTypeScore(spot, startingSpot) * 0.2;
    const affinityScore = calculateAffinityScore(spot, context, userLocation) * 0.25;
    const popularityScore = calculatePopularityScore(spot, context) * 0.15;
    const diversityScore = calculateDiversityScore(spot, currentFlowSpots) * 0.1;
    
    const totalScore = proximityScore + typeScore + affinityScore + popularityScore + diversityScore;
    
    return {
      spot,
      score: totalScore,
      proximityScore,
      typeScore,
      affinityScore,
      popularityScore,
      diversityScore,
    };
  });
  
  // Ordenar por score total y retornar los top N
  return scoredSpots
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.spot);
}

/**
 * Actualizar sugerencias dinámicamente mientras el usuario navega
 * Considera el spot actual del flow, no solo el inicial
 */
export function updateSuggestionsForCurrentSpot(
  currentSpot: Spot,
  userLocation: { latitude: number; longitude: number } | null,
  allSpots: Spot[],
  context: SuggestionContext,
  currentFlow: Flow,
  limit: number = 5
): Spot[] {
  return suggestSpotsForFlow(
    currentSpot,
    userLocation,
    allSpots,
    context,
    currentFlow,
    limit
  );
}

