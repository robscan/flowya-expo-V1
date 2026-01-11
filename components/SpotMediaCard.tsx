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

import { useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { GestureResponderEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/ui/Chip';
import { GlassView } from '@/components/ui/GlassView';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { InfoMeta } from '@/components/ui/InfoMeta';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamily, fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSpotTypeLabel } from '@/utils/spotFormHelpers';
import { hasValidImage } from '@/utils/imageHelpers';

interface SpotMediaCardProps {
  spot: Spot;
  onPress?: () => void;
  distance?: number; // En metros (opcional)
  rating?: { value: number; count?: number }; // Rating opcional
  size?: 'large' | 'small'; // Tamaño de la card (default: 'large')
}

export const SpotMediaCard = memo(function SpotMediaCard({ 
  spot, 
  onPress, 
  distance,
  rating,
  size = 'large',
}: SpotMediaCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { markSpotAsSeen } = useSpot();
  const { toggleSaveSpot, isSpotSaved } = useSaved();
  const hasImage = hasValidImage(spot.photos);
  const spotTypeLabel = getSpotTypeLabel(spot.type);
  const isSaved = isSpotSaved(spot.id);

  // Marcar Spot como 'seen' al montar (automáticamente)
  useEffect(() => {
    markSpotAsSeen(spot.id);
  }, [spot.id, markSpotAsSeen]);

  // Memoizar source para evitar recreaciones innecesarias y prevenir loops
  const imageSource = useMemo(() => {
    if (!hasImage || !spot.photos || spot.photos.length === 0) {
      return null;
    }
    return { uri: spot.photos[0] };
  }, [hasImage, spot.photos?.[0]]); // Solo cambiar cuando cambia la URI de la primera foto

  // Handler para guardar spot
  const handleSavePress = useCallback((e: GestureResponderEvent) => {
    e.stopPropagation(); // Prevenir que el card se abra
    toggleSaveSpot(spot.id);
  }, [spot.id, toggleSaveSpot]);

  // Handler para navegar a Map
  const handleViewOnMap = useCallback((e: GestureResponderEvent) => {
    e.stopPropagation(); // Prevenir que el card se abra
    router.push(`/(tabs)/map?spotId=${spot.id}`);
  }, [spot.id, router]);

  // Render variant="small" (compacto para grid y sliders)
  if (size === 'small') {
    return (
      <Pressable onPress={onPress} style={styles.smallCardContainer}>
        {/* Imagen cuadrada 160px - siempre visible */}
        <View style={styles.smallImageContainer}>
          <OptimizedImage
            source={imageSource}
            width="100%"
            height="100%"
            borderRadius={borderRadius.md}
            showFallback={true}
            fallbackIcon="upload"
            resizeMode="cover"
          />
          {/* Botón "Map" - extremo inferior izquierdo */}
          <View style={styles.mapViewOverlay}>
            <Pressable
              onPress={handleViewOnMap}
              style={({ pressed }) => [
                styles.mapViewButton,
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Chip text="Map" variant="default" icon="visibility" solidBackground={true} />
            </Pressable>
          </View>
          {/* Icono de guardar sobre la imagen - extremo superior derecho */}
          <View style={styles.bookmarkOverlay}>
            <View
              style={[
                styles.bookmarkButton,
                {
                  backgroundColor:
                    colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                },
              ]}>
              <Pressable
                onPress={handleSavePress}
                style={({ pressed }) => [
                  iconTouchableContainer.base,
                  pressed && { opacity: 0.7 }
                ]}>
                <Icon
                  name="bookmark"
                  size={24}
                  color={isSaved ? colors.tint : colors.text}
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Título debajo de imagen */}
        <Text 
          style={[styles.smallTitle, { color: colors.text }]} 
          numberOfLines={2}
        >
          {spot.name || 'Unnamed spot'}
        </Text>

        {/* InfoMeta debajo del título */}
        {distance !== undefined && distance !== null && (
          <InfoMeta
            distance={distance}
            size={size}
          />
        )}
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
          <OptimizedImage
            source={imageSource}
            width="100%"
            height={200}
            showFallback={true}
            fallbackIcon="upload"
            resizeMode="cover"
          />
          {/* Botón "Map" - extremo inferior izquierdo */}
          <View style={styles.mapViewOverlay}>
            <Pressable
              onPress={handleViewOnMap}
              style={({ pressed }) => [
                styles.mapViewButton,
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Chip text="Map" variant="default" icon="visibility" solidBackground={true} />
            </Pressable>
          </View>
          {/* Icono de guardar sobre la imagen - extremo superior derecho */}
          <View style={styles.bookmarkOverlay}>
            <View
              style={[
                styles.bookmarkButton,
                {
                  backgroundColor:
                    colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                },
              ]}>
              <Pressable
                onPress={handleSavePress}
                style={({ pressed }) => [
                  iconTouchableContainer.base,
                  pressed && { opacity: 0.7 }
                ]}>
                <Icon
                  name="bookmark"
                  size={24}
                  color={isSaved ? colors.tint : colors.text}
                />
              </Pressable>
            </View>
          </View>
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
            {/* InfoMeta debajo de la descripción */}
            <View style={styles.infoMetaContainer}>
              <InfoMeta
                chip={{ label: spotTypeLabel }}
                distance={distance}
                rating={rating}
                size="large"
              />
            </View>
          </View>
        </View>
      </GlassView>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  // Variant large
  cardContainer: {
    marginBottom: spacing.xs,
    // @ts-ignore - touch-action es válido en web
    ...(Platform.OS === 'web' && { touchAction: 'manipulation' }),
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
    // @ts-ignore - touch-action es válido en web
    ...(Platform.OS === 'web' && { touchAction: 'manipulation' }),
  },
  smallImageContainer: {
    width: '100%',
    aspectRatio: 1, // Mantener cuadrado
    marginBottom: spacing.xs,
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
  infoMetaContainer: {
    marginTop: -(spacing.sm - spacing.xs / 2), // Compensar marginTop de InfoMeta (16px -> 4px)
  },
  // Map View overlay (inferior izquierda)
  mapViewOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    zIndex: 10,
  },
  mapViewButton: {
    // Chip tiene su propio padding, no necesita contenedor adicional
  },
  // Bookmark overlay (superior derecha)
  bookmarkOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 10,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
