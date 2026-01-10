/**
 * SectionHeader Component
 * Componente canónico para encabezados de sección
 * 
 * Responsabilidad:
 * - Renderizar títulos de sección con estilo consistente
 * - Opcionalmente incluir subtítulo y acciones declarativas (IconButton)
 * - NO maneja navegación
 * - NO gestiona estado global
 * - NO controla scroll - siempre visible, NO depende del scroll
 * 
 * Variantes:
 * - large: Título grande (default)
 * - small: Título pequeño
 */

import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon, IconName } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamilyMedium, fontSize, lineHeight, textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type SectionHeaderVariant = 'large' | 'small' | 'search';

export interface SectionHeaderAction {
  icon: IconName;
  onPress: () => void;
  tooltip?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

interface SectionHeaderProps {
  title?: string; // Optional for search variant
  subtitle?: string;
  actions?: SectionHeaderAction[];
  variant?: SectionHeaderVariant;
  // Search variant props
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
  onSearchSubmit?: () => void;
  autoFocus?: boolean;
}

export function SectionHeader({ 
  title, 
  subtitle,
  actions = [],
  variant = 'large',
  // Search variant props
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search places...',
  onSearchFocus,
  onSearchBlur,
  onSearchSubmit,
  autoFocus = false,
}: SectionHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // TextInput ref for autofocus
  const textInputRef = useRef<TextInput>(null);

  // Auto-focus for search variant when screen gains focus
  // CANONICAL: Focus when entering Search tab (not on mount to avoid deep links)
  useFocusEffect(
    useCallback(() => {
      if (variant === 'search' && autoFocus && textInputRef.current) {
        // Pequeño delay para asegurar que el componente esté completamente montado
        // Reducido a 150ms para mejor respuesta
        const timer = setTimeout(() => {
          textInputRef.current?.focus();
        }, 150);

        return () => clearTimeout(timer);
      }
    }, [variant, autoFocus])
  );

  const getVariantStyles = () => {
    if (variant === 'small') {
      return {
        fontSize: fontSize.base,
        lineHeight: lineHeight.base,
        fontWeight: '500' as const,
        marginBottom: spacing.sm,
      };
    }
    // large (default)
    return {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      fontWeight: '600' as const,
      marginBottom: spacing.md,
    };
  };

  const variantStyles = getVariantStyles();

  // Search variant: render title-style search input (header-integrated, no borders, no background)
  if (variant === 'search') {
    return (
      <View style={[
        styles.searchContainer,
        {
          borderBottomColor:
            colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      ]}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={colors.icon} style={styles.searchIcon} />
          <TextInput
            ref={textInputRef}
            style={[styles.searchInput, textStyles.heading3, { color: colors.text }]}
            value={searchValue || ''}
            onChangeText={onSearchChange || (() => {})}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.icon}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onSubmitEditing={onSearchSubmit}
            autoFocus={false}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            textAlignVertical="center"
            showSoftInputOnFocus={Platform.OS !== 'web'}
          />
        </View>
      </View>
    );
  }

  // SectionHeader siempre visible - NO depende del scroll
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }, variantStyles]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.icon }]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {actions.length > 0 && (
        <View style={styles.actionsContainer}>
          {actions.map((action, index) => (
            <IconButton
              key={index}
              icon={action.icon}
              onPress={action.onPress}
              variant={action.variant || 'secondary'}
              disabled={action.disabled}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  titleContainer: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  title: {
    fontFamily: fontFamilyMedium,
  },
  subtitle: {
    ...textStyles.caption,
    marginTop: spacing.xs / 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  searchContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    marginBottom: spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

