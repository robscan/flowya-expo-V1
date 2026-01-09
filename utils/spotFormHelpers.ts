/**
 * spotFormHelpers - Utilidades compartidas para formularios de spots
 * CANONICAL: Funciones helper reutilizables para creación y edición de spots
 */

import { SpotType } from '@/data/spots';

/**
 * Obtener label legible de tipo de spot
 */
export function getSpotTypeLabel(type: SpotType): string {
  const labels: Record<SpotType, string> = {
    beach: 'Beach',
    cafe: 'Café',
    viewpoint: 'Viewpoint',
    museum: 'Museum',
    restaurant: 'Restaurant',
    park: 'Park',
    monument: 'Monument',
    market: 'Market',
    other: 'Other',
  };
  return labels[type] || 'Other';
}

/**
 * Tipos de spot disponibles
 */
export const SPOT_TYPES: SpotType[] = [
  'beach',
  'cafe',
  'viewpoint',
  'museum',
  'restaurant',
  'park',
  'monument',
  'market',
  'other',
];

/**
 * Formatear horarios para visualización
 */
export function formatHours(hours?: {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}): string | null {
  if (!hours) return null;
  const days = Object.entries(hours)
    .filter(([_, value]) => value)
    .map(([day, value]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${value}`)
    .join(', ');
  return days || null;
}

/**
 * Formatear costo para visualización
 */
export function formatCost(cost?: {
  currency: string;
  amount: number;
  description?: string;
}): string | null {
  if (!cost) return null;
  return cost.description || `${cost.amount} ${cost.currency}`;
}
