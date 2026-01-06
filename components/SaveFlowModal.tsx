/**
 * Save Flow Modal Component
 * Modal para permitir nombrar un flow antes de guardarlo
 */

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { borderRadius } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamily, fontSize, lineHeight, textStyles } from '@/constants/typography';
import { Flow } from '@/data/flows';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SaveFlowModalProps {
  visible: boolean;
  flow: Flow | null;
  spots: Spot[];
  currentName?: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

/**
 * Generar nombre sugerido basado en los spots del flow
 */
function generateSuggestedName(flow: Flow | null, spots: Spot[]): string {
  if (!flow) return 'My Flow';
  
  const flowSpots = flow.spots
    .map((spotId) => spots.find((s) => s.id === spotId))
    .filter((s): s is Spot => s !== undefined);
  
  if (flowSpots.length === 0) {
    return flow.title || 'My Flow';
  }
  
  // Si hay un solo spot, usar su nombre
  if (flowSpots.length === 1) {
    return `${flowSpots[0].name || 'Flow'} Tour`;
  }
  
  // Si hay múltiples spots, usar el primero y último
  if (flowSpots.length >= 2) {
    const first = flowSpots[0].name || 'Start';
    const last = flowSpots[flowSpots.length - 1].name || 'End';
    return `${first} to ${last}`;
  }
  
  return flow.title || 'My Flow';
}

export function SaveFlowModal({
  visible,
  flow,
  spots,
  currentName,
  onSave,
  onCancel,
}: SaveFlowModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [flowName, setFlowName] = useState('');

  // Inicializar nombre cuando se abre el modal
  useEffect(() => {
    if (visible) {
      if (currentName) {
        setFlowName(currentName);
      } else {
        setFlowName(generateSuggestedName(flow, spots));
      }
    }
  }, [visible, currentName, flow, spots]);

  const handleSave = () => {
    const trimmedName = flowName.trim();
    if (trimmedName.length === 0) {
      // Si está vacío, usar nombre sugerido
      onSave(generateSuggestedName(flow, spots));
    } else {
      onSave(trimmedName);
    }
    setFlowName('');
  };

  const handleCancel = () => {
    setFlowName('');
    onCancel();
  };

  const suggestedName = generateSuggestedName(flow, spots);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}>
      <Pressable style={styles.overlay} onPress={handleCancel}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <GlassView
              style={styles.modal}
              intensity="medium"
              opacity="strong"
              shadowLevel="medium"
              enableGlow={true}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[textStyles.heading3, { color: colors.text }]}>
                  Save flow
                </Text>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={styles.closeButton}
                  activeOpacity={0.7}>
                  <Icon name="close" size={20} color={colors.icon} />
                </TouchableOpacity>
              </View>

              {/* Description */}
              <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, marginBottom: spacing.md }]}>
                Give your flow a name so you can find it later.
              </Text>

              {/* Input */}
              <View style={styles.inputContainer}>
                <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
                  Flow name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.icon + '30',
                      backgroundColor: colors.background,
                    },
                  ]}
                  value={flowName}
                  onChangeText={setFlowName}
                  placeholder={suggestedName}
                  placeholderTextColor={colors.icon}
                  autoFocus
                  maxLength={50}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
                <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
                  {flowName.length}/50 characters
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: colors.icon + '30' }]}
                  onPress={handleCancel}
                  activeOpacity={0.7}>
                  <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton, { backgroundColor: colors.tint }]}
                  onPress={handleSave}
                  activeOpacity={0.8}>
                  <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </GlassView>
          </Pressable>
        </KeyboardAvoidingView>
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
  keyboardView: {
    width: '100%',
    maxWidth: 400,
  },
  modal: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
    fontFamily: fontFamily,
    minHeight: 48,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor se aplica dinámicamente
  },
});

