/**
 * SpotContext - Gestión de estado de Spots
 * Scope 3.1: Estado de Spots y funciones de gestión
 * 
 * Funciones:
 * - createSpot (deshabilitado en V2.0: usar SpotContribution + applier)
 * - obtenerSpots
 * - Manejo de Spots incompletos (por diseño, los spots pueden ser incompletos)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { migrateSpotsRegions } from '@/core/region';
import { Spot } from '@/data/spots';
import { migrateSpotsImagesToUnsplash } from '@/utils/imageMigration';
import { migrateOwnersLegacy } from '@/utils/ownerMigration';
import { canMigrateSpot, isValidSpotV1_2, migrateSpotToV1_2 } from '@/utils/spotMigration';
import { normalizeAllSpots } from '@/utils/spotNormalizer';
import { auditAllSpots, logAuditReport, fixSpots as fixAllSpots } from '@/utils/spotAudit';
import { normalizeSpotId } from '@/utils/normalizeSpotId';
import { getStorageBucketName } from '@/utils/storageUpload';
import { supabase } from '@/utils/supabase';

const STORAGE_KEY = '@flowya_spots';
const REGION_REMIGRATION_KEY = '@flowya_region_remigration_done_v2';
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
  createSpot: (spot: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>, options?: { id?: string }) => Spot;
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
    const normalizedSpotId = normalizeSpotId(spotId);
    return spotCacheRef.current.get(normalizedSpotId) || 'not_seen';
  }, []);

  const markSpotAsSeen = React.useCallback((spotId: string) => {
    const normalizedSpotId = normalizeSpotId(spotId);
    const currentState = spotCacheRef.current.get(normalizedSpotId);
    // Si ya está como 'available', mantener 'available'
    // Si está como 'not_seen' o no existe, cambiar a 'seen'
    if (currentState !== 'available') {
      spotCacheRef.current.set(normalizedSpotId, 'seen');
    }
  }, []);

  const markSpotAsAvailable = React.useCallback((spotId: string) => {
    const normalizedSpotId = normalizeSpotId(spotId);
    spotCacheRef.current.set(normalizedSpotId, 'available');
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

  const parseSpotDate = (value: any): Date => {
    if (!value) return new Date();
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const mapSupabaseSpotToModel = (row: Record<string, any>): Spot | null => {
    const rawId = typeof row.id === 'string' ? row.id : '';
    const id = normalizeSpotId(rawId);
    if (!id) return null;

    const locationPayload = row.location && typeof row.location === 'object' ? row.location : null;
    const latCandidate =
      row.location_lat ??
      row.locationLatitude ??
      locationPayload?.lat ??
      locationPayload?.latitude;
    const lngCandidate =
      row.location_lng ??
      row.locationLongitude ??
      locationPayload?.lng ??
      locationPayload?.longitude;

    const lat = typeof latCandidate === 'number' ? latCandidate : Number(latCandidate);
    const lng = typeof lngCandidate === 'number' ? lngCandidate : Number(lngCandidate);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      if (__DEV__) {
        console.warn(`[SpotContext] Spot sin coordenadas válidas: ${id}`);
      }
      return null;
    }

    const locationCity =
      locationPayload?.city ??
      row.location_city ??
      row.city ??
      undefined;
    const locationCountry =
      locationPayload?.country ??
      row.location_country ??
      row.country ??
      undefined;

    const imagePayload = row.image && typeof row.image === 'object' ? row.image : null;
    const imageUrl = typeof imagePayload?.url === 'string' ? imagePayload.url : '';
    const rawType = typeof row.type === 'string' ? row.type : 'other';
    const allowedTypes = new Set([
      'beach',
      'cafe',
      'viewpoint',
      'museum',
      'restaurant',
      'park',
      'monument',
      'market',
      'other',
    ]);
    const normalizedType = allowedTypes.has(rawType) ? rawType : 'other';

    const shortDescription =
      typeof row.short_description === 'string'
        ? row.short_description
        : typeof row.shortDescription === 'string'
          ? row.shortDescription
          : undefined;

    const hasGeneratedContent = Boolean(
      row.has_generated_content ?? row.hasGeneratedContent ?? false
    );

    const createdAt = parseSpotDate(row.created_at ?? row.createdAt);
    const updatedAt = parseSpotDate(row.updated_at ?? row.updatedAt);

    return {
      id,
      name: typeof row.name === 'string' ? row.name : '',
      type: normalizedType as Spot['type'],
      location: {
        lat,
        lng,
        city: typeof locationCity === 'string' ? locationCity : undefined,
        country: typeof locationCountry === 'string' ? locationCountry : undefined,
      },
      shortDescription,
      image: {
        url: imageUrl,
        source: typeof imagePayload?.source === 'string' ? imagePayload.source : undefined,
        license: typeof imagePayload?.license === 'string' ? imagePayload.license : undefined,
      },
      hasGeneratedContent,
      createdBy: typeof row.created_by === 'string' ? row.created_by : undefined,
      createdAt,
      updatedAt,
    };
  };

  const fetchSupabaseSpots = React.useCallback(async (): Promise<Spot[] | null> => {
    if (!supabase) return null;

    const { data, error } = await supabase.from('spots').select('*');
    if (error) {
      console.error('[SpotContext] Error fetching spots from Supabase:', error.message);
      return null;
    }
    const rows = data || [];

    let mapped = rows
      .map((row) => mapSupabaseSpotToModel(row))
      .filter((spot): spot is Spot => Boolean(spot));

    const missingImageSpotIds = mapped
      .filter((spot) => !spot.image?.url)
      .map((spot) => spot.id);

    if (missingImageSpotIds.length > 0) {
      const { data: mediaRows, error: mediaError } = await supabase.rpc('get_spot_media_for_spot_ids', {
        spot_ids: missingImageSpotIds,
      });
      const mediaRowsArray = Array.isArray(mediaRows) ? mediaRows : [];
      if (mediaRowsArray.length === 0 && !mediaError) {
        const { data: appliedRows } = await supabase.from('spot_contributions').select('id,spot_id,payload').eq('status', 'applied').limit(150);
        const withImage = (appliedRows || []).filter((r: { payload?: { image?: { url?: string } } }) => {
          const u = r?.payload?.image?.url;
          return typeof u === 'string' && u.trim().length > 0;
        });
        if (withImage.length > 0) {
          await supabase.rpc('backfill_spot_media_from_applied');
          const { data: refetchRpc } = await supabase.rpc('get_spot_media_for_spot_ids', { spot_ids: missingImageSpotIds });
          const refetchRows = Array.isArray(refetchRpc) ? refetchRpc : [];
          if (refetchRows && refetchRows.length > 0) {
            const bucket = getStorageBucketName();
            const mediaBySpot = new Map<string, { url: string; created_at?: string }>();
            for (const row of refetchRows) {
              if (!row?.spot_id || !row?.storage_path) continue;
              const storagePath = String(row.storage_path);
              const normalizedPath = storagePath.startsWith(`${bucket}/`)
                ? storagePath.slice(bucket.length + 1)
                : storagePath;
              const { data } = supabase.storage.from(bucket).getPublicUrl(normalizedPath);
              if (!data?.publicUrl) continue;
              const existing = mediaBySpot.get(row.spot_id);
              if (!existing || (row.created_at && existing.created_at && row.created_at > existing.created_at)) {
                mediaBySpot.set(row.spot_id, { url: data.publicUrl, created_at: row.created_at });
              } else if (!existing) {
                mediaBySpot.set(row.spot_id, { url: data.publicUrl, created_at: row.created_at });
              }
            }
            mapped = mapped.map((spot) => {
              if (spot.image?.url) return spot;
              const media = mediaBySpot.get(spot.id);
              if (!media?.url) return spot;
              return { ...spot, image: { ...spot.image, url: media.url } };
            });
          }
        }
      }

      if (!mediaError && mediaRowsArray.length > 0) {
        const bucket = getStorageBucketName();
        const mediaBySpot = new Map<string, { url: string; created_at?: string }>();
        for (const row of mediaRowsArray) {
          if (!row?.spot_id || !row?.storage_path) continue;
          const storagePath = String(row.storage_path);
          const normalizedPath = storagePath.startsWith(`${bucket}/`)
            ? storagePath.slice(bucket.length + 1)
            : storagePath;
          const { data } = supabase.storage.from(bucket).getPublicUrl(normalizedPath);
          if (!data?.publicUrl) continue;
          const existing = mediaBySpot.get(row.spot_id);
          if (!existing || (row.created_at && existing.created_at && row.created_at > existing.created_at)) {
            mediaBySpot.set(row.spot_id, { url: data.publicUrl, created_at: row.created_at });
          } else if (!existing) {
            mediaBySpot.set(row.spot_id, { url: data.publicUrl, created_at: row.created_at });
          }
        }
        mapped = mapped.map((spot) => {
          if (spot.image?.url) return spot;
          const media = mediaBySpot.get(spot.id);
          if (!media?.url) return spot;
          return {
            ...spot,
            image: {
              ...spot.image,
              url: media.url,
            },
          };
        });
      }
    }

    return normalizeAllSpots(mapped);
  }, []);

  // Función para cargar spots (debe estar definida antes de los useEffect)
  const loadSpots = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const supabaseSpots = await fetchSupabaseSpots();
      if (supabaseSpots) {
        const shouldForceRemigration = await shouldForceRegionRemigration();
        const migratedSpots = await migrateSpotsRegions(supabaseSpots, shouldForceRemigration);
        initializeSpotCache(migratedSpots);
        setSpots(migratedSpots);
        await saveSpots(migratedSpots);
        return;
      }

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
        // V2.0: No seed/stock en runtime; iniciar vacío si no hay storage.
        loadedSpots = [];
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
      initializeSpotCache([]);
      setSpots([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSupabaseSpots, initializeSpotCache, saveSpots, shouldForceRegionRemigration]);

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
    const normalizedSpotId = normalizeSpotId(id);
    return spots.find((spot) => spot.id === normalizedSpotId);
  };

  const getSpotsByType = (type: Spot['type']): Spot[] => {
    return spots.filter((spot) => spot.type === type);
  };

  const createSpot = (spotData: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'>, options?: { id?: string }): Spot => {
    throw new Error('createSpot deshabilitado en V2.0: usar SpotContribution + applier.');
  };

  const value: SpotContextType = {
    spots,
    isLoading,
    getSpotById,
    getSpotsByType,
    createSpot,
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

