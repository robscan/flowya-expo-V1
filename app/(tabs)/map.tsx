/**
 * Map Screen
 * Tab independiente en el Tab Bar principal
 * 
 * Exploración libre y planeación.
 * Muestra Spots incluso lejanos.
 * Permite crear y ajustar Spots.
 */

import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, Platform, Share, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

import { FlowyaMapView, FlowyaMapViewRef } from '@/components/MapView';
import { SpotInlineCard } from '@/components/SpotInlineCard';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { MapControls } from '@/components/ui/MapControls';
import { PinStateFilter, PinStateFilterType } from '@/components/ui/PinStateFilter';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { useWorldSpots } from '@/contexts/WorldSpotContext';
import { Spot } from '@/data/spots';
import { combineSpots, UnifiedSpot } from '@/utils/worldSpotHelpers';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { useSpotDistance } from '@/hooks/useSpotDistance';
import { useVisibleSpots, ViewportBounds } from '@/hooks/useVisibleSpots';

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ spotId?: string }>();
  const colors = Colors[colorScheme ?? 'light'];
  const mapViewRef = useRef<FlowyaMapViewRef>(null);
  const [highlightedSpotId, setHighlightedSpotId] = useState<string | undefined>(params.spotId);

  // Ubicación base estable
  const { baseLocation } = useBaseLocation();

  const { spots, isLoading: spotsLoading, getSpotById } = useSpot();
  const { worldSpots, isLoading: isLoadingWorldSpots, getWorldSpotById } = useWorldSpots();
  const { setIsTabBarVisible } = useOverlay();
  const { isSpotPinned, getPinState, getPinnedSpots } = useSaved();
  const { user } = useAuth();
  const [selectedSpot, setSelectedSpot] = useState<UnifiedSpot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pinStateFilter, setPinStateFilter] = useState<PinStateFilterType>('all');
  const [viewportBounds, setViewportBounds] = useState<ViewportBounds | null>(null);
  
  // FASE 7: Combinar UserSpots y WorldSpots
  const allSpots: UnifiedSpot[] = useMemo(() => {
    return combineSpots(spots, worldSpots);
  }, [spots, worldSpots]);

  // Calcular distancia del spot seleccionado (siempre, no condicionalmente)
  const selectedSpotDistance = useSpotDistance(selectedSpot?.id || null, baseLocation);
  
  // V1.2: Filtrar spots según estado de Pin
  // Nota: El filtro de pinState busca en allSpots (WorldSpots y UserSpots) y verifica si tienen pins
  const preFilteredSpots = useMemo(() => {
    if (pinStateFilter === 'all') {
      // OPTIMIZACIÓN: Limitar a 200 spots más cercanos cuando se muestran todos
      // Esto mejora el rendimiento del mapa sin afectar la experiencia del usuario
      const MAX_SPOTS_ON_MAP = 200;
      
      if (allSpots.length <= MAX_SPOTS_ON_MAP) {
        return allSpots;
      }
      
      // Si hay baseLocation, ordenar por distancia y tomar los más cercanos
      if (baseLocation) {
        const spotsWithDistance = allSpots.map((spot) => {
          const loc = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number };
          const lat = 'lat' in loc && loc.lat !== undefined ? loc.lat : (loc.latitude ?? 0);
          const lng = 'lng' in loc && loc.lng !== undefined ? loc.lng : (loc.longitude ?? 0);
          
          // Calcular distancia usando fórmula de Haversine
          const R = 6371; // Radio de la Tierra en km
          const dLat = ((lat - baseLocation.latitude) * Math.PI) / 180;
          const dLon = ((lng - baseLocation.longitude) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((baseLocation.latitude * Math.PI) / 180) *
              Math.cos((lat * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          
          return { spot, distance };
        });
        
        return spotsWithDistance
          .sort((a, b) => a.distance - b.distance)
          .slice(0, MAX_SPOTS_ON_MAP)
          .map((item) => item.spot);
      }
      
      // Sin ubicación, tomar los primeros MAX_SPOTS_ON_MAP
      return allSpots.slice(0, MAX_SPOTS_ON_MAP);
    }
    
    // Cuando se filtra por pinState, buscar en allSpots (incluye WorldSpots y UserSpots)
    return allSpots.filter((spot) => {
      const isPinned = isSpotPinned(spot.id);
      const pinState = getPinState(spot.id);
      
      if (pinStateFilter === 'to_visit') {
        return isPinned && pinState === 'to_visit';
      }
      
      if (pinStateFilter === 'visited') {
        return isPinned && pinState === 'visited';
      }
      
      return false;
    });
  }, [allSpots, pinStateFilter, isSpotPinned, getPinState]);

  // V1.3: Lazy loading - Filtrar spots visibles en viewport
  const filteredSpots = useVisibleSpots(
    preFilteredSpots,
    viewportBounds,
    { buffer: 0.2, minSpots: 50 }
  );

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
  const handleSpotCardPress = (spot: UnifiedSpot) => {
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

  // V1.2: Compartir mapa de pines
  const handleSharePinsMap = useCallback(async (state: 'to_visit' | 'visited') => {
    try {
      const pinnedSpotIds = getPinnedSpots(state);
      if (pinnedSpotIds.length === 0) {
        Alert.alert(
          'No hay pines para compartir',
          state === 'to_visit' 
            ? 'No tienes lugares marcados como "Por visitar" para compartir.'
            : 'No tienes lugares marcados como "Visitados" para compartir.'
        );
        return;
      }

      const stateLabel = state === 'to_visit' ? 'Por visitar' : 'Visitados';
      const userId = user?.id || 'user';
      
      // V1.3: Detectar URL base (localhost en desarrollo, https://flowya.app en producción)
      let baseUrl = 'https://flowya.app';
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
        // En web, detectar si estamos en producción o desarrollo
        const origin = window.location.origin;
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          // Desarrollo local: usar la URL actual
          baseUrl = origin;
        } else {
          // Producción: siempre usar flowya.app
          baseUrl = 'https://flowya.app';
        }
      } else if (__DEV__) {
        // En desarrollo en móviles, usar localhost (asumiendo Expo Go o desarrollo web)
        baseUrl = 'http://localhost:8081'; // Puerto por defecto de Expo
      }
      
      const shareUrl = `${baseUrl}/shared-map?pinState=${state}&userId=${userId}`;
      const shareMessage = `Mi mapa de lugares ${stateLabel.toLowerCase()} en FLOWYA\n\n${shareUrl}`;
      
      await Share.share({
        message: shareMessage,
        title: `Mi mapa de lugares ${stateLabel}`,
      });
    } catch (error) {
      console.error('Error sharing pins map:', error);
      Alert.alert('Error', 'No se pudo compartir. Intenta nuevamente.');
    }
  }, [getPinnedSpots, user?.id]);

  // Centrar y destacar spot cuando hay spotId en params
  useEffect(() => {
    if (!params.spotId || spotsLoading || isLoadingWorldSpots) {
      return;
    }

    // Buscar en UserSpots primero
    let spot: UnifiedSpot | undefined = getSpotById(params.spotId);
    
    // Si no se encuentra, buscar en WorldSpots
    if (!spot) {
      spot = getWorldSpotById(params.spotId);
    }
    
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
  }, [params.spotId, spotsLoading, isLoadingWorldSpots, getSpotById, getWorldSpotById]);

  // Limpiar selección cuando cambia highlightedSpotId desde params
  useEffect(() => {
    if (!params.spotId) {
      setSelectedSpot(null);
    }
  }, [params.spotId]);

  if (spotsLoading || isLoadingWorldSpots) {
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
          spots={filteredSpots as Spot[]}
          onSpotPress={handleSpotPress}
          onLongPress={handleMapLongPress}
          showUserLocation={!!baseLocation}
          userLocation={baseLocation}
          highlightedSpotId={highlightedSpotId}
          disableNativeControls={true}
          onViewportChange={(bounds) => setViewportBounds(bounds)}
        />
      </View>

      {/* V1.2: Pin State Filter - Parte superior del mapa */}
      <View style={styles.topControls}>
        <View style={styles.topControlsRow}>
          <PinStateFilter
            currentFilter={pinStateFilter}
            onFilterChange={setPinStateFilter}
          />
          {/* V1.2: Botón de compartir - Solo visible cuando filtro no es 'all' */}
          {pinStateFilter !== 'all' && (
            <TouchableOpacity
              style={[controlButtonStyle, styles.shareButton]}
              onPress={() => handleSharePinsMap(pinStateFilter as 'to_visit' | 'visited')}
              activeOpacity={0.7}>
              <GlassView
                style={styles.buttonContent}
                intensity="light"
                opacity="medium"
                shadowLevel="subtle"
                enableGlow={false}>
                <Icon name="share" size={20} color={colors.text} />
              </GlassView>
            </TouchableOpacity>
          )}
        </View>
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
              spot={selectedSpot as Spot}
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
  topControls: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    zIndex: 20,
  },
  topControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shareButton: {
    marginLeft: 'auto',
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

