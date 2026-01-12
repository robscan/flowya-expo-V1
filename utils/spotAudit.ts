/**
 * Spot Audit Utility
 * Auditoría completa de spots para verificar que tienen todos los campos correctos
 * 
 * Funcionalidades:
 * - Auditar todos los spots creados
 * - Verificar campos requeridos y opcionales
 * - Generar reporte de problemas
 * - Normalizar spots si es necesario
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Spot } from '@/data/spots';
import { normalizeSpot, normalizeAllSpots } from '@/utils/spotNormalizer';
import { validateSpotV1_2Detailed, canMigrateSpot, migrateSpotToV1_2 } from '@/utils/spotMigration';
import { isValidSpotV1_2 } from '@/utils/spotMigration';

const STORAGE_KEY = '@flowya_spots';

export interface SpotAuditResult {
  spotId: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  needsMigration: boolean;
  needsNormalization: boolean;
}

export interface AuditReport {
  total: number;
  valid: number;
  invalid: number;
  needsMigration: number;
  needsNormalization: number;
  results: SpotAuditResult[];
}

/**
 * Auditar un spot individual
 */
export function auditSpot(spot: Spot): SpotAuditResult {
  const result: SpotAuditResult = {
    spotId: spot.id,
    isValid: true,
    errors: [],
    warnings: [],
    needsMigration: false,
    needsNormalization: false,
  };

  // Validar con validación detallada
  const validation = validateSpotV1_2Detailed(spot);
  if (!validation.isValid) {
    result.isValid = false;
    result.errors.push(...validation.errors);
  }

  // Verificar si necesita migración
  const needsMigration = !isValidSpotV1_2(spot) || 
    ('latitude' in spot.location && 'longitude' in spot.location) ||
    (spot.photos && spot.photos.length > 0 && !spot.image?.url) ||
    (!spot.shortDescription && (spot.description || spot.whyItMatters));
  
  if (needsMigration) {
    result.needsMigration = true;
    result.warnings.push('Spot necesita migración al modelo V1.2');
  }

  // Verificar si necesita normalización
  const needsNormalization = 
    spot.description && spot.description.trim() !== spot.description ||
    spot.whyItMatters && spot.whyItMatters.trim() !== spot.whyItMatters ||
    spot.name && spot.name.trim() !== spot.name ||
    !Array.isArray(spot.photos);
  
  if (needsNormalization) {
    result.needsNormalization = true;
    result.warnings.push('Spot necesita normalización');
  }

  // Verificaciones adicionales
  // 1. Verificar que location tiene lat/lng válidos
  const loc = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number };
  const hasValidLocation = ('lat' in loc && typeof loc.lat === 'number' && !isNaN(loc.lat)) ||
    ('latitude' in loc && typeof loc.latitude === 'number' && !isNaN(loc.latitude));
  
  if (!hasValidLocation) {
    result.isValid = false;
    result.errors.push('Location no tiene coordenadas válidas');
  }

  // 2. Verificar que image.url existe si image existe
  if (spot.image && !spot.image.url) {
    result.warnings.push('image existe pero image.url está vacío');
  }

  // 3. Verificar que tiene name (requerido en V1.2)
  if (!spot.name || spot.name.trim().length === 0) {
    result.warnings.push('name está vacío (aunque es requerido en V1.2)');
  }

  // 4. Verificar que tiene type válido
  const validTypes = ['beach', 'cafe', 'viewpoint', 'museum', 'restaurant', 'park', 'monument', 'market', 'other'];
  if (!spot.type || !validTypes.includes(spot.type)) {
    result.isValid = false;
    result.errors.push(`type inválido: ${spot.type}`);
  }

  // 5. Verificar fechas
  if (!spot.createdAt || !(spot.createdAt instanceof Date)) {
    result.warnings.push('createdAt no es una fecha válida');
  }
  if (!spot.updatedAt || !(spot.updatedAt instanceof Date)) {
    result.warnings.push('updatedAt no es una fecha válida');
  }

  return result;
}

/**
 * Auditar todos los spots almacenados
 */
export async function auditAllSpots(): Promise<AuditReport> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        total: 0,
        valid: 0,
        invalid: 0,
        needsMigration: 0,
        needsNormalization: 0,
        results: [],
      };
    }

    const parsed = JSON.parse(stored);
    // Convertir fechas
    const spots: Spot[] = parsed.map((spot: any) => ({
      ...spot,
      createdAt: spot.createdAt ? new Date(spot.createdAt) : new Date(),
      updatedAt: spot.updatedAt ? new Date(spot.updatedAt) : new Date(),
    }));

    const results = spots.map(spot => auditSpot(spot));

    const report: AuditReport = {
      total: spots.length,
      valid: results.filter(r => r.isValid && r.errors.length === 0).length,
      invalid: results.filter(r => !r.isValid || r.errors.length > 0).length,
      needsMigration: results.filter(r => r.needsMigration).length,
      needsNormalization: results.filter(r => r.needsNormalization).length,
      results,
    };

    return report;
  } catch (error) {
    console.error('Error auditing spots:', error);
    throw error;
  }
}

/**
 * Normalizar y migrar spots según sea necesario
 */
export async function fixSpots(): Promise<{ fixed: number; errors: number }> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { fixed: 0, errors: 0 };
    }

    const parsed = JSON.parse(stored);
    // Convertir fechas
    let spots: Spot[] = parsed.map((spot: any) => ({
      ...spot,
      createdAt: spot.createdAt ? new Date(spot.createdAt) : new Date(),
      updatedAt: spot.updatedAt ? new Date(spot.updatedAt) : new Date(),
    }));

    let fixed = 0;
    let errors = 0;

    // 1. Normalizar todos los spots
    spots = normalizeAllSpots(spots);
    fixed += spots.length;

    // 2. Migrar spots que necesitan migración
    const migratedSpots: Spot[] = [];
    for (const spot of spots) {
      try {
        const needsMigration = !isValidSpotV1_2(spot) || 
          ('latitude' in spot.location && 'longitude' in spot.location) ||
          (spot.photos && spot.photos.length > 0 && !spot.image?.url) ||
          (!spot.shortDescription && (spot.description || spot.whyItMatters));
        
        if (needsMigration && canMigrateSpot(spot)) {
          const migrated = migrateSpotToV1_2(spot);
          // Convertir SpotV1_2 a Spot (manteniendo campos legacy)
          const migratedSpot: Spot = {
            ...migrated,
            // Mantener campos legacy temporalmente
            photos: spot.photos,
            description: spot.description,
            whyItMatters: spot.whyItMatters,
            culturalContext: spot.culturalContext,
            planInfo: spot.planInfo,
            hours: spot.hours,
            cost: spot.cost,
            restrictions: spot.restrictions,
            accessibility: spot.accessibility,
            aiGenerated: spot.aiGenerated,
            isLegacySpot: spot.isLegacySpot,
            createdBy: spot.createdBy,
            locationRegion: spot.locationRegion,
            locationLatitude: spot.locationLatitude,
            locationLongitude: spot.locationLongitude,
            createdAt: spot.createdAt,
            updatedAt: new Date(),
          };
          migratedSpots.push(migratedSpot);
          fixed++;
        } else {
          migratedSpots.push(spot);
        }
      } catch (error) {
        console.error(`Error migrating spot ${spot.id}:`, error);
        errors++;
        migratedSpots.push(spot); // Mantener spot original si falla la migración
      }
    }

    // Guardar spots corregidos
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migratedSpots));

    return { fixed, errors };
  } catch (error) {
    console.error('Error fixing spots:', error);
    throw error;
  }
}

/**
 * Loggear reporte de auditoría
 */
export function logAuditReport(report: AuditReport): void {
  if (__DEV__) {
    console.log(`[SpotAudit] ===== AUDITORÍA DE SPOTS =====`);
    console.log(`[SpotAudit] Total: ${report.total}`);
    console.log(`[SpotAudit] Válidos: ${report.valid}`);
    console.log(`[SpotAudit] Inválidos: ${report.invalid}`);
    console.log(`[SpotAudit] Necesitan migración: ${report.needsMigration}`);
    console.log(`[SpotAudit] Necesitan normalización: ${report.needsNormalization}`);
    
    if (report.invalid > 0 || report.needsMigration > 0) {
      console.warn(`[SpotAudit] ===== SPOTS CON PROBLEMAS =====`);
      report.results.forEach(result => {
        if (!result.isValid || result.errors.length > 0 || result.needsMigration) {
          console.warn(`[SpotAudit] Spot ${result.spotId}:`);
          if (result.errors.length > 0) {
            console.warn(`[SpotAudit]   Errores: ${result.errors.join(', ')}`);
          }
          if (result.warnings.length > 0) {
            console.warn(`[SpotAudit]   Advertencias: ${result.warnings.join(', ')}`);
          }
          if (result.needsMigration) {
            console.warn(`[SpotAudit]   ⚠️  Necesita migración`);
          }
          if (result.needsNormalization) {
            console.warn(`[SpotAudit]   ⚠️  Necesita normalización`);
          }
        }
      });
    } else {
      console.log(`[SpotAudit] ✅ Todos los spots están correctos`);
    }
  }
}
