/**
 * useSpotDistance Hook / Selector
 * CANONICAL: Cálculo canónico de distancia de Spots
 * 
 * Características:
 * - Calcula distancia de forma memoizada
 * - Usa baseLocation estable
 * - Retorna distancia o undefined
 * - NO es estado reactivo
 * - Memoiza por spotId + baseLocation
 * 
 * Principio: La distancia es un dato derivado, nunca estado.
 * Se calcula como valor puro y se memoiza correctamente.
 */

import { BaseLocation } from '@/contexts/LocationContext';
import { useMemo } from 'react';
import { useSpot } from '@/contexts/SpotContext';
import { calculateDistanceToSpot } from '@/utils/distance';

/**
 * FASE 4-5: Selector puro para calcular distancia de un Spot
 * Compatible con ambos formatos: lat/lng y latitude/longitude
 * 
 * @param spot Spot para calcular distancia (compatible con ambos formatos)
 * @param baseLocation Ubicación base estable
 * @returns Distancia en metros o undefined
 */
export function getSpotDistance(
  spot: { location: { lat: number; lng: number } | { latitude: number; longitude: number } },
  baseLocation: BaseLocation | null
): number | undefined {
  if (!baseLocation) return undefined;
  return calculateDistanceToSpot(baseLocation, spot.location) || undefined;
}

/**
 * Hook para calcular distancia de un Spot específico
 * 
 * @param spotId ID del Spot
 * @param baseLocation Ubicación base estable
 * @returns Distancia en metros o undefined
 */
export function useSpotDistance(
  spotId: string | null,
  baseLocation: BaseLocation | null
): number | undefined {
  const { getSpotById } = useSpot();

  return useMemo(() => {
    if (!spotId || !baseLocation) return undefined;
    const spot = getSpotById(spotId);
    if (!spot) return undefined;
    return getSpotDistance(spot, baseLocation);
  }, [spotId, baseLocation?.latitude, baseLocation?.longitude, getSpotById]);
}
