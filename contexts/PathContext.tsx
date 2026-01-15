/**
 * PathContext - Gestión de estado de Flows (anteriormente Paths)
 * Scope 3.2: Estado de Flows y funciones de gestión
 * 
 * Funciones:
 * - crearFlow
 * - obtenerFlows
 * - guardarFlow
 * - Generación sugerida de Flows
 * 
 * NOTA: Se mantiene el nombre PathContext para compatibilidad, pero internamente usa Flow
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Flow, MovementMode, calculateEstimatedDuration } from '@/data/flows';
import { mockFlows } from '@/data/flows';
import { normalizeSpotIds } from '@/utils/normalizeSpotId';

const STORAGE_KEY = '@flowya_flows';

interface PathContextType {
  flows: Flow[];
  isLoading: boolean;
  getFlowById: (id: string) => Flow | undefined;
  createFlow: (
    spotIds: string[],
    movementMode: MovementMode,
    title?: string,
    description?: string
  ) => Flow;
  updateFlow: (id: string, updates: Partial<Flow>) => void;
  deleteFlow: (id: string) => void;
  suggestFlowFromSpots: (spotIds: string[]) => Flow | null;
  refreshFlows: () => Promise<void>;
  // Aliases para compatibilidad temporal
  paths: Flow[];
  getPathById: (id: string) => Flow | undefined;
  createPath: (
    spotIds: string[],
    movementMode: MovementMode,
    title?: string,
    description?: string
  ) => Flow;
  updatePath: (id: string, updates: Partial<Flow>) => void;
  deletePath: (id: string) => void;
  suggestPathFromSpots: (spotIds: string[]) => Flow | null;
}

const PathContext = createContext<PathContextType | undefined>(undefined);

export function PathProvider({ children }: { children: ReactNode }) {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar flows desde AsyncStorage
  useEffect(() => {
    loadFlows();
  }, []);

  // Guardar flows en AsyncStorage cuando cambien
  useEffect(() => {
    if (!isLoading) {
      saveFlows(flows);
    }
  }, [flows, isLoading]);

  const loadFlows = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir fechas
        const flowsWithDates = parsed.map((flow: any) => ({
          ...flow,
          createdAt: new Date(flow.createdAt),
          updatedAt: new Date(flow.updatedAt),
          metadata: flow.metadata
            ? {
                ...flow.metadata,
                inferredFrom: flow.metadata.inferredFrom
                  ? normalizeSpotIds(flow.metadata.inferredFrom)
                  : undefined,
                suggestedAt: flow.metadata.suggestedAt ? new Date(flow.metadata.suggestedAt) : undefined,
                acceptedAt: flow.metadata.acceptedAt ? new Date(flow.metadata.acceptedAt) : undefined,
                editedAt: flow.metadata.editedAt ? new Date(flow.metadata.editedAt) : undefined,
              }
            : undefined,
          spots: normalizeSpotIds(flow.spots),
        }));
        setFlows(flowsWithDates);
      } else {
        // Usar mock data si no hay datos guardados
        setFlows(mockFlows);
      }
    } catch (error) {
      console.error('Error loading flows:', error);
      // Fallback a mock data
      setFlows(mockFlows);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshFlows = async () => {
    // Recargar flows desde AsyncStorage
    await loadFlows();
  };

  const saveFlows = async (flowsToSave: Flow[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(flowsToSave));
    } catch (error) {
      console.error('Error saving flows:', error);
    }
  };

  const getFlowById = (id: string): Flow | undefined => {
    return flows.find((flow) => flow.id === id);
  };

  const createFlow = (
    spotIds: string[],
    movementMode: MovementMode,
    title?: string,
    description?: string
  ): Flow => {
    const normalizedSpotIds = normalizeSpotIds(spotIds);
    const now = new Date();
    const estimatedDuration = calculateEstimatedDuration(normalizedSpotIds.length, movementMode);

    const newFlow: Flow = {
      id: `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title || `Flow with ${normalizedSpotIds.length} spots`,
      description,
      estimatedDuration,
      movementMode,
      spots: normalizedSpotIds,
      createdAt: now,
      updatedAt: now,
    };

    setFlows((prev) => [...prev, newFlow]);
    return newFlow;
  };

  const updateFlow = (id: string, updates: Partial<Flow>) => {
    const normalizedUpdates = updates.spots
      ? { ...updates, spots: normalizeSpotIds(updates.spots) }
      : updates;
    setFlows((prev) =>
      prev.map((flow) =>
        flow.id === id
          ? { ...flow, ...normalizedUpdates, updatedAt: new Date() }
          : flow
      )
    );
  };

  const deleteFlow = (id: string) => {
    setFlows((prev) => prev.filter((flow) => flow.id !== id));
  };

  // Generar Flow sugerido desde array de Spot IDs
  const suggestFlowFromSpots = (spotIds: string[]): Flow | null => {
    const normalizedSpotIds = normalizeSpotIds(spotIds);
    if (normalizedSpotIds.length < 2) {
      return null; // Necesitamos al menos 2 spots para un flow
    }

    const now = new Date();
    const estimatedDuration = calculateEstimatedDuration(normalizedSpotIds.length, 'walking');

    const suggestedFlow: Flow = {
      id: `flow-suggested-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `Suggested flow with ${normalizedSpotIds.length} spots`,
      description: `A flow connecting ${normalizedSpotIds.length} spots`,
      estimatedDuration,
      movementMode: 'walking',
      spots: normalizedSpotIds,
      metadata: {
        inferredFrom: normalizedSpotIds,
        suggestedAt: now,
      },
      createdAt: now,
      updatedAt: now,
    };

    return suggestedFlow;
  };

  // Aliases para compatibilidad temporal
  const getPathById = getFlowById;
  const createPath = createFlow;
  const updatePath = updateFlow;
  const deletePath = deleteFlow;
  const suggestPathFromSpots = suggestFlowFromSpots;

  const value: PathContextType = {
    flows,
    isLoading,
    getFlowById,
    createFlow,
    updateFlow,
    deleteFlow,
    suggestFlowFromSpots,
    refreshFlows,
    // Aliases para compatibilidad
    paths: flows,
    getPathById,
    createPath,
    updatePath,
    deletePath,
    suggestPathFromSpots,
  };

  return <PathContext.Provider value={value}>{children}</PathContext.Provider>;
}

export function usePath() {
  const context = useContext(PathContext);
  if (context === undefined) {
    throw new Error('usePath must be used within a PathProvider');
  }
  return context;
}

