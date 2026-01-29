/**
 * RegionHeader Component
 * CANONICAL: Header interactivo con dropdown de regiones usando regionId canónico
 * 
 * Funcionalidades:
 * - Muestra región actual (ej: "Tulum" o "All regions")
 * - Es clickeable y abre dropdown
 * - Dropdown lista regiones disponibles (usando RegionOption[])
 * - Al seleccionar región, actualiza RegionContext usando regionId canónico
 * - Usa mismo estilo visual que ScreenHeader
 */

import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { RegionOption } from '@/core/region';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View, ViewStyle, ScrollView, Dimensions } from 'react-native';

interface RegionHeaderProps {
  currentRegionLabel: string | null; // Label para mostrar en UI
  currentRegionId: string | null; // regionId canónico para comparaciones
  isCurrentLocation: boolean; // Indica si está usando "Current location"
  availableRegions: RegionOption[]; // Regiones disponibles (canónicas)
  onRegionSelect: (regionId: string | null) => void; // Callback con regionId canónico (región manual)
  onCurrentLocationSelect: () => void; // Callback para activar "Current location"
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  visible?: boolean; // Controla visibilidad (default: true)
  absolute?: boolean; // Si es true, se posiciona como overlay absoluto
}

export function RegionHeader({
  currentRegionLabel,
  currentRegionId,
  isCurrentLocation,
  availableRegions,
  onRegionSelect,
  onCurrentLocationSelect,
  rightAction,
  visible = true,
  absolute = false,
}: RegionHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const lastOpenAtRef = useRef<number | null>(null);
  const translateY = useRef(new Animated.Value(visible ? 0 : -100)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownScale = useRef(new Animated.Value(0.95)).current;

  
  // Calcular altura máxima del dropdown (65% del viewport)
  const screenHeight = Dimensions.get('window').height;
  const maxDropdownHeight = screenHeight * 0.65;

  // Animación de header
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [visible, translateY, opacity]);

  // Animación de dropdown
  useEffect(() => {
    if (isDropdownOpen) {
      Animated.parallel([
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(dropdownScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(dropdownScale, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [isDropdownOpen, dropdownOpacity, dropdownScale]);

  const handleRegionPress = () => {
    if (!isDropdownOpen) {
      lastOpenAtRef.current = Date.now();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleRegionSelect = (regionId: string | null) => {
    const lastOpenAt = lastOpenAtRef.current;
    if (lastOpenAt && Date.now() - lastOpenAt < 250) {
      return;
    }
    lastOpenAtRef.current = null;
    onRegionSelect(regionId);
    setIsDropdownOpen(false);
  };

  const handleCurrentLocationSelect = () => {
    const lastOpenAt = lastOpenAtRef.current;
    if (lastOpenAt && Date.now() - lastOpenAt < 250) {
      return;
    }
    lastOpenAtRef.current = null;
    onCurrentLocationSelect();
    setIsDropdownOpen(false);
  };

  const displayTitle = isCurrentLocation 
    ? currentRegionLabel || 'Current location'
    : currentRegionLabel || 'All regions';

  const animatedStyle = {
    transform: [{ translateY }],
    opacity,
  };

  const pointerEvents = visible ? 'auto' : 'none';

  return (
    <>
      <Animated.View
        style={[
          styles.header,
          absolute && styles.headerAbsolute,
          {
            borderBottomColor:
              colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            backgroundColor: absolute ? colors.background : undefined,
          },
          animatedStyle,
        ]}
        pointerEvents={pointerEvents}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleRegionPress}
            style={styles.regionButton}
            activeOpacity={0.7}>
            <Text style={[textStyles.heading3, { color: colors.text }]}>{displayTitle}</Text>
            <Icon
              name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.icon}
              style={{ marginLeft: spacing.xs }}
            />
          </TouchableOpacity>
          {rightAction && (
            <TouchableOpacity
              onPress={rightAction.onPress}
              style={iconTouchableContainer.base}
              activeOpacity={0.7}>
              <Icon name={rightAction.icon as any} size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Dropdown Modal */}
      <Modal
        visible={isDropdownOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsDropdownOpen(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDropdownOpen(false)}
          activeOpacity={1}>
          <Animated.View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.background,
                borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                opacity: dropdownOpacity,
                transform: [{ scale: dropdownScale }],
                maxHeight: maxDropdownHeight,
              },
            ]}
            onStartShouldSetResponder={() => true}>
            <ScrollView
              style={styles.dropdownScroll}
              contentContainerStyle={styles.dropdownScrollContent}
              showsVerticalScrollIndicator={true}
              bounces={false}
              nestedScrollEnabled={true}>
              {/* Option: Current location - PRIMERA OPCIÓN */}
              <Pressable
                onPress={handleCurrentLocationSelect}
                style={[
                  styles.dropdownItem,
                  isCurrentLocation && styles.dropdownItemActive,
                  { backgroundColor: isCurrentLocation ? colors.tint + '20' : 'transparent' },
                ]}
                activeOpacity={0.7}>
                <Icon name="navigation" size={18} color={isCurrentLocation ? colors.tint : colors.icon} style={{ marginRight: spacing.xs }} />
                <Text
                  style={[
                    textStyles.body,
                    {
                      color: isCurrentLocation ? colors.tint : colors.text,
                      fontWeight: isCurrentLocation ? '600' : '400',
                      flex: 1,
                    },
                  ]}>
                  Current location
                </Text>
                {isCurrentLocation && (
                  <Icon name="check" size={18} color={colors.tint} style={{ marginLeft: spacing.xs }} />
                )}
              </Pressable>

              {/* Option: All regions */}
              <Pressable
                onPress={() => handleRegionSelect(null)}
                style={[
                  styles.dropdownItem,
                  !isCurrentLocation && currentRegionId === null && styles.dropdownItemActive,
                  { backgroundColor: !isCurrentLocation && currentRegionId === null ? colors.tint + '20' : 'transparent' },
                ]}
                activeOpacity={0.7}>
                <Text
                  style={[
                    textStyles.body,
                    {
                      color: !isCurrentLocation && currentRegionId === null ? colors.tint : colors.text,
                      fontWeight: !isCurrentLocation && currentRegionId === null ? '600' : '400',
                    },
                  ]}>
                  All regions
                </Text>
                {!isCurrentLocation && currentRegionId === null && (
                  <Icon name="check" size={18} color={colors.tint} style={{ marginLeft: spacing.xs }} />
                )}
              </Pressable>

              {/* Options: Available regions (canónicas, ordenadas alfabéticamente) */}
              {availableRegions.map((region) => {
                const isSelected = !isCurrentLocation && currentRegionId === region.regionId;
                return (
                  <Pressable
                    key={region.regionId}
                    onPress={() => handleRegionSelect(region.regionId)}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemActive,
                      { backgroundColor: isSelected ? colors.tint + '20' : 'transparent' },
                    ]}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        textStyles.body,
                        {
                          color: isSelected ? colors.tint : colors.text,
                          fontWeight: isSelected ? '600' : '400',
                        },
                      ]}>
                      {region.label}
                    </Text>
                    {isSelected && (
                      <Icon name="check" size={18} color={colors.tint} style={{ marginLeft: spacing.xs }} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    marginBottom: spacing.sm,
  },
  headerAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    marginBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: 70, // Altura aproximada del header
  },
  dropdown: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden', // IMPORTANTE: Prevenir overflow visual
  },
  dropdownScroll: {
    flexGrow: 0, // No crecer más allá del contenedor
    flexShrink: 1, // Permitir encogerse si es necesario
  },
  dropdownScrollContent: {
    paddingVertical: spacing.xs,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginHorizontal: spacing.xs,
    minHeight: 44, // Altura mínima para mejor UX táctil
  },
  dropdownItemActive: {
    // Estilo activo manejado por backgroundColor dinámico
  },
});
