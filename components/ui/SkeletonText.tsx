/**
 * SkeletonText Component
 * CANONICAL: Skeleton para texto con variantes de tamaño
 * 
 * Usa tokens de tipografía para dimensiones consistentes.
 * Soporta múltiples líneas de texto.
 * 
 * @component
 */

import { spacing } from '@/constants/spacing';
import { lineHeight } from '@/constants/typography';
import { SkeletonBlock, SkeletonBlockProps } from './SkeletonBlock';

export interface SkeletonTextProps extends Omit<SkeletonBlockProps, 'height' | 'size'> {
  /** Variante de texto (usa lineHeight del Design System) */
  variant?: 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'bodyLarge' | 'bodyMedium' | 'bodySmall' | 'caption';
  /** Número de líneas de texto */
  lines?: number;
  /** Ancho de cada línea (útil para variar longitudes) */
  lineWidths?: (number | string)[];
}

/**
 * SkeletonText - Skeleton para texto con variantes tipográficas
 * 
 * Usa lineHeight del Design System para altura precisa.
 * Soporta múltiples líneas con anchos variables.
 */
export function SkeletonText({
  variant = 'bodyMedium',
  lines = 1,
  lineWidths,
  width,
  style,
  ...props
}: SkeletonTextProps) {
  // Mapeo de variantes a lineHeight del Design System
  const variantMap = {
    heading1: lineHeight['3xl'],
    heading2: lineHeight['2xl'],
    heading3: lineHeight.xl,
    heading4: lineHeight.lg,
    heading5: lineHeight.md,
    bodyLarge: lineHeight.lg,
    bodyMedium: lineHeight.md,
    bodySmall: lineHeight.sm,
    caption: lineHeight.xs,
  };

  const textHeight = variantMap[variant];
  const defaultWidths = Array(lines).fill(width || '100%');

  // Si se proporcionan anchos personalizados, usarlos; si no, usar el width proporcionado o 100%
  const widths = lineWidths || defaultWidths;

  return (
    <>
      {widths.map((lineWidth, index) => (
        <SkeletonBlock
          key={index}
          width={lineWidth}
          height={textHeight}
          borderRadius={spacing.xs / 2}
          style={[
            index > 0 && { marginTop: spacing.xs },
            style,
          ]}
          {...props}
        />
      ))}
    </>
  );
}
