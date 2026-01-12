/**
 * WorldSpotContext - Gestión de World Spots (Seeds Globales)
 * FASE 7: Integración de World Seeds
 * 
 * Los WorldSpots son lugares existentes en el mundo que los usuarios pueden
 * descubrir y convertir en sus propios spots al interactuar con ellos.
 * 
 * Características:
 * - Solo lectura (no se guardan en AsyncStorage)
 * - Cargados desde seedSpots.v1.2.json
 * - Se convierten en UserSpots cuando el usuario interactúa
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { Spot, SpotV1_2, SpotImage } from '@/data/spots';

/**
 * WorldSpot: Spot de solo lectura desde seeds globales
 * Extiende SpotV1_2 con flag isWorldSpot
 */
export interface WorldSpot extends SpotV1_2 {
  isWorldSpot: true; // Flag para identificar WorldSpots
}

/**
 * Normalizar WorldSpot desde datos del seed
 * Aplica normalización técnica: trim, validación de tipos, asegurar campos requeridos
 */
function normalizeWorldSpot(seed: any): WorldSpot | null {
  try {
    // Validar campos requeridos
    if (!seed.id || typeof seed.id !== 'string' || seed.id.trim().length === 0) {
      if (__DEV__) {
        console.warn('[WorldSpot] Spot sin ID válido:', seed);
      }
      return null;
    }

    if (!seed.name || typeof seed.name !== 'string' || seed.name.trim().length === 0) {
      if (__DEV__) {
        console.warn(`[WorldSpot] Spot ${seed.id} sin name válido`);
      }
      return null;
    }

    // Normalizar location
    const location = {
      lat: typeof seed.location?.lat === 'number' ? seed.location.lat : (seed.location?.latitude || 0),
      lng: typeof seed.location?.lng === 'number' ? seed.location.lng : (seed.location?.longitude || 0),
      ...(seed.location?.city && { city: String(seed.location.city).trim() }),
      ...(seed.location?.country && { country: String(seed.location.country).trim() }),
    };

    // Validar location
    if (isNaN(location.lat) || isNaN(location.lng) || location.lat === 0 || location.lng === 0) {
      if (__DEV__) {
        console.warn(`[WorldSpot] Spot ${seed.id} tiene location inválida`);
      }
      return null;
    }

    // Normalizar image
    let image: SpotImage;
    if (seed.image && seed.image.url && typeof seed.image.url === 'string') {
      image = {
        url: seed.image.url.trim(),
        ...(seed.image.source && { source: String(seed.image.source).trim() }),
        ...(seed.image.license && { license: String(seed.image.license).trim() }),
      };
    } else {
      // Fallback: intentar usar photos si existe (compatibilidad temporal)
      const photoUrl = Array.isArray(seed.photos) && seed.photos.length > 0 
        ? String(seed.photos[0]).trim() 
        : '';
      image = { url: photoUrl };
      
      if (!photoUrl && __DEV__) {
        console.warn(`[WorldSpot] Spot ${seed.id} no tiene imagen válida`);
      }
    }

    // Normalizar shortDescription (trim y validar)
    const shortDescription = seed.shortDescription 
      ? String(seed.shortDescription).trim() 
      : undefined;

    // Normalizar fechas
    const createdAt = seed.createdAt ? new Date(seed.createdAt) : new Date();
    const updatedAt = seed.updatedAt ? new Date(seed.updatedAt) : new Date();

    // Validar fechas
    if (isNaN(createdAt.getTime()) || isNaN(updatedAt.getTime())) {
      if (__DEV__) {
        console.warn(`[WorldSpot] Spot ${seed.id} tiene fechas inválidas`);
      }
      return null;
    }

    const normalized: WorldSpot = {
      id: seed.id.trim(),
      name: seed.name.trim(),
      type: seed.type || 'other',
      location,
      ...(shortDescription && shortDescription.length > 0 && { shortDescription }),
      image,
      hasGeneratedContent: Boolean(seed.hasGeneratedContent),
      createdAt,
      updatedAt,
      isWorldSpot: true as const,
    };

    return normalized;
  } catch (error) {
    if (__DEV__) {
      console.error(`[WorldSpot] Error normalizando spot ${seed.id}:`, error);
    }
    return null;
  }
}

interface WorldSpotContextType {
  worldSpots: WorldSpot[];
  isLoading: boolean;
  getWorldSpotById: (id: string) => WorldSpot | undefined;
  getWorldSpotsByType: (type: Spot['type']) => WorldSpot[];
  getWorldSpotsByCountry: (country: string) => WorldSpot[];
  searchWorldSpots: (query: string) => WorldSpot[];
  // Convertir WorldSpot a UserSpot (para cuando usuario interactúa)
  convertWorldSpotToUserSpot: (worldSpotId: string, userId: string) => Spot;
}

const WorldSpotContext = createContext<WorldSpotContextType | undefined>(undefined);

/**
 * Cargar y normalizar seeds desde JSON (lazy loading)
 * OPTIMIZACIÓN: Carga bajo demanda para evitar cargar datos innecesarios
 * 
 * Aplica validación y normalización a todos los spots del seed
 */
async function loadWorldSpots(): Promise<WorldSpot[]> {
  try {
    // Lazy import del JSON - solo se carga cuando se necesita
    const seedSpotsModule = await import('@/data/seedSpots.v1.2.json');
    const seedSpotsData = seedSpotsModule.default || seedSpotsModule;
    
    if (!Array.isArray(seedSpotsData)) {
      console.error('[WorldSpot] seedSpots.v1.2.json no es un array');
      return [];
    }

    if (__DEV__) {
      console.log(`[WorldSpot] Cargando ${seedSpotsData.length} spots desde seed...`);
    }

    // Normalizar y validar cada spot
    const normalizedSpots: WorldSpot[] = [];
    const invalidSpots: string[] = [];
    const spotsWithoutShortDesc: string[] = [];

    for (const seed of seedSpotsData) {
      const normalized = normalizeWorldSpot(seed);
      
      if (normalized) {
        normalizedSpots.push(normalized);
        
        // Detectar spots sin shortDescription para logging
        if (!normalized.shortDescription || normalized.shortDescription.trim().length === 0) {
          spotsWithoutShortDesc.push(normalized.id);
        }
      } else {
        invalidSpots.push(seed.id || 'unknown');
      }
    }

    // Logging para debugging
    if (__DEV__) {
      console.log(`[WorldSpot] ✅ Cargados ${normalizedSpots.length} spots válidos`);
      
      if (invalidSpots.length > 0) {
        console.warn(`[WorldSpot] ⚠️ ${invalidSpots.length} spots inválidos ignorados:`, invalidSpots);
      }
      
      if (spotsWithoutShortDesc.length > 0) {
        console.warn(`[WorldSpot] ⚠️ ${spotsWithoutShortDesc.length} spots sin shortDescription:`, spotsWithoutShortDesc);
      } else {
        console.log(`[WorldSpot] ✅ Todos los spots tienen shortDescription`);
      }
    }
    
    return normalizedSpots;
  } catch (error) {
    console.error('[WorldSpot] Error loading world spots:', error);
    return [];
  }
}

export function WorldSpotProvider({ children }: { children: ReactNode }) {
  const [worldSpots, setWorldSpots] = useState<WorldSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedRef = useRef(false);

  /**
   * OPTIMIZACIÓN: Carga asíncrona de WorldSpots
   * Usa dynamic import para no bloquear el render inicial
   * Mantiene compatibilidad con código existente
   */
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    loadWorldSpots()
      .then((loaded) => {
        setWorldSpots(loaded);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading world spots:', error);
        setWorldSpots([]);
        setIsLoading(false);
      });
  }, []);

  const getWorldSpotById = useCallback((id: string): WorldSpot | undefined => {
    return worldSpots.find((spot) => spot.id === id);
  }, [worldSpots]);

  const getWorldSpotsByType = useCallback((type: Spot['type']): WorldSpot[] => {
    return worldSpots.filter((spot) => spot.type === type);
  }, [worldSpots]);

  const getWorldSpotsByCountry = useCallback((country: string): WorldSpot[] => {
    return worldSpots.filter((spot) => spot.location.country === country);
  }, [worldSpots]);

  const searchWorldSpots = useCallback((query: string): WorldSpot[] => {
    const lowerQuery = query.toLowerCase();
    return worldSpots.filter(
      (spot) =>
        spot.name.toLowerCase().includes(lowerQuery) ||
        spot.location.city?.toLowerCase().includes(lowerQuery) ||
        spot.location.country?.toLowerCase().includes(lowerQuery) ||
        spot.shortDescription?.toLowerCase().includes(lowerQuery)
    );
  }, [worldSpots]);

  /**
   * Convertir WorldSpot a UserSpot
   * FASE 7: Cuando usuario interactúa con un WorldSpot, se clona y convierte en UserSpot
   * V1.2: Usa ID estable basado en userId + worldSpotId para evitar duplicados
   */
  const convertWorldSpotToUserSpot = (worldSpotId: string, userId: string): Spot => {
    const worldSpot = getWorldSpotById(worldSpotId);
    if (!worldSpot) {
      throw new Error(`WorldSpot with id ${worldSpotId} not found`);
    }

    // V1.2: ID estable para evitar duplicados: user-{userId}-{worldSpotId}
    const userSpotId = `user-${userId}-${worldSpotId}`;

    // Clonar WorldSpot y convertir a Spot (eliminando isWorldSpot)
    const userSpot: Spot = {
      id: userSpotId,
      name: worldSpot.name,
      type: worldSpot.type,
      location: worldSpot.location,
      shortDescription: worldSpot.shortDescription,
      image: worldSpot.image,
      hasGeneratedContent: worldSpot.hasGeneratedContent,
      originWorldSpotId: worldSpotId, // FASE 7: Vincular User Spot → World Spot original
      createdBy: userId, // V1.2: Asignar ownership al usuario
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return userSpot;
  };

  return (
    <WorldSpotContext.Provider
      value={{
        worldSpots,
        isLoading,
        getWorldSpotById,
        getWorldSpotsByType,
        getWorldSpotsByCountry,
        searchWorldSpots,
        convertWorldSpotToUserSpot,
      }}
    >
      {children}
    </WorldSpotContext.Provider>
  );
}

export function useWorldSpots() {
  const context = useContext(WorldSpotContext);
  if (context === undefined) {
    throw new Error('useWorldSpots must be used within a WorldSpotProvider');
  }
  return context;
}
