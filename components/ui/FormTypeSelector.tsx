/**
 * FormTypeSelector - Selector de tipo de spot
 * CANONICAL: Grid horizontal de tipos de spot seleccionables
 * 
 * Características:
 * - Grid horizontal scrollable
 * - Estados: default, selected
 * - Usa tokens del design system
 * - Integración con FormField
 */

import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { SpotType } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface FormTypeSelectorProps {
  /** Tipo seleccionado */
  selectedType: SpotType;
  /** Callback cuando se selecciona un tipo */
  onSelectType: (type: SpotType) => void;
  /** Tipos disponibles (default: todos los tipos) */
  types?: SpotType[];
  /** Estilo adicional */
  style?: any;
}

const SPOT_TYPES: SpotType[] = [
  'beach',
  'cafe',
  'viewpoint',
  'museum',
  'restaurant',
  'park',
  'monument',
  'market',
  'other',
];

function getSpotTypeLabel(type: SpotType): string {
  const labels: Record<SpotType, string> = {
    beach: 'Beach',
    cafe: 'Café',
    viewpoint: 'Viewpoint',
    museum: 'Museum',
    restaurant: 'Restaurant',
    park: 'Park',
    monument: 'Monument',
    market: 'Market',
    other: 'Other',
  };
  return labels[type] || 'Other';
}

/**
 * FormTypeSelector - Selector de tipo de spot
 */
export function FormTypeSelector({
  selectedType,
  onSelectType,
  types = SPOT_TYPES,
  style,
}: FormTypeSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <FlatList
      data={types}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
      keyExtractor={(item) => item}
      renderItem={({ item: spotType }) => {
        const isSelected = selectedType === spotType;
        return (
          <TouchableOpacity
            style={[
              styles.typeButton,
              {
                backgroundColor: isSelected
                  ? colors.tint + '20'
                  : colors.icon + '10',
                borderColor: isSelected ? colors.tint : 'transparent',
              },
            ]}
            onPress={() => onSelectType(spotType)}
            activeOpacity={0.7}>
            <Text
              style={[
                textStyles.caption,
                {
                  color: isSelected ? colors.tint : colors.text,
                },
              ]}>
              {getSpotTypeLabel(spotType)}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  typeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
  },
});
