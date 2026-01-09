/**
 * useSpotCache Hook
 * Hook de utilidad para facilitar el uso del cache de Spots
 * 
 * Marca automáticamente el Spot como 'seen' al montar y proporciona
 * utilidades para consultar el estado del cache y marcar como 'available'
 */

import { useEffect, useCallback } from 'react';
import { useSpot } from '@/contexts/SpotContext';
import { SpotLoadState } from '@/contexts/SpotContext';

interface UseSpotCacheReturn {
  loadState: SpotLoadState;
  isAvailable: boolean;
  markAsAvailable: () => void;
}

/**
 * Hook para usar el cache de un Spot específico
 * @param spotId ID del Spot o null si no hay Spot
 * @returns Estado del cache y funciones utilitarias
 */
export function useSpotCache(spotId: string | null): UseSpotCacheReturn {
  const { getSpotLoadState, markSpotAsSeen, markSpotAsAvailable, isSpotAvailable } = useSpot();
  
  // Marcar como visto automáticamente cuando se monta
  useEffect(() => {
    if (spotId) {
      markSpotAsSeen(spotId);
    }
  }, [spotId, markSpotAsSeen]);
  
  const markAsAvailable = useCallback(() => {
    if (spotId) {
      markSpotAsAvailable(spotId);
    }
  }, [spotId, markSpotAsAvailable]);
  
  return {
    loadState: spotId ? getSpotLoadState(spotId) : 'not_seen',
    isAvailable: spotId ? isSpotAvailable(spotId) : false,
    markAsAvailable,
  };
}
