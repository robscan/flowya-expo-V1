/**
 * Location Region Types - Normalización Canónica de Región
 * CANONICAL: Única estructura de región en FLOWYA basada en Mapbox
 * 
 * Esta estructura garantiza:
 * - Consistencia de datos entre Mapbox y Spots
 * - Comparaciones por regionId (no por strings libres)
 * - Trazabilidad completa desde coordenadas
 * - Escalabilidad global
 */

/**
 * Tipo de región derivado de Mapbox
 * - city: Ciudad principal (ej: "Playa del Carmen")
 * - region: Región administrativa (ej: "Quintana Roo")
 */
export type RegionType = 'city' | 'region';

/**
 * Región canónica normalizada
 * CANONICAL: Estructura única de región en todo el dominio
 * 
 * Esta estructura se deriva exclusivamente de Mapbox Geocoding API
 * y garantiza consistencia entre ubicación del usuario y spots.
 */
export interface LocationRegion {
  /**
   * ID único y estable de la región (derivado de Mapbox)
   * CANONICAL: Usado para comparaciones, nunca usar label
   * 
   * Formato: country.type.place (estable)
   * Ejemplos: "mx.city.playa-del-carmen", "mx.region.quintana-roo"
   */
  regionId: string;

  /**
   * Etiqueta legible de la región (para mostrar en UI)
   * CANONICAL: Solo para visualización, nunca para comparaciones
   * 
   * Ejemplos: "Playa del Carmen", "Tulum", "Cancún"
   */
  label: string;

  /**
   * Tipo de región (city, region)
   * CANONICAL: Determina la prioridad/precisión de la región
   */
  type: RegionType;

  /**
   * Código de país ISO 3166-1 alpha-2
   * CANONICAL: Garantiza escalabilidad global
   * 
   * Ejemplos: "MX", "ES", "US"
   */
  countryCode: string;
}

/**
 * Resultado de derivar región canónica desde Mapbox
 * Incluye información adicional para debugging
 */
export interface CanonicalRegionResult extends LocationRegion {
  /**
   * Coordenadas originales que generaron esta región
   * Útil para debugging y trazabilidad
   */
  sourceCoordinates: {
    latitude: number;
    longitude: number;
  };

  /**
   * Respuesta completa de Mapbox (opcional, para referencia)
   */
  mapboxFeatureId?: string;
}
