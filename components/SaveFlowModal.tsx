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
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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
  const [confirmationStep, setConfirmationStep] = useState<'initial' | 'naming'>('initial');
  
  // Calcular maxHeight dinámicamente (60% del viewport)
  const maxHeight = Dimensions.get('window').height * 0.6;

  // CANONICAL: Initialize when modal opens
  // Reset confirmation step and initialize name
  useEffect(() => {
    if (visible) {
      // Reset al estado inicial
      setConfirmationStep('initial');
      
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

  // Handler para confirmación inicial: mover al paso de naming
  const handleConfirmSave = () => {
    // Solo para draft con changes: avanzar al paso de naming
    if (flowState === 'draft' && hasChanges) {
      setConfirmationStep('naming');
    } else {
      // Para otros casos (edited, saved): guardar directamente
      handleSave();
    }
  };

  // Handler para guardado final (desde paso naming)
  const handleSave = () => {
    const trimmedName = flowName.trim();
    if (trimmedName.length === 0) {
      // Si está vacío, usar nombre sugerido
      onSave(generateSuggestedName(flow, spots));
    } else {
      onSave(trimmedName);
    }
    setFlowName('');
    setConfirmationStep('initial');
  };

  const handleCancel = () => {
    setFlowName('');
    setConfirmationStep('initial');
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
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <GlassView
              style={[
                styles.modal,
                { maxHeight },
                confirmationStep === 'naming' && styles.modalWithKeyboard,
              ]}
              intensity="medium"
              opacity="strong"
              shadowLevel="medium"
              enableGlow={true}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[textStyles.heading3, { color: colors.text }]}>
                  {confirmationStep === 'naming'
                    ? 'Save route'
                    : flowState === 'edited'
                    ? 'Save changes?'
                    : isSaved
                    ? 'Close route'
                    : 'Save route'}
                </Text>
                <Pressable
                  onPress={handleCancel}
                  style={({ pressed }) => [
                    styles.closeButton,
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Icon name="close" size={20} color={colors.icon} />
                </Pressable>
              </View>

              {/* CONTENIDO: Estado A (initial) o Estado B (naming) */}
              {confirmationStep === 'initial' ? (
                <ScrollView
                  style={styles.scrollContent}
                  contentContainerStyle={styles.scrollContentContainer}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled">
                  {/* Mensaje según estado del flow */}
                  {flowState === 'draft' && hasChanges ? (
                    <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, marginBottom: spacing.md }]}>
                      Do you want to save this route before leaving?
                    </Text>
                  ) : flowState === 'edited' ? (
                    <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, marginBottom: spacing.md }]}>
                      {currentName ? `Save changes to "${currentName}"?` : 'Save changes to this route?'}
                    </Text>
                  ) : flowState === 'saved' && !hasChanges ? (
                    <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, marginBottom: spacing.md }]}>
                      {currentName || 'Route saved'}
                    </Text>
                  ) : (
                    <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, marginBottom: spacing.md }]}>
                      Exit without saving?
                    </Text>
                  )}

                  {/* Acciones Estado A: Confirmación inicial */}
                  {flowState === 'draft' && hasChanges ? (
                    <>
                      <View style={styles.actions}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.button, 
                            styles.saveButton, 
                            { 
                              backgroundColor: colors.tint,
                              opacity: pressed ? 0.8 : 1,
                            },
                          ]}
                          onPress={handleConfirmSave}>
                          <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Save</Text>
                        </Pressable>
                      </View>
                      <Pressable
                        style={({ pressed }) => [
                          styles.exitButton,
                          pressed && { opacity: 0.7 },
                        ]}
                        onPress={onExitWithoutSaving}>
                        <Text style={[textStyles.bodyMedium, { color: colors.icon }]}>
                          Don't save
                        </Text>
                      </Pressable>
                    </>
                  ) : flowState === 'edited' ? (
                    <>
                      <View style={styles.actions}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.button, 
                            styles.saveButton, 
                            { 
                              backgroundColor: colors.tint,
                              opacity: pressed ? 0.8 : 1,
                            },
                          ]}
                          onPress={handleSave}>
                          <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Save Changes</Text>
                        </Pressable>
                      </View>
                      <Pressable
                        style={({ pressed }) => [
                          styles.exitButton,
                          pressed && { opacity: 0.7 },
                        ]}
                        onPress={onDiscardChanges || onExitWithoutSaving}>
                        <Text style={[textStyles.bodyMedium, { color: colors.icon }]}>
                          Discard Changes
                        </Text>
                      </Pressable>
                    </>
                  ) : flowState === 'saved' && !hasChanges ? (
                    <View style={styles.actions}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.button, 
                          styles.saveButton, 
                          { 
                            backgroundColor: colors.tint,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                        onPress={onExitWithoutSaving}>
                        <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Close</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.actions}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.button, 
                          styles.saveButton, 
                          { 
                            backgroundColor: colors.tint,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                        onPress={onExitWithoutSaving}>
                        <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Exit</Text>
                      </Pressable>
                    </View>
                  )}
                </ScrollView>
              ) : (
                /* Estado B: Naming step (solo para draft con changes) */
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                  style={styles.namingContainer}
                  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
                  <ScrollView
                    style={styles.scrollContent}
                    contentContainerStyle={styles.scrollContentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">
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

                    {/* Botón Save final */}
                    <View style={styles.actions}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.button, 
                          styles.saveButton, 
                          { 
                            backgroundColor: colors.tint,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                        onPress={handleSave}>
                        <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Save Route</Text>
                      </Pressable>
                    </View>
                  </ScrollView>
                </KeyboardAvoidingView>
              )}
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
  modalWithKeyboard: {
    // Estilos adicionales cuando el teclado está visible
  },
  scrollContent: {
    flexGrow: 0,
  },
  scrollContentContainer: {
    flexGrow: 0,
  },
  namingContainer: {
    flex: 1,
    maxHeight: '100%',
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

