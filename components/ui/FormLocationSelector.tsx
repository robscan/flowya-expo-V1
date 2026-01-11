/**
 * FormLocationSelector - Selector de ubicación canónico
 * RECONSTRUIDO DESDE CERO - Arquitectura limpia con desacoplamiento completo
 * 
 * Características:
 * - Búsqueda por dirección con sugerencias en tiempo real (Mapbox Forward Geocoding)
 * - Selección directa en mapa (click/tap unificado)
 * - Input y coordenadas completamente desacoplados
 * - Funciona correctamente en desktop web y mobile web
 * - Usa tokens del design system
 * - Integración con FormField
 * 
 * Principios de arquitectura:
 * - Input controla búsqueda (texto humano únicamente, NUNCA coordenadas)
 * - Mapa controla coordenadas (independiente del input)
 * - No hay sincronización bidireccional input ↔ coordenadas
 * - Input solo muestra: texto de búsqueda o place_name seleccionado
 * - Click en mapa NO actualiza el input
 * - Botón clear solo limpia input, sin reverse geocode
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FlowyaMapView, FlowyaMapViewRef } from '@/components/MapView';
import { FormTextInput } from '@/components/ui/FormTextInput';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMapboxSearchBoxScript } from '@/hooks/useMapboxSearchBoxScript';
import { MAPBOX_ACCESS_TOKEN } from '@/utils/mapsConfig';
import { forwardGeocodeMapbox } from '@/utils/mapboxGeocoding';

export interface FormLocationSelectorProps {
  /** Ubicación actual */
  location: { latitude: number; longitude: number } | null;
  /** Callback cuando cambia la ubicación */
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
  /** Ubicación del usuario (opcional) */
  userLocation?: { latitude: number; longitude: number } | null;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Altura del mapa (default: 200) */
  mapHeight?: number;
  /** Estilo adicional */
  style?: any;
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  description: string; // place_name de Mapbox (texto humano)
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/**
 * FormLocationSelector - Selector de ubicación canónico
 * RECONSTRUIDO DESDE CERO con arquitectura limpia
 */
export function FormLocationSelector({
  location: locationProp,
  onLocationChange,
  userLocation,
  disabled = false,
  mapHeight = 200,
  style,
}: FormLocationSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // ============================================================================
  // P1-01: MAPBOX SEARCH BOX (WEB ONLY)
  // ============================================================================
  const { isLoaded: isSearchBoxLoaded, error: searchBoxError } = useMapboxSearchBoxScript();
  const searchBoxContainerIdRef = useRef(`mapbox-search-box-container-${Math.random().toString(36).substr(2, 9)}`);
  const searchBoxElementRef = useRef<HTMLElement | null>(null);
  const mapViewRef = useRef<FlowyaMapViewRef>(null);

  // ============================================================================
  // ESTADOS COMPLETAMENTE SEPARADOS (SIN ACOPLAMIENTO)
  // ============================================================================

  // Estado del input (completamente independiente de coordenadas)
  const [searchText, setSearchText] = useState(''); // Texto que el usuario escribe
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null); // place_name del resultado seleccionado

  // Estado de búsqueda
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Estado de coordenadas (completamente independiente del input)
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(locationProp);

  // Refs para control interno
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInternalUpdateRef = useRef<boolean>(false);

  // Función helper para generar clave de ubicación
  const getLocationKey = useCallback((loc: { latitude: number; longitude: number } | null): string => {
    if (!loc) return 'null';
    return `${loc.latitude.toFixed(6)}-${loc.longitude.toFixed(6)}`;
  }, []);

  // ============================================================================
  // FLUJO 1: BÚSQUEDA (Input → Resultados → Selección)
  // ============================================================================

  /**
   * Handler de búsqueda (solo input, NO toca coordenadas)
   * Usa Mapbox Forward Geocoding API para obtener resultados semánticos
   */
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim() || disabled) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Limpiar selección cuando el usuario busca de nuevo
    setSelectedAddress(null);

    // Cancelar búsqueda anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce de 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Usar Mapbox Forward Geocoding API
        const results = await forwardGeocodeMapbox(query, 5);

        // Mapear resultados: description contiene place_name (texto humano de Mapbox)
        const formattedResults: GeocodeResult[] = results.map((result) => ({
          latitude: result.latitude,
          longitude: result.longitude,
          description: result.description || query, // place_name de Mapbox (texto humano)
        }));

        setSearchResults(formattedResults);
        setShowResults(formattedResults.length > 0);
      } catch (error) {
        if (__DEV__) {
          console.error('Error searching address:', error);
        }
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, [disabled]);

  /**
   * Handler de selección de resultado de búsqueda
   * Guarda place_name en input y coordenadas independientemente
   */
  const handleSelectResult = useCallback((result: GeocodeResult) => {
    const newCoordinates = { latitude: result.latitude, longitude: result.longitude };

    isInternalUpdateRef.current = true;

    // Actualizar coordenadas (estado independiente)
    setCoordinates(newCoordinates);

    // Actualizar input: guardar place_name, limpiar texto de búsqueda
    setSelectedAddress(result.description); // place_name de Mapbox (texto humano)
    setSearchText(''); // Limpiar texto de búsqueda

    // Notificar cambio externo
    onLocationChange(newCoordinates);

    // Cerrar resultados
    setShowResults(false);
    setSearchResults([]);

    // Reset flag después de un breve delay
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 100);
  }, [onLocationChange]);

  // ============================================================================
  // FLUJO 2: MAPA (Click → Coordenadas)
  // ============================================================================

  /**
   * Handler de click/tap en mapa (unificado para desktop y mobile)
   * Actualiza coordenadas, NO toca el input
   */
  const handleMapPress = useCallback((newLocation: { latitude: number; longitude: number }) => {
    if (disabled) return;

    isInternalUpdateRef.current = true;

    // Actualizar coordenadas (estado independiente)
    setCoordinates(newLocation);

    // Notificar cambio externo
    onLocationChange(newLocation);

    // Cerrar resultados si están abiertos
    setShowResults(false);

    // NO tocar el input - queda como está (searchText y selectedAddress sin cambios)

    // Reset flag después de un breve delay
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 100);
  }, [disabled, onLocationChange]);

  // ============================================================================
  // FLUJO 3: CLEAR (Limpieza)
  // ============================================================================

  /**
   * Handler de clear
   * Limpia input únicamente, NO toca coordenadas, NO hace reverse geocode
   */
  const handleClear = useCallback(() => {
    setSearchText('');
    setSelectedAddress(null);
    setSearchResults([]);
    setShowResults(false);
    // NO tocar coordenadas
    // NO hacer reverse geocode
  }, []);

  // ============================================================================
  // SINCRONIZACIÓN CON PROPS EXTERNOS (Solo Coordenadas)
  // ============================================================================

  /**
   * Sincronizar coordenadas con props externos
   * NO toca el input (queda como está)
   */
  useEffect(() => {
    // Si es una actualización interna, ignorar para prevenir bucles
    if (isInternalUpdateRef.current) {
      return;
    }

    const propKey = getLocationKey(locationProp);
    const internalKey = getLocationKey(coordinates);

    // Solo actualizar si es diferente
    if (propKey !== internalKey) {
      setCoordinates(locationProp);
      // NO tocar el input - queda como está
    }
  }, [locationProp, coordinates, getLocationKey]);

  // Cleanup de timeout en unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================================
  // P1-01: SETUP MAPBOX SEARCH BOX (WEB ONLY)
  // ============================================================================

  // Montar y configurar el custom element de Mapbox Search Box en web
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!isSearchBoxLoaded || searchBoxError) return;

    // Si ya existe el elemento, no recrearlo
    if (searchBoxElementRef.current) return;

    // Capturar el ID del contenedor para usar en cleanup
    const containerId = searchBoxContainerIdRef.current;

    // Buscar el contenedor en el DOM usando el ID único
    const containerElement = document.getElementById(containerId);
    if (!containerElement) {
      // Si no existe aún, esperar un poco y reintentar
      const timeoutId = setTimeout(() => {
        const retryElement = document.getElementById(containerId);
        if (retryElement && !searchBoxElementRef.current) {
          mountSearchBox(retryElement);
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }

    mountSearchBox(containerElement);

    function mountSearchBox(container: HTMLElement) {
      // Crear el custom element
      const searchBoxElement = document.createElement('mapbox-search-box');
      searchBoxElement.setAttribute('access-token', MAPBOX_ACCESS_TOKEN || '');

      // Configurar opciones si hay userLocation para proximity
      if (userLocation) {
        const options = {
          proximity: [userLocation.longitude, userLocation.latitude] as [number, number],
        };
        searchBoxElement.setAttribute('options', JSON.stringify(options));
      }

      // Escuchar evento 'retrieve' para obtener coordenadas cuando se selecciona un resultado
      const handleRetrieve = (event: Event) => {
        const customEvent = event as CustomEvent;
        const feature = customEvent.detail;

        if (feature && feature.geometry && feature.geometry.coordinates) {
          const [longitude, latitude] = feature.geometry.coordinates;
          const newCoordinates = { latitude, longitude };

          isInternalUpdateRef.current = true;

          // Actualizar coordenadas
          setCoordinates(newCoordinates);

          // Actualizar input con place_name (texto humano)
          const placeName = feature.properties?.['place_name'] || feature.text || '';
          setSelectedAddress(placeName);
          setSearchText('');

          // P1-01: Sincronizar mapa con Search Box - centrar mapa en las coordenadas seleccionadas
          if (mapViewRef.current) {
            mapViewRef.current.flyToCoordinates(newCoordinates, 15); // Zoom 15 para contexto urbano
          }

          // Notificar cambio externo
          onLocationChange(newCoordinates);

          // Reset flag
          setTimeout(() => {
            isInternalUpdateRef.current = false;
          }, 100);
        }
      };

      searchBoxElement.addEventListener('retrieve', handleRetrieve);

      // Agregar al DOM
      container.appendChild(searchBoxElement);
      searchBoxElementRef.current = searchBoxElement;
    }

    // Cleanup
    return () => {
      if (searchBoxElementRef.current) {
        const container = document.getElementById(containerId);
        if (container && container.contains(searchBoxElementRef.current)) {
          // El event listener se remueve automáticamente cuando se remueve el elemento
          searchBoxElementRef.current.remove();
        }
        searchBoxElementRef.current = null;
      }
    };
  }, [isSearchBoxLoaded, searchBoxError, userLocation, onLocationChange]);

  // ============================================================================
  // RENDER
  // ============================================================================

  // Calcular región inicial para el mapa
  const mapRegion: Region = coordinates
    ? {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : userLocation
    ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        // Fallback: Riviera Maya, México (región por defecto)
        latitude: 20.6170,
        longitude: -87.0798,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  // Spots para mostrar en el mapa (solo si hay ubicación seleccionada)
  const mapSpots = coordinates
    ? [
        {
          id: 'temp-location-selector',
          name: 'Selected Location',
          location: coordinates,
          photos: [],
          type: 'other' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
    : [];

  // ============================================================================
  // P1-01: BIFURCACIÓN WEB vs NATIVE
  // ============================================================================

  // WEB: Usar Mapbox Search Box oficial (con fallback a implementación actual)
  if (Platform.OS === 'web') {
    // Si el Search Box está cargado y no hay error, usar el componente oficial
    const useOfficialSearchBox = isSearchBoxLoaded && !searchBoxError && MAPBOX_ACCESS_TOKEN;

    return (
      <View style={[styles.container, style]}>
        {/* Input de búsqueda - Web */}
        <View style={styles.searchContainer}>
          {useOfficialSearchBox ? (
            // Mapbox Search Box oficial
            <View
              style={styles.searchInput}
              nativeID={searchBoxContainerIdRef.current}
              // @ts-ignore - nativeID es válido en React Native Web
            >
              {/* El custom element se monta vía useEffect usando el nativeID */}
            </View>
          ) : (
            // Fallback: Implementación actual (si Search Box no está disponible)
            <>
              <FormTextInput
                value={selectedAddress || searchText}
                onChangeText={(text) => {
                  setSearchText(text);
                  setSelectedAddress(null);
                  handleSearch(text);
                }}
                placeholder="Search by address"
                onSubmitEditing={() => {
                  if (searchResults.length > 0) {
                    handleSelectResult(searchResults[0]);
                  }
                }}
                disabled={disabled}
                rightIcon={
                  isSearching
                    ? undefined
                    : selectedAddress || searchText.trim().length > 0
                      ? 'close'
                      : 'search'
                }
                onRightIconPress={handleClear}
                style={styles.searchInput}
              />

              {/* Dropdown de resultados de búsqueda */}
              {showResults && searchResults.length > 0 && (
                <View style={[styles.resultsContainer, { backgroundColor: colors.background, borderColor: colors.icon + '20' }]}>
                  <FlatList
                    data={searchResults}
                    keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[styles.resultItem, { borderBottomColor: colors.icon + '10' }]}
                        onPress={() => handleSelectResult(item)}
                        activeOpacity={0.7}>
                        <Text style={[textStyles.body, { color: colors.text }]} numberOfLines={2}>
                          {item.description}
                        </Text>
                      </TouchableOpacity>
                    )}
                    scrollEnabled={false}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              )}
            </>
          )}
        </View>

        {/* Mapa - siempre visible */}
        <View style={[styles.mapContainer, { height: mapHeight }]}>
          <FlowyaMapView
            ref={mapViewRef}
            key={coordinates ? `${coordinates.latitude.toFixed(4)}-${coordinates.longitude.toFixed(4)}` : 'no-location'}
            spots={mapSpots}
            onSpotPress={() => {}}
            onLongPress={handleMapPress}
            initialRegion={mapRegion}
            userLocation={userLocation}
            showUserLocation={!!userLocation}
          />
        </View>

        {/* Instrucciones */}
        {!disabled && (
          <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
            Click on the map to select location
          </Text>
        )}
      </View>
    );
  }

  // NATIVE: Implementación actual (SIN CAMBIOS)
  return (
    <View style={[styles.container, style]}>
      {/* Input de búsqueda */}
      <View style={styles.searchContainer}>
        <FormTextInput
          value={selectedAddress || searchText}
          onChangeText={(text) => {
            setSearchText(text);
            setSelectedAddress(null); // Limpiar selección cuando el usuario escribe
            handleSearch(text);
          }}
          placeholder="Search by address"
          onSubmitEditing={() => {
            if (searchResults.length > 0) {
              handleSelectResult(searchResults[0]);
            }
          }}
          disabled={disabled}
          rightIcon={
            isSearching
              ? undefined
              : selectedAddress || searchText.trim().length > 0
                ? 'close'
                : 'search'
          }
          onRightIconPress={handleClear}
          style={styles.searchInput}
        />

        {/* Dropdown de resultados de búsqueda */}
        {showResults && searchResults.length > 0 && (
          <View style={[styles.resultsContainer, { backgroundColor: colors.background, borderColor: colors.icon + '20' }]}>
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.resultItem, { borderBottomColor: colors.icon + '10' }]}
                  onPress={() => handleSelectResult(item)}
                  activeOpacity={0.7}>
                  <Text style={[textStyles.body, { color: colors.text }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              )}
              scrollEnabled={false}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}
      </View>

      {/* Mapa - siempre visible */}
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        <FlowyaMapView
          key={coordinates ? `${coordinates.latitude.toFixed(4)}-${coordinates.longitude.toFixed(4)}` : 'no-location'}
          spots={mapSpots}
          onSpotPress={() => {}}
          onLongPress={handleMapPress}
          initialRegion={mapRegion}
          userLocation={userLocation}
          showUserLocation={!!userLocation}
        />
      </View>

      {/* Instrucciones */}
      {!disabled && (
        <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
          Tap on the map to select location
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  searchContainer: {
    marginBottom: spacing.sm,
    position: 'relative',
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing.xs,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultItem: {
    padding: spacing.sm,
    borderBottomWidth: 1,
  },
  mapContainer: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
});
