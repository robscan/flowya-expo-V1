/**
 * Spot Text Validator
 * SCOPE 3: Función de validación para logs de desarrollo
 * 
 * Valida que todos los spots tengan los campos de texto requeridos
 * y genera warnings útiles para debugging.
 */

import { Spot } from '@/data/spots';

export interface SpotValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
}

/**
 * Validar que un spot tenga todos los campos de texto requeridos
 */
export function validateSpotTextFields(spot: Spot): SpotValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Verificar narration
  if (!spot.narration) {
    missing.push('narration');
  } else {
    if (!spot.narration.anticipation || spot.narration.anticipation.trim().length === 0) {
      missing.push('narration.anticipation');
    }
    if (!spot.narration.presence || spot.narration.presence.trim().length === 0) {
      missing.push('narration.presence');
    }
    if (!spot.narration.transition || spot.narration.transition.trim().length === 0) {
      missing.push('narration.transition');
    }
  }

  // Verificar planInfo
  if (!spot.planInfo || spot.planInfo.trim().length === 0) {
    missing.push('planInfo');
  }

  // Verificar description (spotDescription equivalente)
  if (!spot.description && !spot.whyItMatters) {
    warnings.push('No description or whyItMatters found');
  }

  return {
    isValid: missing.length === 0,
    missingFields: missing,
    warnings,
  };
}

/**
 * Validar todos los spots en un array y loggear resultados
 * Útil para debugging durante desarrollo
 */
export function validateAllSpots(spots: Spot[]): void {
  if (__DEV__) {
    console.log(`[SpotValidator] Validating ${spots.length} spots...`);
    
    const invalidSpots: Array<{ spotId: string; result: SpotValidationResult }> = [];
    
    spots.forEach(spot => {
      const result = validateSpotTextFields(spot);
      if (!result.isValid || result.warnings.length > 0) {
        invalidSpots.push({ spotId: spot.id, result });
      }
    });

    if (invalidSpots.length === 0) {
      console.log('[SpotValidator] ✅ All spots are valid');
    } else {
      console.warn(`[SpotValidator] ⚠️ Found ${invalidSpots.length} spots with issues:`);
      invalidSpots.forEach(({ spotId, result }) => {
        console.warn(`[SpotValidator] Spot "${spotId}":`, {
          missingFields: result.missingFields,
          warnings: result.warnings,
        });
      });
    }
  }
}
