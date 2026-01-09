/**
 * useBaseLocation Hook
 * CANONICAL: Hook para ubicación base estable
 * 
 * SCOPE 0: Migrado para usar LocationProvider (fuente única de verdad)
 * 
 * Características:
 * - Usa LocationProvider centralizado
 * - Ubicación se carga UNA SOLA VEZ al montar el provider
 * - Estabiliza la ubicación como "baseLocation"
 * - NO se actualiza automáticamente
 * - Solo se actualiza cuando el usuario refresca explícitamente
 * - Retorna ubicación estable y función para refrescar manualmente
 * 
 * Principio: La ubicación base es estable durante la sesión de la app.
 * No cambia por scroll, render, o eventos visuales.
 * Solo cambia cuando el usuario explícitamente refresca.
 * 
 * Arquitectura:
 * - LocationProvider en _layout.tsx (fuente única de verdad)
 * - Este hook consume el context
 * - Todas las pantallas usan este hook
 */

import { useBaseLocation as useLocationContext } from '@/contexts/LocationContext';

// Re-exportar tipos del context para compatibilidad
export type { BaseLocation } from '@/contexts/LocationContext';

/**
 * Hook para obtener ubicación base estable
 * 
 * La ubicación se carga UNA SOLA VEZ al montar el LocationProvider.
 * Es un dato congelado durante la sesión de la app.
 * Solo se actualiza cuando se llama explícitamente a refreshLocation.
 * 
 * @returns {LocationContextType} baseLocation, isLoading, refreshLocation
 */
export function useBaseLocation() {
  return useLocationContext();
}
