/**
 * Skeleton Components
 * CANONICAL: Sistema de Skeleton Loaders del Design System
 * 
 * Componentes reutilizables para estados de carga:
 * - SkeletonBlock: Bloque genérico base
 * - SkeletonText: Texto con variantes tipográficas
 * - SkeletonImage: Imágenes con aspect ratio
 * - SkeletonCard: Cards completos
 * - SkeletonList: Listas de items
 * 
 * Todos usan tokens del Design System (spacing, colors, typography).
 * Animación ligera de shimmer para feedback visual.
 */

export { SkeletonBlock, type SkeletonBlockProps } from './SkeletonBlock';
export { SkeletonCard, type SkeletonCardProps } from './SkeletonCard';
export { SkeletonImage, type SkeletonImageProps } from './SkeletonImage';
export { SkeletonList, type SkeletonListProps } from './SkeletonList';
export { SkeletonText, type SkeletonTextProps } from './SkeletonText';

// Legacy export (mantener para compatibilidad)
export { SkeletonLoader, SpotCardSkeleton } from './SkeletonLoader';
