/**
 * Sistema de Afinidad - SavedContext
 * Scope 1.3: Sistema de afinidad expandido
 * 
 * Incluye:
 * - 👍 (like) - Spots que me gustaron
 * - Not my vibe (nuevo) - Spots que no son de mi interés
 * - Spots guardados
 * - Paths guardados
 * - Historial ligero (timeline)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { useSpot } from './SpotContext';
import { useWorldSpots } from './WorldSpotContext';
import { useAuth } from './AuthContext';
import * as pinsService from '@/utils/pinsService';

const STORAGE_KEY = '@flowya_saved';

export type AffinityAction = 'like' | 'not_my_vibe' | 'saved';

export interface TimelineEntry {
  id: string;
  type: 'spot' | 'path';
  action: AffinityAction;
  itemId: string; // Spot ID o Path ID
  timestamp: Date;
}

// SCOPE 5: Tracking de afinidad por tipo de spot para aprendizaje
export interface SpotTypeAffinity {
  spotType: string;
  score: number; // Score de afinidad (positivo para like, negativo para dislike)
  count: number; // Cantidad de interacciones
}

// V1.2: Sistema de Pins - Estados y Datos
export type PinState = 'to_visit' | 'visited';

export interface PinData {
  spotId: string;
  state: PinState;
  pinnedAt: Date;
  visitedAt?: Date;
  notes?: string;
  personalPhotos?: string[];
}

interface SavedData {
  // V1.2: Sistema de Pins (NUEVO)
  pins: Record<string, PinData>; // spotId -> PinData
  _migrationV1_2Completed?: boolean; // Flag de migración completada
  
  // TEMPORAL (mantener para migración y compatibilidad)
  likedSpots: string[]; // Spot IDs
  likedSpotsFromPlayer: string[]; // Spot IDs - likes hechos desde el player durante navegación
  savedSpots: string[]; // Spot IDs
  
  // MANTENER
  notMyVibeSpots: string[]; // Spot IDs
  savedFlows: string[]; // Flow IDs (anteriormente savedPaths)
  savedFlowNames: Record<string, string>; // Map de flowId a nombre personalizado
  timeline: TimelineEntry[];
  spotTypeAffinity: Record<string, SpotTypeAffinity>; // SCOPE 5: Afinidad por tipo de spot (tipo -> { score, count })
  // Aliases para compatibilidad temporal
  savedPaths: string[];
}

interface SavedContextType {
  // V1.2: Sistema de Pins (NUEVO)
  pins: Record<string, PinData>;
  pinSpot: (spotId: string, state: PinState) => string; // Retorna el ID del User Spot (puede ser el mismo o convertido)
  unpinSpot: (spotId: string) => void;
  changePinState: (spotId: string, newState: PinState) => void;
  isSpotPinned: (spotId: string) => boolean;
  getPinState: (spotId: string) => PinState | null;
  getPinnedSpots: (state?: PinState) => string[];
  // V1.2: Funciones de Diario de Viaje
  updatePinNotes: (spotId: string, notes: string) => void;
  addPinPhoto: (spotId: string, photoUrl: string) => void;
  removePinPhoto: (spotId: string, photoUrl: string) => void;
  // TEMPORAL (mantener para compatibilidad)
  likedSpots: string[];
  likedSpotsFromPlayer: string[]; // Likes hechos desde el player durante navegación
  notMyVibeSpots: string[];
  savedSpots: string[];
  // Flows (anteriormente Paths)
  savedFlows: string[];
  savedFlowNames: Record<string, string>; // Map de flowId a nombre personalizado
  // Aliases para compatibilidad temporal
  savedPaths: string[];
  // Timeline
  timeline: TimelineEntry[];
  // Actions
  toggleLikeSpot: (spotId: string) => void;
  toggleLikeSpotFromPlayer: (spotId: string, spotType?: string) => void; // Like desde el player (SCOPE 5: con tipo opcional para aprendizaje)
  toggleNotMyVibeSpot: (spotId: string, spotType?: string) => void; // SCOPE 5: con tipo opcional para aprendizaje
  getSpotTypeAffinity: (spotType: string) => SpotTypeAffinity | undefined; // SCOPE 5: Obtener afinidad por tipo
  toggleSaveSpot: (spotId: string) => void;
  toggleSaveFlow: (flowId: string, customName?: string) => void; // Legacy - use saveFlow instead
  saveFlow: (flowId: string, customName: string) => void; // CANONICAL: Create if draft, Update if saved
  getFlowCustomName: (flowId: string) => string | undefined;
  // Aliases para compatibilidad temporal
  toggleSavePath: (pathId: string) => void;
  isSpotLiked: (spotId: string) => boolean;
  isSpotLikedFromPlayer: (spotId: string) => boolean; // Verificar si está liked desde player
  isSpotNotMyVibe: (spotId: string) => boolean;
  isSpotSaved: (spotId: string) => boolean;
  isFlowSaved: (flowId: string) => boolean;
  // Aliases para compatibilidad temporal
  isPathSaved: (pathId: string) => boolean;
  // Loading
  isLoading: boolean;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

const defaultData: SavedData = {
  pins: {}, // V1.2: Sistema de Pins
  _migrationV1_2Completed: false,
  likedSpots: [],
  likedSpotsFromPlayer: [],
  notMyVibeSpots: [],
  savedSpots: [],
  savedFlows: [],
  savedFlowNames: {},
  timeline: [],
  spotTypeAffinity: {}, // SCOPE 5: Inicializar afinidad vacía
  // Aliases para compatibilidad
  savedPaths: [],
};

export function SavedProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SavedData>(defaultData);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const { getWorldSpotById, convertWorldSpotToUserSpot } = useWorldSpots();
  const { createSpot, getSpotById, spots } = useSpot();
  
  // V1.3: Flags de control de sincronización
  const isSyncingRef = useRef(false);
  const migrationCompletedRef = useRef(false);
  const lastSyncRef = useRef<Date | null>(null);

  // V1.3: Cargar datos (local + Supabase si autenticado)
  useEffect(() => {
    loadData();
  }, []);

  // V1.3: Cargar pins desde Supabase cuando usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user?.id && !isLoading) {
      loadPinsFromSupabase();
    }
  }, [isAuthenticated, user?.id, isLoading]);

  // V1.3: Guardar datos en AsyncStorage cuando cambien (cache local)
  useEffect(() => {
    if (!isLoading) {
      saveDataToLocal(data);
    }
  }, [data, isLoading]);

  // V1.2: Limpiar pines cuando el usuario cierra sesión
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      // Usuario cerró sesión, limpiar todos los pines
      setData((prev) => ({
        ...prev,
        pins: {},
      }));
      // V1.3: Limpiar flags de migración
      migrationCompletedRef.current = false;
      lastSyncRef.current = null;
    }
  }, [isAuthenticated, isLoading]);

  // V1.3: Cargar datos desde AsyncStorage (cache local)
  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        let parsed: any = JSON.parse(stored);
        // Convertir timestamps a Date objects
        parsed.timeline = (parsed.timeline || []).map((entry: TimelineEntry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
        
        // V1.2: Convertir pins dates a Date objects
        if (parsed.pins) {
          parsed.pins = Object.entries(parsed.pins).reduce((acc, [spotId, pin]: [string, any]) => {
            acc[spotId] = {
              ...pin,
              pinnedAt: new Date(pin.pinnedAt),
              visitedAt: pin.visitedAt ? new Date(pin.visitedAt) : undefined,
            };
            return acc;
          }, {} as Record<string, PinData>);
        } else {
          parsed.pins = {};
        }
        
        // V1.2: Inicializar flag de migración si no existe
        if (parsed._migrationV1_2Completed === undefined) {
          parsed._migrationV1_2Completed = false;
        }
        
        // Migración V1.2: Migrar savedSpots y likedSpots a pins
        if (!parsed._migrationV1_2Completed) {
          parsed = migrateToPins(parsed);
        }
        
        // Migración: si tiene savedPaths pero no savedFlows, copiar
        if (parsed.savedPaths && !parsed.savedFlows) {
          parsed.savedFlows = parsed.savedPaths;
        }
        // Inicializar savedFlowNames si no existe
        if (!parsed.savedFlowNames) {
          parsed.savedFlowNames = {};
        }
        // Asegurar que los aliases estén sincronizados
        if (parsed.savedFlows) {
          parsed.savedPaths = parsed.savedFlows;
        }
        // Remover campos legacy de visited
        if (parsed.visitedFlows) {
          delete parsed.visitedFlows;
        }
        if (parsed.visitedPaths) {
          delete parsed.visitedPaths;
        }
        setData(parsed);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // V1.3: Cargar pins desde Supabase
  const loadPinsFromSupabase = useCallback(async () => {
    if (!user?.id || isSyncingRef.current) {
      return;
    }

    try {
      isSyncingRef.current = true;
      
      // 1. Verificar si ya se migró a Supabase
      const migrationFlag = await AsyncStorage.getItem('@flowya_migration_v1_3_completed');
      const shouldMigrate = !migrationFlag && Object.keys(data.pins).length > 0;

      if (shouldMigrate) {
        // Migrar pins locales a Supabase
        console.log('[V1.3 Migration] Migrating pins to Supabase...');
        const result = await pinsService.migratePinsToSupabase(data.pins, user.id);
        if (result.success) {
          await AsyncStorage.setItem('@flowya_migration_v1_3_completed', 'true');
          console.log(`[V1.3 Migration] Migrated ${result.migrated} pins successfully`);
        } else {
          console.error(`[V1.3 Migration] Migration failed: ${result.errors} errors`);
        }
      }

      // 2. Cargar pins desde Supabase (source of truth)
      const supabasePins = await pinsService.fetchUserPins(user.id);
      
      // 3. Actualizar estado local con pins de Supabase
      setData((prev) => ({
        ...prev,
        pins: supabasePins,
      }));

      // 4. Actualizar cache local
      await saveDataToLocal({
        ...data,
        pins: supabasePins,
      });

      lastSyncRef.current = new Date();
      migrationCompletedRef.current = true;
    } catch (error) {
      console.error('Error loading pins from Supabase:', error);
      // En caso de error, mantener pins locales (offline-first)
    } finally {
      isSyncingRef.current = false;
    }
  }, [user?.id, data.pins]);

  // V1.3: Sincronizar pin individual con Supabase
  const syncPinToSupabase = useCallback(async (pin: PinData) => {
    if (!user?.id || !isAuthenticated) {
      return; // No sincronizar si no hay usuario autenticado
    }

    try {
      await pinsService.upsertPin(pin, user.id);
    } catch (error) {
      console.error('Error syncing pin to Supabase:', error);
      // Error no crítico: cache local ya está actualizado
    }
  }, [user?.id, isAuthenticated]);

  // V1.3: Eliminar pin de Supabase
  const deletePinFromSupabase = useCallback(async (spotId: string) => {
    if (!user?.id || !isAuthenticated) {
      return;
    }

    try {
      await pinsService.deletePin(spotId, user.id);
    } catch (error) {
      console.error('Error deleting pin from Supabase:', error);
    }
  }, [user?.id, isAuthenticated]);

  // V1.3: Guardar datos en AsyncStorage (cache local)
  const saveDataToLocal = async (dataToSave: SavedData) => {
    try {
      // V1.2: Serializar fechas de pins a ISO strings
      const dataToSerialize = {
        ...dataToSave,
        pins: Object.entries(dataToSave.pins).reduce((acc, [spotId, pin]) => {
          acc[spotId] = {
            ...pin,
            pinnedAt: pin.pinnedAt.toISOString(),
            visitedAt: pin.visitedAt ? pin.visitedAt.toISOString() : undefined,
          };
          return acc;
        }, {} as Record<string, any>),
        timeline: dataToSave.timeline.map((entry) => ({
          ...entry,
          timestamp: entry.timestamp.toISOString(),
        })),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSerialize));
    } catch (error) {
      console.error('Error saving data to local storage:', error);
    }
  };

  // V1.2: Script de migración savedSpots/likedSpots → pins
  const migrateToPins = (data: any): SavedData => {
    const migratedData: SavedData = {
      ...data,
      pins: { ...(data.pins || {}) },
    };

    // Migrar savedSpots → pins (estado to_visit)
    if (data.savedSpots && Array.isArray(data.savedSpots)) {
      data.savedSpots.forEach((spotId: string) => {
        if (!migratedData.pins[spotId]) {
          migratedData.pins[spotId] = {
            spotId,
            state: 'to_visit',
            pinnedAt: new Date(),
            visitedAt: undefined,
            notes: undefined,
            personalPhotos: undefined,
          };
        }
      });
    }

    // Migrar likedSpots → pins (estado to_visit, solo si no existe ya)
    if (data.likedSpots && Array.isArray(data.likedSpots)) {
      data.likedSpots.forEach((spotId: string) => {
        if (!migratedData.pins[spotId]) {
          migratedData.pins[spotId] = {
            spotId,
            state: 'to_visit',
            pinnedAt: new Date(),
            visitedAt: undefined,
            notes: undefined,
            personalPhotos: undefined,
          };
        }
      });
    }

    // Migrar likedSpotsFromPlayer → pins (estado to_visit, solo si no existe ya)
    if (data.likedSpotsFromPlayer && Array.isArray(data.likedSpotsFromPlayer)) {
      data.likedSpotsFromPlayer.forEach((spotId: string) => {
        if (!migratedData.pins[spotId]) {
          migratedData.pins[spotId] = {
            spotId,
            state: 'to_visit',
            pinnedAt: new Date(),
            visitedAt: undefined,
            notes: undefined,
            personalPhotos: undefined,
          };
        }
      });
    }

    // Marcar migración como completada
    migratedData._migrationV1_2Completed = true;

    console.log('[V1.2 Migration] Migrated spots to pins:', {
      savedSpots: data.savedSpots?.length || 0,
      likedSpots: data.likedSpots?.length || 0,
      likedSpotsFromPlayer: data.likedSpotsFromPlayer?.length || 0,
      totalPins: Object.keys(migratedData.pins).length,
    });

    return migratedData;
  };

  const addToTimeline = (
    type: 'spot' | 'path',
    action: AffinityAction,
    itemId: string
  ) => {
    const entry: TimelineEntry = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      action,
      itemId,
      timestamp: new Date(),
    };

    setData((prev) => ({
      ...prev,
      timeline: [entry, ...prev.timeline].slice(0, 100), // Mantener último 100
    }));
  };

  const toggleLikeSpot = (spotId: string) => {
    setData((prev) => {
      const isLiked = prev.likedSpots.includes(spotId);
      const newLikedSpots = isLiked
        ? prev.likedSpots.filter((id) => id !== spotId)
        : [...prev.likedSpots, spotId];

      // Si se quita el like, también quitar de notMyVibe si está
      const newNotMyVibeSpots = isLiked
        ? prev.notMyVibeSpots
        : prev.notMyVibeSpots.filter((id) => id !== spotId);

      addToTimeline('spot', isLiked ? 'like' : 'like', spotId);

      return {
        ...prev,
        likedSpots: newLikedSpots,
        notMyVibeSpots: newNotMyVibeSpots,
      };
    });
  };

  // SCOPE 5: Helper para actualizar afinidad por tipo de spot
  const updateSpotTypeAffinity = (
    spotType: string,
    increment: number,
    prev: SavedData
  ): Record<string, SpotTypeAffinity> => {
    const current = prev.spotTypeAffinity[spotType] || { spotType, score: 0, count: 0 };
    return {
      ...prev.spotTypeAffinity,
      [spotType]: {
        spotType,
        score: Math.max(-10, Math.min(10, current.score + increment)), // Limitar score entre -10 y 10
        count: current.count + 1,
      },
    };
  };

  const toggleLikeSpotFromPlayer = (spotId: string, spotType?: string) => {
    setData((prev) => {
      const isLiked = prev.likedSpotsFromPlayer.includes(spotId);
      const newLikedSpotsFromPlayer = isLiked
        ? prev.likedSpotsFromPlayer.filter((id) => id !== spotId)
        : [...prev.likedSpotsFromPlayer, spotId];

      // También agregar/quitar del timeline
      addToTimeline('spot', 'like', spotId);

      // SCOPE 5: Actualizar afinidad por tipo de spot (aumentar si like, disminuir si unlike)
      const newSpotTypeAffinity = spotType
        ? updateSpotTypeAffinity(spotType, isLiked ? -2 : 2, prev)
        : prev.spotTypeAffinity;

      return {
        ...prev,
        likedSpotsFromPlayer: newLikedSpotsFromPlayer,
        spotTypeAffinity: newSpotTypeAffinity,
      };
    });
  };

  const toggleNotMyVibeSpot = (spotId: string, spotType?: string) => {
    setData((prev) => {
      const isNotMyVibe = prev.notMyVibeSpots.includes(spotId);
      const newNotMyVibeSpots = isNotMyVibe
        ? prev.notMyVibeSpots.filter((id) => id !== spotId)
        : [...prev.notMyVibeSpots, spotId];

      // Si se marca como not my vibe, quitar de likes si está
      const newLikedSpots = isNotMyVibe
        ? prev.likedSpots
        : prev.likedSpots.filter((id) => id !== spotId);

      addToTimeline('spot', 'not_my_vibe', spotId);

      // SCOPE 5: Actualizar afinidad por tipo de spot (disminuir si dislike, aumentar ligeramente si unlike)
      const newSpotTypeAffinity = spotType
        ? updateSpotTypeAffinity(spotType, isNotMyVibe ? 1 : -1, prev) // Penalizar menos que like para evitar castigo absoluto
        : prev.spotTypeAffinity;

      return {
        ...prev,
        notMyVibeSpots: newNotMyVibeSpots,
        likedSpots: newLikedSpots,
        spotTypeAffinity: newSpotTypeAffinity,
      };
    });
  };

  const toggleSaveSpot = (spotId: string) => {
    // FASE 7: Convertir WorldSpot a UserSpot si es necesario
    const actualSpotId = ensureUserSpot(spotId);
    setData((prev) => {
      const isSaved = prev.savedSpots.includes(actualSpotId);
      const newSavedSpots = isSaved
        ? prev.savedSpots.filter((id) => id !== actualSpotId)
        : [...prev.savedSpots, actualSpotId];

      addToTimeline('spot', 'saved', actualSpotId);

      return {
        ...prev,
        savedSpots: newSavedSpots,
      };
    });
  };

  /**
   * Legacy toggleSaveFlow - toggles save state
   * @deprecated Use saveFlow() instead for canonical create/update behavior
   */
  const toggleSaveFlow = (flowId: string, customName?: string) => {
    setData((prev) => {
      const isSaved = prev.savedFlows.includes(flowId);
      const newSavedFlows = isSaved
        ? prev.savedFlows.filter((id) => id !== flowId)
        : [...prev.savedFlows, flowId];

      // Si se proporciona un nombre personalizado, guardarlo
      const newSavedFlowNames = { ...prev.savedFlowNames };
      if (customName && !isSaved) {
        // Solo guardar nombre si se está guardando (no al desguardar)
        newSavedFlowNames[flowId] = customName;
      } else if (isSaved) {
        // Al desguardar, eliminar el nombre personalizado
        delete newSavedFlowNames[flowId];
      }

      addToTimeline('path', 'saved', flowId);

      return {
        ...prev,
        savedFlows: newSavedFlows,
        savedFlowNames: newSavedFlowNames,
        savedPaths: newSavedFlows, // Sincronizar con alias
      };
    });
  };

  /**
   * CANONICAL saveFlow - Create if draft, Update if saved
   * Follows standard content-entity model:
   * - Save means: Create if draft, Update if already saved
   * - Save must never create duplicates
   * - Save must never delete or replace an existing Flow
   * - Saving with the same name is a normal update, not a conflict
   */
  const saveFlow = (flowId: string, customName: string) => {
    setData((prev) => {
      const isSaved = prev.savedFlows.includes(flowId);
      
      // Create if draft (not saved), Update if already saved
      const newSavedFlows = isSaved
        ? prev.savedFlows // Already saved, keep it (update, not toggle)
        : [...prev.savedFlows, flowId]; // Not saved, add it (create)

      // Always update the custom name (create or update)
      const newSavedFlowNames = { ...prev.savedFlowNames };
      newSavedFlowNames[flowId] = customName;

      // Add to timeline only if creating (not updating)
      if (!isSaved) {
        addToTimeline('path', 'saved', flowId);
      }

      return {
        ...prev,
        savedFlows: newSavedFlows,
        savedFlowNames: newSavedFlowNames,
        savedPaths: newSavedFlows, // Sincronizar con alias
      };
    });
  };

  const getFlowCustomName = (flowId: string): string | undefined => {
    return data.savedFlowNames[flowId];
  };

  // Aliases para compatibilidad temporal
  const toggleSavePath = toggleSaveFlow;

  const isSpotLiked = (spotId: string) => data.likedSpots.includes(spotId);
  const isSpotLikedFromPlayer = (spotId: string) => data.likedSpotsFromPlayer.includes(spotId);
  const isSpotNotMyVibe = (spotId: string) => data.notMyVibeSpots.includes(spotId);
  const isSpotSaved = (spotId: string) => data.savedSpots.includes(spotId);
  const isFlowSaved = (flowId: string) => data.savedFlows.includes(flowId);
  // Aliases para compatibilidad
  const isPathSaved = isFlowSaved;

  // SCOPE 5: Obtener afinidad por tipo de spot
  const getSpotTypeAffinity = (spotType: string): SpotTypeAffinity | undefined => {
    return data.spotTypeAffinity[spotType];
  };

  // V1.2: Funciones de Pin
  // FASE 7: Helper para convertir WorldSpot a UserSpot si es necesario
  // REGLA PRINCIPAL V1.2: Convierte WorldSpot a UserSpot al primer cambio de estatus
  const ensureUserSpot = (spotId: string): string => {
    // Validar que el usuario esté autenticado
    if (!user?.id) {
      throw new Error('User must be authenticated to convert WorldSpot to UserSpot');
    }

    // Verificar si es un WorldSpot
    const worldSpot = getWorldSpotById(spotId);
    if (worldSpot) {
      // V1.2: ID estable para buscar si ya existe un UserSpot convertido
      const expectedUserSpotId = `user-${user.id}-${spotId}`;
      
      // Verificar si ya existe un UserSpot convertido para este WorldSpot
      const existingUserSpot = getSpotById(expectedUserSpotId);
      if (existingUserSpot) {
        // Ya existe, retornar el ID existente (evitar duplicados)
        return existingUserSpot.id;
      }

      // No existe, convertir WorldSpot a UserSpot
      const userSpot = convertWorldSpotToUserSpot(spotId, user.id);
      // Crear el spot en SpotContext (se persiste automáticamente)
      createSpot(userSpot);
      // Retornar el nuevo ID del UserSpot
      return userSpot.id;
    }
    // Si no es WorldSpot, retornar el ID original
    return spotId;
  };

  const pinSpot = (spotId: string, state: PinState): string => {
    // FASE 7: Convertir WorldSpot a UserSpot si es necesario
    // Esto crea el User Spot y retorna su ID
    const actualSpotId = ensureUserSpot(spotId);
    
    let newPinData: PinData | null = null;
    
    setData((prev) => {
      const now = new Date();
      
      // FASE 7: Transferir estado del pin al User Spot
      // Si había un pin con el ID del World Spot, migrarlo al User Spot
      const existingPin = prev.pins[spotId];
      const existingUserSpotPin = prev.pins[actualSpotId];
      
      // Si ya existe un pin para el User Spot, actualizarlo
      // Si existe un pin para el World Spot, migrarlo al User Spot
      const pinData: PinData = existingUserSpotPin || existingPin ? {
        spotId: actualSpotId,
        state,
        pinnedAt: existingPin?.pinnedAt || existingUserSpotPin?.pinnedAt || now,
        visitedAt: state === 'visited' 
          ? (existingPin?.visitedAt || existingUserSpotPin?.visitedAt || now)
          : (existingPin?.visitedAt || existingUserSpotPin?.visitedAt),
        notes: existingPin?.notes || existingUserSpotPin?.notes,
        personalPhotos: existingPin?.personalPhotos || existingUserSpotPin?.personalPhotos,
      } : {
        spotId: actualSpotId,
        state,
        pinnedAt: now,
        visitedAt: state === 'visited' ? now : undefined,
        notes: undefined,
        personalPhotos: undefined,
      };

      newPinData = pinData;

      // Remover pin del World Spot si existe (migración)
      const { [spotId]: removedWorldSpotPin, ...remainingPins } = prev.pins;

      return {
        ...prev,
        pins: {
          ...remainingPins,
          [actualSpotId]: pinData,
        },
      };
    });
    
    // V1.3: Sincronizar con Supabase en background (no bloqueante)
    if (newPinData && isAuthenticated) {
      syncPinToSupabase(newPinData).catch((error) => {
        console.error('Error syncing pin to Supabase:', error);
      });
    }
    
    // FASE 7: Retornar el ID del User Spot para redirección
    return actualSpotId;
  };

  const unpinSpot = (spotId: string) => {
    // FASE 7: Usar el ID correcto (puede ser WorldSpot o UserSpot)
    const worldSpot = getWorldSpotById(spotId);
    let actualSpotId = spotId;
    
    if (worldSpot && user?.id) {
      // V1.2: Buscar UserSpot convertido usando ID estable
      const expectedUserSpotId = `user-${user.id}-${spotId}`;
      if (expectedUserSpotId in data.pins) {
        actualSpotId = expectedUserSpotId;
      } else if (spotId in data.pins) {
        // Si el pin está con el ID del WorldSpot, mantenerlo (caso legacy)
        actualSpotId = spotId;
      }
    }
    
    setData((prev) => {
      const { [actualSpotId]: removed, ...remainingPins } = prev.pins;
      return {
        ...prev,
        pins: remainingPins,
      };
    });

    // V1.3: Eliminar de Supabase en background (no bloqueante)
    if (isAuthenticated) {
      deletePinFromSupabase(actualSpotId).catch((error) => {
        console.error('Error deleting pin from Supabase:', error);
      });
    }
  };

  const changePinState = (spotId: string, newState: PinState) => {
    // FASE 7: Convertir WorldSpot a UserSpot si es necesario
    // V1.2: REGLA PRINCIPAL - Convertir al primer cambio de estatus si es WorldSpot
    let actualSpotId = spotId;
    const worldSpot = getWorldSpotById(spotId);
    let updatedPinData: PinData | null = null;
    
    // Si es WorldSpot, buscar o crear UserSpot convertido
    if (worldSpot && user?.id) {
      const expectedUserSpotId = `user-${user.id}-${spotId}`;
      // Verificar si ya existe pin con el ID del WorldSpot (caso legacy) o con el UserSpot
      if (spotId in data.pins) {
        // Migrar pin del WorldSpot al UserSpot
        actualSpotId = ensureUserSpot(spotId);
        // Mover el pin al UserSpot
        setData((prev) => {
          const existingPin = prev.pins[spotId];
          if (existingPin) {
            const { [spotId]: removed, ...remainingPins } = prev.pins;
            const now = new Date();
            const updatedPin: PinData = {
              ...existingPin,
              spotId: actualSpotId,
              state: newState,
              visitedAt: newState === 'visited' ? (existingPin.visitedAt || now) : undefined,
            };
            updatedPinData = updatedPin;
            return {
              ...prev,
              pins: {
                ...remainingPins,
                [actualSpotId]: updatedPin,
              },
            };
          }
          return prev;
        });
        
        // V1.3: Sincronizar con Supabase
        if (updatedPinData && isAuthenticated) {
          syncPinToSupabase(updatedPinData).catch((error) => {
            console.error('Error syncing pin to Supabase:', error);
          });
        }
        return;
      } else if (expectedUserSpotId in data.pins) {
        actualSpotId = expectedUserSpotId;
      } else {
        // No existe pin, convertir WorldSpot a UserSpot
        actualSpotId = ensureUserSpot(spotId);
      }
    }
    
    setData((prev) => {
      const existingPin = prev.pins[actualSpotId];
      if (!existingPin) {
        return prev; // No hacer nada si no existe el pin
      }

      const now = new Date();
      const updatedPin: PinData = {
        ...existingPin,
        state: newState,
        visitedAt: newState === 'visited' ? (existingPin.visitedAt || now) : undefined,
      };

      updatedPinData = updatedPin;

      return {
        ...prev,
        pins: {
          ...prev.pins,
          [actualSpotId]: updatedPin,
        },
      };
    });

    // V1.3: Sincronizar con Supabase en background (no bloqueante)
    if (updatedPinData && isAuthenticated) {
      syncPinToSupabase(updatedPinData).catch((error) => {
        console.error('Error syncing pin to Supabase:', error);
      });
    }
  };

  const isSpotPinned = (spotId: string): boolean => {
    // FASE 7: Verificar tanto el ID original como el ID convertido (si es WorldSpot)
    if (spotId in data.pins) return true;
    const worldSpot = getWorldSpotById(spotId);
    if (worldSpot && user?.id) {
      // V1.2: Buscar UserSpot convertido usando ID estable
      const expectedUserSpotId = `user-${user.id}-${spotId}`;
      if (expectedUserSpotId in data.pins) return true;
    }
    return false;
  };

  const getPinState = (spotId: string): PinState | null => {
    // FASE 7: Verificar tanto el ID original como el ID convertido (si es WorldSpot)
    if (data.pins[spotId]) {
      return data.pins[spotId].state;
    }
    const worldSpot = getWorldSpotById(spotId);
    if (worldSpot && user?.id) {
      // V1.2: Buscar UserSpot convertido usando ID estable
      const expectedUserSpotId = `user-${user.id}-${spotId}`;
      if (data.pins[expectedUserSpotId]) {
        return data.pins[expectedUserSpotId].state;
      }
    }
    return null;
  };

  const getPinnedSpots = (state?: PinState): string[] => {
    const pins = Object.values(data.pins);
    if (state) {
      return pins.filter((pin) => pin.state === state).map((pin) => pin.spotId);
    }
    return pins.map((pin) => pin.spotId);
  };

  // V1.2: Funciones de Diario de Viaje
  const updatePinNotes = (spotId: string, notes: string) => {
    // FASE 7: Convertir WorldSpot a UserSpot si es necesario
    // V1.2: Buscar UserSpot convertido si existe, sino convertir
    let actualSpotId = spotId;
    const worldSpot = getWorldSpotById(spotId);
    if (worldSpot && user?.id) {
      const expectedUserSpotId = `user-${user.id}-${spotId}`;
      if (expectedUserSpotId in data.pins) {
        actualSpotId = expectedUserSpotId;
      } else {
        actualSpotId = ensureUserSpot(spotId);
      }
    }

    let updatedPinData: PinData | null = null;

    setData((prev) => {
      const pin = prev.pins[actualSpotId];
      if (!pin) {
        return prev; // Solo permitir si Pin existe
      }
      const updatedPin: PinData = {
        ...pin,
        notes,
      };
      updatedPinData = updatedPin;
      return {
        ...prev,
        pins: {
          ...prev.pins,
          [actualSpotId]: updatedPin,
        },
      };
    });

    // V1.3: Sincronizar con Supabase en background (no bloqueante)
    if (updatedPinData && isAuthenticated) {
      syncPinToSupabase(updatedPinData).catch((error) => {
        console.error('Error syncing pin notes to Supabase:', error);
      });
    }
  };

  const addPinPhoto = (spotId: string, photoUrl: string) => {
    // FASE 7: Convertir WorldSpot a UserSpot si es necesario
    // V1.2: Buscar UserSpot convertido si existe, sino convertir
    let actualSpotId = spotId;
    const worldSpot = getWorldSpotById(spotId);
    if (worldSpot && user?.id) {
      const expectedUserSpotId = `user-${user.id}-${spotId}`;
      if (expectedUserSpotId in data.pins) {
        actualSpotId = expectedUserSpotId;
      } else {
        actualSpotId = ensureUserSpot(spotId);
      }
    }

    let updatedPinData: PinData | null = null;

    setData((prev) => {
      const pin = prev.pins[actualSpotId];
      if (!pin) {
        return prev; // Solo permitir si Pin existe
      }
      const personalPhotos = pin.personalPhotos || [];
      if (personalPhotos.includes(photoUrl)) {
        return prev; // Ya existe, no agregar duplicado
      }
      const updatedPin: PinData = {
        ...pin,
        personalPhotos: [...personalPhotos, photoUrl],
      };
      updatedPinData = updatedPin;
      return {
        ...prev,
        pins: {
          ...prev.pins,
          [actualSpotId]: updatedPin,
        },
      };
    });

    // V1.3: Sincronizar con Supabase en background (no bloqueante)
    if (updatedPinData && isAuthenticated) {
      syncPinToSupabase(updatedPinData).catch((error) => {
        console.error('Error syncing pin photo to Supabase:', error);
      });
    }
  };

  const removePinPhoto = (spotId: string, photoUrl: string) => {
    // FASE 7: Usar el ID correcto (puede ser WorldSpot o UserSpot)
    // V1.2: Buscar UserSpot convertido si existe, sino convertir
    let actualSpotId = spotId;
    const worldSpot = getWorldSpotById(spotId);
    if (worldSpot && user?.id) {
      const expectedUserSpotId = `user-${user.id}-${spotId}`;
      if (expectedUserSpotId in data.pins) {
        actualSpotId = expectedUserSpotId;
      } else {
        actualSpotId = ensureUserSpot(spotId);
      }
    }

    let updatedPinData: PinData | null = null;

    setData((prev) => {
      const pin = prev.pins[actualSpotId];
      if (!pin) {
        return prev; // Solo permitir si Pin existe
      }
      const personalPhotos = pin.personalPhotos || [];
      const updatedPin: PinData = {
        ...pin,
        personalPhotos: personalPhotos.filter((url) => url !== photoUrl),
      };
      updatedPinData = updatedPin;
      return {
        ...prev,
        pins: {
          ...prev.pins,
          [actualSpotId]: updatedPin,
        },
      };
    });

    // V1.3: Sincronizar con Supabase en background (no bloqueante)
    if (updatedPinData && isAuthenticated) {
      syncPinToSupabase(updatedPinData).catch((error) => {
        console.error('Error syncing pin photo removal to Supabase:', error);
      });
    }
  };

  const value: SavedContextType = {
    // V1.2: Sistema de Pins (NUEVO)
    pins: data.pins,
    pinSpot,
    unpinSpot,
    changePinState,
    isSpotPinned,
    getPinState,
    getPinnedSpots,
    // V1.2: Funciones de Diario de Viaje
    updatePinNotes,
    addPinPhoto,
    removePinPhoto,
    // TEMPORAL (mantener para compatibilidad)
    likedSpots: data.likedSpots,
    likedSpotsFromPlayer: data.likedSpotsFromPlayer,
    notMyVibeSpots: data.notMyVibeSpots,
    savedSpots: data.savedSpots,
    savedFlows: data.savedFlows,
    savedFlowNames: data.savedFlowNames,
    timeline: data.timeline,
    // Aliases para compatibilidad
    savedPaths: data.savedFlows,
    toggleLikeSpot,
    toggleLikeSpotFromPlayer,
    toggleNotMyVibeSpot,
    getSpotTypeAffinity,
    toggleSaveSpot,
    toggleSaveFlow,
    saveFlow,
    getFlowCustomName,
    // Aliases para compatibilidad
    toggleSavePath,
    isSpotLiked,
    isSpotLikedFromPlayer,
    isSpotNotMyVibe,
    isSpotSaved,
    isFlowSaved,
    // Aliases para compatibilidad
    isPathSaved,
    isLoading,
  };

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (context === undefined) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
}

