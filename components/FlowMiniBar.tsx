/**
 * FlowMiniBar Component
 * CANONICAL: Barra compacta que muestra estado de movimiento activo del Flow
 * 
 * Representa estado de movimiento, NO reproductor de audio.
 * Muestra progreso real basado en spots visitados.
 * 
 * Responsabilidades:
 * - Mostrar estado "Now moving"
 * - Mostrar indicador "X spots added"
 * - Mostrar stepper de progreso con estados reales (completado/activo/pendiente)
 * - Posicionarse correctamente según visibilidad del Bottom Nav Bar
 * - Ocultarse cuando FlowScreen está abierta
 */

import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { usePath } from '@/contexts/PathContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFlowSubtitle } from '@/hooks/useFlowSubtitle';

interface FlowMiniBarProps {
  /** Callback cuando se toca la barra para expandir a FlowScreen */
  onExpand?: () => void;
}

export function FlowMiniBar({ onExpand }: FlowMiniBarProps) {
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { flowState, expandFlow } = useFlow();
  const { getFlowById } = usePath();
  const { isTabBarVisible, tabBarHeight } = useOverlay();
  const bottomAnim = useRef(new Animated.Value(isTabBarVisible ? tabBarHeight : 0)).current;
  const subtitle = useFlowSubtitle(); // P0-06: Obtener subtítulo actual basado en eventos

  // Determinar visibilidad: solo visible cuando flow está activo o pausado
  const isVisible = flowState.status === 'active' || flowState.status === 'paused';
  const flow = flowState.flowId ? getFlowById(flowState.flowId) : null;

  // Ocultar cuando FlowScreen está abierta
  const isFlowScreenOpen = pathname === '/flow-screen' || pathname?.includes('flow-screen');

  // Animar el bottom cuando cambia la visibilidad del tab bar
  useEffect(() => {
    const targetBottom = isTabBarVisible ? tabBarHeight : 0;
    Animated.timing(bottomAnim, {
      toValue: targetBottom,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isTabBarVisible, tabBarHeight, bottomAnim]);

  // Early return si no debe mostrarse
  if (!isVisible || !flow || isFlowScreenOpen) {
    return null;
  }

  const totalSpots = flow.spots.length;
  const spotsText = totalSpots === 1 ? '1 spot agregado' : `${totalSpots} spots agregados`;

  const handlePress = () => {
    expandFlow();
    onExpand?.();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomAnim,
        },
      ]}>
      <Pressable onPress={handlePress} style={styles.pressable}>
        <GlassView
          style={styles.bar}
          intensity="medium"
          opacity="strong"
          shadowLevel="medium"
          enableGlow={true}
          useGrayBackground={true}>
          <View style={styles.content}>
            {/* Texto de estado y indicador */}
            <View style={styles.textContainer}>
              {/* P0-06: Mostrar subtítulo si existe, sino "Now moving" - Patrón declarativo consistente con FlowPlayerControls */}
              {(subtitle?.shortText && subtitle.shortText.trim().length > 0) ? (
                <Text style={[textStyles.heading5, { color: colors.text }]} numberOfLines={1}>
                  {subtitle.shortText || ''}
                </Text>
              ) : (
                <Text style={[textStyles.heading5, { color: colors.text }]}>
                  En movimiento
                </Text>
              )}
              <Text style={[textStyles.bodySmall, { color: colors.icon }]}>
                {spotsText}
              </Text>
            </View>

            {/* Stepper de progreso */}
            <View style={styles.stepperContainer}>
              {flow.spots.map((spotId, index) => {
                const currentSpotIndex = flowState.currentSpotIndex;
                const isCompleted = index < currentSpotIndex;
                const isActive = index === currentSpotIndex;
                const isPending = index > currentSpotIndex;

                return (
                  <View
                    key={spotId}
                    style={[
                      styles.stepIndicator,
                      isCompleted && {
                        backgroundColor: colors.tint,
                      },
                      isActive && {
                        backgroundColor: colors.tint,
                        width: 8,
                        height: 8,
                      },
                      isPending && {
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderColor: colors.icon + '40',
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>
        </GlassView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  pressable: {
    width: '100%',
  },
  bar: {
    borderRadius: 0, // Sin bordes redondeados - se fusiona con viewport
    paddingVertical: spacing.xs, // 8px padding vertical
    paddingHorizontal: spacing.md, // 16px padding horizontal
    overflow: 'hidden',
  },
  content: {
    gap: spacing.xs, // 8px entre texto y stepper
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2, // 4px entre indicadores
    height: 8, // Altura fija para el stepper (acomodar indicador activo más grande)
  },
  stepIndicator: {
    flex: 1, // Cada indicador ocupa espacio igual
    height: 4,
    borderRadius: 2,
    minWidth: 4, // Ancho mínimo para visibilidad
    maxWidth: 8, // Máximo para indicador activo
  },
});
