/**
 * Spot Detection Utilities
 * SCOPE 1: Detección de spots existentes por nombre normalizado y ubicación cercana
 * 
 * Funcionalidades:
 * - Normalizar nombres de spots (lowercase, sin acentos, sin símbolos)
 * - Buscar spots existentes que coincidan por nombre y ubicación (≤ 30m)
 */

import { Spot } from '@/data/spots';
import { calculateDistance } from './distance';

const DETECTION_RADIUS_METERS = 30;

/**
 * Normalizar nombre de spot para comparación
 * - Convertir a lowercase
 * - Remover acentos (á → a, é → e, etc.)
 * - Remover símbolos especiales (mantener solo letras, números y espacios)
 * - Normalizar espacios múltiples
 */
export function normalizeSpotName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Separar caracteres base de acentos
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s]/g, '') // Remover símbolos, mantener letras, números y espacios
    .trim()
    .replace(/\s+/g, ' '); // Normalizar espacios múltiples
}

/**
 * Buscar spot existente que coincida por nombre normalizado y ubicación cercana
 * @param spots Array de spots donde buscar
 * @param name Nombre del spot a buscar (opcional)
 * @param location Ubicación del spot a buscar
 * @returns Spot existente encontrado o null si no hay coincidencia
 * 
 * Reglas:
 * - Si no hay nombre, retornar null (no detectar)
 * - Nombre debe coincidir después de normalización
 * - Ubicación debe estar dentro de 30 metros
 */
/**
 * FASE 4-5: Actualizado para aceptar ambos formatos de location (lat/lng y latitude/longitude)
 */
export function findExistingSpot(
  spots: Spot[],
  name: string | undefined,
  location: { lat: number; lng: number } | { latitude: number; longitude: number }
): Spot | null {
  // SCOPE 1: Si no hay nombre, no detectar (según requerimientos)
  if (!name || name.trim().length === 0) {
    return null;
  }

  const normalizedName = normalizeSpotName(name);
  
  // FASE 4-5: Normalizar location a lat/lng
  const locationLat = 'lat' in location ? location.lat : location.latitude;
  const locationLng = 'lng' in location ? location.lng : location.longitude;

  // Buscar spots con nombre normalizado coincidente
  for (const spot of spots) {
    // Saltar spots sin nombre
    if (!spot.name || spot.name.trim().length === 0) {
      continue;
    }

    const spotNormalizedName = normalizeSpotName(spot.name);
    
    // Si los nombres normalizados coinciden
    if (spotNormalizedName === normalizedName) {
      // FASE 4-5: Normalizar location del spot a lat/lng
      const spotLat = 'lat' in spot.location ? spot.location.lat : spot.location.latitude;
      const spotLng = 'lng' in spot.location ? spot.location.lng : spot.location.longitude;
      
      // Verificar distancia (≤ 30 metros)
      const distance = calculateDistance(
        locationLat,
        locationLng,
        spotLat,
        spotLng
      );

      if (distance <= DETECTION_RADIUS_METERS) {
        return spot; // Encontrado
      }
    }
  }

  return null; // No encontrado
}
