/**
 * Home Screen with Apple Music-like structure
 * Scope 5: Home - Explore Tab
 * 
 * Home · Explore: "What can I do here and now?"
 * - Horizontal sliders of spots: Nearby, For You, Recommended
 * - Horizontal sliders of compact spots: Maybe You Like (Global), New (Global)
 * - Path lists with clear titles
 * - Everything organized by location
 */

import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

import { FlowCard } from '@/components/FlowCard';
import { LocationWeatherHeader } from '@/components/LocationWeatherHeader';
import { SpotMediaCard } from '@/components/SpotMediaCard';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useOverlay } from '@/contexts/OverlayContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { Flow } from '@/data/flows';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useScrollVisibility } from '@/hooks/use-scroll-visibility';
import { calculateDistanceToSpot } from '@/utils/distance';
import { isFlowComplete } from '@/utils/flowValidation';
import { getFeaturedSpots, getRecentSpots } from '@/utils/gemsLogic';
import { renderContentSkeletonOrEmpty, shouldShowSkeleton } from '@/utils/loadingHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 400); // 75% of screen width, max 400px for desktop

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { setIsTabBarVisible } = useOverlay();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const colors = Colors[colorScheme ?? 'light'];
  
  // Centralized scroll visibility control
  // threshold: 24px para ScreenHeader
  const { isHeaderVisible, isBottomNavVisible, handleScroll } = useScrollVisibility({ 
    threshold: 24 
  });

  const { spots, isLoading: isLoadingSpots, refreshSpots } = useSpot();
  const { paths, isLoading: isLoadingPaths, refreshFlows } = usePath();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { likedSpots, savedSpots } = useSaved();
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Combinar estados de carga
  const isLoading = isLoadingSpots || isLoadingPaths;

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Get user location and weather
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permissions denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const locationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(locationData);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  // Header with Profile icon
  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  // Handle Spot selection (normal detail)
  const handleSpotPress = (spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
  };

  // Handle scroll to show/hide tab bar labels and header
  // Sync bottomNav visibility with hook state
  useEffect(() => {
    setIsTabBarVisible(isBottomNavVisible);
  }, [isBottomNavVisible, setIsTabBarVisible]);

  // Location to use for filtering (selected or user location)
  const currentLocation = selectedLocation || userLocation;

  // Organize spots by categories with priority system to avoid duplicates
  const getFilteredSpotsByPriority = () => {
    const usedSpotIds = new Set<string>();
    const location = currentLocation;

    // 1. Nearby spots (highest priority)
    const getNearbySpots = (): Spot[] => {
      if (!location) return [];
      
      const nearby = spots
        .map((spot) => ({
          spot,
          distance: calculateDistanceToSpot(location, spot.location) || Infinity,
        }))
        .filter((item) => item.distance !== Infinity && item.distance < 5000) // Less than 5km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10)
        .map((item) => item.spot)
        .filter((spot) => !usedSpotIds.has(spot.id));
      
      nearby.forEach((spot) => usedSpotIds.add(spot.id));
      return nearby;
    };

    // 2. For You spots (based on user interactions)
    const getForYouSpots = (): Spot[] => {
      // Get spots similar to liked/saved spots (by type)
      const userLikedTypes = new Set(
        spots
          .filter((spot) => likedSpots.includes(spot.id) || savedSpots.includes(spot.id))
          .map((spot) => spot.type)
      );

      const forYou = spots
        .filter((spot) => !usedSpotIds.has(spot.id))
        .filter((spot) => userLikedTypes.has(spot.type) || likedSpots.includes(spot.id) || savedSpots.includes(spot.id))
        .slice(0, 10);
      
      forYou.forEach((spot) => usedSpotIds.add(spot.id));
      return forYou;
    };

    // 3. Recommended spots (popular spots not in previous sections)
    const getRecommendedSpots = (): Spot[] => {
      // Calculate popularity score based on likes and saves
      const scored = spots
        .filter((spot) => !usedSpotIds.has(spot.id))
        .map((spot) => {
          let score = 0;
          if (likedSpots.includes(spot.id)) score += 3;
          if (savedSpots.includes(spot.id)) score += 2;
          if (spot.name) score += 1;
          if (spot.photos && spot.photos.length > 0) score += 1;
          return { spot, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((item) => item.spot);
      
      scored.forEach((spot) => usedSpotIds.add(spot.id));
      return scored;
    };


    // 5. Maybe You Like (global featured spots)
    const getMaybeYouLikeSpots = (): Spot[] => {
      const featuredGems = getFeaturedSpots(
        spots.filter((spot) => !usedSpotIds.has(spot.id)),
        likedSpots,
        savedSpots,
        10
      );
      const maybeYouLike = featuredGems.map((gem) => gem.spot);
      
      maybeYouLike.forEach((spot) => usedSpotIds.add(spot.id));
      return maybeYouLike;
    };

    // 6. New spots (global recent spots)
    const getNewSpots = (): Spot[] => {
      const recentGems = getRecentSpots(
        spots.filter((spot) => !usedSpotIds.has(spot.id)),
        10
      );
      const newSpots = recentGems.map((gem) => gem.spot);
      
      newSpots.forEach((spot) => usedSpotIds.add(spot.id));
      return newSpots;
    };

    return {
      nearby: getNearbySpots(),
      forYou: getForYouSpots(),
      recommended: getRecommendedSpots(),
      maybeYouLike: getMaybeYouLikeSpots(),
      new: getNewSpots(),
    };
  };

  // Organize flows by proximity
  const getNearbyPaths = (): Flow[] => {
    const location = currentLocation;
    if (!location) {
      // Sin ubicación: filtrar solo flows completos
      return paths.filter((path) => isFlowComplete(path, spots));
    }
    
    // Sort flows by distance to first spot, filtrando flows incompletos
    return paths
      .map((path) => {
        const pathSpots = path.spots
          .map((spotId) => spots.find((s) => s.id === spotId))
          .filter((s): s is Spot => s !== undefined);
        
        if (pathSpots.length === 0) return { path, distance: Infinity, isComplete: false };
        
        const firstSpotDistance = calculateDistanceToSpot(location, pathSpots[0].location) || Infinity;
        const isComplete = isFlowComplete(path, spots);
        return { path, distance: firstSpotDistance, isComplete };
      })
      .filter((item) => item.isComplete) // Solo flows completos
      .sort((a, b) => a.distance - b.distance)
      .map((item) => item.path);
  };

  // Render skeleton para slider horizontal de spots
  const renderSpotSliderSkeleton = () => {
    return (
      <View style={styles.sliderContent}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={[styles.sliderCard, { width: CARD_WIDTH }]}>
            <SkeletonCard size="large" />
          </View>
        ))}
      </View>
    );
  };

  // Render horizontal slider of spots (full card - variant="large")
  const renderSpotSlider = (title: string, spots: Spot[]) => {
    // Durante refresh con datos existentes, mostrar contenido (no skeleton)
    const showSkeleton = shouldShowSkeleton(isLoading && !isRefreshing, spots.length > 0);
    return (
      <View style={styles.section}>
        <SectionHeader title={title} variant="large" />
        {showSkeleton ? (
          renderSpotSliderSkeleton()
        ) : spots.length > 0 ? (
          <FlatList
            data={spots}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sliderContent}
            keyExtractor={(item) => item.id}
            windowSize={5}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            removeClippedSubviews={true}
            renderItem={({ item: spot }) => {
              const distance = calculateDistanceToSpot(currentLocation, spot.location);
              return (
                <View style={[styles.sliderCard, { width: CARD_WIDTH }]}>
                  <SpotMediaCard
                    spot={spot}
                    size="large"
                    distance={distance || undefined}
                    onPress={() => handleSpotPress(spot)}
                  />
                </View>
              );
            }}
            snapToInterval={CARD_WIDTH + spacing.sm}
            decelerationRate="fast"
            pagingEnabled={false}
          />
        ) : null}
      </View>
    );
  };

  // Render skeleton para slider compacto de spots
  const renderSpotSliderCompactSkeleton = () => {
    return (
      <View style={styles.sliderContent}>
        {Array.from({ length: 4 }).map((_, index) => (
          <View key={index} style={{ width: 160, marginRight: spacing.sm }}>
            <SkeletonCard size="small" />
          </View>
        ))}
      </View>
    );
  };

  // Render horizontal slider of compact spots (small card - variant="small")
  const renderSpotSliderCompact = (title: string, spots: Spot[]) => {
    // Durante refresh con datos existentes, mostrar contenido (no skeleton)
    const showSkeleton = shouldShowSkeleton(isLoading && !isRefreshing, spots.length > 0);
    return (
      <View style={styles.section}>
        <SectionHeader title={title} variant="small" />
        {showSkeleton ? (
          renderSpotSliderCompactSkeleton()
        ) : spots.length > 0 ? (
          <FlatList
            data={spots}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sliderContent}
            keyExtractor={(item) => item.id}
            windowSize={5}
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            removeClippedSubviews={true}
            renderItem={({ item: spot }) => {
              const distance = calculateDistanceToSpot(currentLocation, spot.location);
              return (
                <View style={{ width: 160, marginRight: spacing.sm }}>
                  <SpotMediaCard
                    spot={spot}
                    size="small"
                    distance={distance || undefined}
                    onPress={() => handleSpotPress(spot)}
                  />
                </View>
              );
            }}
            snapToInterval={160 + spacing.sm}
            decelerationRate="fast"
            pagingEnabled={false}
          />
        ) : null}
      </View>
    );
  };

  // Render skeleton para lista de flows
  const renderPathsListSkeleton = () => {
    return (
      <View style={styles.pathsList}>
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonCard key={index} size="medium" showImage={false} />
        ))}
      </View>
    );
  };

  // Render flows list
  const renderPathsList = (title: string, paths: Flow[]) => {
    // Durante refresh con datos existentes, mostrar contenido (no skeleton)
    const showSkeleton = shouldShowSkeleton(isLoading && !isRefreshing, paths.length > 0);
    return (
      <View style={styles.section}>
        <SectionHeader title={title} variant="large" />
        <Text style={[textStyles.caption, { color: colors.icon, marginTop: 0, marginBottom: spacing.md, paddingHorizontal: spacing.md }]}>
          Curated flows connecting multiple spots
        </Text>
        {showSkeleton ? (
          renderPathsListSkeleton()
        ) : paths.length > 0 ? (
          <View style={styles.pathsList}>
            {paths.map((path) => {
              const distance = calculateDistanceToSpot(
                currentLocation,
                spots.find((s) => s.id === path.spots[0])?.location || { latitude: 0, longitude: 0 }
              );
              return (
                <FlowCard.Display
                  key={path.id}
                  flow={path}
                  spots={spots}
                  distance={distance || undefined}
                  onPress={() => {
                    router.push(`/flow-detail?id=${path.id}`);
                  }}
                />
              );
            })}
          </View>
        ) : null}
      </View>
    );
  };

  // Render Explore content con skeleton
  const renderExplore = () => {
    const filteredSpots = getFilteredSpotsByPriority();
    const nearbySpots = filteredSpots.nearby;
    const forYouSpots = filteredSpots.forYou;
    const recommendedSpots = filteredSpots.recommended;
    const maybeYouLikeSpots = filteredSpots.maybeYouLike;
    const newSpots = filteredSpots.new;
    const nearbyPaths = getNearbyPaths();

    // Verificar si hay contenido para mostrar
    const hasContent =
      nearbySpots.length > 0 ||
      recommendedSpots.length > 0 ||
      forYouSpots.length > 0 ||
      maybeYouLikeSpots.length > 0 ||
      newSpots.length > 0 ||
      nearbyPaths.length > 0;

    // Durante refresh, mantener contenido visible si hay datos (no mostrar skeleton)
    const effectiveIsLoading = isLoading && !isRefreshing;
    return renderContentSkeletonOrEmpty(
      effectiveIsLoading,
      hasContent,
      () => (
        <View style={styles.exploreContent}>
          {/* Sliders de spots (card completa) */}
          {nearbySpots.length > 0 && renderSpotSlider('Nearby - Spots', nearbySpots)}
          {forYouSpots.length > 0 && renderSpotSlider('For You - Spots', forYouSpots)}
          {recommendedSpots.length > 0 && renderSpotSlider('Recommended - Spots', recommendedSpots)}

          {/* Sliders de spots compactos (card pequeña - menor jerarquía) */}
          {maybeYouLikeSpots.length > 0 && renderSpotSliderCompact('Maybe You Like - Spots', maybeYouLikeSpots)}
          {newSpots.length > 0 && renderSpotSliderCompact('New - Spots', newSpots)}

          {/* Listados de flows */}
          {nearbyPaths.length > 0 && renderPathsList('Nearby - Flows', nearbyPaths)}
        </View>
      ),
      () => (
        <View style={styles.exploreContent}>
          {/* Skeleton para sliders principales */}
          <View style={styles.section}>
            <SectionHeader title="Nearby - Spots" variant="large" />
            {renderSpotSliderSkeleton()}
          </View>
          <View style={styles.section}>
            <SectionHeader title="For You - Spots" variant="large" />
            {renderSpotSliderSkeleton()}
          </View>
          {/* Skeleton para lista de flows */}
          <View style={styles.section}>
            <SectionHeader title="Nearby - Flows" variant="large" />
            {renderPathsListSkeleton()}
          </View>
        </View>
      ),
      () => (
        <View style={styles.emptyState}>
          <Icon name="map" size={48} color={colors.icon + '60'} />
          <Text style={[textStyles.heading4, { color: colors.text, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xs }]}>
            Nothing nearby
          </Text>
          <Text style={[textStyles.body, { color: colors.icon, textAlign: 'center', marginBottom: spacing.lg }]}>
            Explore the map or mark a place
          </Text>
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/(tabs)/map')}
            activeOpacity={0.8}>
            <Icon name="map" size={20} color="#fff" />
            <Text style={[textStyles.bodyMedium, { color: '#fff', marginLeft: spacing.xs }]}>
              Explore map
            </Text>
          </TouchableOpacity>
        </View>
      )
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={async () => {
              setIsRefreshing(true);
              try {
                await Promise.all([refreshSpots(), refreshFlows()]);
              } catch (error) {
                console.error('Error refreshing:', error);
              } finally {
                setIsRefreshing(false);
              }
            }}
            tintColor={colors.tint}
          />
        }>
        {/* Header inside ScrollView (hides/shows with scroll) */}
        <ScreenHeader
          title="FLOWYA - Home"
          rightAction={{
            icon: 'profile',
            onPress: handleProfilePress,
          }}
          visible={isHeaderVisible}
        />

        {/* Location and Weather Header */}
        <LocationWeatherHeader
          userLocation={userLocation}
          selectedLocation={selectedLocation}
          onLocationChange={(location) => setSelectedLocation(location)}
          onResetLocation={() => setSelectedLocation(null)}
        />

        {/* Explore content */}
        {renderExplore()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  contentContainer: {
    paddingBottom: spacing['2xl'],
  },
  exploreContent: {
    paddingTop: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sliderContent: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.lg,
    paddingVertical: spacing.xs, // 8px - Allow shadows to show on cards
  },
  sliderCard: {
    marginRight: spacing.sm, // 16px
  },
  pathsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm, // 16px
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  scrollIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 1,
    pointerEvents: 'none',
  },
  scrollIndicatorLeft: {
    left: 0,
  },
  scrollIndicatorRight: {
    right: 0,
  },
});
