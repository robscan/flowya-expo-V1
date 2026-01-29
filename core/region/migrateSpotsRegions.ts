/**
 * Spot Region Migration - Core Module
 * CANONICAL: Migración única de spots legacy para poblar campo locationRegion canónico
 * 
 * Funcionalidades:
 * - Itera sobre spots existentes
 * - Si locationRegion está vacío o es string legacy, deriva desde coordenadas usando RegionResolver
 * - Actualiza spot con estructura LocationRegion canónica
 * - Es idempotente (solo migra spots sin región canónica)
 * - Ejecutable una sola vez, sin intervención del usuario
 * - NO depende de auth
 * 
 * IMPORTANTE:
 * - Esta migración se ejecuta automáticamente en SpotContext durante loadSpots()
 * - NO debe ejecutarse manualmente
 * - Es idempotente: solo migra spots que necesitan migración
 */

import { Spot } from '@/data/spots';
import { LocationRegion } from '@/types/locationRegion';
import { resolveRegion } from './RegionResolver';
import { clearRegionCache } from './RegionResolver';
import { deleteInvalidSpots } from './deleteInvalidSpots';

/**
 * Migrar un spot individual para poblar locationRegion canónico
 * CANONICAL: Usa resolveRegion() desde RegionResolver para estructura canónica
 * 
 * @param spot - Spot a migrar
 * @returns Spot actualizado con locationRegion canónico (si se pudo resolver)
 */
export async function migrateSpotRegion(spot: Spot, forceRemigration: boolean = false): Promise<Spot> {
  // Si no es migración forzosa y ya tiene locationRegion canónico, no migrar
  if (!forceRemigration && spot.locationRegion && typeof spot.locationRegion === 'object' && 'regionId' in spot.locationRegion) {
    return spot;
  }

  // Si no tiene coordenadas, no migrar
  const loc = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number } | undefined;
  const latitude = loc?.lat ?? loc?.latitude;
  const longitude = loc?.lng ?? loc?.longitude;
  if (!loc || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return spot;
  }

  try {
    // Resolver región canónica desde Mapbox usando RegionResolver
    const canonicalRegion = await resolveRegion(
      latitude,
      longitude
    );

    if (canonicalRegion) {
      // Actualizar spot con región canónica
      return {
        ...spot,
        locationRegion: canonicalRegion,
        updatedAt: new Date(), // Actualizar timestamp
      };
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(`Error migrating region for spot ${spot.id}:`, error);
    }
  }

  // Si no se pudo resolver, retornar spot sin cambios
  return spot;
}

/**
 * Migrar múltiples spots para poblar locationRegion canónico
 * CANONICAL: Usa estructura LocationRegion basada en Mapbox via RegionResolver
 * 
 * MIGRACIÓN FORZOSA (POST-CORRECCIÓN DE regionId):
 * - Recalcula locationRegion para TODOS los spots para unificar regionId duplicados
 * - Aplica nueva regla canónica de regionId (country_code.type.normalized_place_name)
 * - Garantiza que Barcelona siempre tenga el mismo regionId
 * 
 * Esta función:
 * - Filtra spots sin locationRegion canónico (o con string legacy)
 * - O fuerza recalcular si la migración es forzosa (para unificar duplicados)
 * - Migra cada spot usando resolveRegion() desde RegionResolver (nueva regla)
 * - Procesa en lotes para evitar rate limits de Mapbox
 * 
 * @param spots - Array de spots a migrar
 * @param forceRemigration - Si es true, recalcula TODOS los spots para unificar regionId duplicados (default: false)
 * @returns Array de spots actualizados con locationRegion canónico
 */
export async function migrateSpotsRegions(spots: Spot[], forceRemigration: boolean = false): Promise<Spot[]> {
  // Si es migración forzosa, recalcular TODOS los spots
  // Esto unifica regionId duplicados (ej: múltiples Barcelona)
  let spotsToMigrate: Spot[];
  
  if (forceRemigration) {
    if (__DEV__) {
      console.log('🔄 Force remigration: Recalculating all spots to unify duplicate regionIds (country.type.place)...');
    }
    // Recalcular TODOS los spots para unificar regionId duplicados
    spotsToMigrate = spots.filter((spot) => {
      // Solo migrar spots con coordenadas válidas
      const location = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number } | undefined;
      const lat = location?.lat ?? location?.latitude;
      const lng = location?.lng ?? location?.longitude;
      return typeof lat === 'number' && typeof lng === 'number';
    });
  } else {
    // Filtrar spots que necesitan migración:
    // - No tienen locationRegion
    // - O tienen locationRegion como string (legacy)
    // - O tienen objeto pero sin regionId (inválido)
    spotsToMigrate = spots.filter((spot) => {
      if (!spot.locationRegion) {
        return true; // No tiene región
      }
      // Si es string (legacy), necesita migración
      if (typeof spot.locationRegion === 'string') {
        return true;
      }
      // Si es objeto pero no tiene regionId, necesita migración
      if (typeof spot.locationRegion === 'object' && !('regionId' in spot.locationRegion)) {
        return true;
      }
      return false; // Ya tiene región canónica
    });
  }
  
  // Si no hay spots para migrar (y no es migración forzosa), aún debemos eliminar spots inválidos
  // Esto asegura que el dataset siempre esté limpio, incluso si todos los spots ya tienen región canónica
  if (spotsToMigrate.length === 0 && !forceRemigration) {
    // Verificar si hay spots inválidos que eliminar
    const { validSpots, deletedCount, deletedSpotIds } = deleteInvalidSpots(spots);
    
    if (__DEV__ && deletedCount > 0) {
      console.log(`🗑️ Cleanup: Deleted ${deletedCount} invalid spots (missing canonical locationRegion)`);
      if (deletedSpotIds.length <= 10) {
        console.log(`   Deleted spot IDs: ${deletedSpotIds.join(', ')}`);
      } else {
        console.log(`   Deleted spot IDs (first 10): ${deletedSpotIds.slice(0, 10).join(', ')}...`);
      }
    }
    
    return validSpots;
  }

  if (__DEV__) {
    console.log(`🔄 Migrating ${spotsToMigrate.length} spots to populate canonical locationRegion...`);
  }

  // Migrar spots en lotes (con límite para evitar rate limits de Mapbox)
  const BATCH_SIZE = 5;
  const migratedSpots: Spot[] = [];
  
  for (let i = 0; i < spotsToMigrate.length; i += BATCH_SIZE) {
    const batch = spotsToMigrate.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((spot) => migrateSpotRegion(spot, forceRemigration))
    );
    migratedSpots.push(...batchResults);
    
    // Pequeña pausa entre batches para evitar rate limits de Mapbox
    if (i + BATCH_SIZE < spotsToMigrate.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  // Si es migración forzosa, usar solo spots migrados (ya recalculados todos)
  // Si no, combinar spots migrados con spots que ya tenían región canónica
  const result = forceRemigration 
    ? migratedSpots.filter((spot) => spot.locationRegion && typeof spot.locationRegion === 'object' && 'regionId' in spot.locationRegion)
    : (() => {
        const spotsWithCanonicalRegion = spots.filter((spot) => {
          return spot.locationRegion && 
                 typeof spot.locationRegion === 'object' && 
                 'regionId' in spot.locationRegion &&
                 !spotsToMigrate.some(s => s.id === spot.id); // Excluir spots que fueron migrados
        });
        return [...spotsWithCanonicalRegion, ...migratedSpots];
      })();

  const migratedCount = migratedSpots.filter(
    (spot) => spot.locationRegion && 
              typeof spot.locationRegion === 'object' && 
              'regionId' in spot.locationRegion
  ).length;

  if (__DEV__) {
    if (forceRemigration) {
      console.log(`✅ Force remigration: Recalculated ${migratedCount} spots with canonical regionId (unified duplicates)`);
    } else {
      console.log(`✅ Migrated ${migratedCount} spots with canonical locationRegion`);
    }
  }

  // IMPORTANTE: Después de migrar, eliminar spots que aún no tienen locationRegion canónico válido
  // Esto elimina spots que fallaron en resolveRegion() o que no tienen coordenadas válidas
  // DECISIÓN ARQUITECTÓNICA: Preferimos perder datos antes que corromper el modelo
  const { validSpots, deletedCount, deletedSpotIds } = deleteInvalidSpots(result);
  
  if (__DEV__ && deletedCount > 0) {
    console.log(`🗑️ Post-migration cleanup: Deleted ${deletedCount} invalid spots (missing canonical locationRegion)`);
    if (deletedSpotIds.length <= 10) {
      console.log(`   Deleted spot IDs: ${deletedSpotIds.join(', ')}`);
    } else {
      console.log(`   Deleted spot IDs (first 10): ${deletedSpotIds.slice(0, 10).join(', ')}...`);
    }
  }

  // IMPORTANTE: Si fue migración forzosa, limpiar cache de regiones
  // Esto asegura que futuras llamadas usen los nuevos regionId canónicos
  if (forceRemigration) {
    clearRegionCache();
    if (__DEV__) {
      console.log(`🔄 Region cache cleared after force remigration`);
    }
  }

  return validSpots;
}
