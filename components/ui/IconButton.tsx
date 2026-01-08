/**
 * IconButton Component
 * Componente canónico para botones de icono en headers y overlays
 * 
 * Responsabilidad:
 * - Botón de icono para acciones de navegación y control
 * - Área táctil mínima de 48x48px (accesibilidad)
 * - NO maneja navegación interna
 * - NO asume contexto de pantalla
 * 
 * Casos de uso:
 * - back, close, minimize, share, more, bookmark
 * 
 * Variantes:
 * - primary: Estilo principal (default)
 * - secondary: Estilo secundario
 * - ghost: Estilo transparente/sutil
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icon, IconName, iconTouchableContainer } from '@/components/ui/Icon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  variant?: IconButtonVariant;
  disabled?: boolean;
  size?: number;
  testID?: string;
}

export function IconButton({
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
  size = 24,
  testID,
}: IconButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          iconColor: colors.icon,
          opacity: disabled ? 0.4 : 1,
        };
      case 'ghost':
        return {
          iconColor: colors.icon,
          opacity: disabled ? 0.3 : 0.7,
        };
      case 'primary':
      default:
        return {
          iconColor: colors.text,
          opacity: disabled ? 0.4 : 1,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[iconTouchableContainer.base, styles.container]}
      activeOpacity={0.7}
      testID={testID}>
      <View style={[styles.iconWrapper, { opacity: variantStyles.opacity }]}>
        <Icon name={icon} size={size} color={variantStyles.iconColor} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // Hereda minWidth: 48, minHeight: 48 de iconTouchableContainer.base
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

