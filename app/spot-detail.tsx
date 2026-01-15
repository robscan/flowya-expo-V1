/**
 * Spot Detail Screen
 * Full screen page for displaying detailed spot information
 * Based on V5 definition: SPOT DETAIL section
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';

import { FlowyaMapView, FlowyaMapViewRef } from '@/components/MapView';
import { ContentHeader, ContentHeaderAction } from '@/components/ui/ContentHeader';
import { FormField } from '@/components/ui/FormField';
// FASE 4: FormIconSelector eliminado - campos avanzados eliminados
// import { FormIconSelector } from '@/components/ui/FormIconSelector';
import { LocationSelectorWeb } from '@/components/ui/LocationSelectorWeb';
import { FormTextArea } from '@/components/ui/FormTextArea';
import { FormTextInput } from '@/components/ui/FormTextInput';
import { FormTypeSelector } from '@/components/ui/FormTypeSelector';
import { GlassView } from '@/components/ui/GlassView';
import { Icon, IconName } from '@/components/ui/Icon';
import { InfoMeta } from '@/components/ui/InfoMeta';
import { MapControls } from '@/components/ui/MapControls';
import { PinStateModal } from '@/components/ui/PinStateModal';
import { Toast } from '@/components/ui/Toast';
import { borderRadius, borderTokens } from '@/constants/borders';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontSize, textStyles } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';
import { useFlow } from '@/contexts/FlowContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved, PinState } from '@/contexts/SavedContext';
import { showAlert } from '@/utils/alertPolyfill';
import { hasSeenPinModal, markPinModalSeen } from '@/utils/pinFirstTime';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useSpot } from '@/contexts/SpotContext';
import { Spot } from '@/data/spots';
import type { SpotReportReason } from '@/types/spotContributions';
// FASE 4: SpotHours eliminado - campos avanzados eliminados
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { useSpotDistance } from '@/hooks/useSpotDistance';
import { useSpotForm } from '@/hooks/useSpotForm';
import { auditSpotEditorial } from '@/utils/spotEditorialAudit';
import { getPlaceholderImageSource, getSpotImageUrls, hasValidImage } from '@/utils/imageHelpers';
import { mapMovementModeToNavigationMode, openNavigationApp } from '@/utils/navigationHelpers';
import { getSpotTypeLabel } from '@/utils/spotFormHelpers';
import { normalizeSpotId } from '@/utils/normalizeSpotId';
import { createSpotReport } from '@/utils/spotReportsService';
import { createSpotContribution } from '@/utils/spotContributionsService';
// FASE 4: formatHours, formatCost eliminados - campos avanzados eliminados

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4; // 40% of screen height

// Helpers moved to utils/spotFormHelpers.ts - using shared utilities

export default function SpotDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getSpotById, markSpotAsSeen, markSpotAsAvailable } = useSpot();
  const { pinSpot, unpinSpot, changePinState, isSpotPinned, getPinState, getPinData, updatePinNotes, addPinPhoto, removePinPhoto } = useSaved();
  const { createPath } = usePath();
  // SCOPE 9: Obtener flowState, currentSpotId y funciones de Flow
  const { flowState, currentSpotId, expandFlow, addSpotToFlow, startFlow } = useFlow();
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
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Animaciones para feedback visual
  const [pinButtonScale] = useState(() => new Animated.Value(1));
  
  
  // V1.2: Estados para Diario de Viaje
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  
  // Estados para modal de pin primera vez
  const [showPinModal, setShowPinModal] = useState(false);
  const [hasSeenFirstTime, setHasSeenFirstTime] = useState<boolean | null>(null);
  
  // Estados para selector de iconos
  // FASE 4: showIconSelector eliminado - campos avanzados eliminados (howToVisit, restrictions, accessibility)
  // const [showIconSelector, setShowIconSelector] = useState<{ field: '1' | '2' | 'restrictions' | 'accessibility' } | null>(null);
  // const [editPlanInfoIconRestrictions, setEditPlanInfoIconRestrictions] = useState<IconName>('paw');
  // const [editPlanInfoIconAccessibility, setEditPlanInfoIconAccessibility] = useState<IconName>('accessibility');

  const spot = id ? getSpotById(id) : null;

  // Debug: Log spot data para detectar problemas de carga
  useEffect(() => {
    if (spot && __DEV__) {
      console.log(`[SpotDetail] Spot cargado: ${spot.id}`, {
        name: spot.name,
        hasShortDescription: !!spot.shortDescription,
        shortDescriptionLength: spot.shortDescription?.length || 0,
        shortDescriptionPreview: spot.shortDescription?.substring(0, 50) || 'N/A',
        hasWhyItMatters: !!spot.whyItMatters,
        hasDescription: !!spot.description,
      });
    }
  }, [spot?.id]);

  // Marcar Spot como 'seen' al montar (automáticamente)
  useEffect(() => {
    if (!id) return;
    
    markSpotAsSeen(id);
    
    // Si el Spot tiene imagen principal, marcar como 'available' después de un breve delay
    // (esto permite que OptimizedImage inicie la carga si es necesario)
    // El cache de imágenes se maneja independientemente, esto solo marca el Spot como disponible
    // FASE 5: Usar image.url en lugar de photos[0] (compatible con ambos formatos)
    const spotImageUrl = spot?.image?.url || (spot?.photos && spot.photos.length > 0 ? spot.photos[0] : '');
    if (spot && hasValidImage(spot.photos, spotImageUrl)) {
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

  // Verificar si usuario ya vio el modal de pins (cargar al montar)
  useEffect(() => {
    hasSeenPinModal().then((seen) => {
      setHasSeenFirstTime(seen);
    });
  }, []);

  // Inicializar notesText cuando cambia el pin o se abre el editor - DEBE estar antes del return temprano
  // Usamos getPinData con ID normalizado
  useEffect(() => {
    if (!id) return;
    const currentPinData = getPinData(id);
    const currentPersonalNotes = currentPinData?.notes || '';
    if (isEditingNotes && currentPersonalNotes) {
      setNotesText(currentPersonalNotes);
    } else if (!isEditingNotes) {
      setNotesText('');
    }
  }, [id, isEditingNotes, getPinData]);

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
    initialSpot: spot ?? null,
    isEditMode,
    onSave: async (spotData) => {
      if (!spot) return;
      if (!user?.id) {
        Alert.alert('Iniciar sesión requerido', 'Debes iniciar sesión para sugerir cambios.');
        return;
      }
      const payload = {
        name: spotData.name,
        type: spotData.type,
        location: spotData.location,
        short_description: spotData.shortDescription,
        description: spotData.description,
        image: spotData.image,
        has_generated_content: spotData.hasGeneratedContent,
      };
      const result = await createSpotContribution(spot.id, payload, user.id);
      if (result.error) {
        Alert.alert('Error', 'No se pudo enviar la sugerencia. Intenta de nuevo.');
        return;
      }
      Alert.alert(
        'Sugerencia enviada',
        'Gracias. Tu contribución quedó pendiente de revisión.'
      );
      setIsEditMode(false);
    },
    onCancel: () => {
      setIsEditMode(false);
    },
  });


  // FASE 4: howToVisit eliminado - campos avanzados eliminados
  // Todos los helpers de howToVisit han sido eliminados

  // Calcular distancia usando hook canónico - DEBE estar antes del return temprano
  const distance = useSpotDistance(id || null, baseLocation);

  // V1.2: Hook para selección de imágenes (para fotos personales) - DEBE estar antes del return temprano
  const imageUploadHook = useImageUpload({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 75,
    onOptimized: (uri) => {
      if (id) {
        addPinPhoto(id, uri);
        setToastMessage('Foto agregada');
        setShowToast(true);
      }
    },
    onError: (error) => {
      console.error('Error adding photo:', error);
      Alert.alert('Error', 'No se pudo agregar la foto. Intenta de nuevo.');
    },
  });

  if (!spot) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.errorContainer}>
          <Text style={[textStyles.body, { color: colors.text }]}>Spot not found</Text>
          <Pressable 
            onPress={() => router.back()} 
            style={({ pressed }) => [
              styles.backButton,
              pressed && { opacity: 0.7 },
            ]}>
            <Text style={[textStyles.bodyMedium, { color: colors.tint }]}>Volver</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isPinned = isSpotPinned(spot.id);
  const pinState = getPinState(spot.id);
  const pinData = getPinData(spot.id); // V1.3: Usar getPinData con ID normalizado
  const isVisitedPin = pinState === 'visited';
  const personalNotes = pinData?.notes || '';
  const personalPhotos = pinData?.personalPhotos || [];
  
  // FASE 4: hours y cost eliminados - campos avanzados eliminados

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

  // Handler para seleccionar estado en modal
  const handlePinStateSelect = (state: PinState) => {
    pinSpot(spot.id, state);
    setShowPinModal(false);
    markPinModalSeen();
    setHasSeenFirstTime(true); // Actualizar estado local después de marcar
    setToastMessage(state === 'visited' ? 'Pineado · Visitado' : 'Pineado · Por visitar');
    setShowToast(true);
    
    // Animación de feedback visual
    Animated.sequence([
      Animated.timing(pinButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(pinButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const handlePinPress = async () => {
    // V1.2: Validar autenticación
    if (!isAuthenticated) {
      showAlert(
        'Iniciar sesión requerido',
        'Debes iniciar sesión para guardar pines.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Iniciar sesión',
            onPress: () => router.push('/(tabs)/login'),
          },
        ]
      );
      return;
    }
    
    // Animación de feedback visual
    Animated.sequence([
      Animated.timing(pinButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(pinButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
    
    // Si no está pinned
    if (!isPinned) {
      // Verificar si es primera vez (verificar siempre desde AsyncStorage para consistencia)
      const seen = await hasSeenPinModal();
      if (!seen) {
        // Primera vez: mostrar modal
        setHasSeenFirstTime(false);
        setShowPinModal(true);
        return;
      }
      
      // No es primera vez: pin directamente con to_visit
      if (hasSeenFirstTime === null) {
        setHasSeenFirstTime(true);
      }
      pinSpot(spot.id, 'to_visit');
      setToastMessage('Pineado · Por visitar');
      setShowToast(true);
      return;
    }
    
    // Ya está pinned: toggle cíclico
    if (pinState === 'to_visit') {
      // Cambiar a visited
      changePinState(spot.id, 'visited');
      setToastMessage('Cambiado a visitado');
      setShowToast(true);
    } else if (pinState === 'visited') {
      // Eliminar pin
      unpinSpot(spot.id);
      setToastMessage('Pin removido');
      setShowToast(true);
    }
  };


  const handleShare = async () => {
    try {
      const shareSpotId = normalizeSpotId(spot.id) || spot.id;
      const shareUrl = `flowya.app/spot-detail?id=${shareSpotId}`;
      const shareMessage = spot.name
        ? `Mira ${spot.name} en FLOWYA. ${shareUrl}`
        : `Mira este spot en FLOWYA. ${shareUrl}`;
      
      await Share.share({
        message: shareMessage,
        title: spot.name || 'Spot FLOWYA',
      });
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'No se pudo compartir. Intenta nuevamente.');
    }
  };

  const handleMenuPress = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleMenuClose = () => {
    setIsMenuVisible(false);
  };

  // V1.2: Handlers para Diario de Viaje
  const handleStartEditingNotes = () => {
    setIsEditingNotes(true);
    setNotesText(personalNotes);
  };

  // V1.3: handleSaveNotes con activación automática de 'visited'
  const handleSaveNotes = async () => {
    if (!spot) return;
    const currentPin = getPinData(spot.id);
    
    if (!currentPin) {
      // Crear Pin con estado 'visited'
      pinSpot(spot.id, 'visited');
      updatePinNotes(spot.id, notesText);
    } else if (currentPin.state === 'to_visit') {
      // Cambiar a 'visited' y actualizar notas
      changePinState(spot.id, 'visited');
      updatePinNotes(spot.id, notesText);
    } else {
      // Solo actualizar notas
      updatePinNotes(spot.id, notesText);
    }
    
    setIsEditingNotes(false);
    setToastMessage('Notas guardadas');
    setShowToast(true);
  };

  const handleCancelEditingNotes = () => {
    setIsEditingNotes(false);
    setNotesText(personalNotes);
  };

  const handleAddPhoto = async () => {
    if (!spot) return;
    try {
      await imageUploadHook.pickFromGallery();
    } catch (error) {
      console.error('Error adding photo:', error);
      Alert.alert('Error', 'No se pudo agregar la foto. Intenta de nuevo.');
    }
  };

  const handleRemovePhoto = (photoUrl: string) => {
    if (!spot) return;
    removePinPhoto(spot.id, photoUrl);
    setToastMessage('Foto eliminada');
    setShowToast(true);
  };

  const handleSuggestEdit = () => {
    if (!spot) return;
    if (!user?.id) {
      Alert.alert('Iniciar sesión requerido', 'Debes iniciar sesión para sugerir cambios.');
      return;
    }
    setIsMenuVisible(false);
    setIsEditMode(true);
  };

  const handleAskAi = () => {
    Alert.alert(
      'Sugerencia con IA',
      'La IA solo sugiere. No ejecuta acciones ni modifica spots automaticamente.'
    );
  };

  const handleSaveEdit = () => {
    if (!spot) return;
    form.handleSave();
  };

  const handleCancelEdit = () => {
    if (form.hasChanges) {
      setShowCancelConfirm(true);
    } else {
      form.handleCancel();
      // FASE 4: setShowIconSelector eliminado - campos avanzados eliminados
    }
  };

  const handleConfirmCancel = () => {
    form.handleCancel();
    // FASE 4: setShowIconSelector eliminado - campos avanzados eliminados
    setShowCancelConfirm(false);
  };


  const handleReport = () => {
    setIsMenuVisible(false);
    if (!spot) return;
    if (!user?.id) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para reportar un spot.');
      return;
    }

    const submitReport = async (reason: SpotReportReason) => {
      const result = await createSpotReport({
        spotId: normalizeSpotId(spot.id),
        reporterId: user.id,
        reason,
      });
      if (result.error) {
        Alert.alert('Error', 'No se pudo enviar el reporte. Intenta de nuevo.');
        return;
      }
      Alert.alert('Reporte enviado', 'Gracias. Revisaremos tu reporte.');
    };

    Alert.alert(
      'Reportar spot',
      'Selecciona el motivo:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Información incorrecta', onPress: () => submitReport('incorrecta') },
        { text: 'No es del lugar', onPress: () => submitReport('no es del lugar') },
        { text: 'Ofensiva', onPress: () => submitReport('ofensiva') },
        { text: 'Spam', onPress: () => submitReport('spam') },
      ],
      { cancelable: true }
    );
  };


  // Photo selection is now handled by useSpotForm hook via form.pickImage

  const handleStartFlow = () => {
    if (!spot) return;
    
    // Validar ubicación antes de iniciar flow
    if (!baseLocation) {
      Alert.alert(
        'Ubicación necesaria',
        'Activa la ubicación para iniciar el flow desde aquí. Ve a Configuración y permite el acceso.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Configuración',
            onPress: () => {
              // En web no podemos abrir configuración, solo mostrar mensaje
              Alert.alert('Configuración', 'Activa la ubicación en la configuración del navegador.');
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
      spot.name ? `Flow desde ${spot.name}` : 'Nuevo flow',
      'Crearemos el recorrido a medida que te muevas.'
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
    // FASE 4-5: Convertir locations a formato latitude/longitude para openNavigationApp
    const originLocation = baseLocation || ('lat' in spot.location
      ? { latitude: spot.location.lat, longitude: spot.location.lng }
      : spot.location);
    const destinationLocation = 'lat' in spot.location
      ? { latitude: spot.location.lat, longitude: spot.location.lng }
      : spot.location;
    
    // Usar modo walking por defecto (se puede hacer dinámico según el flow si aplica)
    const navigationMode = mapMovementModeToNavigationMode('walking');
    
    const success = await openNavigationApp(
      originLocation,
      destinationLocation,
      navigationMode
    );
    
    if (!success) {
      Alert.alert(
        'Navegación no disponible',
        'No se pudo abrir la app de navegación. Verifica que tengas una app de mapas instalada.'
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
            initialRegion={(() => {
              // FASE 4-5: Normalizar location a formato latitude/longitude
              const loc = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number };
              const lat = loc.lat ?? loc.latitude ?? 0;
              const lng = loc.lng ?? loc.longitude ?? 0;
              return {
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              };
            })()}
            userLocation={baseLocation ? { latitude: baseLocation.latitude, longitude: baseLocation.longitude } : null}
            showUserLocation={!!baseLocation}
            highlightedSpotId={spot.id}
            disableNativeControls={true}
          />
          
          {/* Controles del mapa en fullscreen - Siempre visibles dentro del marco del mapa */}
          {/* Botón Current Location - Lado izquierdo */}
          {baseLocation && (
            <Pressable
              onPress={handleCenterOnUserLocation}
              style={({ pressed }) => [
                styles.currentLocationButton, 
                {
                  backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <GlassView
                style={styles.buttonContent}
                intensity="light"
                opacity="medium"
                shadowLevel="subtle"
                enableGlow={false}>
                <Icon name="navigation" size={20} color={colors.tint} />
              </GlassView>
            </Pressable>
          )}

          {/* Map Controls - Lado derecho (zoom y fullscreen exit) */}
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFullscreenToggle={handleFullscreenToggle}
            isFullscreen={isFullscreen}
            showFullscreen={true}
          />
        </View>
      )}

      {/* Scrollable content */}
      {!isFullscreen && (
      <ScrollView
        style={styles.scrollView}
        // @ts-ignore - Web-specific CSS properties
        {...(Platform.OS === 'web' && {
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        })}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        bounces={true}
        alwaysBounceVertical={false}
        keyboardShouldPersistTaps="handled">
        
        {/* ContentHeader with image hero */}
        {(() => {
          const spotForImages: Spot = {
            ...spot,
            image: isEditMode && form.image ? form.image : spot.image,
            photos: isEditMode ? form.photos : spot.photos,
          };
          const validImages = getSpotImageUrls(spotForImages);
          const heroImages = validImages.length > 1 ? validImages : [];
          const heroImage = validImages.length === 1 ? { uri: validImages[0] } : getPlaceholderImageSource();
          
          // Left actions
          const leftActions: ContentHeaderAction[] = [
            {
              icon: isEditMode ? 'close' : 'back',
              onPress: handleBack,
              tooltip: isEditMode ? 'Cancelar edición' : undefined,
            },
          ];
          
          // Right actions (solo si no está en modo edición)
          const rightActions: ContentHeaderAction[] = !isEditMode
            ? [
                {
                  icon: isPinned && pinState === 'visited' ? 'check-circle' : 'pin',
                  onPress: handlePinPress,
                  tooltip: isPinned 
                    ? (pinState === 'visited' ? 'Visitado - Toca para quitar' : 'Por visitar - Toca para quitar')
                    : 'Pin este lugar',
                  isActive: isPinned,
                  activeColor: isPinned 
                    ? (pinState === 'visited' ? '#4CAF50' : '#2196F3')
                    : undefined,
                },
                {
                  icon: 'share',
                  onPress: handleShare,
                },
                {
                  icon: 'menu' as const,
                  onPress: handleMenuPress,
                },
              ]
            : [];
          
          return (
            <ContentHeader
              heroType="image"
              heroImage={heroImages.length === 0 ? heroImage : null}
              heroImages={heroImages}
              heroHeight={IMAGE_HEIGHT}
              leftActions={leftActions}
              rightActions={rightActions}
              showOverlay={true}
              sticky={false}
            />
          );
        })()}
        
        {/* FASE 5: Edit mode: Image management (imagen única) */}
        {isEditMode && (
          <View style={[styles.imageEditSection, { backgroundColor: colors.background }]}>
            <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.sm }]}>
              Image
            </Text>
            
            {/* FASE 5: Imagen única (no grid) */}
            {form.image?.url && form.image.url.trim().length > 0 && (
              <View style={styles.imageEditItem}>
                <Image source={{ uri: form.image.url }} style={styles.imageEditThumbnail} resizeMode="cover" />
                <Pressable
                  style={({ pressed }) => [
                    styles.imageRemoveButton,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => form.removeImage()}>
                  <Icon name="close" size={16} color={colors.background} />
                </Pressable>
              </View>
            )}
            
            {/* Botón para agregar imagen */}
            <Pressable
              style={({ pressed }) => [
                styles.addImageButton,
                {
                  backgroundColor: colors.icon + '10',
                  borderColor: colors.icon + '30',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              onPress={form.pickImage}
              disabled={form.isOptimizingImage}>
              {form.isOptimizingImage ? (
                <>
                  <ActivityIndicator size="small" color={colors.tint} />
                  <Text style={[textStyles.caption, { color: colors.icon, marginLeft: spacing.xs }]}>
                    Optimizing...
                  </Text>
                </>
              ) : (
                <>
                  <Icon name="add" size={20} color={colors.tint} />
                  <Text style={[textStyles.caption, { color: colors.tint, marginLeft: spacing.xs }]}>
                    Agregar foto
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        <View style={[styles.contentSection, { backgroundColor: colors.background }]}>

          {/* Title */}
          {isEditMode ? (
            <FormField label="Nombre" style={{ marginTop: spacing.md }}>
              <FormTextInput
                value={form.name}
                onChangeText={form.setName}
                placeholder="Nombre del spot"
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
            <FormField label="Tipo" style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
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

          {/* FASE 4: Short Description field - solo en modo edición */}
          {isEditMode && (
            <>
              {/* SCOPE 6.4: Hint discreto si hay campos faltantes */}
              {(() => {
                const editorialStatus = spot ? auditSpotEditorial(spot) : null;
                const hasMissingFields = editorialStatus && (
                  editorialStatus.spotDescription === 'missing' ||
                  editorialStatus.howToVisit === 'missing' ||
                  editorialStatus.planInfo === 'missing'
                );
                
                return hasMissingFields ? (
                  <View style={[styles.incompleteHint, { backgroundColor: colors.icon + '10', marginTop: spacing.sm }]}>
                    <Icon name="info" size={14} color={colors.icon} />
                    <Text style={[textStyles.caption, { color: colors.icon, marginLeft: spacing.xs }]}>
                      Este spot tiene información incompleta
                    </Text>
                  </View>
                ) : null;
              })()}
              
              {/* SCOPE 7: Botón "Enrich with AI" justo arriba del FormField */}
              {!form.existingSpot && (
                <TouchableOpacity
                  style={[
                    styles.smallAIDisabledButton,
                    {
                      borderColor: colors.tint + '30',
                      backgroundColor: colors.tint + '10',
                      marginTop: spacing.sm,
                      marginBottom: spacing.xs,
                    },
                  ]}
                  onPress={handleAskAi}
                  activeOpacity={0.7}>
                  <Icon name="gems" size={14} color={colors.tint} />
                  <Text style={[textStyles.caption, { color: colors.tint, marginLeft: spacing.xs }]}>
                    Pedir sugerencia a IA
                  </Text>
                </TouchableOpacity>
              )}
              
              <FormField label="Descripción corta" style={{ marginTop: spacing.sm }}>
                <FormTextArea
                  value={form.shortDescription}
                  onChangeText={(text) => {
                    form.setShortDescription(text);
                    // Legacy: también actualizar campos legacy para compatibilidad temporal
                    form.setWhyItMatters(text);
                    form.setDescription(text);
                  }}
                  placeholder="Una descripción breve y evocadora (1-2 líneas). Ej. Un mirador con vista panorámica."
                  numberOfLines={2}
                />
              </FormField>
            </>
          )}

          {/* Primary Action Button - ocultar en modo edición */}
          {!isEditMode && (
            <>
              {/* SCOPE 9: Estados del botón "Start from here" con Flow activo */}
              {(() => {
                const isFlowActive = flowState.status === 'active' || flowState.status === 'paused';
                const isCurrentSpotInFlow = isFlowActive && spot?.id === currentSpotId;
                const isNearbySpot = isFlowActive && 
                                     spot?.id !== currentSpotId && 
                                     flowState.flowId !== null; // Simplificado - mejorar con lógica de proximidad

                // SCOPE 9.1: Caso A - Este spot es el actual del Flow
                if (isCurrentSpotInFlow) {
                  return (
                    <Pressable
                      onPress={() => expandFlow()}
                      style={({ pressed }) => [
                        styles.currentSpotButton,
                        {
                          backgroundColor: colors.tint + '30',
                          borderColor: colors.tint,
                          borderWidth: 2,
                          opacity: pressed ? 0.8 : 1,
                        }
                      ]}>
                      <Icon name="navigation" size={20} color={colors.tint} />
                      <Text style={[textStyles.bodyMedium, { color: colors.tint, marginLeft: spacing.xs }]}>
                        Estás aquí
                      </Text>
                    </Pressable>
                  );
                }

                // SCOPE 9.2: Caso B - Spot cercano, no es el actual
                if (isNearbySpot) {
                  return (
                    <Pressable
                      onPress={() => {
                        if (spot) {
                          addSpotToFlow(spot.id);
                        }
                      }}
                      style={({ pressed }) => [
                        styles.addToFlowButton,
                        {
                          backgroundColor: colors.tint + '20',
                          borderColor: colors.tint,
                          opacity: pressed ? 0.8 : 1,
                        }
                      ]}>
                      <Icon name="plus" size={20} color={colors.tint} />
                      <Text style={[textStyles.bodyMedium, { color: colors.tint, marginLeft: spacing.xs }]}>
                        Agregar al flow
                      </Text>
                    </Pressable>
                  );
                }

                // SCOPE 9.3: Caso C - Spot lejano o sin Flow activo: Botón original "Start from here"
                return (
                  <>
                    <Pressable
                      onPress={handleStartFlow}
                      style={({ pressed }) => [
                        styles.primaryButton,
                        {
                          backgroundColor: baseLocation ? colors.tint : colors.icon + '40',
                          opacity: baseLocation ? (pressed ? 0.8 : 1) : 0.6,
                        }
                      ]}
                      disabled={!baseLocation}>
                      <Icon name="play" size={20} color="#fff" />
                      <Text style={[textStyles.bodyMedium, { color: '#fff', marginLeft: spacing.xs }]}>
                        Iniciar desde aquí
                      </Text>
                    </Pressable>
                    {!baseLocation && (
                      <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2, marginBottom: spacing.md }]}>
                        Activa la ubicación para iniciar el flow
                      </Text>
                    )}
                    {baseLocation && (
                      <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs, marginBottom: spacing.md }]}>
                        Crearemos el recorrido a medida que te muevas.
                      </Text>
                    )}
                  </>
                );
              })()}
            </>
          )}

          {/* Why it matters section - editable en modo edición, solo lectura en modo visualización */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.sm }]}>
                Por qué importa
              </Text>
            </View>
            {isEditMode ? (
              // En modo edición, mostrar campo editable
              <FormField label="Por qué importa" style={{ marginTop: spacing.sm }}>
                <FormTextArea
                  value={form.shortDescription || form.whyItMatters || form.description}
                  onChangeText={(text) => {
                    form.setShortDescription(text);
                    // Legacy: también actualizar campos legacy para compatibilidad temporal
                    form.setWhyItMatters(text);
                    form.setDescription(text);
                  }}
                  placeholder="Una descripción breve y evocadora (1-2 líneas). Ej. Un mirador con vista panorámica."
                  numberOfLines={3}
                />
              </FormField>
            ) : (
              // En modo visualización, mostrar el contenido normal
              <View>
                {(() => {
                  // Prioridad: shortDescription > whyItMatters > description
                  const displayText = spot.shortDescription || spot.whyItMatters || spot.description;
                  
                  if (displayText && displayText.trim().length > 0) {
                    return (
                      <Text style={[textStyles.body, { color: colors.text }]}>
                        {displayText}
                      </Text>
                    );
                  }
                  
                  return null;
                })()}
              </View>
            )}
          </View>

          {/* FASE 4: Cultural context section ELIMINADO - campos avanzados eliminados */}

          {/* Location on map section */}
          <View style={styles.section}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.sm }]}>
              Ubicación
            </Text>
            {isEditMode ? (
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
                  userLocation={baseLocation ? { latitude: baseLocation.latitude, longitude: baseLocation.longitude } : null}
                  mapHeight={300}
                />
              </FormField>
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
                    initialRegion={(() => {
                      // FASE 4-5: Normalizar location a formato latitude/longitude
                      const loc = spot.location as { lat?: number; lng?: number; latitude?: number; longitude?: number };
                      const lat = loc.lat ?? loc.latitude ?? 0;
                      const lng = loc.lng ?? loc.longitude ?? 0;
                      return {
                        latitude: lat,
                        longitude: lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      };
                    })()}
                    userLocation={baseLocation}
                    showUserLocation={!!baseLocation}
                    highlightedSpotId={spot.id}
                    disableNativeControls={true}
                  />

                  {/* Controles del mapa - Overlay dentro del contenedor del mapa, siempre visibles */}
                  {/* Botón Current Location - Lado izquierdo */}
                  {baseLocation && (
                    <Pressable
                      onPress={handleCenterOnUserLocation}
                      style={({ pressed }) => [
                        styles.currentLocationButton, 
                        {
                          backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)',
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}>
                      <GlassView
                        style={styles.buttonContent}
                        intensity="light"
                        opacity="medium"
                        shadowLevel="subtle"
                        enableGlow={false}>
                        <Icon name="navigation" size={20} color={colors.tint} />
                      </GlassView>
                    </Pressable>
                  )}

                  {/* Map Controls - Lado derecho (zoom y fullscreen) - Siempre visibles */}
                  <MapControls
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onFullscreenToggle={handleFullscreenToggle}
                    isFullscreen={isFullscreen}
                    showFullscreen={true}
                  />
                </View>

                {/* Botón Get directions - Ocultar en fullscreen */}
                {!isFullscreen && (
                  <Pressable
                    onPress={handleGetDirections}
                    style={({ pressed }) => [
                      styles.getDirectionsButton,
                      { 
                        backgroundColor: colors.background,
                        borderColor: colors.icon + '30',
                        opacity: pressed ? 0.7 : 1,
                      }
                    ]}>
                    <Icon name="directions" size={20} color={colors.tint} />
                    <Text style={[textStyles.bodyMedium, { color: colors.tint, marginLeft: spacing.xs }]}>
                      Get directions
                    </Text>
                  </Pressable>
                )}
              </>
            )}
          </View>

          {/* FASE 4: How to visit section ELIMINADO - campos avanzados eliminados */}

          {/* FASE 4: Plan info section ELIMINADO - campos avanzados eliminados (hours, cost, restrictions, accessibility, planInfo) */}

          {/* V1.3: Diary Section (siempre visible) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                <Text style={[textStyles.heading3, { color: colors.text }]}>Diario</Text>
                {isPinned && !isVisitedPin && (
                  <View style={[styles.visitedBadge, { backgroundColor: colors.icon + '20' }]}>
                    <Text style={[textStyles.caption, { color: colors.icon }]}>
                      Marcar como visitado
                    </Text>
                  </View>
                )}
              </View>
              {!isEditingNotes && (
                <Pressable
                  onPress={handleStartEditingNotes}
                  style={({ pressed }) => [
                    styles.editButton,
                    pressed && { opacity: 0.7 },
                  ]}>
                  <Icon name={personalNotes ? 'edit' : 'add'} size={18} color={colors.tint} />
                  <Text style={[textStyles.bodyMedium, { color: colors.tint, marginLeft: spacing.xs / 2 }]}>
                    {personalNotes ? 'Editar' : 'Agregar notas'}
                  </Text>
                </Pressable>
              )}
            </View>
            
            {/* Metadata temporal: visitedAt */}
            {isPinned && isVisitedPin && pinData?.visitedAt && (
              <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.sm }]}>
                Visitado el {new Date(pinData.visitedAt).toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            )}
            
            {isEditingNotes ? (
              <View style={{ marginTop: spacing.sm }}>
                <FormTextArea
                  value={notesText}
                  onChangeText={setNotesText}
                  placeholder="Agrega tus notas personales sobre este lugar..."
                  numberOfLines={6}
                  style={{ marginBottom: spacing.sm }}
                />
                <View style={styles.notesActions}>
                  <Pressable
                    onPress={handleCancelEditingNotes}
                    style={({ pressed }) => [
                      styles.notesActionButton,
                      styles.notesCancelButton,
                      {
                        backgroundColor: colors.icon + '20',
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}>
                    <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancelar</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSaveNotes}
                    style={({ pressed }) => [
                      styles.notesActionButton,
                      styles.notesSaveButton,
                      {
                        backgroundColor: colors.tint,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}>
                    <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Guardar</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              personalNotes ? (
                <Text style={[textStyles.body, { color: colors.text, marginTop: spacing.sm }]}>
                  {personalNotes}
                </Text>
              ) : null
            )}
          </View>

          {/* V1.3: Personal Photos Section (siempre visible, solo funcional si visited) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[textStyles.heading3, { color: colors.text }]}>Fotos personales</Text>
              <Pressable
                onPress={handleAddPhoto}
                style={({ pressed }) => [
                  styles.editButton,
                  (!isVisitedPin || imageUploadHook.isOptimizing) && styles.disabledButton,
                  pressed && { opacity: 0.7 },
                ]}
                disabled={!isVisitedPin || imageUploadHook.isOptimizing}>
                {imageUploadHook.isOptimizing ? (
                  <ActivityIndicator size="small" color={colors.tint} />
                ) : (
                  <>
                    <Icon name="camera" size={18} color={isVisitedPin ? colors.tint : colors.icon} />
                    <Text style={[textStyles.bodyMedium, { 
                      color: isVisitedPin ? colors.tint : colors.icon, 
                      marginLeft: spacing.xs / 2 
                    }]}>
                      Agregar foto
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
            
            {!isVisitedPin && (
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.sm, fontStyle: 'italic' }]}>
                Marca como visitado para agregar fotos
              </Text>
            )}
            
            {isVisitedPin && personalPhotos.length > 0 && (
              <View style={styles.photosGrid}>
                {personalPhotos.map((photoUrl, index) => (
                  <View key={`${photoUrl}-${index}`} style={styles.photoItem}>
                    <Image source={{ uri: photoUrl }} style={styles.photoThumbnail} resizeMode="cover" />
                    <Pressable
                      style={({ pressed }) => [
                        styles.photoRemoveButton,
                        pressed && { opacity: 0.7 },
                      ]}
                      onPress={() => handleRemovePhoto(photoUrl)}>
                      <Icon name="close" size={16} color={colors.background} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            
            {isVisitedPin && personalPhotos.length === 0 && (
              <Text style={[textStyles.body, { color: colors.icon, marginTop: spacing.sm, fontStyle: 'italic' }]}>
                Aún no hay fotos. Agrega tus fotos personales de esta visita.
              </Text>
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
          <Pressable
            style={({ pressed }) => [
              styles.editActionButton, 
              styles.cancelEditButton, 
              { 
                backgroundColor: colors.icon + '20',
                opacity: pressed ? 0.7 : 1,
              }
            ]}
            onPress={handleCancelEdit}>
            <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.editActionButton, 
              styles.saveEditButton, 
              { 
                backgroundColor: colors.tint,
                opacity: pressed ? 0.7 : 1,
              }
            ]}
            onPress={handleSaveEdit}>
            <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Guardar</Text>
          </Pressable>
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
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleSuggestEdit}>
              <Icon name="edit" size={20} color={colors.text} />
            <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.sm }]}>
              Sugerir edición
            </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleReport}>
              <Icon name="report" size={20} color={colors.text} />
            <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.sm }]}>
              Reportar
            </Text>
            </Pressable>
          </GlassView>
        </Pressable>
      </Modal>

      {/* Icon Selector Modal - Using canonical component */}
      {/* FASE 4: FormIconSelector eliminado - campos avanzados eliminados */}
      
      {/* Pin State Modal - Primera vez */}
      <PinStateModal
        visible={showPinModal}
        onSelect={handlePinStateSelect}
        onCancel={() => setShowPinModal(false)}
      />
      
      {/* Toast notification */}
      <Toast
        message={toastMessage}
        type="success"
        visible={showToast}
        onHide={() => setShowToast(false)}
      />

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
              ¿Descartar cambios?
            </Text>
            <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
              Tienes cambios sin guardar. ¿Seguro que quieres descartarlos?
            </Text>
            <View style={styles.deleteConfirmButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.deleteConfirmButton, 
                  styles.deleteConfirmButtonCancel, 
                  { 
                    borderColor: colors.icon + '30',
                    opacity: pressed ? 0.7 : 1,
                  }
                ]}
                onPress={() => setShowCancelConfirm(false)}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Seguir editando</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.deleteConfirmButton, 
                  { 
                    backgroundColor: colors.tint,
                    opacity: pressed ? 0.7 : 1,
                  }
                ]}
                onPress={handleConfirmCancel}>
                <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Descartar</Text>
              </Pressable>
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
    paddingBottom: spacing['2xl'],
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
  // SCOPE 6.4: Hint discreto para información incompleta
  incompleteHint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  // SCOPE 9: Estilos para estados del botón con Flow activo
  currentSpotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: spacing.md,
    borderRadius: borderTokens.card,
    marginTop: spacing.md,
  },
  addToFlowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: spacing.md,
    borderRadius: borderTokens.card,
    marginTop: spacing.md,
    borderWidth: 1,
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
  imageEditSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  notesActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  notesActionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  notesCancelButton: {
    // Estilo manejado dinámicamente
  },
  notesSaveButton: {
    // Estilo manejado dinámicamente
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  photoItem: {
    position: 'relative',
    width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm * 2) / 3,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoRemoveButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  imageEditItem: {
    width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm * 2) / 3, // 3 columnas con gaps
    height: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm * 2) / 3,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imageEditThumbnail: {
    width: '100%',
    height: '100%',
  },
  imageRemoveButton: {
    position: 'absolute',
    top: spacing.xs / 2,
    right: spacing.xs / 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    minHeight: 48,
  },
  visitedBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

