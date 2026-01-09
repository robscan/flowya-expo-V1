/**
 * Get Available Regions From Spots - Core Module
 * CANONICAL: ÚNICA función para obtener regiones disponibles desde spots
 * 
 * Responsabilidad EXCLUSIVA:
 * - Consulta spots existentes
 * - Agrupa por locationRegion.regionId
 * - Retorna lista única de regiones que sí tienen spots
 * - Ordenadas alfabéticamente
 * - Con label listo para UI
 * 
 * IMPORTANTE:
 * - Esta función NO calcula regiones en runtime
 * - Solo lee locationRegion canónico de spots existentes
 * - Home debe usar esta función, nunca calcular regiones al vuelo
 */

import { Spot } from '@/data/spots';
import { LocationRegion } from '@/types/locationRegion';

/**
 * Estructura de región para UI (label + regionId)
 * CANONICAL: Usado para dropdown y selección en Home Header
 */
export interface RegionOption {
  regionId: string;
  label: string;
  type: LocationRegion['type'];
  countryCode: string;
}

/**
 * Obtener lista de regiones disponibles desde spots existentes
 * CANONICAL: Usa regionId para deduplicar, retorna labels para UI
 * 
 * Esta función:
 * - Consulta spots existentes (NO calcula regiones)
 * - Extrae regionIds únicos de spots con locationRegion canónico
 * - DEDUPLICA por regionId (no por label) - un regionId = una opción
 * - Retorna labels para mostrar en UI
 * - Ordena por label alfabéticamente
 * - Solo incluye regiones que tienen al menos un spot
 * - Filtra regiones vacías o inválidas
 * 
 * REGLAS DE ORDEN:
 * - "All regions" siempre arriba (manejado en UI)
 * - Regiones ordenadas alfabéticamente por label
 * - Sin duplicados (deduplicación por regionId)
 * - Sin regiones vacías
 * 
 * @param spots - Array de spots existentes
 * @returns Array de regiones disponibles (solo las que tienen spots, deduplicadas por regionId)
 */
export function getAvailableRegionsFromSpots(spots: Spot[]): RegionOption[] {
  // Mapa de regionId -> LocationRegion para deduplicar
  // IMPORTANTE: Un regionId = una opción en el dropdown (no por label)
  const regionsMap = new Map<string, LocationRegion>();
  
  spots.forEach((spot) => {
    // Solo incluir spots con locationRegion canónico (objeto LocationRegion)
    if (spot.locationRegion && 
        typeof spot.locationRegion === 'object' && 
        'regionId' in spot.locationRegion) {
      const region = spot.locationRegion as LocationRegion;
      
      // Validar que la región tenga datos válidos (no vacía)
      if (region.regionId && 
          region.regionId.trim() !== '' && 
          region.label && 
          region.label.trim() !== '' &&
          region.type &&
          region.countryCode &&
          region.countryCode.trim() !== '') {
        
        // Usar regionId como clave para deduplicar (CANONICAL: nunca comparar por strings/libres)
        // Si el mismo regionId aparece múltiples veces, solo se guarda una vez
        if (!regionsMap.has(region.regionId)) {
          regionsMap.set(region.regionId, region);
        }
      }
    }
  });
  
  // Convertir a array de RegionOption y ordenar por label alfabéticamente
  // "All regions" se maneja en el componente UI, no aquí
  return Array.from(regionsMap.values())
    .map((region) => ({
      regionId: region.regionId,
      label: region.label,
      type: region.type,
      countryCode: region.countryCode,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Filtrar spots por región usando regionId canónico
 * CANONICAL: Compara por regionId (nunca por strings libres)
 * 
 * Esta función:
 * - Filtra spots que tienen locationRegion canónico
 * - Compara por regionId (nunca por label o texto libre)
 * - Excluye spots sin región canónica
 * 
 * @param spots - Array de spots a filtrar
 * @param regionId - regionId de la región objetivo (null = todas las regiones)
 * @returns Array de spots filtrados por región
 */
export function getSpotsByRegion(spots: Spot[], regionId: string | null): Spot[] {
  if (!regionId) {
    return spots; // null = todas las regiones
  }
  
  // Comparar por regionId (canónico) - NUNCA comparar por strings libres
  return spots.filter((spot) => {
    // Solo incluir spots con locationRegion canónico
    if (spot.locationRegion && 
        typeof spot.locationRegion === 'object' && 
        'regionId' in spot.locationRegion) {
      const region = spot.locationRegion as LocationRegion;
      return region.regionId === regionId;
    }
    return false; // Excluir spots sin región canónica
  });
}
