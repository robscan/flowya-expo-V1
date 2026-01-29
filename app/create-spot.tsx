/**
 * Create Spot Screen
 * Full screen page for creating new spots
 * Refactored to use canonical form components and useSpotForm hook
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { useSpotForm } from '@/hooks/useSpotForm';
import { createSpotAsAdmin } from '@/utils/adminModerationService';
import { createSpotContribution, fetchUserContributions } from '@/utils/spotContributionsService';
import { createSpotMediaPublic } from '@/utils/spotMediaService';
import { isAdminUser } from '@/utils/permissions';
import { getTrustPermissions, getTrustTier, getTrustTierLabel, TrustPermissions, TrustTier } from '@/utils/trustScore';
import { isPublicStorageUrl, uploadImageToStorage } from '@/utils/storageUpload';

export default function CreateSpotScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const isAdmin = isAdminUser(user);
  
  // Ubicación base estable
  const { baseLocation } = useBaseLocation();
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successCopy, setSuccessCopy] = useState({
    title: 'Thanks for sharing',
    body: 'Your spot is being reviewed and will be available soon.',
  });
  const [trustTier, setTrustTier] = useState<TrustTier>('nuevo');
  const [trustPermissions, setTrustPermissions] = useState<TrustPermissions | null>(null);
  const [isTrustEnforced, setIsTrustEnforced] = useState(false);
  const [isLoadingTrust, setIsLoadingTrust] = useState(false);
  // FASE 4: showAdvancedFields eliminado - campos avanzados eliminados
  // FASE 2: showAIPreview eliminado - IA desactivada en creación

  // Hook de gestión de estado del formulario
  const form = useSpotForm({
    onSave: async (spotData) => {
      if (!user?.id) {
        Alert.alert('Iniciar sesión requerido', 'Debes iniciar sesión para contribuir spots.');
        return;
      }
      if (isTrustEnforced && trustPermissions && !trustPermissions.canCreateSpots && !isAdmin) {
        Alert.alert(
          'Nivel de confianza insuficiente',
          'Aun no tienes permiso para crear nuevos spots. Tus contribuciones aprobadas habilitan este permiso.'
        );
        return;
      }
      let imageUrl = spotData.image?.url || '';
      if (imageUrl && !isPublicStorageUrl(imageUrl)) {
        const uploadResult = await uploadImageToStorage({
          uri: imageUrl,
          pathPrefix: `spots/${user.id}`,
        });
        if (uploadResult.error || !uploadResult.publicUrl) {
          Alert.alert('Error', uploadResult.error || 'No se pudo subir la imagen.');
          return;
        }
        imageUrl = uploadResult.publicUrl;
      }

      const payload = {
        name: spotData.name,
        type: spotData.type,
        location: spotData.location,
        short_description: spotData.shortDescription,
        description: spotData.description,
        image: imageUrl ? { ...spotData.image, url: imageUrl } : spotData.image,
        has_generated_content: spotData.hasGeneratedContent,
      };
      if (isAdmin) {
        const createResult = await createSpotAsAdmin({
          payload: {
            name: spotData.name,
            type: spotData.type,
            location: spotData.location,
            shortDescription: spotData.shortDescription,
            description: spotData.description,
            hasGeneratedContent: spotData.hasGeneratedContent,
          },
          userId: user.id,
        });
        if (createResult.error || !createResult.data?.id) {
          Alert.alert('Error', createResult.error || 'No se pudo crear el spot.');
          return;
        }
        if (imageUrl) {
          await createSpotMediaPublic({
            spotId: createResult.data.id,
            url: imageUrl,
            source: spotData.image?.source,
            license: spotData.image?.license,
            createdBy: user.id,
          });
        }
        setSuccessCopy({
          title: 'Spot publicado',
          body: 'El spot ya está visible en el mapa.',
        });
        setShowSuccessMessage(true);
        setTimeout(() => {
          router.replace(`/spot-detail?id=${createResult.data?.id}`);
        }, 1500);
        return;
      }

      const result = await createSpotContribution(null, payload, user.id);
      if (result.error) {
        Alert.alert('Error', 'No se pudo enviar la contribución. Intenta de nuevo.');
        return;
      }
      if (imageUrl && result.data?.spot_id) {
        await createSpotMediaPublic({
          spotId: result.data.spot_id,
          url: imageUrl,
          source: spotData.image?.source,
          license: spotData.image?.license,
          createdBy: user.id,
        });
      }
      setSuccessCopy({
        title: 'Thanks for sharing',
        body: 'Your spot is being reviewed and will be available soon.',
      });
      setShowSuccessMessage(true);
      setTimeout(() => {
        router.replace('/(tabs)/home');
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

    if (isTrustEnforced && trustPermissions && !trustPermissions.canCreateSpots && !isAdmin) {
      Alert.alert(
        'Nivel de confianza insuficiente',
        'Aun no tienes permiso para crear nuevos spots. Tus contribuciones aprobadas habilitan este permiso.'
      );
      return;
    }

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

  useEffect(() => {
    const loadTrust = async () => {
      if (!isAuthenticated || !user?.id) {
        setTrustTier('invitado');
        setTrustPermissions(getTrustPermissions('invitado', false));
        setIsTrustEnforced(false);
        return;
      }
      setIsLoadingTrust(true);
      const result = await fetchUserContributions(user.id);
      if (result.error) {
        setTrustTier(getTrustTier([], true));
        setTrustPermissions(getTrustPermissions(getTrustTier([], true), true));
        setIsTrustEnforced(false);
        setIsLoadingTrust(false);
        return;
      }
      const tier = getTrustTier(result.data, true);
      setTrustTier(tier);
      setTrustPermissions(getTrustPermissions(tier, true));
      setIsTrustEnforced(true);
      setIsLoadingTrust(false);
    };

    loadTrust();
  }, [isAuthenticated, user?.id]);

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
              Crea una cuenta para agregar spots en FLOWYA
            </Text>
            <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, textAlign: 'center', marginBottom: spacing.lg }]}>
              Regístrate para contribuir spots y compartir tus lugares favoritos con la comunidad.
            </Text>
            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/(tabs)/signup')}
              activeOpacity={0.7}>
              <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Crear cuenta</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: colors.icon + '20', marginTop: spacing.sm }]}
              onPress={() => router.push('/(tabs)/login')}
              activeOpacity={0.7}>
              <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Iniciar sesión</Text>
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
              {successCopy.title}
            </Text>
            <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, textAlign: 'center' }]}>
              {successCopy.body}
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

      {(isLoadingTrust || isTrustEnforced) && trustPermissions && (
        <View style={[styles.trustBanner, { borderColor: colors.icon + '20', backgroundColor: colors.icon + '08' }]}>
          <Text style={[textStyles.bodyMedium, { color: colors.text }]}>
            Nivel de confianza: {getTrustTierLabel(trustTier)}
          </Text>
          <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2 }]}>
            {isLoadingTrust ? 'Cargando nivel de confianza...' : 'Se calcula internamente segun tus aportes aplicados.'}
          </Text>
          {!isLoadingTrust && isTrustEnforced && !trustPermissions.canCreateSpots && !isAdmin && (
            <Text style={[textStyles.caption, { color: colors.error || '#FF3B30', marginTop: spacing.xs / 2 }]}>
              Aun no puedes crear spots nuevos. Completa aportes aplicados para habilitar este permiso.
            </Text>
          )}
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section 1: Location (Required) */}
        <View style={styles.section}>
          <FormField label="Ubicación" required error={form.errors.location}>
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
          <FormField label="Nombre">
            <FormTextInput
              value={form.name}
              onChangeText={form.setName}
              placeholder="Ej. Plaza principal, Mirador al atardecer..."
            />
          </FormField>

          {/* FASE 5: Photo field (imagen única) */}
          <FormField label="Imagen" required error={form.errors.photo}>
            <FormImagePicker
              initialUri={form.image?.url || null}
              onPickImage={form.pickImage}
              onImageRemoved={() => form.removeImage()}
              height={200}
            />
          </FormField>

          {/* FASE 4: Short Description field */}
          <FormField label="Descripción corta">
            <FormTextArea
              value={form.shortDescription}
              onChangeText={form.setShortDescription}
              placeholder="Una descripción breve y evocadora (1-2 líneas). Ej. Un mirador con vista panorámica."
              numberOfLines={2}
            />
          </FormField>

          <FormField label="Tipo">
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
          <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancelar</Text>
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
            Enviar
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* IA deshabilitada en creación: sin preview ni errores */}
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
  trustBanner: {
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
  sendButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
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
