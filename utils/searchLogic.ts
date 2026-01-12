/**
 * Search Logic - Búsqueda contextual de Spots y Paths
 * Scope 10: Search Screen - Lógica de búsqueda
 * 
 * Funcionalidades:
 * - Búsqueda por nombre de Spot
 * - Búsqueda en Paths que contienen Spots relacionados
 * - Filtrado por cercanía (preparación para geolocalización futura)
 * - Ranking de resultados por relevancia
 */

import { Spot } from '@/data/spots';
import { Path, getPathSpots } from '@/data/paths';
import { UnifiedSpot } from '@/utils/worldSpotHelpers';

export interface SearchResult {
  type: 'spot' | 'path';
  spot?: Spot;
  path?: Path;
  relevanceScore: number;
  distance?: number; // En metros (opcional, para futuro geolocalización)
}

/**
 * Buscar texto en nombre o descripción (case-insensitive, parcial)
 */
function matchesText(text: string, searchQuery: string): boolean {
  const normalizedText = text.toLowerCase().trim();
  const normalizedQuery = searchQuery.toLowerCase().trim();
  
  if (normalizedQuery.length === 0) {
    return false;
  }
  
  return normalizedText.includes(normalizedQuery);
}

/**
 * Calcular score de relevancia para un Spot
 * FASE 7: Acepta UnifiedSpot (UserSpot | WorldSpot)
 */
function calculateSpotRelevance(spot: UnifiedSpot, query: string): number {
  let score = 0;
  const normalizedQuery = query.toLowerCase().trim();
  let hasMatch = false;
  
  // Coincidencia exacta en nombre (mayor peso)
  if (spot.name && spot.name.toLowerCase() === normalizedQuery) {
    score += 100;
    hasMatch = true;
  }
  // Coincidencia parcial en nombre (peso alto)
  else if (spot.name && spot.name.toLowerCase().includes(normalizedQuery)) {
    score += 50;
    hasMatch = true;
    // Bonus si empieza con el query
    if (spot.name.toLowerCase().startsWith(normalizedQuery)) {
      score += 20;
    }
  }
  
  // Coincidencia en descripción (peso medio)
  if (spot.description && matchesText(spot.description, query)) {
    score += 20;
    hasMatch = true;
  }
  
  // Solo aplicar bonos si hay una coincidencia real
  if (hasMatch) {
    // Bonus si tiene nombre (spots completos tienen más peso)
    if (spot.name) {
      score += 5;
    }
    
    // Bonus si tiene fotos
    if (spot.photos && spot.photos.length > 0) {
      score += 3;
    }
  }
  
  return score;
}

/**
 * Buscar Spots
 * FASE 7: Acepta UnifiedSpot[] (UserSpots + WorldSpots)
 */
export function searchSpots(
  spots: UnifiedSpot[],
  query: string,
  limit: number = 20
): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const results: SearchResult[] = spots
    .map((spot) => ({
      type: 'spot' as const,
      spot,
      relevanceScore: calculateSpotRelevance(spot, query),
    }))
    .filter((result) => result.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
  
  return results;
}

/**
 * Buscar Paths que contienen Spots relacionados
 * FASE 7: Acepta UnifiedSpot[] (UserSpots + WorldSpots)
 */
export function searchPaths(
  paths: Path[],
  allSpots: UnifiedSpot[],
  query: string,
  limit: number = 10
): SearchResult[] {
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const results: SearchResult[] = paths
    .map((path) => {
      const pathSpots = getPathSpots(path, allSpots);
      
      // Calcular score basado en cuántos spots del path coinciden
      let relevanceScore = 0;
      
      // Coincidencia en título del path
      if (matchesText(path.title, query)) {
        relevanceScore += 50;
      }
      
      // Coincidencia en descripción del path
      if (path.description && matchesText(path.description, query)) {
        relevanceScore += 30;
      }
      
      // Coincidencias en spots del path
      const matchingSpots = pathSpots.filter((spot) => {
        const spotScore = calculateSpotRelevance(spot, query);
        return spotScore > 0;
      });
      
      // Bonus por cada spot que coincide
      relevanceScore += matchingSpots.length * 10;
      
      // Bonus si el path tiene muchos spots que coinciden
      if (matchingSpots.length === pathSpots.length) {
        relevanceScore += 20; // Todos los spots coinciden
      }
      
      return {
        type: 'path' as const,
        path,
        relevanceScore,
      };
    })
    .filter((result) => result.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
  
  return results;
}

/**
 * Búsqueda completa (Spots + Paths)
 * FASE 7: Acepta UnifiedSpot[] (UserSpots + WorldSpots)
 */
export function searchAll(
  spots: UnifiedSpot[],
  paths: Path[],
  query: string,
  options: {
    spotLimit?: number;
    pathLimit?: number;
  } = {}
): {
  spots: SearchResult[];
  paths: SearchResult[];
} {
  const { spotLimit = 20, pathLimit = 10 } = options;
  
  return {
    spots: searchSpots(spots, query, spotLimit),
    paths: searchPaths(paths, spots, query, pathLimit),
  };
}

/**
 * Generar sugerencias mientras el usuario escribe
 */
export function getSuggestions(
  spots: Spot[],
  paths: Path[],
  query: string,
  limit: number = 5
): Array<{ type: 'spot' | 'path'; id: string; name: string }> {
  if (!query || query.trim().length < 2) {
    return [];
  }
  
  const suggestions: Array<{ type: 'spot' | 'path'; id: string; name: string }> = [];
  
  // Sugerencias de Spots con nombres similares
  const spotSuggestions = spots
    .filter((spot) => spot.name && matchesText(spot.name, query))
    .slice(0, limit)
    .map((spot) => ({
      type: 'spot' as const,
      id: spot.id,
      name: spot.name || 'Sin nombre',
    }));
  
  suggestions.push(...spotSuggestions);
  
  // Sugerencias de Paths con títulos similares
  const pathSuggestions = paths
    .filter((path) => matchesText(path.title, query))
    .slice(0, limit - spotSuggestions.length)
    .map((path) => ({
      type: 'path' as const,
      id: path.id,
      name: path.title,
    }));
  
  suggestions.push(...pathSuggestions);
  
  return suggestions.slice(0, limit);
}

