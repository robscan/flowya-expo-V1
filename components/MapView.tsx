/**
 * Map View Component
 * Scope 1: Integración de Mapbox
 * 
 * Componente de mapa usando Mapbox para todas las plataformas.
 * SimpleMapView ha sido eliminado - solo se usa Mapbox o se muestra error.
 * 
 * Principios de diseño:
 * - Mapas reales de Mapbox
 * - Marcadores interactivos para spots
 * - Long press para crear nuevo spot
 * - Error si MapBox no está configurado (no fallback a SimpleMapView)
 */

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Text,
} from 'react-native';

import { Spot } from '@/data/spots';
import { USE_MAPBOX, isMapboxConfigured } from '@/utils/mapsConfig';
import { MapboxView, MapboxViewRef } from './MapboxView';
import { MapboxViewWeb, MapboxViewWebRef } from './MapboxViewWeb';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapViewProps {
  spots: Spot[];
  onSpotPress: (spot: Spot) => void;
  onLongPress?: (location: { latitude: number; longitude: number }) => void;
  initialRegion?: Region;
  // Props adicionales para FlowScreen
  showRoute?: boolean; // Mostrar ruta entre spots (Polyline) - solo móvil
  flowSpots?: Spot[]; // Spots del flow para mostrar ruta - solo móvil
  showUserLocation?: boolean; // Mostrar ubicación del usuario - solo móvil
  userLocation?: { latitude: number; longitude: number } | null;
  routeFrom?: { latitude: number; longitude: number } | null;
  routeTo?: { latitude: number; longitude: number } | null;
  highlightedSpotId?: string; // ID del spot que debe mostrarse destacado con tooltip
  currentSpotIndex?: number; // Índice del spot actual en el flow
  flowSpotsOrder?: Spot[]; // Orden de spots en el flow para pines numerados
  disableNativeControls?: boolean; // Deshabilitar controles nativos si se usan controles custom
}

export interface FlowyaMapViewRef {
  centerOnUserLocation: () => void;
  centerOnSpot: (spotId: string) => void;
  flyToCoordinates: (coordinates: { latitude: number; longitude: number }, zoom?: number) => void;
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

  // Fallback: Región por defecto (Riviera Maya, México - para el demo)
  return {
    latitude: 20.6170,
    longitude: -87.0798,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };
}

export const FlowyaMapView = forwardRef<FlowyaMapViewRef, MapViewProps>(({
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
  flowSpotsOrder,
  disableNativeControls = false,
}, ref) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Ref para los componentes hijos
  const mapboxViewRef = useRef<MapboxViewRef>(null);
  const mapboxViewWebRef = useRef<MapboxViewWebRef>(null);

  // Exponer funciones usando useImperativeHandle
  useImperativeHandle(ref, () => ({
    centerOnUserLocation: () => {
      if (mapboxViewRef.current && userLocation) {
        mapboxViewRef.current.centerOnUserLocation();
        return;
      }
      if (mapboxViewWebRef.current && userLocation) {
        mapboxViewWebRef.current.centerOnUserLocation();
        return;
      }
    },
    centerOnSpot: (spotId: string) => {
      const spot = spots.find(s => s.id === spotId);
      if (!spot) {
        console.warn(`Spot with id ${spotId} not found`);
        return;
      }
      if (mapboxViewRef.current) {
        mapboxViewRef.current.centerOnSpot(spotId);
        return;
      }
      if (mapboxViewWebRef.current) {
        mapboxViewWebRef.current.centerOnSpot(spotId);
        return;
      }
    },
    flyToCoordinates: (coordinates: { latitude: number; longitude: number }, zoom?: number) => {
      if (mapboxViewRef.current) {
        // En native, usar centerOnSpot si hay un spot en esas coordenadas, o no hacer nada
        // Por ahora, solo implementar en web
        return;
      }
      if (mapboxViewWebRef.current) {
        mapboxViewWebRef.current.flyToCoordinates(coordinates, zoom);
        return;
      }
    },
    zoomIn: () => {
      if (mapboxViewRef.current) {
        mapboxViewRef.current.zoomIn();
        return;
      }
      if (mapboxViewWebRef.current) {
        mapboxViewWebRef.current.zoomIn();
        return;
      }
    },
    zoomOut: () => {
      if (mapboxViewRef.current) {
        mapboxViewRef.current.zoomOut();
        return;
      }
      if (mapboxViewWebRef.current) {
        mapboxViewWebRef.current.zoomOut();
        return;
      }
    },
    resize: () => {
      if (mapboxViewRef.current) {
        mapboxViewRef.current.resize?.();
        return;
      }
      if (mapboxViewWebRef.current) {
        mapboxViewWebRef.current.resize();
        return;
      }
    },
  }), [userLocation, spots]);

  // Si Mapbox no está configurado, mostrar error
  if (!USE_MAPBOX || !isMapboxConfigured()) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[textStyles.heading3, { color: colors.text, marginBottom: 8 }]}>
            Error de carga del mapa
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, textAlign: 'center' }]}>
            MapBox no está configurado. Por favor, configura EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN en las variables de entorno.
          </Text>
        </View>
      </View>
    );
  }

  // En web, usar MapboxViewWeb
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <MapboxViewWeb
          ref={mapboxViewWebRef}
          spots={spots}
          onSpotPress={onSpotPress}
          onLongPress={onLongPress}
          initialRegion={initialRegion || calculateInitialRegion(spots, userLocation)}
          showRoute={showRoute}
          flowSpots={flowSpots}
          showUserLocation={showUserLocation}
          userLocation={userLocation}
          routeFrom={routeFrom}
          routeTo={routeTo}
          highlightedSpotId={highlightedSpotId}
          currentSpotIndex={currentSpotIndex}
          flowSpotsOrder={flowSpotsOrder}
          disableNativeControls={disableNativeControls}
        />
      </View>
    );
  }

  // En móvil, usar MapboxView
  return (
    <View style={styles.container}>
      <MapboxView
        ref={mapboxViewRef}
        spots={spots}
        onSpotPress={onSpotPress}
        onLongPress={onLongPress}
        initialRegion={initialRegion || calculateInitialRegion(spots, userLocation)}
        showRoute={showRoute}
        flowSpots={flowSpots}
        showUserLocation={showUserLocation}
        userLocation={userLocation}
        routeFrom={routeFrom}
        routeTo={routeTo}
        highlightedSpotId={highlightedSpotId}
        currentSpotIndex={currentSpotIndex}
        flowSpotsOrder={flowSpotsOrder}
        disableNativeControls={disableNativeControls}
      />
    </View>
  );
});

FlowyaMapView.displayName = 'FlowyaMapView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});

