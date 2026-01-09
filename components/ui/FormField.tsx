/**
 * FormField - Campo base de formulario
 * CANONICAL: Componente base para todos los campos de formulario
 * 
 * Proporciona estructura consistente: label, input/children, error message
 * Usa tokens del design system (spacing, colors, typography)
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface FormFieldProps {
  /** Label del campo */
  label?: string;
  /** Si el campo es requerido */
  required?: boolean;
  /** Mensaje de error a mostrar */
  error?: string;
  /** Contenido del campo (input, textarea, selector, etc.) */
  children: React.ReactNode;
  /** Estilo adicional para el contenedor */
  style?: any;
}

/**
 * FormField - Campo base de formulario
 * 
 * Estructura:
 * - Label (opcional, con indicador de requerido)
 * - Children (input, textarea, selector, etc.)
 * - Error message (si hay error)
 */
export function FormField({
  label,
  required = false,
  error,
  children,
  style,
}: FormFieldProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon }]}>
            {label}
            {required && (
              <Text style={{ color: colors.tint }}> *</Text>
            )}
          </Text>
        </View>
      )}
      {children}
      {error && (
        <Text style={[textStyles.caption, styles.error, { color: '#FF6B6B' }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  labelContainer: {
    marginBottom: spacing.xs,
  },
  error: {
    marginTop: spacing.xs,
  },
});
