/**
 * Create Spot Screen
 * Full screen page for creating new spots
 * Refactored to use canonical form components and useSpotForm hook
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AIContentPreview } from '@/components/ui/AIContentPreview';
import { FormField } from '@/components/ui/FormField';
import { FormImagePicker } from '@/components/ui/FormImagePicker';
import { LocationSelectorWeb } from '@/components/ui/LocationSelectorWeb';
import { FormTextArea } from '@/components/ui/FormTextArea';
import { FormTextInput } from '@/components/ui/FormTextInput';
import { FormTypeSelector } from '@/components/ui/FormTypeSelector';
import { GlassView } from '@/components/ui/GlassView';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import { useSpot } from '@/contexts/SpotContext';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSpotForm } from '@/hooks/useSpotForm';
import { isAIConfigured } from '@/utils/aiConfig';

export default function CreateSpotScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { createSpot } = useSpot();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Ubicación base estable
  const { baseLocation } = useBaseLocation();
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [showAIPreview, setShowAIPreview] = useState(false);

  // Hook de gestión de estado del formulario
  const form = useSpotForm({
    onSave: (spotData) => {
      // P0-03: Si hay spot existente, NO crear nuevo spot (esta verificación se hace en handleSave antes de llamar onSave)
      // Si llegamos aquí, es porque NO hay spot existente
      const newSpot = createSpot(spotData);
      setShowSuccessMessage(true);
      // Redirigir a SpotDetail después de crear (no al mapa)
      setTimeout(() => {
        router.replace(`/spot-detail?id=${newSpot.id}`);
      }, 1500);
    },
    onCancel: () => {
      router.back();
    },
  });

  // CANONICAL: Handler para guardar que verifica duplicados ANTES de crear
  const handleSave = () => {
    // Detección de duplicados: NO crear nuevo spot si ya existe
    if (form.existingSpot) {
      // Si hay spot existente, NO crear nuevo spot, redirigir al existente
      router.replace(`/spot-detail?id=${form.existingSpot.id}`);
      return;
    }
    
    // Si NO hay spot existente, proceder con guardado normal (llama a form.handleSave que ejecuta onSave)
    form.handleSave();
  };

  // Initialize location from query params or base location
  useEffect(() => {
    // Initialize current location from params or base location
    if (params.lat && params.lng) {
      form.setLocation({
        latitude: parseFloat(params.lat),
        longitude: parseFloat(params.lng),
      });
    } else if (baseLocation) {
      form.setLocation(baseLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.lat, params.lng, baseLocation]);

  // Handle generate AI content
  const handleGenerateAI = async () => {
    // Validar que haya ubicación antes de generar (requerido por AI)
    if (!form.location) {
      // Podríamos mostrar un mensaje aquí, pero el botón no debería estar visible sin ubicación
      // Esta validación es defensiva
      return;
    }
    const generatedContent = await form.generateContent();
    if (generatedContent) {
      setShowAIPreview(true);
    }
  };

  // Handle accept AI content
  const handleAcceptAIContent = () => {
    if (form.previewContent) {
      // SCOPE 2: Aceptar todos los campos generados por IA
      if (form.previewContent.spotDescription && !form.spotDescription) {
        form.setSpotDescription(form.previewContent.spotDescription);
        form.setDescription(form.previewContent.spotDescription);
        form.setWhyItMatters(form.previewContent.whyItMatters || form.previewContent.spotDescription);
      }
      if (form.previewContent.whyItMatters && !form.whyItMatters) {
        form.setWhyItMatters(form.previewContent.whyItMatters);
        form.setDescription(form.previewContent.whyItMatters);
      }
      if (form.previewContent.planInfo && !form.planInfo) {
        form.setPlanInfo(form.previewContent.planInfo);
      }
      if (form.previewContent.culturalContext && !form.culturalContext) {
        form.setCulturalContext(form.previewContent.culturalContext);
      }
      if (form.previewContent.howToVisit && !form.howToVisit) {
        form.setHowToVisit(form.previewContent.howToVisit);
      }
      // Narration se guarda automáticamente cuando se genera (no visible en UI)
      // Ya se guardó en generateContent, no necesita acción adicional aquí
    }
    setShowAIPreview(false);
    form.setPreviewContent(null);
  };

  // Handle reject AI content
  const handleRejectAIContent = () => {
    setShowAIPreview(false);
    form.setPreviewContent(null);
  };

  // Verificar autenticación - mostrar CTA si no está autenticado
  if (!authLoading && !isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={iconTouchableContainer.base}
            activeOpacity={0.7}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[textStyles.heading3, { color: colors.text }]}>Create Spot</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.overlay}>
          <GlassView 
            style={styles.authModal} 
            intensity="strong" 
            opacity="strong"
            shadowLevel="strong"
            enableGlow={true}
            useGrayBackground={true}
          >
            <Icon name="profile" size={48} color={colors.tint} />
            <Text style={[textStyles.heading4, { color: colors.text, marginTop: spacing.md, textAlign: 'center' }]}>
              Create an account to add spots to FLOWYA
            </Text>
            <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, textAlign: 'center', marginBottom: spacing.lg }]}>
              Sign up to contribute spots and share your favorite places with the community.
            </Text>
            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/(tabs)/signup')}
              activeOpacity={0.7}>
              <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: colors.icon + '20', marginTop: spacing.sm }]}
              onPress={() => router.push('/(tabs)/login')}
              activeOpacity={0.7}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Sign In</Text>
            </TouchableOpacity>
          </GlassView>
        </View>
      </View>
    );
  }

  // Mostrar loading mientras verifica autenticación
  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.md }]}>
            Loading...
          </Text>
        </View>
      </View>
    );
  }

  // Show success message overlay
  if (showSuccessMessage) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.overlay}>
          <GlassView 
            style={styles.successModal} 
            intensity="strong" 
            opacity="strong"
            shadowLevel="strong"
            enableGlow={true}
            useGrayBackground={true}
          >
            <Icon name="like" size={48} color={colors.tint} />
            <Text style={[textStyles.heading4, { color: colors.text, marginTop: spacing.md, textAlign: 'center' }]}>
              Thanks for sharing
            </Text>
            <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, textAlign: 'center' }]}>
              Your spot is being reviewed and will be available soon.
            </Text>
          </GlassView>
        </View>
      </View>
    );
  }

  if (!form.location && !baseLocation) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={form.handleCancel}
            style={iconTouchableContainer.base}
            activeOpacity={0.7}>
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[textStyles.heading3, { color: colors.text }]}>Mark place</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.md }]}>
            Loading location...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={form.handleCancel}
          style={iconTouchableContainer.base}
          activeOpacity={0.7}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[textStyles.heading3, { color: colors.text }]}>Create Spot</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* CANONICAL: Badge/indicador visual cuando se detecta spot existente */}
      {form.existingSpot && (
        <View style={[styles.existingSpotBadge, { backgroundColor: colors.tint + '15', borderColor: colors.tint + '40' }]}>
          <Icon name="info" size={16} color={colors.tint} />
          <Text style={[textStyles.caption, { color: colors.tint, marginLeft: spacing.xs }]}>
            Este lugar ya existe en FLOWYA
          </Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section 1: Location (Required) */}
        <View style={styles.section}>
          <FormField label="Location" required error={form.errors.location}>
            <LocationSelectorWeb
              location={form.location}
              onLocationChange={(loc) => {
                form.setLocation(loc);
              }}
              onCommercialNameChange={(commercialName) => {
                // CANONICAL: Solo poblar Name si existe nombre comercial (NO direcciones)
                if (commercialName && commercialName.trim().length > 0) {
                  form.setName(commercialName);
                } else {
                  // Si no hay nombre comercial, NO modificar el campo Name
                  // El usuario puede escribir el nombre manualmente
                }
              }}
              userLocation={baseLocation}
              mapHeight={300}
            />
          </FormField>
        </View>

        {/* Section 2: Basic Info */}
        <View style={styles.section}>
          <FormField label="Name">
            <FormTextInput
              value={form.name}
              onChangeText={form.setName}
              placeholder="e.g. Main Square, Sunset Viewpoint..."
            />
          </FormField>

          <FormField label="Photo" required error={form.errors.photo}>
            <FormImagePicker
              initialUri={form.photos.length > 0 ? form.photos[0] : null}
              onPickImage={form.addImage}
              onImageRemoved={() => form.removeImage(0)}
              height={200}
            />
          </FormField>

          {/* SCOPE 7: Botón "Enrich with AI" justo arriba del campo Description */}
          {!form.existingSpot && (
            isAIConfigured() ? (
              <TouchableOpacity
                style={[
                  styles.aiButtonInline, 
                  { 
                    backgroundColor: colors.tint + '15', 
                    borderColor: colors.tint + '40',
                    opacity: form.location ? 1 : 0.5,
                    marginBottom: spacing.sm,
                  }
                ]}
                onPress={handleGenerateAI}
                disabled={form.aiState === 'loading' || !form.location}
                activeOpacity={0.7}>
                {form.aiState === 'loading' ? (
                  <ActivityIndicator size="small" color={colors.tint} />
                ) : (
                  <>
                    <Icon name="star" size={16} color={colors.tint} />
                    <Text style={[textStyles.bodyMedium, { color: colors.tint, marginLeft: spacing.xs }]}>
                      Enrich with AI
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              // SCOPE 0.4: Fail-safe - mostrar que IA no está configurada
              <View style={[styles.aiButtonInline, { backgroundColor: colors.icon + '10', borderColor: colors.icon + '30', opacity: 0.6, marginBottom: spacing.sm }]}>
                <Icon name="info" size={16} color={colors.icon} />
                <Text style={[textStyles.bodyMedium, { color: colors.icon, marginLeft: spacing.xs }]}>
                  IA no configurada
                </Text>
              </View>
            )
          )}

          <FormField label="Description">
            <FormTextArea
              value={form.description}
              onChangeText={form.setDescription}
              placeholder="Brief description. e.g. A viewpoint with panoramic city views..."
              numberOfLines={3}
            />
          </FormField>

          <FormField label="Type">
            <FormTypeSelector
              selectedType={form.type}
              onSelectType={form.setType}
            />
          </FormField>
        </View>

        {/* Progressive Disclosure: Advanced Fields */}
        {!showAdvancedFields && (
          <TouchableOpacity
            style={styles.showAdvancedButton}
            onPress={() => setShowAdvancedFields(true)}
            activeOpacity={0.7}>
            <Text style={[textStyles.bodyMedium, { color: colors.tint }]}>
              Show advanced fields
            </Text>
            <Icon name="chevron-down" size={20} color={colors.tint} />
          </TouchableOpacity>
        )}

        {showAdvancedFields && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.hideAdvancedButton}
              onPress={() => setShowAdvancedFields(false)}
              activeOpacity={0.7}>
              <Text style={[textStyles.bodyMedium, { color: colors.icon }]}>
                Hide advanced fields
              </Text>
              <Icon name="minus" size={20} color={colors.icon} />
            </TouchableOpacity>

            <FormField label="Why it matters">
              <FormTextArea
                value={form.whyItMatters}
                onChangeText={form.setWhyItMatters}
                placeholder="What makes this place special?"
                numberOfLines={4}
              />
            </FormField>

            <FormField label="Cultural context">
              <FormTextArea
                value={form.culturalContext}
                onChangeText={form.setCulturalContext}
                placeholder="Cultural and historical context..."
                numberOfLines={4}
              />
            </FormField>
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.icon + '20' }]}
          onPress={form.handleCancel}
          activeOpacity={0.7}>
          <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: form.isValid ? colors.tint : colors.icon + '40' },
          ]}
          onPress={handleSave}
          disabled={!form.isValid}
          activeOpacity={0.7}>
          <Text style={[textStyles.bodyMedium, { color: form.isValid ? colors.background : colors.icon }]}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* AI Error message */}
      {form.aiError && (
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Text style={[textStyles.caption, { color: '#FF6B6B' }]}>{form.aiError}</Text>
        </View>
      )}

      {/* AI Content Preview */}
      {form.previewContent && (
        <AIContentPreview
          content={form.previewContent}
          visible={showAIPreview}
          onAccept={handleAcceptAIContent}
          onReject={handleRejectAIContent}
          onEdit={() => {
            handleAcceptAIContent();
            setShowAdvancedFields(true);
          }}
          title="Generated Content"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  existingSpotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  showAdvancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  hideAdvancedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: spacing.sm,
    minWidth: 140,
  },
  // SCOPE 7.3: Estilo discreto para botón sobre campo Description
  aiButtonInline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 40,
  },
  sendButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successModal: {
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authModal: {
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: 400,
  },
  authButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
