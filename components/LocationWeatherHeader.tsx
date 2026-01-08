/**
 * LocationWeatherHeader Component
 * Muestra ubicación actual y dropdown para cambiar ciudad
 * 
 * Funcionalidades:
 * - Nombre de ciudad con dropdown para seleccionar ciudad predefinida
 */

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamilyMedium, fontSize, lineHeight, textStyles } from '@/constants/typography';
import { useSpot } from '@/contexts/SpotContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { findNearestPredefinedCity, getAllLocationsFromSpots, getCityNameFromCoordinates, PredefinedCity } from '@/utils/geocoding';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface LocationWeatherHeaderProps {
  userLocation: { latitude: number; longitude: number } | null;
  selectedLocation: { latitude: number; longitude: number } | null;
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
  onResetLocation: () => void;
}

export function LocationWeatherHeader({
  userLocation,
  selectedLocation,
  onLocationChange,
  onResetLocation,
}: LocationWeatherHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { spots } = useSpot(); // CANONICAL: Consumir spots desde context
  const [cityName, setCityName] = useState<string>('Detecting location...');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableLocations, setAvailableLocations] = useState<PredefinedCity[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  
  const screenHeight = Dimensions.get('window').height;

  // Asegurar que currentLocation siempre use userLocation si selectedLocation es null
  const currentLocation = selectedLocation || userLocation;

  // Obtener nombre de ciudad cuando cambia la ubicación
  useEffect(() => {
    if (!currentLocation) {
      setCityName('Detecting location...');
      setIsLoading(true);
      return;
    }

    const loadCity = async () => {
      setIsLoading(true);
      try {
        // Obtener nombre de ciudad
        let city = await getCityNameFromCoordinates(
          currentLocation.latitude,
          currentLocation.longitude
        );

        // Fallback inteligente: si no se encuentra ciudad, buscar ciudad predefinida más cercana
        if (!city) {
          const nearestCity = findNearestPredefinedCity(
            currentLocation.latitude,
            currentLocation.longitude,
            10000 // 10km de radio
          );
          if (nearestCity) {
            city = nearestCity.name;
            console.log(`Using nearest predefined city as fallback: ${city}`);
          }
        }

        // Último recurso: mostrar "Current location" solo si no hay fallback
        setCityName(city || 'Current location');
      } catch (error) {
        console.error('Error loading city:', error);
        // Intentar fallback a ciudad predefinida en caso de error
        try {
          const nearestCity = findNearestPredefinedCity(
            currentLocation.latitude,
            currentLocation.longitude,
            10000
          );
          if (nearestCity) {
            setCityName(nearestCity.name);
          } else {
            setCityName('Current location');
          }
        } catch (fallbackError) {
          console.error('Error in fallback:', fallbackError);
          setCityName('Current location');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCity();
  }, [currentLocation]);

  // CANONICAL: Cargar ubicaciones desde spots cuando se abre el modal o cuando spots cambian
  useEffect(() => {
    if (isDropdownVisible && spots.length > 0) {
      const loadLocations = async () => {
        setIsLoadingLocations(true);
        try {
          const locations = await getAllLocationsFromSpots(spots);
          setAvailableLocations(locations);
        } catch (error) {
          console.error('Error loading locations from spots:', error);
          setAvailableLocations([]);
        } finally {
          setIsLoadingLocations(false);
        }
      };
      
      loadLocations();
    }
  }, [isDropdownVisible, spots]);

  const handleCitySelect = (city: PredefinedCity) => {
    onLocationChange(city.coordinates);
    setIsDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Location section */}
        <View style={styles.locationSection}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setIsDropdownVisible(true)}
            activeOpacity={0.7}>
            <Text 
              style={[
                styles.locationText, 
                { 
                  color: colors.text,
                  opacity: isLoading ? 0.6 : 1,
                }
              ]} 
              numberOfLines={2}
              ellipsizeMode="tail">
              {isLoading ? 'Detecting location...' : cityName}
            </Text>
            <Icon name="chevron-down" size={14} color={colors.tint} />
          </TouchableOpacity>
        </View>
      </View>

      {/* CANONICAL: Modal scrollable con safe areas */}
      <Modal
        visible={isDropdownVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDropdownVisible(false)}>
          <Pressable
            style={[
              styles.modalContent,
              {
                maxHeight: screenHeight * 0.85, // 85% del viewport height máximo
              },
            ]}
            onPress={(e) => e.stopPropagation()}>
            <GlassView
              style={styles.dropdown}
              intensity="medium"
              opacity="strong"
              shadowLevel="medium"
              enableGlow={true}>
              <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
                Select Location
              </Text>
              
              {/* CANONICAL: ScrollView para listas largas */}
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled">
                {/* CANONICAL: "Use my location" primero */}
                {userLocation && (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      {
                        backgroundColor:
                          currentLocation &&
                          Math.abs(currentLocation.latitude - userLocation.latitude) < 0.001 &&
                          Math.abs(currentLocation.longitude - userLocation.longitude) < 0.001
                            ? colors.tint + '20'
                            : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      onResetLocation();
                      setIsDropdownVisible(false);
                    }}
                    activeOpacity={0.7}>
                    <Icon name="map-pin" size={16} color={colors.tint} />
                    <Text
                      style={[
                        textStyles.bodyMedium,
                        {
                          color: colors.tint,
                          marginLeft: spacing.xs,
                        },
                      ]}>
                      Use my location
                    </Text>
                  </TouchableOpacity>
                )}

                {/* CANONICAL: Loading state */}
                {isLoadingLocations ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={colors.tint} />
                    <Text style={[textStyles.bodyMedium, { color: colors.icon, marginLeft: spacing.sm }]}>
                      Loading locations...
                    </Text>
                  </View>
                ) : (
                  /* CANONICAL: Destinos reconocidos en orden alfabético */
                  availableLocations.map((city) => {
                    const isSelected =
                      currentLocation &&
                      Math.abs(currentLocation.latitude - city.coordinates.latitude) < 0.001 &&
                      Math.abs(currentLocation.longitude - city.coordinates.longitude) < 0.001;

                    return (
                      <TouchableOpacity
                        key={city.name}
                        style={[
                          styles.dropdownItem,
                          {
                            backgroundColor: isSelected ? colors.tint + '20' : 'transparent',
                          },
                        ]}
                        onPress={() => handleCitySelect(city)}
                        activeOpacity={0.7}>
                        <Text
                          style={[
                            textStyles.bodyMedium,
                            {
                              color: isSelected ? colors.tint : colors.text,
                            },
                          ]}>
                          {city.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </GlassView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs, // Reducir gap principal
  },
  locationSection: {
    flex: 1, // Ocupa todo el espacio disponible
    minWidth: 0, // Permite truncamiento correcto
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2, // Reducir gap entre texto y chevron
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: 0, // Eliminar padding horizontal
  },
  locationText: {
    fontFamily: fontFamilyMedium,
    fontSize: fontSize.lg, // 18px - más pequeño para que quepa completo
    lineHeight: lineHeight.lg, // 28px
    fontWeight: '600',
    flexShrink: 1, // Permite que el texto se ajuste
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  dropdown: {
    width: '100%',
    padding: spacing.md,
    borderRadius: 16,
    maxHeight: '100%',
  },
  scrollView: {
    maxHeight: 400, // Altura máxima para el scroll
  },
  scrollContent: {
    paddingBottom: spacing.xs,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
});

