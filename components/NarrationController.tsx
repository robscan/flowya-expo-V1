/**
 * NarrationController Component
 * Scope 6: Sistema de Narration - Componente orquestador
 * 
 * Funcionalidades:
 * - Orquesta la narration basándose en eventos de Flow
 * - Integra narration engine + audio manager mediante hook
 * - Toggle de silenciar narration
 * 
 * Este componente escucha eventos del FlowContext y maneja
 * las narrations automáticamente.
 */

import { useEffect } from 'react';
import { useNarration } from '@/contexts/NarrationContext';
import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import { useSpot } from '@/contexts/SpotContext';
import {
  getRandomNarrationBySpotAndType,
  getRandomPathContextNarration,
} from '@/data/narrations';
import { generateNarrationText } from '@/utils/narrationGenerator';

/**
 * Componente invisible que orquesta las narrations
 * Se integra en el root layout para funcionar globalmente
 */
export function NarrationController() {
  const narration = useNarration();

  const { flowState, currentSpotId, nextSpotId } = useFlow();
  const { getPathById } = usePath();

  // P0-05: Audio eliminado - este componente ya no necesita hacer nada
  // Los subtítulos se manejan mediante useFlowSubtitle hook en los componentes que los renderizan

  // El componente es invisible - no renderiza nada
  // Solo maneja la lógica de orquestación
  return null;
}

/**
 * Helper para disparar narrations basándose en triggers
 * Estas funciones pueden ser llamadas desde el Flow Screen (Scope 7)
 */
export function useNarrationTriggers() {
  const narration = useNarration();
  const { flowState, currentSpotId, nextSpotId } = useFlow();
  const { getPathById } = usePath();
  const { getSpotById } = useSpot();

  /**
   * Disparar narration de tipo "approaching" (anticipation)
   */
  const triggerApproaching = (spotId: string) => {
    const spot = getSpotById(spotId);
    
    // Intentar usar narrationGenerator primero (sistema híbrido)
    if (spot) {
      const narrationText = generateNarrationText(spot, 'anticipation');
      if (narrationText) {
        const narrationData = {
          id: `narration-${spotId}-anticipation-${Date.now()}`,
          spotId,
          type: 'anticipation' as const,
          text: narrationText,
          duration: Math.ceil(narrationText.length / 10), // Estimación: ~10 caracteres por segundo
        };
        narration.triggerNarration('approaching', narrationData);
        return;
      }
    }
    
    // Fallback a sistema anterior
    const narrationData = getRandomNarrationBySpotAndType(spotId, 'anticipation');
    if (narrationData) {
      narration.triggerNarration('approaching', narrationData);
    }
  };

  /**
   * Disparar narration de tipo "arriving" (presence)
   */
  const triggerArriving = (spotId: string) => {
    const spot = getSpotById(spotId);
    
    // Intentar usar narrationGenerator primero (sistema híbrido)
    if (spot) {
      const narrationText = generateNarrationText(spot, 'presence');
      if (narrationText) {
        const narrationData = {
          id: `narration-${spotId}-presence-${Date.now()}`,
          spotId,
          type: 'presence' as const,
          text: narrationText,
          duration: Math.ceil(narrationText.length / 10), // Estimación: ~10 caracteres por segundo
        };
        narration.triggerNarration('arriving', narrationData);
        return;
      }
    }
    
    // Fallback a sistema anterior
    const narrationData = getRandomNarrationBySpotAndType(spotId, 'presence');
    if (narrationData) {
      narration.triggerNarration('arriving', narrationData);
    }
  };

  /**
   * Disparar narration de tipo "leaving" (transition)
   */
  const triggerLeaving = (spotId: string) => {
    const spot = getSpotById(spotId);
    
    // Intentar usar narrationGenerator primero (sistema híbrido)
    if (spot) {
      const narrationText = generateNarrationText(spot, 'transition');
      if (narrationText) {
        const narrationData = {
          id: `narration-${spotId}-transition-${Date.now()}`,
          spotId,
          type: 'transition' as const,
          text: narrationText,
          duration: Math.ceil(narrationText.length / 10), // Estimación: ~10 caracteres por segundo
        };
        narration.triggerNarration('leaving', narrationData);
        return;
      }
    }
    
    // Fallback a sistema anterior
    const narrationData = getRandomNarrationBySpotAndType(spotId, 'transition');
    if (narrationData) {
      narration.triggerNarration('leaving', narrationData);
    }
  };

  /**
   * Disparar narration de tipo "between" (context)
   */
  const triggerBetween = (pathId: string) => {
    // Mantener sistema anterior para narrations entre spots
    const narrationData = getRandomPathContextNarration(pathId);
    if (narrationData) {
      narration.triggerNarration('between', narrationData);
    }
  };

  return {
    triggerApproaching,
    triggerArriving,
    triggerLeaving,
    triggerBetween,
    toggleMute: () => narration.toggleMute(),
    isMuted: narration.isMuted,
    status: narration.status,
    currentNarration: narration.currentNarration,
  };
}

