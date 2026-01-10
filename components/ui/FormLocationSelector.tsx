/**
 * FormLocationSelector - Selector de ubicación canónico
 * CANONICAL: Componente único de selección de ubicación para FLOWYA
 * 
 * Características:
 * - Búsqueda por dirección con sugerencias en tiempo real
 * - Selección directa en mapa (click/tap unificado)
 * - Sincronización bidireccional automática entre input, mapa y estado
 * - Funciona correctamente en desktop web y mobile web
 * - Comportamiento idéntico en creación y edición
 * - Usa tokens del design system
 * - Integración con FormField
 * 
 * Principios:
 * - Fuente de verdad única: un solo estado location controla todo
 * - NO muestra inputs técnicos (lat/lng) al usuario
 * - Prevención de bucles infinitos mediante refs y comparaciones
 * - Manejo de errores silencioso con fallbacks
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FlowyaMapView } from '@/components/MapView';
import { FormTextInput } from '@/components/ui/FormTextInput';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { reverseGeocodeMapbox, forwardGeocodeMapbox } from '@/utils/mapboxGeocoding';

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
  description: string;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

/**
 * FormLocationSelector - Selector de ubicación canónico
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

  // Estado interno (fuente de verdad única)
  const [internalLocation, setInternalLocation] = useState<{ latitude: number; longitude: number } | null>(locationProp);
  const [address, setAddress] = useState<string>('');
  
  // Estado de búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Refs para prevenir bucles infinitos
  const lastLocationRef = useRef<string>('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInternalUpdateRef = useRef<boolean>(false);

  // Función helper para generar clave de ubicación
  const getLocationKey = useCallback((loc: { latitude: number; longitude: number } | null): string => {
    if (!loc) return 'null';
    return `${loc.latitude.toFixed(6)}-${loc.longitude.toFixed(6)}`;
  }, []);

  // Función de reverse geocoding para actualizar dirección
  // CANONICAL: Usa Mapbox Geocoding API (NO Google, NO expo-location)
  const updateAddressFromLocation = useCallback(async (loc: { latitude: number; longitude: number }) => {
    try {
      const result = await reverseGeocodeMapbox(loc.latitude, loc.longitude);
      
      if (result && result.formattedAddress) {
        setAddress(result.formattedAddress);
        return result.formattedAddress;
      }
      
      // Si no hay formattedAddress, construir desde partes
      if (result) {
        const addressParts = [
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);
        
        if (addressParts.length > 0) {
          const constructedAddress = addressParts.join(', ');
          setAddress(constructedAddress);
          return constructedAddress;
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error in reverse geocoding:', error);
      }
    }
    
    // Fallback a coordenadas si no hay dirección disponible
    const fallbackAddress = `${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`;
    setAddress(fallbackAddress);
    return fallbackAddress;
  }, []);

  // Función de búsqueda con debounce
  // CANONICAL: Usa Mapbox Forward Geocoding API (NO Google, NO expo-location)
  const handleSearchAddress = useCallback(async (query: string) => {
    if (!query.trim() || disabled) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Cancelar búsqueda anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce de 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Usar Mapbox forward geocoding directamente
        // Mapbox ya retorna place_name formateado, no necesitamos reverse geocoding adicional
        const results = await forwardGeocodeMapbox(query, 5);
        
        // Mapear resultados de Mapbox a formato esperado
        const formattedResults: GeocodeResult[] = results.map((result) => ({
          latitude: result.latitude,
          longitude: result.longitude,
          description: result.description || query || `${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`,
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

  // Handler de selección de resultado de búsqueda
  const handleSelectResult = useCallback(async (result: GeocodeResult) => {
    const newLocation = { latitude: result.latitude, longitude: result.longitude };
    const locationKey = getLocationKey(newLocation);
    
    // Prevenir actualizaciones si la ubicación no cambió significativamente
    if (lastLocationRef.current === locationKey) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }
    
    lastLocationRef.current = locationKey;
    isInternalUpdateRef.current = true;
    
    // Actualizar estado interno
    setInternalLocation(newLocation);
    setSearchQuery(result.description);
    
    // Actualizar dirección
    await updateAddressFromLocation(newLocation);
    
    // Notificar cambio externo
    onLocationChange(newLocation);
    
    // Cerrar resultados
    setShowResults(false);
    setSearchResults([]);
    
    // Reset flag después de un breve delay para permitir que el efecto de sincronización no interfiera
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 100);
  }, [onLocationChange, getLocationKey, updateAddressFromLocation]);

  // Handler de click/tap en mapa (unificado para desktop y mobile)
  const handleMapPress = useCallback(async (newLocation: { latitude: number; longitude: number }) => {
    if (disabled) return;
    
    const locationKey = getLocationKey(newLocation);
    
    // Prevenir actualizaciones si la ubicación no cambió significativamente
    if (lastLocationRef.current === locationKey) {
      return;
    }
    
    lastLocationRef.current = locationKey;
    isInternalUpdateRef.current = true;
    
    // Actualizar estado interno
    setInternalLocation(newLocation);
    
    // Actualizar dirección y query de búsqueda
    const formattedAddress = await updateAddressFromLocation(newLocation);
    setSearchQuery(formattedAddress);
    
    // Notificar cambio externo
    onLocationChange(newLocation);
    
    // Cerrar resultados si están abiertos
    setShowResults(false);
    
    // Reset flag después de un breve delay
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 100);
  }, [disabled, onLocationChange, getLocationKey, updateAddressFromLocation]);

  // Efecto de sincronización con props externos
  useEffect(() => {
    // Si es una actualización interna, ignorar para prevenir bucles
    if (isInternalUpdateRef.current) {
      return;
    }
    
    // Comparar location prop con estado interno
    const propLocationKey = getLocationKey(locationProp);
    const internalLocationKey = getLocationKey(internalLocation);
    
    // Solo actualizar si es diferente
    if (propLocationKey !== internalLocationKey) {
      const newLocationKey = getLocationKey(locationProp);
      if (newLocationKey !== lastLocationRef.current) {
        lastLocationRef.current = newLocationKey;
        setInternalLocation(locationProp);
        
        // Si hay ubicación, actualizar dirección
        if (locationProp) {
          updateAddressFromLocation(locationProp).then((formattedAddress) => {
            setSearchQuery(formattedAddress);
          });
        } else {
          setSearchQuery('');
          setAddress('');
        }
      }
    }
  }, [locationProp, internalLocation, getLocationKey, updateAddressFromLocation]);

  // Inicializar dirección si hay ubicación pero no hay dirección aún
  useEffect(() => {
    if (internalLocation && !address) {
      updateAddressFromLocation(internalLocation);
    }
  }, [internalLocation, address, updateAddressFromLocation]);

  // Cleanup de timeout en unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Calcular región inicial para el mapa (siempre debe haber una región)
  const mapRegion: Region = internalLocation
    ? {
        latitude: internalLocation.latitude,
        longitude: internalLocation.longitude,
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
        // Fallback: Riviera Maya, México (región por defecto para el demo)
        latitude: 20.6170,
        longitude: -87.0798,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  // Spots para mostrar en el mapa (solo si hay ubicación seleccionada)
  const mapSpots = internalLocation
    ? [
        {
          id: 'temp-location-selector',
          name: 'Selected Location',
          location: internalLocation,
          photos: [],
          type: 'other' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
    : [];

  return (
    <View style={[styles.container, style]}>
      {/* Input de búsqueda */}
      <View style={styles.searchContainer}>
        <FormTextInput
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleSearchAddress(text);
          }}
          placeholder="Search by address"
          onSubmitEditing={() => {
            if (searchResults.length > 0) {
              handleSelectResult(searchResults[0]);
            }
          }}
          disabled={disabled}
          rightIcon={isSearching ? undefined : 'search'}
          onRightIconPress={() => {
            if (searchQuery.trim()) {
              handleSearchAddress(searchQuery);
            }
          }}
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

      {/* Mapa - siempre visible - contenedor debe estar vacío (solo el mapa) */}
      <View style={[styles.mapContainer, { height: mapHeight }]}>
        <FlowyaMapView
          key={internalLocation ? `${internalLocation.latitude.toFixed(4)}-${internalLocation.longitude.toFixed(4)}` : 'no-location'}
          spots={mapSpots}
          onSpotPress={() => {}}
          onLongPress={handleMapPress}
          initialRegion={mapRegion}
          userLocation={userLocation}
          showUserLocation={!!userLocation}
        />
      </View>

      {/* Instrucciones - fuera del contenedor del mapa */}
      {!disabled && (
        <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
          {Platform.OS === 'web' ? 'Click' : 'Tap'} on the map to select location
        </Text>
      )}

      {/* Coordenadas informativas (discreto) */}
      {internalLocation && (
        <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs, opacity: 0.6 }]}>
          {internalLocation.latitude.toFixed(6)}, {internalLocation.longitude.toFixed(6)}
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
