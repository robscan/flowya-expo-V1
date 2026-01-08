/**
 * Flow Mini Player Component
 * 
 * @deprecated Este componente es legacy y ha sido reemplazado por FlowMiniBar.
 * FlowMiniBar representa estado de movimiento activo, no reproductor de audio.
 * 
 * Este archivo se mantiene temporalmente para referencia.
 * Se eliminará después de confirmar que la migración está completa.
 * 
 * Componente minimizado que muestra el estado del flow activo y permite controlar la reproducción.
 * Se posiciona sobre el tab bar cuando un flow está activo o pausado.
 * 
 * @component
 * 
 * ## Responsabilidades
 * 
 * ### SÍ tiene:
 * - Renderizar UI del mini player (imagen, nombre, distancia, controles)
 * - Reflejar estado del flow desde FlowContext
 * - Controlar reproducción básica (play/pause, previous/next, mute)
 * - Calcular y mostrar distancia al spot (si userLocation está disponible)
 * - Toggle entre millas/km (estado interno)
 * - Posicionarse sobre el tab bar con animación
 * - Ocultarse cuando FlowScreen está abierto
 * 
 * ### NO tiene:
 * - Navegación (usa callback onExpand, el padre decide navegar)
 * - Gestión de ubicación (recibe userLocation como prop opcional)
 * - Edición de spots o modificación del flow
 * - Decisión de layout de pantalla (eso es responsabilidad del padre)
 * 
 * ## Props
 * 
 * @param {() => void} [onExpand] - Callback cuando se expande el player (toca el player o botón expand).
 *                                  El componente llama expandFlow() del contexto y luego onExpand().
 * @param {{ latitude: number; longitude: number } | null} [userLocation] - Ubicación opcional del usuario
 *                                                                          para calcular distancia al spot.
 *                                                                          Si no se proporciona, no se muestra distancia.
 * 
 * ## Ejemplo de uso
 * 
 * ```tsx
 * // Uso básico (sin ubicación)
 * <FlowMiniPlayer onExpand={() => router.push('/flow-screen')} />
 * 
 * // Con ubicación
 * const [location, setLocation] = useState(null);
 * <FlowMiniPlayer 
 *   userLocation={location}
 *   onExpand={() => router.push('/flow-screen')} 
 * />
 * ```
 */

import { usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FlowPlayerControls } from '@/components/FlowPlayerControls';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamily, fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { usePath } from '@/contexts/PathContext';
import { useSpot } from '@/contexts/SpotContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateDistanceToSpot } from '@/utils/distance';
import { getValidImage, hasValidImage } from '@/utils/imageHelpers';

interface FlowMiniPlayerProps {
  /** Callback cuando se expande el player (toca el player o botón expand) */
  onExpand?: () => void;
  /** Ubicación opcional del usuario para calcular distancia al spot. Si no se proporciona, no se muestra distancia. */
  userLocation?: { latitude: number; longitude: number } | null;
}

// Helper para formatear distancia
function formatDistance(distance?: number, useMiles: boolean = false): string | null {
  if (!distance) return null;
  
  if (useMiles) {
    // Convertir metros a millas (1 milla = 1609.34 metros)
    const miles = distance / 1609.34;
    if (miles < 0.1) {
      // Si es menos de 0.1 millas, mostrar en pies (1 milla = 5280 pies)
      const feet = (miles * 5280).toFixed(0);
      return `${feet} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  }
  
  // Sistema métrico
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)} km`;
}

export function FlowMiniPlayer({ onExpand, userLocation: propUserLocation }: FlowMiniPlayerProps) {
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { flowState, currentSpotId, expandFlow } = useFlow();
  const { getFlowById } = usePath();
  const { getSpotById } = useSpot();
  const { tabBarHeight } = useOverlay();
  const [useMiles, setUseMiles] = useState(false);
  const bottomAnim = useRef(new Animated.Value(tabBarHeight)).current;

  // Determinar visibilidad: solo visible cuando flow está activo o pausado
  const isVisible = flowState.status === 'active' || flowState.status === 'paused';
  const flow = flowState.currentPathId ? getFlowById(flowState.currentPathId) : null;
  const currentSpot = currentSpotId ? getSpotById(currentSpotId) : null;

  // Ocultar cuando FlowScreen está abierta
  const isFlowScreenOpen = pathname === '/flow-screen' || pathname?.includes('flow-screen');

  // Animar el bottom cuando cambia la altura del tab bar
  useEffect(() => {
    Animated.timing(bottomAnim, {
      toValue: tabBarHeight,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [tabBarHeight, bottomAnim]);

  // Early return si no debe mostrarse
  if (!isVisible || !flow || !currentSpot || isFlowScreenOpen) {
    return null;
  }

  // Calcular distancia al spot si userLocation está disponible
  const distance = propUserLocation ? calculateDistanceToSpot(propUserLocation, currentSpot.location) : null;
  const distanceText = formatDistance(distance || undefined, useMiles);

  const hasImage = hasValidImage(currentSpot.photos);
  const imageUrl = getValidImage(currentSpot.photos);

  const handleDistancePress = (e: any) => {
    e.stopPropagation();
    if (distance) {
      setUseMiles(!useMiles);
    }
  };

  const handleExpand = () => {
    // Expandir flow desde contexto y notificar al padre
    expandFlow();
    onExpand?.();
  };

  return (
    <Animated.View
      style={[
        staticStyles.container,
        {
          bottom: bottomAnim, // Usar valor animado
        },
      ]}>
      <Pressable onPress={handleExpand} style={staticStyles.pressable}>
      <GlassView 
        style={staticStyles.player} 
        intensity="medium" 
        opacity="strong"
        shadowLevel="strong"
        enableGlow={true}
        useGrayBackground={true}
      >
        <View style={staticStyles.content}>
          {/* Imagen del spot */}
          {hasImage && imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={staticStyles.spotImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[staticStyles.spotImagePlaceholder, { backgroundColor: colors.icon + '20' }]}>
              <Icon name="upload" size={16} color={colors.icon} />
            </View>
          )}

          {/* Información: Nombre y distancia */}
          <View style={staticStyles.info}>
            <Text style={[staticStyles.spotName, { color: colors.text }]} numberOfLines={1}>
              {currentSpot.name || 'Current spot'}
            </Text>
            {distanceText && (
              <TouchableOpacity 
                onPress={handleDistancePress}
                activeOpacity={0.7}
                style={staticStyles.distanceContainer}
                hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              >
                <Icon name="map" size={10} color={colors.icon} />
                <Text style={[staticStyles.distanceText, { color: colors.icon }]}>
                  {distanceText}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Controles: Atrás, Play/Pause, Adelante, Mute */}
          <FlowPlayerControls
            variant="mini"
            showPrevious={true}
            showNext={true}
            showMute={true}
            compact={true}
            onExpand={handleExpand}
          />
        </View>
      </GlassView>
    </Pressable>
    </Animated.View>
  );
}

// Estilos estáticos
const staticStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  pressable: {
    width: '100%',
  },
  player: {
    borderRadius: 0, // Sin bordes redondeados - se fusiona con viewport
    paddingVertical: spacing.xs / 2, // 4px padding vertical mínimo
    paddingHorizontal: spacing.xs, // 8px padding horizontal mínimo
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs, // 8px entre elementos (mínimo)
  },
  spotImage: {
    width: 32, // 32px
    height: 32, // 32px
    borderRadius: borderRadius.sm, // 8px
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  spotImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm, // 8px
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2, // 2px entre nombre y distancia (mínimo)
  },
  spotName: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.xs, // 12px - tamaño más pequeño
    lineHeight: lineHeight.xs, // 16px
    fontWeight: '500',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2, // 2px entre icono y texto (mínimo)
  },
  distanceText: {
    fontFamily,
    fontSize: fontSize.xs, // 12px - mismo tamaño que nombre
    lineHeight: lineHeight.xs, // 16px
    fontWeight: '400',
  },
  // controls y controlButton ahora están en FlowPlayerControls (con 48px mínimo)
});
