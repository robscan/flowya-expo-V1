/**
 * Mapbox View Component
 * Componente de mapa usando @rnmapbox/maps para iOS/Android
 * 
 * POLÍTICA CANÓNICA: FLOWYA usa Mapbox como sistema principal de mapas.
 * Google Maps solo se usa como app externa para "Get directions" (ver utils/navigationHelpers.ts).
 */

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Spot } from '@/data/spots';
import { MapSpotMarker } from '@/components/MapSpotMarker';
import { FlowSpotNumberedMarker } from '@/components/FlowSpotNumberedMarker';
import { MAPBOX_ACCESS_TOKEN, isMapboxConfigured } from '@/utils/mapsConfig';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapboxViewProps {
  spots: Spot[];
  onSpotPress: (spot: Spot) => void;
  onLongPress?: (location: { latitude: number; longitude: number }) => void;
  initialRegion?: Region;
  showRoute?: boolean;
  flowSpots?: Spot[];
  showUserLocation?: boolean;
  userLocation?: { latitude: number; longitude: number } | null;
  routeFrom?: { latitude: number; longitude: number } | null;
  routeTo?: { latitude: number; longitude: number } | null;
  highlightedSpotId?: string;
  currentSpotIndex?: number; // Índice del spot actual en el flow
  flowSpotsOrder?: Spot[]; // Orden de spots en el flow para pines numerados
  disableNativeControls?: boolean; // Deshabilitar controles nativos de Mapbox si se usan controles custom
}

export interface MapboxViewRef {
  centerOnUserLocation: () => void;
  centerOnSpot: (spotId: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resize: () => void;
}

// Calcular región inicial basada en ubicación del usuario o spots
function calculateInitialRegion(
  spots: Spot[],
  userLocation?: { latitude: number; longitude: number } | null
): Region {
  // Prioridad 1: Si hay spots, calcular región basada en ellos
  if (spots.length > 0) {
    const latitudes = spots.map((spot) => spot.location.latitude);
    const longitudes = spots.map((spot) => spot.location.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    const latDelta = Math.max(maxLat - minLat, 0.01) * 1.5;
    const lonDelta = Math.max(maxLon - minLon, 0.01) * 1.5;

    return {
      latitude: centerLat,
      longitude: centerLon,
      latitudeDelta: latDelta,
      longitudeDelta: lonDelta,
    };
  }

  // Prioridad 2: Si hay ubicación del usuario, centrar en ella con zoom razonable
  if (userLocation) {
    return {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }

  // Fallback: Región por defecto
  return {
    latitude: 20.6170,
    longitude: -87.0798,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };
}

// Lazy load @rnmapbox/maps
let Mapbox: any;
let MapView: any;
let Camera: any;
let PointAnnotation: any;
let ShapeSource: any;
let LineLayer: any;

function loadMapbox() {
  if (Platform.OS === 'web') {
    return null;
  }
  
  try {
    const mapbox = require('@rnmapbox/maps');
    Mapbox = mapbox;
    MapView = mapbox.MapView;
    Camera = mapbox.Camera;
    PointAnnotation = mapbox.PointAnnotation;
    ShapeSource = mapbox.ShapeSource;
    LineLayer = mapbox.LineLayer;
    
    // Configurar access token
    if (MAPBOX_ACCESS_TOKEN) {
      mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
    }
    
    return mapbox;
  } catch (error) {
    console.warn('@rnmapbox/maps no está disponible:', error);
    return null;
  }
}

const MapboxViewComponent = forwardRef<MapboxViewRef, MapboxViewProps>(({
  spots,
  onSpotPress,
  onLongPress,
  initialRegion,
  showRoute = false,
  flowSpots = [],
  showUserLocation = false,
  userLocation = null,
  routeFrom = null,
  routeTo = null,
  highlightedSpotId,
  currentSpotIndex,
  flowSpotsOrder = [],
  disableNativeControls = false,
}, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const cameraRef = useRef<any>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentZoomRef = useRef<number>(13); // Zoom por defecto

  const region = initialRegion || calculateInitialRegion(spots, userLocation);
  const initialZoom = useMemo(() => Math.log2(360 / region.longitudeDelta) - 1, [region.longitudeDelta]);
  
  // Inicializar zoom
  useEffect(() => {
    if (initialZoom && !isNaN(initialZoom)) {
      currentZoomRef.current = initialZoom;
    }
  }, [initialZoom]);

  // Cargar Mapbox
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    if (!isMapboxConfigured()) {
      setError('Mapbox Access Token not configured. Please set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env file.');
      return;
    }

    const mapbox = loadMapbox();
    if (mapbox) {
      setMapsLoaded(true);
    } else {
      setError('Failed to load @rnmapbox/maps. Please install it: npm install @rnmapbox/maps');
    }
  }, []);

  // Exponer funciones usando useImperativeHandle
  useImperativeHandle(ref, () => ({
    centerOnUserLocation: () => {
      if (!cameraRef.current || !userLocation) return;
      currentZoomRef.current = 13;
      cameraRef.current.setCamera({
        centerCoordinate: [userLocation.longitude, userLocation.latitude],
        zoomLevel: 13,
        animationDuration: 500,
      });
    },
    centerOnSpot: (spotId: string) => {
      if (!cameraRef.current) return;
      const spot = spots.find(s => s.id === spotId);
      if (spot) {
        currentZoomRef.current = 13;
        cameraRef.current.setCamera({
          centerCoordinate: [spot.location.longitude, spot.location.latitude],
          zoomLevel: 13, // Zoom amplio para mostrar otros spots
          animationDuration: 500,
        });
      }
    },
    zoomIn: () => {
      if (!cameraRef.current) return;
      const newZoom = Math.min(currentZoomRef.current + 1, 20); // Max zoom 20
      currentZoomRef.current = newZoom;
      cameraRef.current.setCamera({
        zoomLevel: newZoom,
        animationDuration: 200,
      });
    },
    zoomOut: () => {
      if (!cameraRef.current) return;
      const newZoom = Math.max(currentZoomRef.current - 1, 0); // Min zoom 0
      currentZoomRef.current = newZoom;
      cameraRef.current.setCamera({
        zoomLevel: newZoom,
        animationDuration: 200,
      });
    },
    resize: () => {
      // En React Native, el mapa se recalcula automáticamente cuando cambian las dimensiones
      // Este método es principalmente para mantener consistencia con la API de web
      // No-op en móvil ya que el layout se actualiza automáticamente
    },
  }), [userLocation, spots]);

  // Calcular coordenadas para ruta
  const routeCoordinates = useMemo(() => {
    if (!showRoute) {
      return [];
    }

    if (routeFrom && routeTo) {
      return [
        [routeFrom.longitude, routeFrom.latitude],
        [routeTo.longitude, routeTo.latitude],
      ];
    }

    if (flowSpots && flowSpots.length >= 2) {
      return flowSpots.map((spot) => [spot.location.longitude, spot.location.latitude]);
    }

    return [];
  }, [showRoute, flowSpots, routeFrom, routeTo]);

  // Centrar en spot destacado
  useEffect(() => {
    if (!highlightedSpotId || !cameraRef.current) return;
    
    const spot = spots.find(s => s.id === highlightedSpotId);
    if (spot) {
      cameraRef.current.setCamera({
        centerCoordinate: [spot.location.longitude, spot.location.latitude],
        zoomLevel: 13,
        animationDuration: 500,
      });
    }
  }, [highlightedSpotId, spots]);

  // Actualizar mapa cuando cambia la ubicación del usuario (si el mapa ya está cargado)
  useEffect(() => {
    if (!mapsLoaded || !cameraRef.current || !userLocation) return;
    
    // Solo actualizar si no hay spots destacados (para no interrumpir la navegación)
    if (highlightedSpotId) return;
    
    // Centrar en la ubicación del usuario con zoom razonable
    cameraRef.current.setCamera({
      centerCoordinate: [userLocation.longitude, userLocation.latitude],
      zoomLevel: 13,
      animationDuration: 500,
    });
  }, [mapsLoaded, userLocation, highlightedSpotId]);


  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
      </View>
    );
  }

  if (!mapsLoaded || !MapView) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL="mapbox://styles/mapbox/light-v11" // Estilo minimalista
        logoEnabled={false}
        attributionEnabled={false}
        compassEnabled={!disableNativeControls}
        scaleBarEnabled={!disableNativeControls}
        zoomEnabled={!disableNativeControls}
        onLongPress={(feature: any) => {
          if (onLongPress) {
            const coordinates = feature.geometry.coordinates;
            onLongPress({
              latitude: coordinates[1],
              longitude: coordinates[0],
            });
          }
        }}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [region.longitude, region.latitude],
            zoomLevel: initialZoom,
          }}
          onCameraChanged={(state: any) => {
            // Actualizar zoom actual cuando el usuario hace zoom manual
            if (state.properties.zoom !== undefined && !isNaN(state.properties.zoom)) {
              currentZoomRef.current = state.properties.zoom;
            }
          }}
        />

        {/* Marcadores de spots */}
        {spots.map((spot) => {
          // Determinar si el spot está en el flow y calcular su estado
          const spotIndexInFlow = flowSpotsOrder.findIndex(s => s.id === spot.id);
          const isInFlow = spotIndexInFlow !== -1;
          
          // Determinar estado del pin si está en el flow
          let markerState: 'active' | 'upNext' | 'visited' | null = null;
          let orderNumber = 0;
          
          if (isInFlow && currentSpotIndex !== undefined) {
            orderNumber = spotIndexInFlow + 1; // Números empiezan en 1
            if (spotIndexInFlow === currentSpotIndex) {
              markerState = 'active';
            } else if (spotIndexInFlow < currentSpotIndex) {
              markerState = 'visited';
            } else {
              markerState = 'upNext';
            }
          }
          
          return (
            <PointAnnotation
              key={spot.id}
              id={spot.id}
              coordinate={[spot.location.longitude, spot.location.latitude]}
              onSelected={() => {
                // CANONICAL: Llamar directamente onSpotPress sin preview intermedio
                onSpotPress(spot);
              }}
            >
              <View style={styles.markerWrapper}>
                {isInFlow && markerState ? (
                  <FlowSpotNumberedMarker
                    spot={spot}
                    orderNumber={orderNumber}
                    state={markerState}
                    onPress={() => {
                      // CANONICAL: Llamar directamente onSpotPress sin preview intermedio
                      onSpotPress(spot);
                    }}
                  />
                ) : (
                  <MapSpotMarker 
                    spot={spot} 
                    onPress={() => {
                      // CANONICAL: Llamar directamente onSpotPress sin preview intermedio
                      onSpotPress(spot);
                    }}
                    isHighlighted={highlightedSpotId === spot.id}
                  />
                )}
              </View>
            </PointAnnotation>
          );
        })}

        {/* Ruta entre spots */}
        {showRoute && routeCoordinates.length > 1 && ShapeSource && LineLayer && (
          <ShapeSource
            id="route"
            shape={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeCoordinates,
              },
            }}
          >
            <LineLayer
              id="routeLine"
              style={{
                lineColor: '#FF6B35',
                lineWidth: 3,
                lineJoin: 'round',
                lineCap: 'round',
              }}
            />
          </ShapeSource>
        )}

        {/* Ubicación del usuario */}
        {showUserLocation && userLocation && (
          <PointAnnotation
            id="userLocation"
            coordinate={[userLocation.longitude, userLocation.latitude]}
          >
            <View style={styles.userMarkerContainer}>
              {/* Círculo exterior azul */}
              <View style={[styles.userMarkerOuter, { backgroundColor: '#4285F4' }]}>
                {/* Punto central blanco */}
                <View style={styles.userMarkerInner} />
              </View>
            </View>
          </PointAnnotation>
        )}
      </MapView>
    </View>
  );
});

MapboxViewComponent.displayName = 'MapboxView';

export const MapboxView = MapboxViewComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
});

