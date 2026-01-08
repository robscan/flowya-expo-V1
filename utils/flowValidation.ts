/**
 * Flow Validation Utilities
 * Utilidades para validar la completitud de flows
 */

import { Flow, getFlowSpots } from '@/data/flows';
import { Spot } from '@/data/spots';

/**
 * Criterios para considerar un flow completo:
 * - Mínimo de 3 spots
 * - Todos los spots deben tener datos básicos (nombre, ubicación)
 * - El flow debe tener título y descripción
 */
export function isFlowComplete(flow: Flow, allSpots: Spot[]): boolean {
  // Verificar que el flow tenga título
  if (!flow.title || flow.title.trim().length === 0) {
    return false;
  }

  // Verificar que el flow tenga descripción
  if (!flow.description || flow.description.trim().length === 0) {
    return false;
  }

  // Verificar que tenga mínimo 3 spots
  if (flow.spots.length < 3) {
    return false;
  }

  // Verificar que todos los spots tengan datos básicos
  const flowSpots = getFlowSpots(flow, allSpots);
  
  // Verificar que todos los spots existan y tengan nombre y ubicación
  if (flowSpots.length !== flow.spots.length) {
    // Algunos spots no existen en la lista de spots
    return false;
  }

  // Verificar que todos los spots tengan nombre y ubicación válida
  for (const spot of flowSpots) {
    if (!spot.name || spot.name.trim().length === 0) {
      return false;
    }
    if (!spot.location || typeof spot.location.latitude !== 'number' || typeof spot.location.longitude !== 'number') {
      return false;
    }
  }

  return true;
}

/**
 * Obtener el nivel de completitud de un flow (0-100)
 */
export function getFlowCompleteness(flow: Flow, allSpots: Spot[]): number {
  let score = 0;
  const maxScore = 100;

  // Título (20 puntos)
  if (flow.title && flow.title.trim().length > 0) {
    score += 20;
  }

  // Descripción (20 puntos)
  if (flow.description && flow.description.trim().length > 0) {
    score += 20;
  }

  // Número de spots (30 puntos)
  // 3+ spots = 30 puntos, 2 spots = 20 puntos, 1 spot = 10 puntos, 0 spots = 0 puntos
  if (flow.spots.length >= 3) {
    score += 30;
  } else if (flow.spots.length === 2) {
    score += 20;
  } else if (flow.spots.length === 1) {
    score += 10;
  }

  // Spots con datos completos (30 puntos)
  const flowSpots = getFlowSpots(flow, allSpots);
  if (flowSpots.length > 0) {
    const spotsWithCompleteData = flowSpots.filter(
      (spot) =>
        spot.name &&
        spot.name.trim().length > 0 &&
        spot.location &&
        typeof spot.location.latitude === 'number' &&
        typeof spot.location.longitude === 'number'
    );
    const completenessRatio = spotsWithCompleteData.length / flowSpots.length;
    score += Math.round(30 * completenessRatio);
  }

  return Math.min(score, maxScore);
}

