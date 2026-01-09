/**
 * useSpotsWithDistance Hook
 * CANONICAL: Hook para calcular distancias de múltiples Spots
 * 
 * Características:
 * - Calcula distancias de un array de Spots
 * - Usa baseLocation estable
 * - Retorna array de SpotWithDistance memoizado
 * - NO es estado reactivo
 * - Memoiza por spots array + baseLocation
 * 
 * Principio: Las distancias se calculan una vez y se memoizan.
 * No se recalculan a menos que cambien los Spots o la baseLocation.
 */

import { BaseLocation } from '@/contexts/LocationContext';
import { useMemo } from 'react';
import { Spot } from '@/data/spots';
import { type SpotWithDistance } from '@/utils/dataPreparation';
import { getSpotDistance } from './useSpotDistance';

/**
 * Hook para calcular distancias de múltiples Spots
 * 
 * @param spots Array de Spots
 * @param baseLocation Ubicación base estable
 * @returns Array de SpotWithDistance memoizado
 */
export function useSpotsWithDistance(
  spots: Spot[],
  baseLocation: BaseLocation | null
): SpotWithDistance[] {
  return useMemo(() => {
    return spots.map(spot => ({
      spot,
      distance: getSpotDistance(spot, baseLocation),
    }));
  }, [spots, baseLocation?.latitude, baseLocation?.longitude]);
}
