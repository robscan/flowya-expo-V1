/**
 * Spot Detail Screen
 * Full screen page for displaying detailed spot information
 * Based on V5 definition: SPOT DETAIL section
 */

import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { FlowyaMapView } from '@/components/MapView';
import { ContentHeader, ContentHeaderAction } from '@/components/ui/ContentHeader';
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
import { Spot, SpotType, SpotHours, SpotCost } from '@/data/spots';
import { IconName } from '@/components/ui/Icon';
import { generateSpotContent } from '@/utils/aiContentGenerator';
import { isAIConfigured } from '@/utils/aiConfig';

const SPOT_TYPES: SpotType[] = [
  'beach',
  'cafe',
  'viewpoint',
  'museum',
  'restaurant',
  'park',
  'monument',
  'market',
  'other',
];
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateDistanceToSpot } from '@/utils/distance';
import { hasValidImage, getValidImage } from '@/utils/imageHelpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4; // 40% of screen height

// Helper para obtener nombre legible del tipo
function getSpotTypeLabel(type: SpotType): string {
  const labels: Record<SpotType, string> = {
    beach: 'Beach',
    cafe: 'Café', // Keep original label for consistency
    viewpoint: 'Viewpoint',
    museum: 'Museum',
    restaurant: 'Restaurant',
    park: 'Park',
    monument: 'Monument',
    market: 'Market',
    other: 'Other',
  };
  return labels[type] || 'Other';
}

// Helper para formatear horarios
function formatHours(hours?: Spot['hours']): string | null {
  if (!hours) return null;
  const days = Object.entries(hours)
    .filter(([_, value]) => value)
    .map(([day, value]) => `${day}: ${value}`)
    .join(', ');
  return days || null;
}

// Helper para formatear costo
function formatCost(cost?: Spot['cost']): string | null {
  if (!cost) return null;
  return cost.description || `${cost.amount} ${cost.currency}`;
}

export default function SpotDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { getSpotById, updateSpot, deleteSpot } = useSpot();
  const { isSpotSaved, toggleSaveSpot } = useSaved();
  const { createPath } = usePath();
  const { startFlow } = useFlow();
  const { user, isAuthenticated } = useAuth();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  
  // Animaciones para feedback visual
  const saveButtonScale = useState(new Animated.Value(1))[0];
  const likeButtonScale = useState(new Animated.Value(1))[0];
  
  // Estados locales para modo de edición
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editWhyItMatters, setEditWhyItMatters] = useState('');
  const [editType, setEditType] = useState<SpotType>('other');
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const [editCulturalContext, setEditCulturalContext] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [editHowToVisit1, setEditHowToVisit1] = useState('');
  const [editHowToVisit2, setEditHowToVisit2] = useState('');
  const [editHowToVisitIcon1, setEditHowToVisitIcon1] = useState<IconName>('sun');
  const [editHowToVisitIcon2, setEditHowToVisitIcon2] = useState<IconName>('camera');
  const [editLocation, setEditLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [editHours, setEditHours] = useState<Spot['hours'] | undefined>(undefined);
  const [editCost, setEditCost] = useState<Spot['cost'] | undefined>(undefined);
  const [showIconSelector, setShowIconSelector] = useState<{ field: '1' | '2' | 'restrictions' | 'accessibility' } | null>(null);
  const [editPlanInfoIconRestrictions, setEditPlanInfoIconRestrictions] = useState<IconName>('paw');
  const [editPlanInfoIconAccessibility, setEditPlanInfoIconAccessibility] = useState<IconName>('accessibility');
  const [editRestrictions, setEditRestrictions] = useState('');
  const [editAccessibility, setEditAccessibility] = useState('');

  // Get spot from context
  const spot = id ? getSpotById(id) : null;

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

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
  const hoursText = formatHours(isEditMode ? editHours : spot.hours);
  const costText = formatCost(isEditMode ? editCost : spot.cost);
  const distance = userLocation ? calculateDistanceToSpot(userLocation, spot.location) : null;

  const handleBack = () => {
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
    // Inicializar estados de edición con valores actuales
    setEditName(spot.name || '');
    setEditDescription(spot.description || '');
    setEditWhyItMatters(spot.whyItMatters || spot.description || '');
    setEditType(spot.type);
    setEditPhoto(spot.photos && spot.photos.length > 0 ? spot.photos[0] : null);
    setEditCulturalContext(spot.culturalContext || '');
    setEditHowToVisit1('Visit early morning (8–10 AM) for soft light and fewer crowds.'); // Default text
    setEditHowToVisit2('Allowed everywhere, but tripods require a special permit.'); // Default text
    setEditHowToVisitIcon1('sun');
    setEditHowToVisitIcon2('camera');
    setEditLocation({ latitude: spot.location.latitude, longitude: spot.location.longitude });
    setEditHours(spot.hours);
    setEditCost(spot.cost);
    setEditPlanInfoIconRestrictions('paw');
    setEditPlanInfoIconAccessibility('accessibility');
    setEditRestrictions(spot.restrictions || 'No pets');
    setEditAccessibility(spot.accessibility || 'Unknown');
    setIsEditMode(true);
  };

  const handleGenerateAI = async () => {
    if (!spot) return;

    if (!isAIConfigured()) {
      Alert.alert('AI not configured', 'OpenAI API key is not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in .env');
      return;
    }

    setIsGeneratingAI(true);
    setAiError(null);

    try {
      // Crear spot temporal con datos actuales de edición
      const tempSpot: Spot = {
        ...spot,
        name: editName || spot.name,
        description: editDescription || spot.description,
        whyItMatters: editWhyItMatters || spot.whyItMatters,
        culturalContext: editCulturalContext || spot.culturalContext,
        type: editType,
        location: editLocation || spot.location,
      };

      const generatedContent = await generateSpotContent(tempSpot);

      // Prellenar campos con contenido generado
      if (generatedContent.whyItMatters) {
        setEditWhyItMatters(generatedContent.whyItMatters);
      }
      if (generatedContent.culturalContext) {
        setEditCulturalContext(generatedContent.culturalContext);
      }
      // Nota: howToVisit se puede agregar si se implementa en el formulario

        Alert.alert('Content generated', 'Edit before saving.');
    } catch (error: any) {
      console.error('Error generating AI content:', error);
      setAiError(error.message || 'Failed to generate content. Please try again.');
      Alert.alert('Error', error.message || 'Couldn\'t generate content. Try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveEdit = () => {
    if (!spot) return;
    const updates: Partial<Spot> = {
      name: editName || undefined,
      description: editDescription || undefined,
      whyItMatters: editWhyItMatters || undefined,
      culturalContext: editCulturalContext || undefined,
      type: editType,
      hours: editHours,
      cost: editCost,
      restrictions: editRestrictions || undefined,
      accessibility: editAccessibility || undefined,
    };
    if (editPhoto && editPhoto !== spot.photos?.[0]) {
      updates.photos = [editPhoto, ...(spot.photos?.slice(1) || [])];
    }
    if (editLocation) {
      updates.location = {
        ...spot.location,
        latitude: editLocation.latitude,
        longitude: editLocation.longitude,
      };
    }
    updateSpot(spot.id, updates);
    setIsEditMode(false);
    Alert.alert('Place updated', 'Changes saved');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Resetear estados locales
    setEditName('');
    setEditDescription('');
    setEditWhyItMatters('');
    setEditType('other');
    setEditPhoto(null);
    setEditCulturalContext('');
    setAiError(null);
    setEditHowToVisit1('');
    setEditHowToVisit2('');
    setEditHowToVisitIcon1('sun');
    setEditHowToVisitIcon2('camera');
    setEditLocation(null);
    setEditHours(undefined);
    setEditCost(undefined);
    setEditPlanInfoIconRestrictions('paw');
    setEditPlanInfoIconAccessibility('accessibility');
    setEditRestrictions('');
    setEditAccessibility('');
    setShowIconSelector(null);
  };


  const handleReport = () => {
    setIsMenuVisible(false);
    Alert.alert(
      'Report',
      'This feature will allow you to report issues with this spot. Coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handlePlaceNoLongerExists = () => {
    if (!spot) return;
    
    // Verificar que el usuario esté logueado y sea el creador del spot
    if (!isAuthenticated || !user) {
      Alert.alert('Permission required', 'You must be logged in to delete spots.');
      setIsMenuVisible(false);
      return;
    }

    if (spot.createdBy && spot.createdBy !== user.id) {
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
    router.back();
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmVisible(false);
  };


  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need access to your photos to change the spot image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setEditPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleStartFlow = () => {
    // Validar ubicación antes de iniciar flow
    if (!userLocation) {
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
    if (!spot) return;
    
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* ContentHeader with image hero */}
        {(() => {
          const validImage = isEditMode ? editPhoto : getValidImage(spot.photos);
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
        
        {/* Edit mode image picker button */}
        {isEditMode && (() => {
          const validImage = editPhoto || getValidImage(spot.photos);
          if (!validImage) {
            return (
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.icon + '10', height: IMAGE_HEIGHT }]}>
                <TouchableOpacity
                  onPress={handlePickImage}
                  style={styles.imagePlaceholderButton}
                  activeOpacity={0.7}>
                  <Icon name="upload" size={48} color={colors.icon} />
                  <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>Add photo</Text>
                </TouchableOpacity>
              </View>
            );
          }
          return (
            <View style={[styles.editImageButtonContainer, { height: IMAGE_HEIGHT }]}>
              <TouchableOpacity
                onPress={handlePickImage}
                style={[styles.editImageButton, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]}
                activeOpacity={0.7}>
                <Icon name="edit" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        })()}

        <View style={[styles.contentSection, { backgroundColor: colors.background }]}>

          {/* Title */}
          {isEditMode ? (
            <TextInput
              style={[styles.editInput, styles.editTitleInput, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Spot name"
              placeholderTextColor={colors.icon}
            />
          ) : (
            spot.name && (
            <Text style={[textStyles.heading, { color: colors.text, marginTop: spacing.md }]}>
              {spot.name}
            </Text>
            )
          )}

          {/* Metadata Row: Chip | Distance | Rating */}
          {isEditMode ? (
            <View style={{ marginTop: spacing.sm, marginBottom: spacing.md }}>
              <FlatList
                data={SPOT_TYPES}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.typeSelector}
                keyExtractor={(item) => item}
                renderItem={({ item: spotType }) => (
                  <TouchableOpacity
                    style={[
                      styles.typeSelectorButton,
                      {
                        backgroundColor: editType === spotType ? colors.tint + '20' : colors.icon + '10',
                        borderColor: editType === spotType ? colors.tint : 'transparent',
                      },
                    ]}
                    onPress={() => setEditType(spotType)}
                    activeOpacity={0.7}>
                    <Text style={[textStyles.caption, { color: editType === spotType ? colors.tint : colors.text }]}>
                      {getSpotTypeLabel(spotType)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
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
                backgroundColor: userLocation ? colors.tint : colors.icon + '40',
                opacity: userLocation ? 1 : 0.6,
              }
            ]}
            activeOpacity={0.8}
            disabled={!userLocation}>
            <Icon name="play" size={20} color="#fff" />
            <Text style={[textStyles.bodyMedium, { color: '#fff', marginLeft: spacing.xs }]}>
              Start from here
            </Text>
          </TouchableOpacity>
          {!userLocation && (
            <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs / 2, marginBottom: spacing.md }]}>
              Enable location to start flow
            </Text>
          )}
          {userLocation && (
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
                  <Tooltip text="Generate description with AI">
                    <TouchableOpacity
                      style={[styles.aiButtonSmall, { backgroundColor: colors.tint + '20', borderColor: colors.tint }]}
                      onPress={handleGenerateAI}
                      disabled={isGeneratingAI}
                      activeOpacity={0.7}>
                      {isGeneratingAI ? (
                        <ActivityIndicator size="small" color={colors.tint} />
                      ) : (
                        <>
                          <Icon name="star" size={14} color={colors.tint} />
                          <Text style={[textStyles.caption, { color: colors.tint, marginLeft: spacing.xs / 2 }]}>
                            AI
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </Tooltip>
                )}
              </View>
            {isEditMode ? (
              <TextInput
                style={[styles.editInput, styles.editTextArea, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background }]}
                value={editWhyItMatters || editDescription}
                onChangeText={(text) => {
                  setEditWhyItMatters(text);
                  setEditDescription(text); // Mantener sincronizado por ahora
                }}
                placeholder="What makes this place special? e.g. A 16th-century temple representing colonial architecture..."
                placeholderTextColor={colors.icon}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
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
              <TextInput
                style={[styles.editInput, styles.editTextArea, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background, marginTop: spacing.sm }]}
                value={editCulturalContext}
                onChangeText={setEditCulturalContext}
                placeholder="Cultural and historical context. e.g. Built in 1650, this was the center of social life during colonial times..."
                placeholderTextColor={colors.icon}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
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
              <View style={styles.locationEditContainer}>
                <View style={styles.locationInputRow}>
                  <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>Latitude</Text>
                  <TextInput
                    style={[styles.editInput, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background }]}
                    value={editLocation ? editLocation.latitude.toString() : ''}
                    onChangeText={(text) => {
                      const num = parseFloat(text);
                      if (!isNaN(num) && editLocation) {
                        setEditLocation({ ...editLocation, latitude: num });
                      }
                    }}
                    placeholder="Latitude"
                    placeholderTextColor={colors.icon}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.locationInputRow}>
                  <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>Longitude</Text>
                  <TextInput
                    style={[styles.editInput, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background }]}
                    value={editLocation ? editLocation.longitude.toString() : ''}
                    onChangeText={(text) => {
                      const num = parseFloat(text);
                      if (!isNaN(num) && editLocation) {
                        setEditLocation({ ...editLocation, longitude: num });
                      }
                    }}
                    placeholder="Longitude"
                    placeholderTextColor={colors.icon}
                    keyboardType="numeric"
                  />
                </View>
            <View style={styles.mapContainer}>
                  <Text style={[textStyles.caption, { color: colors.icon, marginBottom: spacing.xs }]}>
                    Tap on the map to select location
                  </Text>
                  <FlowyaMapView
                    spots={editLocation ? [{ ...spot, location: { ...spot.location, latitude: editLocation.latitude, longitude: editLocation.longitude } }] : [spot]}
                    onSpotPress={() => {}}
                    onLongPress={(location) => {
                      setEditLocation(location);
                    }}
                    initialRegion={{
                      latitude: editLocation?.latitude ?? spot.location.latitude,
                      longitude: editLocation?.longitude ?? spot.location.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    userLocation={userLocation}
                    showUserLocation={!!userLocation}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.mapContainer}>
                <FlowyaMapView
                spots={[spot]}
                onSpotPress={() => {}}
                initialRegion={{
                  latitude: spot.location.latitude,
                  longitude: spot.location.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                  userLocation={userLocation}
                  showUserLocation={!!userLocation}
              />
            </View>
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
                    <Icon name={editHowToVisitIcon1} size={24} color={colors.tint} />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.editInput, styles.editTextArea, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background, flex: 1, marginLeft: spacing.sm }]}
                    value={editHowToVisit1}
                    onChangeText={setEditHowToVisit1}
                    placeholder="First tip (e.g., Visit early morning...)"
                    placeholderTextColor={colors.icon}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>
                <View style={[styles.howToVisitEditCard, { marginTop: spacing.sm }]}>
                  <TouchableOpacity
                    onPress={() => setShowIconSelector({ field: '2' })}
                    style={[styles.iconSelectorButton, { backgroundColor: colors.icon + '10', borderColor: colors.icon + '30' }]}>
                    <Icon name={editHowToVisitIcon2} size={24} color={colors.tint} />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.editInput, styles.editTextArea, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background, flex: 1, marginLeft: spacing.sm }]}
                    value={editHowToVisit2}
                    onChangeText={setEditHowToVisit2}
                    placeholder="Second tip (e.g., Allowed everywhere...)"
                    placeholderTextColor={colors.icon}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                  />
                </View>
              </>
            ) : (
              <>
            <View style={[styles.howToVisitCard, { backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
              <Icon name="sun" size={24} color={colors.tint} />
              <Text style={[textStyles.body, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
                Visit early morning (8–10 AM) for soft light and fewer crowds.
              </Text>
            </View>
            <View style={[styles.howToVisitCard, { marginTop: spacing.sm, backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
              <Icon name="camera" size={24} color={colors.tint} />
              <Text style={[textStyles.body, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
                Allowed everywhere, but tripods require a special permit.
              </Text>
            </View>
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
                          <TextInput
                            style={[styles.editInput, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background, flex: 1 }]}
                            value={editHours?.[day] || ''}
                            onChangeText={(text) => {
                              setEditHours(prev => {
                                const updated = { ...prev };
                                if (text.trim()) {
                                  updated[day] = text.trim();
                                } else {
                                  delete updated[day];
                                }
                                return Object.keys(updated).length > 0 ? updated : undefined;
                              });
                            }}
                            placeholder="8:00 - 20:00"
                            placeholderTextColor={colors.icon}
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
                      <TextInput
                        style={[styles.editInput, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background, flex: 1, marginLeft: spacing.sm }]}
                        value={editRestrictions}
                        onChangeText={setEditRestrictions}
                        placeholder="Restrictions (e.g., No pets)"
                        placeholderTextColor={colors.icon}
                      />
                    </View>
                    <View style={[styles.planInfoIconTextEditContainer, { marginTop: spacing.sm }]}>
                      <TouchableOpacity
                        onPress={() => setShowIconSelector({ field: 'accessibility' })}
                        style={[styles.planInfoIconEditButton, { backgroundColor: colors.icon + '10', borderColor: colors.icon + '30' }]}
                        activeOpacity={0.7}>
                        <Icon name={editPlanInfoIconAccessibility} size={24} color={colors.tint} />
                      </TouchableOpacity>
                      <TextInput
                        style={[styles.editInput, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background, flex: 1, marginLeft: spacing.sm }]}
                        value={editAccessibility}
                        onChangeText={setEditAccessibility}
                        placeholder="Accessibility (e.g., Wheelchair accessible)"
                        placeholderTextColor={colors.icon}
                      />
                    </View>
                  </View>
                </View>
                <View style={styles.planInfoEditRow}>
                  <Text style={[textStyles.label, { color: colors.text, marginBottom: spacing.xs }]}>Cost</Text>
                  <View style={styles.costEditRow}>
                    <TextInput
                      style={[styles.editInput, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background, flex: 1 }]}
                      value={editCost?.amount?.toString() || ''}
                      onChangeText={(text) => {
                        const num = parseFloat(text);
                        setEditCost({
                          currency: editCost?.currency || 'USD',
                          amount: isNaN(num) ? 0 : num,
                          description: editCost?.description,
                        });
                      }}
                      placeholder="Amount"
                      placeholderTextColor={colors.icon}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={[styles.editInput, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background, width: 80, marginLeft: spacing.sm }]}
                      value={editCost?.currency || ''}
                      onChangeText={(text) => {
                        setEditCost({
                          currency: text || 'USD',
                          amount: editCost?.amount || 0,
                          description: editCost?.description,
                        });
                      }}
                      placeholder="Currency"
                      placeholderTextColor={colors.icon}
                    />
                  </View>
                  <TextInput
                    style={[styles.editInput, { color: colors.text, borderColor: colors.icon + '30', backgroundColor: colors.background, marginTop: spacing.sm }]}
                    value={editCost?.description || ''}
                    onChangeText={(text) => {
                      setEditCost({
                        currency: editCost?.currency || 'USD',
                        amount: editCost?.amount || 0,
                        description: text || undefined,
                      });
                    }}
                    placeholder="Description (optional)"
                    placeholderTextColor={colors.icon}
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
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handlePlaceNoLongerExists}
              activeOpacity={0.7}>
              <Icon name="delete" size={20} color={colors.text} />
              <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.sm }]}>
                This place no longer exists
              </Text>
            </TouchableOpacity>
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
              Delete place
            </Text>
            <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg }]}>
              Are you sure you want to delete "{spot?.name || 'this place'}"?
              {'\n\n'}
              This action cannot be undone. The place will be permanently deleted.
            </Text>
            <View style={styles.deleteConfirmButtons}>
              <TouchableOpacity
                style={[styles.deleteConfirmButton, styles.deleteConfirmButtonCancel, { borderColor: colors.icon + '30' }]}
                onPress={handleCancelDelete}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteConfirmButton, styles.deleteConfirmButtonDelete, { backgroundColor: colors.error }]}
                onPress={handleConfirmDelete}
                activeOpacity={0.7}>
                <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </GlassView>
        </Pressable>
      </Modal>

      {/* Icon Selector Modal */}
      <Modal
        visible={showIconSelector !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIconSelector(null)}>
        <Pressable style={styles.menuOverlay} onPress={() => setShowIconSelector(null)}>
          <GlassView
            style={styles.iconSelectorContainer}
            shadowLevel="medium"
            enableGlow={true}>
            <Text style={[textStyles.heading3, { color: colors.text, marginBottom: spacing.md }]}>
              Select Icon
            </Text>
            <ScrollView style={styles.iconSelectorGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.iconSelectorGridContent}>
                {(['sun', 'camera', 'clock', 'map', 'star', 'bookmark', 'like', 'audio', 'play', 'navigation', 'home', 'explore', 'gems', 'search', 'mic', 'money', 'paw', 'accessibility', 'edit', 'share', 'add', 'minus', 'plus'] as IconName[]).map((iconName) => (
                  <TouchableOpacity
                    key={iconName}
                    style={[
                      styles.iconSelectorItem,
                      {
                        backgroundColor: (() => {
                          if (showIconSelector?.field === '1') return editHowToVisitIcon1 === iconName;
                          if (showIconSelector?.field === '2') return editHowToVisitIcon2 === iconName;
                          if (showIconSelector?.field === 'restrictions') return editPlanInfoIconRestrictions === iconName;
                          if (showIconSelector?.field === 'accessibility') return editPlanInfoIconAccessibility === iconName;
                          return false;
                        })()
                          ? colors.tint + '20'
                          : colors.icon + '10',
                        borderColor: (() => {
                          if (showIconSelector?.field === '1') return editHowToVisitIcon1 === iconName;
                          if (showIconSelector?.field === '2') return editHowToVisitIcon2 === iconName;
                          if (showIconSelector?.field === 'restrictions') return editPlanInfoIconRestrictions === iconName;
                          if (showIconSelector?.field === 'accessibility') return editPlanInfoIconAccessibility === iconName;
                          return false;
                        })()
                          ? colors.tint
                          : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      if (showIconSelector?.field === '1') {
                        setEditHowToVisitIcon1(iconName);
                      } else if (showIconSelector?.field === '2') {
                        setEditHowToVisitIcon2(iconName);
                      } else if (showIconSelector?.field === 'restrictions') {
                        setEditPlanInfoIconRestrictions(iconName);
                      } else if (showIconSelector?.field === 'accessibility') {
                        setEditPlanInfoIconAccessibility(iconName);
                      }
                      setShowIconSelector(null);
                    }}
                    activeOpacity={0.7}>
                    <Icon name={iconName} size={32} color={colors.tint} />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </GlassView>
        </Pressable>
      </Modal>
      
      {/* Toast notification */}
      <Toast
        message={toastMessage}
        type="success"
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: fontSize.md,
  },
  editTitleInput: {
    marginTop: spacing.md,
    minHeight: 44,
  },
  editTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editImageButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderButton: {
    justifyContent: 'center',
    alignItems: 'center',
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

