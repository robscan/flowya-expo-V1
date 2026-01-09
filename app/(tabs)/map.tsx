/**
 * Map Screen
 * Tab independiente en el Tab Bar principal
 * 
 * Exploración libre y planeación.
 * Muestra Spots incluso lejanos.
 * Permite crear y ajustar Spots.
 */

import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

import { FlowyaMapView, FlowyaMapViewRef } from '@/components/MapView';
import { SpotInlineCard } from '@/components/SpotInlineCard';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { MapControls } from '@/components/ui/MapControls';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useOverlay } from '@/contexts/OverlayContext';
import { useSpot } from '@/contexts/SpotContext';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { useSpotDistance } from '@/hooks/useSpotDistance';

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ spotId?: string }>();
  const colors = Colors[colorScheme ?? 'light'];
  const mapViewRef = useRef<FlowyaMapViewRef>(null);
  const [highlightedSpotId, setHighlightedSpotId] = useState<string | undefined>(params.spotId);

  // Ubicación base estable
  const { baseLocation } = useBaseLocation();

  const { spots, isLoading: spotsLoading } = useSpot();
  const { setIsTabBarVisible } = useOverlay();
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Calcular distancia del spot seleccionado (siempre, no condicionalmente)
  const selectedSpotDistance = useSpotDistance(selectedSpot?.id || null, baseLocation);

  // CANONICAL: TabBar visible when Map is active, hidden when fullscreen
  useFocusEffect(
    useCallback(() => {
      // Solo establecer visible si no está en fullscreen
      if (!isFullscreen) {
        setIsTabBarVisible(true);
      }
    }, [setIsTabBarVisible, isFullscreen])
  );

  // CANONICAL: Ocultar/mostrar TabBar según estado de fullscreen
  useEffect(() => {
    setIsTabBarVisible(!isFullscreen);
  }, [isFullscreen, setIsTabBarVisible]);

  // CANONICAL: Forzar resize del mapa cuando cambia fullscreen
  useEffect(() => {
    // Pequeño delay para asegurar que el layout se haya actualizado
    const timer = setTimeout(() => {
      if (mapViewRef.current) {
        mapViewRef.current.resize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Handle Spot selection
  const handleSpotPress = (spot: Spot) => {
    setSelectedSpot(spot);
  };

  // Handle SpotCard press (navegar a SpotDetail)
  const handleSpotCardPress = (spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
    setSelectedSpot(null); // Limpiar selección
  };

  // Handle zoom
  const handleZoomIn = () => {
    if (mapViewRef.current) {
      mapViewRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapViewRef.current) {
      mapViewRef.current.zoomOut();
    }
  };

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle Spot creation from map (long press)
  const handleMapLongPress = (location: { latitude: number; longitude: number }) => {
    router.push(`/create-spot?lat=${location.latitude}&lng=${location.longitude}`);
  };

  // Handle Spot creation from button (+)
  const handleCreateSpotPress = () => {
    // Usar ubicación base si está disponible, sino usar ubicación por defecto
    const location = baseLocation || {
      latitude: -12.0464,
      longitude: -77.0428,
    };
    router.push(`/create-spot?lat=${location.latitude}&lng=${location.longitude}`);
  };

  // Handle center on user location
  const handleCenterOnUserLocation = () => {
    if (!baseLocation) return;
    
    // Llamar a la función expuesta desde FlowyaMapView usando el ref
    if (mapViewRef.current) {
      mapViewRef.current.centerOnUserLocation();
    }
    // Limpiar destacado al centrar en usuario
    setHighlightedSpotId(undefined);
  };

  // Centrar y destacar spot cuando hay spotId en params
  useEffect(() => {
    if (!params.spotId || spotsLoading) {
      return;
    }

    const spot = spots.find(s => s.id === params.spotId);
    if (!spot) {
      console.warn(`MapScreen: Spot with id ${params.spotId} not found`);
      return;
    }

    // Establecer highlightedSpotId primero para que el mapa pueda mostrarlo
    setHighlightedSpotId(params.spotId);

    // Centrar inmediatamente sin animación ni delay
    if (mapViewRef.current) {
      mapViewRef.current.centerOnSpot(params.spotId!);
    }
    // El card solo aparecerá si el usuario toca explícitamente el marker
  }, [params.spotId, spots, spotsLoading]);

  // Limpiar selección cuando cambia highlightedSpotId desde params
  useEffect(() => {
    if (!params.spotId) {
      setSelectedSpot(null);
    }
  }, [params.spotId]);

  if (spotsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  // Estilo del botón de control (consistente con MapControls)
  const controlButtonStyle = [
    styles.controlButton,
    {
      backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
    },
  ];

  // Obtener dimensiones de la pantalla para fullscreen
  const screenDimensions = Dimensions.get('window');

  return (
    <View style={[
      styles.container,
      isFullscreen ? styles.containerFullscreen : { backgroundColor: colors.background }
    ]}>
      {/* Map - Ocupa todo el espacio disponible, edge-to-edge en fullscreen */}
      <View 
        style={[
          styles.mapContainer,
          isFullscreen && {
            width: screenDimensions.width,
            height: screenDimensions.height,
          }
        ]}
        onLayout={() => {
          // Forzar resize del mapa cuando el layout cambia (especialmente en fullscreen)
          if (mapViewRef.current && isFullscreen) {
            setTimeout(() => {
              mapViewRef.current?.resize();
            }, 50);
          }
        }}>
        <FlowyaMapView
          ref={mapViewRef}
          spots={spots}
          onSpotPress={handleSpotPress}
          onLongPress={handleMapLongPress}
          showUserLocation={!!baseLocation}
          userLocation={baseLocation}
          highlightedSpotId={highlightedSpotId}
          disableNativeControls={true}
        />
      </View>

      {/* Controles lado izquierdo (stack vertical) */}
      <View style={styles.leftControls}>
        {/* Botón + Add Spot (arriba) */}
        <TouchableOpacity
          style={controlButtonStyle}
          onPress={handleCreateSpotPress}
          activeOpacity={0.7}>
          <GlassView
            style={styles.buttonContent}
            intensity="light"
            opacity="medium"
            shadowLevel="subtle"
            enableGlow={false}>
            <Icon name="add-location" size={20} color={colors.text} />
          </GlassView>
        </TouchableOpacity>

        {/* Botón Current Location (abajo, solo si baseLocation existe) */}
        {baseLocation && (
          <TouchableOpacity
            style={controlButtonStyle}
            onPress={handleCenterOnUserLocation}
            activeOpacity={0.7}>
            <GlassView
              style={styles.buttonContent}
              intensity="light"
              opacity="medium"
              shadowLevel="subtle"
              enableGlow={false}>
              <Icon name="navigation" size={20} color={colors.tint} />
            </GlassView>
          </TouchableOpacity>
        )}
      </View>

      {/* Map Controls - Lado derecho (zoom y fullscreen) */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFullscreenToggle={handleFullscreenToggle}
        isFullscreen={isFullscreen}
        showFullscreen={true}
      />

      {/* SpotCard flotante cuando se selecciona un spot */}
      {selectedSpot && (
        <>
          {/* CANONICAL: Backdrop para cerrar card al tocar fuera */}
          <TouchableOpacity
            style={[StyleSheet.absoluteFillObject, styles.backdrop]}
            onPress={() => setSelectedSpot(null)}
            activeOpacity={1}
          />
          {/* CANONICAL: SpotInlineCard for Map overlay */}
          <View 
            style={[
              styles.selectedSpotCardContainer,
              {
                // Posicionar arriba de los controles izquierdos (Add Spot + Current Location si existe)
                bottom: baseLocation 
                  ? spacing.xl + (48 * 2) + spacing.sm // Arriba de ambos botones izquierdos
                  : spacing.xl + 48 + spacing.sm, // Arriba del botón Add Spot solamente
              },
            ]}>
            <SpotInlineCard
              spot={selectedSpot}
              state="default"
              distance={selectedSpotDistance}
              onPress={() => handleSpotCardPress(selectedSpot)}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerFullscreen: {
    backgroundColor: 'transparent', // Sin fondo en fullscreen para edge-to-edge
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  leftControls: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.md,
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 20,
    gap: spacing.sm,
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
  backdrop: {
    backgroundColor: 'transparent',
    zIndex: 14, // Debajo de SpotCard pero encima del mapa
  },
  selectedSpotCardContainer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md + 48 + spacing.sm, // Evitar superposición con controles de zoom (derecha)
    zIndex: 15, // Debajo de controles (zIndex 20) pero encima del backdrop
    maxWidth: 400, // Ancho máximo para el card
    alignSelf: 'flex-start',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
  },
});

