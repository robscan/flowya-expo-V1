/**
 * OptimizedImage Component
 * CANONICAL: Componente centralizado para manejo optimizado de imágenes
 * 
 * Funcionalidades:
 * - Carga inmediata con control de estados
 * - Placeholder: Skeleton o blur mientras carga
 * - Cache: Usa cache nativo de React Native
 * - Tamaños explícitos: Requiere width y height para evitar layout shift
 * - Fallback: Muestra placeholder cuando no hay imagen o falla la carga
 * 
 * IMPORTANTE: Este componente asume que TODAS las imágenes ya están optimizadas.
 * Las imágenes subidas por el usuario deben pasar por el pipeline de optimización
 * (useImageUpload hook) ANTES de mostrarse en UI.
 * 
 * @component
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImageLoadState } from '@/hooks/useImageLoadState';
import { getOptimizedImageUrl } from '@/utils/imageHelpers';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Image, ImageProps, ImageSourcePropType, Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { Icon } from './Icon';
import { SkeletonImage, SkeletonImageProps } from './SkeletonImage';

// Crear componente Image animado para transiciones suaves
const AnimatedImage = Animated.createAnimatedComponent(Image);

// Sistema de límite de concurrencia para carga de imágenes
const MAX_CONCURRENT_LOADS = 6; // Máximo de imágenes cargándose simultáneamente
const imageLoadQueue: Array<{ uri: string; resolve: () => void }> = [];
let currentActiveLoads = 0;


function requestImageLoad(uri: string, priority: 'high' | 'normal' = 'normal'): Promise<void> {
  return new Promise((resolve) => {
    if (currentActiveLoads < MAX_CONCURRENT_LOADS) {
      currentActiveLoads++;
      resolve();
    } else {
      if (priority === 'high') {
        imageLoadQueue.unshift({ uri, resolve });
      } else {
        imageLoadQueue.push({ uri, resolve });
      }
    }
  });
}

function releaseImageLoad() {
  currentActiveLoads = Math.max(0, currentActiveLoads - 1);
  if (imageLoadQueue.length > 0 && currentActiveLoads < MAX_CONCURRENT_LOADS) {
    const next = imageLoadQueue.shift();
    if (next) {
      currentActiveLoads++;
      next.resolve();
    }
  }
}

export interface OptimizedImageProps extends Omit<ImageProps, 'source' | 'style'> {
  /** URI de la imagen o ImageSourcePropType */
  source: ImageSourcePropType | { uri: string } | null | undefined;
  /** Ancho requerido (evita layout shift) */
  width: number | string;
  /** Alto requerido (evita layout shift) */
  height: number | string;
  /** Estilos adicionales del contenedor */
  style?: ViewStyle;
  /** Estilos adicionales de la imagen */
  imageStyle?: ImageProps['style'];
  /** Mostrar placeholder cuando no hay imagen */
  showFallback?: boolean;
  /** Icono para fallback (default: 'upload') */
  fallbackIcon?: string;
  /** Radio de borde */
  borderRadius?: number;
  /** Resize mode (default: 'cover') */
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'repeat';
  /** Mostrar skeleton durante carga (default: true) */
  showSkeleton?: boolean;
  /** Props para personalizar skeleton */
  skeletonProps?: Partial<SkeletonImageProps>;
  /** Mostrar icono de error cuando falla la carga (default: true) */
  showErrorIcon?: boolean;
  /** Prioridad de carga (default: normal) */
  priority?: 'high' | 'normal';
}

/**
 * OptimizedImage - Componente optimizado para carga de imágenes
 * 
 * CANONICAL: Sistema de carga con cache-aware y estados explícitos
 * 
 * Características:
 * - Modelo de estados explícito: not_requested, loading, available, error
 * - Cache-aware: Verifica cache antes de mostrar skeleton
 * - Skeleton solo aparece cuando hay carga real pendiente
 * - Fade-in suave cuando carga completa (200ms)
 * - Error state visual si falla la carga
 * - Placeholder estático sólido si no hay imagen
 * - Cache en memoria persiste durante sesión (sobrevive a unmount/remount)
 * - Cache navegador/nativo se verifica antes de renderizar
 * - Tamaños explícitos: Requiere width/height
 * - Fallback: Placeholder cuando no hay imagen
 */
export function OptimizedImage({
  source,
  width,
  height,
  style,
  imageStyle,
  showFallback = true,
  fallbackIcon = 'upload',
  borderRadius = 0,
  resizeMode = 'cover',
  showSkeleton = true,
  skeletonProps,
  showErrorIcon = true,
  priority = 'normal',
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Memoizar source para evitar recreaciones innecesarias y prevenir re-renders
  // Extraer URI para dependencia estable (comparar por valor, no por referencia)
  // V1.3: Optimizar URLs de Unsplash automáticamente
  const sourceUri = useMemo(() => {
    if (!source) return null;
    if (typeof source === 'object' && source !== null && 'uri' in source) {
      const originalUri = String(source.uri);
      // Optimizar URL si es necesario (Unsplash, etc.)
      return getOptimizedImageUrl(originalUri) || originalUri;
    }
    // Si es ImageSourcePropType (require), retornar null (no hay URI)
    return null;
  }, [
    // Comparar por valor del URI, no por referencia del objeto
    source && typeof source === 'object' && source !== null && 'uri' in source 
      ? String(source.uri) 
      : null
  ]);

  const memoizedSource = useMemo(() => {
    if (!source) return null;
    if (typeof source === 'object' && source !== null && 'uri' in source) {
      // Usar URI optimizado
      return { uri: sourceUri || source.uri };
    }
    return source;
  }, [sourceUri, source]);

  // CANONICAL: Usar hook de estado de carga con cache en memoria
  const [loadState, setLoadState] = useImageLoadState(sourceUri);
  
  // Derivar estados booleanos del estado canónico
  const imageLoading = loadState === 'loading';
  const imageError = loadState === 'error';
  const imageAvailable = loadState === 'available';
  
  // Iniciar carga cuando hay sourceUri y el estado es 'not_requested'
  // Esto se hace en handleLoadStart que se dispara automáticamente cuando el Image se renderiza
  // NO usar useEffect - el handler onLoadStart maneja esto
  
  // Ref para rastrear la URI actual que se está cargando y evitar reinicios innecesarios
  const currentLoadingUriRef = useRef<string | null>(null);
  
  // Ref para rastrear el estado actual sin depender de él en dependencias
  const loadStateRef = useRef(loadState);
  
  const containerRef = useRef<View>(null);
  
  // Actualizar ref cuando cambia el estado
  useEffect(() => {
    loadStateRef.current = loadState;
  }, [loadState]);
  
  // Animaciones para transición suave skeleton → imagen
  const skeletonOpacity = useRef(new Animated.Value(1)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  // CANONICAL: Resetear animaciones cuando no hay source
  // Los handlers onLoadStart, onLoad, onError ya manejan los cambios de estado
  // No necesitamos un useEffect que llame a setLoadState - eso causa loops
  useEffect(() => {
    if (!sourceUri) {
      skeletonOpacity.setValue(0);
      imageOpacity.setValue(0);
    }
  }, [sourceUri, skeletonOpacity, imageOpacity]);

  // Verificar si hay imagen válida
  const hasValidSource = memoizedSource !== null;

  // CANONICAL: Sincronizar animaciones con estado de carga
  // loadState controla solo UI auxiliar (skeleton, opacity), nunca la existencia del Image
  useEffect(() => {
    if (loadState === 'loading' || loadState === 'not_requested') {
      // Mostrar skeleton mientras carga o está en estado inicial
      // Imagen con opacity 0 hasta que cargue
      Animated.parallel([
        Animated.timing(skeletonOpacity, {
          toValue: 1,
          duration: 0, // Cambio inmediato
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(imageOpacity, {
          toValue: 0,
          duration: 0, // Cambio inmediato
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else if (loadState === 'available') {
      // Ocultar skeleton, mostrar imagen con fade-in
      Animated.parallel([
        Animated.timing(skeletonOpacity, {
          toValue: 0,
          duration: 200, // Fade-out suave
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 200, // Fade-in suave
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else if (loadState === 'error') {
      // Ocultar skeleton e imagen en caso de error
      Animated.parallel([
        Animated.timing(skeletonOpacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(imageOpacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadState]); // Solo dependencia de loadState, las refs son estables

  // CANONICAL: Handlers para eventos de carga
  // CANONICAL: Handlers para eventos de carga
  // Usar refs para evitar dependencias que causen loops
  const sourceUriRef = useRef(sourceUri);
  const hasLoadedRef = useRef<string | null>(null); // Rastrear qué URI ya cargó para evitar múltiples llamadas
  
  useEffect(() => {
    sourceUriRef.current = sourceUri;
    currentLoadingUriRef.current = sourceUri;
    // Resetear flag cuando cambia la URI
    if (sourceUri !== hasLoadedRef.current) {
      hasLoadedRef.current = null;
    }
  }, [sourceUri]);

  const handleLoadStart = async () => {
    // onLoadStart se ejecuta cuando la imagen inicia carga
    // Actualizar a 'loading' si el estado actual es 'not_requested' o 'error'
    // Esto inicia la carga automáticamente cuando el Image se renderiza
    if (sourceUriRef.current && sourceUriRef.current === currentLoadingUriRef.current) {
      const currentState = loadStateRef.current;
      if (currentState === 'not_requested' || currentState === 'error') {
        // Sistema de queue: esperar si hay demasiadas imágenes cargándose
        if (sourceUriRef.current) {
          await requestImageLoad(sourceUriRef.current, priority);
        }
        setLoadState('loading');
      }
    }
  };

  const handleLoad = (e: any) => {
    // onLoad se ejecuta cuando la imagen carga completa
    // En web, si la imagen está en caché, onLoad puede ejecutarse inmediatamente sin onLoadStart
    // Manejar tanto 'not_requested' (cache) como 'loading' (carga normal)
    // Solo actualizar si la URI actual coincide y no se ha cargado ya (evita loops)
    if (sourceUriRef.current && 
        sourceUriRef.current === currentLoadingUriRef.current &&
        hasLoadedRef.current !== sourceUriRef.current) {
      hasLoadedRef.current = sourceUriRef.current;
      releaseImageLoad(); // Liberar slot en queue
      // Actualizar a 'available' independientemente del estado actual
      // (puede ser 'not_requested' si está en cache o 'loading' si es carga normal)
      setLoadState('available');
      onLoad?.(e);
    }
  };

  const handleError = (e: any) => {
    // onError se ejecuta cuando la imagen falla
    // Solo actualizar si la URI actual coincide (evita estados de error obsoletos de URIs anteriores)
    if (sourceUriRef.current && sourceUriRef.current === currentLoadingUriRef.current) {
      releaseImageLoad(); // Liberar slot en queue
      setLoadState('error');
      onError?.(e);
    }
  };

  // Si no hay imagen y showFallback es true, mostrar fallback estático
  if (!hasValidSource && showFallback) {
    return (
      <View
        style={[
          styles.container,
          {
            width,
            height,
            borderRadius,
            backgroundColor: colors.icon + '20',
          },
          style,
        ]}>
        <View style={styles.fallbackContainer}>
          <Icon name={fallbackIcon as any} size={Math.min(typeof width === 'number' ? width / 3 : 32, 48)} color={colors.icon} />
        </View>
      </View>
    );
  }

  // Si no hay imagen y showFallback es false, no renderizar nada
  if (!hasValidSource) {
    return null;
  }

  // Renderizar imagen con estados de carga
  return (
    <View
      ref={containerRef}
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          backgroundColor: colors.icon + '20', // Fondo sólido mientras carga
        },
        style,
      ]}>
      {/* CANONICAL: Skeleton aparece cuando está cargando o en estado inicial (not_requested) */}
      {(imageLoading || loadState === 'not_requested') && showSkeleton && (
        <Animated.View 
          style={[
            styles.skeletonContainer,
            { 
              opacity: skeletonOpacity,
              pointerEvents: 'auto'
            }
          ]}>
          <SkeletonImage
            width={width}
            height={height}
            borderRadius={borderRadius}
            {...skeletonProps}
          />
        </Animated.View>
      )}

      {/* Error state visual */}
      {imageError && showErrorIcon && (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Icon name={fallbackIcon as any} size={Math.min(typeof width === 'number' ? width / 3 : 32, 48)} color={colors.icon} />
          </View>
        </View>
      )}

      {/* CANONICAL: Imagen SIEMPRE renderizada si hay source (loadState controla solo UI auxiliar) */}
      {hasValidSource && (
        <AnimatedImage
          key={sourceUri || 'static'}
          source={memoizedSource as ImageSourcePropType}
          style={[
            styles.image,
            {
              width,
              height,
              opacity: Platform.OS === 'web' && loadState === 'available' ? 1 : imageOpacity,
            },
            imageStyle,
          ]}
          resizeMode={resizeMode}
          fadeDuration={0} // Deshabilitar fade nativo, manejamos opacidad con Animated
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          // Cache: React Native maneja cache automáticamente para imágenes remotas
          // En web, si la imagen está en caché, onLoad puede ejecutarse inmediatamente sin onLoadStart
          {...props}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  errorContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
