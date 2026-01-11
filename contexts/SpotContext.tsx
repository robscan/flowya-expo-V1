/**
 * SpotContext - Gestión de estado de Spots
 * Scope 3.1: Estado de Spots y funciones de gestión
 * 
 * Funciones:
 * - crearSpot
 * - actualizarSpot
 * - obtenerSpots
 * - Manejo de Spots incompletos (por diseño, los spots pueden ser incompletos)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Spot , mockSpots } from '@/data/spots';
import { generateSpotContent as generateAIContent, GenerateContentOptions } from '@/utils/aiContentGenerator';
import { migrateOwnersLegacy } from '@/utils/ownerMigration';
import { migrateSpotsRegions } from '@/core/region';
import { normalizeAllSpots } from '@/utils/spotNormalizer';
import { removeImageState } from '@/utils/imageCache';
import { useAuth } from './AuthContext';

const STORAGE_KEY = '@flowya_spots';
const REGION_REMIGRATION_KEY = '@flowya_region_remigration_done';
const LEGACY_MARKED_KEY = '@flowya_legacy_marked';

// ============================================================================
// TIPOS DE CACHE
// ============================================================================

export type SpotLoadState = 
  | 'not_seen'    // Spot no ha sido renderizado aún
  | 'seen'        // Spot ha sido renderizado (marcado automáticamente)
  | 'available';  // Spot completamente cargado (datos e imágenes)

interface SpotCacheEntry {
  spotId: string;
  loadState: SpotLoadState;
  lastSeen: number; // timestamp para debugging/purga
}

interface SpotContextType {
  spots: Spot[];
  isLoading: boolean;
  getSpotById: (id: string) => Spot | undefined;
  getSpotsByType: (type: Spot['type']) => Spot[];
  createSpot: (spot: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>) => Spot;
  updateSpot: (id: string, updates: Partial<Spot>) => void;
  deleteSpot: (id: string) => void;
  generateSpotContent: (spotId: string, options?: GenerateContentOptions) => Promise<void>;
  refreshSpots: () => Promise<void>;
  // Funciones de cache
  getSpotLoadState: (spotId: string) => SpotLoadState;
  markSpotAsSeen: (spotId: string) => void;
  markSpotAsAvailable: (spotId: string) => void;
  isSpotAvailable: (spotId: string) => boolean;
  clearSpotCache: () => void; // Para testing/debugging
}

const SpotContext = createContext<SpotContextType | undefined>(undefined);

export function SpotProvider({ children }: { children: ReactNode }) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Ref para prevenir guardado durante carga inicial
  const isInitialLoadRef = React.useRef(true);
  // Ref para rastrear el valor anterior de spots para evitar guardados innecesarios
  const previousSpotsRef = React.useRef<string>('');
  
  // Cache global en memoria por Spot ID (persiste durante sesión)
  const spotCacheRef = useRef<Map<string, SpotLoadState>>(new Map());

  // Función para guardar spots (debe estar definida antes de los useEffect)
  const saveSpots = React.useCallback(async (spotsToSave: Spot[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(spotsToSave));
    } catch (error) {
      console.error('Error saving spots:', error);
    }
  }, []);

  // Verificar si se debe forzar remigración de regiones (solo una vez, después de corrección)
  const shouldForceRegionRemigration = React.useCallback(async (): Promise<boolean> => {
    try {
      const done = await AsyncStorage.getItem(REGION_REMIGRATION_KEY);
      if (done === 'true') {
        return false; // Ya se ejecutó, no forzar
      }
      // Marcar como ejecutado para futuras cargas
      await AsyncStorage.setItem(REGION_REMIGRATION_KEY, 'true');
      return true; // Primera ejecución, forzar remigración
    } catch (error) {
      if (__DEV__) {
        console.error('Error checking region remigration status:', error);
      }
      return false; // En caso de error, no forzar
    }
  }, []);

  // ============================================================================
  // FUNCIONES DE CACHE
  // ============================================================================

  const getSpotLoadState = React.useCallback((spotId: string): SpotLoadState => {
    return spotCacheRef.current.get(spotId) || 'not_seen';
  }, []);

  const markSpotAsSeen = React.useCallback((spotId: string) => {
    const currentState = spotCacheRef.current.get(spotId);
    // Si ya está como 'available', mantener 'available'
    // Si está como 'not_seen' o no existe, cambiar a 'seen'
    if (currentState !== 'available') {
      spotCacheRef.current.set(spotId, 'seen');
    }
  }, []);

  const markSpotAsAvailable = React.useCallback((spotId: string) => {
    spotCacheRef.current.set(spotId, 'available');
  }, []);

  const isSpotAvailable = React.useCallback((spotId: string): boolean => {
    return getSpotLoadState(spotId) === 'available';
  }, [getSpotLoadState]);

  const clearSpotCache = React.useCallback(() => {
    spotCacheRef.current.clear();
  }, []);

  // Inicializar cache marcando todos los Spots como 'available'
  const initializeSpotCache = React.useCallback((spotsToCache: Spot[]) => {
    spotsToCache.forEach((spot) => {
      spotCacheRef.current.set(spot.id, 'available');
    });
  }, []);

  // Función para cargar spots (debe estar definida antes de los useEffect)
  const loadSpots = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let loadedSpots: Spot[];
      
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir fechas
        let spotsWithDates = parsed.map((spot: any) => ({
          ...spot,
          createdAt: new Date(spot.createdAt),
          updatedAt: new Date(spot.updatedAt),
        }));
        
        // CANONICAL: Migrar owners legacy (UNA SOLA VEZ, no dinámico)
        // Esta migración se ejecuta una sola vez y persiste cambios permanentemente
        loadedSpots = await migrateOwnersLegacy(spotsWithDates);
        
        // Verificar si hubo cambios en owners para guardar
        const hasOwnerChanges = loadedSpots.some((spot, index) => {
          const original = spotsWithDates[index];
          return original && spot.createdBy !== original.createdBy;
        });
        if (hasOwnerChanges) {
          await saveSpots(loadedSpots);
        }
        
        // Detectar nuevos spots en mockSpots que no están en el storage
        const storedIds = new Set(loadedSpots.map((s: Spot) => s.id));
        const newSpotsFromMock = mockSpots.filter(spot => !storedIds.has(spot.id));
        
        // Migrar owners de nuevos spots desde mockSpots (también se ejecuta una sola vez)
        if (newSpotsFromMock.length > 0) {
          const newSpotsMigrated = await migrateOwnersLegacy(newSpotsFromMock);
          loadedSpots = [...loadedSpots, ...newSpotsMigrated];
          // Guardar los nuevos spots con owners asignados
          await saveSpots(loadedSpots);
          if (__DEV__) {
            console.log(`✅ ${newSpotsMigrated.length} nuevos spots agregados con owners migrados`);
          }
        }
        
        // CANONICAL: Migrar spots para poblar locationRegion (idempotente)
        // Primera ejecución después de la corrección: forzar remigración para unificar regionId duplicados
        // Ejecuciones subsecuentes: solo migrar spots que necesitan migración
        const spotsBeforeRegionMigration = [...loadedSpots];
        const shouldForceRemigration = await shouldForceRegionRemigration();
        loadedSpots = await migrateSpotsRegions(loadedSpots, shouldForceRemigration);
        
        // Guardar spots migrados si hubo cambios en regiones o si se eliminaron spots inválidos
        const hasRegionChanges = loadedSpots.some((spot, index) => {
          const original = spotsBeforeRegionMigration[index];
          return original && spot.locationRegion !== original.locationRegion;
        });
        const hasDeletedSpots = loadedSpots.length < spotsBeforeRegionMigration.length;
        
        if (hasRegionChanges || hasDeletedSpots) {
          await saveSpots(loadedSpots);
          if (__DEV__ && hasDeletedSpots) {
            const deletedCount = spotsBeforeRegionMigration.length - loadedSpots.length;
            console.log(`✅ Saved ${loadedSpots.length} canonical spots (${deletedCount} invalid spots removed)`);
          }
        }
        
        // SCOPE 6.2: Normalizar spots legacy al cargar
        loadedSpots = normalizeAllSpots(loadedSpots);
        
        // SCOPE 6.3: Marcar spots existentes como legacy (una sola vez)
        const shouldMarkLegacy = async (): Promise<boolean> => {
          try {
            const done = await AsyncStorage.getItem(LEGACY_MARKED_KEY);
            return done !== 'true';
          } catch {
            return false;
          }
        };
        
        if (await shouldMarkLegacy()) {
          loadedSpots = loadedSpots.map(spot => ({
            ...spot,
            isLegacySpot: true, // SCOPE 6.3: Marcar como legacy
          }));
          // Marcar como ejecutado para futuras cargas
          await AsyncStorage.setItem(LEGACY_MARKED_KEY, 'true');
          // Guardar spots marcados como legacy
          await saveSpots(loadedSpots);
          if (__DEV__) {
            console.log(`[SpotContext] Marked ${loadedSpots.length} spots as legacy`);
          }
        }
      } else {
        // Usar mock data si no hay datos guardados
        // CANONICAL: Migrar owners legacy (UNA SOLA VEZ, no dinámico)
        loadedSpots = await migrateOwnersLegacy(mockSpots);
        
        // CANONICAL: Migrar spots para poblar locationRegion (idempotente)
        loadedSpots = await migrateSpotsRegions(loadedSpots);
        
        // SCOPE 6.2: Normalizar spots legacy al cargar
        loadedSpots = normalizeAllSpots(loadedSpots);
        
        // SCOPE 6.3: Marcar spots existentes como legacy (una sola vez)
        const shouldMarkLegacy = async (): Promise<boolean> => {
          try {
            const done = await AsyncStorage.getItem(LEGACY_MARKED_KEY);
            return done !== 'true';
          } catch {
            return false;
          }
        };
        
        if (await shouldMarkLegacy()) {
          loadedSpots = loadedSpots.map(spot => ({
            ...spot,
            isLegacySpot: true, // SCOPE 6.3: Marcar como legacy
          }));
          // Marcar como ejecutado para futuras cargas
          await AsyncStorage.setItem(LEGACY_MARKED_KEY, 'true');
        }
        
        // Guardar los spots iniciales con owners, regiones, normalización y legacy flag asignados
        await saveSpots(loadedSpots);
      }
      
      // Inicializar cache marcando todos los Spots como 'available'
      initializeSpotCache(loadedSpots);
      setSpots(loadedSpots);
    } catch (error) {
      console.error('Error loading spots:', error);
      // Fallback a mock data con migraciones aplicadas
      // CANONICAL: Migrar owners legacy (UNA SOLA VEZ)
      let fallbackSpots = await migrateOwnersLegacy(mockSpots);
      
      // CANONICAL: Migrar spots para poblar locationRegion (idempotente)
      fallbackSpots = await migrateSpotsRegions(fallbackSpots);
      
      // SCOPE 6.2: Normalizar spots legacy al cargar
      fallbackSpots = normalizeAllSpots(fallbackSpots);
      
      initializeSpotCache(fallbackSpots);
      setSpots(fallbackSpots);
    } finally {
      setIsLoading(false);
    }
  }, [initializeSpotCache]);

  // Cargar spots desde AsyncStorage
  useEffect(() => {
    loadSpots();
  }, [loadSpots]);

  // Guardar spots en AsyncStorage cuando cambien (pero no durante carga inicial)
  useEffect(() => {
    // Solo guardar si no estamos en carga inicial y spots realmente cambió
    if (!isLoading && !isInitialLoadRef.current) {
      const currentSpotsString = JSON.stringify(spots);
      if (currentSpotsString !== previousSpotsRef.current && spots.length >= 0) {
        previousSpotsRef.current = currentSpotsString;
        saveSpots(spots);
      }
    }
    // Marcar que la carga inicial terminó cuando isLoading cambia a false por primera vez
    if (!isLoading && isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      previousSpotsRef.current = JSON.stringify(spots);
    }
  }, [spots, isLoading, saveSpots]);

  const refreshSpots = async () => {
    // Recargar spots desde AsyncStorage
    await loadSpots();
  };

  const getSpotById = (id: string): Spot | undefined => {
    return spots.find((spot) => spot.id === id);
  };

  const getSpotsByType = (type: Spot['type']): Spot[] => {
    return spots.filter((spot) => spot.type === type);
  };

  const createSpot = (spotData: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>): Spot => {
    // Validar que el usuario esté autenticado antes de crear
    if (!user?.id) {
      throw new Error('User must be authenticated to create spots');
    }

    const now = new Date();
    const newSpot: Spot = {
      ...spotData,
      id: `spot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdBy: user.id, // Guardar ID del usuario que crea el spot
      createdAt: now,
      updatedAt: now,
    };

    // P0-02: Invalidar caché de imágenes del spot (forzar recarga)
    if (newSpot.photos && newSpot.photos.length > 0) {
      newSpot.photos.forEach((photoUri) => {
        removeImageState(photoUri);
      });
    }

    // Agregar al cache como 'available' (nuevo Spot, ya está en memoria)
    markSpotAsAvailable(newSpot.id);
    setSpots((prev) => [...prev, newSpot]);
    return newSpot;
  };

  const updateSpot = (id: string, updates: Partial<Spot>) => {
    setSpots((prev) =>
      prev.map((spot) => {
        if (spot.id === id) {
          // P0-02: Invalidar caché de imágenes si se actualizan las fotos
          if (updates.photos) {
            // Invalidar URIs antiguas
            if (spot.photos && spot.photos.length > 0) {
              spot.photos.forEach((photoUri) => {
                removeImageState(photoUri);
              });
            }
            // Invalidar URIs nuevas (para forzar recarga)
            updates.photos.forEach((photoUri) => {
              removeImageState(photoUri);
            });
          }

          return { ...spot, ...updates, updatedAt: new Date() };
        }
        return spot;
      })
    );
  };

  const deleteSpot = (id: string) => {
    // Eliminar del cache también
    spotCacheRef.current.delete(id);
    setSpots((prev) => prev.filter((spot) => spot.id !== id));
  };

  const generateSpotContent = async (spotId: string, options?: GenerateContentOptions): Promise<void> => {
    const spot = getSpotById(spotId);
    if (!spot) {
      throw new Error(`Spot with id ${spotId} not found`);
    }

    try {
      const generatedContent = await generateAIContent(spot, options);
      
      // SCOPE 2: Actualizar spot con contenido generado (todos los campos del contrato)
      updateSpot(spotId, {
        description: generatedContent.spotDescription || spot.description,
        whyItMatters: generatedContent.whyItMatters || generatedContent.spotDescription || spot.whyItMatters,
        culturalContext: generatedContent.culturalContext || spot.culturalContext,
        planInfo: generatedContent.planInfo || spot.planInfo, // SCOPE 2: Persistir planInfo
        howToVisit: generatedContent.howToVisit || spot.howToVisit,
        narration: generatedContent.narration || spot.narration,
        aiGenerated: generatedContent.aiGenerated || spot.aiGenerated,
      });
    } catch (error) {
      console.error('Error generating spot content:', error);
      throw error;
    }
  };

  const value: SpotContextType = {
    spots,
    isLoading,
    getSpotById,
    getSpotsByType,
    createSpot,
    updateSpot,
    deleteSpot,
    generateSpotContent,
    refreshSpots,
    // Funciones de cache
    getSpotLoadState,
    markSpotAsSeen,
    markSpotAsAvailable,
    isSpotAvailable,
    clearSpotCache,
  };

  return <SpotContext.Provider value={value}>{children}</SpotContext.Provider>;
}

export function useSpot() {
  const context = useContext(SpotContext);
  if (context === undefined) {
    throw new Error('useSpot must be used within a SpotProvider');
  }
  return context;
}

