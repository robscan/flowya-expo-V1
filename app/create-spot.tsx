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
import { FormTextArea } from '@/components/ui/FormTextArea';
import { FormTextInput } from '@/components/ui/FormTextInput';
import { FormTypeSelector } from '@/components/ui/FormTypeSelector';
import { GlassView } from '@/components/ui/GlassView';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { LocationSelectorWeb } from '@/components/ui/LocationSelectorWeb';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import { useSpot } from '@/contexts/SpotContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBaseLocation } from '@/hooks/useBaseLocation';
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
  // FASE 4: showAdvancedFields eliminado - campos avanzados eliminados
  // FASE 2: showAIPreview eliminado - IA desactivada en creación

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

  // FASE 4-5: Initialize location from query params or base location (formato nuevo)
  useEffect(() => {
    // Initialize current location from params or base location
    if (params.lat && params.lng) {
      // FASE 4: Usar formato nuevo (lat/lng)
      form.setLocation({
        lat: parseFloat(params.lat),
        lng: parseFloat(params.lng),
      });
    } else if (baseLocation) {
      // FASE 4: Convertir baseLocation a formato nuevo
      form.setLocation({
        lat: baseLocation.latitude,
        lng: baseLocation.longitude,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.lat, params.lng, baseLocation]);

  // FASE 2: Generación de IA desactivada en creación de Spot
  // La IA solo se usa bajo demanda en Spot Detail (lazy generation)
  // NO se ejecuta durante la creación de un Spot
  // 
  // handleGenerateAI - COMENTADO: Generación IA eliminada de creación
  // const handleGenerateAI = async () => {
  //   // FASE 2: NO generar contenido IA durante creación
  //   // La generación de IA se hace solo bajo demanda en Spot Detail
  // };

  // FASE 2: Handlers de IA desactivados en creación de Spot
  // La IA solo se usa bajo demanda en Spot Detail (lazy generation)
  // 
  // handleAcceptAIContent - COMENTADO: Preview de IA eliminado de creación
  // const handleAcceptAIContent = () => { ... };
  // 
  // handleRejectAIContent - COMENTADO: Preview de IA eliminado de creación
  // const handleRejectAIContent = () => { ... };

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
                // FASE 4-5: LocationSelectorWeb puede devolver ambos formatos, normalizar a lat/lng
                if ('lat' in loc) {
                  form.setLocation(loc);
                } else {
                  // Convertir de latitude/longitude a lat/lng
                  form.setLocation({ lat: loc.latitude, lng: loc.longitude });
                }
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

          {/* FASE 5: Photo field (imagen única) */}
          <FormField label="Image" required error={form.errors.photo}>
            <FormImagePicker
              initialUri={form.image?.url || null}
              onPickImage={form.pickImage}
              onImageRemoved={() => form.removeImage()}
              height={200}
            />
          </FormField>

          {/* FASE 2: Botón "Enrich with AI" DESACTIVADO
           * La generación de IA NO se ejecuta durante la creación de un Spot.
           * La IA solo se usa bajo demanda cuando el usuario abre el detalle de un Spot sin contenido.
           * 
           * TODO: Eliminar completamente en Fase 4 cuando se refactorice UI
           */}
          {false && !form.existingSpot && isAIConfigured() && (
            <TouchableOpacity
              style={[
                styles.aiButtonInline, 
                { 
                  backgroundColor: colors.icon + '10', 
                  borderColor: colors.icon + '30',
                  opacity: 0.5,
                  marginBottom: spacing.sm,
                }
              ]}
              disabled={true}
              activeOpacity={0.7}>
              <Icon name="info" size={16} color={colors.icon} />
              <Text style={[textStyles.bodyMedium, { color: colors.icon, marginLeft: spacing.xs }]}>
                AI disabled in creation
              </Text>
            </TouchableOpacity>
          )}

          {/* FASE 4: Short Description field */}
          <FormField label="Short Description">
            <FormTextArea
              value={form.shortDescription}
              onChangeText={form.setShortDescription}
              placeholder="A brief, evocative description (1-2 lines). e.g. A viewpoint with panoramic city views..."
              numberOfLines={2}
            />
          </FormField>

          <FormField label="Type">
            <FormTypeSelector
              selectedType={form.type}
              onSelectType={form.setType}
            />
          </FormField>
        </View>

        {/* FASE 4: Advanced Fields ELIMINADOS - campos avanzados eliminados (whyItMatters, culturalContext, planInfo, hours, cost, restrictions, accessibility, howToVisit) */}
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

      {/* FASE 2: AI Content Preview DESACTIVADO
       * La generación de IA NO se ejecuta durante la creación de un Spot.
       * El preview de IA solo se usa en Spot Detail (lazy generation).
       * 
       * TODO: Eliminar completamente en Fase 4 cuando se refactorice UI
       */}
      {false && form.previewContent && (
        <AIContentPreview
          content={form.previewContent || { shortDescription: '' }}
          visible={false}
          onAccept={() => {}}
          onReject={() => {}}
          onEdit={() => {}}
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
