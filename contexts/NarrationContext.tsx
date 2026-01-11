/**
 * NarrationContext - Estado de narración activa
 * Scope 3.5 + Scope 6: Gestión del sistema de narración
 * 
 * P0-05: Audio eliminado - funciones de audio convertidas en no-ops para compatibilidad
 * Los subtítulos se manejan mediante useFlowSubtitle hook en los componentes que los renderizan
 * 
 * Funciones mantenidas para compatibilidad (no-ops):
 * - playNarration
 * - stopNarration
 * - pauseNarration
 * - resumeNarration
 * - toggleMute
 * - triggerNarration
 * - processQueue
 */

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

export type NarrationType = 'anticipation' | 'presence' | 'transition' | 'context';

export interface Narration {
  id: string;
  spotId?: string;
  pathId?: string;
  type: NarrationType;
  text: string;
  audioUrl?: string;
  duration?: number; // En segundos
}

export type NarrationStatus = 'idle' | 'playing' | 'paused' | 'stopped' | 'error';

// P0-05: Tipo simplificado para compatibilidad (ya no se usa NarrationTrigger real)
export type NarrationTrigger = 'approaching' | 'arriving' | 'leaving' | 'between';

interface NarrationContextType {
  currentNarration: Narration | null;
  status: NarrationStatus;
  isMuted: boolean;
  playNarration: (narration: Narration) => Promise<void>;
  stopNarration: () => Promise<void>;
  pauseNarration: () => Promise<void>;
  resumeNarration: () => Promise<void>;
  toggleMute: () => Promise<void>;
  triggerNarration: (trigger: NarrationTrigger, narration: Narration) => boolean;
  processQueue: () => Promise<void>;
}

const NarrationContext = createContext<NarrationContextType | undefined>(undefined);

export function NarrationProvider({ children }: { children: ReactNode }) {
  // P0-05: Estado simplificado - solo para compatibilidad de interfaces
  const [currentNarration, setCurrentNarration] = useState<Narration | null>(null);
  const [status, setStatus] = useState<NarrationStatus>('idle');
  // P0-05: isMuted siempre false - audio ya no se usa
  const isMuted = false;

  /**
   * P0-05: No-op - audio eliminado
   * Mantenido para compatibilidad de interfaces
   */
  const playNarration = useCallback(async (narration: Narration): Promise<void> => {
    // No-op: audio eliminado, solo actualizar estado para compatibilidad
    setCurrentNarration(narration);
    setStatus('playing');
    // No hay audio que reproducir
  }, []);

  /**
   * P0-05: No-op - audio eliminado
   * Mantenido para compatibilidad, especialmente para closeFlow
   */
  const stopNarration = useCallback(async (): Promise<void> => {
    // No-op: audio eliminado, solo resetear estado
    setStatus('stopped');
    setCurrentNarration(null);
  }, []);

  /**
   * P0-05: No-op - audio eliminado
   * Mantenido para compatibilidad de interfaces
   */
  const pauseNarration = useCallback(async (): Promise<void> => {
    // No-op: audio eliminado
    setStatus('paused');
  }, []);

  /**
   * P0-05: No-op - audio eliminado
   * Mantenido para compatibilidad de interfaces
   */
  const resumeNarration = useCallback(async (): Promise<void> => {
    // No-op: audio eliminado
    setStatus('playing');
  }, []);

  /**
   * P0-05: No-op - audio eliminado
   * Mantenido para compatibilidad de interfaces
   */
  const toggleMute = useCallback(async (): Promise<void> => {
    // No-op: audio eliminado, isMuted siempre es false
  }, []);

  /**
   * P0-05: No-op - audio eliminado
   * Mantenido para compatibilidad de interfaces (useNarrationTriggers)
   */
  const triggerNarration = useCallback(
    (trigger: NarrationTrigger, narration: Narration): boolean => {
      // No-op: audio eliminado, ya no hay cola de audio
      return false;
    },
    []
  );

  /**
   * P0-05: No-op - audio eliminado
   * Mantenido para compatibilidad de interfaces
   */
  const processQueue = useCallback(async (): Promise<void> => {
    // No-op: audio eliminado, ya no hay cola que procesar
  }, []);

  const value: NarrationContextType = {
    currentNarration,
    status,
    isMuted,
    playNarration,
    stopNarration,
    pauseNarration,
    resumeNarration,
    toggleMute,
    triggerNarration,
    processQueue,
  };

  return <NarrationContext.Provider value={value}>{children}</NarrationContext.Provider>;
}

export function useNarration() {
  const context = useContext(NarrationContext);
  if (context === undefined) {
    throw new Error('useNarration must be used within a NarrationProvider');
  }
  return context;
}
