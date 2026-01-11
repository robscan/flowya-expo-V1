/**
 * FlowContext - Estado de Flow (idle/active)
 * Scope 3.3: Gestión del estado Flow activo
 * 
 * Funciones:
 * - startFlow
 * - pauseFlow
 * - endFlow
 * - nextSpot
 * - Progreso del Path actual
 * - Spot actual y siguiente
 */

import { useRouter } from 'expo-router';
import { createContext, ReactNode, useContext, useMemo, useRef, useState } from 'react';
import { flowEventEmitter } from '@/utils/flowEventEmitter';
import { usePath } from './PathContext';

export type FlowStatus = 'idle' | 'active' | 'paused';

export type NarrationBlock = 'anticipation' | 'presence' | 'transition';

export interface FlowState {
  status: FlowStatus;
  currentPathId: string | null;
  currentSpotIndex: number;
  currentNarrationBlock: NarrationBlock | null; // SCOPE 2: Bloque narrativo actual dentro del spot
  startedAt: Date | null;
  pausedAt: Date | null;
  isMinimized: boolean; // Estado de minimizado
}

interface FlowContextType {
  flowState: FlowState;
  currentSpotId: string | null;
  nextSpotId: string | null;
  progress: number; // 0-100
  startFlow: (pathId: string) => void;
  pauseFlow: () => void;
  resumeFlow: () => void;
  endFlow: () => void; // Legacy - use closeFlow instead
  closeFlow: (stopNarrationFn?: () => Promise<void>) => Promise<void>; // CANONICAL: Orchestrates complete flow closure sequence
  minimizeFlow: () => void; // Minimizar FlowScreen
  expandFlow: () => void; // Expandir FlowScreen desde minimizado
  nextSpot: () => void;
  previousSpot: () => void;
  nextNarrationBlock: () => void; // SCOPE 2: Avanzar un bloque narrativo (o siguiente spot si completó todos los bloques)
  previousNarrationBlock: () => void; // SCOPE 2: Retroceder un bloque narrativo (o bloque final del spot anterior)
  goToSpot: (spotIndex: number) => void;
  addSpotToFlow: (spotId: string) => void; // Agregar spot al flow actual
  reorderFlowSpots: (newOrder: string[]) => void; // Reordenar spots del flow actual
  removeSpotFromFlow: (spotId: string) => void; // Remover spot del flow actual
}

const defaultFlowState: FlowState = {
  status: 'idle',
  currentPathId: null,
  currentSpotIndex: 0,
  currentNarrationBlock: null, // SCOPE 2: Sin bloque narrativo cuando está idle
  startedAt: null,
  pausedAt: null,
  isMinimized: false,
};

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [flowState, setFlowState] = useState<FlowState>(defaultFlowState);
  const router = useRouter();
  const { getFlowById, updateFlow } = usePath();
  
  // Refs para eventos one-shot (guardas para evitar emisión múltiple)
  const flowStartedEmittedRef = useRef<boolean>(false);
  const flowCompletedEmittedRef = useRef<boolean>(false);

  // Calcular spot IDs actual y siguiente basado en el estado
  const { currentSpotId, nextSpotId, progress } = useMemo(() => {
    if (!flowState.currentPathId || flowState.status === 'idle') {
      return {
        currentSpotId: null,
        nextSpotId: null,
        progress: 0,
      };
    }

    const flow = getFlowById(flowState.currentPathId);
    if (!flow || flow.spots.length === 0) {
      return {
        currentSpotId: null,
        nextSpotId: null,
        progress: 0,
      };
    }

    const currentIndex = flowState.currentSpotIndex;
    const totalSpots = flow.spots.length;

    // Calcular currentSpotId
    const currentSpotId = currentIndex < totalSpots ? flow.spots[currentIndex] : null;

    // Calcular nextSpotId
    const nextSpotId = currentIndex + 1 < totalSpots ? flow.spots[currentIndex + 1] : null;

    // Calcular progreso (0-100)
    const progress = totalSpots > 0 ? Math.round((currentIndex / totalSpots) * 100) : 0;

    return {
      currentSpotId,
      nextSpotId,
      progress,
    };
  }, [flowState.currentPathId, flowState.currentSpotIndex, flowState.status, getFlowById]);

  const startFlow = (pathId: string) => {
    // Resetear eventos one-shot emitidos para nuevo Flow
    flowEventEmitter.resetOneShots();
    flowStartedEmittedRef.current = false;
    flowCompletedEmittedRef.current = false;

    setFlowState({
      status: 'active',
      currentPathId: pathId,
      currentSpotIndex: 0,
      currentNarrationBlock: 'anticipation', // SCOPE 2: Iniciar con primer bloque narrativo
      startedAt: new Date(),
      pausedAt: null,
      isMinimized: false,
    });
    
    // P0-08: Emitir evento FLOW_STARTED (one-shot)
    if (!flowStartedEmittedRef.current) {
      flowEventEmitter.emit('FLOW_STARTED');
      flowStartedEmittedRef.current = true;
    }
    
    // Navegar a la pantalla de flow
    router.push('/flow-screen');
  };

  const pauseFlow = () => {
    if (flowState.status === 'active') {
      setFlowState({
        ...flowState,
        status: 'paused',
        pausedAt: new Date(),
      });
    }
  };

  const resumeFlow = () => {
    if (flowState.status === 'paused') {
      setFlowState({
        ...flowState,
        status: 'active',
        pausedAt: null,
      });
    }
  };

  /**
   * Legacy endFlow - just resets state
   * @deprecated Use closeFlow() instead for complete flow closure
   */
  const endFlow = () => {
    setFlowState(defaultFlowState);
  };

  /**
   * CANONICAL closeFlow - Orchestrates complete flow closure sequence
   * Order (CRITICAL - must follow this exact sequence):
   * 1. Stop narration (via stopNarrationFn parameter from NarrationContext)
   * 2. Clear active flow state
   * 3. Reset flow-related UI state (already handled by state reset)
   * 4. Explicitly navigate away from Flow screen (ALWAYS - no conditional rendering)
   * 
   * This function ALWAYS navigates away. FlowScreen will unmount every time.
   * 
   * @param stopNarrationFn Optional function to stop narration. Should be passed from useNarration().stopNarration
   */
  const closeFlow = async (stopNarrationFn?: () => Promise<void>): Promise<void> => {
    // Step 1: Stop narration (CRITICAL - must happen before state cleanup)
    if (stopNarrationFn) {
      try {
        await stopNarrationFn();
      } catch {
        // Ignore narration errors - stopNarration is already hardened to be safe
        // We continue with state cleanup even if narration stop fails
      }
    }

    // P0-08: Emitir evento FLOW_COMPLETED (one-shot) antes de limpiar estado
    if (!flowCompletedEmittedRef.current) {
      flowEventEmitter.emit('FLOW_COMPLETED');
      flowCompletedEmittedRef.current = true;
    }

    // Step 2: Clear active flow state
    setFlowState(defaultFlowState);

    // Step 3: Reset flow-related UI state is handled by state reset above
    // (isMinimized, currentSpotIndex, etc. all reset to defaults)

    // Step 4: Explicitly navigate away from Flow screen (ALWAYS)
    // Use router.back() if possible, otherwise router.replace to home
    // This ensures FlowScreen ALWAYS unmounts and user never remains on FlowScreen
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/home');
      }
    } catch {
      // Fallback: always navigate to home if navigation fails
      router.replace('/(tabs)/home');
    }
  };

  const minimizeFlow = () => {
    if (flowState.status === 'active' || flowState.status === 'paused') {
      setFlowState({
        ...flowState,
        isMinimized: true,
      });
    }
  };

  const expandFlow = () => {
    if (flowState.status === 'active' || flowState.status === 'paused') {
      setFlowState({
        ...flowState,
        isMinimized: false,
      });
      // Navegar a la pantalla de flow
      router.push('/flow-screen');
    }
  };

  const nextSpot = () => {
    if (flowState.status === 'active' || flowState.status === 'paused') {
      setFlowState({
        ...flowState,
        currentSpotIndex: flowState.currentSpotIndex + 1,
      });
    }
  };

  const previousSpot = () => {
    if ((flowState.status === 'active' || flowState.status === 'paused') && flowState.currentSpotIndex > 0) {
      setFlowState({
        ...flowState,
        currentSpotIndex: flowState.currentSpotIndex - 1,
        currentNarrationBlock: 'transition', // SCOPE 2: Al retroceder a spot anterior, empezar desde último bloque
      });
    }
  };

  // SCOPE 2: Navegación por bloques narrativos
  const nextNarrationBlock = () => {
    if (flowState.status !== 'active' && flowState.status !== 'paused') {
      return;
    }

    if (!flowState.currentPathId) {
      return;
    }

    const flow = getFlowById(flowState.currentPathId);
    if (!flow) {
      return;
    }

    // Orden de bloques: anticipation → presence → transition → siguiente spot
    const blockOrder: NarrationBlock[] = ['anticipation', 'presence', 'transition'];
    const currentBlockIndex = flowState.currentNarrationBlock
      ? blockOrder.indexOf(flowState.currentNarrationBlock)
      : -1;

    if (currentBlockIndex < blockOrder.length - 1) {
      // Avanzar al siguiente bloque dentro del mismo spot
      setFlowState({
        ...flowState,
        currentNarrationBlock: blockOrder[currentBlockIndex + 1],
      });
    } else {
      // Completamos todos los bloques del spot actual, avanzar al siguiente spot
      const nextSpotIndex = flowState.currentSpotIndex + 1;
      const totalSpots = flow.spots.length;
      
      // P0-08: Emitir evento SPOT_COMPLETED
      // El momento (transition vs end) se determina en el hook useFlowSubtitle
      flowEventEmitter.emit('SPOT_COMPLETED', {
        spotId: flow.spots[flowState.currentSpotIndex],
        spotIndex: flowState.currentSpotIndex,
        totalSpots,
      });
      
      if (nextSpotIndex < totalSpots) {
        setFlowState({
          ...flowState,
          currentSpotIndex: nextSpotIndex,
          currentNarrationBlock: 'anticipation', // Empezar con anticipation del siguiente spot
        });
      }
      // Si no hay más spots, no hacer nada (opcional: feedback de límite)
    }
  };

  const previousNarrationBlock = () => {
    if (flowState.status !== 'active' && flowState.status !== 'paused') {
      return;
    }

    if (!flowState.currentPathId) {
      return;
    }

    const flow = getFlowById(flowState.currentPathId);
    if (!flow) {
      return;
    }

    // Orden de bloques: anticipation → presence → transition
    const blockOrder: NarrationBlock[] = ['anticipation', 'presence', 'transition'];
    const currentBlockIndex = flowState.currentNarrationBlock
      ? blockOrder.indexOf(flowState.currentNarrationBlock)
      : -1;

    if (currentBlockIndex > 0) {
      // Retroceder al bloque anterior dentro del mismo spot
      setFlowState({
        ...flowState,
        currentNarrationBlock: blockOrder[currentBlockIndex - 1],
      });
    } else if (currentBlockIndex === 0 && flowState.currentSpotIndex > 0) {
      // Ya está en el primer bloque, retroceder al bloque final del spot anterior
      setFlowState({
        ...flowState,
        currentSpotIndex: flowState.currentSpotIndex - 1,
        currentNarrationBlock: 'transition', // Empezar desde último bloque del spot anterior
      });
    }
    // Si no hay spot previo o ya está en el primer bloque del primer spot, no hacer nada
  };

  const goToSpot = (spotIndex: number) => {
    if (flowState.status === 'active' || flowState.status === 'paused') {
      setFlowState({
        ...flowState,
        currentSpotIndex: spotIndex,
      });
    }
  };

  const addSpotToFlow = (spotId: string) => {
    if (!flowState.currentPathId || (flowState.status !== 'active' && flowState.status !== 'paused')) {
      return;
    }

    const flow = getFlowById(flowState.currentPathId);
    if (!flow) {
      return;
    }

    // Verificar que el spot no esté ya en el flow
    if (flow.spots.includes(spotId)) {
      return;
    }

    // Agregar el spot al final del flow
    const updatedSpots = [...flow.spots, spotId];
    updateFlow(flowState.currentPathId, {
      spots: updatedSpots,
    });
  };

  const reorderFlowSpots = (newOrder: string[]) => {
    if (!flowState.currentPathId || (flowState.status !== 'active' && flowState.status !== 'paused')) {
      return;
    }

    const flow = getFlowById(flowState.currentPathId);
    if (!flow) {
      return;
    }

    // Verificar que el nuevo orden tenga los mismos spots (solo reordenados)
    const currentSpotsSet = new Set(flow.spots);
    const newOrderSet = new Set(newOrder);
    
    if (currentSpotsSet.size !== newOrderSet.size || 
        ![...currentSpotsSet].every(spot => newOrderSet.has(spot))) {
      console.warn('ReorderFlowSpots: New order does not match current spots');
      return;
    }

    // Actualizar el orden del flow
    updateFlow(flowState.currentPathId, {
      spots: newOrder,
    });
  };

  const removeSpotFromFlow = (spotId: string) => {
    if (!flowState.currentPathId || (flowState.status !== 'active' && flowState.status !== 'paused')) {
      return;
    }

    const flow = getFlowById(flowState.currentPathId);
    if (!flow) {
      return;
    }

    const spotIndex = flow.spots.indexOf(spotId);
    if (spotIndex === -1) {
      return; // Spot no está en el flow
    }

    // No permitir remover el spot actual o spots pasados
    if (spotIndex <= flowState.currentSpotIndex) {
      console.warn('Cannot remove current or past spots');
      return;
    }

    // Remover el spot del flow
    const updatedSpots = flow.spots.filter(id => id !== spotId);
    updateFlow(flowState.currentPathId, {
      spots: updatedSpots,
    });
  };

  const value: FlowContextType = {
    flowState,
    currentSpotId,
    nextSpotId,
    progress,
    startFlow,
    pauseFlow,
    resumeFlow,
    endFlow,
    closeFlow,
    minimizeFlow,
    expandFlow,
    nextSpot,
    previousSpot,
    nextNarrationBlock,
    previousNarrationBlock,
    goToSpot,
    addSpotToFlow,
    reorderFlowSpots,
    removeSpotFromFlow,
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (context === undefined) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
}

