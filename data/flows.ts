/**
 * Modelo de Datos - Flows
 * Scope 1.2: Tipo Flow según definición de producto
 * 
 * Campos según definición:
 * - título (sugerido por sistema, editable)
 * - descripción breve (generada automáticamente, editable opcional)
 * - duración estimada
 * - modo de movimiento (walking, bike, car)
 * - lista de Spots (orden)
 * - metadata para inferencia
 */

import { Spot } from './spots';

export type MovementMode = 'walking' | 'bike' | 'car';

export type FlowRunStatus = 'idle' | 'active' | 'paused';

export type NarrationBlock = 'anticipation' | 'presence' | 'transition';

export interface FlowMetadata {
  inferredFrom?: string[]; // IDs de spots que generaron este flow
  suggestedAt?: Date;
  acceptedAt?: Date;
  editedAt?: Date;
  usageCount?: number;
}

export interface Flow {
  id: string;
  title: string; // Sugerido por sistema, editable
  description?: string; // Generada automáticamente, editable opcional
  estimatedDuration: number; // En minutos
  movementMode: MovementMode;
  spots: string[]; // Array de Spot IDs en orden
  metadata?: FlowMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * FlowRun - Ejecucion viva de un Flow
 */
export interface FlowRun {
  status: FlowRunStatus;
  flowId: string | null;
  currentSpotIndex: number;
  currentNarrationBlock: NarrationBlock | null;
  startedAt: Date | null;
  pausedAt: Date | null;
  isMinimized: boolean;
}

/**
 * Helper para obtener los objetos Spot completos de un Flow
 */
export function getFlowSpots(flow: Flow, allSpots: Spot[]): Spot[] {
  return flow.spots
    .map((spotId) => allSpots.find((spot) => spot.id === spotId))
    .filter((spot): spot is Spot => spot !== undefined);
}

/**
 * Calcular duración estimada basada en spots y modo de movimiento
 */
export function calculateEstimatedDuration(
  spotCount: number,
  movementMode: MovementMode
): number {
  // Valores aproximados en minutos
  const baseTimePerSpot = 15; // Tiempo promedio por spot
  const travelTimeMultiplier = {
    walking: 10, // minutos entre spots caminando
    bike: 5, // minutos entre spots en bicicleta
    car: 3, // minutos entre spots en auto
  };

  const spotTime = spotCount * baseTimePerSpot;
  const travelTime = (spotCount - 1) * travelTimeMultiplier[movementMode];

  return spotTime + travelTime;
}

/**
 * Datos de ejemplo para desarrollo
 * TODO: Reemplazar con datos reales o API
 */
export const mockFlows: Flow[] = [
  {
    id: 'flow-1',
    title: 'Ruta por el Centro Histórico',
    description: 'Recorrido por los principales puntos históricos y culturales',
    estimatedDuration: calculateEstimatedDuration(4, 'walking'),
    movementMode: 'walking',
    spots: ['spot-4', 'spot-7', 'spot-8', 'spot-5'],
    metadata: {
      suggestedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'flow-2',
    title: 'Tour de Playa y Vista',
    description: 'Disfruta de la playa y las mejores vistas de la ciudad',
    estimatedDuration: calculateEstimatedDuration(3, 'walking'),
    movementMode: 'walking',
    spots: ['spot-1', 'spot-2', 'spot-5'],
    metadata: {
      suggestedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'flow-3',
    title: 'Gastronomía y Cultura',
    description: 'Combina buena comida con experiencias culturales',
    estimatedDuration: calculateEstimatedDuration(3, 'walking'),
    movementMode: 'walking',
    spots: ['spot-6', 'spot-4', 'spot-3'],
    metadata: {
      suggestedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

