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
 * - Generar regionId usando: country_code + type + normalized_place_name
 * - Esto garantiza que Barcelona siempre tenga el mismo regionId
 * - Sin depender de feature.id volátil de Mapbox
 * 
 * REGLA CANÓNICA DEFINITIVA:
 * regionId = `${countryCode.toLowerCase()}.${regionType}.${normalizedPlaceName}`
 * 
 * Ejemplos:
 * - Barcelona, ES (city) → "es.city.barcelona"
 * - Berlin, DE (city) → "de.city.berlin"
 * - Mexico City, MX (city) → "mx.city.mexico-city"
 * - Quintana Roo, MX (region) → "mx.region.quintana-roo"
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
 * regionId = `${countryCode.toLowerCase()}.${regionType}.${normalizedPlaceName}`
 * 
 * Esto garantiza:
 * - Barcelona, ES → siempre "es.city.barcelona" (un solo regionId)
 * - Berlin, DE → siempre "de.city.berlin" (un solo regionId)
 * - Mexico City, MX → siempre "mx.city.mexico-city" (un solo regionId)
 * 
 * Sin depender de feature.id volátil de Mapbox.
 * 
 * @param countryCode - Código de país ISO 3166-1 alpha-2 (ej: "ES", "DE", "MX")
 * @param placeName - Nombre del lugar (ej: "Barcelona", "Berlin", "Mexico City")
 * @param regionType - Tipo de región ("city" o "region")
 * @returns regionId canónico estable (ej: "es.city.barcelona", "de.city.berlin")
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

  // Generar regionId canónico: country_code.type.normalized_place_name
  const regionId = `${normalizedCountry}.${regionType}.${normalizedPlace}`;

  return regionId;
}

/**
 * Validar si un regionId es canónico (generado con la regla nueva)
 * CANONICAL: Verifica si un regionId sigue el formato country.type.place
 * 
 * @param regionId - regionId a validar
 * @returns true si el regionId es canónico (formato country.type.place)
 */
export function isCanonicalRegionId(regionId: string): boolean {
  if (!regionId || typeof regionId !== 'string') {
    return false;
  }

  // Formato canónico: country.type.place (ej: "es.city.barcelona", "de.region.berlin")
  const canonicalPattern = /^[a-z]{2}\.(city|region)\.[a-z0-9-]+$/;
  return canonicalPattern.test(regionId);
}
