/**
 * MapControls Component
 * Componente canónico para controles del mapa
 * 
 * Responsabilidad:
 * - Renderizar controles unificados del mapa (zoom, fullscreen)
 * - Estilo consistente con Design System (glass/blur)
 * - NO maneja lógica de mapa (solo renderiza controles)
 * 
 * Controles:
 * - Zoom: Botones + y - (vertical, inferior derecha)
 * - Fullscreen: Toggle opcional (inferior derecha, junto a zoom)
 */

import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreenToggle?: () => void;
  isFullscreen?: boolean;
  showFullscreen?: boolean;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onFullscreenToggle,
  isFullscreen = false,
  showFullscreen = false,
}: MapControlsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const buttonBaseStyle = [
    styles.controlButton,
    {
      backgroundColor:
        colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
    },
  ];

  return (
    <>
      {/* Zoom Controls - Inferior derecha (vertical) */}
      <View style={styles.zoomControls}>
        <Tooltip text="Zoom in">
          <Pressable
            style={({ pressed }) => [
              buttonBaseStyle,
              pressed && { opacity: 0.7 }
            ]}
            onPress={onZoomIn}>
            <GlassView
              style={styles.buttonContent}
              intensity="light"
              opacity="medium"
              shadowLevel="subtle"
              enableGlow={false}>
              <Icon name="add" size={20} color={colors.text} />
            </GlassView>
          </Pressable>
        </Tooltip>
        
        <View style={styles.buttonDivider} />
        
        <Tooltip text="Zoom out">
          <Pressable
            style={({ pressed }) => [
              buttonBaseStyle,
              pressed && { opacity: 0.7 }
            ]}
            onPress={onZoomOut}>
            <GlassView
              style={styles.buttonContent}
              intensity="light"
              opacity="medium"
              shadowLevel="subtle"
              enableGlow={false}>
              <Icon name="remove" size={20} color={colors.text} />
            </GlassView>
          </Pressable>
        </Tooltip>

        {/* Fullscreen Toggle - Debajo de zoom controls */}
        {showFullscreen && onFullscreenToggle && (
          <>
            <View style={styles.buttonDivider} />
            <Tooltip text={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
              <Pressable
                style={({ pressed }) => [
                  buttonBaseStyle,
                  pressed && { opacity: 0.7 }
                ]}
                onPress={onFullscreenToggle}>
                <GlassView
                  style={styles.buttonContent}
                  intensity="light"
                  opacity="medium"
                  shadowLevel="subtle"
                  enableGlow={false}>
                  <Icon
                    name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
                    size={18}
                    color={colors.text}
                  />
                </GlassView>
              </Pressable>
            </Tooltip>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  zoomControls: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.md,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 20,
    gap: 0,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    // @ts-ignore - touch-action es válido en web
    ...(Platform.OS === 'web' && { touchAction: 'manipulation' }),
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDivider: {
    height: 2,
    width: 32,
    marginVertical: spacing.xs / 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});

