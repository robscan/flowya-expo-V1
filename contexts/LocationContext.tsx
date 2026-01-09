/**
 * LocationContext - Fuente Única de Verdad para Ubicación del Usuario
 * 
 * SCOPE 0: Preparación y Fundación ✅
 * SCOPE 1: Sistema de Ubicación Canónico ✅
 * 
 * ⚠️ REGLA ARQUITECTÓNICA NO NEGOCIABLE:
 * Este es el ÚNICO lugar donde se obtiene la ubicación del usuario.
 * 
 * Principios:
 * - La ubicación se carga UNA SOLA VEZ al montar el provider
 * - La ubicación es un dato congelado durante la sesión de la app
 * - Solo se actualiza cuando el usuario explícitamente refresca
 * - NO se recalcula en cada render ni en cada pantalla
 * - NO se debe llamar Location.getCurrentPositionAsync() en ningún otro lugar
 * 
 * Arquitectura:
 * - Provider centralizado en _layout.tsx (fuente única de verdad)
 * - Hook useBaseLocation() consume el context
 * - Todas las pantallas usan el mismo hook
 * 
 * Uso:
 * ```tsx
 * // ✅ CORRECTO: Usar el hook canónico
 * const { baseLocation, isLoading, refreshLocation } = useBaseLocation();
 * 
 * // ❌ INCORRECTO: Llamar Location API directamente
 * const location = await Location.getCurrentPositionAsync(); // NO HACER ESTO
 * ```
 */

import * as Location from 'expo-location';
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';

// ============================================================================
// TIPOS
// ============================================================================

export interface BaseLocation {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  baseLocation: BaseLocation | null;
  isLoading: boolean;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function LocationProvider({ children }: { children: ReactNode }) {
  const [baseLocation, setBaseLocation] = useState<BaseLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  const loadLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setBaseLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } else {
        setBaseLocation(null);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setBaseLocation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar UNA SOLA VEZ al montar el provider
  useEffect(() => {
    if (!hasLoadedRef.current) {
      loadLocation();
      hasLoadedRef.current = true;
    }
  }, [loadLocation]);

  const refreshLocation = useCallback(async () => {
    await loadLocation();
  }, [loadLocation]);

  const value: LocationContextType = {
    baseLocation,
    isLoading,
    refreshLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

// ============================================================================
// HOOK CANÓNICO
// ============================================================================

/**
 * Hook canónico para obtener ubicación base estable
 * 
 * La ubicación se carga UNA SOLA VEZ al montar el LocationProvider.
 * Es un dato congelado durante la sesión de la app.
 * Solo se actualiza cuando se llama explícitamente a refreshLocation.
 * 
 * @returns {LocationContextType} baseLocation, isLoading, refreshLocation
 * 
 * @throws {Error} Si se usa fuera de LocationProvider
 */
export function useBaseLocation(): LocationContextType {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useBaseLocation must be used within LocationProvider');
  }
  return context;
}
