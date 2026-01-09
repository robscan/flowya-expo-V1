/**
 * Search Screen - CANONICAL IMPLEMENTATION
 * 
 * Rules:
 * - Minimal, fast, content-focused
 * - Search input replaces header title
 * - Single vertical scroll, no tabs, no map
 * - Suggested content when input is empty (same layout as results)
 * - Spots: 2-column grid, Flows: single-column list
 * - Add New Spot: secondary button after results
 */

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FlowCard } from '@/components/FlowCard';
import { SpotMediaCard } from '@/components/SpotMediaCard';
import { Icon } from '@/components/ui/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SkeletonList } from '@/components/ui/SkeletonList';
import { spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { fontFamilyMedium, textStyles } from '@/constants/typography';
import { useFlow } from '@/contexts/FlowContext';
import { usePath } from '@/contexts/PathContext';
import { useSpot } from '@/contexts/SpotContext';
import { Spot, SpotType } from '@/data/spots';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBaseLocation } from '@/hooks/useBaseLocation';
import { getSpotDistance } from '@/hooks/useSpotDistance';
import { anyLoading, shouldShowSkeleton } from '@/utils/loadingHelpers';
import { searchAll } from '@/utils/searchLogic';


export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [searchQuery, setSearchQuery] = useState('');

  // Ubicación base estable
  const { baseLocation } = useBaseLocation();

  const { spots, isLoading: isLoadingSpots } = useSpot();
  const { paths, isLoading: isLoadingPaths } = usePath();
  const { startFlow } = useFlow();

  // Combinar estados de carga para sugerencias iniciales
  const isLoading = anyLoading(isLoadingSpots, isLoadingPaths);



  // CANONICAL: Suggested/Nearby spots when input is empty (same layout as results)
  const suggestedSpotsWithDistance = useMemo(() => {
    // Show suggested spots when query is empty
    if (searchQuery.trim().length > 0) {
      return [];
    }
    
    let suggested: { spot: Spot; distance?: number }[] = [];
    
    if (baseLocation) {
      // Prioritize proximity and variety
      const spotsWithDistance = spots
        .map((spot) => {
          const distance = getSpotDistance(spot, baseLocation);
          return {
            spot,
            distance: distance !== undefined ? distance : Infinity,
          };
        })
        .sort((a, b) => a.distance - b.distance);
      
      // Select varied spots (different types)
      const usedTypes = new Set<SpotType>();
      for (const { spot, distance } of spotsWithDistance) {
        if (suggested.length >= 6) break;
        if (!usedTypes.has(spot.type) || suggested.length < 3) {
          suggested.push({ spot, distance: distance !== Infinity ? distance : undefined });
          usedTypes.add(spot.type);
        }
      }
      
      // If not enough, add more nearby
      if (suggested.length < 6) {
        for (const { spot, distance } of spotsWithDistance) {
          if (suggested.length >= 6) break;
          if (!suggested.find((s) => s.spot.id === spot.id)) {
            suggested.push({ spot, distance: distance !== Infinity ? distance : undefined });
          }
        }
      }
    } else {
      // No location: show varied spots
      const usedTypes = new Set<SpotType>();
      for (const spot of spots) {
        if (suggested.length >= 6) break;
        if (!usedTypes.has(spot.type) || suggested.length < 3) {
          suggested.push({ spot, distance: undefined });
          usedTypes.add(spot.type);
        }
      }
    }
    
    return suggested;
  }, [spots, baseLocation, searchQuery]);
  
  const suggestedSpots = useMemo(() => {
    return suggestedSpotsWithDistance.map(item => item.spot);
  }, [suggestedSpotsWithDistance]);

  // CANONICAL: Search results (only when query has 2+ characters)
  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 2) {
      return { spots: [], paths: [] };
    }
    
    const results = searchAll(spots, paths, searchQuery, {
      spotLimit: 20,
      pathLimit: 10,
    });
    
    // Add distance and sort by relevance + proximity
    if (baseLocation) {
      results.spots = results.spots
        .map((result) => {
          if (result.spot) {
            const distance = getSpotDistance(result.spot, baseLocation);
            return { ...result, distance };
          }
          return result;
        })
        .sort((a, b) => {
          // Prioritize relevance first, then distance as tie-breaker
          if (Math.abs(a.relevanceScore - b.relevanceScore) > 10) {
            return b.relevanceScore - a.relevanceScore;
          }
          const distA = a.distance || Infinity;
          const distB = b.distance || Infinity;
          return distA - distB;
        });
    } else {
      // No location: sort by relevance only
      results.spots.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
    
    return results;
  }, [searchQuery, spots, paths, baseLocation]);

  // CANONICAL: Determine what to show
  const hasQuery = searchQuery.trim().length >= 2;
  const hasResults = searchResults.spots.length > 0 || searchResults.paths.length > 0;
  const showResults = hasQuery && hasResults;
  const showNoResults = hasQuery && !hasResults;
  const showSuggested = !hasQuery && suggestedSpots.length > 0;


  // Manejar selección de Spot desde resultados o mapa
  const handleSpotPress = (spotOrId: Spot | string) => {
    const spotId = typeof spotOrId === 'string' ? spotOrId : spotOrId.id;
    router.push(`/spot-detail?id=${spotId}`);
  };

  // Manejar selección de Path desde resultados
  const handlePathPress = (pathId: string) => {
    startFlow(pathId);
  };

  // CANONICAL: Handle search input
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Manejar creación de Spot desde búsqueda
  const handleCreateSpotFromSearch = () => {
    // Usar ubicación base si está disponible, sino usar ubicación por defecto
    const location = baseLocation || {
        latitude: -12.0464,
        longitude: -77.0428,
    };
    router.push(`/create-spot?lat=${location.latitude}&lng=${location.longitude}`);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      {/* Contenido */}
      <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* CANONICAL: Search header with integrated input */}
          <SectionHeader
            variant="search"
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Search spots and flows"
            autoFocus={Platform.OS !== 'web'}
          />
          
          {/* CANONICAL: Search results header with count */}
          {showResults && (
            <View style={styles.searchResultsHeader}>
              <Text style={[textStyles.caption, { color: colors.icon, flex: 1, marginRight: spacing.sm }]}>
                {`Search results for "${searchQuery.trim()}"`}
              </Text>
              <View style={[styles.resultsBadge, { backgroundColor: colors.tint + '20' }]}>
                <Text style={[textStyles.caption, { color: colors.tint, fontFamily: fontFamilyMedium }]}>
                  {searchResults.spots.length + searchResults.paths.length} {searchResults.spots.length + searchResults.paths.length === 1 ? 'result' : 'results'}
                </Text>
              </View>
            </View>
          )}

          {/* CANONICAL: Search Results */}
          {showResults && (
            <>
              {/* Spots - 2-column grid */}
              {searchResults.spots.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Spots" variant="large" />
                  <FlatList
                    data={searchResults.spots as { type: 'spot'; spot: Spot; relevanceScore: number; distance?: number }[]}
                    numColumns={2}
                    keyExtractor={(item) => item.spot!.id}
                    columnWrapperStyle={styles.gridRow}
                    contentContainerStyle={styles.gridContent}
                    scrollEnabled={false}
                    windowSize={21}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    removeClippedSubviews={false}
                    renderItem={({ item: result }) => {
                      if (!result.spot) return null;
                      return (
                        <View style={styles.gridItem}>
                          <SpotMediaCard
                            spot={result.spot}
                            size="small"
                            distance={result.distance}
                            onPress={() => handleSpotPress(result.spot!)}
                          />
                        </View>
                      );
                    }}
                  />
                </View>
              )}

              {/* Flows - Single column list */}
              {searchResults.paths.length > 0 && (
                <View style={styles.section}>
                  <SectionHeader title="Flows" variant="large" />
                  <View style={styles.pathsList}>
                    {searchResults.paths.map((result) => {
                      if (!result.path) return null;
                      const pathSpots = result.path.spots
                        .map((spotId) => spots.find((s) => s.id === spotId))
                        .filter((s): s is Spot => s !== undefined);
                      const distance = pathSpots.length > 0
                        ? getSpotDistance(pathSpots[0], baseLocation)
                        : undefined;
                      return (
                        <FlowCard.Display
                          key={`path-${result.path.id}`}
                          flow={result.path}
                          spots={spots}
                          distance={distance}
                          onPress={() => handlePathPress(result.path!.id)}
                        />
                      );
                    })}
                  </View>
                </View>
              )}

              {/* CANONICAL: Add New Spot - Secondary button after results */}
              <View style={styles.addSpotContainer}>
                <TouchableOpacity
                  style={[styles.addSpotButton, { borderColor: colors.icon + '30' }]}
                  onPress={handleCreateSpotFromSearch}
                  activeOpacity={0.7}>
                  <View style={styles.addSpotButtonContent}>
                    <Icon name="add-location" size={18} color={colors.text} />
                    <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.xs }]}>Add a new spot</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* CANONICAL: No results */}
          {showNoResults && (
            <View style={styles.noResultsContainer}>
              <Icon name="search" size={48} color={colors.icon + '60'} />
              <Text style={[textStyles.heading3, { color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs }]}>
                Nothing found
              </Text>
              <Text style={[textStyles.body, { color: colors.icon, marginBottom: spacing.lg, textAlign: 'center' }]}>
                No places or flows match &quot;{searchQuery}&quot;
              </Text>
              <TouchableOpacity
                style={[styles.addSpotButton, { borderColor: colors.icon + '30', marginTop: spacing.md }]}
                onPress={handleCreateSpotFromSearch}
                activeOpacity={0.7}>
                <View style={styles.addSpotButtonContent}>
                  <Icon name="add-location" size={18} color={colors.text} />
                  <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.xs }]}>Add a new spot</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* CANONICAL: Suggested/Nearby spots when input is empty (same layout as results) */}
          {showSuggested && (
            <View style={styles.section}>
              {shouldShowSkeleton(isLoading, suggestedSpots.length > 0) ? (
                <SkeletonList
                  count={6}
                  layout="grid"
                  variant="card"
                  cardProps={{ size: 'small' }}
                  style={styles.gridContent}
                />
              ) : (
                <FlatList
                  data={suggestedSpotsWithDistance}
                  numColumns={2}
                  keyExtractor={(item) => item.spot.id}
                  columnWrapperStyle={styles.gridRow}
                  contentContainerStyle={styles.gridContent}
                  scrollEnabled={false}
                  windowSize={21}
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  removeClippedSubviews={false}
                  renderItem={({ item: itemWithDistance }) => {
                    return (
                      <View style={styles.gridItem}>
                        <SpotMediaCard
                          spot={itemWithDistance.spot}
                          size="small"
                          distance={itemWithDistance.distance}
                          onPress={() => handleSpotPress(itemWithDistance.spot)}
                        />
                      </View>
                    );
                  }}
                />
              )}
            </View>
          )}

          {/* CANONICAL: Add New Spot - Secondary button after suggested content */}
          {showSuggested && (
            <View style={styles.addSpotContainer}>
              <TouchableOpacity
                style={[styles.addSpotButton, { borderColor: colors.icon + '30' }]}
                onPress={handleCreateSpotFromSearch}
                activeOpacity={0.7}>
                <View style={styles.addSpotButtonContent}>
                  <Icon name="add-location" size={18} color={colors.text} />
                  <Text style={[textStyles.bodyMedium, { color: colors.text, marginLeft: spacing.xs }]}>Add a new spot</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: spacing['2xl'],
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  resultsBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
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
  pathsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  noResultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    minHeight: 300,
  },
  addSpotContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  addSpotButton: {
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  addSpotButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
