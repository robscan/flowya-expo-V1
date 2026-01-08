/**
 * SelectLocationModal Component
 * Modal simple para seleccionar ubicación activa
 * 
 * Características:
 * - Modal BottomSheet-style con altura fija
 * - Sin animaciones complejas
 * - Lista de ubicaciones desde base de datos (todos los spots)
 * - Botón "Use my location"
 * - Componente aislado y autocontenido
 */

import * as Location from 'expo-location';
import { useEffect } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocations } from '@/hooks/useLocations';
import { PredefinedCity } from '@/utils/geocoding';

interface SelectLocationModalProps {
  visible: boolean;
  currentLocation: { latitude: number; longitude: number } | null;
  userLocation: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onLocationChange: (location: { latitude: number; longitude: number }) => void;
  onResetLocation: () => void;
}

export function SelectLocationModal({
  visible,
  currentLocation,
  userLocation,
  onClose,
  onLocationChange,
  onResetLocation,
}: SelectLocationModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { locations, isLoading: isLoadingLocations, refresh } = useLocations();
  const screenHeight = Dimensions.get('window').height;
  const modalHeight = screenHeight * 0.6; // 60% de la pantalla

  // Refrescar ubicaciones cuando se abre el modal
  useEffect(() => {
    if (visible) {
      refresh();
    }
  }, [visible, refresh]);

  // Verificar si una ubicación está activa
  const isLocationActive = (location: { latitude: number; longitude: number }) => {
    if (!currentLocation) return false;
    return (
      Math.abs(currentLocation.latitude - location.latitude) < 0.001 &&
      Math.abs(currentLocation.longitude - location.longitude) < 0.001
    );
  };

  // Manejar "Use my location"
  const handleUseMyLocation = async () => {
    try {
      // Si ya hay userLocation, usar reset
      if (userLocation) {
        onResetLocation();
        onClose();
        return;
      }

      // Si no hay userLocation, intentar obtenerla
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        onLocationChange(locationData);
        onClose();
      } else {
        // Permisos denegados - cerrar modal sin bloquear
        onClose();
      }
    } catch (error) {
      console.error('Error getting location:', error);
      // No bloquear si falla - simplemente cerrar modal
      onClose();
    }
  };

  // Manejar selección de ciudad predefinida
  const handleCitySelect = (city: PredefinedCity) => {
    onLocationChange(city.coordinates);
    onClose();
  };

  // Renderizar item de ciudad
  const renderCityItem = ({ item: city }: { item: PredefinedCity }) => {
    const isSelected = isLocationActive(city.coordinates);

    return (
      <TouchableOpacity
        style={[
          styles.cityItem,
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
        {isSelected && (
          <Icon name="check" size={16} color={colors.tint} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContainer,
            {
              height: modalHeight,
              backgroundColor: colors.background,
            },
          ]}
          onPress={(e) => e.stopPropagation()}>
          <GlassView
            style={styles.content}
            intensity="medium"
            opacity="strong"
            shadowLevel="medium"
            enableGlow={true}>
            {/* Título */}
            <View style={styles.header}>
              <Text style={[textStyles.heading4, { color: colors.text }]}>
                Select location
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                activeOpacity={0.7}>
                <Icon name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Botón "Use my location" */}
            <TouchableOpacity
              style={[
                styles.useLocationButton,
                {
                  backgroundColor: userLocation && isLocationActive(userLocation)
                    ? colors.tint + '20'
                    : colors.tint + '10',
                },
              ]}
              onPress={handleUseMyLocation}
              activeOpacity={0.8}>
              <Icon name="map-pin" size={18} color={colors.tint} />
              <Text
                style={[
                  textStyles.bodyMedium,
                  {
                    color: colors.tint,
                    marginLeft: spacing.xs,
                    fontWeight: '600',
                  },
                ]}>
                Use my location
              </Text>
            </TouchableOpacity>

            {/* Lista de ubicaciones desde base de datos */}
            {isLoadingLocations ? (
              <View style={styles.emptyState}>
                <Text style={[textStyles.bodyMedium, { color: colors.icon }]}>
                  Loading locations...
                </Text>
              </View>
            ) : locations.length > 0 ? (
              <FlatList
                data={locations}
                renderItem={renderCityItem}
                keyExtractor={(item) => item.name}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={true}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={[textStyles.bodyMedium, { color: colors.icon }]}>
                  No locations available
                </Text>
              </View>
            )}
          </GlassView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xs,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
});
