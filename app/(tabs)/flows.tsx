/**
 * Flows Screen
 * Scope 1: Flows tab canónico (Flows guardados)
 */

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, RefreshControl, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FlowCard } from '@/components/FlowCard';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { useOverlay } from '@/contexts/OverlayContext';
import { usePath } from '@/contexts/PathContext';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { Flow } from '@/data/flows';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useScrollVisibility } from '@/hooks/use-scroll-visibility';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { getSpotDistance } from '@/hooks/useSpotDistance';
import { anyLoading, renderContentSkeletonOrEmpty, shouldShowSkeleton } from '@/utils/loadingHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 400);

export default function FlowsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  const { setIsTabBarVisible } = useOverlay();
  const { baseLocation } = useBaseLocation();
  const { isHeaderVisible, isBottomNavVisible, handleScroll } = useScrollVisibility({ threshold: 24 });
  const { paths, isLoading: isLoadingPaths, refreshFlows } = usePath();
  const { spots, isLoading: isLoadingSpots, refreshSpots } = useSpot();
  const { savedPaths, getFlowCustomName, isLoading: isLoadingSaved } = useSaved();
  const { startFlow } = useFlow();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isLoading = anyLoading(isLoadingSpots, isLoadingPaths, isLoadingSaved);

  const savedFlows = useMemo(() => {
    return paths.filter((path) => savedPaths.includes(path.id));
  }, [paths, savedPaths]);

  const savedFlowsWithDistance = useMemo(() => {
    return savedFlows.map((flow) => {
      const firstSpot = spots.find((spot) => spot.id === flow.spots[0]);
      const distance = firstSpot ? getSpotDistance(firstSpot, baseLocation) : undefined;
      return { flow, distance };
    });
  }, [savedFlows, spots, baseLocation]);

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

  const handleShareFlows = useCallback(async () => {
    try {
      if (savedFlows.length === 0) {
        Alert.alert('No hay flows para compartir', 'No tienes flows guardados para compartir.');
        return;
      }

      const flowNames = savedFlows
        .map((flow) => {
          const customName = getFlowCustomName(flow.id);
          return customName || flow.title;
        })
        .join(', ');

      const flowUrls = savedFlows
        .map((flow) => `flowya.app/flow-detail?id=${flow.id}`)
        .join('\n');

      const shareUrl = 'flowya.app/flows';
      const shareMessage = `Mis flows guardados en FLOWYA:\n\n${flowNames}\n\n${flowUrls}\n\n${shareUrl}`;

      await Share.share({
        message: shareMessage,
        title: 'Mis flows guardados',
      });
    } catch (error) {
      console.error('Error sharing flows:', error);
      Alert.alert('Error', 'No se pudo compartir. Intenta nuevamente.');
    }
  }, [savedFlows, getFlowCustomName]);

  const renderFlowSlider = useCallback((flowsWithDistance: { flow: Flow; distance?: number }[]) => {
    const showSkeleton = shouldShowSkeleton(isLoading && !isRefreshing, flowsWithDistance.length > 0);
    if (showSkeleton) {
      return (
        <View style={styles.sliderContent}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={[styles.sliderCard, { width: CARD_WIDTH }]}>
              <SkeletonCard size="large" showImage={false} />
            </View>
          ))}
        </View>
      );
    }

    if (flowsWithDistance.length === 0) {
      return null;
    }

    const keyExtractor = (item: { flow: Flow; distance?: number }) => item.flow.id;
    const renderItem = ({ item }: { item: { flow: Flow; distance?: number } }) => (
      <View style={[styles.sliderCard, { width: CARD_WIDTH }]}>
        <FlowCard.Display
          flow={item.flow}
          spots={spots}
          distance={item.distance}
          customName={getFlowCustomName(item.flow.id)}
          onPress={() => startFlow(item.flow.id)}
        />
      </View>
    );

    return (
      <FlatList
        data={flowsWithDistance}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sliderContent}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        windowSize={21}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews={false}
        snapToInterval={CARD_WIDTH + spacing.sm}
        decelerationRate="fast"
        pagingEnabled={false}
      />
    );
  }, [isLoading, isRefreshing, spots, getFlowCustomName, startFlow]);

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <Icon name="explore" size={48} color={colors.icon} />
        <Text style={[textStyles.heading3, { color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs }]}>
          Aun no tienes flows guardados
        </Text>
        <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg, textAlign: 'center' }]}>
          Guarda flows para volver a ellos cuando quieras
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
      savedFlowsWithDistance.length > 0,
      () => (
        <View style={styles.section}>
          {renderFlowSlider(savedFlowsWithDistance)}
        </View>
      ),
      () => (
        <View style={styles.section}>
          {renderFlowSlider(savedFlowsWithDistance)}
        </View>
      ),
      renderEmptyState
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Flows"
        rightAction={
          savedFlows.length > 0
            ? { icon: 'share', onPress: handleShareFlows }
            : { icon: 'profile', onPress: handleProfilePress }
        }
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
              await Promise.all([refreshSpots(), refreshFlows()]);
              setIsRefreshing(false);
            }}
            tintColor={colors.tint}
          />
        }>
        <View style={styles.headerSpacer} />
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
  sliderContent: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.lg,
  },
  sliderCard: {
    marginRight: spacing.sm,
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
