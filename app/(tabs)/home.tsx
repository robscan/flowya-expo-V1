/**
 * Home Screen - Versión Estable y Canónica
 * 
 * Arquitectura estable:
 * - Preparación de datos: Fuera del render, memoizada, estable por referencia
 * - Carga de datos: Un solo punto, un solo estado hasLoadedOnce
 * - Render: Solo visualización, sin lógica pesada ni decisiones
 * 
 * Principios:
 * - El contenido no se recarga al hacer scroll
 * - Los skeletons solo aparecen en la carga inicial
 * - Los datos no cambian por referencia si no cambian semánticamente
 * - El render es "tonto" y sin lógica pesada
 * - React no tiene motivos para re-renderizar innecesariamente
 */

import { useFocusEffect, useRouter } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

import { FlowCard } from '@/components/FlowCard';
import { SpotMediaCard } from '@/components/SpotMediaCard';
import { Icon } from '@/components/ui/Icon';
import { RegionHeader } from '@/components/ui/RegionHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { textStyles } from '@/constants/typography';
import { useOverlay } from '@/contexts/OverlayContext';
import { usePath } from '@/contexts/PathContext';
import { useRegion } from '@/contexts/RegionContext';
import { useSaved } from '@/contexts/SavedContext';
import { useSpot } from '@/contexts/SpotContext';
import { useWorldSpots } from '@/contexts/WorldSpotContext';
import { combineSpots, UnifiedSpot } from '@/utils/worldSpotHelpers';
import { Flow } from '@/data/flows';
import { Spot } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useScrollVisibility } from '@/hooks/use-scroll-visibility';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import {
    emptyHomeData,
    prepareHomeData,
    type FlowWithDistance,
    type SpotWithDistance
} from '@/utils/dataPreparation';
import { anyLoading } from '@/utils/loadingHelpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.75, 400);
const COMPACT_CARD_WIDTH = 160;

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================
// Tipos importados desde utils/dataPreparation.ts

// ============================================================================
// COMPONENTES DE SECCIONES MEMOIZADOS
// ============================================================================

interface SpotSliderProps {
  title: string;
  spots: SpotWithDistance[];
  onSpotPress: (spot: Spot) => void;
}

const SpotSlider = memo(function SpotSlider({ title, spots, onSpotPress }: SpotSliderProps) {
  const keyExtractor = useCallback((item: SpotWithDistance) => item.spot.id, []);
  
  const renderItem = useCallback(({ item }: { item: SpotWithDistance }) => {
    return (
      <View style={[styles.sliderCard, { width: CARD_WIDTH }]}>
        <SpotMediaCard
          spot={item.spot}
          size="large"
          distance={item.distance}
          onPress={() => onSpotPress(item.spot)}
        />
      </View>
    );
  }, [onSpotPress]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: CARD_WIDTH + spacing.sm,
    offset: (CARD_WIDTH + spacing.sm) * index,
    index,
  }), []);

  if (spots.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} variant="large" />
      <FlatList
        data={spots}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sliderContent}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        // SCOPE 8.1: Lazy load real - solo renderizar lo visible + buffer pequeño
        windowSize={5}
        initialNumToRender={3}
        maxToRenderPerBatch={2}
        removeClippedSubviews={Platform.OS !== 'web'}
        snapToInterval={CARD_WIDTH + spacing.sm}
        decelerationRate="fast"
        pagingEnabled={false}
      />
    </View>
  );
});

interface SpotSliderCompactProps {
  title: string;
  spots: SpotWithDistance[];
  onSpotPress: (spot: Spot) => void;
}

const SpotSliderCompact = memo(function SpotSliderCompact({ title, spots, onSpotPress }: SpotSliderCompactProps) {
  const keyExtractor = useCallback((item: SpotWithDistance) => item.spot.id, []);
  
  const renderItem = useCallback(({ item }: { item: SpotWithDistance }) => {
    return (
      <View style={{ width: COMPACT_CARD_WIDTH, marginRight: spacing.sm }}>
        <SpotMediaCard
          spot={item.spot}
          size="small"
          distance={item.distance}
          onPress={() => onSpotPress(item.spot)}
        />
      </View>
    );
  }, [onSpotPress]);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: COMPACT_CARD_WIDTH + spacing.sm,
    offset: (COMPACT_CARD_WIDTH + spacing.sm) * index,
    index,
  }), []);

  if (spots.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} variant="small" />
      <FlatList
        data={spots}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sliderContent}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        // SCOPE 8.1: Lazy load real - solo renderizar lo visible + buffer pequeño
        windowSize={5}
        initialNumToRender={4}
        maxToRenderPerBatch={2}
        removeClippedSubviews={Platform.OS !== 'web'}
        snapToInterval={COMPACT_CARD_WIDTH + spacing.sm}
        decelerationRate="fast"
        pagingEnabled={false}
      />
    </View>
  );
});

interface FlowListProps {
  title: string;
  flows: FlowWithDistance[];
  spots: Spot[];
  onFlowPress: (flow: Flow) => void;
}

const FlowList = memo(function FlowList({ title, flows, spots, onFlowPress }: FlowListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (flows.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title={title} variant="large" />
      <Text style={[textStyles.caption, { color: colors.icon, marginTop: 0, marginBottom: spacing.md, paddingHorizontal: spacing.md }]}>
        Curated flows connecting multiple spots
      </Text>
      <View style={styles.pathsList}>
        {flows.map((item) => (
          <FlowCard.Display
            key={item.flow.id}
            flow={item.flow}
            spots={spots}
            distance={item.distance}
            onPress={() => onFlowPress(item.flow)}
          />
        ))}
      </View>
    </View>
  );
});

// ============================================================================
// COMPONENTES DE SKELETON Y EMPTY STATE
// ============================================================================

interface HomeSkeletonProps {
  colors: typeof Colors.light | typeof Colors.dark;
}

function HomeSkeleton({ colors }: HomeSkeletonProps) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerSpacer} />
      <View style={styles.exploreContent}>
        {/* Skeleton para sliders principales */}
        <View style={styles.section}>
          <SectionHeader title="Nearby - Spots" variant="large" />
          <View style={styles.sliderContent}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={[styles.sliderCard, { width: CARD_WIDTH }]}>
                <SkeletonCard size="large" />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <SectionHeader title="For You - Spots" variant="large" />
          <View style={styles.sliderContent}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View key={index} style={[styles.sliderCard, { width: CARD_WIDTH }]}>
                <SkeletonCard size="large" />
              </View>
            ))}
          </View>
        </View>
        {/* Skeleton para lista de flows */}
        <View style={styles.section}>
          <SectionHeader title="Nearby - Flows" variant="large" />
          <View style={styles.pathsList}>
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} size="medium" showImage={false} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

interface HomeEmptyStateProps {
  colors: typeof Colors.light | typeof Colors.dark;
  selectedRegionLabel: string | null;
  onAddSpot: () => void;
  onExploreMap: () => void;
}

function HomeEmptyState({ colors, selectedRegionLabel, onAddSpot, onExploreMap }: HomeEmptyStateProps) {
  const hasRegion = selectedRegionLabel !== null;
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerSpacer} />
      <View style={styles.emptyState}>
        <Icon name={hasRegion ? "map" : "map"} size={48} color={colors.icon + '60'} />
        <Text style={[textStyles.heading4, { color: colors.text, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.xs }]}>
          {hasRegion ? `No spots in ${selectedRegionLabel}` : 'Nothing nearby'}
        </Text>
        <Text style={[textStyles.body, { color: colors.icon, textAlign: 'center', marginBottom: spacing.lg }]}>
          {hasRegion ? 'Be the first to add a spot in this region' : 'Explore the map or mark a place'}
        </Text>
        <TouchableOpacity
          style={[styles.emptyStateButton, { backgroundColor: colors.tint }]}
          onPress={onAddSpot}
          activeOpacity={0.8}>
          <Icon name="plus" size={20} color="#fff" />
          <Text style={[textStyles.bodyMedium, { color: '#fff', marginLeft: spacing.xs }]}>
            Add a new spot
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { setIsTabBarVisible } = useOverlay();
  const colors = Colors[colorScheme ?? 'light'];
  
  // Estados
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Hooks de datos
  const { spots, isLoading: isLoadingSpots, refreshSpots } = useSpot();
  const { worldSpots, isLoading: isLoadingWorldSpots } = useWorldSpots();
  const { paths, isLoading: isLoadingPaths, refreshFlows } = usePath();
  const { isSpotPinned } = useSaved(); // V1.2: Sistema de Pins
  const { selectedRegionId, currentRegionLabel: contextRegionLabel, setSelectedRegionId, setCurrentLocation, isCurrentLocation } = useRegion();
  
  // FASE 7: Combinar UserSpots y WorldSpots
  const allSpots: UnifiedSpot[] = combineSpots(spots, worldSpots);
  
  // Ubicación base estable
  const { baseLocation } = useBaseLocation();
  
  // V1.2: Snapshot de isSpotPinned para evitar re-filtrado inmediato
  // El snapshot se actualiza solo en: carga inicial, refresh, o reentrar a la vista
  const pinnedSnapshotRef = useRef<Set<string>>(new Set());
  const updatePinnedSnapshot = useCallback(() => {
    // Capturar estado actual de todos los spots pinned
    const pinnedSet = new Set<string>();
    allSpots.forEach((spot) => {
      if (isSpotPinned(spot.id)) {
        pinnedSet.add(spot.id);
      }
    });
    pinnedSnapshotRef.current = pinnedSet;
  }, [allSpots, isSpotPinned]);
  
  // Función wrapper que usa el snapshot en lugar de la función actual
  const isSpotPinnedSnapshot = useCallback((spotId: string): boolean => {
    return pinnedSnapshotRef.current.has(spotId);
  }, []);
  
  // Scroll visibility
  const { isHeaderVisible, isBottomNavVisible, handleScroll } = useScrollVisibility({ 
    threshold: 24 
  });

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  // Combinar estados de carga (ubicación es opcional, no bloquea)
  // FASE 7: Incluir isLoadingWorldSpots en el estado de carga
  const isLoading = anyLoading(isLoadingSpots, isLoadingWorldSpots, isLoadingPaths);

  // Marcar hasLoadedOnce cuando los datos estén listos (no cargando)
  // Nota: No esperamos a ubicación porque es opcional (puede ser null)
  useEffect(() => {
    if (!isLoading && !hasLoadedOnce) {
      setHasLoadedOnce(true);
      // V1.2: Capturar snapshot inicial de Pins
      updatePinnedSnapshot();
    }
  }, [isLoading, hasLoadedOnce, updatePinnedSnapshot]);

  // V1.2: Actualizar snapshot al reentrar a la vista
  useFocusEffect(
    useCallback(() => {
      if (hasLoadedOnce) {
        updatePinnedSnapshot();
      }
    }, [hasLoadedOnce, updatePinnedSnapshot])
  );

  // Preparación de datos memoizada (usando regionId canónico)
  // V1.2: Usar snapshot de isSpotPinned para evitar re-filtrado inmediato
  const homeData = useMemo(() => {
    if (!hasLoadedOnce) return emptyHomeData;
    // FASE 7: Usar allSpots (UserSpots + WorldSpots)
    // V1.2: Usar snapshot de Pins en lugar de función actual (evita re-filtrado inmediato)
    return prepareHomeData(allSpots, paths, baseLocation, isSpotPinnedSnapshot, selectedRegionId);
  }, [hasLoadedOnce, allSpots, paths, baseLocation, isSpotPinnedSnapshot, selectedRegionId]);

  // Handlers memoizados
  const handleSpotPress = useCallback((spot: Spot) => {
    router.push(`/spot-detail?id=${spot.id}`);
  }, [router]);

  const handleFlowPress = useCallback((flow: Flow) => {
    router.push(`/flow-detail?id=${flow.id}`);
  }, [router]);

  const handleProfilePress = useCallback(() => {
    router.push('/(tabs)/profile');
  }, [router]);

  const handleExploreMap = useCallback(() => {
    router.push('/(tabs)/map');
  }, [router]);

  const handleAddSpot = useCallback(() => {
    router.push('/create-spot');
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshSpots(), refreshFlows()]);
      // V1.2: Actualizar snapshot de Pins al hacer refresh
      updatePinnedSnapshot();
      // NO resetear hasLoadedOnce, solo refrescar datos
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshSpots, refreshFlows]);

  // Sincronizar tab bar visibility
  const lastBottomNavVisibleRef = useRef(isBottomNavVisible);
  useEffect(() => {
    if (lastBottomNavVisibleRef.current !== isBottomNavVisible) {
      lastBottomNavVisibleRef.current = isBottomNavVisible;
      setIsTabBarVisible(isBottomNavVisible);
    }
  }, [isBottomNavVisible, setIsTabBarVisible]);

  // Validar que selectedRegionId existe en availableRegions
  // CANONICAL: Asegura que el regionId seleccionado siempre sea válido y exista en regiones disponibles
  // IMPORTANTE: No validar si está en modo "Current location" (región dinámica puede no existir en spots aún)
  useEffect(() => {
    if (!isCurrentLocation && selectedRegionId && homeData.availableRegions.length > 0) {
      const exists = homeData.availableRegions.some(
        r => r.regionId === selectedRegionId
      );
      
      if (!exists) {
        // regionId seleccionado no existe en disponibles → resetear (solo si no es "Current location")
        setSelectedRegionId(null);
      }
    }
  }, [isCurrentLocation, selectedRegionId, homeData.availableRegions, setSelectedRegionId]);
  
  // Obtener label de la región seleccionada para UI
  // IMPORTANTE: Si está en modo "Current location", usar label desde RegionContext (resuelto dinámicamente)
  // Si no, buscar en availableRegions (región manual)
  const selectedRegionLabel = useMemo(() => {
    // Si está en modo "Current location", usar label desde RegionContext (siempre actualizado)
    if (isCurrentLocation && contextRegionLabel) {
      return contextRegionLabel;
    }
    // Si no hay regionId, retornar null
    if (!selectedRegionId) return null;
    // Buscar label en availableRegions (región manual)
    const region = homeData.availableRegions.find(r => r.regionId === selectedRegionId);
    return region?.label || null;
  }, [isCurrentLocation, contextRegionLabel, selectedRegionId, homeData.availableRegions]);

  // Verificar si hay contenido
  const hasContent = useMemo(() => {
    return (
      homeData.nearbySpots.length > 0 ||
      homeData.forYouSpots.length > 0 ||
      homeData.recommendedSpots.length > 0 ||
      homeData.maybeYouLikeSpots.length > 0 ||
      homeData.newSpots.length > 0 ||
      homeData.nearbyFlows.length > 0
    );
  }, [homeData]);

  // V1.3: Precargar imágenes críticas (primeras 6-10 spots visibles)
  const criticalSpots = useMemo(() => {
    // Obtener los primeros spots de las secciones más importantes
    const spots: Spot[] = [];
    
    // Nearby spots (más importantes)
    spots.push(...homeData.nearbySpots.slice(0, 3).map(s => s.spot));
    
    // For You spots
    if (spots.length < 6) {
      spots.push(...homeData.forYouSpots.slice(0, 3).map(s => s.spot));
    }
    
    // Recommended spots (si aún no tenemos 6)
    if (spots.length < 6) {
      spots.push(...homeData.recommendedSpots.slice(0, 6 - spots.length).map(s => s.spot));
    }
    
    return spots.slice(0, 6); // Máximo 6 imágenes
  }, [homeData]);

  // Precargar imágenes críticas
  useImagePreloader({
    spots: criticalSpots,
    count: 6,
  });

  // Render "tonto"
  // Si no ha cargado nunca: mostrar skeleton global
  if (!hasLoadedOnce) {
    return <HomeSkeleton colors={colors} />;
  }

  // Si ha cargado pero no hay contenido: mostrar empty state
  if (!hasContent) {
    return (
      <>
        <RegionHeader
          currentRegionLabel={selectedRegionLabel}
          currentRegionId={selectedRegionId}
          isCurrentLocation={isCurrentLocation}
          availableRegions={homeData.availableRegions}
          onRegionSelect={setSelectedRegionId}
          onCurrentLocationSelect={setCurrentLocation}
          rightAction={{
            icon: 'profile',
            onPress: handleProfilePress,
          }}
          visible={isHeaderVisible}
          absolute
        />
        <HomeEmptyState
          colors={colors}
          selectedRegionLabel={selectedRegionLabel}
          onAddSpot={handleAddSpot}
          onExploreMap={handleExploreMap}
        />
      </>
    );
  }

  // Si hay contenido: renderizar secciones
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <RegionHeader
        currentRegionLabel={selectedRegionLabel}
        currentRegionId={selectedRegionId}
        isCurrentLocation={isCurrentLocation}
        availableRegions={homeData.availableRegions}
        onRegionSelect={setSelectedRegionId}
        onCurrentLocationSelect={setCurrentLocation}
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
            onRefresh={handleRefresh}
            tintColor={colors.tint}
          />
        }>
        <View style={styles.headerSpacer} />

        <View style={styles.exploreContent}>
          {/* Sliders de spots (card completa) */}
          <SpotSlider
            title="Nearby - Spots"
            spots={homeData.nearbySpots}
            onSpotPress={handleSpotPress}
          />
          <SpotSlider
            title="For You - Spots"
            spots={homeData.forYouSpots}
            onSpotPress={handleSpotPress}
          />
          <SpotSlider
            title="Recommended - Spots"
            spots={homeData.recommendedSpots}
            onSpotPress={handleSpotPress}
          />

          {/* Sliders de spots compactos (card pequeña) */}
          <SpotSliderCompact
            title="Maybe You Like - Spots"
            spots={homeData.maybeYouLikeSpots}
            onSpotPress={handleSpotPress}
          />
          <SpotSliderCompact
            title="New - Spots"
            spots={homeData.newSpots}
            onSpotPress={handleSpotPress}
          />

          {/* Listados de flows */}
          <FlowList
            title="Nearby - Flows"
            flows={homeData.nearbyFlows}
            spots={spots}
            onFlowPress={handleFlowPress}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================

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
  headerSpacer: {
    height: 70,
    marginBottom: spacing.sm,
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
    paddingVertical: spacing.xs,
  },
  sliderCard: {
    marginRight: spacing.sm,
  },
  pathsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
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
});
