/**
 * Pinned Screen
 * Scope 1: Pinned tab canónico (Pins del usuario)
 */

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { SpotGrid } from '@/components/SpotGrid';
import { Icon } from '@/components/ui/Icon';
import { PinStateFilter, PinStateFilterType } from '@/components/ui/PinStateFilter';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SkeletonList } from '@/components/ui/SkeletonList';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useOverlay } from '@/contexts/OverlayContext';
import { PinState, useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useScrollVisibility } from '@/hooks/use-scroll-visibility';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { useSpotsWithDistance } from '@/hooks/useSpotsWithDistance';
import { anyLoading, renderContentSkeletonOrEmpty, shouldShowSkeleton } from '@/utils/loadingHelpers';

export default function PinnedScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const { setIsTabBarVisible } = useOverlay();
  const { baseLocation } = useBaseLocation();
  const { isHeaderVisible, isBottomNavVisible, handleScroll } = useScrollVisibility({ threshold: 24 });
  const { spots, isLoading: isLoadingSpots, refreshSpots } = useSpot();
  const { getPinnedSpots, isLoading: isLoadingSaved } = useSaved();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pinStateFilter, setPinStateFilter] = useState<PinStateFilterType>('all');

  const isLoading = anyLoading(isLoadingSpots, isLoadingSaved);

  const pinnedSpotIds = useMemo(() => {
    const state: PinState | undefined = pinStateFilter === 'all' ? undefined : pinStateFilter;
    return getPinnedSpots(state);
  }, [getPinnedSpots, pinStateFilter]);

  const pinnedSpots = useMemo(() => {
    return spots.filter((spot) => pinnedSpotIds.includes(spot.id));
  }, [spots, pinnedSpotIds]);

  const pinnedSpotsWithDistance = useSpotsWithDistance(pinnedSpots, baseLocation);

  const lastBottomNavVisibleRef = useRef(isBottomNavVisible);
  useEffect(() => {
    if (lastBottomNavVisibleRef.current !== isBottomNavVisible) {
      lastBottomNavVisibleRef.current = isBottomNavVisible;
      setIsTabBarVisible(isBottomNavVisible);
    }
  }, [isBottomNavVisible, setIsTabBarVisible]);

  const handleProfilePress = useCallback(() => {
    router.push('/(tabs)/profile');
  }, [router]);

  const handleSpotPress = useCallback((spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
  }, [router]);

  const renderSpotGrid = useCallback(() => {
    const showSkeleton = shouldShowSkeleton(isLoading && !isRefreshing, pinnedSpotsWithDistance.length > 0);
    if (showSkeleton) {
      return (
        <SkeletonList
          count={6}
          layout="grid"
          variant="card"
          cardProps={{ size: 'small' }}
          style={styles.gridContent}
        />
      );
    }

    return (
      <SpotGrid
        spots={pinnedSpotsWithDistance}
        onSpotPress={handleSpotPress}
      />
    );
  }, [isLoading, isRefreshing, pinnedSpotsWithDistance, handleSpotPress]);

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <Icon name="pin" size={48} color={colors.icon} />
        <Text style={[textStyles.heading3, { color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs }]}>
          Aun no tienes pines
        </Text>
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg, textAlign: 'center' }]}>
          Guarda spots para verlos aqui cuando los necesites
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/home')}
          style={[styles.emptyStateButton, { backgroundColor: colors.tint }]}
          activeOpacity={0.8}>
          <Text style={[textStyles.bodyMedium, { color: '#fff' }]}>Explorar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = () => {
    const effectiveIsLoading = isLoading && !isRefreshing;
    return renderContentSkeletonOrEmpty(
      effectiveIsLoading,
      pinnedSpotsWithDistance.length > 0,
      () => (
        <View style={styles.section}>
          {renderSpotGrid()}
        </View>
      ),
      () => (
        <View style={styles.section}>
          {renderSpotGrid()}
        </View>
      ),
      renderEmptyState
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Pines"
        rightAction={{ icon: 'profile', onPress: handleProfilePress }}
        visible={isHeaderVisible}
        absolute
      />

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
              await refreshSpots();
              setIsRefreshing(false);
            }}
            tintColor={colors.tint}
          />
        }>
        <View style={styles.headerSpacer} />

        <PinStateFilter
          currentFilter={pinStateFilter}
          onFilterChange={setPinStateFilter}
        />

        {renderContent()}
      </ScrollView>
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
  headerSpacer: {
    height: 70,
    marginBottom: spacing.sm,
  },
  section: {
    paddingTop: spacing.md,
    marginBottom: spacing.xl,
  },
  gridContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
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
});
