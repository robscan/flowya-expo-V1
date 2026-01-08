/**
 * OptimizedImage Component
 * CANONICAL: Componente centralizado para manejo optimizado de imágenes
 * 
 * Funcionalidades:
 * - Lazy load: Carga imágenes solo cuando están visibles
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

import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useMemo, useState } from 'react';
import { Image, ImageProps, ImageSourcePropType, StyleSheet, View, ViewStyle } from 'react-native';
import { Icon } from './Icon';
import { SkeletonImage, SkeletonImageProps } from './SkeletonImage';

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
}

/**
 * OptimizedImage - Componente optimizado para carga de imágenes
 * 
 * Características:
 * - Skeleton durante carga de imagen
 * - Fade-in suave cuando carga completa (200ms)
 * - Error state visual si falla la carga
 * - Placeholder estático sólido si no hay imagen
 * - Cache: Cache nativo de React Native
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
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Estados internos de carga
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Memoizar source para evitar recreaciones innecesarias y prevenir re-renders
  // Extraer URI para dependencia estable
  const sourceUri = useMemo(() => {
    if (!source) return null;
    if (typeof source === 'object' && source !== null && 'uri' in source) {
      return source.uri;
    }
    return null;
  }, [source]);

  const memoizedSource = useMemo(() => {
    if (!source) return null;
    if (typeof source === 'object' && source !== null && 'uri' in source) {
      return { uri: source.uri };
    }
    return source;
  }, [sourceUri]);

  // Resetear estados cuando cambia el source
  useEffect(() => {
    if (memoizedSource) {
      setImageLoading(true);
      setImageError(false);
    } else {
      // Si no hay source, resetear estados
      setImageLoading(false);
      setImageError(false);
    }
  }, [sourceUri, memoizedSource]);

  // Verificar si hay imagen válida
  const hasValidSource = memoizedSource !== null;

  // Handlers para eventos de carga
  const handleLoadStart = () => {
    setImageLoading(true);
    setImageError(false);
  };

  const handleLoad = (e: any) => {
    setImageLoading(false);
    setImageError(false);
    onLoad?.(e);
  };

  const handleError = (e: any) => {
    setImageLoading(false);
    setImageError(true);
    onError?.(e);
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
      {/* Skeleton durante carga */}
      {imageLoading && showSkeleton && (
        <View style={styles.skeletonContainer}>
          <SkeletonImage
            width={width}
            height={height}
            borderRadius={borderRadius}
            {...skeletonProps}
          />
        </View>
      )}

      {/* Error state visual */}
      {imageError && showErrorIcon && (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Icon name={fallbackIcon as any} size={Math.min(typeof width === 'number' ? width / 3 : 32, 48)} color={colors.icon} />
          </View>
        </View>
      )}

      {/* Imagen (oculta durante carga si hay skeleton, visible si no hay error) */}
      {!imageError && (
        <Image
          key={sourceUri || 'static'}
          source={memoizedSource as ImageSourcePropType}
          style={[
            styles.image,
            {
              width,
              height,
              opacity: imageLoading && showSkeleton ? 0 : 1,
            },
            imageStyle,
          ]}
          resizeMode={resizeMode}
          fadeDuration={200} // Fade-in suave (200ms)
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          // Cache: React Native maneja cache automáticamente para imágenes remotas
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
