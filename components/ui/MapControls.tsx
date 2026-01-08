/**
 * MapControls Component
 * Componente canónico para controles del mapa
 * 
 * Responsabilidad:
 * - Renderizar controles unificados del mapa (zoom, fullscreen, ubicación)
 * - Estilo consistente con Design System (glass/blur)
 * - NO maneja lógica de mapa (solo renderiza controles)
 * 
 * Controles:
 * - Zoom: Botones + y - (vertical, inferior derecha)
 * - Fullscreen: Toggle opcional (inferior derecha, junto a zoom)
 * - Mi ubicación: Botón opcional (inferior izquierda, separado)
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon, IconName } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterLocation?: () => void;
  onFullscreenToggle?: () => void;
  isFullscreen?: boolean;
  showFullscreen?: boolean;
  showLocation?: boolean;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onCenterLocation,
  onFullscreenToggle,
  isFullscreen = false,
  showFullscreen = false,
  showLocation = true,
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
          <TouchableOpacity
            style={buttonBaseStyle}
            onPress={onZoomIn}
            activeOpacity={0.7}>
            <GlassView
              style={styles.buttonContent}
              intensity="light"
              opacity="medium"
              shadowLevel="subtle"
              enableGlow={false}>
              <Icon name="add" size={20} color={colors.text} />
            </GlassView>
          </TouchableOpacity>
        </Tooltip>
        
        <View style={styles.buttonDivider} />
        
        <Tooltip text="Zoom out">
          <TouchableOpacity
            style={buttonBaseStyle}
            onPress={onZoomOut}
            activeOpacity={0.7}>
            <GlassView
              style={styles.buttonContent}
              intensity="light"
              opacity="medium"
              shadowLevel="subtle"
              enableGlow={false}>
              <Icon name="remove" size={20} color={colors.text} />
            </GlassView>
          </TouchableOpacity>
        </Tooltip>

        {/* Fullscreen Toggle - Debajo de zoom controls */}
        {showFullscreen && onFullscreenToggle && (
          <>
            <View style={styles.buttonDivider} />
            <Tooltip text={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
              <TouchableOpacity
                style={buttonBaseStyle}
                onPress={onFullscreenToggle}
                activeOpacity={0.7}>
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
              </TouchableOpacity>
            </Tooltip>
          </>
        )}
      </View>

      {/* Location Button - Inferior izquierda (separado) */}
      {showLocation && onCenterLocation && (
        <View style={styles.locationButton}>
          <Tooltip text="Center on your location">
            <TouchableOpacity
              style={buttonBaseStyle}
              onPress={onCenterLocation}
              activeOpacity={0.7}>
              <GlassView
                style={styles.buttonContent}
                intensity="light"
                opacity="medium"
                shadowLevel="subtle"
                enableGlow={false}>
                <Icon name="map" size={20} color={colors.tint} />
              </GlassView>
            </TouchableOpacity>
          </Tooltip>
        </View>
      )}
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
  locationButton: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    zIndex: 20,
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

