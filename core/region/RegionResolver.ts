/**
 * Region Resolver - Core Module
 * CANONICAL: ÚNICA función para resolver regiones en FLOWYA
 * 
 * Responsabilidad EXCLUSIVA:
 * - Dado { lat, lng } → Consulta Mapbox Reverse Geocoding
 * - Devuelve LocationRegion normalizada
 * - Prioridad: place (ciudad) → region (estado/departamento)
 * - NO muestra locality ni country como niveles
 * - Siempre devolver algo estable
 * - Nunca depender del UI
 * 
 * DECISIÓN DE PRODUCTO:
 * - Nivel primario: place (ciudad) - ej: Mexico City, Barcelona, Berlin, Playa del Carmen
 * - Fallback: region (estado/departamento) - ej: Quintana Roo, Jalisco, Catalonia
 * - ❌ NO mostrar locality
 * - ❌ NO mostrar country
 * - ❌ NO mezclar niveles
 * 
 * IMPORTANTE:
 * - Esta es la ÚNICA función que debe usarse para resolver regiones
 * - Todas las demás partes del sistema deben usar esta función
 * - NO crear funciones alternativas para resolver regiones
 */

import { MAPBOX_ACCESS_TOKEN } from '@/utils/mapsConfig';
import { LocationRegion, RegionType } from '@/types/locationRegion';
import { generateCanonicalRegionId } from './regionIdGenerator';

// Cache en memoria para evitar múltiples llamadas a la misma coordenada
const regionCache = new Map<string, LocationRegion | null>();

interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: Record<string, any>;
  text: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
  context?: Array<{
    id: string;
    short_code?: string;
    wikidata?: string;
    text: string;
  }>;
}

interface MapboxGeocodeResponse {
  type: string;
  query: string[];
  features: MapboxFeature[];
  attribution: string;
}

/**
 * Resolver región canónica desde coordenadas usando Mapbox
 * CANONICAL: ÚNICA función para resolver regiones en todo el dominio
 * 
 * Esta función:
 * - Usa Mapbox Geocoding API para obtener información de región
 * - Deriva regionId estable desde countryCode + type + place
 * - Prioriza: place (ciudad) → region (estado/departamento)
 * - NO muestra locality ni country como niveles
 * - Normaliza countryCode a ISO 3166-1 alpha-2 (solo metadata)
 * - Retorna estructura canónica LocationRegion
 * - Cachea resultados para evitar múltiples llamadas
 * 
 * @param latitude - Latitud
 * @param longitude - Longitud
 * @returns Región canónica normalizada o null si no se puede resolver
 */
export async function resolveRegion(
  latitude: number,
  longitude: number
): Promise<LocationRegion | null> {
  const token = MAPBOX_ACCESS_TOKEN;
  if (!token) {
    if (__DEV__) {
      console.warn('⚠️ Mapbox Access Token not configured. Cannot resolve region.');
    }
    return null;
  }

  // Crear clave de cache (redondeada a 4 decimales para evitar duplicados innecesarios)
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  
  // Verificar cache
  if (regionCache.has(cacheKey)) {
    return regionCache.get(cacheKey) ?? null;
  }

  // Mapbox espera [lng, lat] (NO [lat, lng])
  // Solicitamos place, region para elegir el nivel correcto (place primero, region como fallback)
  // También necesitamos country para countryCode (solo metadata, no se muestra como nivel)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&types=place,region&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
    }

    const data: MapboxGeocodeResponse = await response.json();
    
    if (!data.features || data.features.length === 0) {
      regionCache.set(cacheKey, null);
      return null;
    }

    // Extraer información del primer resultado (el más relevante)
    const feature = data.features[0];
    const context = feature.context || [];
    
    // Extraer información de región del context array
    // DECISIÓN DE PRODUCTO: Prioridad place (ciudad) → region (estado/departamento)
    // ❌ NO mostrar locality
    // ❌ NO mostrar country
    // ❌ NO mezclar niveles
    let placeContext: { id: string; text: string; short_code?: string } | undefined;
    let regionContext: { id: string; text: string; short_code?: string } | undefined;
    let countryContext: { id: string; text: string; short_code?: string } | undefined;

    for (const ctx of context) {
      const id = ctx.id;
      if (id.startsWith('place.')) {
        placeContext = ctx;
      } else if (id.startsWith('region.')) {
        regionContext = ctx;
      } else if (id.startsWith('country.')) {
        countryContext = ctx;
      }
    }

    // Determinar tipo y datos de región (prioridad: place → region)
    // NIVEL PRIMARIO: place (ciudad) - ej: Mexico City, Barcelona, Berlin, Playa del Carmen
    // FALLBACK: region (estado/departamento) - ej: Quintana Roo, Jalisco, Catalonia
    let regionType: RegionType;
    let regionLabel: string;
    let regionId: string;
    
    const deriveCountryCode = (shortCode?: string): string => {
      if (!shortCode) return '';
      const normalized = shortCode.toUpperCase();
      return normalized.split('-')[0] || '';
    };

    // Extraer countryCode del country context (solo para metadata, NO se muestra como nivel)
    let countryCode = deriveCountryCode(countryContext?.short_code);
    if (!countryCode) {
      countryCode =
        deriveCountryCode(regionContext?.short_code)
        || deriveCountryCode(placeContext?.short_code)
        || deriveCountryCode((feature.properties as { short_code?: string } | undefined)?.short_code);
    }
    if (!countryCode) {
      regionCache.set(cacheKey, null);
      return null;
    }

    // Prioridad 1: place (ciudad) - NIVEL PRIMARIO PREFERIDO
    if (placeContext) {
      regionType = 'city';
      regionLabel = placeContext.text;
      // IMPORTANTE: Usar regla canónica para generar regionId estable
      // NO usar feature.id o placeContext.id (varían entre llamadas de Mapbox)
      // REGLA CANÓNICA: country_code.type.normalized_place_name
      try {
        regionId = generateCanonicalRegionId(countryCode, placeContext.text, 'city');
      } catch (error) {
        if (__DEV__) {
          console.error('Error generating canonical regionId:', error);
        }
        regionCache.set(cacheKey, null);
        return null;
      }
    }
    // Prioridad 2: region (estado/departamento/provincia) - FALLBACK SOLO SI NO EXISTE PLACE
    else if (regionContext) {
      regionType = 'region';
      regionLabel = regionContext.text;
      // IMPORTANTE: Usar regla canónica para generar regionId estable
      // NO usar regionContext.id o feature.id (varían entre llamadas de Mapbox)
      // REGLA CANÓNICA: country_code.type.normalized_place_name
      try {
        regionId = generateCanonicalRegionId(countryCode, regionContext.text, 'region');
      } catch (error) {
        if (__DEV__) {
          console.error('Error generating canonical regionId:', error);
        }
        regionCache.set(cacheKey, null);
        return null;
      }
    }
    // Fallback: usar feature principal si es place (no locality)
    else if (feature.text && feature.place_type.includes('place')) {
      regionType = 'city';
      regionLabel = feature.text;
      // IMPORTANTE: Usar regla canónica para generar regionId estable
      // NO usar feature.id (varía entre llamadas de Mapbox)
      // REGLA CANÓNICA: country_code.type.normalized_place_name
      try {
        regionId = generateCanonicalRegionId(countryCode, feature.text, 'city');
      } catch (error) {
        if (__DEV__) {
          console.error('Error generating canonical regionId:', error);
        }
        regionCache.set(cacheKey, null);
        return null;
      }
    }
    // Si no hay información suficiente (ni place ni region), retornar null
    else {
      regionCache.set(cacheKey, null);
      return null;
    }

    // Validar que tengamos los datos mínimos
    if (!regionLabel || !regionId || !countryCode) {
      regionCache.set(cacheKey, null);
      return null;
    }

    // Crear región canónica
    const canonicalRegion: LocationRegion = {
      regionId,
      label: regionLabel,
      type: regionType,
      countryCode,
    };

    // Guardar en cache
    regionCache.set(cacheKey, canonicalRegion);
    
    return canonicalRegion;
  } catch (error) {
    if (__DEV__) {
      console.error('Error resolving region from Mapbox:', error);
    }
    regionCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Limpiar cache de regiones (útil para testing)
 */
export function clearRegionCache(): void {
  regionCache.clear();
}
