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
 * 
 * V1.2: ORDEN ESTABLE - Cuando un WorldSpot se convierte a UserSpot,
 * el UserSpot reemplaza al WorldSpot en la misma posición para mantener
 * el orden estable y evitar que las cards se muevan.
 */
export function combineSpots(userSpots: Spot[], worldSpots: WorldSpot[]): UnifiedSpot[] {
  // Crear Map de originWorldSpotId -> UserSpot para búsqueda rápida
  const userSpotsByOrigin = new Map<string, Spot>();
  userSpots.forEach((spot) => {
    if (spot.originWorldSpotId) {
      userSpotsByOrigin.set(spot.originWorldSpotId, spot);
    }
  });

  // Crear Set de IDs de World Spots que ya tienen User Spot derivado
  const worldSpotIdsWithUserSpot = new Set(userSpotsByOrigin.keys());

  // V1.2: Mantener orden estable - reemplazar WorldSpot con UserSpot en la misma posición
  // Esto previene que las cards se muevan cuando se convierte un WorldSpot a UserSpot
  const combined: UnifiedSpot[] = [];
  
  // Primero agregar WorldSpots (si no tienen UserSpot derivado) en su orden original
  worldSpots.forEach((worldSpot) => {
    if (worldSpotIdsWithUserSpot.has(worldSpot.id)) {
      // Este WorldSpot tiene un UserSpot derivado, usar el UserSpot en su lugar
      const userSpot = userSpotsByOrigin.get(worldSpot.id);
      if (userSpot) {
        combined.push(userSpot);
      }
    } else {
      // Este WorldSpot no tiene UserSpot derivado, mantenerlo
      combined.push(worldSpot);
    }
  });
  
  // Luego agregar UserSpots que no tienen originWorldSpotId (spots creados directamente)
  userSpots.forEach((userSpot) => {
    if (!userSpot.originWorldSpotId) {
      combined.push(userSpot);
    }
    // Si tiene originWorldSpotId, ya fue agregado arriba en lugar del WorldSpot
  });

  return combined;
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
