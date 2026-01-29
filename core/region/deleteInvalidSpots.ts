/**
 * Delete Invalid Spots - Core Module
 * CANONICAL: Eliminación definitiva de spots sin locationRegion canónico válido
 * 
 * DECISIÓN ARQUITECTÓNICA (NO NEGOCIABLE):
 * 👉 Todo spot que no tenga locationRegion canónico válido DEBE ELIMINARSE.
 * 
 * No se intenta:
 * - resolverlos
 * - repararlos
 * - asignar regiones genéricas
 * - marcarlos como legacy
 * - esconderlos con flags
 * 
 * Son datos inválidos. El sistema prefiere perder datos antes que corromper su modelo.
 * 
 * Responsabilidad EXCLUSIVA:
 * - Identifica spots sin locationRegion canónico válido
 * - Los elimina permanentemente del dataset
 * - Retorna solo spots válidos
 * - Es idempotente (puede ejecutarse múltiples veces sin efectos secundarios)
 * - NO intenta resolver ni reparar spots inválidos
 * - NO depende de auth
 * 
 * IMPORTANTE:
 * - Esta función se ejecuta automáticamente después de migrateSpotsRegions()
 * - NO debe ejecutarse manualmente
 * - Es idempotente: solo elimina spots que son inválidos
 */

import { Spot } from '@/data/spots';
import { LocationRegion } from '@/types/locationRegion';
import { isCanonicalRegionId } from './regionIdGenerator';

/**
 * Validar si un spot tiene locationRegion canónico válido
 * CANONICAL: Criterio único de validez para spots
 * 
 * Un spot es válido si y solo si:
 * - Tiene locationRegion
 * - locationRegion es un objeto (no string legacy)
 * - locationRegion tiene regionId canónico (formato country.type.place)
 * - locationRegion tiene label (campo canónico obligatorio)
 * - locationRegion tiene type (campo canónico obligatorio)
 * - locationRegion tiene countryCode (campo canónico obligatorio)
 * 
 * @param spot - Spot a validar
 * @returns true si el spot tiene locationRegion canónico válido, false en caso contrario
 */
function isValidSpot(spot: Spot): boolean {
  // Si no tiene locationRegion, es inválido
  if (!spot.locationRegion) {
    return false;
  }

  // Si locationRegion es string (legacy), es inválido
  if (typeof spot.locationRegion === 'string') {
    return false;
  }

  // Si locationRegion no es objeto, es inválido
  if (typeof spot.locationRegion !== 'object') {
    return false;
  }

  // Validar que tiene todos los campos canónicos requeridos
  const region = spot.locationRegion as LocationRegion;
  
  // regionId es OBLIGATORIO y debe ser canónico
  if (!region.regionId || typeof region.regionId !== 'string' || region.regionId.trim() === '') {
    return false;
  }
  if (!isCanonicalRegionId(region.regionId)) {
    return false;
  }

  // label es OBLIGATORIO
  if (!region.label || typeof region.label !== 'string' || region.label.trim() === '') {
    return false;
  }

  // type es OBLIGATORIO (solo city/region son válidos)
  if (!region.type || !['city', 'region'].includes(region.type)) {
    return false;
  }

  // countryCode es OBLIGATORIO
  if (!region.countryCode || typeof region.countryCode !== 'string' || region.countryCode.trim() === '') {
    return false;
  }

  // Si pasa todas las validaciones, es válido
  return true;
}

/**
 * Eliminar spots inválidos del dataset
 * CANONICAL: Eliminación definitiva de spots sin locationRegion canónico válido
 * 
 * Esta función:
 * - Identifica spots sin locationRegion canónico válido
 * - Los elimina permanentemente del dataset
 * - Retorna solo spots válidos
 * - Es idempotente (puede ejecutarse múltiples veces)
 * - NO intenta resolver ni reparar spots inválidos
 * - NO asigna regiones dummy o genéricas
 * - NO marca spots como legacy
 * 
 * CRITERIO DE ELIMINACIÓN:
 * Un spot es eliminado si:
 * - No tiene locationRegion
 * - Tiene locationRegion como string (legacy)
 * - Tiene locationRegion como objeto pero sin regionId
 * - Tiene locationRegion como objeto pero sin label
 * - Tiene locationRegion como objeto pero sin type válido
 * - Tiene locationRegion como objeto pero sin countryCode
 * 
 * @param spots - Array de spots a filtrar
 * @returns Array con solo spots válidos (sin locationRegion canónico válido eliminados)
 */
export function deleteInvalidSpots(spots: Spot[]): {
  validSpots: Spot[];
  deletedCount: number;
  deletedSpotIds: string[];
} {
  const validSpots: Spot[] = [];
  const deletedSpotIds: string[] = [];
  
  spots.forEach((spot) => {
    if (isValidSpot(spot)) {
      validSpots.push(spot);
    } else {
      deletedSpotIds.push(spot.id);
    }
  });

  const deletedCount = deletedSpotIds.length;

  if (__DEV__ && deletedCount > 0) {
    console.log(`🗑️ Deleted ${deletedCount} invalid spots (missing canonical locationRegion)`);
    if (deletedSpotIds.length <= 10) {
      console.log(`   Deleted spot IDs: ${deletedSpotIds.join(', ')}`);
    } else {
      console.log(`   Deleted spot IDs (first 10): ${deletedSpotIds.slice(0, 10).join(', ')}...`);
    }
  }

  return {
    validSpots,
    deletedCount,
    deletedSpotIds,
  };
}

/**
 * Validar y eliminar spots inválidos (función de conveniencia)
 * CANONICAL: Wrapper que retorna solo los spots válidos
 * 
 * @param spots - Array de spots a validar
 * @returns Array con solo spots válidos
 */
export function getValidSpots(spots: Spot[]): Spot[] {
  return deleteInvalidSpots(spots).validSpots;
}
