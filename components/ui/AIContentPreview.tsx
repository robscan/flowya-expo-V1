/**
 * AIContentPreview - Preview de contenido generado por IA
 * CANONICAL: Componente para mostrar preview de contenido generado antes de aplicar
 * 
 * Características:
 * - Muestra contenido generado en formato legible
 * - Opciones: Aceptar, Rechazar, Editar
 * - Usa tokens del design system
 * - Integración con FormField
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassView } from '@/components/ui/GlassView';
import { Icon } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { GeneratedContent } from '@/utils/aiContentGenerator';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface AIContentPreviewProps {
  /** Contenido generado a mostrar */
  content: GeneratedContent;
  /** Callback cuando se acepta el contenido */
  onAccept: () => void;
  /** Callback cuando se aceptan campos específicos */
  onAcceptFields?: (fields: string[]) => void;
  /** Callback cuando se rechaza el contenido */
  onReject: () => void;
  /** Callback cuando se quiere editar antes de aceptar */
  onEdit?: () => void;
  /** Callback para regenerar campos específicos */
  onRegenerate?: (fields: string[]) => Promise<void>;
  /** Si está visible */
  visible: boolean;
  /** Título del preview (default: "Generated Content") */
  title?: string;
  /** Campos que están siendo regenerados */
  regeneratingFields?: string[];
}

/**
 * AIContentPreview - Preview de contenido generado por IA
 */
export function AIContentPreview({
  content,
  onAccept,
  onReject,
  visible,
  onEdit,
  title = 'Contenido generado',
}: AIContentPreviewProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const hasText = (value?: string) => typeof value === 'string' && value.trim().length > 0;

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <GlassView
        style={styles.container}
        intensity="strong"
        opacity="strong"
        shadowLevel="strong"
        enableGlow={true}>
        <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.md }]}>
          {title}
        </Text>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* SCOPE 2: Mostrar spotDescription si existe */}
          {hasText(content.spotDescription) && (
            <View style={styles.section}>
              <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
                Description
              </Text>
              <Text style={[textStyles.body, { color: colors.text }]}>
                {content.spotDescription}
              </Text>
            </View>
          )}

          {hasText(content.whyItMatters) && (
            <View style={styles.section}>
              <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
                Why it matters
              </Text>
              <Text style={[textStyles.body, { color: colors.text }]}>
                {content.whyItMatters}
              </Text>
            </View>
          )}

          {/* SCOPE 2: Mostrar planInfo si existe */}
          {hasText(content.planInfo) && (
            <View style={styles.section}>
              <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
                Plan Info
              </Text>
              <Text style={[textStyles.body, { color: colors.text }]}>
                {content.planInfo}
              </Text>
            </View>
          )}

          {hasText(content.culturalContext) && (
            <View style={styles.section}>
              <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
                Cultural context
              </Text>
              <Text style={[textStyles.body, { color: colors.text }]}>
                {content.culturalContext}
              </Text>
            </View>
          )}

          {content.howToVisit && (
            <View style={styles.section}>
              <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>
                How to visit
              </Text>
              {content.howToVisit.bestTime && (
                <View style={styles.tipCard}>
                  <Icon name={content.howToVisit.bestTime.icon as any} size={24} color={colors.tint} />
                  <Text style={[textStyles.body, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
                    {content.howToVisit.bestTime.text}
                  </Text>
                </View>
              )}
              {content.howToVisit.photography && (
                <View style={[styles.tipCard, { marginTop: spacing.sm }]}>
                  <Icon name={content.howToVisit.photography.icon as any} size={24} color={colors.tint} />
                  <Text style={[textStyles.body, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
                    {content.howToVisit.photography.text}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Narration NO es visible para el usuario - se guarda automáticamente para uso en Flow */}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton, { backgroundColor: colors.icon + '20' }]}
            onPress={onReject}
            activeOpacity={0.7}>
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Reject</Text>
          </TouchableOpacity>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton, { borderColor: colors.icon + '30' }]}
              onPress={onEdit}
              activeOpacity={0.7}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Editar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton, { backgroundColor: colors.tint }]}
            onPress={onAccept}
            activeOpacity={0.7}>
            <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Accept</Text>
          </TouchableOpacity>
        </View>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    zIndex: 1000,
  },
  container: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 16,
    padding: spacing.md,
  },
  content: {
    maxHeight: 400,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  narrationItem: {
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
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
  rejectButton: {},
  editButton: {
    borderWidth: 1,
  },
  acceptButton: {},
});
