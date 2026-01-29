/**
 * RegionContext - Gesti?n de regi?n seleccionada
 * CANONICAL: Context para manejar regi?n activa en Home usando regionId can?nico
 * 
 * Funcionalidades:
 * - Mantiene regionId seleccionado (string | null)
 * - Persiste selecci?n en AsyncStorage
 * - Se inicializa con regi?n del usuario (derivada desde baseLocation usando Mapbox)
 * - Proporciona setSelectedRegionId para cambiar regi?n
 * - Proporciona setCurrentLocation para activar "Current location" (regi?n din?mica)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from 'react';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { resolveRegion, isCanonicalRegionId } from '@/core/region';

const STORAGE_KEY = '@flowya_selected_region_id';
// Valor especial para indicar que se usa "Current location" (regi?n din?mica)
const CURRENT_LOCATION_MARKER = '__CURRENT_LOCATION__';

interface RegionContextType {
  selectedRegionId: string | null;
  currentRegionLabel: string | null; // Label actual de la regi?n (para UI)
  setSelectedRegionId: (regionId: string | null) => Promise<void>;
  setCurrentLocation: () => Promise<void>; // Nueva funci?n para activar "Current location"
  isCurrentLocation: boolean; // Indica si est? usando "Current location"
  isLoading: boolean;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export function RegionProvider({ children }: { children: ReactNode }) {
  const [selectedRegionId, setSelectedRegionIdState] = useState<string | null>(null);
  const [currentRegionLabel, setCurrentRegionLabel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { baseLocation } = useBaseLocation();
  const [isCurrentLocation, setIsCurrentLocation] = useState(false);
  const hasInitializedRef = useRef(false);

  // Cargar regi?n desde AsyncStorage o derivar desde baseLocation usando Mapbox
  useEffect(() => {
    const initializeRegion = async () => {
      try {
        // 1. Intentar cargar regi?n desde AsyncStorage
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === CURRENT_LOCATION_MARKER) {
          // Modo "Current location" guardado
          setIsCurrentLocation(true);
          if (baseLocation) {
            const canonicalRegion = await resolveRegion(
              baseLocation.latitude,
              baseLocation.longitude
            );
            if (canonicalRegion) {
              // NO guardar regionId, siempre usar ubicaci?n actual
              setSelectedRegionIdState(canonicalRegion.regionId);
              setCurrentRegionLabel(canonicalRegion.label);
            } else {
              setSelectedRegionIdState(null);
              setCurrentRegionLabel(null);
            }
          }
          setIsLoading(false);
          hasInitializedRef.current = true;
          return;
        } else if (stored) {
          if (!isCanonicalRegionId(stored)) {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setSelectedRegionIdState(null);
            setCurrentRegionLabel(null);
            setIsCurrentLocation(true);
            await AsyncStorage.setItem(STORAGE_KEY, CURRENT_LOCATION_MARKER);
            if (baseLocation) {
              const canonicalRegion = await resolveRegion(
                baseLocation.latitude,
                baseLocation.longitude
              );
              if (canonicalRegion) {
                setSelectedRegionIdState(canonicalRegion.regionId);
                setCurrentRegionLabel(canonicalRegion.label);
              } else {
                setSelectedRegionIdState(null);
                setCurrentRegionLabel(null);
              }
            }
            setIsLoading(false);
            hasInitializedRef.current = true;
            return;
          }
          // Regi?n manual guardada
          setSelectedRegionIdState(stored);
          setIsCurrentLocation(false);
          setIsLoading(false);
          hasInitializedRef.current = true;
          return;
        }

        // 2. Si no hay regi?n guardada, usar "Current location" por defecto
        // Resolver regi?n din?micamente desde baseLocation
        setIsCurrentLocation(true);
        // Guardar marker para que en pr?xima sesi?n tambi?n use "Current location" por defecto
        await AsyncStorage.setItem(STORAGE_KEY, CURRENT_LOCATION_MARKER);
        if (baseLocation) {
          const canonicalRegion = await resolveRegion(
            baseLocation.latitude,
            baseLocation.longitude
          );
          if (canonicalRegion) {
            // NO guardar regionId, siempre usar ubicaci?n actual
            setSelectedRegionIdState(canonicalRegion.regionId);
            setCurrentRegionLabel(canonicalRegion.label);
          } else {
            setSelectedRegionIdState(null);
            setCurrentRegionLabel(null);
          }
        } else {
          setSelectedRegionIdState(null);
          setCurrentRegionLabel(null);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('Error initializing region:', error);
        }
      } finally {
        setIsLoading(false);
        // Marcar como inicializado despu?s de la primera carga
        hasInitializedRef.current = true;
      }
    };

    initializeRegion();
  }, [baseLocation]);


  // Actualizar regi?n cuando cambia baseLocation SI est? en modo "Current location"
  // IMPORTANTE: Solo se ejecuta despu?s de que se haya inicializado (hasInitializedRef.current === true)
  // Y solo cuando realmente cambia baseLocation (no durante inicializaci?n)
  useEffect(() => {
    // Esperar a que termine la inicializaci?n antes de actualizar
    if (!hasInitializedRef.current) {
      return;
    }
    
    const updateCurrentLocation = async () => {
        if (isCurrentLocation && baseLocation) {
          try {
            const canonicalRegion = await resolveRegion(
              baseLocation.latitude,
              baseLocation.longitude
            );
            if (canonicalRegion) {
              setSelectedRegionIdState(canonicalRegion.regionId);
              setCurrentRegionLabel(canonicalRegion.label);
            } else {
              setSelectedRegionIdState(null);
              setCurrentRegionLabel(null);
            }
          } catch (error) {
          if (__DEV__) {
            console.warn('Error updating current location region:', error);
          }
        }
      }
    };

    updateCurrentLocation();
  }, [isCurrentLocation, baseLocation]);

  // Funci?n para cambiar regi?n seleccionada usando regionId can?nico (regi?n manual)
  const setSelectedRegionId = useCallback(async (regionId: string | null) => {
    if (regionId && !isCanonicalRegionId(regionId)) {
      if (__DEV__) {
        console.warn('Invalid regionId format; ignoring selection.');
      }
      return;
    }
    setSelectedRegionIdState(regionId);
    setIsCurrentLocation(false); // Ya no es "Current location"
    // Limpiar label (se recalcular? desde availableRegions en UI)
    setCurrentRegionLabel(null);
    try {
      if (regionId) {
        await AsyncStorage.setItem(STORAGE_KEY, regionId);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('Error saving selected region:', error);
      }
    }
  }, []);

  // Funci?n para activar "Current location" (regi?n din?mica)
  const setCurrentLocation = useCallback(async () => {
    try {
      // Marcar como "Current location"
      setIsCurrentLocation(true);
      // Guardar marker especial en AsyncStorage (NO un regionId real)
      await AsyncStorage.setItem(STORAGE_KEY, CURRENT_LOCATION_MARKER);
      
      // Resolver regi?n desde baseLocation actual
      if (baseLocation) {
        const canonicalRegion = await resolveRegion(
          baseLocation.latitude,
          baseLocation.longitude
        );
        if (canonicalRegion) {
          setSelectedRegionIdState(canonicalRegion.regionId);
          setCurrentRegionLabel(canonicalRegion.label);
        } else {
          setSelectedRegionIdState(null);
          setCurrentRegionLabel(null);
        }
      } else {
        setSelectedRegionIdState(null);
        setCurrentRegionLabel(null);
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('Error setting current location:', error);
      }
    }
  }, [baseLocation]);

  const value: RegionContextType = {
    selectedRegionId,
    currentRegionLabel,
    setSelectedRegionId,
    setCurrentLocation,
    isCurrentLocation,
    isLoading,
  };

  return (
    <RegionContext.Provider value={value}>
      {children}
    </RegionContext.Provider>
  );
}

/**
 * Hook para usar RegionContext
 */
export function useRegion(): RegionContextType {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within RegionProvider');
  }
  return context;
}
