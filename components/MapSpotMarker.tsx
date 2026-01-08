/**
 * Map Spot Marker Component
 * Scope 8: Home - Map Tab - Map Spot Marker
 * 
 * Principios de diseño:
 * - Marcadores personalizados
 * - Indicador de tipo de Spot
 * - Tap para ver detalles
 * - Estilo glass sutil
 */

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { Spot, SpotType } from '@/data/spots';
import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Icon } from '@/components/ui/Icon';

interface MapSpotMarkerProps {
  spot: Spot;
  onPress: () => void;
  isHighlighted?: boolean;
}

// Helper para obtener icono según tipo de Spot
function getSpotTypeIcon(type: SpotType): 'map' {
  // Por ahora, todos usan el mismo icono 'map'
  // Se puede personalizar más adelante
  return 'map';
}

// Helper para obtener color según tipo
function getSpotTypeColor(type: SpotType, colors: any): string {
  // Por ahora, todos usan el mismo color (tint)
  // Se puede personalizar más adelante
  return colors.tint;
}

export function MapSpotMarker({ spot, onPress, isHighlighted = false }: MapSpotMarkerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const iconName = getSpotTypeIcon(spot.type);
  const markerColor = getSpotTypeColor(spot.type, colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.markerContainer}
      activeOpacity={0.7}>
      <View style={[
        styles.marker, 
        { backgroundColor: markerColor },
        isHighlighted && styles.markerHighlighted
      ]}>
        <Icon name={iconName} size={16} color={colors.background} />
      </View>
      {spot.name && (
        <View style={[
          styles.label, 
          { backgroundColor: colors.background + 'E6' },
          isHighlighted && styles.labelHighlighted
        ]}>
          <Text style={[
            textStyles.caption, 
            { color: colors.text },
            isHighlighted && styles.labelTextHighlighted
          ]} numberOfLines={1}>
            {spot.name}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    marginTop: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
    maxWidth: 120,
  },
  markerHighlighted: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  labelHighlighted: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    maxWidth: 160,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  labelTextHighlighted: {
    fontWeight: '600',
    fontSize: 13,
  },
});

