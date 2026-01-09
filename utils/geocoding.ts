/**
 * Geocoding Utility - Ciudades Predefinidas
 * Funciones para trabajar con ciudades predefinidas de Riviera Maya
 * 
 * NOTA: Este archivo NO usa Google Maps APIs.
 * Para geocoding interno, usar:
 * - core/region/RegionResolver.ts (resolución canónica de regiones desde Mapbox)
 * - utils/mapboxGeocoding.ts (reverse/forward geocoding para otros propósitos)
 * 
 * Para renderizado de mapas, usar Mapbox.
 * Para "Get directions", usar utils/navigationHelpers.ts (abre apps externas).
 */

import { calculateDistance } from './distance';

// Ciudades predefinidas de Riviera Maya
export interface PredefinedCity {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export const PREDEFINED_CITIES: PredefinedCity[] = [
  {
    name: 'Cancún',
    coordinates: {
      latitude: 21.1619,
      longitude: -86.8515,
    },
  },
  {
    name: 'Playa del Carmen',
    coordinates: {
      latitude: 20.6296,
      longitude: -87.0731,
    },
  },
  {
    name: 'Puerto Morelos',
    coordinates: {
      latitude: 20.8500,
      longitude: -86.8667,
    },
  },
  {
    name: 'Tulum',
    coordinates: {
      latitude: 20.2114,
      longitude: -87.4653,
    },
  },
  {
    name: 'Akumal',
    coordinates: {
      latitude: 20.3961,
      longitude: -87.3139,
    },
  },
  {
    name: 'Cozumel',
    coordinates: {
      latitude: 20.5083,
      longitude: -86.9458,
    },
  },
];


/**
 * Obtener coordenadas desde nombre de ciudad
 * Busca solo en ciudades predefinidas de Riviera Maya
 * 
 * NOTA: Esta función NO usa Google Maps APIs.
 * Para geocoding forward más robusto, usar utils/mapboxGeocoding.ts (forwardGeocodeMapbox)
 */
export async function getCoordinatesFromCityName(
  cityName: string
): Promise<{ latitude: number; longitude: number } | null> {
  // Buscar en ciudades predefinidas
  const predefined = PREDEFINED_CITIES.find(
    (city) => city.name.toLowerCase() === cityName.toLowerCase()
  );
  if (predefined) {
    return predefined.coordinates;
  }

  // Si no se encuentra en ciudades predefinidas, retornar null
  // Para geocoding forward, usar utils/mapboxGeocoding.ts (forwardGeocodeMapbox)
  console.warn(`City "${cityName}" not found in predefined cities`);
  return null;
}

/**
 * Verificar si una ciudad está en la lista predefinida
 */
export function isPredefinedCity(cityName: string): boolean {
  return PREDEFINED_CITIES.some(
    (city) => city.name.toLowerCase() === cityName.toLowerCase()
  );
}

/**
 * Obtener todas las ciudades predefinidas
 */
export function getPredefinedCities(): PredefinedCity[] {
  return PREDEFINED_CITIES;
}

/**
 * Encontrar la ciudad predefinida más cercana a las coordenadas dadas
 * @param latitude Latitud
 * @param longitude Longitud
 * @param maxDistanceMeters Distancia máxima en metros (default: 10000 = 10km)
 * @returns Ciudad predefinida más cercana o null si no hay ninguna dentro del radio
 */
export function findNearestPredefinedCity(
  latitude: number,
  longitude: number,
  maxDistanceMeters: number = 10000
): PredefinedCity | null {
  let nearestCity: PredefinedCity | null = null;
  let minDistance = Infinity;

  for (const city of PREDEFINED_CITIES) {
    const distance = calculateDistance(
      latitude,
      longitude,
      city.coordinates.latitude,
      city.coordinates.longitude
    );

    if (distance < minDistance && distance <= maxDistanceMeters) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  if (nearestCity) {
    console.log(`Found nearest predefined city: ${nearestCity.name} (${Math.round(minDistance)}m away)`);
  } else {
    console.log(`No predefined city found within ${maxDistanceMeters}m`);
  }

  return nearestCity;
}




