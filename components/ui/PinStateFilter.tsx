/**
 * PinStateFilter Component
 * Filtro de estado de Pin (All | To Visit | Visited)
 * Similar a SavedFilterHeader pero para estados de Pin
 * 
 * Funcionalidades:
 * - Tabs horizontales para filtrar por estado de Pin
 * - Opciones: All, To Visit, Visited
 * - Estilo similar a SavedFilterHeader
 */

import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type PinStateFilterType = 'all' | 'to_visit' | 'visited';

interface PinStateFilterProps {
  currentFilter: PinStateFilterType; // Filtro actual
  onFilterChange: (filter: PinStateFilterType) => void; // Callback cuando se cambia el filtro
}

export function PinStateFilter({
  currentFilter,
  onFilterChange,
}: PinStateFilterProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Opciones del filtro (orden fijo)
  const filterOptions: { value: PinStateFilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'to_visit', label: 'To Visit' },
    { value: 'visited', label: 'Visited' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor:
            colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      ]}>
      <View style={styles.tabsContainer}>
        {filterOptions.map((option) => {
          const isSelected = currentFilter === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onFilterChange(option.value)}
              style={[
                styles.tab,
                isSelected && styles.tabActive,
                {
                  borderBottomColor: isSelected ? colors.tint : 'transparent',
                },
              ]}
              activeOpacity={0.7}>
              <Text
                style={[
                  textStyles.body,
                  {
                    color: isSelected ? colors.tint : colors.icon,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    marginBottom: spacing.sm,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tab: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 2,
    marginBottom: -spacing.sm - 1, // Overlap con border del container
  },
  tabActive: {
    // Estilo activo manejado por borderBottomColor dinámico
  },
});
