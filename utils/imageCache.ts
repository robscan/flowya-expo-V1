/**
 * Image Cache System
 * CANONICAL: Sistema de cache en memoria para estados de carga de imágenes
 * 
 * Este sistema mantiene un registro del estado de carga de cada imagen por URI
 * durante la sesión de la aplicación. Permite evitar skeletons falsos y recargas
 * innecesarias cuando las imágenes ya están disponibles en cache.
 * 
 * Niveles de cache:
 * 1. Memoria (sesión): Este módulo - persiste durante la sesión
 * 2. Cache nativo: React Native Image cache (disco/memoria del sistema)
 * 3. Cache navegador (web): HTTP cache del navegador
 */

import { Platform } from 'react-native';

export type ImageLoadState = 
  | 'not_requested'  // Aún no se ha intentado cargar
  | 'loading'        // Hay una petición real pendiente
  | 'available'       // Imagen disponible (memoria, cache, o cargada)
  | 'error';         // Falló la carga

// Cache global en memoria (persiste durante sesión)
// Se reinicia al recargar la app, pero sobrevive a unmount/remount de componentes
const imageCache = new Map<string, ImageLoadState>();

/**
 * Obtiene el estado de carga de una imagen desde el cache en memoria
 * @param uri URI de la imagen
 * @returns Estado de carga actual o 'not_requested' si no está en cache
 */
export function getImageState(uri: string): ImageLoadState {
  return imageCache.get(uri) || 'not_requested';
}

/**
 * Establece el estado de carga de una imagen en el cache en memoria
 * @param uri URI de la imagen
 * @param state Nuevo estado de carga
 */
export function setImageState(uri: string, state: ImageLoadState): void {
  imageCache.set(uri, state);
}

/**
 * Verifica si una imagen está disponible (cargada o en cache)
 * @param uri URI de la imagen
 * @returns true si el estado es 'available'
 */
export function isImageAvailable(uri: string): boolean {
  return getImageState(uri) === 'available';
}

/**
 * Limpia el cache en memoria (útil para testing o reset manual)
 */
export function clearImageCache(): void {
  imageCache.clear();
}

/**
 * Obtiene el tamaño del cache (útil para debugging)
 */
export function getCacheSize(): number {
  return imageCache.size;
}

/**
 * Verifica si una imagen está en cache del navegador (solo web)
 * 
 * En web, verifica si la imagen está en el cache HTTP del navegador usando
 * la API del DOM Image. Si Image.complete es true o onload se dispara
 * inmediatamente, la imagen está en cache.
 * 
 * En mobile, no hay API directa para verificar cache nativo antes de renderizar,
 * por lo que retorna false y se confía en que React Native maneja el cache
 * automáticamente.
 * 
 * @param uri URI de la imagen
 * @returns Promise que resuelve a true si la imagen está en cache, false en caso contrario
 */
export async function checkImageCache(uri: string): Promise<boolean> {
  // Validar URL: si es blob: y está vacío o inválido, retornar false inmediatamente
  if (uri.startsWith('blob:')) {
    // Para URLs blob, no podemos verificar cache de manera confiable
    // Las URLs blob son temporales y pueden ser revocadas
    // Dejar que la carga normal maneje errores
    return false;
  }

  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      // Crear elemento Image del DOM para verificar cache
      const img = new (global as any).Image();
      
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, 50); // Timeout de 50ms: si tarda más, probablemente no está en cache

      img.onload = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          // Si onload se dispara rápidamente, está en cache
          resolve(true);
        }
      };

      img.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          // Si hay error, definitivamente no está en cache
          resolve(false);
        }
      };

      try {
        // Establecer src para iniciar verificación
        img.src = uri;

        // Verificar complete después de establecer src (puede cambiar inmediatamente si está en cache)
        if (img.complete) {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            resolve(true);
          }
        }
      } catch (error) {
        // Si hay error al establecer src, retornar false
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(false);
        }
      }
    });
  }
  
  // Mobile: confiar en cache nativo, no hay API directa para verificar antes de renderizar
  // React Native maneja el cache automáticamente
  return false;
}
