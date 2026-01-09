/**
 * Mapbox Geocoding Utility
 * CANONICAL: Única implementación de geocoding en FLOWYA
 * 
 * Usa Mapbox Geocoding API (NO Google)
 * - Reverse geocoding: coordenadas → dirección/región
 * - Forward geocoding: dirección → coordenadas
 * 
 * IMPORTANTE: Este archivo reemplaza completamente el uso de expo-location
 * para geocoding, que internamente usa Google Maps API en web.
 */

import { MAPBOX_ACCESS_TOKEN } from './mapsConfig';

// Cache en memoria para evitar múltiples llamadas a la misma coordenada/query
const reverseGeocodeCache = new Map<string, MapboxReverseGeocodeResult | null>();
const forwardGeocodeCache = new Map<string, MapboxForwardGeocodeResult[]>();

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

export interface MapboxReverseGeocodeResult {
  city?: string;
  region?: string;
  country?: string;
  formattedAddress?: string;
}

export interface MapboxForwardGeocodeResult {
  latitude: number;
  longitude: number;
  description: string;
}

/**
 * Reverse geocoding usando Mapbox Geocoding API
 * CANONICAL: Única función de reverse geocoding en FLOWYA
 * 
 * @param latitude - Latitud
 * @param longitude - Longitud
 * @returns Resultado con ciudad, región, país y dirección formateada, o null si falla
 */
export async function reverseGeocodeMapbox(
  latitude: number,
  longitude: number
): Promise<MapboxReverseGeocodeResult | null> {
  const token = MAPBOX_ACCESS_TOKEN;
  if (!token) {
    if (__DEV__) {
      console.warn('⚠️ Mapbox Access Token not configured. Cannot perform reverse geocoding.');
    }
    return null;
  }

  // Crear clave de cache
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  
  // Verificar cache
  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey) ?? null;
  }

  // Mapbox espera [lng, lat] (NO [lat, lng])
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&types=place,locality,neighborhood,region&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
    }

    const data: MapboxGeocodeResponse = await response.json();
    
    if (!data.features || data.features.length === 0) {
      reverseGeocodeCache.set(cacheKey, null);
      return null;
    }

    // Extraer información del primer resultado
    const feature = data.features[0];
    const context = feature.context || [];
    
    // Extraer ciudad, región, país del context array
    // Mapbox context: cada elemento tiene id como "place.12345", "region.67890", "country.11111"
    let city: string | undefined;
    let region: string | undefined;
    let country: string | undefined;

    for (const ctx of context) {
      const id = ctx.id;
      if (id.startsWith('place.')) {
        city = ctx.text;
      } else if (id.startsWith('region.') || id.startsWith('district.')) {
        region = ctx.text;
      } else if (id.startsWith('country.')) {
        country = ctx.text;
      }
    }

    // Si no hay city en context pero el feature principal es un lugar, usar feature.text
    if (!city && feature.text && (feature.place_type.includes('place') || feature.place_type.includes('locality'))) {
      city = feature.text;
    }

    // Si no hay región pero hay un administrative area en context, usarlo
    if (!region) {
      const adminArea = context.find(ctx => ctx.id.startsWith('region.') || ctx.id.startsWith('district.'));
      if (adminArea) {
        region = adminArea.text;
      }
    }

    const result: MapboxReverseGeocodeResult = {
      city: city || undefined,
      region: region || undefined,
      country: country || undefined,
      formattedAddress: feature.place_name || undefined,
    };

    // Guardar en cache
    reverseGeocodeCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    if (__DEV__) {
      console.error('Error in Mapbox reverse geocoding:', error);
    }
    reverseGeocodeCache.set(cacheKey, null);
    return null;
  }
}

/**
 * Forward geocoding usando Mapbox Geocoding API
 * CANONICAL: Única función de forward geocoding en FLOWYA
 * 
 * @param query - Query de búsqueda (dirección, lugar, etc.)
 * @param limit - Número máximo de resultados (default: 5)
 * @returns Array de resultados con coordenadas y descripción
 */
export async function forwardGeocodeMapbox(
  query: string,
  limit: number = 5
): Promise<MapboxForwardGeocodeResult[]> {
  const token = MAPBOX_ACCESS_TOKEN;
  if (!token) {
    if (__DEV__) {
      console.warn('⚠️ Mapbox Access Token not configured. Cannot perform forward geocoding.');
    }
    return [];
  }

  if (!query || query.trim().length === 0) {
    return [];
  }

  // Crear clave de cache
  const cacheKey = `${query.toLowerCase().trim()}:${limit}`;
  
  // Verificar cache
  if (forwardGeocodeCache.has(cacheKey)) {
    const cached = forwardGeocodeCache.get(cacheKey);
    return cached || [];
  }

  const encodedQuery = encodeURIComponent(query.trim());
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${token}&limit=${limit}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
    }

    const data: MapboxGeocodeResponse = await response.json();
    
    if (!data.features || data.features.length === 0) {
      forwardGeocodeCache.set(cacheKey, []);
      return [];
    }

    const results: MapboxForwardGeocodeResult[] = data.features.map((feature) => ({
      latitude: feature.center[1], // Mapbox retorna [lng, lat], necesitamos lat
      longitude: feature.center[0], // Mapbox retorna [lng, lat], necesitamos lng
      description: feature.place_name || feature.text || query,
    }));

    // Guardar en cache
    forwardGeocodeCache.set(cacheKey, results);
    
    return results;
  } catch (error) {
    if (__DEV__) {
      console.error('Error in Mapbox forward geocoding:', error);
    }
    forwardGeocodeCache.set(cacheKey, []);
    return [];
  }
}

/**
 * Limpiar cache de geocoding (útil para testing)
 */
export function clearMapboxGeocodingCache(): void {
  reverseGeocodeCache.clear();
  forwardGeocodeCache.clear();
}

/**
 * NOTA: La resolución canónica de regiones ahora se encuentra en core/region/RegionResolver.ts
 * 
 * Esta función deriveCanonicalRegionFromMapbox() ha sido movida a:
 * - core/region/RegionResolver.ts → resolveRegion()
 * 
 * Todas las partes del sistema deben usar resolveRegion() desde @/core/region
 */
