/**
 * AIFieldSelector - Selector de campos para regenerar con IA
 * CANONICAL: Componente para seleccionar qué campos regenerar con IA
 * 
 * Características:
 * - Permite seleccionar campos específicos a regenerar
 * - Usa tokens del design system
 * - Integración con AIGenerateButton
 */

import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AIField = 'whyItMatters' | 'culturalContext' | 'howToVisit' | 'narration';

export interface AIFieldSelectorProps {
  /** Campos disponibles para regenerar */
  availableFields: AIField[];
  /** Campos seleccionados */
  selectedFields: AIField[];
  /** Callback cuando cambian los campos seleccionados */
  onFieldsChange: (fields: AIField[]) => void;
  /** Si está visible */
  visible: boolean;
  /** Callback para cerrar */
  onClose: () => void;
  /** Título (default: "Select fields to regenerate") */
  title?: string;
}

const FIELD_LABELS: Record<AIField, string> = {
  whyItMatters: 'Why it matters',
  culturalContext: 'Cultural context',
  howToVisit: 'How to visit',
  narration: 'Narration (for Flow)',
};

/**
 * AIFieldSelector - Selector de campos para regenerar con IA
 */
export function AIFieldSelector({
  availableFields,
  selectedFields,
  onFieldsChange,
  visible,
  onClose,
  title = 'Select fields to regenerate',
}: AIFieldSelectorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [tempSelected, setTempSelected] = useState<AIField[]>(selectedFields);

  const handleToggleField = (field: AIField) => {
    if (tempSelected.includes(field)) {
      setTempSelected(tempSelected.filter(f => f !== field));
    } else {
      setTempSelected([...tempSelected, field]);
    }
  };

  const handleApply = () => {
    onFieldsChange(tempSelected);
    onClose();
  };

  const handleCancel = () => {
    setTempSelected(selectedFields);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}>
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <GlassView
          style={styles.container}
          shadowLevel="medium"
          enableGlow={true}>
          <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
            {title}
          </Text>

          <View style={styles.fieldsList}>
            {availableFields.map((field) => {
              const isSelected = tempSelected.includes(field);
              return (
                <TouchableOpacity
                  key={field}
                  style={[
                    styles.fieldItem,
                    {
                      backgroundColor: isSelected ? colors.tint + '20' : colors.icon + '10',
                      borderColor: isSelected ? colors.tint : 'transparent',
                    },
                  ]}
                  onPress={() => handleToggleField(field)}
                  activeOpacity={0.7}>
                  <View style={styles.fieldItemContent}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: isSelected ? colors.tint : 'transparent',
                          borderColor: isSelected ? colors.tint : colors.icon + '30',
                        },
                      ]}>
                      {isSelected && (
                        <Icon name="check" size={16} color={colors.background} />
                      )}
                    </View>
                    <Text style={[textStyles.body, { color: colors.text, marginLeft: spacing.sm }]}>
                      {FIELD_LABELS[field]}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton, { backgroundColor: colors.icon + '20' }]}
              onPress={handleCancel}
              activeOpacity={0.7}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.applyButton, { backgroundColor: colors.tint }]}
              onPress={handleApply}
              disabled={tempSelected.length === 0}
              activeOpacity={0.7}>
              <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>
                Regenerate ({tempSelected.length})
              </Text>
            </TouchableOpacity>
          </View>
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
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: spacing.md,
  },
  fieldsList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  fieldItem: {
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  fieldItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {},
  applyButton: {},
});
