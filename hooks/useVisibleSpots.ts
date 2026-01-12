/**
 * Hook para filtrar spots visibles en el viewport del mapa
 * Implementa lazy loading: solo renderiza pines visibles + buffer
 */

import { useMemo, useState, useCallback } from 'react';
import { Spot } from '@/data/spots';

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface UseVisibleSpotsOptions {
  buffer?: number; // Porcentaje de buffer más allá del viewport (default: 0.2 = 20%)
  minSpots?: number; // Mínimo de spots a mostrar incluso si están fuera del viewport (default: 50)
}

/**
 * Filtra spots basado en viewport bounds
 */
function isSpotInBounds(
  spot: Spot,
  bounds: ViewportBounds,
  buffer: number = 0.2
): boolean {
  const loc = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number };
  const lat = 'lat' in loc && loc.lat !== undefined ? loc.lat : (loc.latitude ?? 0);
  const lng = 'lng' in loc && loc.lng !== undefined ? loc.lng : (loc.longitude ?? 0);
  
  // Calcular buffer en grados
  const latBuffer = (bounds.north - bounds.south) * buffer;
  const lngBuffer = (bounds.east - bounds.west) * buffer;
  
  // Verificar si el spot está dentro del bounds + buffer
  return (
    lat >= bounds.south - latBuffer &&
    lat <= bounds.north + latBuffer &&
    lng >= bounds.west - lngBuffer &&
    lng <= bounds.east + lngBuffer
  );
}

/**
 * Hook para obtener spots visibles en el viewport
 */
export function useVisibleSpots(
  allSpots: Spot[],
  viewportBounds: ViewportBounds | null,
  options: UseVisibleSpotsOptions = {}
) {
  const { buffer = 0.2, minSpots = 50 } = options;
  
  const visibleSpots = useMemo(() => {
    // Si no hay viewport bounds, mostrar todos los spots (fallback)
    if (!viewportBounds) {
      return allSpots;
    }
    
    // Filtrar spots visibles
    const filtered = allSpots.filter(spot => 
      isSpotInBounds(spot, viewportBounds, buffer)
    );
    
    // Asegurar mínimo de spots para evitar mapa vacío
    if (filtered.length < minSpots && allSpots.length > minSpots) {
      // Si hay pocos spots visibles, incluir los más cercanos al centro del viewport
      const centerLat = (viewportBounds.north + viewportBounds.south) / 2;
      const centerLng = (viewportBounds.east + viewportBounds.west) / 2;
      
      const spotsWithDistance = allSpots.map(spot => {
        const loc = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number };
        const lat = 'lat' in loc && loc.lat !== undefined ? loc.lat : (loc.latitude ?? 0);
        const lng = 'lng' in loc && loc.lng !== undefined ? loc.lng : (loc.longitude ?? 0);
        
        // Calcular distancia al centro del viewport
        const R = 6371; // Radio de la Tierra en km
        const dLat = ((lat - centerLat) * Math.PI) / 180;
        const dLon = ((lng - centerLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((centerLat * Math.PI) / 180) *
            Math.cos((lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return { spot, distance };
      });
      
      // Ordenar por distancia y tomar los más cercanos
      return spotsWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, minSpots)
        .map(item => item.spot);
    }
    
    return filtered;
  }, [allSpots, viewportBounds, buffer, minSpots]);
  
  return visibleSpots;
}
