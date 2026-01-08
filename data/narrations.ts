/**
 * Modelo de Datos - Narrations
 * Scope 6: Mock data de narrations para desarrollo
 * 
 * Tipos de narration según definición:
 * - anticipation: Se activa antes de llegar al Spot
 * - presence: Se activa al llegar al Spot
 * - transition: Se activa al salir del Spot
 * - context: Aparece entre Spots (contexto de Path)
 */

import { Narration, NarrationType } from '@/contexts/NarrationContext';

/**
 * Narrations de ejemplo para desarrollo
 * En producción, estas vendrían de una API o base de datos
 */
export const mockNarrations: Narration[] = [
  // Anticipation - Activates before arriving
  {
    id: 'narration-1',
    spotId: '1',
    type: 'anticipation',
    text: 'As you approach, the sound of the ocean becomes more present.',
    duration: 8,
  },
  {
    id: 'narration-2',
    spotId: '1',
    type: 'anticipation',
    text: 'The sea breeze announces the proximity of the beach.',
    duration: 6,
  },
  // Presence - Activates upon arrival
  {
    id: 'narration-3',
    spotId: '1',
    type: 'presence',
    text: 'You are here. The horizon stretches infinitely. Breathe.',
    duration: 10,
  },
  {
    id: 'narration-4',
    spotId: '1',
    type: 'presence',
    text: 'This place has witnessed countless sunsets.',
    duration: 8,
  },
  // Transition - Activates when leaving
  {
    id: 'narration-5',
    spotId: '1',
    type: 'transition',
    text: 'Carry this moment with you. The next place awaits.',
    duration: 7,
  },
  // Context - Between Spots (Path context)
  {
    id: 'narration-6',
    pathId: 'path-1',
    type: 'context',
    text: 'The coastal path connects these places like points on an emotional map.',
    duration: 9,
  },
  {
    id: 'narration-7',
    pathId: 'path-1',
    type: 'context',
    text: 'Each step brings you closer to discovering more of this place.',
    duration: 6,
  },
];

/**
 * Helper para obtener narrations por Spot ID
 */
export function getNarrationsBySpotId(spotId: string): Narration[] {
  return mockNarrations.filter((narration) => narration.spotId === spotId);
}

/**
 * Helper para obtener narrations por Path ID
 */
export function getNarrationsByPathId(pathId: string): Narration[] {
  return mockNarrations.filter((narration) => narration.pathId === pathId);
}

/**
 * Helper para obtener narrations por tipo
 */
export function getNarrationsByType(type: NarrationType): Narration[] {
  return mockNarrations.filter((narration) => narration.type === type);
}

/**
 * Helper para obtener una narration aleatoria de un tipo específico para un Spot
 */
export function getRandomNarrationBySpotAndType(
  spotId: string,
  type: NarrationType
): Narration | null {
  const narrations = mockNarrations.filter(
    (narration) => narration.spotId === spotId && narration.type === type
  );
  if (narrations.length === 0) return null;
  return narrations[Math.floor(Math.random() * narrations.length)];
}

/**
 * Helper para obtener una narration aleatoria de tipo context para un Path
 */
export function getRandomPathContextNarration(pathId: string): Narration | null {
  const narrations = mockNarrations.filter(
    (narration) => narration.pathId === pathId && narration.type === 'context'
  );
  if (narrations.length === 0) return null;
  return narrations[Math.floor(Math.random() * narrations.length)];
}

