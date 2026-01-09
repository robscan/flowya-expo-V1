/**
 * Data Preparation - Funciones Puras de Preparación de Datos
 * SCOPE 3: Preparación de Datos Canónica
 * 
 * Principios:
 * - Funciones puras (sin side-effects)
 * - Fuera de componentes
 * - Memoizables
 * - Testeables
 * 
 * Responsabilidades:
 * - Filtrar, ordenar, agrupar datos
 * - Calcular distancias
 * - Preparar datos para renderizado
 * - NO hacer llamadas a APIs
 * - NO modificar datos originales
 */

import { BaseLocation } from '@/contexts/LocationContext';
import { Flow } from '@/data/flows';
import { Spot } from '@/data/spots';
import { LocationRegion } from '@/types/locationRegion';
import { getAvailableRegionsFromSpots, getSpotsByRegion, RegionOption } from '@/core/region';
import { getSpotDistance } from '@/hooks/useSpotDistance';
import { isFlowComplete } from '@/utils/flowValidation';
import { getFeaturedSpots, getRecentSpots } from '@/utils/gemsLogic';

// ============================================================================
// TIPOS
// ============================================================================
// BaseLocation importado desde LocationContext (fuente única de verdad)

export interface SpotWithDistance {
  spot: Spot;
  distance?: number; // Pre-calculada, estable
}

export interface FlowWithDistance {
  flow: Flow;
  distance?: number; // Pre-calculada, estable
}

export interface HomeData {
  nearbySpots: SpotWithDistance[];
  forYouSpots: SpotWithDistance[];
  recommendedSpots: SpotWithDistance[];
  maybeYouLikeSpots: SpotWithDistance[];
  newSpots: SpotWithDistance[];
  nearbyFlows: FlowWithDistance[];
  availableRegions: RegionOption[]; // Regiones con spots disponibles (canónicas)
  selectedRegionId: string | null; // regionId activo (null = todas)
}

// ============================================================================
// FUNCIONES DE PREPARACIÓN
// ============================================================================

// Re-exportar RegionOption desde core para compatibilidad
export type { RegionOption } from '@/core/region';

/**
 * Preparar datos para Home Screen
 * 
 * Función pura que:
 * - Filtra spots por cercanía, preferencias, popularidad
 * - Calcula distancias
 * - Ordena y limita resultados
 * - Evita duplicados entre secciones
 * - Filtra por región seleccionada si está definida
 * 
 * @param spots - Array de spots
 * @param flows - Array de flows
 * @param baseLocation - Ubicación base del usuario (opcional)
 * @param likedSpots - IDs de spots que el usuario ha liked
 * @param savedSpots - IDs de spots que el usuario ha guardado
 * @param selectedRegionId - regionId seleccionado (opcional, null = todas)
 * @returns Datos preparados para Home Screen
 */
export function prepareHomeData(
  spots: Spot[],
  flows: Flow[],
  baseLocation: BaseLocation | null,
  likedSpots: string[],
  savedSpots: string[],
  selectedRegionId: string | null = null
): HomeData {
  // Filtrar spots por región usando regionId (canónico)
  // CANONICAL: Usa función desde core - Home NO calcula regiones en runtime
  const filteredSpots = getSpotsByRegion(spots, selectedRegionId);
  
  // Obtener regiones disponibles (desde todos los spots, no filtrados)
  // CANONICAL: Usa función desde core - Home solo consulta spots existentes
  const availableRegions = getAvailableRegionsFromSpots(spots);
  const usedSpotIds = new Set<string>();

  // 1. Nearby spots (highest priority)
  const nearbySpots: SpotWithDistance[] = (() => {
    if (!baseLocation) return [];
    
    const nearby = filteredSpots
      .map((spot) => {
        const distance = getSpotDistance(spot, baseLocation);
        return {
          spot,
          distance: distance !== undefined ? distance : Infinity,
        };
      })
      .filter((item) => item.distance !== Infinity && item.distance < 5000) // Less than 5km
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10)
      .map((item) => {
        usedSpotIds.add(item.spot.id);
        return {
          spot: item.spot,
          distance: item.distance,
        };
      });
    
    return nearby;
  })();

  // 2. For You spots (based on user interactions)
  const forYouSpots: SpotWithDistance[] = (() => {
    const userLikedTypes = new Set(
      filteredSpots
        .filter((spot) => likedSpots.includes(spot.id) || savedSpots.includes(spot.id))
        .map((spot) => spot.type)
    );

    const forYou = filteredSpots
      .filter((spot) => !usedSpotIds.has(spot.id))
      .filter((spot) => userLikedTypes.has(spot.type) || likedSpots.includes(spot.id) || savedSpots.includes(spot.id))
      .slice(0, 10)
      .map((spot) => {
        usedSpotIds.add(spot.id);
        return {
          spot,
          distance: getSpotDistance(spot, baseLocation),
        };
      });
    
    return forYou;
  })();

  // 3. Recommended spots (popular spots not in previous sections)
  const recommendedSpots: SpotWithDistance[] = (() => {
    const scored = filteredSpots
      .filter((spot) => !usedSpotIds.has(spot.id))
      .map((spot) => {
        let score = 0;
        if (likedSpots.includes(spot.id)) score += 3;
        if (savedSpots.includes(spot.id)) score += 2;
        if (spot.name) score += 1;
        if (spot.photos && spot.photos.length > 0) score += 1;
        return { spot, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((item) => {
        usedSpotIds.add(item.spot.id);
        return {
          spot: item.spot,
          distance: getSpotDistance(item.spot, baseLocation),
        };
      });
    
    return scored;
  })();

  // 4. Maybe You Like (global featured spots)
  // IMPORTANTE: Esta sección es GLOBAL, NO depende del filtro de región
  // Usa TODOS los spots, no solo filteredSpots
  // Siempre visible, incluso si no hay spots cercanos
  const maybeYouLikeSpots: SpotWithDistance[] = (() => {
    // Usar TODOS los spots (no filteredSpots) para secciones globales
    const availableSpots = spots.filter((spot) => !usedSpotIds.has(spot.id));
    const featuredGems = getFeaturedSpots(
      availableSpots,
      likedSpots,
      savedSpots,
      10
    );
    const maybeYouLike = featuredGems.map((gem) => {
      usedSpotIds.add(gem.spot.id);
      return {
        spot: gem.spot,
        distance: getSpotDistance(gem.spot, baseLocation),
      };
    });
    
    return maybeYouLike;
  })();

  // 5. New spots (global recent spots)
  // IMPORTANTE: Esta sección es GLOBAL, NO depende del filtro de región
  // Usa TODOS los spots, ordenados por createdAt DESC
  // Siempre visible, incluso si no hay spots cercanos
  const newSpots: SpotWithDistance[] = (() => {
    // Usar TODOS los spots (no filteredSpots) para secciones globales
    const availableSpots = spots.filter((spot) => !usedSpotIds.has(spot.id));
    const recentGems = getRecentSpots(
      availableSpots,
      10
    );
    const newSpotsList = recentGems.map((gem) => {
      usedSpotIds.add(gem.spot.id);
      return {
        spot: gem.spot,
        distance: getSpotDistance(gem.spot, baseLocation),
      };
    });
    
    return newSpotsList;
  })();

  // 6. Nearby flows
  const nearbyFlows: FlowWithDistance[] = (() => {
    // Filtrar flows que contienen spots de la región seleccionada
    // CANONICAL: Usar regionId para comparación (nunca strings)
    const flowsInRegion = selectedRegionId
      ? flows.filter((flow) => {
          return flow.spots.some((spotId) => {
            const spot = spots.find((s) => s.id === spotId);
            // Comparar por regionId canónico
            if (spot?.locationRegion && 
                typeof spot.locationRegion === 'object' && 
                'regionId' in spot.locationRegion) {
              const region = spot.locationRegion as LocationRegion;
              return region.regionId === selectedRegionId;
            }
            return false;
          });
        })
      : flows;
    
    if (!baseLocation) {
      // Sin ubicación: filtrar solo flows completos
      return flowsInRegion
        .filter((flow) => isFlowComplete(flow, filteredSpots))
        .map((flow) => ({ flow, distance: undefined }));
    }
    
    // Sort flows by distance to first spot, filtrando flows incompletos
    return flowsInRegion
      .map((flow) => {
        const pathSpots = flow.spots
          .map((spotId) => filteredSpots.find((s) => s.id === spotId))
          .filter((s): s is Spot => s !== undefined);
        
        if (pathSpots.length === 0) return { flow, distance: Infinity, isComplete: false };
        
        const firstSpotDistance = getSpotDistance(pathSpots[0], baseLocation);
        const distanceValue = firstSpotDistance !== undefined ? firstSpotDistance : Infinity;
        const isComplete = isFlowComplete(flow, spots);
        return { flow, distance: distanceValue, isComplete };
      })
      .filter((item) => item.isComplete)
      .sort((a, b) => a.distance - b.distance)
      .map((item) => ({
        flow: item.flow,
        distance: item.distance !== Infinity ? item.distance : undefined,
      }));
  })();

  return {
    nearbySpots,
    forYouSpots,
    recommendedSpots,
    maybeYouLikeSpots,
    newSpots,
    nearbyFlows,
    availableRegions,
    selectedRegionId,
  };
}

/**
 * Datos vacíos para Home Screen (usado durante carga)
 */
export const emptyHomeData: HomeData = {
  nearbySpots: [],
  forYouSpots: [],
  recommendedSpots: [],
  maybeYouLikeSpots: [],
  newSpots: [],
  nearbyFlows: [],
  availableRegions: [],
  selectedRegionId: null,
};
