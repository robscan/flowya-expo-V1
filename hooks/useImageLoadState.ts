/**
 * useImageLoadState Hook
 * CANONICAL: Hook para manejar estados de carga de imágenes con cache en memoria
 * 
 * Este hook gestiona el estado de carga de una imagen individual, sincronizándolo
 * con el cache global en memoria. Permite que múltiples componentes que usan la
 * misma imagen compartan el estado de carga.
 * 
 * Características:
 * - Estado inicial desde cache en memoria
 * - Sincronización bidireccional con cache global
 * - Persistencia durante la sesión (sobrevive a unmount/remount)
 */

import { useEffect, useRef, useState } from 'react';
import { getImageState, setImageState, ImageLoadState } from '@/utils/imageCache';

/**
 * Hook para manejar el estado de carga de una imagen
 * @param sourceUri URI de la imagen o null si no hay imagen
 * @returns Tupla [estado, setEstado] similar a useState
 */
export function useImageLoadState(sourceUri: string | null): [ImageLoadState, (state: ImageLoadState) => void] {
  // Estado inicial: verificar cache en memoria primero
  const [state, setState] = useState<ImageLoadState>(() => {
    if (!sourceUri) return 'not_requested';
    // Verificar cache en memoria primero
    const cachedState = getImageState(sourceUri);
    if (cachedState === 'available') return 'available';
    return 'not_requested';
  });

  // Ref para rastrear la última URI procesada y evitar loops
  const lastProcessedUriRef = useRef<string | null>(null);
  // Ref para rastrear el último estado para evitar loops
  const lastStateRef = useRef<ImageLoadState>(state);

  // Actualizar ref cuando cambia el estado
  useEffect(() => {
    lastStateRef.current = state;
  }, [state]);

  // Sincronizar con cache global cuando cambia sourceUri (solo cuando cambia la URI, no el estado)
  useEffect(() => {
    if (sourceUri && sourceUri !== lastProcessedUriRef.current) {
      lastProcessedUriRef.current = sourceUri;
      const cachedState = getImageState(sourceUri);
      // Si el cache tiene un estado diferente a not_requested, actualizar solo si el estado actual es not_requested
      // Usar ref para obtener el estado actual sin depender de él en las dependencias
      if (cachedState !== 'not_requested' && lastStateRef.current === 'not_requested') {
        setState(cachedState);
      }
    } else if (!sourceUri) {
      lastProcessedUriRef.current = null;
      lastStateRef.current = 'not_requested';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceUri]); // Solo dependencia de sourceUri, no de state para evitar loops

  // Wrapper para setState que también actualiza el cache
  const setStateWithCache = (newState: ImageLoadState) => {
    setState(newState);
    if (sourceUri && newState !== 'not_requested') {
      setImageState(sourceUri, newState);
    }
  };

  return [state, setStateWithCache];
}
