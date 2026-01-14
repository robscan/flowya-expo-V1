/**
 * SpotMediaContext - Gestión de contribuciones de media a World Spots
 * 
 * Permite que usuarios autenticados agreguen imágenes a World Spots
 * sin requerir pin ni crear User Spot.
 * 
 * Características:
 * - NO modifica World Spots
 * - NO crea User Spots
 * - NO requiere pin
 * - Solo requiere autenticación
 */

import React, { createContext, ReactNode, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from './AuthContext';

export interface SpotMedia {
  id: string;
  spot_id: string;
  user_id: string | null;
  media_url: string;
  media_type: 'image' | 'video';
  source_type: 'real' | 'stock';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface SpotMediaContextType {
  // Estado
  spotMediaMap: Map<string, SpotMedia[]>; // spot_id -> SpotMedia[]
  isLoading: boolean;
  
  // Funciones
  addSpotMedia: (spotId: string, mediaUrl: string) => Promise<SpotMedia | null>;
  getSpotMedia: (spotId: string) => SpotMedia[];
  getApprovedSpotMedia: (spotId: string) => SpotMedia[];
  removeSpotMedia: (mediaId: string) => Promise<boolean>;
  refreshSpotMedia: (spotId?: string) => Promise<void>;
}

const SpotMediaContext = createContext<SpotMediaContextType | undefined>(undefined);

export function SpotMediaProvider({ children }: { children: ReactNode }) {
  const [spotMediaMap, setSpotMediaMap] = useState<Map<string, SpotMedia[]>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  /**
   * Cargar media aprobada para un spot específico
   */
  const loadSpotMedia = useCallback(async (spotId: string): Promise<void> => {
    if (!supabase) {
      if (__DEV__) {
        console.warn('[SpotMedia] Supabase client no disponible');
      }
      return;
    }

    try {
      // Cargar media aprobada (visible para todos)
      const { data: approvedMedia, error: approvedError } = await supabase
        .from('spot_media')
        .select('*')
        .eq('spot_id', spotId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (approvedError) {
        if (__DEV__) {
          console.warn(`[SpotMedia] Error cargando media aprobada para ${spotId}:`, approvedError);
        }
        return;
      }

      // Si el usuario está autenticado, también cargar su propia media pendiente
      let pendingMedia: SpotMedia[] = [];
      if (isAuthenticated && user?.id) {
        const { data: userPendingMedia, error: pendingError } = await supabase
          .from('spot_media')
          .select('*')
          .eq('spot_id', spotId)
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (!pendingError && userPendingMedia) {
          pendingMedia = userPendingMedia as SpotMedia[];
        }
      }

      // Combinar media aprobada + media pendiente del usuario
      const allMedia = [...(approvedMedia || []), ...pendingMedia];

      setSpotMediaMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(spotId, allMedia);
        return newMap;
      });
    } catch (error) {
      if (__DEV__) {
        console.error(`[SpotMedia] Error cargando media para ${spotId}:`, error);
      }
    }
  }, [isAuthenticated, user?.id]);

  /**
   * Agregar media a un spot
   * Requiere autenticación, NO requiere pin
   */
  const addSpotMedia = useCallback(async (spotId: string, mediaUrl: string): Promise<SpotMedia | null> => {
    if (!isAuthenticated || !user?.id) {
      if (__DEV__) {
        console.warn('[SpotMedia] Usuario no autenticado, no se puede agregar media');
      }
      return null;
    }

    if (!supabase) {
      if (__DEV__) {
        console.warn('[SpotMedia] Supabase client no disponible');
      }
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('spot_media')
        .insert({
          spot_id: spotId,
          user_id: user.id,
          media_url: mediaUrl,
          media_type: 'image',
          source_type: 'real',
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        if (__DEV__) {
          console.error('[SpotMedia] Error agregando media:', error);
        }
        return null;
      }

      const newMedia = data as SpotMedia;

      // Actualizar estado local
      setSpotMediaMap((prev) => {
        const newMap = new Map(prev);
        const existingMedia = newMap.get(spotId) || [];
        newMap.set(spotId, [newMedia, ...existingMedia]);
        return newMap;
      });

      if (__DEV__) {
        console.log(`[SpotMedia] Media agregada para spot ${spotId}`);
      }

      return newMedia;
    } catch (error) {
      if (__DEV__) {
        console.error('[SpotMedia] Error agregando media:', error);
      }
      return null;
    }
  }, [isAuthenticated, user?.id]);

  /**
   * Obtener toda la media de un spot (aprobada + pendiente propia)
   */
  const getSpotMedia = useCallback((spotId: string): SpotMedia[] => {
    return spotMediaMap.get(spotId) || [];
  }, [spotMediaMap]);

  /**
   * Obtener solo media aprobada de un spot
   */
  const getApprovedSpotMedia = useCallback((spotId: string): SpotMedia[] => {
    const allMedia = spotMediaMap.get(spotId) || [];
    return allMedia.filter(media => media.status === 'approved');
  }, [spotMediaMap]);

  /**
   * Eliminar media propia (solo si está pendiente)
   */
  const removeSpotMedia = useCallback(async (mediaId: string): Promise<boolean> => {
    if (!isAuthenticated || !user?.id) {
      if (__DEV__) {
        console.warn('[SpotMedia] Usuario no autenticado, no se puede eliminar media');
      }
      return false;
    }

    if (!supabase) {
      if (__DEV__) {
        console.warn('[SpotMedia] Supabase client no disponible');
      }
      return false;
    }

    try {
      // Verificar que la media pertenece al usuario y está pendiente
      const { data: existingMedia, error: fetchError } = await supabase
        .from('spot_media')
        .select('spot_id, user_id, status')
        .eq('id', mediaId)
        .single();

      if (fetchError || !existingMedia) {
        if (__DEV__) {
          console.warn('[SpotMedia] Media no encontrada:', mediaId);
        }
        return false;
      }

      if (existingMedia.user_id !== user.id) {
        if (__DEV__) {
          console.warn('[SpotMedia] Usuario no es dueño de la media');
        }
        return false;
      }

      if (existingMedia.status !== 'pending') {
        if (__DEV__) {
          console.warn('[SpotMedia] Solo se puede eliminar media pendiente');
        }
        return false;
      }

      // Eliminar de Supabase
      const { error: deleteError } = await supabase
        .from('spot_media')
        .delete()
        .eq('id', mediaId);

      if (deleteError) {
        if (__DEV__) {
          console.error('[SpotMedia] Error eliminando media:', deleteError);
        }
        return false;
      }

      // Actualizar estado local
      const spotId = existingMedia.spot_id;
      setSpotMediaMap((prev) => {
        const newMap = new Map(prev);
        const existingMediaList = newMap.get(spotId) || [];
        newMap.set(spotId, existingMediaList.filter(media => media.id !== mediaId));
        return newMap;
      });

      if (__DEV__) {
        console.log(`[SpotMedia] Media eliminada: ${mediaId}`);
      }

      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('[SpotMedia] Error eliminando media:', error);
      }
      return false;
    }
  }, [isAuthenticated, user?.id]);

  /**
   * Refrescar media de un spot (o todos si no se especifica)
   */
  const refreshSpotMedia = useCallback(async (spotId?: string): Promise<void> => {
    if (spotId) {
      await loadSpotMedia(spotId);
    } else {
      // Refrescar todos los spots que ya tenemos cargados
      const spotIds = Array.from(spotMediaMap.keys());
      await Promise.all(spotIds.map(id => loadSpotMedia(id)));
    }
  }, [spotMediaMap, loadSpotMedia]);

  /**
   * Cargar media cuando cambia la autenticación
   */
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Si el usuario se autentica, refrescar para incluir media pendiente
      const spotIds = Array.from(spotMediaMap.keys());
      if (spotIds.length > 0) {
        Promise.all(spotIds.map(id => loadSpotMedia(id)));
      }
    }
  }, [isAuthenticated, user?.id, spotMediaMap]);

  return (
    <SpotMediaContext.Provider
      value={{
        spotMediaMap,
        isLoading,
        addSpotMedia,
        getSpotMedia,
        getApprovedSpotMedia,
        removeSpotMedia,
        refreshSpotMedia,
      }}
    >
      {children}
    </SpotMediaContext.Provider>
  );
}

export function useSpotMedia() {
  const context = useContext(SpotMediaContext);
  if (context === undefined) {
    throw new Error('useSpotMedia must be used within a SpotMediaProvider');
  }
  return context;
}
