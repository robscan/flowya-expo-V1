/**
 * SkeletonCard Component
 * CANONICAL: Skeleton para cards
 * 
 * Estructura completa de card con imagen, título, descripción y metadata.
 * Usa tokens del Design System para spacing y dimensiones.
 * 
 * @component
 */

import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SkeletonBlock } from './SkeletonBlock';
import { SkeletonImage } from './SkeletonImage';
import { SkeletonText } from './SkeletonText';

export interface SkeletonCardProps {
  /** Mostrar imagen en el card */
  showImage?: boolean;
  /** Mostrar metadata (chips, badges) */
  showMetadata?: boolean;
  /** Número de líneas de descripción */
  descriptionLines?: number;
  /** Estilos adicionales */
  style?: ViewStyle;
  /** Variante de tamaño */
  size?: 'small' | 'medium' | 'large';
}

/**
 * SkeletonCard - Skeleton completo para cards
 * 
 * Estructura: Imagen (opcional) + Título + Descripción + Metadata
 * Usa tokens del Design System para consistencia.
 */
export function SkeletonCard({
  showImage = true,
  showMetadata = true,
  descriptionLines = 2,
  style,
  size = 'medium',
}: SkeletonCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Tamaños predefinidos
  const sizeMap = {
    small: {
      imageHeight: 120,
      titleWidth: '70%',
      descriptionWidth: '90%',
      padding: spacing.sm,
    },
    medium: {
      imageHeight: 200,
      titleWidth: '75%',
      descriptionWidth: '95%',
      padding: spacing.md,
    },
    large: {
      imageHeight: 280,
      titleWidth: '80%',
      descriptionWidth: '100%',
      padding: spacing.md,
    },
  };

  const sizeProps = sizeMap[size];

  return (
    <View
      pointerEvents="none"
      style={[
        styles.card,
        {
          backgroundColor: colors.background,
          borderRadius: spacing.sm,
          padding: sizeProps.padding,
        },
        style,
      ]}>
      {/* Imagen */}
      {showImage && (
        <SkeletonImage
          width="100%"
          height={sizeProps.imageHeight}
          borderRadius={spacing.sm}
          style={styles.image}
        />
      )}

      {/* Contenido */}
      <View style={styles.content}>
        {/* Título */}
        <SkeletonText
          variant="heading5"
          width={sizeProps.titleWidth}
          style={styles.title}
        />

        {/* Descripción */}
        <SkeletonText
          variant="bodySmall"
          lines={descriptionLines}
          lineWidths={[
            sizeProps.descriptionWidth,
            sizeProps.descriptionWidth,
            sizeProps.descriptionWidth === '100%' ? '85%' : sizeProps.descriptionWidth,
          ].slice(0, descriptionLines)}
          style={styles.description}
        />

        {/* Metadata (chips, badges) */}
        {showMetadata && (
          <View style={styles.metadata}>
            <SkeletonBlock
              width={60}
              height={24}
              borderRadius={spacing.xs / 2}
              style={styles.metadataItem}
            />
            <SkeletonBlock
              width={80}
              height={24}
              borderRadius={spacing.xs / 2}
              style={styles.metadataItem}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  image: {
    marginBottom: spacing.sm,
  },
  content: {
    gap: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs / 2,
  },
  description: {
    marginTop: spacing.xs,
  },
  metadata: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  metadataItem: {
    // Estilos para chips/badges
  },
});
