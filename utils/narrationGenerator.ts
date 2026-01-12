/**
 * Narration Generator
 * Scope 12.1: Sistema de narrativas híbrido con prioridades
 * 
 * Genera texto de narration basándose en sistema de prioridades:
 * 1. narration específico del spot (si existe)
 * 2. Fallback: culturalContext
 * 3. Fallback: description/whyItMatters
 * 4. Fallback: narrativa genérica por tipo de spot
 */

import { Spot, SpotType } from '@/data/spots';
import { NarrationType } from '@/contexts/NarrationContext';

/**
 * Obtener narrativa genérica por tipo de spot
 */
function getGenericNarration(type: SpotType, narrationType: NarrationType): string {
  const genericNarrations: Record<SpotType, Record<NarrationType, string>> = {
    beach: {
      anticipation: 'A beach awaits you. The sound of the sea draws near.',
      presence: 'You are here. The ocean breathes with you.',
      transition: 'The sea remains behind. The journey continues.',
      context: 'The beach connects moments of pause and reflection.',
    },
    cafe: {
      anticipation: 'A place to pause. The aroma of coffee approaches.',
      presence: 'Take a moment. This place invites calm.',
      transition: 'With renewed energy, the journey continues.',
      context: 'Cafés are spaces of connection and rest.',
    },
    viewpoint: {
      anticipation: 'A view approaches. Prepare to contemplate.',
      presence: 'Look around. This place offers perspective.',
      transition: 'With the view in your heart, you move forward.',
      context: 'Viewpoints offer moments of clarity.',
    },
    museum: {
      anticipation: 'A space of culture awaits you. History approaches.',
      presence: 'You are here. Each object tells a story.',
      transition: 'With new knowledge, the journey continues.',
      context: 'Museums preserve stories across time.',
    },
    restaurant: {
      anticipation: 'A place to savor. The aromas draw near.',
      presence: 'Enjoy this moment. Food connects cultures.',
      transition: 'With a satisfied stomach, you move forward.',
      context: 'Restaurants are spaces of nourishment and gathering.',
    },
    park: {
      anticipation: 'A green space approaches. Nature awaits you.',
      presence: 'Breathe. This place invites tranquility.',
      transition: 'With renewed calm, the journey continues.',
      context: 'Parks offer respite in the urban landscape.',
    },
    monument: {
      anticipation: 'A historical monument approaches. Memory awaits you.',
      presence: 'You are here. This place holds important stories.',
      transition: 'With respect for the past, you move forward.',
      context: 'Monuments mark moments that shaped place.',
    },
    market: {
      anticipation: 'A vibrant market approaches. Local life awaits you.',
      presence: 'Observe. This place pulses with local energy.',
      transition: 'With new experiences, the journey continues.',
      context: 'Markets are the heart of local life.',
    },
    other: {
      anticipation: 'A special place approaches.',
      presence: 'You are here. Observe and feel this moment.',
      transition: 'With this experience, the journey continues.',
      context: 'Every place tells its own story.',
    },
  };

  return genericNarrations[type]?.[narrationType] || genericNarrations.other[narrationType];
}

/**
 * Adaptar contexto cultural a tipo de narration
 */
function adaptContextToNarrationType(
  culturalContext: string,
  narrationType: NarrationType
): string {
  // Para anticipation, agregar prefijo de acercamiento
  if (narrationType === 'anticipation') {
    return `As you approach: ${culturalContext}`;
  }
  
  // Para presence, usar directamente
  if (narrationType === 'presence') {
    return culturalContext;
  }
  
  // Para transition, agregar prefijo de despedida
  if (narrationType === 'transition') {
    return `As you leave: ${culturalContext}`;
  }
  
  // Para context, usar directamente (narration de Path, no de Spot)
  if (narrationType === 'context') {
    return culturalContext;
  }
  
  return culturalContext;
}

/**
 * Adaptar descripción a tipo de narration
 */
function adaptDescriptionToNarrationType(
  description: string,
  narrationType: NarrationType
): string {
  // Para anticipation, crear expectativa
  if (narrationType === 'anticipation') {
    return `Soon you will be at: ${description}`;
  }
  
  // Para presence, usar directamente
  if (narrationType === 'presence') {
    return description;
  }
  
  // Para transition, crear despedida
  if (narrationType === 'transition') {
    return `Leaving behind: ${description}`;
  }
  
  // Para context, usar directamente (narration de Path, no de Spot)
  if (narrationType === 'context') {
    return description;
  }
  
  return description;
}

/**
 * Generar texto de narration basándose en sistema de prioridades
 */
export function generateNarrationText(
  spot: Spot,
  narrationType: NarrationType
): string | null {
  // FASE 3: Prioridad 1 eliminada - spot.narration eliminado del modelo Spot
  // Las narrativas de Flow se manejan a través de NarrationContext, no del modelo Spot

  // Prioridad 1 (ahora Prioridad 2): culturalContext
  if (spot.culturalContext && spot.culturalContext.trim().length > 0) {
    return adaptContextToNarrationType(spot.culturalContext, narrationType);
  }

  // Prioridad 3: description o whyItMatters
  const description = spot.whyItMatters || spot.description;
  if (description && description.trim().length > 0) {
    return adaptDescriptionToNarrationType(description, narrationType);
  }

  // Prioridad 4: narrativa genérica por tipo de spot
  return getGenericNarration(spot.type, narrationType);
}

