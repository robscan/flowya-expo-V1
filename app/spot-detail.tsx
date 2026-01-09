/**
 * Spot Detail Screen
 * Full screen page for displaying detailed spot information
 * Based on V5 definition: SPOT DETAIL section
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
  ActivityIndicator,
  Animated,
} from 'react-native';

import { FlowyaMapView, FlowyaMapViewRef } from '@/components/MapView';
import { MapControls } from '@/components/ui/MapControls';
import { AIContentPreview } from '@/components/ui/AIContentPreview';
import { AIGenerateButton } from '@/components/ui/AIGenerateButton';
import { ContentHeader, ContentHeaderAction } from '@/components/ui/ContentHeader';
import { FormField } from '@/components/ui/FormField';
import { FormIconSelector } from '@/components/ui/FormIconSelector';
import { FormLocationSelector } from '@/components/ui/FormLocationSelector';
import { FormTextArea } from '@/components/ui/FormTextArea';
import { FormTextInput } from '@/components/ui/FormTextInput';
import { FormTypeSelector } from '@/components/ui/FormTypeSelector';
import { GlassView } from '@/components/ui/GlassView';
import { InfoMeta } from '@/components/ui/InfoMeta';
import { Icon } from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Tooltip';
import { Toast } from '@/components/ui/Toast';
import { borderRadius, borderTokens } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamilyMedium, fontSize, lineHeight, textStyles } from '@/constants/typography';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { usePath } from '@/contexts/PathContext';
import { useFlow } from '@/contexts/FlowContext';
import { useAuth } from '@/contexts/AuthContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { Spot, SpotType, SpotHours, SpotCost } from '@/data/spots';
import { IconName } from '@/components/ui/Icon';
import { generateSpotContent } from '@/utils/aiContentGenerator';
import { isAIConfigured } from '@/utils/aiConfig';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSpotDistance } from '@/hooks/useSpotDistance';
import { useSpotForm } from '@/hooks/useSpotForm';
import { hasValidImage, getValidImage } from '@/utils/imageHelpers';
import { getSpotTypeLabel, formatHours, formatCost } from '@/utils/spotFormHelpers';
import { canDeleteSpot } from '@/utils/permissions';
import { openNavigationApp, mapMovementModeToNavigationMode } from '@/utils/navigationHelpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4; // 40% of screen height

// Helpers moved to utils/spotFormHelpers.ts - using shared utilities

export default function SpotDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getSpotById, updateSpot, deleteSpot, markSpotAsSeen, markSpotAsAvailable, getSpotLoadState } = useSpot();
  const { isSpotSaved, toggleSaveSpot } = useSaved();
  const { createPath } = usePath();
  const { startFlow } = useFlow();
  const { user, isAuthenticated } = useAuth();
  const { setIsTabBarVisible } = useOverlay();
  
  // Ubicación base estable
  const { baseLocation } = useBaseLocation();
  const mapViewRef = useRef<FlowyaMapViewRef>(null);
  const mapViewFullscreenRef = useRef<FlowyaMapViewRef>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Animaciones para feedback visual
  const [saveButtonScale] = useState(() => new Animated.Value(1));
  const [likeButtonScale] = useState(() => new Animated.Value(1));
  
  // Estados para selector de iconos
  const [showIconSelector, setShowIconSelector] = useState<{ field: '1' | '2' | 'restrictions' | 'accessibility' } | null>(null);
  const [editPlanInfoIconRestrictions, setEditPlanInfoIconRestrictions] = useState<IconName>('paw');
  const [editPlanInfoIconAccessibility, setEditPlanInfoIconAccessibility] = useState<IconName>('accessibility');

  // Get spot from context
  const spot = id ? getSpotById(id) : null;

  // Marcar Spot como 'seen' al montar (automáticamente)
  useEffect(() => {
    if (!id) return;
    
    markSpotAsSeen(id);
    
    // Si el Spot tiene imagen principal, marcar como 'available' después de un breve delay
    // (esto permite que OptimizedImage inicie la carga si es necesario)
    // El cache de imágenes se maneja independientemente, esto solo marca el Spot como disponible
    if (spot && hasValidImage(spot.photos)) {
      // Usar un pequeño delay para permitir que OptimizedImage verifique su cache
      const timer = setTimeout(() => {
        markSpotAsAvailable(id);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      // Si no tiene imagen, marcar como disponible inmediatamente
      markSpotAsAvailable(id);
    }
  }, [id, spot?.photos?.[0], markSpotAsSeen, markSpotAsAvailable]);

  // CANONICAL: Ocultar/mostrar TabBar según estado de fullscreen
  useEffect(() => {
    setIsTabBarVisible(!isFullscreen);
  }, [isFullscreen, setIsTabBarVisible]);

  // CANONICAL: Forzar resize del mapa cuando cambia fullscreen
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentMapRef = isFullscreen ? mapViewFullscreenRef.current : mapViewRef.current;
      if (currentMapRef) {
        currentMapRef.resize();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // CANONICAL: Centrar mapa en spot al montar (siempre, no en userLocation)
  useEffect(() => {
    if (!spot || isEditMode) return;
    
    // Pequeño delay para asegurar que el mapa esté listo
    const timer = setTimeout(() => {
      if (mapViewRef.current) {
        mapViewRef.current.centerOnSpot(spot.id);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [spot?.id, isEditMode]);

  // CANONICAL: Centrar mapa en fullscreen cuando se activa
  useEffect(() => {
    if (!spot || isEditMode || !isFullscreen) return;
    
    // Pequeño delay para asegurar que el mapa fullscreen esté listo
    const timer = setTimeout(() => {
      if (mapViewFullscreenRef.current) {
        mapViewFullscreenRef.current.centerOnSpot(spot.id);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [isFullscreen, spot?.id, isEditMode]);

  // Hook de gestión de estado del formulario (solo en modo edición)
  const form = useSpotForm({
    initialSpot: spot || null,
    isEditMode,
    onSave: (spotData) => {
      if (!spot) return;
      const updates: Partial<Spot> = {
        name: spotData.name,
        description: spotData.description,
        whyItMatters: spotData.whyItMatters,
        culturalContext: spotData.culturalContext,
        type: spotData.type,
        hours: spotData.hours,
        cost: spotData.cost,
        restrictions: spotData.restrictions,
        accessibility: spotData.accessibility,
        howToVisit: spotData.howToVisit,
      };
      if (spotData.photos && spotData.photos.length > 0 && spotData.photos[0] !== spot.photos?.[0]) {
        updates.photos = spotData.photos;
      }
      if (spotData.location && (spotData.location.latitude !== spot.location.latitude || spotData.location.longitude !== spot.location.longitude)) {
        updates.location = spotData.location;
      }
      updateSpot(spot.id, updates);
      setIsEditMode(false);
      Alert.alert('Place updated', 'Changes saved');
    },
    onCancel: () => {
      setIsEditMode(false);
    },
  });


  // Helpers para trabajar con howToVisit desde form.howToVisit
  const getHowToVisitBestTime = () => form.howToVisit?.bestTime?.text || '';
  const getHowToVisitBestTimeIcon = () => (form.howToVisit?.bestTime?.icon as IconName) || 'sun';
  const getHowToVisitPhotography = () => form.howToVisit?.photography?.text || '';
  const getHowToVisitPhotographyIcon = () => (form.howToVisit?.photography?.icon as IconName) || 'camera';

  const setHowToVisitBestTime = (text: string, icon?: IconName) => {
    form.setHowToVisit({
      ...form.howToVisit,
      bestTime: text ? { icon: icon || getHowToVisitBestTimeIcon(), text } : undefined,
      photography: form.howToVisit?.photography,
    });
  };

  const setHowToVisitPhotography = (text: string, icon?: IconName) => {
    form.setHowToVisit({
      ...form.howToVisit,
      bestTime: form.howToVisit?.bestTime,
      photography: text ? { icon: icon || getHowToVisitPhotographyIcon(), text } : undefined,
    });
  };

  const setHowToVisitBestTimeIcon = (icon: IconName) => {
    const currentText = getHowToVisitBestTime();
    if (currentText) {
      setHowToVisitBestTime(currentText, icon);
    }
  };

  const setHowToVisitPhotographyIcon = (icon: IconName) => {
    const currentText = getHowToVisitPhotography();
    if (currentText) {
      setHowToVisitPhotography(currentText, icon);
    }
  };

  // Calcular distancia usando hook canónico - DEBE estar antes del return temprano
  const distance = useSpotDistance(id || null, baseLocation);

  if (!spot) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.errorContainer}>
          <Text style={[textStyles.body, { color: colors.text }]}>Spot not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[textStyles.bodyMedium, { color: colors.tint }]}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isSaved = isSpotSaved(spot.id);
  const hoursText = formatHours(isEditMode ? form.hours : spot.hours);
  const costText = formatCost(isEditMode ? form.cost : spot.cost);

  const handleBack = () => {
    // Si está en fullscreen, salir primero del fullscreen
    if (isFullscreen) {
      setIsFullscreen(false);
      return;
    }
    if (isEditMode) {
      handleCancelEdit();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/home');
    }
  };

  const handleSave = () => {
    // Animación de feedback visual
    Animated.sequence([
      Animated.timing(saveButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(saveButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    const wasSaved = isSaved;
    toggleSaveSpot(spot.id);
    
    // Show toast
    setToastMessage(wasSaved ? 'Lugar removido de guardados' : 'Lugar guardado');
    setShowToast(true);
  };

  const handleShare = async () => {
    try {
      const shareUrl = `flowya.app/spot-detail?id=${spot.id}`;
      const shareMessage = spot.name 
        ? `Check out ${spot.name} on FLOWYA! ${shareUrl}`
        : `Check out this spot on FLOWYA! ${shareUrl}`;
      
      await Share.share({
        message: shareMessage,
        title: spot.name || 'FLOWYA Spot',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Couldn\'t share. Try again.');
    }
  };

  const handleMenuPress = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  const handleSuggestEdit = () => {
    if (!spot) return;
    setIsMenuVisible(false);
    // Inicializar iconos de plan info (si no están en form)
    setEditPlanInfoIconRestrictions('paw');
    setEditPlanInfoIconAccessibility('accessibility');
    setIsEditMode(true);
    // form.howToVisit ya se inicializa desde initialSpot en useSpotForm
  };

  const handleGenerateAI = async () => {
    if (!spot) return;
    const generatedContent = await form.generateContent();
    if (generatedContent) {
      setShowAIPreview(true);
    }
  };

  const handleAcceptAIContent = () => {
    if (form.previewContent) {
      if (form.previewContent.whyItMatters) {
        form.setWhyItMatters(form.previewContent.whyItMatters);
        form.setDescription(form.previewContent.whyItMatters);
      }
      if (form.previewContent.culturalContext) {
        form.setCulturalContext(form.previewContent.culturalContext);
      }
      if (form.previewContent.howToVisit) {
        // Form.howToVisit ya maneja toda la estructura
        form.setHowToVisit(form.previewContent.howToVisit);
      }
    }
    setShowAIPreview(false);
    form.setPreviewContent(null);
  };

  const handleRejectAIContent = () => {
    setShowAIPreview(false);
    form.setPreviewContent(null);
  };

  const handleSaveEdit = () => {
    if (!spot) return;
    // form.howToVisit ya está actualizado desde los helpers
    form.handleSave();
  };

  const handleCancelEdit = () => {
    if (form.hasChanges) {
      setShowCancelConfirm(true);
    } else {
      form.handleCancel();
      setShowIconSelector(null);
    }
  };

  const handleConfirmCancel = () => {
    form.handleCancel();
    setShowIconSelector(null);
    setShowCancelConfirm(false);
  };


  const handleReport = () => {
    setIsMenuVisible(false);
    // Reporte es visible para todos los usuarios
    // Por ahora, mostrar modal con opciones de reporte
    Alert.alert(
      'Report issue',
      'Select the type of issue you want to report:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Incorrect content', 
          onPress: () => {
            Alert.alert('Report submitted', 'Thank you for your report. We will review it soon.');
          }
        },
        { 
          text: 'Place closed', 
          onPress: () => {
            Alert.alert('Report submitted', 'Thank you for your report. We will review it soon.');
          }
        },
        { 
          text: 'Spam or inappropriate', 
          onPress: () => {
            Alert.alert('Report submitted', 'Thank you for your report. We will review it soon.');
          }
        },
        { 
          text: 'Other', 
          onPress: () => {
            Alert.alert('Report submitted', 'Thank you for your report. We will review it soon.');
          }
        },
      ],
      { cancelable: true }
    );
  };

  const handlePlaceNoLongerExists = () => {
    if (!spot) return;
    
    // Verificar autenticación
    if (!isAuthenticated || !user) {
      Alert.alert('Permission required', 'You must be logged in to delete spots.');
      setIsMenuVisible(false);
      return;
    }

    // Verificar permisos usando helper canónico
    if (!canDeleteSpot(spot, user)) {
      Alert.alert('Permission denied', 'You can only delete spots that you created.');
      setIsMenuVisible(false);
      return;
    }
    
    setIsMenuVisible(false);
    setIsDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!spot) return;
    deleteSpot(spot.id);
    setIsDeleteConfirmVisible(false);
    // Redirigir a home después de eliminar
    router.replace('/(tabs)/home');
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmVisible(false);
  };


  // Photo selection is now handled by useSpotForm hook via form.pickImage

  const handleStartFlow = () => {
    if (!spot) return;
    
    // Validar ubicación antes de iniciar flow
    if (!baseLocation) {
      Alert.alert(
        'Location needed',
        'Enable location to start flow from here. Go to Settings and allow location access.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Settings', 
            onPress: () => {
              // En web no podemos abrir configuración, solo mostrar mensaje
              Alert.alert('Settings', 'Enable location in your browser settings.');
            }
          },
        ]
      );
      return;
    }
    
    // Create a temporary path with just this spot
    // The path will grow as the user moves and discovers more spots
    const tempPath = createPath(
      [spot.id],
      'walking',
      spot.name ? `Flow from ${spot.name}` : 'New Flow',
      'We\'ll build the path as you move.'
    );
    
    // Start the flow with this temporary path
    // La navegación se maneja en FlowContext.startFlow
    startFlow(tempPath.id);
  };

  /**
   * Get directions - Abre app externa de navegación
   * POLÍTICA: NO hace llamadas internas a Google Maps APIs.
   * Solo construye URL externa y delega navegación al sistema.
   */
  const handleGetDirections = async () => {
    if (!spot) return;
    
    // Si no hay ubicación del usuario, usar ubicación del spot como origen
    // (aunque idealmente deberíamos tener la ubicación actual del usuario)
    const originLocation = baseLocation || spot.location;
    const destinationLocation = spot.location;
    
    // Usar modo walking por defecto (se puede hacer dinámico según el flow si aplica)
    const navigationMode = mapMovementModeToNavigationMode('walking');
    
    const success = await openNavigationApp(
      originLocation,
      destinationLocation,
      navigationMode
    );
    
    if (!success) {
      Alert.alert(
        'Navigation unavailable',
        'Could not open navigation app. Please make sure you have a maps app installed.'
      );
    }
  };

  // Handle zoom
  const handleZoomIn = () => {
    const currentMapRef = isFullscreen ? mapViewFullscreenRef.current : mapViewRef.current;
    if (currentMapRef) {
      currentMapRef.zoomIn();
    }
  };

  const handleZoomOut = () => {
    const currentMapRef = isFullscreen ? mapViewFullscreenRef.current : mapViewRef.current;
    if (currentMapRef) {
      currentMapRef.zoomOut();
    }
  };

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle center on user location
  const handleCenterOnUserLocation = () => {
    if (!baseLocation) return;
    
    const currentMapRef = isFullscreen ? mapViewFullscreenRef.current : mapViewRef.current;
    if (currentMapRef) {
      currentMapRef.centerOnUserLocation();
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.background },
      isFullscreen && styles.containerFullscreen,
    ]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      

      {/* Map en fullscreen - Fuera del ScrollView */}
      {isFullscreen && (
        <View 
          style={[
            styles.mapContainer,
            {
              width: Dimensions.get('window').width,
              height: Dimensions.get('window').height,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000,
              borderRadius: 0,
              marginTop: 0,
            },
          ]}
          onLayout={() => {
            if (mapViewFullscreenRef.current && isFullscreen) {
              setTimeout(() => {
                mapViewFullscreenRef.current?.resize();
              }, 50);
            }
          }}>
          <FlowyaMapView
            ref={mapViewFullscreenRef}
            spots={[spot]}
            onSpotPress={() => {}}
            initialRegion={{
              latitude: spot.location.latitude,
              longitude: spot.location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            userLocation={baseLocation}
            showUserLocation={!!baseLocation}
            highlightedSpotId={spot.id}
            disableNativeControls={true}
          />
        </View>
      )}

      {/* Scrollable content */}
      {!isFullscreen && (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* ContentHeader with image hero */}
        {(() => {
          const validImage = isEditMode ? form.photo : getValidImage(spot.photos);
          const heroImage = validImage ? { uri: validImage } : null;
          
          // Left actions
          const leftActions: ContentHeaderAction[] = [
            {
              icon: isEditMode ? 'close' : 'back',
              onPress: handleBack,
              tooltip: isEditMode ? 'Cancel edit' : undefined,
            },
          ];
          
          // Right actions (solo si no está en modo edición)
          const rightActions: ContentHeaderAction[] = !isEditMode
            ? [
                {
                  icon: 'bookmark',
                  onPress: handleSave,
                  tooltip: isSaved ? 'Guardado - Toca para quitar' : 'Guardar este lugar',
                  isActive: isSaved,
                  activeColor: isSaved ? colors.tint : undefined,
                },
                {
                  icon: 'share',
                  onPress: handleShare,
                },
                {
                  icon: 'menu',
                  onPress: handleMenuPress,
                },
              ]
            : [];
          
          return (
            <ContentHeader
              heroType="image"
              heroImage={heroImage}
              heroHeight={IMAGE_HEIGHT}
              leftActions={leftActions}
              rightActions={rightActions}
              showOverlay={true}
              sticky={false}
            />
          );
        })()}
        
        {/* Edit mode image picker button - handled by ContentHeader with FormImagePicker */}

        <View style={[styles.contentSection, { backgroundColor: colors.background }]}>

          {/* Title */}
          {isEditMode ? (
            <FormField label="Name" style={{ marginTop: spacing.md }}>
              <FormTextInput
                value={form.name}
                onChangeText={form.setName}
                placeholder="Spot name"
              />
            </FormField>
          ) : (
            spot.name && (
            <Text style={[textStyles.heading, { color: colors.text, marginTop: spacing.md }]}>
              {spot.name}
            </Text>
            )
          )}

          {/* Metadata Row: Chip | Distance | Rating */}
          {isEditMode ? (
            <FormField label="Type" style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
              <FormTypeSelector
                selectedType={form.type}
                onSelectType={form.setType}
              />
            </FormField>
          ) : (
            <InfoMeta
              chip={{ label: getSpotTypeLabel(spot.type) }}
              distance={distance || undefined}
              rating={{ value: 4.8, count: 128 }}
              size="large"
            />
          )}

          {/* Primary Action Button - ocultar en modo edición */}
          {!isEditMode && (
            <>
          <TouchableOpacity
            onPress={handleStartFlow}
            style={[
              styles.primaryButton, 
              { 
                backgroundColor: baseLocation ? colors.tint : colors.icon + '40',
                opacity: baseLocation ? 1 : 0.6,
              }
            ]}
            activeOpacity={0.8}
            disabled={!baseLocation}>
            <Icon name="play" size={20} color="#fff" />
            <Text style={[textStyles.bodyMedium, { color: '#fff', marginLeft: spacing.xs }]}>
              Start from here
            </Text>
          </TouchableOpacity>
          {!baseLocation && (
            <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2, marginBottom: spacing.md }]}>
              Enable location to start flow
            </Text>
          )}
          {baseLocation && (
            <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs, marginBottom: spacing.md }]}>
              We&apos;ll build the path as you move.
            </Text>
          )}
            </>
          )}

          {/* Why it matters section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.sm }]}>
                  Why it matters
                </Text>
                {isEditMode && isAIConfigured() && (
                  <AIGenerateButton
                    onPress={handleGenerateAI}
                    isGenerating={form.isGeneratingAI}
                    size="small"
                  />
                )}
              </View>
            {isEditMode ? (
              <FormTextArea
                value={form.whyItMatters || form.description}
                onChangeText={(text) => {
                  form.setWhyItMatters(text);
                  form.setDescription(text); // Mantener sincronizado por ahora
                }}
                placeholder="What makes this place special? e.g. A 16th-century temple representing colonial architecture..."
                numberOfLines={4}
              />
            ) : (
              (spot.whyItMatters || spot.description) && (
              <Text style={[textStyles.body, { color: colors.text }]}>{spot.whyItMatters || spot.description}</Text>
              )
          )}
          </View>

          {/* Cultural context section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[textStyles.heading3, { color: colors.text }]}>Cultural context</Text>
              <Icon name="chevron-down" size={20} color={colors.icon} />
            </View>
            {isEditMode ? (
              <FormTextArea
                value={form.culturalContext}
                onChangeText={form.setCulturalContext}
                placeholder="Cultural and historical context. e.g. Built in 1650, this was the center of social life during colonial times..."
                numberOfLines={4}
                style={{ marginTop: spacing.sm }}
              />
            ) : (
            spot.culturalContext && (
            <Text style={[textStyles.body, { color: colors.text, marginTop: spacing.sm }]}>
              {spot.culturalContext}
            </Text>
            )
            )}
          </View>

          {/* Location on map section */}
          <View style={styles.section}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.sm }]}>
              Location
            </Text>
            {isEditMode ? (
              <FormLocationSelector
                location={form.location}
                onLocationChange={(loc) => {
                  form.setLocation(loc);
                  // El mapa se centra automáticamente cuando cambia la ubicación
                }}
                userLocation={baseLocation}
                mapHeight={400}
              />
            ) : (
              <>
                {/* Map Container - Edge-to-edge en fullscreen */}
                <View 
                  style={[
                    styles.mapContainer,
                    isFullscreen && {
                      width: Dimensions.get('window').width,
                      height: Dimensions.get('window').height,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 1000,
                      borderRadius: 0,
                      marginTop: 0,
                    },
                  ]}>
                  <FlowyaMapView
                    ref={mapViewRef}
                    spots={[spot]}
                    onSpotPress={() => {}}
                    initialRegion={{
                      latitude: spot.location.latitude,
                      longitude: spot.location.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    userLocation={baseLocation}
                    showUserLocation={!!baseLocation}
                    highlightedSpotId={spot.id}
                    disableNativeControls={true}
                  />

                  {/* Controles del mapa - Overlay dentro del contenedor del mapa, solo cuando no está en fullscreen */}
                  {!isFullscreen && (
                    <>
                      {/* Botón Current Location - Lado izquierdo */}
                      {baseLocation && (
                        <TouchableOpacity
                          onPress={handleCenterOnUserLocation}
                          activeOpacity={0.7}
                          style={[styles.currentLocationButton, {
                            backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                          }]}>
                          <GlassView
                            style={styles.buttonContent}
                            intensity="light"
                            opacity="medium"
                            shadowLevel="subtle"
                            enableGlow={false}>
                            <Icon name="navigation" size={20} color={colors.tint} />
                          </GlassView>
                        </TouchableOpacity>
                      )}

                      {/* Map Controls - Lado derecho (zoom y fullscreen) */}
                      <MapControls
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onFullscreenToggle={handleFullscreenToggle}
                        isFullscreen={isFullscreen}
                        showFullscreen={true}
                      />
                    </>
                  )}
                </View>

                {/* Botón Get directions - Ocultar en fullscreen */}
                {!isFullscreen && (
                  <TouchableOpacity
                    onPress={handleGetDirections}
                    style={[
                      styles.getDirectionsButton,
                      { 
                        backgroundColor: colors.background,
                        borderColor: colors.icon + '30',
                      }
                    ]}
                    activeOpacity={0.7}>
                    <Icon name="directions" size={20} color={colors.tint} />
                    <Text style={[textStyles.bodyMedium, { color: colors.tint, marginLeft: spacing.xs }]}>
                      Get directions
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* How to visit section */}
          <View style={styles.section}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.sm }]}>
              How to visit
            </Text>
            {isEditMode ? (
              <>
                <View style={styles.howToVisitEditCard}>
                  <TouchableOpacity
                    onPress={() => setShowIconSelector({ field: '1' })}
                    style={[styles.iconSelectorButton, { backgroundColor: colors.icon + '10', borderColor: colors.icon + '30' }]}>
                    <Icon name={getHowToVisitBestTimeIcon()} size={24} color={colors.tint} />
                  </TouchableOpacity>
                  <FormTextArea
                    value={getHowToVisitBestTime()}
                    onChangeText={(text) => setHowToVisitBestTime(text)}
                    placeholder="First tip (e.g., Visit early morning...)"
                    numberOfLines={2}
                    style={{ flex: 1, marginLeft: spacing.sm }}
                  />
                </View>
                <View style={[styles.howToVisitEditCard, { marginTop: spacing.sm }]}>
                  <TouchableOpacity
                    onPress={() => setShowIconSelector({ field: '2' })}
                    style={[styles.iconSelectorButton, { backgroundColor: colors.icon + '10', borderColor: colors.icon + '30' }]}>
                    <Icon name={getHowToVisitPhotographyIcon()} size={24} color={colors.tint} />
                  </TouchableOpacity>
                  <FormTextArea
                    value={getHowToVisitPhotography()}
                    onChangeText={(text) => setHowToVisitPhotography(text)}
                    placeholder="Second tip (e.g., Allowed everywhere...)"
                    numberOfLines={2}
                    style={{ flex: 1, marginLeft: spacing.sm }}
                  />
                </View>
              </>
            ) : (
              <>
            {(isEditMode ? form.howToVisit : spot.howToVisit)?.bestTime && (
              <View style={[styles.howToVisitCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <Icon name={(isEditMode ? form.howToVisit : spot.howToVisit)?.bestTime?.icon as any} size={24} color={colors.tint} />
                <Text style={[textStyles.body, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
                  {(isEditMode ? form.howToVisit : spot.howToVisit)?.bestTime?.text}
                </Text>
              </View>
            )}
            {(isEditMode ? form.howToVisit : spot.howToVisit)?.photography && (
              <View style={[styles.howToVisitCard, { marginTop: spacing.sm, backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <Icon name={(isEditMode ? form.howToVisit : spot.howToVisit)?.photography?.icon as any} size={24} color={colors.tint} />
                <Text style={[textStyles.body, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
                  {(isEditMode ? form.howToVisit : spot.howToVisit)?.photography?.text}
                </Text>
              </View>
            )}
              </>
            )}
          </View>

          {/* Plan info section */}
          <View style={styles.section}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.sm }]}>
              Plan info
            </Text>
            {isEditMode ? (
              <View style={styles.planInfoEditContainer}>
                <View style={styles.planInfoEditRow}>
                  <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>Hours</Text>
                  <View style={styles.hoursEditContainer}>
                    {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                      const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
                      return (
                        <View key={day} style={styles.hoursEditRow}>
                          <Text style={[textStyles.caption, { color: colors.text, width: 80, flexShrink: 0 }]}>{dayLabel}</Text>
                          <FormTextInput
                            value={form.hours?.[day] || ''}
                            onChangeText={(text) => {
                              const currentHours = form.hours || {};
                              const updated: SpotHours = { ...currentHours };
                              if (text.trim()) {
                                updated[day] = text.trim();
                              } else {
                                delete updated[day];
                              }
                              form.setHours(Object.keys(updated).length > 0 ? updated : undefined);
                            }}
                            placeholder="8:00 - 20:00"
                            style={{ flex: 1 }}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.planInfoEditRow}>
                  <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>Restrictions & Accessibility</Text>
                  <View style={styles.planInfoIconsEditContainer}>
                    <View style={styles.planInfoIconTextEditContainer}>
                      <TouchableOpacity
                        onPress={() => setShowIconSelector({ field: 'restrictions' })}
                        style={[styles.planInfoIconEditButton, { backgroundColor: colors.icon + '10', borderColor: colors.icon + '30' }]}
                        activeOpacity={0.7}>
                        <Icon name={editPlanInfoIconRestrictions} size={24} color={colors.tint} />
                      </TouchableOpacity>
                      <FormTextInput
                        value={form.restrictions}
                        onChangeText={form.setRestrictions}
                        placeholder="Restrictions (e.g., No pets)"
                        style={{ flex: 1, marginLeft: spacing.sm }}
                      />
                    </View>
                    <View style={[styles.planInfoIconTextEditContainer, { marginTop: spacing.sm }]}>
                      <TouchableOpacity
                        onPress={() => setShowIconSelector({ field: 'accessibility' })}
                        style={[styles.planInfoIconEditButton, { backgroundColor: colors.icon + '10', borderColor: colors.icon + '30' }]}
                        activeOpacity={0.7}>
                        <Icon name={editPlanInfoIconAccessibility} size={24} color={colors.tint} />
                      </TouchableOpacity>
                      <FormTextInput
                        value={form.accessibility}
                        onChangeText={form.setAccessibility}
                        placeholder="Accessibility (e.g., Wheelchair accessible)"
                        style={{ flex: 1, marginLeft: spacing.sm }}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.planInfoEditRow}>
                  <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>Cost</Text>
                  <View style={styles.costEditRow}>
                    <FormTextInput
                      value={form.cost?.amount?.toString() || ''}
                      onChangeText={(text) => {
                        const num = parseFloat(text);
                        form.setCost({
                          currency: form.cost?.currency || 'USD',
                          amount: isNaN(num) ? 0 : num,
                          description: form.cost?.description,
                        });
                      }}
                      placeholder="Amount"
                      keyboardType="numeric"
                      style={{ flex: 1 }}
                    />
                    <FormTextInput
                      value={form.cost?.currency || ''}
                      onChangeText={(text) => {
                        form.setCost({
                          currency: text || 'USD',
                          amount: form.cost?.amount || 0,
                          description: form.cost?.description,
                        });
                      }}
                      placeholder="Currency"
                      style={{ width: 80, marginLeft: spacing.sm }}
                    />
                  </View>
                  <FormTextInput
                    value={form.cost?.description || ''}
                    onChangeText={(text) => {
                      form.setCost({
                        currency: form.cost?.currency || 'USD',
                        amount: form.cost?.amount || 0,
                        description: text || undefined,
                      });
                    }}
                    placeholder="Description (optional)"
                    style={{ marginTop: spacing.sm }}
                  />
                </View>
              </View>
            ) : (
            <View style={styles.planInfoGrid}>
              {hoursText && (
                <View style={[styles.planInfoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                  <Icon name="clock" size={24} color={colors.icon} />
                  <View style={styles.infoCardContent}>
                    <Text style={[textStyles.label, { color: colors.text }]}>HOURS</Text>
                    <Text style={[textStyles.body, { color: colors.text }]}>{hoursText}</Text>
                    <Text style={[textStyles.caption, { color: colors.tint, marginTop: spacing.xs / 2 }]}>
                      Open now
                    </Text>
                  </View>
                </View>
              )}
              {costText && (
                <View style={[styles.planInfoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                  <Icon name="money" size={24} color={colors.icon} />
                  <View style={styles.infoCardContent}>
                    <Text style={[textStyles.label, { color: colors.text }]}>COST</Text>
                    <Text style={[textStyles.body, { color: colors.text }]}>{costText}</Text>
                  </View>
                </View>
              )}
              <View style={[styles.planInfoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <Icon name={editPlanInfoIconRestrictions} size={24} color={colors.icon} />
                <View style={styles.infoCardContent}>
                  <Text style={[textStyles.label, { color: colors.text }]}>RESTRICTIONS</Text>
                  <Text style={[textStyles.body, { color: colors.text }]}>
                    {spot.restrictions || 'No pets'}
                  </Text>
                </View>
              </View>
              <View style={[styles.planInfoCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <Icon name={editPlanInfoIconAccessibility} size={24} color={colors.icon} />
                <View style={styles.infoCardContent}>
                  <Text style={[textStyles.label, { color: colors.text }]}>ACCESSIBILITY</Text>
                  <Text style={[textStyles.body, { color: colors.text }]}>
                    {spot.accessibility || 'Unknown'}
                  </Text>
                </View>
              </View>
            </View>
            )}
          </View>

          {/* Bottom padding */}
          <View style={{ height: spacing['2xl'] }} />
        </View>
      </ScrollView>
      )}

      {/* Edit Mode Actions */}
      {isEditMode && (
        <View style={[styles.editActions, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.editActionButton, styles.cancelEditButton, { backgroundColor: colors.icon + '20' }]}
            onPress={handleCancelEdit}
            activeOpacity={0.7}>
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editActionButton, styles.saveEditButton, { backgroundColor: colors.tint }]}
            onPress={handleSaveEdit}
            activeOpacity={0.7}>
            <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Save</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={handleMenuClose}>
        <Pressable style={styles.menuOverlay} onPress={handleMenuClose}>
          <GlassView
            style={styles.menuContainer}
            shadowLevel="medium"
            enableGlow={true}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSuggestEdit}
              activeOpacity={0.7}>
              <Icon name="edit" size={20} color={colors.text} />
              <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.sm }]}>
                Suggest an edit
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleReport}
              activeOpacity={0.7}>
              <Icon name="report" size={20} color={colors.text} />
              <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.sm }]}>
                Report
              </Text>
            </TouchableOpacity>
            {/* Visible para el creador del spot o administrador */}
            {spot && user && canDeleteSpot(spot, user) && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handlePlaceNoLongerExists}
                activeOpacity={0.7}>
                <Icon name="delete" size={20} color={colors.text} />
                <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.sm }]}>
                  This place no longer exists
                </Text>
              </TouchableOpacity>
            )}
          </GlassView>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={isDeleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelDelete}>
        <Pressable style={styles.menuOverlay} onPress={handleCancelDelete}>
          <GlassView
            style={styles.deleteConfirmModal}
            intensity="medium"
            opacity="strong"
            shadowLevel="medium"
            enableGlow={true}>
            <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
              Delete this spot?
            </Text>
            <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
              This action cannot be undone. The spot will be permanently deleted.
            </Text>
            <View style={styles.deleteConfirmButtons}>
              <TouchableOpacity
                style={[styles.deleteConfirmButton, styles.deleteConfirmButtonCancel, { borderColor: colors.icon + '30' }]}
                onPress={handleCancelDelete}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteConfirmButton, styles.deleteConfirmButtonDelete, { backgroundColor: '#FF6B6B' }]}
                onPress={handleConfirmDelete}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        </Pressable>
      </Modal>

      {/* Icon Selector Modal - Using canonical component */}
      <FormIconSelector
        selectedIcon={
          showIconSelector?.field === '1' ? getHowToVisitBestTimeIcon() :
          showIconSelector?.field === '2' ? getHowToVisitPhotographyIcon() :
          showIconSelector?.field === 'restrictions' ? editPlanInfoIconRestrictions :
          showIconSelector?.field === 'accessibility' ? editPlanInfoIconAccessibility :
          'sun'
        }
        onSelectIcon={(iconName) => {
          if (showIconSelector?.field === '1') {
            setHowToVisitBestTimeIcon(iconName);
          } else if (showIconSelector?.field === '2') {
            setHowToVisitPhotographyIcon(iconName);
          } else if (showIconSelector?.field === 'restrictions') {
            setEditPlanInfoIconRestrictions(iconName);
          } else if (showIconSelector?.field === 'accessibility') {
            setEditPlanInfoIconAccessibility(iconName);
          }
        }}
        visible={showIconSelector !== null}
        onClose={() => setShowIconSelector(null)}
      />
      
      {/* Toast notification */}
      <Toast
        message={toastMessage}
        type="success"
        visible={showToast}
        onHide={() => setShowToast(false)}
      />

      {/* AI Content Preview */}
      {form.previewContent && (
        <AIContentPreview
          content={form.previewContent}
          visible={showAIPreview}
          onAccept={handleAcceptAIContent}
          onReject={handleRejectAIContent}
          onEdit={() => {
            handleAcceptAIContent();
          }}
          title="Generated Content"
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelConfirm(false)}>
        <Pressable style={styles.menuOverlay} onPress={() => setShowCancelConfirm(false)}>
          <GlassView
            style={styles.deleteConfirmModal}
            intensity="medium"
            opacity="strong"
            shadowLevel="medium"
            enableGlow={true}>
            <Text style={[textStyles.heading4, { color: colors.text, marginBottom: spacing.sm }]}>
              Discard changes?
            </Text>
            <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
              You have unsaved changes. Are you sure you want to discard them?
            </Text>
            <View style={styles.deleteConfirmButtons}>
              <TouchableOpacity
                style={[styles.deleteConfirmButton, styles.deleteConfirmButtonCancel, { borderColor: colors.icon + '30' }]}
                onPress={() => setShowCancelConfirm(false)}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Keep editing</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteConfirmButton, { backgroundColor: colors.tint }]}
                onPress={handleConfirmCancel}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Discard</Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerFullscreen: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 999,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  backButton: {
    marginTop: spacing.md,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImageButtonContainer: {
    width: SCREEN_WIDTH,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentSection: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Múltiplo de 8px, convención
    paddingVertical: spacing.md,
    borderRadius: borderTokens.card,
    marginTop: spacing.md,
  },
  getDirectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Múltiplo de 8px, convención
    paddingVertical: spacing.md,
    borderRadius: borderTokens.card,
    marginTop: spacing.sm,
    borderWidth: 1,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aiButtonSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 32,
  },
  howToVisitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderTokens.card,
    width: '100%',
  },
  planInfoCard: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderTokens.card,
    width: '48%',
    marginBottom: spacing.sm,
  },
  infoCardContent: {
    flex: 1,
    marginTop: spacing.sm,
    alignItems: 'center',
    width: '100%',
  },
  planInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mapContainer: {
    height: 400, // Múltiplo de 8px (50 * 8) - doble de altura
    borderRadius: borderTokens.card,
    overflow: 'hidden',
    marginTop: spacing.sm,
    position: 'relative', // Para que los controles con position: absolute se posicionen relativos al contenedor
  },
  currentLocationButton: {
    position: 'absolute',
    // MapControls tiene bottom: spacing.xl (40px), con 3 botones (48px cada uno) + 2 divisores (2px + 4px margin cada uno = 10px cada uno)
    // Altura total del MapControls: 48 + 10 + 48 + 10 + 48 = 164px
    // El botón Current Location debe estar arriba del MapControls: spacing.xl + 164 + spacing.sm
    bottom: spacing.xl + 164 + spacing.sm, // Arriba del MapControls (164px es altura total: 3 botones + 2 divisores)
    left: spacing.md,
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 50, // Espacio para el header (40px button + 10px padding)
    paddingRight: spacing.md,
  },
  menuContainer: {
    borderRadius: borderTokens.card,
    paddingVertical: spacing.xs,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
    fontFamily: 'Inter-Regular',
    fontSize: fontSize.base,
  },
  editTitleInput: {
    marginTop: spacing.md,
    minHeight: 44,
  },
  editTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    gap: spacing.xs,
    paddingRight: spacing.md,
  },
  typeSelectorButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
  },
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
  },
  editActionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelEditButton: {},
  saveEditButton: {},
  locationEditContainer: {
    gap: spacing.md,
  },
  locationInputRow: {
    marginBottom: spacing.sm,
  },
  howToVisitEditCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  iconSelectorButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconSelectorContainer: {
    width: '80%',
    maxWidth: 400,
    maxHeight: '70%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  iconSelectorGrid: {
    maxHeight: 400,
  },
  iconSelectorGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  iconSelectorItem: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.xs,
  },
  hoursEditContainer: {
    gap: spacing.xs,
  },
  hoursEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  planInfoIconsEditContainer: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  planInfoIconTextEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  planInfoIconEditButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    flexShrink: 0,
  },
  planInfoEditContainer: {
    gap: spacing.md,
  },
  planInfoEditRow: {
    marginBottom: spacing.md,
  },
  costEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteConfirmModal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  deleteConfirmButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  deleteConfirmButton: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteConfirmButtonCancel: {
    borderWidth: 1,
  },
  deleteConfirmButtonDelete: {
    // backgroundColor se aplica dinámicamente
  },
});

