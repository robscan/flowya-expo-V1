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
 * FASE 7: Extendido para soportar WorldSpots sin locationRegion
 * - Genera regiones desde location.city/country cuando no hay locationRegion
 * - Mantiene compatibilidad con spots que ya tienen locationRegion canónico
 * 
 * IMPORTANTE:
 * - Esta función NO calcula regiones en runtime
 * - Solo lee locationRegion canónico de spots existentes
 * - Para WorldSpots, genera locationRegion desde city/country
 * - Home debe usar esta función, nunca calcular regiones al vuelo
 */

import { Spot } from '@/data/spots';
import { LocationRegion } from '@/types/locationRegion';
import { UnifiedSpot } from '@/utils/worldSpotHelpers';
import { generateCanonicalRegionId } from './regionIdGenerator';

/**
 * Mapeo de nombres de países a códigos ISO 3166-1 alpha-2
 * FASE 7: Para generar regionId canónicos desde WorldSpots
 */
const COUNTRY_TO_ISO_CODE: Record<string, string> = {
  'Argentina': 'AR',
  'Austria': 'AT',
  'Belgium': 'BE',
  'Belize': 'BZ',
  'Bolivia': 'BO',
  'Brazil': 'BR',
  'Canada': 'CA',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Costa Rica': 'CR',
  'Czech Republic': 'CZ',
  'Denmark': 'DK',
  'Ecuador': 'EC',
  'Finland': 'FI',
  'France': 'FR',
  'Germany': 'DE',
  'Greece': 'GR',
  'Guatemala': 'GT',
  'Hungary': 'HU',
  'Ireland': 'IE',
  'Italy': 'IT',
  'Mexico': 'MX',
  'Netherlands': 'NL',
  'Norway': 'NO',
  'Panama': 'PA',
  'Peru': 'PE',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Puerto Rico': 'PR',
  'Spain': 'ES',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Turkey': 'TR',
  'United Kingdom': 'GB',
  'United States': 'US',
};

/**
 * Convertir nombre de país a código ISO 3166-1 alpha-2
 * FASE 7: Helper para generar regionId canónicos desde WorldSpots
 */
function getCountryCode(countryName: string | undefined): string | null {
  if (!countryName || typeof countryName !== 'string') {
    return null;
  }

  const normalizedName = countryName.trim();
  const code = COUNTRY_TO_ISO_CODE[normalizedName];
  
  if (code) {
    return code;
  }

  // Fallback: intentar mapear por nombre común (case-insensitive)
  const normalizedNameLower = normalizedName.toLowerCase();
  for (const [key, value] of Object.entries(COUNTRY_TO_ISO_CODE)) {
    if (key.toLowerCase() === normalizedNameLower) {
      return value;
    }
  }

  return null;
}

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
 * FASE 7: Extendido para soportar UnifiedSpot (UserSpots + WorldSpots)
 * - Procesa spots con locationRegion canónico (UserSpots)
 * - Genera regiones desde location.city/country para spots sin locationRegion (WorldSpots)
 * 
 * Esta función:
 * - Consulta spots existentes (NO calcula regiones)
 * - Extrae regionIds únicos de spots con locationRegion canónico
 * - Para WorldSpots sin locationRegion, genera LocationRegion desde city/country
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
 * @param spots - Array de spots existentes (UserSpots + WorldSpots)
 * @returns Array de regiones disponibles (solo las que tienen spots, deduplicadas por regionId)
 */
export function getAvailableRegionsFromSpots(spots: UnifiedSpot[]): RegionOption[] {
  // Mapa de regionId -> LocationRegion para deduplicar
  // IMPORTANTE: Un regionId = una opción en el dropdown (no por label)
  const regionsMap = new Map<string, LocationRegion>();
  
  spots.forEach((spot) => {
    let region: LocationRegion | null = null;

    // Caso 1: Spot con locationRegion canónico (UserSpots)
    if (spot.locationRegion && 
        typeof spot.locationRegion === 'object' && 
        'regionId' in spot.locationRegion) {
      region = spot.locationRegion as LocationRegion;
    }
    // Caso 2: Spot sin locationRegion pero con city/country (WorldSpots)
    else if (spot.location?.city && spot.location?.country) {
      const city = spot.location.city.trim();
      const countryName = spot.location.country.trim();
      const countryCode = getCountryCode(countryName);

      // Solo generar región si tenemos código de país válido
      if (countryCode && city) {
        try {
          // Generar regionId canónico
          const regionId = generateCanonicalRegionId(countryCode, city, 'city');
          
          // Crear LocationRegion temporal
          region = {
            regionId,
            label: city,
            type: 'city',
            countryCode,
          };
        } catch (error) {
          // Si hay error generando regionId, saltar este spot
          if (__DEV__) {
            console.warn(`Failed to generate regionId for ${city}, ${countryName}:`, error);
          }
          return;
        }
      }
    }

    // Validar que la región tenga datos válidos (no vacía)
    if (region &&
        region.regionId && 
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
 * FASE 7: Extendido para soportar UnifiedSpot (UserSpots + WorldSpots)
 * - Filtra spots con locationRegion canónico (UserSpots)
 * - Genera regionId desde city/country para WorldSpots sin locationRegion
 * 
 * Esta función:
 * - Filtra spots que tienen locationRegion canónico
 * - Para WorldSpots sin locationRegion, genera regionId desde city/country
 * - Compara por regionId (nunca por label o texto libre)
 * - Excluye spots sin región canónica (o sin city/country para WorldSpots)
 * 
 * @param spots - Array de spots a filtrar (UserSpots + WorldSpots)
 * @param regionId - regionId de la región objetivo (null = todas las regiones)
 * @returns Array de spots filtrados por región
 */
export function getSpotsByRegion(spots: UnifiedSpot[], regionId: string | null): UnifiedSpot[] {
  if (!regionId) {
    return spots; // null = todas las regiones
  }
  
  // Comparar por regionId (canónico) - NUNCA comparar por strings libres
  return spots.filter((spot) => {
    let spotRegionId: string | null = null;

    // Caso 1: Spot con locationRegion canónico (UserSpots)
    if (spot.locationRegion && 
        typeof spot.locationRegion === 'object' && 
        'regionId' in spot.locationRegion) {
      const region = spot.locationRegion as LocationRegion;
      spotRegionId = region.regionId;
    }
    // Caso 2: Spot sin locationRegion pero con city/country (WorldSpots)
    else if (spot.location?.city && spot.location?.country) {
      const city = spot.location.city.trim();
      const countryName = spot.location.country.trim();
      const countryCode = getCountryCode(countryName);

      // Solo generar regionId si tenemos código de país válido
      if (countryCode && city) {
        try {
          spotRegionId = generateCanonicalRegionId(countryCode, city, 'city');
        } catch (error) {
          // Si hay error generando regionId, excluir este spot
          return false;
        }
      }
    }

    // Comparar regionId generado/obtenido con el regionId objetivo
    return spotRegionId === regionId;
  });
}
