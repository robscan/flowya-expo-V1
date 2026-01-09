/**
 * Core Region Module - Public Exports
 * CANONICAL: Módulo único para gestión de regiones en FLOWYA
 * 
 * Este módulo exporta todas las funciones públicas del core de regiones.
 * Todas las demás partes del sistema deben importar desde este módulo.
 */

// Resolver regiones desde Mapbox
export { resolveRegion, clearRegionCache } from './RegionResolver';

// Obtener regiones disponibles desde spots
export { 
  getAvailableRegionsFromSpots, 
  getSpotsByRegion,
  type RegionOption 
} from './getAvailableRegionsFromSpots';

// Migración de spots legacy
export { migrateSpotsRegions, migrateSpotRegion } from './migrateSpotsRegions';

// Eliminación de spots inválidos
export { deleteInvalidSpots, getValidSpots } from './deleteInvalidSpots';

// Generación de regionId canónico
export { generateCanonicalRegionId, isCanonicalRegionId } from './regionIdGenerator';

// Re-exportar tipos canónicos
export type { LocationRegion, RegionType, CanonicalRegionResult } from '@/types/locationRegion';
