/**
 * Saved Screen
 * Scope 11: Saved Screen - Memoria personal del usuario
 * 
 * Principios de diseño:
 * - Header scrollable (igual que Home)
 * - Sliders horizontales de spots y flows guardados
 * - Cards con estilo glass
 */

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

import { FlowCard } from '@/components/FlowCard';
import { SpotMediaCard } from '@/components/SpotMediaCard';
import { Icon } from '@/components/ui/Icon';
import { SavedFilterHeader, SavedFilterType } from '@/components/ui/SavedFilterHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { SkeletonList } from '@/components/ui/SkeletonList';
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
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useScrollVisibility } from '@/hooks/use-scroll-visibility';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { getSpotDistance } from '@/hooks/useSpotDistance';
import { useSpotsWithDistance } from '@/hooks/useSpotsWithDistance';
import { type SpotWithDistance } from '@/utils/dataPreparation';
import { anyLoading, renderContentSkeletonOrEmpty, shouldShowSkeleton } from '@/utils/loadingHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 400); // 75% of screen width, max 400px for desktop


export default function SavedScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { setIsTabBarVisible } = useOverlay();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Ubicación base estable
  const { baseLocation } = useBaseLocation();
  
  // Centralized scroll visibility control
  const { isHeaderVisible, isBottomNavVisible, handleScroll } = useScrollVisibility({ threshold: 24 });

  const { spots, isLoading: isLoadingSpots, refreshSpots } = useSpot();
  const { paths, isLoading: isLoadingPaths, refreshFlows } = usePath();
  const { savedSpots, savedPaths, getFlowCustomName, isLoading: isLoadingSaved } = useSaved();
  const { startFlow } = useFlow();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<SavedFilterType>('all');

  // Combinar estados de carga (cualquiera cargando)
  const isLoading = anyLoading(isLoadingSpots, isLoadingPaths, isLoadingSaved);
  const savedSpotsData = spots.filter((spot) => savedSpots.includes(spot.id));
  const savedPathsData = paths.filter((path) => savedPaths.includes(path.id));
  
  // Preparar datos con distancia (memoizado)
  const savedSpotsWithDistance = useSpotsWithDistance(savedSpotsData, baseLocation);
  
  // Preparar flows con distancia (memoizado)
  const savedFlowsWithDistance = useMemo(() => {
    return savedPathsData.map((flow) => {
      const firstSpot = spots.find((s) => s.id === flow.spots[0]);
      const distance = firstSpot ? getSpotDistance(firstSpot, baseLocation) : undefined;
      return { flow, distance };
    });
  }, [savedPathsData, spots, baseLocation]);

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // ARQUITECTÓNICO: Sincronizar solo cuando cambia el valor, usando useRef para evitar re-renders innecesarios
  const lastBottomNavVisibleRef = useRef(isBottomNavVisible);
  useEffect(() => {
    if (lastBottomNavVisibleRef.current !== isBottomNavVisible) {
      lastBottomNavVisibleRef.current = isBottomNavVisible;
      setIsTabBarVisible(isBottomNavVisible);
    }
  }, [isBottomNavVisible, setIsTabBarVisible]);

  // Header con icono Profile
  const handleProfilePress = useCallback(() => {
    router.push('/(tabs)/profile');
  }, [router]);

  // Render skeleton para grid de spots
  const renderSpotSliderSkeleton = () => {
    return (
      <SkeletonList
        count={6}
        layout="grid"
        variant="card"
        cardProps={{ size: 'small' }}
        style={styles.gridContent}
      />
    );
  };

  // Render skeleton para slider de paths
  const renderPathSliderSkeleton = () => {
    return (
      <View style={styles.sliderContent}>
        {Array.from({ length: 3 }).map((_, index) => (
          <View key={index} style={[styles.sliderCard, { width: CARD_WIDTH }]}>
            <SkeletonCard size="large" showImage={false} />
          </View>
        ))}
      </View>
    );
  };

  // Handlers memoizados
  const handleSpotPress = useCallback((spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
  }, [router]);

  // Render grid de spots (igual que Search)
  const renderSpotSlider = useCallback((title: string, spotsWithDistance: SpotWithDistance[], showTitle: boolean = false) => {
    // Durante refresh con datos existentes, mostrar contenido (no skeleton)
    const showSkeleton = shouldShowSkeleton(isLoading && !isRefreshing, spotsWithDistance.length > 0);
    
    const keyExtractor = (item: SpotWithDistance) => item.spot.id;
    
    const renderItem = ({ item }: { item: SpotWithDistance }) => {
      return (
        <View style={styles.gridItem}>
          <SpotMediaCard
            spot={item.spot}
            size="small"
            distance={item.distance}
            onPress={() => handleSpotPress(item.spot)}
          />
        </View>
      );
    };
    
    return (
      <View style={styles.section}>
        {showTitle && title && <SectionHeader title={title} variant="large" />}
        {showSkeleton ? (
          renderSpotSliderSkeleton()
        ) : spotsWithDistance.length > 0 ? (
          <FlatList
            data={spotsWithDistance}
            numColumns={2}
            keyExtractor={keyExtractor}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.gridContent}
            scrollEnabled={false}
            windowSize={21}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            removeClippedSubviews={false}
            renderItem={renderItem}
          />
        ) : null}
      </View>
    );
  }, [isLoading, isRefreshing, handleSpotPress]);

  // Render horizontal slider of paths
  const renderPathSlider = useCallback((title: string, flowsWithDistance: { flow: Flow; distance?: number }[], showTitle: boolean = false) => {
    // Durante refresh con datos existentes, mostrar contenido (no skeleton)
    const showSkeleton = shouldShowSkeleton(isLoading && !isRefreshing, flowsWithDistance.length > 0);
    
    const keyExtractor = (item: { flow: Flow; distance?: number }) => item.flow.id;
    
    const renderItem = ({ item }: { item: { flow: Flow; distance?: number } }) => {
      return (
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
    };
    
    return (
      <View style={styles.section}>
        {showTitle && title && <SectionHeader title={title} variant="large" />}
        {showSkeleton ? (
          renderPathSliderSkeleton()
        ) : flowsWithDistance.length > 0 ? (
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
        ) : null}
      </View>
    );
  }, [isLoading, isRefreshing, spots, getFlowCustomName, startFlow]);


  // Render empty state for Saved tab
  const renderSavedEmptyState = () => {
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

  // Render skeleton content
  const renderSkeletonContent = () => {
    return (
      <View style={styles.savedContent}>
        <View style={styles.section}>
          {renderSpotSliderSkeleton()}
        </View>
        <View style={styles.section}>
          {renderPathSliderSkeleton()}
        </View>
      </View>
    );
  };

  // Render content con filtrado
  const renderContent = () => {
    // Durante refresh, mantener contenido visible si hay datos (no mostrar skeleton)
    const effectiveIsLoading = isLoading && !isRefreshing;
    
    // Filtrar contenido según el filtro seleccionado
    const showSpots = currentFilter === 'spots' || currentFilter === 'all';
    const showFlows = currentFilter === 'flows' || currentFilter === 'all';
    const showTitles = currentFilter === 'all'; // Solo mostrar títulos en modo "All"
    
    // Verificar si hay datos según el filtro
    const hasFilteredData = 
      (showSpots && savedSpotsWithDistance.length > 0) ||
      (showFlows && savedFlowsWithDistance.length > 0);
    
    return renderContentSkeletonOrEmpty(
      effectiveIsLoading,
      hasFilteredData,
      () => (
        <View style={styles.savedContent}>
          {showSpots && savedSpotsWithDistance.length > 0 && 
            renderSpotSlider('Spots', savedSpotsWithDistance, showTitles)}
          {showFlows && savedFlowsWithDistance.length > 0 && 
            renderPathSlider('Flows', savedFlowsWithDistance, showTitles)}
        </View>
      ),
      renderSkeletonContent,
      renderSavedEmptyState
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header as absolute overlay (doesn't affect layout) */}
      <SavedFilterHeader
        currentFilter={currentFilter}
        onFilterSelect={setCurrentFilter}
        rightAction={{
          icon: 'profile',
          onPress: handleProfilePress,
        }}
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
          {/* Spacer for absolute header (prevents content from going under header) */}
          <View style={styles.headerSpacer} />

          {/* Content */}
          {renderContent()}
        </ScrollView>

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
  headerSpacer: {
    height: 70, // Altura aproximada del header (padding + text + border)
    marginBottom: spacing.sm,
  },
  savedContent: {
    paddingTop: spacing.md, // CANONICAL: Espacio superior consistente con Home
    // No paddingHorizontal - se aplica en SectionHeader, sliderContent y pathsList
  },
  section: {
    marginBottom: spacing.xl,
  },
  gridContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  gridRow: {
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  gridItem: {
    flex: 1,
    minWidth: 0,
    maxWidth: '50%',
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
