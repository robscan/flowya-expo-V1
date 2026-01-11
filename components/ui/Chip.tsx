/**
 * Chip Component
 * Componente canónico para representar categorías, tipos o estados informativos
 * 
 * Responsabilidad:
 * - Representar información categórica o de estado
 * - NO es un botón interactivo
 * - NO maneja navegación
 * 
 * Variantes:
 * - default: Estilo estándar con fondo sutil
 * - subtle: Estilo más discreto
 * - highlighted: Estilo destacado para información importante
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon, IconName } from '@/components/ui/Icon';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ChipVariant = 'default' | 'subtle' | 'highlighted';

interface ChipProps {
  text: string;
  variant?: ChipVariant;
  icon?: IconName;
}

export function Chip({ text, variant = 'default', icon }: ChipProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Validar que text no esté vacío (defensa en profundidad)
  if (!text || text.trim().length === 0) {
    return null;
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'subtle':
        return {
          backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          textColor: colors.icon,
        };
      case 'highlighted':
        return {
          backgroundColor: colors.tint + '20',
          borderColor: colors.tint + '40',
          borderWidth: 1,
          textColor: colors.tint,
        };
      case 'default':
      default:
        return {
          backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: colors.text,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantStyles.backgroundColor,
          borderColor: variantStyles.borderColor,
          borderWidth: variantStyles.borderWidth,
        },
      ]}>
      {icon && (
        <Icon
          name={icon}
          size={14}
          color={variantStyles.textColor}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: variantStyles.textColor,
          },
        ]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  icon: {
    marginRight: spacing.xs / 2,
  },
  text: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

