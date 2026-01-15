/**
 * Hook para precargar imágenes críticas
 * V1.3: Optimización de carga de imágenes
 * 
 * Precarga las primeras N imágenes de spots para mejorar la experiencia inicial
 */

import { useEffect, useRef } from 'react';
import { Image } from 'expo-image';
import { Platform } from 'react-native';
import { Spot } from '@/data/spots';
import { getOptimizedImageUrl, getSpotImageUrls } from '@/utils/imageHelpers';

interface UseImagePreloaderOptions {
  /** Número de imágenes a precargar (default: 6) */
  count?: number;
  /** Spots a precargar (si no se proporciona, usa los primeros N) */
  spots?: Spot[];
  /** Callback cuando se completa la precarga */
  onComplete?: () => void;
  /** Callback cuando hay un error */
  onError?: (error: Error) => void;
}

/**
 * Hook para precargar imágenes críticas de spots
 * 
 * @example
 * ```tsx
 * const { isPreloading, preloadedCount } = useImagePreloader({
 *   spots: criticalSpots,
 *   count: 6,
 *   onComplete: () => console.log('Preload complete')
 * });
 * ```
 */
export function useImagePreloader(options: UseImagePreloaderOptions = {}) {
  const { count = 6, spots, onComplete, onError } = options;
  const isPreloadingRef = useRef(false);
  const preloadedCountRef = useRef(0);
  const preloadPromisesRef = useRef<Promise<void>[]>([]);

  useEffect(() => {
    if (!spots || spots.length === 0) return;
    
    // Obtener las primeras N imágenes a precargar
    const imagesToPreload = spots
      .slice(0, count)
      .flatMap((spot) => getSpotImageUrls(spot).map((url) => getOptimizedImageUrl(url)))
      .filter((url): url is string => url !== null);

    if (imagesToPreload.length === 0) return;

    // Precargar imágenes
    const preloadImages = async () => {
      if (isPreloadingRef.current) return; // Ya está precargando
      
      isPreloadingRef.current = true;
      preloadedCountRef.current = 0;

      try {
        // Precargar todas las imágenes en paralelo (expo-image maneja la concurrencia)
        const promises = imagesToPreload.map(async (url) => {
          try {
            // expo-image tiene prefetch nativo
            await Image.prefetch(url);
            preloadedCountRef.current++;
          } catch (error) {
            // Ignorar errores individuales, continuar con las demás
            console.warn(`Failed to preload image: ${url}`, error);
          }
        });

        preloadPromisesRef.current = promises;
        await Promise.allSettled(promises);
        
        onComplete?.();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown preload error');
        onError?.(err);
      } finally {
        isPreloadingRef.current = false;
      }
    };

    // Precargar después de un pequeño delay para no bloquear el render inicial
    const timer = setTimeout(preloadImages, 100);
    
    return () => {
      clearTimeout(timer);
      // No cancelar las precargas en progreso, pero limpiar referencias
      preloadPromisesRef.current = [];
    };
  }, [spots, count, onComplete, onError]);

  return {
    isPreloading: isPreloadingRef.current,
    preloadedCount: preloadedCountRef.current,
  };
}

/**
 * Función utilitaria para precargar imágenes de spots específicos
 * Útil para precargar imágenes cuando se sabe que se van a mostrar pronto
 */
export async function preloadSpotImages(
  spots: Spot[],
  count: number = 6
): Promise<void> {
  const imagesToPreload = spots
    .slice(0, count)
    .flatMap((spot) => getSpotImageUrls(spot).map((url) => getOptimizedImageUrl(url)))
    .filter((url): url is string => url !== null);

  if (imagesToPreload.length === 0) return;

  // Precargar en paralelo
  await Promise.allSettled(
    imagesToPreload.map(url => 
      Image.prefetch(url).catch(err => {
        console.warn(`Failed to preload image: ${url}`, err);
      })
    )
  );
}
