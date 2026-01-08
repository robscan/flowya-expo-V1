/**
 * Geocoding Utility
 * Funciones para obtener nombres de ciudades y coordenadas
 * 
 * Usa Google Geocoding API a través de placesApi.ts
 * También incluye ciudades predefinidas de Riviera Maya
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spot, mockSpots } from '@/data/spots';
import { calculateDistance } from './distance';
import { reverseGeocode } from './placesApi';

const STORAGE_KEY = '@flowya_spots';

// Cache para resultados de geocoding (coordenadas -> nombre de ciudad)
// IMPORTANTE: Solo almacena ciudades (nunca null). Si no hay ciudad, no se guarda nada.
const geocodingCache = new Map<string, string>();

// Cache para ubicaciones extraídas de spots (spots hash -> ubicaciones)
const locationsCache = new Map<string, PredefinedCity[]>();

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
 * Obtener nombre de ciudad desde coordenadas
 * Usa reverse geocoding para extraer el nombre de la ciudad
 * Busca múltiples tipos de componentes para mejor precisión
 */
export async function getCityNameFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const result = await reverseGeocode(latitude, longitude);
    if (!result) {
      console.warn('Reverse geocoding returned no result');
      return null;
    }

    // Intentar extraer el nombre de la ciudad de los componentes de dirección
    if (result.addressComponents && result.addressComponents.length > 0) {
      // Prioridad 1: Buscar componente de tipo "locality" (ciudad principal)
      const cityComponent = result.addressComponents.find((comp) =>
        comp.types.includes('locality')
      );
      if (cityComponent) {
        console.log('Found city name from locality:', cityComponent.longName);
        return cityComponent.longName;
      }

      // Prioridad 2: Buscar "sublocality_level_1" o "sublocality" (barrio/área urbana)
      const sublocalityComponent = result.addressComponents.find((comp) =>
        comp.types.some(type => type.includes('sublocality'))
      );
      if (sublocalityComponent) {
        console.log('Found city name from sublocality:', sublocalityComponent.longName);
        return sublocalityComponent.longName;
      }

      // Prioridad 3: Buscar "neighborhood" (vecindario)
      const neighborhoodComponent = result.addressComponents.find((comp) =>
        comp.types.includes('neighborhood')
      );
      if (neighborhoodComponent) {
        console.log('Found city name from neighborhood:', neighborhoodComponent.longName);
        return neighborhoodComponent.longName;
      }

      // Prioridad 4: Buscar "administrative_area_level_2" (municipio/condado)
      const adminComponent = result.addressComponents.find((comp) =>
        comp.types.includes('administrative_area_level_2')
      );
      if (adminComponent) {
        console.log('Found city name from administrative_area_level_2:', adminComponent.longName);
        return adminComponent.longName;
      }

      // Prioridad 5: Buscar "administrative_area_level_1" (estado/provincia) como último recurso
      const stateComponent = result.addressComponents.find((comp) =>
        comp.types.includes('administrative_area_level_1')
      );
      if (stateComponent) {
        console.log('Found city name from administrative_area_level_1:', stateComponent.longName);
        return stateComponent.longName;
      }
    }

    // Si no se encuentra componente específico, intentar parsear formattedAddress
    if (result.formattedAddress) {
      // Dividir por comas y tomar la primera parte (generalmente el nombre de la ciudad)
      const parts = result.formattedAddress.split(',');
      if (parts.length > 0) {
        const firstPart = parts[0].trim();
        // Filtrar partes comunes que no son nombres de ciudad
        if (firstPart && !firstPart.match(/^\d+/)) { // No empieza con número (dirección)
          console.log('Found city name from formattedAddress:', firstPart);
          return firstPart;
        }
        // Si la primera parte es una dirección, intentar con la segunda
        if (parts.length > 1) {
          const secondPart = parts[1].trim();
          console.log('Found city name from formattedAddress (second part):', secondPart);
          return secondPart;
        }
      }
    }

    console.warn('Could not extract city name from geocoding result');
    return null;
  } catch (error) {
    console.error('Error getting city name from coordinates:', error);
    return null;
  }
}

/**
 * Obtener coordenadas desde nombre de ciudad
 * Primero busca en ciudades predefinidas, luego usa geocoding si no se encuentra
 */
export async function getCoordinatesFromCityName(
  cityName: string
): Promise<{ latitude: number; longitude: number } | null> {
  // Buscar en ciudades predefinidas primero (más rápido y sin costo)
  const predefined = PREDEFINED_CITIES.find(
    (city) => city.name.toLowerCase() === cityName.toLowerCase()
  );
  if (predefined) {
    return predefined.coordinates;
  }

  // Si no se encuentra, usar geocoding API
  // Nota: Esto requeriría implementar geocoding forward, pero por ahora
  // solo usamos ciudades predefinidas según el plan
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

/**
 * Obtener ciudad y región desde coordenadas
 * CANONICAL: Resuelve ciudad (prioridad) o región (fallback)
 * 
 * Reglas de agrupación:
 * - Prioridad 1: Ciudad (locality, sublocality, neighborhood)
 * - Prioridad 2: Región (administrative_area_level_1 - estado/provincia)
 * 
 * Nunca retorna coordenadas ni identificadores numéricos
 * Usa getCityNameFromCoordinates que ya implementa la lógica completa
 * 
 * IMPORTANTE: El cache solo almacena ciudades (nunca null).
 * Si no hay ciudad, no se guarda nada en cache para permitir intentar región como fallback.
 */
async function getCityOrRegionFromCoordinates(
  latitude: number,
  longitude: number
): Promise<{ city: string | null; region: string | null }> {
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  
  // Verificar cache: solo almacena ciudades (nunca null)
  // Si existe en cache, significa que hay ciudad
  if (geocodingCache.has(cacheKey)) {
    const cachedCity = geocodingCache.get(cacheKey);
    // Si hay ciudad en cache, retornarla (no intentar región)
    // Usar non-null assertion porque ya verificamos con has()
    return { city: cachedCity!, region: null };
  }

  try {
    const result = await reverseGeocode(latitude, longitude);
    if (!result || !result.addressComponents) {
      // No guardar null en cache, permitir reintentos
      return { city: null, region: null };
    }

    // Prioridad 1: Buscar ciudad (locality, sublocality, neighborhood)
    const cityComponent = result.addressComponents.find((comp) =>
      comp.types.includes('locality') ||
      comp.types.some(type => type.includes('sublocality')) ||
      comp.types.includes('neighborhood')
    );
    const city = cityComponent ? cityComponent.longName : null;

    // Prioridad 2: Buscar región (administrative_area_level_1 - estado/provincia) como fallback
    const regionComponent = result.addressComponents.find((comp) =>
      comp.types.includes('administrative_area_level_1')
    );
    const region = regionComponent ? regionComponent.longName : null;

    // Guardar SOLO ciudad en cache (si existe)
    // No guardar null para permitir reintentos y fallback a región
    if (city) {
      geocodingCache.set(cacheKey, city);
    }

    return { city, region };
  } catch (error) {
    console.error(`Error getting city/region for ${latitude}, ${longitude}:`, error);
    // No guardar null en cache, permitir reintentos
    return { city: null, region: null };
  }
}

/**
 * Obtener todas las ubicaciones únicas desde spots
 * CANONICAL: Extrae destinos únicos agrupados por ciudad/región
 * 
 * Agrupación:
 * - Agrupa spots por nombre de ciudad (primary)
 * - Si no hay ciudad, agrupa por región (fallback)
 * - Elimina duplicados por nombre
 * - Nunca muestra coordenadas ni identificadores numéricos
 * 
 * Cada grupo usa coordenadas representativas (primer spot del grupo)
 */
export async function getAllLocationsFromSpots(spots: Spot[]): Promise<PredefinedCity[]> {
  if (spots.length === 0) {
    return [];
  }

  // Crear hash de spots para cache
  const spotsHash = spots.map(s => s.id).sort().join(',');
  
  // Verificar cache
  if (locationsCache.has(spotsHash)) {
    const cached = locationsCache.get(spotsHash);
    if (cached) {
      return cached;
    }
  }

  // Mapa para agrupar por nombre de destino (ciudad o región)
  // Key: nombre del destino (ciudad o región)
  // Value: { name, coordinates, spots[] }
  const destinationsMap = new Map<string, {
    name: string;
    coordinates: { latitude: number; longitude: number };
    spots: Spot[];
  }>();

  // Procesar cada spot para obtener su ciudad/región
  for (const spot of spots) {
    const { latitude, longitude } = spot.location;
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    
    let destinationName: string | null = null;
    
    // Verificar cache de geocoding: usar has() para distinguir entre "no calculado" y "calculado sin resultado"
    // El cache solo almacena ciudades (nunca null), así que si existe, hay ciudad
    if (geocodingCache.has(cacheKey)) {
      // Hay ciudad en cache, usarla directamente
      // Usar non-null assertion porque ya verificamos con has()
      destinationName = geocodingCache.get(cacheKey)!;
    } else {
      // No está en cache, obtener ciudad/región usando geocoding
      const { city, region } = await getCityOrRegionFromCoordinates(latitude, longitude);
      destinationName = city || region || null;
      
      // El cache ya se maneja dentro de getCityOrRegionFromCoordinates
      // Solo guarda ciudad si existe, nunca null
    }

    // Si no se pudo obtener destino (ni ciudad ni región), saltar este spot
    // No mostrar coordenadas al usuario
    if (!destinationName) {
      continue;
    }

    // Agrupar por nombre de destino
    if (destinationsMap.has(destinationName)) {
      // Agregar spot al grupo existente
      const group = destinationsMap.get(destinationName)!;
      group.spots.push(spot);
    } else {
      // Crear nuevo grupo con este spot
      destinationsMap.set(destinationName, {
        name: destinationName,
        coordinates: { latitude, longitude }, // Usar coordenadas del primer spot del grupo
        spots: [spot],
      });
    }
  }

  // Convertir mapa a array y ordenar alfabéticamente
  const locations: PredefinedCity[] = Array.from(destinationsMap.values())
    .map((group) => ({
      name: group.name,
      coordinates: group.coordinates,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Guardar en cache
  locationsCache.set(spotsHash, locations);

  return locations;
}

/**
 * getAllLocations - Obtiene todas las ubicaciones disponibles desde la base de datos
 * 
 * Fuente de datos independiente:
 * - NO depende de spots context
 * - NO depende de Home
 * - NO depende de cercanía
 * - Es global
 * 
 * Carga spots directamente desde AsyncStorage o mockSpots y extrae ubicaciones únicas
 */
export async function getAllLocations(): Promise<PredefinedCity[]> {
  try {
    // Cargar spots directamente desde AsyncStorage (sin depender del contexto)
    let spots: Spot[] = [];
    
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convertir fechas
      const spotsWithDates = parsed.map((spot: any) => ({
        ...spot,
        createdAt: new Date(spot.createdAt),
        updatedAt: new Date(spot.updatedAt),
      }));
      
      // Detectar nuevos spots en mockSpots que no están en el storage
      const storedIds = new Set(spotsWithDates.map((s: Spot) => s.id));
      const newSpots = mockSpots.filter(spot => !storedIds.has(spot.id));
      
      if (newSpots.length > 0) {
        // Hay nuevos spots: combinar los existentes con los nuevos
        spots = [...spotsWithDates, ...newSpots];
      } else {
        spots = spotsWithDates;
      }
    } else {
      // Usar mock data si no hay datos guardados
      spots = mockSpots;
    }

    // Extraer ubicaciones únicas de todos los spots
    if (spots.length === 0) {
      return [];
    }

    return await getAllLocationsFromSpots(spots);
  } catch (error) {
    console.error('Error loading locations from database:', error);
    // Fallback: intentar con mockSpots directamente
    try {
      return await getAllLocationsFromSpots(mockSpots);
    } catch (fallbackError) {
      console.error('Error loading locations from mockSpots:', fallbackError);
      return [];
    }
  }
}



