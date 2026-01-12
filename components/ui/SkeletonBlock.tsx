/**
 * SkeletonBlock Component
 * CANONICAL: Bloque genérico de skeleton con animación shimmer
 * 
 * Componente base para todos los skeletons.
 * Usa tokens del Design System (spacing, colors).
 * 
 * @component
 */

import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, ViewStyle } from 'react-native';

export interface SkeletonBlockProps {
  /** Ancho del bloque (número o string con %) */
  width?: number | string;
  /** Alto del bloque */
  height?: number;
  /** Radio de borde */
  borderRadius?: number;
  /** Estilos adicionales */
  style?: ViewStyle;
  /** Variante de tamaño predefinido */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * SkeletonBlock - Bloque genérico con animación shimmer
 * 
 * Usa tokens del Design System para dimensiones y colores.
 * Animación ligera de shimmer para feedback visual.
 */
export function SkeletonBlock({
  width = '100%',
  height,
  borderRadius = spacing.xs,
  style,
  size,
}: SkeletonBlockProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const shimmerTranslateX = useRef(new Animated.Value(-200)).current;

  // Tamaños predefinidos basados en spacing tokens
  const sizeMap = {
    xs: { height: spacing.xs, borderRadius: spacing.xs / 2 },
    sm: { height: spacing.sm, borderRadius: spacing.xs },
    md: { height: spacing.md, borderRadius: spacing.xs },
    lg: { height: spacing.lg, borderRadius: spacing.sm },
    xl: { height: spacing.xl, borderRadius: spacing.sm },
  };

  const sizeProps = size ? sizeMap[size] : {};

  useEffect(() => {
    // Animación de shimmer (gradiente que se mueve horizontalmente)
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerTranslateX, {
          toValue: 400,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shimmerTranslateX, {
          toValue: -200,
          duration: 0,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    ).start();
  }, [shimmerTranslateX]);

  const baseColor = colors.icon + '20';
  const shimmerColor = colorScheme === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.25)';

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        {
          width,
          height: height ?? sizeProps.height,
          borderRadius: borderRadius ?? sizeProps.borderRadius,
          backgroundColor: baseColor,
          overflow: 'hidden',
        },
        style,
      ]}>
      {/* Shimmer effect */}
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: shimmerTranslateX }],
          },
        ]}>
        <LinearGradient
          colors={['transparent', shimmerColor, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
});
