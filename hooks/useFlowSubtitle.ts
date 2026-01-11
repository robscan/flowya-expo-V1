/**
 * Hook useFlowSubtitle - Obtener subtítulo actual del Flow
 * FLOWYA V1.1 - P0-09
 * 
 * Obtiene el subtítulo actual basado en:
 * - Evento activo del flowEventEmitter (mediante estado interno)
 * - Estado del Flow (currentSpotIndex, totalSpots, currentSpot, currentNarrationBlock)
 * - Spot.narration (anticipation, presence, transition)
 * - Condiciones (transition vs end)
 * - Regla de prioridad de eventos
 * - Fallback UX (último texto válido)
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import { useSpot } from '@/contexts/SpotContext';
import { flowEventEmitter, FlowEventData } from '@/utils/flowEventEmitter';
import { FlowSubtitle, FlowMoment, FlowEvent } from '@/types/flowSubtitle';

/**
 * Obtener subtítulo actual basado en evento activo y estado del Flow
 * 
 * FLOW_ACTIVE es un pulso temporal (2.5s) que:
 * - Solo aparece cuando currentEvent pasa de no-null a null (trigger de actividad)
 * - Nunca opaca eventos explícitos (prioridad absoluta)
 * - Expira después de 2.5 segundos, retornando null para que UI base tome control
 */
export function useFlowSubtitle(): FlowSubtitle | null {
  const { flowState, currentSpotId } = useFlow();
  const { getFlowById } = usePath();
  const { getSpotById } = useSpot();
  
  // Estado para el evento actual y sus datos
  const [currentEvent, setCurrentEvent] = useState<FlowEvent | null>(null);
  const [currentEventData, setCurrentEventData] = useState<FlowEventData | undefined>(undefined);
  const lastValidSubtitleRef = useRef<FlowSubtitle | null>(null);

  // Refs para controlar pulso temporal de FLOW_ACTIVE
  const flowActivePulseStartRef = useRef<number | null>(null);
  const [flowActivePulseActive, setFlowActivePulseActive] = useState<boolean>(false);
  const previousEventRef = useRef<FlowEvent | null>(null); // Para detectar transición no-null → null

  // Escuchar eventos del flowEventEmitter
  useEffect(() => {
    const handlers: Array<{ event: FlowEvent; handler: (event: FlowEvent, data?: FlowEventData) => void }> = [];

    const events: FlowEvent[] = [
      'FLOW_STARTED',
      'FLOW_COMPLETED',
      'SPOT_PROXIMITY_ENTER',
      'SPOT_COMPLETED',
    ];

    events.forEach((event) => {
      const handler = (evt: FlowEvent, data?: FlowEventData) => {
        if (evt === event) {
          setCurrentEvent(evt);
          setCurrentEventData(data);
        }
      };
      handlers.push({ event, handler });
      flowEventEmitter.on(event, handler);
    });

    // Limpiar listeners al desmontar
    return () => {
      handlers.forEach(({ event, handler }) => {
        flowEventEmitter.off(event, handler);
      });
    };
  }, []);

  // Detectar cuando currentEvent pasa de no-null a null (trigger para iniciar pulso FLOW_ACTIVE)
  useEffect(() => {
    const previousEvent = previousEventRef.current;
    const hadEvent = previousEvent !== null;
    const hasEvent = currentEvent !== null;

    // Si había evento y ahora no hay (transición no-null → null), iniciar pulso
    if (hadEvent && !hasEvent && flowState.status === 'active') {
      flowActivePulseStartRef.current = Date.now();
      setFlowActivePulseActive(true);
    } else if (hasEvent) {
      // Si hay evento explícito, cancelar pulso
      flowActivePulseStartRef.current = null;
      setFlowActivePulseActive(false);
    }

    // Actualizar referencia para próxima comparación
    previousEventRef.current = currentEvent;
  }, [currentEvent, flowState.status]);

  // Limpiar pulso después de 2.5 segundos
  useEffect(() => {
    if (flowActivePulseStartRef.current !== null) {
      const timeout = setTimeout(() => {
        flowActivePulseStartRef.current = null;
        setFlowActivePulseActive(false);
      }, 2500); // 2.5 segundos

      return () => clearTimeout(timeout);
    }
  }, [flowActivePulseActive, currentEvent]);

  // Generar subtítulo basado en evento activo o estado del Flow
  const subtitle = useMemo((): FlowSubtitle | null => {
    // Si Flow está idle, no hay subtítulo
    if (flowState.status === 'idle') {
      return null;
    }

    const flow = flowState.currentPathId ? getFlowById(flowState.currentPathId) : null;
    if (!flow) {
      return lastValidSubtitleRef.current;
    }

    const totalSpots = flow.spots.length;
    const currentSpot = currentSpotId ? getSpotById(currentSpotId) : null;

    // Determinar evento activo
    // PRIORIDAD ABSOLUTA: currentEvent (eventos explícitos) SIEMPRE ganan sobre FLOW_ACTIVE
    let activeEvent: FlowEvent | null = currentEvent;

    // Solo considerar FLOW_ACTIVE si:
    // 1. No hay evento explícito activo
    // 2. El pulso está activo (no expiró)
    // 3. Flow está activo
    if (!activeEvent && flowState.status === 'active' && flowActivePulseStartRef.current !== null) {
      const pulseAge = Date.now() - flowActivePulseStartRef.current;
      if (pulseAge < 2500) { // Dentro del rango de 2.5 segundos
        activeEvent = 'FLOW_ACTIVE';
      }
    }

    // Si no hay evento activo (ni explícito ni FLOW_ACTIVE dentro del pulso), retornar null
    // Esto permite que la UI base ("NOW MOVING / X spots added") tome control
    if (!activeEvent) {
      return null;
    }

    let subtitle: FlowSubtitle | null = null;

    switch (activeEvent) {
      case 'FLOW_STARTED':
        subtitle = {
          id: 'subtitle-flow-started',
          moment: 'start',
          text: 'Your flow begins.',
          shortText: 'Your flow begins.',
          priority: 'primary',
          trigger: { event: 'FLOW_STARTED' },
        };
        break;

      case 'FLOW_ACTIVE':
        // FLOW_ACTIVE es estado pasivo - solo mostrar si no hay otros eventos
        subtitle = {
          id: 'subtitle-flow-active',
          moment: 'in_flow',
          text: 'Continue moving.',
          shortText: 'Continue moving.',
          priority: 'secondary',
          trigger: { event: 'FLOW_ACTIVE' },
        };
        break;

      case 'SPOT_PROXIMITY_ENTER': {
        // Obtener texto de Spot.narration (anticipation o presence)
        if (!currentSpot || !currentSpot.narration) {
          break;
        }

        const narration = currentSpot.narration;
        const currentBlock = flowState.currentNarrationBlock;
        
        // Determinar qué texto mostrar basado en currentNarrationBlock
        let text: string | undefined;
        if (currentBlock === 'anticipation' && narration.anticipation) {
          text = narration.anticipation;
        } else if (currentBlock === 'presence' && narration.presence) {
          text = narration.presence;
        } else {
          // Fallback: usar anticipation si está disponible, sino presence
          text = narration.anticipation || narration.presence;
        }

        if (text && text.trim().length > 0) {
          subtitle = {
            id: `subtitle-spot-proximity-${currentSpotId || 'unknown'}`,
            moment: 'near_spot',
            text,
            shortText: text.length > 60 ? text.substring(0, 60) + '...' : text,
            priority: 'primary',
            trigger: { event: 'SPOT_PROXIMITY_ENTER', condition: `spotId === ${currentSpotId}` },
          };
        }
        break;
      }

      case 'SPOT_COMPLETED': {
        // Obtener texto de Spot.narration.transition
        const spotId = currentEventData?.spotId || currentSpotId;
        const spotIndex = currentEventData?.spotIndex ?? flowState.currentSpotIndex;
        const spot = spotId ? getSpotById(spotId) : currentSpot;
        
        if (!spot || !spot.narration?.transition) {
          break;
        }

        const isLastSpot = spotIndex >= totalSpots - 1;
        const moment: FlowMoment = isLastSpot ? 'end' : 'transition';
        const text = spot.narration.transition;

        if (text && text.trim().length > 0) {
          subtitle = {
            id: `subtitle-spot-completed-${spotId || 'unknown'}`,
            moment,
            text,
            shortText: text.length > 60 ? text.substring(0, 60) + '...' : text,
            priority: 'primary',
            trigger: {
              event: 'SPOT_COMPLETED',
              condition: isLastSpot ? 'spotIndex >= totalSpots - 1' : 'spotIndex < totalSpots - 1',
            },
          };
        }
        break;
      }

      case 'FLOW_COMPLETED':
        subtitle = {
          id: 'subtitle-flow-completed',
          moment: 'end',
          text: "You've completed your flow.",
          shortText: 'Flow completed.',
          priority: 'primary',
          trigger: { event: 'FLOW_COMPLETED' },
        };
        break;
    }

    // Actualizar último subtítulo válido
    if (subtitle) {
      lastValidSubtitleRef.current = subtitle;
      return subtitle;
    }

    // Si no se generó subtítulo, retornar null (no último válido)
    // Esto permite que la UI base tome control cuando no hay eventos activos
    return null;
  }, [
    currentEvent,
    currentEventData,
    flowState.status,
    flowState.currentPathId,
    flowState.currentSpotIndex,
    flowState.currentNarrationBlock,
    currentSpotId,
    flowActivePulseActive, // Incluir estado del pulso para re-render cuando expire
    getFlowById,
    getSpotById,
  ]);

  return subtitle;
}
