/**
 * Sistema de tipografía Inter
 * CRÍTICO: Inter como ÚNICA tipografía del proyecto
 * NO mezclar tipografías bajo ninguna circunstancia
 */

import { Platform } from 'react-native';

// Tamaños tipográficos (alineados a sistema base de 8px)
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
} as const;

// Line-height (alineados a múltiplos de 8px)
export const lineHeight = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 32,
  '2xl': 32,
  '3xl': 40,
  '4xl': 40,
} as const;

// Pesos de fuente Inter
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
} as const;

// Font family - Inter
// CRÍTICO: Usar exactamente estos nombres que coinciden con useFonts en _layout.tsx
export const fontFamily = Platform.select({
  ios: 'Inter-Regular',
  android: 'Inter-Regular',
  web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: 'Inter-Regular',
});

export const fontFamilyMedium = Platform.select({
  ios: 'Inter-Medium',
  android: 'Inter-Medium',
  web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: 'Inter-Medium',
});

export const fontFamilySemibold = Platform.select({
  ios: 'Inter-SemiBold',
  android: 'Inter-SemiBold',
  web: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  default: 'Inter-SemiBold',
});

/**
 * Tokens tipográficos predefinidos
 */
export const textStyles = {
  heading: {
    fontFamily: fontFamilySemibold,
    fontSize: fontSize['4xl'],
    lineHeight: lineHeight['4xl'],
    fontWeight: fontWeight.semibold,
  },
  heading2: {
    fontFamily: fontFamilySemibold,
    fontSize: fontSize['3xl'],
    lineHeight: lineHeight['3xl'],
    fontWeight: fontWeight.semibold,
  },
  heading3: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
    fontWeight: fontWeight.medium,
  },
  heading4: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    fontWeight: fontWeight.medium,
  },
  body: {
    fontFamily,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: fontWeight.regular,
  },
  bodyMedium: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontWeight: fontWeight.medium,
  },
  caption: {
    fontFamily,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.regular,
  },
  label: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    fontWeight: fontWeight.medium,
  },
} as const;

