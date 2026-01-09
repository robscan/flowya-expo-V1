/**
 * SavedFilterHeader Component
 * CANONICAL: Header interactivo con dropdown de filtros para Saved (Spots, Flows, All)
 * 
 * Funcionalidades:
 * - Muestra "Saved" como título
 * - Es clickeable y abre dropdown
 * - Dropdown lista filtros: Spots, Flows, All
 * - Al seleccionar filtro, actualiza el estado local
 * - Usa mismo estilo visual que RegionHeader
 */

import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';

export type SavedFilterType = 'spots' | 'flows' | 'all';

interface SavedFilterHeaderProps {
  currentFilter: SavedFilterType; // Filtro actual
  onFilterSelect: (filter: SavedFilterType) => void; // Callback cuando se selecciona un filtro
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  visible?: boolean; // Controla visibilidad (default: true)
  absolute?: boolean; // Si es true, se posiciona como overlay absoluto
}

export function SavedFilterHeader({
  currentFilter,
  onFilterSelect,
  rightAction,
  visible = true,
  absolute = false,
}: SavedFilterHeaderProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const translateY = useRef(new Animated.Value(visible ? 0 : -100)).current;
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownScale = useRef(new Animated.Value(0.95)).current;
  
  // Calcular altura máxima del dropdown (65% del viewport)
  const screenHeight = Dimensions.get('window').height;
  const maxDropdownHeight = screenHeight * 0.65;

  // Opciones del filtro (orden fijo)
  const filterOptions: { value: SavedFilterType; label: string }[] = [
    { value: 'spots', label: 'Spots' },
    { value: 'flows', label: 'Flows' },
    { value: 'all', label: 'All' },
  ];

  // Animación de header
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
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
          useNativeDriver: true,
        }),
        Animated.spring(dropdownScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(dropdownScale, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDropdownOpen, dropdownOpacity, dropdownScale]);

  const handleFilterPress = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleFilterSelect = (filter: SavedFilterType) => {
    onFilterSelect(filter);
    setIsDropdownOpen(false);
  };

  const getDisplayLabel = () => {
    const selected = filterOptions.find(opt => opt.value === currentFilter);
    return selected?.label || 'All';
  };

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
            onPress={handleFilterPress}
            style={styles.filterButton}
            activeOpacity={0.7}>
            <Text style={[textStyles.heading3, { color: colors.text }]}>Saved</Text>
            <Text style={[textStyles.body, { color: colors.icon, marginLeft: spacing.xs }]}>• {getDisplayLabel()}</Text>
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
              {/* Options: Spots, Flows, All */}
              {filterOptions.map((option) => {
                const isSelected = currentFilter === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleFilterSelect(option.value)}
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
                          flex: 1,
                        },
                      ]}>
                      {option.label}
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
  filterButton: {
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
