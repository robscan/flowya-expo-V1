/**
 * SkeletonList Component
 * CANONICAL: Skeleton para listas
 * 
 * Renderiza múltiples items de skeleton (cards o rows).
 * Soporta layouts de grid y lista vertical.
 * 
 * @component
 */

import { spacing } from '@/constants/spacing';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SkeletonBlock } from './SkeletonBlock';
import { SkeletonCard, SkeletonCardProps } from './SkeletonCard';

export interface SkeletonListProps {
  /** Número de items a mostrar */
  count?: number;
  /** Tipo de layout */
  layout?: 'list' | 'grid';
  /** Props para cada card (si layout es 'card') */
  cardProps?: SkeletonCardProps;
  /** Estilos adicionales del contenedor */
  style?: ViewStyle;
  /** Mostrar como cards o rows simples */
  variant?: 'card' | 'row';
}

/**
 * SkeletonList - Skeleton para listas de items
 * 
 * Soporta layouts de lista vertical y grid.
 * Usa tokens del Design System para spacing.
 */
export function SkeletonList({
  count = 3,
  layout = 'list',
  cardProps,
  style,
  variant = 'card',
}: SkeletonListProps) {
  const items = Array(count).fill(null);

  if (variant === 'row') {
    // Variante simple: rows horizontales
    return (
      <View style={[styles.container, style]}>
        {items.map((_, index) => (
          <View key={index} style={styles.row}>
            <SkeletonBlock
              width={60}
              height={60}
              borderRadius={spacing.xs}
              style={styles.rowImage}
            />
            <View style={styles.rowContent}>
              <SkeletonBlock width="70%" height={16} borderRadius={spacing.xs / 2} />
              <SkeletonBlock
                width="50%"
                height={14}
                borderRadius={spacing.xs / 2}
                style={styles.rowSubtext}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // Variante card
  if (layout === 'grid') {
    return (
      <View style={[styles.gridContainer, style]}>
        {items.map((_, index) => (
          <SkeletonCard
            key={index}
            size="small"
            {...cardProps}
            style={styles.gridItem}
          />
        ))}
      </View>
    );
  }

  // Layout lista vertical
  return (
    <View style={[styles.container, style]}>
      {items.map((_, index) => (
        <SkeletonCard
          key={index}
          {...cardProps}
          style={index < items.length - 1 && styles.listItem}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
  },
  listItem: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  rowImage: {
    // Imagen circular o cuadrada
  },
  rowContent: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs / 2,
  },
  rowSubtext: {
    marginTop: spacing.xs / 2,
  },
});
