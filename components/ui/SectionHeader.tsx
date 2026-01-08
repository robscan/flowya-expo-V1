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

import { useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

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

  // Auto-focus for search variant
  useEffect(() => {
    if (variant === 'search' && autoFocus && textInputRef.current) {
      // Delay to ensure component is mounted
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [variant, autoFocus]);

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

  // Search variant: render title-style search input (no container, no borders, no background)
  if (variant === 'search') {
    return (
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={variantStyles.fontSize} color={colors.icon} style={styles.searchIcon} />
          <TextInput
            ref={textInputRef}
            style={[styles.searchInput, { color: colors.text }, variantStyles]}
            value={searchValue || ''}
            onChangeText={onSearchChange || (() => {})}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.icon}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            onSubmitEditing={onSearchSubmit}
            autoFocus={autoFocus}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            textAlignVertical="center"
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
    fontFamily: fontFamilyMedium,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

