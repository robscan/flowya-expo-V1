/**
 * WorldSpot Helpers - Utilidades para trabajar con WorldSpots
 * FASE 7: Integración de World Seeds
 * 
 * Funciones helper para combinar, filtrar y trabajar con WorldSpots y UserSpots
 */

import { Spot } from '@/data/spots';
import { WorldSpot } from '@/contexts/WorldSpotContext';

/**
 * Tipo unificado para spots (puede ser UserSpot o WorldSpot)
 */
export type UnifiedSpot = Spot | WorldSpot;

/**
 * Verificar si un spot es un WorldSpot
 */
export function isWorldSpot(spot: UnifiedSpot): spot is WorldSpot {
  return 'isWorldSpot' in spot && spot.isWorldSpot === true;
}

/**
 * Verificar si un spot es un UserSpot
 */
export function isUserSpot(spot: UnifiedSpot): spot is Spot {
  return !isWorldSpot(spot);
}

/**
 * Combinar UserSpots y WorldSpots en un array unificado
 * FASE 7: Permite mostrar ambos tipos de spots juntos en la UI
 * 
 * REGLA DE UNICIDAD: Si existe un User Spot derivado de un World Spot,
 * el World Spot NO se muestra (evita duplicados)
 */
export function combineSpots(userSpots: Spot[], worldSpots: WorldSpot[]): UnifiedSpot[] {
  // Crear Set de IDs de World Spots que ya tienen User Spot derivado
  const worldSpotIdsWithUserSpot = new Set(
    userSpots
      .map((spot) => spot.originWorldSpotId)
      .filter((id): id is string => id !== undefined)
  );

  // Filtrar World Spots: excluir los que ya tienen User Spot derivado
  const filteredWorldSpots = worldSpots.filter(
    (worldSpot) => !worldSpotIdsWithUserSpot.has(worldSpot.id)
  );

  // Combinar: User Spots primero (prioridad), luego World Spots filtrados
  return [...userSpots, ...filteredWorldSpots];
}

/**
 * Filtrar spots por tipo (funciona con ambos tipos)
 */
export function filterSpotsByType(spots: UnifiedSpot[], type: Spot['type']): UnifiedSpot[] {
  return spots.filter((spot) => spot.type === type);
}

/**
 * Buscar spots (funciona con ambos tipos)
 */
export function searchSpots(spots: UnifiedSpot[], query: string): UnifiedSpot[] {
  const lowerQuery = query.toLowerCase();
  return spots.filter(
    (spot) =>
      spot.name.toLowerCase().includes(lowerQuery) ||
      spot.location.city?.toLowerCase().includes(lowerQuery) ||
      spot.location.country?.toLowerCase().includes(lowerQuery) ||
      spot.shortDescription?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Obtener distancia a un spot (compatible con ambos tipos)
 */
export function getSpotDistance(
  spot: UnifiedSpot,
  userLocation: { latitude: number; longitude: number }
): number | undefined {
  if (!userLocation) return undefined;

  const loc = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number };
  const lat = 'lat' in loc && loc.lat !== undefined ? loc.lat : (loc.latitude ?? 0);
  const lng = 'lng' in loc && loc.lng !== undefined ? loc.lng : (loc.longitude ?? 0);

  if (lat === 0 && lng === 0) return undefined;

  // Usar fórmula de Haversine
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat - userLocation.latitude) * Math.PI) / 180;
  const dLon = ((lng - userLocation.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((userLocation.latitude * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Ordenar spots por distancia (compatible con ambos tipos)
 */
export function sortSpotsByDistance(
  spots: UnifiedSpot[],
  userLocation: { latitude: number; longitude: number } | null
): UnifiedSpot[] {
  if (!userLocation) return spots;

  return [...spots].sort((a, b) => {
    const distA = getSpotDistance(a, userLocation) ?? Infinity;
    const distB = getSpotDistance(b, userLocation) ?? Infinity;
    return distA - distB;
  });
}
