/**
 * Flow Event Emitter - Sistema centralizado de eventos del Flow
 * FLOWYA V1.1 - P0-08
 * 
 * Funcionalidades:
 * - Sistema centralizado de eventos explícitos
 * - Listeners para eventos
 * - Lógica de prioridad de eventos
 * - Integración con FlowContext
 */

import { FlowEvent } from '@/types/flowSubtitle';

/**
 * Callback para eventos del Flow
 */
export type FlowEventHandler = (event: FlowEvent, data?: FlowEventData) => void;

/**
 * Datos adicionales asociados con eventos
 */
export interface FlowEventData {
  spotId?: string;
  spotIndex?: number;
  totalSpots?: number;
  [key: string]: unknown;
}

/**
 * Prioridades de eventos (mayor número = mayor prioridad)
 * Regla: Solo un evento puede renderizar texto a la vez. Eventos de mayor prioridad sobrescriben eventos de menor prioridad.
 */
const EVENT_PRIORITY: Record<FlowEvent, number> = {
  FLOW_COMPLETED: 5,        // Máxima prioridad - siempre muestra "end"
  SPOT_PROXIMITY_ENTER: 4,  // Alta prioridad - muestra "near_spot"
  SPOT_COMPLETED: 3,        // Media-alta prioridad - muestra "transition" o "end"
  FLOW_STARTED: 2,          // Media prioridad - muestra "start"
  FLOW_ACTIVE: 1,           // Baja prioridad - muestra "in_flow" solo si no hay otros eventos
};

/**
 * Eventos one-shot (solo se emiten una vez)
 */
const ONE_SHOT_EVENTS: FlowEvent[] = [
  'FLOW_STARTED',
  'FLOW_COMPLETED',
];

class FlowEventEmitter {
  private listeners: Map<FlowEvent, Set<FlowEventHandler>> = new Map();
  private currentEvent: FlowEvent | null = null;
  private currentPriority: number = 0;
  private emittedOneShots: Set<FlowEvent> = new Set();
  private spotProximityEnteredSet: Set<string> = new Set(); // Para SPOT_PROXIMITY_ENTER (one-shot por spot)

  /**
   * Registrar listener para un evento
   * @returns Función para remover el listener
   */
  on(event: FlowEvent, handler: FlowEventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Retornar función para remover
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  /**
   * Remover listener para un evento
   */
  off(event: FlowEvent, handler: FlowEventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  /**
   * Emitir un evento
   * Aplica reglas de prioridad y eventos one-shot
   */
  emit(event: FlowEvent, data?: FlowEventData): void {
    // Verificar si es evento one-shot y ya se emitió
    if (ONE_SHOT_EVENTS.includes(event)) {
      if (this.emittedOneShots.has(event)) {
        // Ya se emitió, no emitir de nuevo
        return;
      }
      this.emittedOneShots.add(event);
    }

    // SPOT_PROXIMITY_ENTER es one-shot por spotId
    if (event === 'SPOT_PROXIMITY_ENTER' && data?.spotId) {
      if (this.spotProximityEnteredSet.has(data.spotId)) {
        // Ya se emitió para este spotId, no emitir de nuevo
        return;
      }
      this.spotProximityEnteredSet.add(data.spotId);
    }

    // Aplicar regla de prioridad
    const priority = EVENT_PRIORITY[event];
    if (priority < this.currentPriority) {
      // Evento de menor prioridad, no emitir (evento actual de mayor prioridad ya está activo)
      return;
    }

    // Actualizar evento actual y prioridad
    this.currentEvent = event;
    this.currentPriority = priority;

    // Notificar a todos los listeners
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(event, data);
        } catch (error) {
          console.error(`[FlowEventEmitter] Error in handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Limpiar evento actual (cuando evento de mayor prioridad termina)
   * Permite que eventos de menor prioridad se emitan nuevamente
   */
  clearCurrentEvent(): void {
    this.currentEvent = null;
    this.currentPriority = 0;
  }

  /**
   * Resetear eventos one-shot emitidos (útil para reiniciar Flow)
   */
  resetOneShots(): void {
    this.emittedOneShots.clear();
    this.spotProximityEnteredSet.clear();
  }

  /**
   * Obtener evento actual
   */
  getCurrentEvent(): FlowEvent | null {
    return this.currentEvent;
  }

  /**
   * Obtener prioridad actual
   */
  getCurrentPriority(): number {
    return this.currentPriority;
  }
}

// Singleton instance
export const flowEventEmitter = new FlowEventEmitter();
