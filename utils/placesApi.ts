/**
 * Google Places API Utility
 * Scope 2: Google Places API - Búsqueda y Autocompletado
 * 
 * Funcionalidades:
 * - Autocomplete: Búsqueda de lugares mientras el usuario escribe
 * - Place Details: Obtener detalles completos de un lugar
 * - Reverse Geocoding: Obtener dirección desde coordenadas
 * - Nearby Search: Buscar lugares cercanos
 * 
 * Usa Google Places API (REST - Classic)
 * Documentación: https://developers.google.com/maps/documentation/places/web-service
 * 
 * Costos (aproximados):
 * - Autocomplete: $2.83 por 1000 requests
 * - Place Details: $17 por 1000 requests
 * - Geocoding: $5 por 1000 requests
 * - Nearby Search: $32 por 1000 requests
 * 
 * Free tier: $200 crédito mensual (equivalente a ~70,000 autocomplete requests)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Google Places API has been removed - these functions now return null/empty results
// TODO: Replace with Mapbox Geocoding API or another service if needed
const PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place';
const GEOCODING_API_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

// Cache keys
const PLACES_CACHE_KEY = '@flowya_places_cache';
const PLACE_DETAILS_CACHE_KEY = '@flowya_place_details_cache';
const GEOCODE_CACHE_KEY = '@flowya_geocode_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText?: string;
  secondaryText?: string;
  types?: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  types: string[];
  photos?: string[];
  rating?: number;
  userRatingCount?: number;
  phoneNumber?: string;
  website?: string;
  openingHours?: {
    openNow?: boolean;
    weekdayText?: string[];
  };
  priceLevel?: number;
  addressComponents?: Array<{
    longName: string;
    shortName: string;
    types: string[];
  }>;
}

export interface GeocodeResult {
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  addressComponents?: Array<{
    longName: string;
    shortName: string;
    types: string[];
  }>;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Obtener datos del cache
 */
async function getCached<T>(cacheKey: string, key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      const cache: Record<string, CacheEntry<T>> = JSON.parse(cached);
      const entry = cache[key];
      if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
        return entry.data;
      }
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }
  return null;
}

/**
 * Guardar datos en cache
 */
async function setCached<T>(cacheKey: string, key: string, data: T): Promise<void> {
  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    const cache: Record<string, CacheEntry<T>> = cached ? JSON.parse(cached) : {};
    cache[key] = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

/**
 * Autocomplete: Buscar lugares mientras el usuario escribe
 * Usa Places API (REST) - Autocomplete
 */
export async function searchPlaces(
  query: string,
  location?: { latitude: number; longitude: number },
  radius?: number
): Promise<PlacePrediction[]> {
  if (!query.trim()) {
    return [];
  }

  // Google Places API has been removed - returning empty results
  return [];
}

/**
 * Obtener detalles completos de un lugar
 * Usa Places API (REST) - Place Details
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  if (!placeId) {
    return null;
  }

  // Google Places API has been removed - returning null
  return null;
}

/**
 * Reverse Geocoding: Obtener dirección desde coordenadas
 * Usa Geocoding API
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodeResult | null> {
  // Google Places API has been removed - returning null
  // TODO: Replace with Mapbox Geocoding API if reverse geocoding is needed
  return null;
}

/**
 * Buscar lugares cercanos
 * Usa Places API (REST) - Nearby Search
 */
export async function searchNearby(
  location: { latitude: number; longitude: number },
  radius: number = 5000,
  type?: string
): Promise<PlaceDetails[]> {
  // Google Places API has been removed - returning empty results
  return [];
}
