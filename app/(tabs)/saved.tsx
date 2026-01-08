/**
 * Saved Screen
 * Scope 11: Saved Screen - Memoria personal del usuario
 * 
 * Principios de diseño:
 * - Header scrollable (igual que Home)
 * - Sliders horizontales de spots y flows guardados
 * - Cards con estilo glass
 */

import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

import { FlowCard } from '@/components/FlowCard';
import { SpotMediaCard } from '@/components/SpotMediaCard';
import { Icon } from '@/components/ui/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { Flow } from '@/data/flows';
import { Spot } from '@/data/spots';
import { useScrollVisibility } from '@/hooks/use-scroll-visibility';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { calculateDistanceToSpot } from '@/utils/distance';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 400); // 75% of screen width, max 400px for desktop


export default function SavedScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { setIsTabBarVisible } = useOverlay();
  const colors = Colors[colorScheme ?? 'light'];
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Centralized scroll visibility control
  const { isHeaderVisible, isBottomNavVisible, handleScroll } = useScrollVisibility({ threshold: 24 });

  const { spots, isLoading: spotsLoading, refreshSpots } = useSpot();
  const { paths, isLoading: pathsLoading, refreshFlows } = usePath();
  const { savedSpots, savedPaths, isLoading: savedLoading, getFlowCustomName } = useSaved();
  const { startFlow } = useFlow();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isLoading = spotsLoading || pathsLoading || savedLoading;

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Sync bottomNav visibility with hook state
  useEffect(() => {
    setIsTabBarVisible(isBottomNavVisible);
  }, [isBottomNavVisible, setIsTabBarVisible]);

  // Get user location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permissions denied');
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

  // Obtener spots y paths guardados
  const savedSpotsData = spots.filter((spot) => savedSpots.includes(spot.id));
  const savedPathsData = paths.filter((path) => savedPaths.includes(path.id));


  // Header con icono Profile
  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  // Manejar selección de Spot
  const handleSpotPress = (spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
  };

  // Render horizontal slider of spots
  const renderSpotSlider = (title: string, spots: Spot[]) => {
    if (spots.length === 0) return null;

    return (
      <View style={styles.section}>
        <SectionHeader title={title} variant="large" />
        <FlatList
          data={spots}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sliderContent}
          keyExtractor={(item) => item.id}
          renderItem={({ item: spot }) => {
            const distance = calculateDistanceToSpot(userLocation, spot.location);
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
      </View>
    );
  };

  // Render horizontal slider of paths
  const renderPathSlider = (title: string, paths: Flow[]) => {
    if (paths.length === 0) return null;

    return (
      <View style={styles.section}>
        <SectionHeader title={title} variant="large" />
        <FlatList
          data={paths}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sliderContent}
          keyExtractor={(item) => item.id}
          renderItem={({ item: path }) => {
            const distance = calculateDistanceToSpot(
              userLocation,
              spots.find((s) => s.id === path.spots[0])?.location || { latitude: 0, longitude: 0 }
            );
            return (
              <View style={[styles.sliderCard, { width: CARD_WIDTH }]}>
                <FlowCard.Display
                  flow={path}
                  spots={spots}
                  distance={distance || undefined}
                  customName={getFlowCustomName(path.id)}
                  onPress={() => startFlow(path.id)}
                />
              </View>
            );
          }}
          snapToInterval={CARD_WIDTH + spacing.sm}
          decelerationRate="fast"
          pagingEnabled={false}
        />
      </View>
    );
  };


  // Render empty state for Saved tab
  const renderSavedEmptyState = () => {
    if (savedSpotsData.length > 0 || savedPathsData.length > 0) return null;

    return (
      <View style={styles.emptyState}>
        <Icon name="bookmark" size={48} color={colors.icon} />
        <Text style={[textStyles.heading3, { color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs }]}>
          Nothing saved yet
        </Text>
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg, textAlign: 'center' }]}>
          Mark places and save flows to visit later
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/home')}
          style={[styles.emptyStateButton, { backgroundColor: colors.tint }]}
          activeOpacity={0.8}>
          <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Explore</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render content
  const renderContent = () => {
    const hasContent = savedSpotsData.length > 0 || savedPathsData.length > 0;
    return (
      <View style={styles.savedContent}>
        {hasContent ? (
          <>
            {renderSpotSlider('Saved places', savedSpotsData)}
            {renderPathSlider('Saved flows', savedPathsData)}
          </>
        ) : (
          renderSavedEmptyState()
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <View style={styles.loadingState}>
          <Text style={[textStyles.body, { color: colors.icon }]}>Loading...</Text>
        </View>
      ) : (
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
                await Promise.all([refreshSpots(), refreshFlows()]);
                setIsRefreshing(false);
              }}
              tintColor={colors.tint}
            />
          }>
          {/* Header inside ScrollView (hides/shows with scroll) */}
          <ScreenHeader
            title="Saved"
            rightAction={{
              icon: 'profile',
              onPress: handleProfilePress,
            }}
            visible={isHeaderVisible}
          />


          {/* Content */}
          {renderContent()}
        </ScrollView>
      )}

      {/* Spot Detail Sheet */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },
  savedContent: {
    // No paddingHorizontal - se aplica en SectionHeader, sliderContent y pathsList
  },
  section: {
    marginBottom: spacing.xl,
  },
  sliderContent: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.lg,
  },
  sliderCard: {
    marginRight: spacing.sm, // 16px
  },
  pathsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm, // 16px
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyStateButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
});
