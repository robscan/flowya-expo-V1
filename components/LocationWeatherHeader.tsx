/**
 * LocationWeatherHeader Component
 * Muestra ubicación actual y dropdown para cambiar ciudad
 * 
 * Funcionalidades:
 * - Nombre de ciudad con dropdown para seleccionar ciudad predefinida
 */

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { SelectLocationModal } from '@/components/SelectLocationModal';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamilyMedium, fontSize, lineHeight } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCityNameFromCoordinates } from '@/utils/geocoding';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  const [cityName, setCityName] = useState<string>('Detecting location...');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
        // Obtener nombre de ciudad (ahora incluye fallback automático)
        const city = await getCityNameFromCoordinates(
          currentLocation.latitude,
          currentLocation.longitude
        );

        setCityName(city || 'Current location');
      } catch (error) {
        console.error('Error loading city:', error);
        setCityName('Current location');
      } finally {
        setIsLoading(false);
      }
    };

    loadCity();
  }, [currentLocation]);


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Location section */}
        <View style={styles.locationSection}>
          <TouchableOpacity
            style={styles.locationButton}
            onPress={() => setIsModalVisible(true)}
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

      {/* Select Location Modal */}
      <SelectLocationModal
        visible={isModalVisible}
        currentLocation={currentLocation}
        userLocation={userLocation}
        onClose={() => setIsModalVisible(false)}
        onLocationChange={onLocationChange}
        onResetLocation={onResetLocation}
      />
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
});

