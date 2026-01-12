/**
 * PinStateModal Component
 * V1.2: Modal para seleccionar estado de Pin (To Visit / Visited)
 * 
 * Muestra opciones para crear Pin con estado inicial
 */

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { PinState } from '@/contexts/SavedContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface PinStateModalProps {
  visible: boolean;
  onSelect: (state: PinState) => void;
  onCancel: () => void;
}

export function PinStateModal({
  visible,
  onSelect,
  onCancel,
}: PinStateModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSelect = (state: PinState) => {
    onSelect(state);
  };

  // No renderizar el Modal cuando no está visible (evita bloqueo de eventos en web móvil)
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <GlassView
            style={styles.modal}
            intensity="medium"
            opacity="strong"
            shadowLevel="subtle">
            <View style={styles.content}>
              <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
                Pin this spot
              </Text>
              <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
                Choose how you want to pin this spot
              </Text>

              <View style={styles.options}>
                {/* To Visit */}
                <Pressable
                  style={[
                    styles.option,
                    {
                      backgroundColor: colorScheme === 'dark' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.05)',
                      borderColor: colorScheme === 'dark' ? 'rgba(33, 150, 243, 0.3)' : 'rgba(33, 150, 243, 0.2)',
                    },
                  ]}
                  onPress={() => handleSelect('to_visit')}
                  android_ripple={{ color: 'rgba(33, 150, 243, 0.2)' }}>
                  <View style={styles.optionContent}>
                    <Icon name="pin" size={24} color="#2196F3" />
                    <View style={styles.optionText}>
                      <Text style={[textStyles.body, { color: colors.text, fontWeight: '500' }]}>
                        To Visit
                      </Text>
                      <Text style={[textStyles.caption, { color: colors.icon }]}>
                        Places I want to visit
                      </Text>
                    </View>
                  </View>
                </Pressable>

                {/* Visited */}
                <Pressable
                  style={[
                    styles.option,
                    {
                      backgroundColor: colorScheme === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
                      borderColor: colorScheme === 'dark' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)',
                    },
                  ]}
                  onPress={() => handleSelect('visited')}
                  android_ripple={{ color: 'rgba(76, 175, 80, 0.2)' }}>
                  <View style={styles.optionContent}>
                    <Icon name="check-circle" size={24} color="#4CAF50" />
                    <View style={styles.optionText}>
                      <Text style={[textStyles.body, { color: colors.text, fontWeight: '500' }]}>
                        Visited
                      </Text>
                      <Text style={[textStyles.caption, { color: colors.icon }]}>
                        Places I've already visited
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </View>

              <Pressable
                style={styles.cancelButton}
                onPress={onCancel}
                android_ripple={{ color: colors.icon + '20' }}>
                <Text style={[textStyles.body, { color: colors.icon }]}>Cancel</Text>
              </Pressable>
            </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.lg,
  },
  options: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  option: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  optionText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  cancelButton: {
    padding: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
});
