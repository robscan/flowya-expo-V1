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
  isSaved: boolean; // CANONICAL: true if flow is already saved, false if draft
  hasChanges?: boolean; // CANONICAL: true if flow has unsaved changes
  flowState?: 'draft' | 'saved' | 'edited'; // CANONICAL: Flow state
  currentName?: string;
  onSave: (name: string) => void;
  onExitWithoutSaving: () => void;
  onDiscardChanges?: () => void; // CANONICAL: Discard changes (for edited flows)
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
  isSaved,
  hasChanges = false,
  flowState = isSaved ? 'saved' : 'draft',
  currentName,
  onSave,
  onExitWithoutSaving,
  onDiscardChanges,
  onCancel,
}: SaveFlowModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [flowName, setFlowName] = useState('');

  // CANONICAL: Initialize name when modal opens
  // - If saved: use current saved name (never ask for name again)
  // - If draft: use suggested name or empty
  useEffect(() => {
    if (visible) {
      if (isSaved && currentName) {
        // Already saved: use current saved name
        setFlowName(currentName);
      } else if (!isSaved) {
        // Draft: use suggested name or empty
        setFlowName(currentName || generateSuggestedName(flow, spots));
      } else {
        // Fallback
        setFlowName(generateSuggestedName(flow, spots));
      }
    }
  }, [visible, isSaved, currentName, flow, spots]);

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
                  {flowState === 'edited' ? 'Save changes?' : isSaved ? 'Close route' : 'Save route'}
                </Text>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={styles.closeButton}
                  activeOpacity={0.7}>
                  <Icon name="close" size={20} color={colors.icon} />
                </TouchableOpacity>
              </View>

              {/* CANONICAL: Different UI based on flow state and changes */}
              {flowState === 'draft' && hasChanges ? (
                <>
                  {/* Draft + changes: Show name input */}
                  <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, marginBottom: spacing.md }]}>
                    Give your route a name so you can find it later.
                  </Text>

                  {/* Input */}
                  <View style={styles.inputContainer}>
                    <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
                      Route name
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
                </>
              ) : flowState === 'edited' ? (
                <>
                  {/* Saved + changes: Show confirmation message */}
                  <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, marginBottom: spacing.md }]}>
                    {currentName ? `Save changes to "${currentName}"?` : 'Save changes to this route?'}
                  </Text>
                </>
              ) : flowState === 'saved' && !hasChanges ? (
                <>
                  {/* Saved + no changes: Show current name (read-only) */}
                  <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, marginBottom: spacing.md }]}>
                    {currentName || 'Route saved'}
                  </Text>
                </>
              ) : (
                <>
                  {/* Draft + no changes: Show exit message (rare case) */}
                  <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, marginBottom: spacing.md }]}>
                    Exit without saving?
                  </Text>
                </>
              )}

              {/* CANONICAL: Different actions based on flow state and changes */}
              {flowState === 'draft' && hasChanges ? (
                <>
                  {/* Draft + changes: Save Route (primary) + Exit without saving (secondary) */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton, { backgroundColor: colors.tint }]}
                      onPress={handleSave}
                      activeOpacity={0.8}>
                      <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Save Route</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.exitButton}
                    onPress={onExitWithoutSaving}
                    activeOpacity={0.7}>
                    <Text style={[textStyles.bodyMedium, { color: colors.icon }]}>
                      Exit without saving
                    </Text>
                  </TouchableOpacity>
                </>
              ) : flowState === 'edited' ? (
                <>
                  {/* Saved + changes: Save Changes (primary) + Discard Changes (secondary) */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton, { backgroundColor: colors.tint }]}
                      onPress={handleSave}
                      activeOpacity={0.8}>
                      <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.exitButton}
                    onPress={onDiscardChanges || onExitWithoutSaving}
                    activeOpacity={0.7}>
                    <Text style={[textStyles.bodyMedium, { color: colors.icon }]}>
                      Discard Changes
                    </Text>
                  </TouchableOpacity>
                </>
              ) : flowState === 'saved' && !hasChanges ? (
                <>
                  {/* Saved + no changes: Just close (no need to save again, no need to ask for name) */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton, { backgroundColor: colors.tint }]}
                      onPress={onExitWithoutSaving}
                      activeOpacity={0.8}>
                      <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  {/* Draft + no changes: Just exit (rare case) */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.button, styles.saveButton, { backgroundColor: colors.tint }]}
                      onPress={onExitWithoutSaving}
                      activeOpacity={0.8}>
                      <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Exit</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Cancel: Close modal only */}
              <TouchableOpacity
                style={styles.cancelButtonOnly}
                onPress={handleCancel}
                activeOpacity={0.7}>
                <Text style={[textStyles.body, { color: colors.icon }]}>Cancel</Text>
              </TouchableOpacity>
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
    marginTop: spacing.md,
  },
  button: {
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButton: {
    // backgroundColor se aplica dinámicamente
  },
  exitButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonOnly: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

