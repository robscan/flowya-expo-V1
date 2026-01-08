/**
 * Flow Spot Numbered Marker Component
 * Componente para pines numerados del mapa con estados visuales
 * 
 * Estados:
 * - active: Spot actual en recorrido (color principal, opacidad 100%)
 * - upNext: Siguiente spot (color principal, opacidad ~70%)
 * - visited: Spot ya visitado (color principal, opacidad ~40%)
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Spot } from '@/data/spots';
import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type FlowSpotMarkerState = 'active' | 'upNext' | 'visited';

interface FlowSpotNumberedMarkerProps {
  spot: Spot;
  orderNumber: number; // Número del spot en el flow (1, 2, 3...)
  state: FlowSpotMarkerState;
  onPress: () => void;
}

export function FlowSpotNumberedMarker({ 
  spot, 
  orderNumber, 
  state, 
  onPress 
}: FlowSpotNumberedMarkerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Determinar color y opacidad según el estado
  const getMarkerColor = () => {
    const baseColor = colors.tint;
    switch (state) {
      case 'active':
        return baseColor; // Opacidad 100%
      case 'upNext':
        return baseColor + 'B3'; // Opacidad ~70%
      case 'visited':
        return baseColor + '66'; // Opacidad ~40%
      default:
        return baseColor;
    }
  };

  const markerColor = getMarkerColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.markerContainer}
      activeOpacity={0.7}>
      <View style={[
        styles.marker, 
        { backgroundColor: markerColor }
      ]}>
        <Text style={[styles.numberText, { color: colors.background }]}>
          {orderNumber}
        </Text>
      </View>
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
  numberText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: '600',
  },
});

