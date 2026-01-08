/**
 * Map Screen
 * Tab independiente en el Tab Bar principal
 * 
 * Exploración libre y planeación.
 * Muestra Spots incluso lejanos.
 * Permite crear y ajustar Spots.
 */

import * as Location from 'expo-location';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

import { FlowyaMapView, FlowyaMapViewRef } from '@/components/MapView';
import { SpotInlineCard } from '@/components/SpotInlineCard';
import { MapControls } from '@/components/ui/MapControls';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useOverlay } from '@/contexts/OverlayContext';
import { useSpot } from '@/contexts/SpotContext';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateDistanceToSpot } from '@/utils/distance';

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ spotId?: string }>();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const colors = Colors[colorScheme ?? 'light'];
  const mapViewRef = useRef<FlowyaMapViewRef>(null);
  const [highlightedSpotId, setHighlightedSpotId] = useState<string | undefined>(params.spotId);

  const { spots, isLoading: spotsLoading } = useSpot();
  const { setIsTabBarVisible } = useOverlay();
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permissions denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  // Header with Profile icon
  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

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
    // Usar ubicación del usuario si está disponible, sino usar ubicación por defecto
    const location = userLocation || {
      latitude: -12.0464,
      longitude: -77.0428,
    };
    router.push(`/create-spot?lat=${location.latitude}&lng=${location.longitude}`);
  };

  // Handle center on user location
  const handleCenterOnUserLocation = () => {
    if (!userLocation) return;
    
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

    // Pequeño delay para asegurar que el mapa esté listo antes de centrar
    const timer = setTimeout(() => {
      if (mapViewRef.current) {
        mapViewRef.current.centerOnSpot(params.spotId!);
      }
      // Establecer spot seleccionado si existe
      const spot = spots.find(s => s.id === params.spotId);
      if (spot) {
        setSelectedSpot(spot);
      }
    }, 500);

    return () => clearTimeout(timer);
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header absoluto en la parte superior (oculto en fullscreen) */}
      {!isFullscreen && (
        <View
          style={[
            styles.header,
            {
              borderBottomColor:
                colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              backgroundColor: colors.background,
            },
          ]}>
          <View style={styles.headerContent}>
            <Text style={[textStyles.heading3, { color: colors.text }]}>Map</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleCreateSpotPress}
                style={iconTouchableContainer.base}
                activeOpacity={0.7}>
                <Icon name="add" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleProfilePress}
                style={[iconTouchableContainer.base, { marginLeft: spacing.sm }]}
                activeOpacity={0.7}>
                <Icon name="profile" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Map - Ocupa todo el espacio disponible */}
      <View style={styles.mapContainer}>
        <FlowyaMapView
          ref={mapViewRef}
          spots={spots}
          onSpotPress={handleSpotPress}
          onLongPress={handleMapLongPress}
          showUserLocation={!!userLocation}
          userLocation={userLocation}
          highlightedSpotId={highlightedSpotId}
          disableNativeControls={true}
        />
      </View>

      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenterLocation={handleCenterOnUserLocation}
        onFullscreenToggle={handleFullscreenToggle}
        isFullscreen={isFullscreen}
        showFullscreen={true}
        showLocation={!!userLocation}
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
                // Posicionar arriba del botón de ubicación (izquierda) si hay espacio
                // Si no hay espacio, aparecer arriba de los controles de zoom (derecha)
                bottom: userLocation 
                  ? spacing.xl + 48 + spacing.sm // Arriba del botón de ubicación
                  : spacing.xl + spacing.sm, // Arriba del borde inferior
              },
            ]}>
            <SpotInlineCard
              spot={selectedSpot}
              state="default"
              distance={userLocation ? calculateDistanceToSpot(userLocation, selectedSpot.location) || undefined : undefined}
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
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

