/**
 * Mapbox View Web Component
 * Componente de mapa usando Mapbox GL JS para web
 * 
 * POLÍTICA CANÓNICA: FLOWYA usa Mapbox como sistema principal de mapas.
 * Google Maps solo se usa como app externa para "Get directions" (ver utils/navigationHelpers.ts).
 */

import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Spot } from '@/data/spots';
import { MAPBOX_ACCESS_TOKEN, isMapboxConfigured } from '@/utils/mapsConfig';

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface MapboxViewWebProps {
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
  disableNativeControls?: boolean; // Deshabilitar controles nativos si se usan controles custom
}

export interface MapboxViewWebRef {
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

// Cargar Mapbox GL JS
function loadMapboxGL(): Promise<any> {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (typeof window !== 'undefined' && (window as any).mapboxgl) {
      resolve((window as any).mapboxgl);
      return;
    }

    // Cargar CSS
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Cargar JS
    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
    script.async = true;
    script.onload = () => {
      if ((window as any).mapboxgl) {
        resolve((window as any).mapboxgl);
      } else {
        reject(new Error('Mapbox GL failed to load'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Mapbox GL script'));
    };
    document.head.appendChild(script);
  });
}

// Estilo minimalista para Mapbox
const minimalMapStyle = {
  version: 8,
  sources: {
    'mapbox-streets': {
      type: 'vector',
      url: 'mapbox://mapbox.mapbox-streets-v8',
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#f5f5f5',
      },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'water',
      paint: {
        'fill-color': '#e9e9e9',
      },
    },
    {
      id: 'landcover',
      type: 'fill',
      source: 'mapbox-streets',
      'source-layer': 'landcover',
      paint: {
        'fill-color': '#f5f5f5',
      },
    },
    {
      id: 'roads',
      type: 'line',
      source: 'mapbox-streets',
      'source-layer': 'road',
      paint: {
        'line-color': '#ffffff',
        'line-width': 2,
      },
    },
  ],
};

const MapboxViewWebComponent = forwardRef<MapboxViewWebRef, MapboxViewWebProps>(({
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
  const containerRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const popupRef = useRef<any>(null);
  const userLocationMarkerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(13);

  const region = initialRegion || calculateInitialRegion(spots, userLocation);

  // Exponer funciones usando useImperativeHandle
  useImperativeHandle(ref, () => ({
    centerOnUserLocation: () => {
      if (!mapInstanceRef.current || !userLocation) return;
      setCurrentZoom(13);
      mapInstanceRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 13,
        duration: 500,
      });
    },
    centerOnSpot: (spotId: string) => {
      if (!mapInstanceRef.current) return;
      const spot = spots.find(s => s.id === spotId);
      if (spot) {
        setCurrentZoom(15);
        mapInstanceRef.current.flyTo({
          center: [spot.location.longitude, spot.location.latitude],
          zoom: 15, // Zoom cercano para contexto urbano (calles legibles)
          duration: 500,
        });
      }
    },
    zoomIn: () => {
      if (!mapInstanceRef.current) return;
      const currentZoom = mapInstanceRef.current.getZoom();
      const newZoom = Math.min(currentZoom + 1, 20); // Max zoom 20
      setCurrentZoom(newZoom);
      mapInstanceRef.current.zoomTo(newZoom, { duration: 200 });
    },
    zoomOut: () => {
      if (!mapInstanceRef.current) return;
      const currentZoom = mapInstanceRef.current.getZoom();
      const newZoom = Math.max(currentZoom - 1, 0); // Min zoom 0
      setCurrentZoom(newZoom);
      mapInstanceRef.current.zoomTo(newZoom, { duration: 200 });
    },
    resize: () => {
      if (!mapInstanceRef.current) return;
      // Forzar recalculo del tamaño del mapa
      mapInstanceRef.current.resize();
    },
  }), [userLocation, spots]);

  // Cargar Mapbox y crear instancia
  useEffect(() => {
    if (!isMapboxConfigured()) {
      setError('Mapbox Access Token not configured. Please set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in your .env file.');
      return;
    }

    let mounted = true;

    loadMapboxGL()
      .then((mapboxgl) => {
        if (!mounted) return;

        // Configurar access token
        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

        // Obtener elemento DOM
        const containerElement = containerRef.current;
        if (!containerElement) {
          setError('Map container not found');
          return;
        }

        const domElement = (containerElement as any)._nativeNode || containerElement;
        if (!domElement) {
          setError('DOM element not available');
          return;
        }

        // Esperar a que el contenedor tenga dimensiones
        const initializeMap = () => {
          if (!mounted) return;

          if (domElement.offsetWidth === 0 || domElement.offsetHeight === 0) {
            requestAnimationFrame(() => {
              if (!mounted) return;
              if (domElement.offsetWidth === 0 || domElement.offsetHeight === 0) {
                setTimeout(initializeMap, 100);
                return;
              }
              initializeMap();
            });
            return;
          }

          // Crear mapa
          const map = new mapboxgl.Map({
            container: domElement,
            style: 'mapbox://styles/mapbox/light-v11', // Estilo minimalista
            center: [region.longitude, region.latitude],
            zoom: Math.log2(360 / region.longitudeDelta) - 1,
            attributionControl: false,
          });

          // Agregar controles de Mapbox solo si no están deshabilitados
          if (!disableNativeControls) {
            map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
          }

          // Track zoom level
          map.on('zoom', () => {
            if (!mounted) return;
            setCurrentZoom(map.getZoom());
          });

          map.on('load', () => {
            if (!mounted) return;
            setIsLoaded(true);
            mapInstanceRef.current = map;
            setCurrentZoom(map.getZoom());

            // Agregar marcadores
            markersRef.current = spots.map((spot) => {
              const el = document.createElement('div');
              el.className = 'mapbox-marker';
              const isHighlighted = highlightedSpotId === spot.id;
              const showLabel = map.getZoom() >= 14; // Mostrar nombres cuando zoom >= 14
              
              el.style.width = isHighlighted ? '40px' : '32px';
              el.style.height = isHighlighted ? '40px' : '32px';
              el.style.borderRadius = '50%';
              el.style.backgroundColor = colors.tint;
              el.style.border = `3px solid white`;
              el.style.cursor = 'pointer';
              el.style.display = 'flex';
              el.style.flexDirection = 'column';
              el.style.alignItems = 'center';
              el.style.justifyContent = 'center';
              el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
              
              // Agregar label si el zoom es suficiente
              if (showLabel && spot.name) {
                const label = document.createElement('div');
                label.textContent = spot.name;
                label.style.position = 'absolute';
                label.style.top = '100%';
                label.style.marginTop = '4px';
                label.style.padding = '2px 6px';
                label.style.backgroundColor = colors.background + 'E6';
                label.style.color = colors.text;
                label.style.fontSize = '11px';
                label.style.fontWeight = '600';
                label.style.borderRadius = '4px';
                label.style.whiteSpace = 'nowrap';
                label.style.maxWidth = '120px';
                label.style.overflow = 'hidden';
                label.style.textOverflow = 'ellipsis';
                label.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
                label.style.pointerEvents = 'none';
                el.appendChild(label);
              }

              const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([spot.location.longitude, spot.location.latitude])
                .addTo(map);

              // CANONICAL: Llamar directamente onSpotPress sin preview intermedio
              el.addEventListener('click', (e) => {
                e.stopPropagation();
                onSpotPress(spot);
              });

              // Mostrar popup si está destacado
              if (highlightedSpotId === spot.id) {
                const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
                  .setLngLat([spot.location.longitude, spot.location.latitude])
                  .setHTML(`<div style="padding: 8px; font-size: 14px; font-weight: 600;">${spot.name}</div>`)
                  .addTo(map);
                popupRef.current = popup;
              }

              return marker;
            });

            // Agregar ubicación del usuario si está disponible
            if (showUserLocation && userLocation) {
              const userEl = document.createElement('div');
              userEl.className = 'mapbox-user-marker';
              
              // Círculo exterior azul
              const outerCircle = document.createElement('div');
              outerCircle.style.width = '20px';
              outerCircle.style.height = '20px';
              outerCircle.style.borderRadius = '50%';
              outerCircle.style.backgroundColor = '#4285F4';
              outerCircle.style.border = '3px solid white';
              outerCircle.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
              outerCircle.style.display = 'flex';
              outerCircle.style.alignItems = 'center';
              outerCircle.style.justifyContent = 'center';
              
              // Punto central más pequeño
              const innerDot = document.createElement('div');
              innerDot.style.width = '8px';
              innerDot.style.height = '8px';
              innerDot.style.borderRadius = '50%';
              innerDot.style.backgroundColor = 'white';
              
              outerCircle.appendChild(innerDot);
              userEl.appendChild(outerCircle);

              const userMarker = new mapboxgl.Marker({ element: userEl })
                .setLngLat([userLocation.longitude, userLocation.latitude])
                .addTo(map);
              userLocationMarkerRef.current = userMarker;
            }

            // Agregar ruta si está disponible
            if (showRoute && flowSpots && flowSpots.length >= 2) {
              const coordinates = flowSpots.map(spot => [spot.location.longitude, spot.location.latitude]);
              
              map.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates,
                  },
                },
              });

              map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round',
                },
                paint: {
                  'line-color': '#FF6B35',
                  'line-width': 3,
                },
              });
            }
          });

          // Click/Long press handler
          // Desktop: click simple en el mapa (fuera de marcadores) selecciona ubicación
          // Mobile: long press selecciona ubicación
          let longPressTimer: NodeJS.Timeout | null = null;
          let clickLocation: { lat: number; lng: number } | null = null;
          let isClick = false;
          
          map.on('click', (e) => {
            // Si no hay spots o el click es fuera de marcadores, permitir selección directa
            if (spots.length <= 1 && onLongPress) {
              // En desktop web, permitir click directo (con un pequeño delay para distinguir de drag)
              clickLocation = { lat: e.lngLat.lat, lng: e.lngLat.lng };
              isClick = true;
              
              setTimeout(() => {
                if (isClick && clickLocation && onLongPress) {
                  onLongPress({
                    latitude: clickLocation.lat,
                    longitude: clickLocation.lng,
                  });
                }
                isClick = false;
                clickLocation = null;
              }, 100);
            }
          });

          map.on('mousedown', (e) => {
            // Long press handler (para mobile o cuando se mantiene presionado)
            longPressTimer = setTimeout(() => {
              if (onLongPress) {
                onLongPress({
                  latitude: e.lngLat.lat,
                  longitude: e.lngLat.lng,
                });
                isClick = false; // Cancelar click si hay long press
              }
            }, 500);
          });

          map.on('mouseup', () => {
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              longPressTimer = null;
            }
          });

          map.on('dragstart', () => {
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              longPressTimer = null;
            }
            isClick = false; // Cancelar click si hay drag
          });
        };

        initializeMap();
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('MapboxViewWeb: Error loading Mapbox', err);
        setError(`Failed to load Mapbox: ${err.message}`);
      });

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }
    };
  }, []);

  // Actualizar marcadores cuando cambian los spots, highlightedSpotId o zoom
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Cerrar popup anterior
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }

    // Crear nuevos marcadores
    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) return;
    
    const map = mapInstanceRef.current;
    const showLabel = currentZoom >= 14; // Mostrar nombres cuando zoom >= 14

    markersRef.current = spots.map((spot) => {
      const el = document.createElement('div');
      el.className = 'mapbox-marker';
      const isHighlighted = highlightedSpotId === spot.id;
      el.style.width = isHighlighted ? '40px' : '32px';
      el.style.height = isHighlighted ? '40px' : '32px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = colors.tint;
      el.style.border = isHighlighted ? '3px solid #FF6B35' : '3px solid white';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.flexDirection = 'column';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.boxShadow = isHighlighted ? '0 4px 8px rgba(255,107,53,0.4)' : '0 2px 4px rgba(0,0,0,0.2)';
      
      // Agregar label si el zoom es suficiente
      if (showLabel && spot.name) {
        const label = document.createElement('div');
        label.textContent = spot.name;
        label.style.position = 'absolute';
        label.style.top = '100%';
        label.style.marginTop = '4px';
        label.style.padding = '2px 6px';
        label.style.backgroundColor = colors.background + 'E6';
        label.style.color = colors.text;
        label.style.fontSize = '11px';
        label.style.fontWeight = '600';
        label.style.borderRadius = '4px';
        label.style.whiteSpace = 'nowrap';
        label.style.maxWidth = '120px';
        label.style.overflow = 'hidden';
        label.style.textOverflow = 'ellipsis';
        label.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        label.style.pointerEvents = 'none';
        el.appendChild(label);
      }

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([spot.location.longitude, spot.location.latitude])
        .addTo(mapInstanceRef.current);

      // CANONICAL: Llamar directamente onSpotPress sin preview intermedio
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSpotPress(spot);
      });

      // Mostrar popup si está destacado
      if (isHighlighted) {
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setLngLat([spot.location.longitude, spot.location.latitude])
          .setHTML(`<div style="padding: 8px; font-size: 14px; font-weight: 600; color: ${colors.text};">${spot.name}</div>`)
          .addTo(mapInstanceRef.current);
        popupRef.current = popup;

        // Centrar en el spot destacado
        mapInstanceRef.current.flyTo({
          center: [spot.location.longitude, spot.location.latitude],
          zoom: 13,
          duration: 500,
        });
      }

      return marker;
    });
  }, [isLoaded, spots, highlightedSpotId, currentZoom, colors.tint, colors.text, colors.background, onSpotPress]);

  // Actualizar mapa cuando cambia la ubicación del usuario (si el mapa ya está cargado)
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !userLocation) return;
    
    // Solo actualizar si no hay spots destacados (para no interrumpir la navegación)
    if (highlightedSpotId) return;
    
    // Centrar en la ubicación del usuario con zoom razonable
    mapInstanceRef.current.flyTo({
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 13,
      duration: 500,
    });
  }, [isLoaded, userLocation, highlightedSpotId]);

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View ref={containerRef} style={styles.container}>
      {/* CSS para ocultar controles de Mapbox */}
      <style>{`
        .mapboxgl-ctrl-logo { display: none !important; }
        .mapboxgl-ctrl-attrib { display: none !important; }
      `}</style>
    </View>
  );
});

MapboxViewWebComponent.displayName = 'MapboxViewWeb';

export const MapboxViewWeb = MapboxViewWebComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
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

