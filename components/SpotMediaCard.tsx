/**
 * SpotMediaCard Component
 * CANONICAL: Spot card with image for media contexts
 * 
 * Used in: Home, Search (grid), Saved, recommendations
 * 
 * Characteristics:
 * - Always shows image (with fallback)
 * - Not editable
 * - Stable and responsive layout
 * - Works in both grid (2 columns) and slider
 * - Container controls width, not the card
 */

import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { InfoMeta } from '@/components/ui/InfoMeta';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamily, fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { Spot, SpotType } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { hasValidImage } from '@/utils/imageHelpers';

// Helper para obtener label del tipo de spot
function getSpotTypeLabel(type: SpotType): string {
  const labels: Record<SpotType, string> = {
    restaurant: 'Restaurant',
    bar: 'Bar',
    cafe: 'Cafe',
    museum: 'Museum',
    park: 'Park',
    beach: 'Beach',
    viewpoint: 'Viewpoint',
    shop: 'Shop',
    hotel: 'Hotel',
    other: 'Other',
  };
  return labels[type] || 'Spot';
}

interface SpotMediaCardProps {
  spot: Spot;
  onPress?: () => void;
  distance?: number; // En metros (opcional)
  rating?: { value: number; count?: number }; // Rating opcional
  size?: 'large' | 'small'; // Tamaño de la card (default: 'large')
}

export function SpotMediaCard({ 
  spot, 
  onPress, 
  distance,
  rating,
  size = 'large',
}: SpotMediaCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const hasImage = hasValidImage(spot.photos);
  const spotTypeLabel = getSpotTypeLabel(spot.type);

  // Render variant="small" (compacto para grid y sliders)
  if (size === 'small') {
    return (
      <Pressable onPress={onPress} style={styles.smallCardContainer}>
        {/* Imagen cuadrada 160px - siempre visible */}
        <View style={styles.smallImageContainer}>
          {hasImage ? (
            <Image 
              source={{ uri: spot.photos[0] }} 
              style={styles.smallImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.smallImagePlaceholder, { backgroundColor: colors.icon + '20' }]}>
              <Icon name="upload" size={32} color={colors.icon} />
            </View>
          )}
        </View>

        {/* Título debajo de imagen */}
        <Text 
          style={[styles.smallTitle, { color: colors.text }]} 
          numberOfLines={2}
        >
          {spot.name || 'Unnamed spot'}
        </Text>

        {/* InfoMeta simplificado (solo distancia) */}
        <InfoMeta distance={distance} size="small" />
      </Pressable>
    );
  }

  // Render size="large" (default)
  return (
    <Pressable onPress={onPress} style={styles.cardContainer}>
      <GlassView
        style={styles.card}
        intensity="light"
        opacity="medium"
        shadowLevel="subtle"
        enableGlow={true}
        useGrayBackground={true}
      >
        {/* Imagen arriba o placeholder - siempre visible */}
        <View style={styles.imageContainer}>
          {hasImage ? (
            <Image 
              source={{ uri: spot.photos[0] }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.icon + '20' }]}>
              <Icon name="upload" size={48} color={colors.icon} />
            </View>
          )}
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <View style={styles.spotInfo}>
            <Text style={[styles.spotName, { color: colors.text }]} numberOfLines={1}>
              {spot.name || 'Unnamed spot'}
            </Text>
            {spot.description && (
              <Text style={[styles.spotDescription, { color: colors.icon }]} numberOfLines={2}>
                {spot.description}
              </Text>
            )}
            {/* InfoMeta debajo del título (chip, distancia, rating) */}
            <InfoMeta
              chip={{ label: spotTypeLabel }}
              distance={distance}
              rating={rating}
              size="large"
            />
          </View>
        </View>
      </GlassView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Variant large
  cardContainer: {
    marginBottom: spacing.xs,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  // Variant small
  smallCardContainer: {
    // Container controls width, not the card
    width: '100%',
  },
  smallImageContainer: {
    width: '100%',
    aspectRatio: 1, // Mantener cuadrado
    marginBottom: spacing.xs,
  },
  smallImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
  },
  smallImagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallTitle: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '500',
    marginBottom: spacing.xs / 2,
  },
  // Contenido principal
  spotInfo: {
    flex: 1,
    gap: spacing.xs / 2,
    minWidth: 0,
  },
  spotName: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: '500',
  },
  spotDescription: {
    fontFamily,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '400',
  },
});
