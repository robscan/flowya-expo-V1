/**
 * NarrationContext - Estado de narración activa
 * Scope 3.5 + Scope 6: Gestión del sistema de narración
 * 
 * Funciones:
 * - playNarration
 * - stopNarration
 * - pauseNarration
 * - Manejo de triggers y reglas duras
 * - Integración con audioManager y narrationEngine
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { audioManager, AudioSource } from '@/utils/audioManager';
import { narrationEngine, NarrationTrigger } from '@/utils/narrationEngine';

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

/**
 * Convertir Narration a AudioSource para el audio manager
 */
function narrationToAudioSource(narration: Narration): AudioSource {
  if (narration.audioUrl) {
    // Audio pre-grabado
    return {
      type: 'url',
      source: narration.audioUrl,
    };
  } else {
    // Text-to-Speech
    return {
      type: 'tts',
      source: narration.text,
      language: 'en-US', // English for all narration texts
      rate: 0.85, // More natural speed
      pitch: 0.95, // Slightly lower pitch for better quality
    };
  }
}

export function NarrationProvider({ children }: { children: ReactNode }) {
  const [currentNarration, setCurrentNarration] = useState<Narration | null>(null);
  const [status, setStatus] = useState<NarrationStatus>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const processQueueRef = useRef<(() => Promise<void>) | null>(null);

  /**
   * Reproducir una narration
   */
  const playNarration = useCallback(
    async (narration: Narration): Promise<void> => {
      try {
        setCurrentNarration(narration);
        setStatus('playing');
        narrationEngine.markNarrationAsPlayed(narration);

        const audioSource = narrationToAudioSource(narration);
        await audioManager.play(audioSource);
      } catch (error) {
        setStatus('error');
        narrationEngine.markNarrationAsCancelled();
        setCurrentNarration(null);
        const errorObj = error instanceof Error ? error : new Error(String(error));
        console.error('Error playing narration:', errorObj);
        throw errorObj;
      }
    },
    []
  );

  /**
   * Procesar siguiente narration en la cola
   */
  const processQueue = useCallback(async (): Promise<void> => {
    const nextNarration = narrationEngine.getNextNarration();
    if (nextNarration) {
      await playNarration(nextNarration);
    }
  }, [playNarration]);

  // Guardar referencia para usar en useEffect
  processQueueRef.current = processQueue;

  // Configurar callbacks del audio manager
  useEffect(() => {
    audioManager.setCallbacks({
      onPlay: () => {
        setStatus('playing');
      },
      onFinish: () => {
        setStatus('stopped');
        if (currentNarration) {
          narrationEngine.markNarrationAsCompleted();
        }
        setCurrentNarration(null);
        // Procesar siguiente en la cola
        if (processQueueRef.current) {
          processQueueRef.current();
        }
      },
      onStop: () => {
        setStatus('stopped');
        narrationEngine.markNarrationAsCancelled();
        setCurrentNarration(null);
      },
      onError: (error) => {
        setStatus('error');
        narrationEngine.markNarrationAsCancelled();
        setCurrentNarration(null);
        console.error('Narration error:', error);
      },
    });

    // Sincronizar estado de muted
    setIsMuted(audioManager.getIsMuted());

    return () => {
      audioManager.setCallbacks({});
    };
  }, [currentNarration]);

  /**
   * Detener narration actual
   * SAFE: Idempotent - safe to call multiple times or when no narration is active
   * Always resets state reliably, even if errors occur
   */
  const stopNarration = useCallback(async (): Promise<void> => {
    try {
      // CRITICAL: Stop audio first (includes Speech.stop() for TTS)
      // audioManager.stop() is already safe and idempotent
      await audioManager.stop();
    } catch (error) {
      // Ignore audio stop errors - we'll still reset state
      // This ensures stopNarration is always safe to call
    }

    try {
      // Clear narration engine state (safe even if already cleared)
      narrationEngine.markNarrationAsCancelled();
      // Clear any queued narrations to prevent them from starting after stop
      narrationEngine.clearQueue();
    } catch (error) {
      // Ignore engine errors - state will still be reset below
    }

    // Always reset React state, regardless of errors above
    // This ensures stopNarration is idempotent and always safe
    setStatus('stopped');
    setCurrentNarration(null);
  }, []);

  /**
   * Pausar narration actual
   */
  const pauseNarration = useCallback(async (): Promise<void> => {
    await audioManager.pause();
    setStatus('paused');
  }, []);

  /**
   * Reanudar narration actual
   */
  const resumeNarration = useCallback(async (): Promise<void> => {
    await audioManager.resume();
    setStatus('playing');
  }, []);

  /**
   * Silenciar/activar sonido
   */
  const toggleMute = useCallback(async (): Promise<void> => {
    const newMutedState = !isMuted;
    await audioManager.setMuted(newMutedState);
    setIsMuted(newMutedState);
  }, [isMuted]);

  /**
   * Agregar narration a la cola mediante trigger
   */
  const triggerNarration = useCallback(
    (trigger: NarrationTrigger, narration: Narration): boolean => {
      const queued = narrationEngine.queueNarration(narration, trigger);
      if (queued) {
        // Si no hay narration reproduciéndose, procesar inmediatamente
        if (status === 'idle' || status === 'stopped') {
          processQueue();
        }
      }
      return queued;
    },
    [status, processQueue]
  );

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
