/**
 * FormTextArea - Textarea canónico
 * CANONICAL: Textarea multiline para formularios
 * 
 * Características:
 * - Estados: default, focused, error, disabled
 * - Usa tokens del design system
 * - Altura mínima configurable
 * - Integración con FormField
 */

import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';

import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontSize } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface FormTextAreaProps extends Omit<TextInputProps, 'style'> {
  /** Si el campo tiene error */
  error?: boolean;
  /** Si el campo está deshabilitado */
  disabled?: boolean;
  /** Altura mínima (default: 100) */
  minHeight?: number;
  /** Número de líneas visibles (default: 3) */
  numberOfLines?: number;
  /** Estilo adicional */
  style?: any;
}

/**
 * FormTextArea - Textarea canónico
 */
export function FormTextArea({
  error = false,
  disabled = false,
  minHeight = 100,
  numberOfLines = 3,
  style,
  ...textInputProps
}: FormTextAreaProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? '#FF6B6B'
    : isFocused
    ? colors.tint
    : colors.icon + '30';

  const backgroundColor = disabled
    ? colors.icon + '10'
    : colors.background;

  return (
    <TextInput
      style={[
        styles.textArea,
        {
          borderColor,
          backgroundColor,
          color: colors.text,
          minHeight,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      placeholderTextColor={colors.icon}
      editable={!disabled}
      multiline
      numberOfLines={numberOfLines}
      textAlignVertical="top"
      onFocus={(e) => {
        setIsFocused(true);
        textInputProps.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        textInputProps.onBlur?.(e);
      }}
      {...textInputProps}
    />
  );
}

const styles = StyleSheet.create({
  textArea: {
    fontFamily: 'Inter-Regular',
    fontSize: fontSize.base,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.sm,
    paddingTop: spacing.sm,
  },
});
