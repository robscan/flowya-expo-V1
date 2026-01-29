/**
 * Componente Glass View - Estilo Apple
 * Efecto blur y transparencia para glassmorphism
 */

import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createGlassStyle, ShadowLevel, glowColors } from '@/utils/glassStyles';

export interface GlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
  opacity?: 'light' | 'medium' | 'strong';
  shadowLevel?: ShadowLevel; // Nueva prop para controlar elevación
  enableGlow?: boolean; // Nueva prop para activar glow interno
  useGrayBackground?: boolean; // Nueva prop: usar fondo gris (cuando no hay imagen)
}

export function GlassView({
  children,
  style,
  intensity = 'medium',
  opacity = 'strong',
  shadowLevel = 'none',
  enableGlow = true,
  useGrayBackground = false,
}: GlassViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const glassStyle = createGlassStyle(colorScheme, opacity, shadowLevel, enableGlow, useGrayBackground);
  const glow = glowColors[colorScheme];
  
  // En dark mode, usar borderWidth más delgado para suavizar
  const contourBorderWidth = colorScheme === 'dark' ? 0.5 : 1;

  // Componente base con glow interno
  const renderContent = () => {
    // Obtener border radius del style si existe
    const borderRadius = (style as any)?.borderRadius || 0;

    return (
      <View style={[styles.container, glassStyle, style]}>
        {/* Glow interno - simula resplandor de luz reflejado en el borde */}
        {/* Blanco puro que se acentúa por la sombra */}
        {enableGlow && (
          <>
            {/* Glow en borde superior - más visible en el centro, blanco puro */}
            <View
              style={[
                styles.glowTop,
                {
                  backgroundColor: glow.top,
                  borderTopLeftRadius: borderRadius,
                  borderTopRightRadius: borderRadius,
                },
              ]}
            />
            {/* Glow en borde superior secundario - se degrada hacia los lados */}
            <View
              style={[
                styles.glowTopSecondary,
                {
                  backgroundColor: glow.sides,
                  borderTopLeftRadius: borderRadius,
                  borderTopRightRadius: borderRadius,
                },
              ]}
            />
            {/* Glow completo en contorno - blanco puro, acentuado por la sombra */}
            <View
              style={[
                styles.glowContour,
                {
                  borderColor: glow.contour,
                  borderRadius: borderRadius || 0,
                  borderWidth: contourBorderWidth, // Más delgado en dark mode
                },
              ]}
            />
          </>
        )}
        {children}
      </View>
    );
  };

  if (Platform.OS === 'web') {
    // Web: usar solo transparencia sin blur
    return renderContent();
  }

  // iOS/Android: usar BlurView nativo
  const blurIntensityValue =
    intensity === 'light' ? 25 : intensity === 'medium' ? 35 : 45;

  return (
    <BlurView
      intensity={blurIntensityValue}
      tint={colorScheme === 'dark' ? 'dark' : 'light'}
      style={styles.blurContainer}>
      {renderContent()}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    overflow: 'hidden',
  },
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  glowTop: {
    position: 'absolute',
    top: 0,
    left: '30%',
    right: '30%',
    height: 1,
    pointerEvents: 'none',
    zIndex: 1,
  },
  glowTopSecondary: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: 0.5,
    pointerEvents: 'none',
    zIndex: 1,
  },
  glowContour: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    pointerEvents: 'none',
    zIndex: 1,
  },
});

