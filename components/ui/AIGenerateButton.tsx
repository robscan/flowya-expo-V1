/**
 * AIGenerateButton - Botón de generación con IA
 * CANONICAL: Botón para generar contenido con OpenAI
 * 
 * Características:
 * - Estados: default, loading, error, success
 * - Usa tokens del design system
 * - Integración con FormField
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface AIGenerateButtonProps {
  /** Si está generando */
  isGenerating?: boolean;
  /** Si hay error */
  error?: string | null;
  /** Callback cuando se presiona */
  onPress: () => void;
  /** Callback cuando se presiona con long press (para seleccionar campos) */
  onLongPress?: () => void;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Tamaño del botón (default: 'medium') */
  size?: 'small' | 'medium' | 'large';
  /** Estilo adicional */
  style?: any;
}

/**
 * AIGenerateButton - Botón de generación con IA
 */
export function AIGenerateButton({
  isGenerating = false,
  error,
  onPress,
  onLongPress,
  disabled = false,
  size = 'medium',
  style,
}: AIGenerateButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const height = size === 'small' ? 32 : size === 'large' ? 56 : 48;
  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;
  const fontSize = size === 'small' ? textStyles.caption : textStyles.bodyMedium;

  const backgroundColor = isGenerating || disabled
    ? colors.icon + '40'
    : colors.tint + '20';

  const borderColor = colors.tint;

  return (
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor,
            borderColor,
            height,
            borderWidth: 1,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={disabled || isGenerating}
        activeOpacity={0.7}>
      {isGenerating ? (
        <ActivityIndicator size="small" color={colors.tint} />
      ) : (
        <>
          <Icon name="star" size={iconSize} color={colors.tint} />
          <Text style={[fontSize, { color: colors.tint, marginLeft: spacing.xs }]}>
            AI
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    minHeight: 32,
  },
});
