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
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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

interface SavedData {
  likedSpots: string[]; // Spot IDs
  likedSpotsFromPlayer: string[]; // Spot IDs - likes hechos desde el player durante navegación
  notMyVibeSpots: string[]; // Spot IDs
  savedSpots: string[]; // Spot IDs
  savedFlows: string[]; // Flow IDs (anteriormente savedPaths)
  savedFlowNames: Record<string, string>; // Map de flowId a nombre personalizado
  timeline: TimelineEntry[];
  spotTypeAffinity: Record<string, SpotTypeAffinity>; // SCOPE 5: Afinidad por tipo de spot (tipo -> { score, count })
  // Aliases para compatibilidad temporal
  savedPaths: string[];
}

interface SavedContextType {
  // Spots
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

  // Cargar datos desde AsyncStorage
  useEffect(() => {
    loadData();
  }, []);

  // Guardar datos en AsyncStorage cuando cambien
  useEffect(() => {
    if (!isLoading) {
      saveData(data);
    }
  }, [data, isLoading]);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir timestamps a Date objects
        parsed.timeline = parsed.timeline.map((entry: TimelineEntry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
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

  const saveData = async (dataToSave: SavedData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
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
    setData((prev) => {
      const isSaved = prev.savedSpots.includes(spotId);
      const newSavedSpots = isSaved
        ? prev.savedSpots.filter((id) => id !== spotId)
        : [...prev.savedSpots, spotId];

      addToTimeline('spot', 'saved', spotId);

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

  const value: SavedContextType = {
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

