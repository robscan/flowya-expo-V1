/**
 * Spot Editorial Audit
 * SCOPE 6.1: Inventario interno de estado editorial de spots
 * 
 * Funcionalidades:
 * - Auditar estado editorial de un spot
 * - Auditar todos los spots existentes
 * - Generar reporte de campos faltantes (solo para desarrollo/debugging)
 * 
 * IMPORTANTE: Este estado NO es visible al usuario, NO bloquea nada.
 */

import { Spot } from '@/data/spots';

/**
 * Estado editorial de un spot
 * SCOPE 6.1: Inventario interno (no visible al usuario, no bloquea nada)
 */
export interface SpotEditorialStatus {
  spotDescription: 'ok' | 'missing';
  // FASE 3: narration eliminado - Flow narrative eliminado del modelo Spot
  howToVisit: 'ok' | 'missing';
  planInfo: 'ok' | 'missing';
}

/**
 * Auditar estado editorial de un spot
 */
export function auditSpotEditorial(spot: Spot): SpotEditorialStatus {
  return {
    spotDescription: (spot.description || spot.whyItMatters)?.trim().length > 0 ? 'ok' : 'missing',
    // FASE 3: narration eliminado - Flow narrative eliminado del modelo Spot
    howToVisit: spot.howToVisit ? 'ok' : 'missing',
    planInfo: spot.planInfo?.trim().length > 0 ? 'ok' : 'missing',
  };
}

/**
 * Auditar todos los spots existentes
 * Retorna mapa de spot ID -> estado editorial
 */
export function auditAllSpots(spots: Spot[]): Map<string, SpotEditorialStatus> {
  const auditResults = new Map<string, SpotEditorialStatus>();
  spots.forEach(spot => {
    auditResults.set(spot.id, auditSpotEditorial(spot));
  });
  return auditResults;
}

/**
 * Loggear resultado de auditoría (solo para desarrollo/debugging)
 */
export function logEditorialAudit(spots: Spot[]): void {
  if (__DEV__) {
    console.log(`[SpotEditorialAudit] Auditing ${spots.length} spots...`);
    
    const auditResults = auditAllSpots(spots);
    const spotsWithMissingFields: { spotId: string; status: SpotEditorialStatus }[] = [];
    
    auditResults.forEach((status, spotId) => {
      const hasMissing =
        status.spotDescription === 'missing' ||
        // FASE 3: narration eliminado - Flow narrative eliminado del modelo Spot
        status.howToVisit === 'missing' ||
        status.planInfo === 'missing';
      
      if (hasMissing) {
        spotsWithMissingFields.push({ spotId, status });
      }
    });
    
    if (spotsWithMissingFields.length === 0) {
      console.log('[SpotEditorialAudit] ✅ All spots have complete editorial content');
    } else {
      console.warn(`[SpotEditorialAudit] ⚠️ Found ${spotsWithMissingFields.length} spots with missing fields:`);
      spotsWithMissingFields.forEach(({ spotId, status }) => {
        const missing: string[] = [];
        if (status.spotDescription === 'missing') missing.push('spotDescription');
        // FASE 3: narration eliminado - Flow narrative eliminado del modelo Spot
        if (status.howToVisit === 'missing') missing.push('howToVisit');
        if (status.planInfo === 'missing') missing.push('planInfo');
        
        console.warn(`[SpotEditorialAudit] Spot "${spotId}": missing ${missing.join(', ')}`);
      });
    }
  }
}
