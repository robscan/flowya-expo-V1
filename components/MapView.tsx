/**
 * Map View Component
 * Scope 1: Integración de Mapbox
 * 
 * Componente de mapa usando Mapbox para todas las plataformas.
 * Reemplaza SimpleMapView con funcionalidad de mapas reales.
 * 
 * Principios de diseño:
 * - Mapas reales de Mapbox
 * - Marcadores interactivos para spots
 * - Long press para crear nuevo spot
 * - Compatible con la interfaz de SimpleMapView
 */

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import {
  StyleSheet,
  View,
  Platform,
} from 'react-native';

import { Spot } from '@/data/spots';
import { USE_MAPBOX, isMapboxConfigured } from '@/utils/mapsConfig';
import { SimpleMapView } from './SimpleMapView';
import { MapboxView, MapboxViewRef } from './MapboxView';
import { MapboxViewWeb, MapboxViewWebRef } from './MapboxViewWeb';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface LatLng {
  latitude: number;
  longitude: number;
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
  zoomIn: () => void;
  zoomOut: () => void;
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

  // Ref para los componentes hijos
  const mapboxViewRef = useRef<MapboxViewRef>(null);
  const mapboxViewWebRef = useRef<MapboxViewWebRef>(null);
  const simpleMapViewRef = useRef<View>(null);

  // Exponer funciones usando useImperativeHandle
  useImperativeHandle(ref, () => ({
    centerOnUserLocation: () => {
      // Prioridad 1: Mapbox (móvil)
      if (mapboxViewRef.current && userLocation) {
        mapboxViewRef.current.centerOnUserLocation();
        return;
      }
      
      // Prioridad 2: Mapbox (web)
      if (mapboxViewWebRef.current && userLocation) {
        mapboxViewWebRef.current.centerOnUserLocation();
        return;
      }
      
      // Fallback: SimpleMapView
      if (simpleMapViewRef.current) {
        const domElement = (simpleMapViewRef.current as any)._nativeNode || simpleMapViewRef.current;
        if ((domElement as any).centerOnUserLocation) {
          (domElement as any).centerOnUserLocation();
          return;
        }
      }
    },
    centerOnSpot: (spotId: string) => {
      const spot = spots.find(s => s.id === spotId);
      if (!spot) {
        console.warn(`Spot with id ${spotId} not found`);
        return;
      }

      // Prioridad 1: Mapbox (móvil)
      if (mapboxViewRef.current) {
        mapboxViewRef.current.centerOnSpot(spotId);
        return;
      }
      
      // Prioridad 2: Mapbox (web)
      if (mapboxViewWebRef.current) {
        mapboxViewWebRef.current.centerOnSpot(spotId);
        return;
      }
      
      // Fallback: SimpleMapView
      if (simpleMapViewRef.current) {
        const domElement = (simpleMapViewRef.current as any)._nativeNode || simpleMapViewRef.current;
        if ((domElement as any).centerOnSpot) {
          (domElement as any).centerOnSpot(spotId);
          return;
        }
      }
    },
    zoomIn: () => {
      // Prioridad 1: Mapbox (móvil)
      if (mapboxViewRef.current) {
        mapboxViewRef.current.zoomIn();
        return;
      }
      
      // Prioridad 2: Mapbox (web)
      if (mapboxViewWebRef.current) {
        mapboxViewWebRef.current.zoomIn();
        return;
      }
    },
    zoomOut: () => {
      // Prioridad 1: Mapbox (móvil)
      if (mapboxViewRef.current) {
        mapboxViewRef.current.zoomOut();
        return;
      }
      
      // Prioridad 2: Mapbox (web)
      if (mapboxViewWebRef.current) {
        mapboxViewWebRef.current.zoomOut();
        return;
      }
    },
  }), [userLocation, spots]);

  // En web, priorizar Mapbox si está configurado, sino usar SimpleMapView
  if (Platform.OS === 'web') {
    if (USE_MAPBOX && isMapboxConfigured()) {
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

    // Fallback a SimpleMapView
    return (
      <View style={styles.container}>
        <View ref={simpleMapViewRef} style={StyleSheet.absoluteFillObject}>
          <SimpleMapView
            spots={spots}
            onSpotPress={onSpotPress}
            onLongPress={onLongPress}
            initialRegion={initialRegion || calculateInitialRegion(spots, userLocation)}
            userLocation={userLocation}
          />
        </View>
      </View>
    );
  }

  // En móvil, priorizar Mapbox si está configurado
  if (USE_MAPBOX && isMapboxConfigured()) {
    return (
      <View style={styles.container}>
        <MapboxView
          ref={mapboxViewRef}
          spots={spots}
          onSpotPress={onSpotPress}
          onLongPress={onLongPress}
          initialRegion={initialRegion || calculateInitialRegion(spots)}
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
  
  // Si Mapbox no está disponible, usar SimpleMapView (fallback)
  return (
    <View style={styles.container}>
      <View ref={simpleMapViewRef} style={StyleSheet.absoluteFillObject}>
        <SimpleMapView
          spots={spots}
          onSpotPress={onSpotPress}
          onLongPress={onLongPress}
          initialRegion={initialRegion || calculateInitialRegion(spots, userLocation)}
          userLocation={userLocation}
        />
            </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200, // Ensure minimum height for web fallback
  },
});

