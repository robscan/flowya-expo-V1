/**
 * Simple Map View Component
 * Scope 8: Home - Map Tab - Map View (implementación mejorada para web)
 * 
 * Vista de mapa simple con controles de zoom, pan y centrado de ubicación.
 * Usado como fallback cuando Google Maps no está disponible.
 * 
 * Principios de diseño:
 * - Vista simple que muestra spots como marcadores
 * - Controles de zoom discretos (GlassView)
 * - Botón para centrar ubicación actual
 * - Navegación por pan/drag
 * - Marcadores interactivos
 * - Long press para crear nuevo spot
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Spot } from '@/data/spots';
import { MapSpotMarker } from '@/components/MapSpotMarker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { spacing } from '@/constants/spacing';
import { borderRadius } from '@/constants/borders';
import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { iconTouchableContainer } from '@/components/ui/Icon';

interface SimpleMapViewProps {
  spots: Spot[];
  onSpotPress: (spot: Spot) => void;
  onLongPress?: (location: { latitude: number; longitude: number }) => void;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  userLocation?: { latitude: number; longitude: number } | null;
}

// Calcular región inicial basada en ubicación del usuario o spots
function calculateInitialRegion(
  spots: Spot[],
  userLocation?: { latitude: number; longitude: number } | null
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
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

  // Región por defecto (Lima, Perú)
  return {
    latitude: -12.0464,
    longitude: -77.0428,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };
}

// Convertir coordenadas a posición en pantalla
function coordinateToPosition(
  coord: { latitude: number; longitude: number },
  region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number },
  screenWidth: number,
  screenHeight: number
): { x: number; y: number } | null {
  // Calcular posición relativa
  const lonRange = region.longitudeDelta;
  const latRange = region.latitudeDelta;
  
  const relX = (coord.longitude - (region.longitude - lonRange / 2)) / lonRange;
  const relY = ((region.latitude + latRange / 2) - coord.latitude) / latRange;
  
  // Verificar que esté dentro de los límites (con margen para mostrar marcadores cerca del borde)
  if (relX < -0.1 || relX > 1.1 || relY < -0.1 || relY > 1.1) {
    return null; // Fuera del área visible
  }
  
  const x = relX * screenWidth;
  const y = relY * screenHeight;
  return { x, y };
}

// Convertir posición en pantalla a coordenadas
function positionToCoordinate(
  position: { x: number; y: number },
  region: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number },
  screenWidth: number,
  screenHeight: number
): { latitude: number; longitude: number } {
  const relX = position.x / screenWidth;
  const relY = position.y / screenHeight;
  
  const lonRange = region.longitudeDelta;
  const latRange = region.latitudeDelta;
  
  const longitude = (region.longitude - lonRange / 2) + relX * lonRange;
  const latitude = (region.latitude + latRange / 2) - relY * latRange;
  
  return { latitude, longitude };
}

// Límites de zoom
const MIN_ZOOM = 0.005;
const MAX_ZOOM = 1.0;
const ZOOM_FACTOR = 1.5; // Factor de zoom por nivel

export function SimpleMapView({
  spots,
  onSpotPress,
  onLongPress,
  initialRegion,
  userLocation,
}: SimpleMapViewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const screenDimensions = Dimensions.get('window');
  const [containerSize, setContainerSize] = useState({ width: screenDimensions.width, height: 400 });
  
  const baseRegion = initialRegion || calculateInitialRegion(spots, userLocation);
  const [currentRegion, setCurrentRegion] = useState(baseRegion);
  const panStartRef = useRef<{ x: number; y: number; region: typeof baseRegion } | null>(null);
  
  const mapWidth = containerSize.width;
  const mapHeight = containerSize.height;

  const handleLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setContainerSize({ width, height });
    }
  };

  // Pan responder para navegación
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        panStartRef.current = {
          x: evt.nativeEvent.pageX,
          y: evt.nativeEvent.pageY,
          region: currentRegion,
        };
      },
      onPanResponderMove: (evt) => {
        if (panStartRef.current) {
          const dx = evt.nativeEvent.pageX - panStartRef.current.x;
          const dy = evt.nativeEvent.pageY - panStartRef.current.y;
          
          // Convertir desplazamiento en píxeles a cambio en coordenadas
          const lonDelta = (dx / mapWidth) * currentRegion.longitudeDelta;
          const latDelta = (dy / mapHeight) * currentRegion.latitudeDelta;
          
          setCurrentRegion({
            ...panStartRef.current.region,
            longitude: panStartRef.current.region.longitude - lonDelta,
            latitude: panStartRef.current.region.latitude + latDelta,
          });
        }
      },
      onPanResponderRelease: () => {
        panStartRef.current = null;
      },
    })
  ).current;

  const zoomIn = useCallback(() => {
    setCurrentRegion((prev) => {
      const newLatDelta = prev.latitudeDelta / ZOOM_FACTOR;
      const newLonDelta = prev.longitudeDelta / ZOOM_FACTOR;
      
      // Verificar límites (zoom in = delta más pequeño)
      if (newLatDelta >= MIN_ZOOM && newLonDelta >= MIN_ZOOM) {
        return {
          ...prev,
          latitudeDelta: newLatDelta,
          longitudeDelta: newLonDelta,
        };
      }
      return prev;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setCurrentRegion((prev) => {
      const newLatDelta = prev.latitudeDelta * ZOOM_FACTOR;
      const newLonDelta = prev.longitudeDelta * ZOOM_FACTOR;
      
      // Verificar límites (zoom out = delta más grande)
      if (newLatDelta <= MAX_ZOOM && newLonDelta <= MAX_ZOOM) {
        return {
          ...prev,
          latitudeDelta: newLatDelta,
          longitudeDelta: newLonDelta,
        };
      }
      return prev;
    });
  }, []);

  const centerOnUserLocation = useCallback(() => {
    if (userLocation) {
      setCurrentRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  }, [userLocation]);

  // Exponer función para acceso externo (similar a MapViewWeb)
  const containerRef = useRef<View>(null);
  React.useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as any).centerOnUserLocation = centerOnUserLocation;
    }
  }, [centerOnUserLocation]);

  const handleLongPress = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    const location = positionToCoordinate(
      { x: pageX, y: pageY },
      currentRegion,
      mapWidth,
      mapHeight
    );
    onLongPress?.(location);
  };

  // Colores para el fondo (más visible)
  const backgroundColor = colorScheme === 'dark' 
    ? colors.background 
    : '#f5f5f5';

  return (
    <View ref={containerRef} style={[styles.container, { backgroundColor }]}>
      <Pressable
        style={styles.mapPressable}
        onLayout={handleLayout}
        onLongPress={handleLongPress}
        delayLongPress={500}
        {...panResponder.panHandlers}>
        {/* Gradiente de fondo sutil para profundidad */}
        <LinearGradient
          colors={
            colorScheme === 'dark'
              ? ['rgba(21, 23, 24, 0.3)', 'rgba(21, 23, 24, 0.5)']
              : ['rgba(245, 245, 245, 0.8)', 'rgba(235, 235, 235, 0.9)']
          }
          style={StyleSheet.absoluteFillObject}
        />

        {/* Grid de fondo más visible */}
        <View style={styles.grid}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View
              key={`v-${i}`}
              style={[
                styles.gridLineVertical,
                {
                  left: (mapWidth / 10) * i,
                  backgroundColor: colors.icon + '20',
                },
              ]}
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <View
              key={`h-${i}`}
              style={[
                styles.gridLineHorizontal,
                {
                  top: (mapHeight / 10) * i,
                  backgroundColor: colors.icon + '20',
                },
              ]}
            />
          ))}
        </View>

        {/* Marcadores de spots */}
        {spots.map((spot) => {
          const position = coordinateToPosition(spot.location, currentRegion, mapWidth, mapHeight);
          if (!position) return null;
          
          return (
            <View
              key={spot.id}
              style={[
                styles.markerWrapper,
                {
                  left: position.x,
                  top: position.y,
                },
              ]}
              pointerEvents="box-none">
              <MapSpotMarker spot={spot} onPress={() => onSpotPress(spot)} />
            </View>
          );
        })}
      </Pressable>

      {/* Controles flotantes */}
      <View style={styles.controlsContainer} pointerEvents="box-none">
        {/* Botón centrar ubicación (esquina inferior izquierda) */}
        {userLocation && (
          <TouchableOpacity
            onPress={centerOnUserLocation}
            style={[styles.controlButton, styles.centerLocationButton]}
            activeOpacity={0.7}>
            <GlassView
              style={styles.glassButton}
              intensity="light"
              opacity="medium"
              shadowLevel="subtle">
              <Icon name="navigation" size={20} color={colors.text} />
            </GlassView>
          </TouchableOpacity>
        )}

        {/* Controles de zoom (esquina inferior derecha) */}
        <View style={styles.zoomControls}>
          <TouchableOpacity
            onPress={zoomIn}
            style={[styles.controlButton, styles.zoomButton]}
            activeOpacity={0.7}>
            <GlassView
              style={styles.glassButton}
              intensity="light"
              opacity="medium"
              shadowLevel="subtle">
              <Icon name="plus" size={20} color={colors.text} />
            </GlassView>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={zoomOut}
            style={[styles.controlButton, styles.zoomButton]}
            activeOpacity={0.7}>
            <GlassView
              style={styles.glassButton}
              intensity="light"
              opacity="medium"
              shadowLevel="subtle">
              <Icon name="minus" size={20} color={colors.text} />
            </GlassView>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 400,
  },
  mapPressable: {
    flex: 1,
    position: 'relative',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineVertical: {
    position: 'absolute',
    width: 1,
    height: '100%',
  },
  gridLineHorizontal: {
    position: 'absolute',
    width: '100%',
    height: 1,
  },
  markerWrapper: {
    position: 'absolute',
    transform: [{ translateX: -16 }, { translateY: -16 }], // Centrar marcador
    alignItems: 'center',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  controlButton: {
    position: 'absolute',
    ...iconTouchableContainer.base,
  },
  glassButton: {
    ...iconTouchableContainer.base,
    borderRadius: borderRadius.sm,
  },
  centerLocationButton: {
    bottom: spacing.sm,
    left: spacing.sm,
  },
  zoomControls: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'column',
    gap: spacing.xs / 2,
  },
  zoomButton: {
    position: 'relative',
  },
});
