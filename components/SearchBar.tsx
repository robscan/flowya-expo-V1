/**
 * Search Bar Component
 * Scope 10: Search Screen - Barra de búsqueda
 * 
 * Principios de diseño:
 * - Estilo glass
 * - Inspiración Apple Music
 * - Placeholder claro
 * - Focus states
 */

import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';

import { Colors } from '@/constants/theme';
import { spacing } from '@/constants/spacing';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Buscar lugares...',
  onFocus,
  onBlur,
  onSubmitEditing,
  autoFocus = false,
}: SearchBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <GlassView style={styles.container} intensity="medium" opacity="medium">
      <View style={styles.content}>
        <Icon name="search" size={20} color={colors.icon} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.icon}
          onFocus={onFocus}
          onBlur={onBlur}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            style={styles.clearButton}
            activeOpacity={0.7}>
            <Icon name="close" size={16} color={colors.icon} />
          </TouchableOpacity>
        )}
      </View>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    ...textStyles.body,
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs / 2,
  },
});

