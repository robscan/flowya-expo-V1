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

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { migrateSpotsRegions } from '@/core/region';
import { mockSpots, Spot } from '@/data/spots';
import { generateSpotContent as generateAIContent, GenerateContentOptions } from '@/utils/aiContentGenerator';
import { removeImageState } from '@/utils/imageCache';
import { migrateSpotImageToUnsplash, migrateSpotsImagesToUnsplash } from '@/utils/imageMigration';
import { migrateOwnersLegacy } from '@/utils/ownerMigration';
import { canMigrateSpot, isValidSpotV1_2, migrateSpotToV1_2 } from '@/utils/spotMigration';
import { normalizeAllSpots } from '@/utils/spotNormalizer';
import { auditAllSpots, logAuditReport, fixSpots as fixAllSpots } from '@/utils/spotAudit';
import { useAuth } from './AuthContext';

const STORAGE_KEY = '@flowya_spots';
const REGION_REMIGRATION_KEY = '@flowya_region_remigration_done';
const LEGACY_MARKED_KEY = '@flowya_legacy_marked';
const V1_2_MIGRATION_KEY = '@flowya_v1_2_migration_done';

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
        
        // FASE 6A: Migración V1.2 - Migrar spots legacy al modelo V1.2 (UNA SOLA VEZ)
        const shouldMigrateToV1_2 = async (): Promise<boolean> => {
          try {
            const done = await AsyncStorage.getItem(V1_2_MIGRATION_KEY);
            return done !== 'true';
          } catch {
            return false;
          }
        };
        
        if (await shouldMigrateToV1_2()) {
          const spotsBeforeMigration = [...loadedSpots];
          const migratedSpots: Spot[] = [];
          const migrationErrors: { spotId: string; error: string }[] = [];
          
          for (const spot of loadedSpots) {
            try {
              // Verificar si el spot necesita migración (tiene campos legacy)
              const needsMigration = 
                !isValidSpotV1_2(spot) || // No cumple con modelo V1.2
                ('latitude' in spot.location && 'longitude' in spot.location) || // Formato antiguo de location
                (spot.photos && spot.photos.length > 0 && !spot.image?.url) || // Tiene photos pero no image
                (!spot.shortDescription && (spot.description || spot.whyItMatters)) || // Tiene description/whyItMatters pero no shortDescription
                (spot.hasGeneratedContent === undefined && spot.aiGenerated !== undefined); // Tiene aiGenerated pero no hasGeneratedContent
              
              if (needsMigration && canMigrateSpot(spot)) {
                // Migrar spot a V1.2
                const migrated = migrateSpotToV1_2(spot);
                
                // Validar que el spot migrado es válido
                if (isValidSpotV1_2(migrated)) {
                  // Convertir SpotV1_2 a Spot (manteniendo campos legacy para compatibilidad temporal)
                  const migratedSpot: Spot = {
                    ...migrated,
                    // Mantener campos legacy temporalmente para compatibilidad
                    photos: spot.photos,
                    description: spot.description,
                    whyItMatters: spot.whyItMatters,
                    culturalContext: spot.culturalContext,
                    planInfo: spot.planInfo,
                    hours: spot.hours,
                    cost: spot.cost,
                    restrictions: spot.restrictions,
                    accessibility: spot.accessibility,
                    aiGenerated: spot.aiGenerated,
                    isLegacySpot: spot.isLegacySpot,
                    createdBy: spot.createdBy,
                    locationRegion: spot.locationRegion,
                    locationLatitude: spot.locationLatitude,
                    locationLongitude: spot.locationLongitude,
                    createdAt: spot.createdAt,
                    updatedAt: new Date(), // Actualizar timestamp
                  };
                  migratedSpots.push(migratedSpot);
                } else {
                  migrationErrors.push({
                    spotId: spot.id,
                    error: 'Spot migrado no es válido según modelo V1.2',
                  });
                  // Mantener spot original si la migración falla
                  migratedSpots.push(spot);
                }
              } else {
                // Spot ya está en formato V1.2 o no puede migrarse, mantenerlo
                migratedSpots.push(spot);
              }
            } catch (error: any) {
              migrationErrors.push({
                spotId: spot.id,
                error: `Error al migrar: ${error.message || String(error)}`,
              });
              // Mantener spot original si hay error
              migratedSpots.push(spot);
            }
          }
          
          // Actualizar loadedSpots con spots migrados
          loadedSpots = migratedSpots;
          
          // Guardar spots migrados
          await saveSpots(loadedSpots);
          
          // Marcar migración como completada
          await AsyncStorage.setItem(V1_2_MIGRATION_KEY, 'true');
          
          // V1.3: Migrar imágenes no-Unsplash a Unsplash
          const spotsBeforeImageMigration = [...loadedSpots];
          loadedSpots = migrateSpotsImagesToUnsplash(loadedSpots);
          
          // Solo guardar si hubo cambios
          const hasImageChanges = spotsBeforeImageMigration.some((spot, index) => {
            const migrated = loadedSpots[index];
            return spot.image?.url !== migrated.image?.url;
          });
          
          if (hasImageChanges) {
            await saveSpots(loadedSpots);
            if (__DEV__) {
              const migratedCount = loadedSpots.filter((spot, index) => 
                spotsBeforeImageMigration[index].image?.url !== spot.image?.url
              ).length;
              console.log(`[V1.3] Migradas ${migratedCount} imágenes a Unsplash`);
            }
          }
          
          if (__DEV__) {
            const migratedCount = loadedSpots.length - migrationErrors.length;
            console.log(`[FASE 6A] Migrated ${migratedCount} spots to V1.2 model`);
            if (migrationErrors.length > 0) {
              console.warn(`[FASE 6A] ${migrationErrors.length} spots had migration errors:`, migrationErrors);
            }
          }
        }
        
        // V1.3: Migrar imágenes no-Unsplash a Unsplash (siempre, no solo en migración V1.2)
        // Esto asegura que cualquier spot con imagen no-Unsplash sea migrado
        try {
          const spotsBeforeImageMigration = [...loadedSpots];
          loadedSpots = migrateSpotsImagesToUnsplash(loadedSpots);
          
          // Solo guardar si hubo cambios
          const hasImageChanges = spotsBeforeImageMigration.some((spot, index) => {
            const migrated = loadedSpots[index];
            return spot.image?.url !== migrated.image?.url;
          });
          
          if (hasImageChanges) {
            await saveSpots(loadedSpots);
            if (__DEV__) {
              const migratedCount = loadedSpots.filter((spot, index) => 
                spotsBeforeImageMigration[index].image?.url !== spot.image?.url
              ).length;
              console.log(`[V1.3] Migradas ${migratedCount} imágenes a Unsplash`);
            }
          }
        } catch (migrationError) {
          // Si la migración falla, continuar con los spots originales
          if (__DEV__) {
            console.warn('[SpotContext] Error migrando imágenes a Unsplash:', migrationError);
          }
          // Continuar con loadedSpots sin cambios
        }
        
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
        
        // FASE 6A: Migración V1.2 - Migrar spots legacy al modelo V1.2 (UNA SOLA VEZ)
        const shouldMigrateToV1_2 = async (): Promise<boolean> => {
          try {
            const done = await AsyncStorage.getItem(V1_2_MIGRATION_KEY);
            return done !== 'true';
          } catch {
            return false;
          }
        };
        
        if (await shouldMigrateToV1_2()) {
          const migratedSpots: Spot[] = [];
          const migrationErrors: { spotId: string; error: string }[] = [];
          
          for (const spot of loadedSpots) {
            try {
              // Verificar si el spot necesita migración
              const needsMigration = 
                !isValidSpotV1_2(spot) ||
                ('latitude' in spot.location && 'longitude' in spot.location) ||
                (spot.photos && spot.photos.length > 0 && !spot.image?.url) ||
                (!spot.shortDescription && (spot.description || spot.whyItMatters)) ||
                (spot.hasGeneratedContent === undefined && spot.aiGenerated !== undefined);
              
              if (needsMigration && canMigrateSpot(spot)) {
                const migrated = migrateSpotToV1_2(spot);
                
                if (isValidSpotV1_2(migrated)) {
                  const migratedSpot: Spot = {
                    ...migrated,
                    photos: spot.photos,
                    description: spot.description,
                    whyItMatters: spot.whyItMatters,
                    culturalContext: spot.culturalContext,
                    planInfo: spot.planInfo,
                    hours: spot.hours,
                    cost: spot.cost,
                    restrictions: spot.restrictions,
                    accessibility: spot.accessibility,
                    aiGenerated: spot.aiGenerated,
                    isLegacySpot: spot.isLegacySpot,
                    createdBy: spot.createdBy,
                    locationRegion: spot.locationRegion,
                    locationLatitude: spot.locationLatitude,
                    locationLongitude: spot.locationLongitude,
                    createdAt: spot.createdAt,
                    updatedAt: new Date(),
                  };
                  migratedSpots.push(migratedSpot);
                } else {
                  migrationErrors.push({
                    spotId: spot.id,
                    error: 'Spot migrado no es válido según modelo V1.2',
                  });
                  migratedSpots.push(spot);
                }
              } else {
                migratedSpots.push(spot);
              }
            } catch (error: any) {
              migrationErrors.push({
                spotId: spot.id,
                error: `Error al migrar: ${error.message || String(error)}`,
              });
              migratedSpots.push(spot);
            }
          }
          
          loadedSpots = migratedSpots;
          await saveSpots(loadedSpots);
          await AsyncStorage.setItem(V1_2_MIGRATION_KEY, 'true');
          
          if (__DEV__) {
            const migratedCount = loadedSpots.length - migrationErrors.length;
            console.log(`[FASE 6A] Migrated ${migratedCount} spots to V1.2 model`);
            if (migrationErrors.length > 0) {
              console.warn(`[FASE 6A] ${migrationErrors.length} spots had migration errors:`, migrationErrors);
            }
          }
        }
        
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
        
        // Guardar los spots iniciales con owners, regiones, normalización, migración V1.2 y legacy flag asignados
        await saveSpots(loadedSpots);
      }
      
      // Inicializar cache marcando todos los Spots como 'available'
      initializeSpotCache(loadedSpots);
      setSpots(loadedSpots);
      
      // Ejecutar auditoría de spots en desarrollo (solo reportar, no corregir automáticamente)
      if (__DEV__) {
        try {
          const auditReport = await auditAllSpots();
          logAuditReport(auditReport);
        } catch (auditError) {
          console.error('[SpotAudit] Error durante auditoría:', auditError);
        }
      }
    } catch (error) {
      console.error('Error loading spots:', error);
      // Fallback a mock data con migraciones aplicadas
      // CANONICAL: Migrar owners legacy (UNA SOLA VEZ)
      let fallbackSpots = await migrateOwnersLegacy(mockSpots);
      
      // CANONICAL: Migrar spots para poblar locationRegion (idempotente)
      fallbackSpots = await migrateSpotsRegions(fallbackSpots);
      
      // SCOPE 6.2: Normalizar spots legacy al cargar
      fallbackSpots = normalizeAllSpots(fallbackSpots);
      
      // FASE 6A: Migración V1.2 - Migrar spots legacy al modelo V1.2 (UNA SOLA VEZ)
      const shouldMigrateToV1_2 = async (): Promise<boolean> => {
        try {
          const done = await AsyncStorage.getItem(V1_2_MIGRATION_KEY);
          return done !== 'true';
        } catch {
          return false;
        }
      };
      
      if (await shouldMigrateToV1_2()) {
        const migratedSpots: Spot[] = [];
        
        for (const spot of fallbackSpots) {
          try {
            const needsMigration = 
              !isValidSpotV1_2(spot) ||
              ('latitude' in spot.location && 'longitude' in spot.location) ||
              (spot.photos && spot.photos.length > 0 && !spot.image?.url) ||
              (!spot.shortDescription && (spot.description || spot.whyItMatters)) ||
              (spot.hasGeneratedContent === undefined && spot.aiGenerated !== undefined);
            
            if (needsMigration && canMigrateSpot(spot)) {
              const migrated = migrateSpotToV1_2(spot);
              
              if (isValidSpotV1_2(migrated)) {
                const migratedSpot: Spot = {
                  ...migrated,
                  photos: spot.photos,
                  description: spot.description,
                  whyItMatters: spot.whyItMatters,
                  culturalContext: spot.culturalContext,
                  planInfo: spot.planInfo,
                  hours: spot.hours,
                  cost: spot.cost,
                  restrictions: spot.restrictions,
                  accessibility: spot.accessibility,
                  aiGenerated: spot.aiGenerated,
                  isLegacySpot: spot.isLegacySpot,
                  createdBy: spot.createdBy,
                  locationRegion: spot.locationRegion,
                  locationLatitude: spot.locationLatitude,
                  locationLongitude: spot.locationLongitude,
                  createdAt: spot.createdAt,
                  updatedAt: new Date(),
                };
                migratedSpots.push(migratedSpot);
              } else {
                migratedSpots.push(spot);
              }
            } else {
              migratedSpots.push(spot);
            }
          } catch {
            migratedSpots.push(spot);
          }
        }
        
        fallbackSpots = migratedSpots;
        await saveSpots(fallbackSpots);
        await AsyncStorage.setItem(V1_2_MIGRATION_KEY, 'true');
        
        if (__DEV__) {
          console.log(`[FASE 6A] Migrated ${fallbackSpots.length} fallback spots to V1.2 model`);
        }
      }
      
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
    const tempSpot: Spot = {
      ...spotData,
      id: `temp-${Date.now()}`, // Temporal para migración
      createdAt: now,
      updatedAt: now,
    };
    
    // V1.3: Migrar imagen a Unsplash si no lo es
    const spotWithMigratedImage = migrateSpotImageToUnsplash(tempSpot);
    
    const newSpot: Spot = {
      ...spotData,
      image: spotWithMigratedImage.image, // Usar imagen migrada
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
          // V1.3: Si se actualiza la imagen, migrar a Unsplash si no lo es
          let finalUpdates = { ...updates };
          if (updates.image?.url) {
            const tempSpot = { ...spot, ...updates } as Spot;
            const migrated = migrateSpotImageToUnsplash(tempSpot);
            if (migrated.image.url !== updates.image.url) {
              finalUpdates.image = migrated.image;
            }
          }
          
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

          return { ...spot, ...finalUpdates, updatedAt: new Date() };
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

  /**
   * Generar contenido para un spot - FLOWYA V1.2 (Bajo demanda)
   * 
   * FASE 2: Solo se ejecuta cuando:
   * - hasGeneratedContent === false (o aiGenerated === undefined en modelo actual)
   * - Usuario explícitamente lo solicita (en Spot Detail)
   * 
   * NO se ejecuta automáticamente al crear o editar un Spot.
   * Solo genera shortDescription (texto evocativo de 1-2 líneas).
   */
  const generateSpotContent = async (spotId: string, options?: GenerateContentOptions): Promise<void> => {
    const spot = getSpotById(spotId);
    if (!spot) {
      throw new Error(`Spot with id ${spotId} not found`);
    }

    // FASE 2: Verificar que el spot no tenga contenido generado previamente
    // Usar aiGenerated como indicador en modelo actual (se migrará a hasGeneratedContent en fase 6)
    const hasGeneratedContent = spot.aiGenerated !== undefined && spot.aiGenerated !== null;
    
    if (hasGeneratedContent && !options?.forceRegenerate) {
      console.log('[AI V1.2] Spot already has generated content, skipping generation. Use forceRegenerate to override.');
      throw new Error('Spot already has generated content. Use forceRegenerate option to override.');
    }

    // FASE 2: Verificar si ya tiene shortDescription (o description/whyItMatters) sin forceRegenerate
    const hasDescription = spot.shortDescription || spot.description || spot.whyItMatters;
    if (hasDescription && hasDescription.trim().length > 0 && !options?.forceRegenerate) {
      console.log('[AI V1.2] Spot already has description, skipping generation. Use forceRegenerate to override.');
      throw new Error('Spot already has description. Use forceRegenerate option to override.');
    }

    try {
      console.log('[AI V1.2] Generating content on demand for spot:', { spotId, spotName: spot.name });
      const generatedContent = await generateAIContent(spot, options);
      
      // FASE 2: Actualizar spot SOLO con shortDescription generado
      // Mantener campos legacy para compatibilidad temporal durante migración
      updateSpot(spotId, {
        // Nuevo campo (para spots que ya migraron)
        shortDescription: generatedContent.shortDescription || spot.shortDescription,
        // Campos legacy para compatibilidad temporal (se eliminarán en fase 4)
        description: generatedContent.spotDescription || generatedContent.shortDescription || spot.description,
        whyItMatters: generatedContent.whyItMatters || generatedContent.shortDescription || spot.whyItMatters,
        // Metadatos de generación (marcar que tiene contenido generado)
        aiGenerated: generatedContent.aiGenerated || {
          generatedAt: new Date(),
          model: 'gpt-4',
          source: 'ai',
        },
      });
      
      console.log('[AI V1.2] Content generated and saved successfully:', {
        spotId,
        shortDescriptionLength: generatedContent.shortDescription?.length || 0,
      });
    } catch (error) {
      console.error('[AI V1.2] Error generating spot content:', error);
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

