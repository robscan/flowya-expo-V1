/**
 * FormIconSelector - Selector de iconos
 * CANONICAL: Selector de iconos para formularios
 * 
 * Características:
 * - Modal con grid de iconos
 * - Estados: default, selected
 * - Usa tokens del design system
 * - Integración con FormField
 */

import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon, IconName } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface FormIconSelectorProps {
  /** Icono seleccionado */
  selectedIcon: IconName;
  /** Callback cuando se selecciona un icono */
  onSelectIcon: (icon: IconName) => void;
  /** Si el selector está visible */
  visible: boolean;
  /** Callback para cerrar el selector */
  onClose: () => void;
  /** Iconos disponibles (default: todos los iconos comunes) */
  icons?: IconName[];
  /** Título del selector (default: "Select Icon") */
  title?: string;
}

const DEFAULT_ICONS: IconName[] = [
  'sun',
  'camera',
  'clock',
  'map',
  'star',
  'bookmark',
  'like',
  'audio',
  'play',
  'navigation',
  'home',
  'explore',
  'gems',
  'search',
  'mic',
  'money',
  'paw',
  'accessibility',
  'edit',
  'share',
  'add',
  'minus',
  'plus',
];

/**
 * FormIconSelector - Selector de iconos canónico
 */
export function FormIconSelector({
  selectedIcon,
  onSelectIcon,
  visible,
  onClose,
  icons = DEFAULT_ICONS,
  title = 'Select Icon',
}: FormIconSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <GlassView
          style={styles.container}
          shadowLevel="medium"
          enableGlow={true}>
          <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
            {title}
          </Text>
          <ScrollView style={styles.grid} showsVerticalScrollIndicator={false}>
            <View style={styles.gridContent}>
              {icons.map((iconName) => {
                const isSelected = selectedIcon === iconName;
                return (
                  <TouchableOpacity
                    key={iconName}
                    style={[
                      styles.iconItem,
                      {
                        backgroundColor: isSelected
                          ? colors.tint + '20'
                          : colors.icon + '10',
                        borderColor: isSelected ? colors.tint : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      onSelectIcon(iconName);
                      onClose();
                    }}
                    activeOpacity={0.7}>
                    <Icon name={iconName} size={32} color={colors.tint} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </GlassView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  container: {
    width: '80%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: 16,
    padding: spacing.md,
  },
  grid: {
    maxHeight: 400,
  },
  gridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  iconItem: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.xs,
  },
});
