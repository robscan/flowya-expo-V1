/**
 * Region ID Generator - Core Module
 * CANONICAL: Generación de regionId estable y único
 * 
 * PROBLEMA IDENTIFICADO:
 * - Mapbox devuelve múltiples feature.id para la misma ciudad humana
 * - Diferentes llamadas pueden devolver IDs distintos para Barcelona, Berlin, etc.
 * - El sistema no estaba colapsando correctamente esas variantes
 * 
 * SOLUCIÓN CANÓNICA:
 * - Generar regionId usando: country_code + normalized_place_name
 * - Esto garantiza que Barcelona siempre tenga el mismo regionId
 * - Sin depender de feature.id volátil de Mapbox
 * 
 * REGLA CANÓNICA DEFINITIVA:
 * regionId = `${countryCode.toLowerCase()}.${normalizedPlaceName}`
 * 
 * Ejemplos:
 * - Barcelona, ES → "es.barcelona"
 * - Berlin, DE → "de.berlin"
 * - Mexico City, MX → "mx.mexico-city"
 * - Playa del Carmen, MX → "mx.playa-del-carmen"
 */

/**
 * Normalizar nombre de lugar para generar regionId estable
 * CANONICAL: Normalización única para garantizar unicidad
 * 
 * Esta función:
 * - Convierte a lowercase
 * - Elimina espacios extra
 * - Reemplaza espacios con guiones
 * - Elimina caracteres especiales
 * - Normaliza acentos y caracteres diacríticos
 * 
 * @param placeName - Nombre del lugar (ej: "Barcelona", "Playa del Carmen")
 * @returns Nombre normalizado (ej: "barcelona", "playa-del-carmen")
 */
function normalizePlaceName(placeName: string): string {
  if (!placeName || typeof placeName !== 'string') {
    return '';
  }

  return placeName
    .toLowerCase()
    .trim()
    // Normalizar acentos y caracteres diacríticos
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar marcas diacríticas
    // Reemplazar espacios con guiones
    .replace(/\s+/g, '-')
    // Eliminar caracteres especiales excepto guiones
    .replace(/[^a-z0-9-]/g, '')
    // Eliminar guiones múltiples
    .replace(/-+/g, '-')
    // Eliminar guiones al inicio y final
    .replace(/^-+|-+$/g, '');
}

/**
 * Generar regionId canónico estable
 * CANONICAL: Regla única para garantizar que Barcelona siempre tenga el mismo regionId
 * 
 * REGLA:
 * regionId = `${countryCode.toLowerCase()}.${normalizedPlaceName}`
 * 
 * Esto garantiza:
 * - Barcelona, ES → siempre "es.barcelona" (un solo regionId)
 * - Berlin, DE → siempre "de.berlin" (un solo regionId)
 * - Mexico City, MX → siempre "mx.mexico-city" (un solo regionId)
 * 
 * Sin depender de feature.id volátil de Mapbox.
 * 
 * @param countryCode - Código de país ISO 3166-1 alpha-2 (ej: "ES", "DE", "MX")
 * @param placeName - Nombre del lugar (ej: "Barcelona", "Berlin", "Mexico City")
 * @param regionType - Tipo de región ("city" o "region")
 * @returns regionId canónico estable (ej: "es.barcelona", "de.berlin")
 */
export function generateCanonicalRegionId(
  countryCode: string,
  placeName: string,
  regionType: 'city' | 'region'
): string {
  // Validar inputs
  if (!countryCode || typeof countryCode !== 'string' || countryCode.trim() === '') {
    throw new Error('generateCanonicalRegionId: countryCode is required');
  }
  
  if (!placeName || typeof placeName !== 'string' || placeName.trim() === '') {
    throw new Error('generateCanonicalRegionId: placeName is required');
  }

  // Normalizar countryCode a lowercase
  const normalizedCountry = countryCode.toLowerCase().trim();

  // Normalizar nombre del lugar
  const normalizedPlace = normalizePlaceName(placeName);

  // Validar que tengamos valores válidos después de normalización
  if (!normalizedCountry || !normalizedPlace) {
    throw new Error(`generateCanonicalRegionId: Invalid normalized values (country: "${normalizedCountry}", place: "${normalizedPlace}")`);
  }

  // Generar regionId canónico: country_code.normalized_place_name
  const regionId = `${normalizedCountry}.${normalizedPlace}`;

  return regionId;
}

/**
 * Validar si un regionId es canónico (generado con la regla nueva)
 * CANONICAL: Verifica si un regionId sigue el formato country.place
 * 
 * @param regionId - regionId a validar
 * @returns true si el regionId es canónico (formato country.place)
 */
export function isCanonicalRegionId(regionId: string): boolean {
  if (!regionId || typeof regionId !== 'string') {
    return false;
  }

  // Formato canónico: country.place (ej: "es.barcelona", "de.berlin")
  const canonicalPattern = /^[a-z]{2}\.[a-z0-9-]+$/;
  return canonicalPattern.test(regionId);
}
