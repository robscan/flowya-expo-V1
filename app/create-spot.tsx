/**
 * Create Spot Screen
 * Full screen page for creating new spots
 * Converted from CreateSpotModal to full screen navigation
 */

import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { FlowyaMapView } from '@/components/MapView';
import { GlassView } from '@/components/ui/GlassView';
import { Icon, iconTouchableContainer } from '@/components/ui/Icon';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useSpot } from '@/contexts/SpotContext';
import { Spot, SpotType } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useImageUpload } from '@/hooks/useImageUpload';
import { isAIConfigured } from '@/utils/aiConfig';
import { generateSpotContent } from '@/utils/aiContentGenerator';

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

function getSpotTypeLabel(type: SpotType): string {
  const labels: Record<SpotType, string> = {
    beach: 'Beach',
    cafe: 'Café',
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

export default function CreateSpotScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { createSpot } = useSpot();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<SpotType>('other');
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addressSearch, setAddressSearch] = useState('');
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Hook de optimización de imágenes
  const {
    uri: photo,
    isOptimizing: isOptimizingImage,
    pickFromGallery,
    reset: resetImage,
  } = useImageUpload({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 75,
    onOptimized: (optimizedUri) => {
      // La imagen ya está optimizada y lista para usar
      console.log('✅ Imagen optimizada:', optimizedUri);
    },
    onError: (error) => {
      console.error('Error optimizando imagen:', error);
      Alert.alert('Error', 'No se pudo optimizar la imagen. Intenta de nuevo.');
    },
  });

  // Initialize location from query params or user location
  useEffect(() => {
    (async () => {
      // Get user location first
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error getting user location:', error);
      }

      // Initialize current location from params or user location
      if (params.lat && params.lng) {
        setCurrentLocation({
          latitude: parseFloat(params.lat),
          longitude: parseFloat(params.lng),
        });
      } else {
        // Try to get user location as fallback
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        } catch (error) {
          console.error('Error getting location:', error);
        }
      }
    })();
  }, [params.lat, params.lng]);

  // Search address and update location
  const handleSearchAddress = async () => {
    if (!addressSearch.trim()) return;

    setIsSearchingAddress(true);
    try {
      const results = await Location.geocodeAsync(addressSearch);
      if (results.length > 0) {
        const firstResult = results[0];
        setCurrentLocation({
          latitude: firstResult.latitude,
          longitude: firstResult.longitude,
        });
        setAddressSearch('');
      } else {
        Alert.alert('Not found', 'Could not find that address. Please try a different search.');
      }
    } catch (error) {
      console.error('Error searching address:', error);
      Alert.alert('Error', 'Couldn\'t search address. Try again.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Handle location change from map
  const handleLocationChange = (newLocation: { latitude: number; longitude: number }) => {
    setCurrentLocation(newLocation);
  };

  // Handle generate content with AI
  const handleGenerateAI = async () => {
    if (!currentLocation) {
      Alert.alert('Error', 'Location is required to generate content');
      return;
    }

    if (!isAIConfigured()) {
      Alert.alert('AI not configured', 'OpenAI API key is not configured. Please set EXPO_PUBLIC_OPENAI_API_KEY in .env');
      return;
    }

    setIsGeneratingAI(true);
    setAiError(null);

    try {
      // Crear un spot temporal para generar contenido
      const tempSpot: Spot = {
        id: 'temp',
        name: name || undefined,
        location: {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          adjustable: true,
        },
        photos: photo ? [photo] : [],
        description: description || undefined,
        type,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const generatedContent = await generateSpotContent(tempSpot);

      // Prellenar campos con contenido generado
      if (generatedContent.whyItMatters && !description) {
        setDescription(generatedContent.whyItMatters);
      }
      // Nota: culturalContext y howToVisit se pueden agregar a campos adicionales si se implementan en el formulario

      Alert.alert('Content generated', 'Edit before creating.');
    } catch (error: any) {
      console.error('Error generating AI content:', error);
      setAiError(error.message || 'Couldn\'t generate content. Try again.');
      Alert.alert('Error', error.message || 'Couldn\'t generate content. Try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Handle photo selection (usa hook de optimización)
  const handlePickImage = async () => {
    const optimizedUri = await pickFromGallery();
    // El hook ya maneja la optimización y actualiza el estado 'photo'
    // No necesitamos hacer nada más, la imagen ya está optimizada
  };

  // Validación en tiempo real
  const isFormValid = currentLocation && photo;

  // Handle send (create spot)
  const handleSend = () => {
    if (!currentLocation) {
      Alert.alert('Location required', 'Select a location on the map or search for an address');
      return;
    }

    if (!photo) {
      Alert.alert('Photo required', 'Add a photo of the place');
      return;
    }

    const newSpot: Omit<Spot, 'id' | 'createdAt' | 'updatedAt'> = {
      name: name || undefined,
      location: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        adjustable: true,
      },
      photos: [photo],
      description: description || undefined,
      type,
    };

    // Show success message first
    setShowSuccessMessage(true);
    
    // Call createSpot after a brief delay
    setTimeout(() => {
      createSpot(newSpot);
    }, 100);
    
    // Close after showing success message
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const handleCancel = () => {
    router.back();
  };

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

  if (!currentLocation && !userLocation) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
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
          onPress={handleCancel}
          style={iconTouchableContainer.base}
          activeOpacity={0.7}>
          <Icon name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[textStyles.heading3, { color: colors.text }]}>Create Spot</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section 1: Photo */}
        <View style={styles.section}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
            Photo <Text style={{ color: colors.tint }}>*</Text>
          </Text>
          {photo ? (
            <View style={styles.photoContainer}>
              {isOptimizingImage ? (
                <View style={[styles.photo, { justifyContent: 'center', alignItems: 'center' }]}>
                  <ActivityIndicator size="large" color={colors.tint} />
                </View>
              ) : (
                <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
              )}
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => resetImage()}
                activeOpacity={0.7}>
                <Icon name="close" size={20} color={colors.background} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.photoPlaceholder, { backgroundColor: colors.icon + '10', borderColor: colors.icon + '30' }]}
              onPress={handlePickImage}
              activeOpacity={0.7}>
              <Icon name="add" size={32} color={colors.icon} />
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
                Add photo
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Section 2: Location */}
        <View style={styles.section}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
            Location
          </Text>
          <Text style={[textStyles.caption, { color: colors.text, marginBottom: spacing.sm }]}>
            Search by address or adjust the pin on the map
          </Text>
          
          {/* Address search */}
          <View style={styles.addressSearchContainer}>
            <TextInput
              style={[
                styles.addressInput,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon + '30' },
              ]}
              value={addressSearch}
              onChangeText={setAddressSearch}
              placeholder="Search by address"
              placeholderTextColor={colors.icon}
              onSubmitEditing={handleSearchAddress}
            />
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: colors.tint }]}
              onPress={handleSearchAddress}
              disabled={isSearchingAddress || !addressSearch.trim()}
              activeOpacity={0.7}>
              {isSearchingAddress ? (
                <ActivityIndicator size="small" color={colors.background} />
              ) : (
                <Icon name="search" size={20} color={colors.background} />
              )}
            </TouchableOpacity>
          </View>

          {/* Map */}
          {currentLocation && (
            <>
              <View style={styles.mapContainer}>
                      <FlowyaMapView
                  spots={[{
                    id: 'temp-spot',
                    name: 'New Spot',
                    location: currentLocation,
                    photos: [],
                    type: 'other',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }]}
                  onSpotPress={() => {}}
                  onLongPress={handleLocationChange}
                  initialRegion={{
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  userLocation={userLocation}
                        showUserLocation={!!userLocation}
                />
              </View>
              <Text style={[textStyles.caption, { color: colors.icon, marginTop: spacing.xs }]}>
                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </Text>
            </>
          )}
        </View>

        {/* Section 3: Name and Description */}
        <View style={styles.section}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
            Name
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon + '30' }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Main Square, Sunset Viewpoint..."
            placeholderTextColor={colors.icon}
          />
        </View>

        <View style={styles.section}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
            Description
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: colors.background, color: colors.text, borderColor: colors.icon + '30' },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Brief description. e.g. A viewpoint with panoramic city views..."
            placeholderTextColor={colors.icon}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Section 4: Type */}
        <View style={styles.section}>
          <Text style={[textStyles.bodyMedium, { color: colors.icon, marginBottom: spacing.xs }]}>
            Type
          </Text>
          <View style={styles.typeContainer}>
            {SPOT_TYPES.map((spotType) => (
              <TouchableOpacity
                key={spotType}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: type === spotType ? colors.tint + '20' : colors.icon + '10',
                    borderColor: type === spotType ? colors.tint : 'transparent',
                  },
                ]}
                onPress={() => setType(spotType)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    textStyles.caption,
                    { color: type === spotType ? colors.tint : colors.text },
                  ]}>
                  {getSpotTypeLabel(spotType)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: colors.icon + '20' }]}
          onPress={handleCancel}
          activeOpacity={0.7}>
          <Text style={[textStyles.bodyMedium, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
        
        {/* Generate with AI button - only show if AI is configured and location is available */}
        {isAIConfigured() && currentLocation && (
          <View style={{ marginRight: spacing.sm }}>
            <TouchableOpacity
              style={[
                styles.aiButton,
                {
                  backgroundColor: isGeneratingAI ? colors.icon + '40' : colors.tint + '20',
                  borderColor: colors.tint,
                  borderWidth: 1,
                },
              ]}
              onPress={handleGenerateAI}
              disabled={isGeneratingAI}
              activeOpacity={0.7}>
              {isGeneratingAI ? (
                <ActivityIndicator size="small" color={colors.tint} />
              ) : (
                <>
                  <Icon name="star" size={16} color={colors.tint} />
                  <Text style={[textStyles.bodyMedium, { color: colors.tint, marginLeft: spacing.xs }]}>
                    AI
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: isFormValid ? colors.tint : colors.icon + '40' },
          ]}
          onPress={handleSend}
          disabled={!isFormValid}
          activeOpacity={0.7}>
          <Text style={[textStyles.bodyMedium, { color: isFormValid ? colors.background : colors.icon }]}>
            Send
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* AI Error message */}
      {aiError && (
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Text style={[textStyles.caption, { color: '#FF6B6B' }]}>{aiError}</Text>
        </View>
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
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressSearchContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  addressInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  typeButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
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
  sendButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiButton: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
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
});

