/**
 * SkeletonImage Component
 * CANONICAL: Skeleton para imágenes
 * 
 * Usa aspect ratio común para imágenes (16:9 por defecto).
 * Soporta diferentes ratios y tamaños.
 * 
 * @component
 */

import { spacing } from '@/constants/spacing';
import { SkeletonBlock, SkeletonBlockProps } from './SkeletonBlock';

export interface SkeletonImageProps extends Omit<SkeletonBlockProps, 'height'> {
  /** Ancho de la imagen */
  width?: number | string;
  /** Aspect ratio (ancho:alto) */
  aspectRatio?: number;
  /** Alto fijo (opcional, sobrescribe aspectRatio) */
  height?: number;
  /** Variante de tamaño predefinido */
  size?: 'small' | 'medium' | 'large' | 'xlarge';
}

/**
 * SkeletonImage - Skeleton para imágenes con aspect ratio
 * 
 * Usa aspect ratios comunes (16:9, 4:3, 1:1).
 * Soporta tamaños predefinidos basados en spacing tokens.
 */
export function SkeletonImage({
  width = '100%',
  aspectRatio = 16 / 9,
  height,
  size,
  borderRadius = spacing.sm,
  style,
  ...props
}: SkeletonImageProps) {
  // Tamaños predefinidos (ancho basado en spacing tokens)
  const sizeMap = {
    small: { width: 120, aspectRatio: 4 / 3 },
    medium: { width: 200, aspectRatio: 16 / 9 },
    large: { width: 300, aspectRatio: 16 / 9 },
    xlarge: { width: '100%', aspectRatio: 16 / 9 },
  };

  const sizeProps = size ? sizeMap[size] : {};

  const finalWidth = sizeProps.width || width;
  const finalAspectRatio = sizeProps.aspectRatio || aspectRatio;

  // Calcular altura basada en aspect ratio si no se proporciona height
  const calculatedHeight = height || (typeof finalWidth === 'number' 
    ? finalWidth / finalAspectRatio 
    : undefined);

  return (
    <SkeletonBlock
      width={finalWidth}
      height={calculatedHeight}
      borderRadius={borderRadius}
      style={[
        !calculatedHeight && { aspectRatio: finalAspectRatio },
        style,
      ]}
      {...props}
    />
  );
}
