/**
 * FormTextInput - Input de texto canónico
 * CANONICAL: Input de texto para formularios
 * 
 * Características:
 * - Estados: default, focused, error, disabled
 * - Usa tokens del design system
 * - Área táctil mínima 48px
 * - Integración con FormField
 */

import React, { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontSize, textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface FormTextInputProps extends Omit<TextInputProps, 'style'> {
  /** Si el campo tiene error */
  error?: boolean;
  /** Si el campo está deshabilitado */
  disabled?: boolean;
  /** Icono opcional a la izquierda */
  leftIcon?: string;
  /** Icono opcional a la derecha (ej: clear button) */
  rightIcon?: string;
  /** Callback cuando se presiona el icono derecho */
  onRightIconPress?: () => void;
  /** Estilo adicional */
  style?: any;
}

/**
 * FormTextInput - Input de texto canónico
 */
export function FormTextInput({
  error = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...textInputProps
}: FormTextInputProps) {
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
    <View
      style={[
        styles.container,
        {
          borderColor,
          backgroundColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}>
      {leftIcon && (
        <View style={styles.leftIconContainer}>
          <Icon name={leftIcon as any} size={20} color={colors.icon} />
        </View>
      )}
      <TextInput
        style={[
          styles.input,
          {
            color: colors.text,
            paddingLeft: leftIcon ? spacing.xs : spacing.sm,
            paddingRight: rightIcon ? spacing.xs : spacing.sm,
          },
        ]}
        placeholderTextColor={colors.icon}
        editable={!disabled}
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
      {rightIcon && (
        <TouchableOpacity
          style={styles.rightIconContainer}
          onPress={onRightIconPress}
          disabled={!onRightIconPress}
          activeOpacity={0.7}>
          <Icon name={rightIcon as any} size={20} color={colors.icon} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48, // Área táctil mínima
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: fontSize.base,
    minHeight: 48,
    textAlignVertical: 'center',
  },
  leftIconContainer: {
    marginRight: spacing.xs,
  },
  rightIconContainer: {
    marginLeft: spacing.xs,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
